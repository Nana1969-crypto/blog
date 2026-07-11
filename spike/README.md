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

## Resultados medidos (seed 42) — série de escala 1k → 1M

Série completa via `bash spike/run-series.sh --with-1m` (03.2 §1). Corpos em blocos incluídos
até 100k (`full`); 1M em `--light` (corpo omitido — métricas de grafo/invalidação inalteradas):

| Artigos | modo | ger. (s) | ger. RSS | val. (s) | fan-out p50 | p95 | max | lookup p95 (ns) | maior cluster | URLs | sitemaps | órfãos | dup |
|---:|:--|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|:--:|:--:|
| 1.000 | full | 0,2 | 59MB | 0,1 | 18 | 25 | 37 | 246 | 28 | 1.555 | 1 | ✅ | ✅ |
| 10.000 | full | 1,4 | 75MB | 0,8 | 18 | 25 | 35 | 360 | 323 | 10.825 | 1 | ✅ | ✅ |
| 50.000 | full | 6,6 | 91MB | 3,9 | 18 | 25 | 37 | 572 | 1.116 | 52.521 | 2 | ✅ | ✅ |
| 100.000 | full | 13,1 | 114MB | 8,5 | 18 | 25 | 38 | 812 | 2.147 | 104.641 | 3 | ✅ | ✅ |
| **1.000.000** | light | 30,7 | 160MB | 47,9 | **18** | **25** | 45 | 1.960 | 20.192 | 1.042.801 | 21 | ✅ | ✅ |

**Modo `explain` de invalidação (ADR-0003), catálogo de 100k:**

| Página | Política | Inlinks | Rotas a regenerar |
|---|---|--:|--:|
| normal (`content_777`) | build | 18 | 23 |
| **mais quente do catálogo** (`content_3`) | build | 35 | **40** |
| mais quente | runtime | 0 | 5 |

**Leitura dos resultados:**

- ✅ **fan-out de invalidação p50/p95 é PLANO (18/25) de 1k → 1M — 1000×.** CACHE-1/RENDER-1
  sustentam-se no nível do modelo: publicar 1 artigo regenera nº ~constante de páginas,
  independente do catálogo. Max cresce devagar (37→45, power-law).
- ✅ **Política de âncora decidida com dado (ADR-0003): BUILD.** Mesmo a página mais quente
  custa 40 rotas — barato, e as páginas ficam 100% estáticas (sem custo de resolução no serve).
- ✅ **Geração/validação escalam sub-linear** com backpressure: 1M gerado em 31s/160MB,
  validado em 48s/414MB. O laboratório em si escala.
- ✅ **Detectores exatos em toda a série** (canibalização, órfãos) — gate confiável até 1M.
- ⚠️ **Maior cluster ~linear** (20.192 em 1M): paginação **keyset obrigatória**; e
  **sitemap segmentado com índice** a partir de ~50k URLs (21 arquivos em 1M).
- ℹ️ **lookup p95** sobe ~8× para 1000× de escala (sub-linear; proxy em memória).

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
