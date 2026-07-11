# Spike de Escala — Harness (CÓDIGO DESCARTÁVEL)

> ⚠️ **Isto NÃO é código de produção.** É o ferramental *throwaway* da Fase 03.1
> (ver `../docs/03.1-scale-validation-spike.md`). Seu produto é **evidência e decisão**,
> não código para reaproveitar. Nada aqui entra no acervo do Blog OS (princípio §0 do spike).

## O que faz

Gera um dataset sintético que exercita o **modelo de dados da Fase 01** em escala, com
distribuições realistas e **casos-limite plantados** (03.1 §2.2), e roda validadores que
medem propriedades **reais** do modelo e do grafo — sem precisar de infraestrutura.

```
spike/
├── generate.js      # gera pillars/clusters/authors/content/intents/links em NDJSON
├── validate.js      # roda os validadores locais e emite report.json
├── lib/prng.js      # PRNG determinístico + distribuições (power-law, tamanho de artigo)
└── lib/blocks.js    # corpo em blocos tipados (Fase 01 §4.2), proporção realista
```

## Como rodar

```bash
# dataset pequeno (rápido, prova de funcionamento)
node spike/generate.js --articles 5000 --seed 42 --out spike/out
node spike/validate.js --out spike/out

# alvo do spike (100k) — reserve ~7GB de heap
node --max-old-space-size=7000 spike/generate.js --articles 100000 --seed 42 --out spike/out100k
node --max-old-space-size=7000 spike/validate.js --out spike/out100k

# teste de estresse (curva rumo a 1M)
node --max-old-space-size=7000 spike/generate.js --articles 1000000 --seed 42 --out spike/out1m
```

Flags: `--articles N`, `--seed S`, `--out DIR`, `--links K` (links/artigo, default 15).
Saída em NDJSON (uma entidade por linha) + `summary.json` (geração) e `report.json` (validação).
Datasets gerados são ignorados pelo git (`.gitignore`) — podem ter GBs.

## O que ESTE harness mede localmente (evidência real, sem infra)

| Hipótese (03.1) | Medição |
|---|---|
| **H5 / INV-3** canibalização | auditoria de `primaryKeyword` duplicada; detecta 100% das plantadas |
| **INV-1/2** integridade de intenção | toda intenção aponta para 1 `Content` existente |
| **H6 / LINK-1** órfãos | `Content` sem aresta `pillar_up` |
| **H6 / LINK-4** links quebrados | arestas para itens inexistentes / a aposentar |
| **H6 / LINK-5** profundidade de cliques | ≤3 via taxonomia (home→pilar→cluster→content) |
| **H1 / CACHE-1** fan-out de invalidação | páginas regeneradas por publicação = 3 índices + inlinks (p50/p95/max) |
| **H2** (sinal) latência de lookup | lookup indexado em memória (proxy de consulta) |
| **§3** pior caso de paginação | tamanho do maior cluster (keyset vs offset) |

## O que ESTE harness NÃO mede (exige ambiente provisionado)

Estes só têm número em ambiente próximo de produção — **não os fabrique**:

- **H3** cache hit ratio / propagação global de CDN
- **H4** Core Web Vitals de campo (LCP/INP/CLS) em dispositivo modesto
- **H7** rate limit e custo real de API do CMS
- **H8** workflow/busca do CMS com milhares de autores
- Tempo de **build incremental real** de produção

## Resultados medidos (seed 42) — sweep de escala

Curva observada localmente (o valor está na *inclinação*, não no ponto — 03.1 §11.2):

| Artigos | fan-out p50 | fan-out p95 | fan-out max | lookup p95 (ns) | maior cluster | órfãos | dup-intents |
|---:|---:|---:|---:|---:|---:|:---:|:---:|
| 1.000 | 18 | 25 | 33 | 280 | 35 | ✅ casa | 4=4 |
| 5.000 | 18 | 25 | 34 | 293 | 150 | ✅ casa | 23=23 |
| 25.000 | 18 | 25 | 37 | 423 | 557 | ✅ casa | 101=101 |
| 100.000 | 18 | 25 | 39 | 541 | 2.102 | ✅ casa | 409=409 |

**Leitura dos resultados:**

- ✅ **fan-out de invalidação p50/p95 é PLANO** (18/25) de 1k→100k (100×). Sinal forte de que
  **CACHE-1/RENDER-1 se sustentam no nível do modelo**: publicar 1 artigo regenera um número
  ~constante de páginas, independente do catálogo. *(Confirmação final exige o build real — H1/H3.)*
- ⚠️ **fan-out max cresce devagar** (33→39): páginas "quentes" (power-law) acumulam muitos inlinks.
  Reforça a necessidade da **política de âncora do ADR-0003** (resolver rótulo no build vs. runtime).
- ✅ **detector de canibalização e de órfãos é exato** (planted == detected em toda escala) →
  a auditoria da Fase 01 (INV-3/LINK-1) funciona como gate confiável.
- ⚠️ **maior cluster cresce ~linear com N** (2.102 em 100k): confirma que listagem/sitemap precisam de
  **paginação keyset (cursor), não offset** (03.1 §3.2). Decisão para o plano de implementação.
- ℹ️ **lookup p95** sobe ~2× para 100× de escala (sub-linear; proxy em memória) — a latência real de
  consulta ao CMS/DB é H2 e depende do ambiente.

> **Estes números não aprovam o stack.** Aprovam/reprovam apenas as propriedades do **modelo de dados
> e do grafo**. O veredito de arquitetura (APROVADO/REVISÃO/REPROVADO, 03.1 §9) só fecha com H3/H4/H7/H8
> medidos no ambiente provisionado. Ver `../docs/03.1-scale-validation-spike.md` e os ADRs 0001–0004.

## Próximo passo

- **Enriquecer o laboratório (opcional, sem infra):** as extensões especificadas em
  `../docs/03.2-local-harness-enhancement.md` (cenário de 1M medido, métricas de recurso,
  geração de sitemap, modo `explain` de invalidação, testes de crescimento por variável).
- **Executar o spike provisionado (gate):** seguir `../docs/03.3-spike-execution-runbook.md` —
  provisionar ambiente efêmero (CMS + edge/CDN), rodar o build real com 100k/1M, preencher
  H3/H4/H7/H8 e consolidar o **relatório de decisão** que aceita ou reabre os ADRs.
