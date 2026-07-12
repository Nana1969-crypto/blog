# BLOG OS — Documentação Central

> Índice oficial de toda a documentação do Blog OS. Ponto de partida para qualquer pessoa que entra no projeto.
> Versão 2.0 · Fase atual: **v1 implementada e verificada localmente — pendente apenas o deploy real** · Branch: `claude/blog-os-foundation-benchmarking-44tatg`

> **Nota de precisão:** este README reflete o **estado real** do repositório. A plataforma v1 está implementada em `platform/` (build estático zero-dependências + 6 artigos reais) e **verificada localmente** (gate, links, contraste AA computado, navegador real). O que depende de rede/CDN real — CWV de campo, cache hit ratio, TTFB global — permanece **pendência explícita do deploy** (docs 08 e 03.3): medições nunca foram estimadas nem simuladas.

---

## 1. Visão Geral do Projeto

**O que é o Blog OS**
O Blog OS não é um blog — é um **sistema operacional de conteúdo**: uma plataforma projetada para transformar intenção de busca em autoridade, autoridade em tráfego, tráfego em relacionamento e relacionamento em receita, em escala de milhões de páginas, sem degradar performance, confiança ou experiência de leitura.

**Qual problema resolve**
Blogs tradicionais falham por três razões estruturais, não cosméticas:
1. **SEO é tratado como camada** (plugins, meta tags) em vez de **arquitetura** (modelo de dados, grafo de links, taxonomia).
2. **Conteúdo é tratado como volume** em vez de **cobertura de intenção** e profundidade.
3. **Conversão é tratada como interrupção** (popups, anúncios) em vez de **continuação natural da jornada**.

O Blog OS corrige as três na fundação — nasce otimizado, não "otimiza depois".

**Objetivo estratégico**
Ser uma plataforma de conteúdo de referência mundial, capaz de competir em qualidade estratégica, experiência, SEO, performance e conversão com os melhores players do mercado — com identidade própria, sem copiar ninguém.

**Nível de qualidade esperado**
Padrão de produto premium (referências: Stripe, Linear, Apple em craft; Ahrefs, HubSpot, Backlinko em conteúdo/SEO; Vercel, Cloudflare em performance/escala). A régua é: **cada página satisfaz a intenção melhor que qualquer concorrente, carrega mais rápido, lê melhor e converte sem trair a confiança.**

---

## 2. Filosofia do Projeto

Síntese dos 50 princípios da Fase 00 (ver `00-foundation-benchmarking.md`).

**Princípios de Produto**
- Cada página tem **um único objetivo** mensurável.
- **Menos, porém melhor** — foco radical, nada compete pela atenção (lição Apple).
- Posicionamento claro e diferenciais defensáveis antes de qualquer feature.

**Princípios Técnicos**
- **SEO First** — nasce no modelo de dados, não em plugin.
- **Performance First** — Core Web Vitals são requisito e gate de release, não meta.
- **Static-by-default / Edge-delivered** — custo de render O(mudanças), não O(tráfego/catálogo).
- **Clean Architecture** — domínio independente de framework/CMS/CDN.
- **Segurança como infraestrutura** e **escala como premissa** desde o dia 1.

**Princípios de SEO**
- **Uma intenção, uma URL canônica** — canibalização impossível por construção.
- **Pillar + cluster** com interlinking denso é a unidade de crescimento.
- **Autoridade temática** por cobertura completa de intenção; schema estruturado; frescor honesto.

**Princípios de UX**
- **Design existe para facilitar a leitura** — tipografia é o produto.
- **Mobile é o caso base**; **acessibilidade (WCAG 2.2 AA) é requisito**.
- **Velocidade é parte da experiência** — o produto deve *sentir-se* rápido.

**Princípios de Conversão**
- **Conversão é continuação da jornada, nunca interrupção.**
- **Newsletter-first**; lead magnets contextuais; **zero dark patterns**.
- **Confiança precede o pedido** — E-E-A-T e craft antes de qualquer captura.

---

## 3. Mapa de Documentação

> Estrutura **real** do diretório `docs/`. Nomes de arquivo são os efetivamente existentes. Documentos planejados ainda não têm arquivo.

```
docs/
├── README.md                                  ← este índice
│
├── 00-foundation-benchmarking.md              ✅ Fundação e benchmarking
├── 01-information-architecture-data-model.md  ✅ Arquitetura de informação e modelo de dados
├── 02-design-system-reading-experience.md     ✅ Design system e sistema de leitura
├── 03-technical-architecture-performance.md   ✅ Arquitetura técnica e performance
├── 03.1-scale-validation-spike.md             ✅ Spike de validação de escala (plano + evidência local)
├── 03.2-local-harness-enhancement.md          ✅ Enriquecimento do harness local (laboratório)
├── 03.3-spike-execution-runbook.md            ✅ Runbook de execução do spike provisionado
├── 04-editorial-system-eeat.md                ✅ Sistema editorial e E-E-A-T
├── 05-conversion-growth-system.md             ✅ Sistema de conversão e growth
│
├── 06-implementation-plan.md                  ✅ Plano de implementação + resultados medidos
├── 07-testing-quality-strategy.md             ✅ Testes e qualidade (gate executável)
├── 08-deployment-operations.md                ✅ Deploy e operação (dist CDN-ready)
├── 09-analytics-measurement.md                ✅ Analytics privacy-first (ativa no deploy)
│
└── adr/                                        ✅ Architecture Decision Records (ver §8)
    ├── README.md                               ✅ Índice e processo de ADRs
    ├── 0000-template.md                        ✅ Template
    ├── 0001-cms-selection.md                   ✅ Aceito (v1: file-based; gatilho de revisão documentado)
    ├── 0002-rendering-strategy.md              ✅ Aceito (v1: estático+incremental+ilhas, medido)
    ├── 0003-cache-invalidation.md              ✅ Aceito (âncora BUILD, decidida com dados)
    └── 0004-edge-cdn-security.md               🟡 Proposto (só o deploy real fecha)

platform/                                       ✅ PLATAFORMA v1 (código de produção)
├── content/                                    ✅ blocos tipados: 2 pilares, 6 artigos, autoria, taxonomia
├── src/                                        ✅ tokens, blocks, templates, build (gate+incremental+explain), check, serve
└── dist/                                       (gerado; gitignored — saída estática CDN-ready)

spike/                                          ✅ Harness do spike (CÓDIGO DESCARTÁVEL)
├── README.md                                   ✅ Uso, resultados 1k→1M e limites
├── generate.js / validate.js / explain.js      ✅ Gerador, validadores e explain de invalidação
└── run-series.sh / lib/                        ✅ Série reproduzível + PRNG determinístico
```

> ⚠️ **`spike/` é descartável; `platform/` é produção.** O harness mediu a série 1k→1M (fan-out de invalidação plano; auditorias exatas). Dos eixos que exigiam infra: H7/H8 colapsaram por construção com o ADR-0001 (armazenamento file-based não tem API remota); H3 (CDN) e H4 (CWV de campo) permanecem pendentes do deploy — ver docs 08 e 03.3.

### Detalhamento por documento

| Doc | Objetivo | Dependências | Status | Próxima ação |
|---|---|---|---|---|
| **00** `foundation-benchmarking` | Posicionamento, benchmarking de 11 referências, 50 princípios, modelo ideal, perguntas críticas | — (raiz) | ✅ Concluído | Manter como fonte de princípios |
| **01** `information-architecture-data-model` | Intenção canônica, taxonomia, blocos tipados, grafo de interlinking, URLs, gate | 00 | ✅ Concluído | Contrato implementado em `platform/`; congelado |
| **02** `design-system-reading-experience` | Tokens, tipografia de leitura, cor/tema, grid, contrato dos blocos, A11y | 00, 01 | ✅ Concluído | Resolver decisões em aberto (fonte, acento) na Fase 04 |
| **03** `technical-architecture-performance` | Render híbrido, borda/cache, perf gate, segurança, clean architecture | 00, 01, 02 | ✅ Concluído | Stack v1 decidido (ADRs 0001–0003); 0004 no deploy |
| **03.1** `scale-validation-spike` | Plano de validação de escala (100k/1M) — hipóteses, cenário, métricas, critérios + evidência local do harness | 01, 03 | ✅ Concluído · evidência local coletada | Enriquecer o harness (03.2) e executar infra (03.3) |
| **03.2** `local-harness-enhancement` | Expansão do laboratório local: cenários 1k–1M, métricas, testes de crescimento, limitações e critérios para avançar à infra | 03.1, harness | ✅ Executado (extensões implementadas; série 1k→1M medida) | — |
| **03.3** `spike-execution-runbook` | Runbook para executar H3/H4/H7/H8 + build real no ambiente provisionado; template de relatório de decisão | 03, 03.1, 03.2, harness | ✅ Pronto | Executar no deploy — escopo reduzido a H3/H4 (H7/H8 colapsados pelo ADR-0001) |
| **04** `editorial-system-eeat` | Workflow editorial, gate de qualidade, E-E-A-T, ciclo de atualização | 00, 01, 02, 03 | ✅ Concluído | Operacionalizar após aprovação da arquitetura |
| **05** `conversion-growth-system` | Funil, captura, relacionamento, medição, monetização | 00–04 | ✅ Concluído | Definir modelo de receita com dados |
| **06** `implementation-plan` | Escopo v1, arquitetura da implementação e **resultados medidos** (gate, incremental, navegador real) | ADR-0001, 03.2 | ✅ Executado | Deploy real (08 + 03.3) |
| **07** `testing-quality-strategy` | Camadas de verificação executáveis (gate, contrato, pós-build, navegador) | 06 | ✅ Ativo | Adicionar Lighthouse CI + RUM no deploy |
| **08** `deployment-operations` | Deploy atômico de estático, cache/purga por rota, segurança e runbook | 03, 06 | ✅ Especificado | Executar no dia do deploy (fecha ADR-0004) |
| **09** `analytics-measurement` | Medição de jornada privacy-first em 4 camadas | 05, 08 | ✅ Especificado | Ativar camadas 1–3 no deploy |
| **adr/** | Registro de decisões arquiteturais (ver §8) | — | ✅ Estrutura criada · 🟡 0001–0004 Proposto | Aceitar ADRs após veredito do spike |

> **Sobre a numeração:** o projeto usa numeração **por documento**, não idêntica à numeração de **fases** do roadmap (§4). O mapeamento entre ambos está na tabela do §4 para evitar confusão.

---

## 4. Roadmap de Fases

| Fase | Nome | Documento(s) | Status |
|---|---|---|---|
| **FASE 00** | Fundação | `00-foundation-benchmarking.md` | ✅ Concluída |
| **FASE 01** | Estratégia (IA & Modelo de Dados) | `01-information-architecture-data-model.md` | ✅ Concluída |
| **FASE 02** | Produto (Design System & Leitura) | `02-design-system-reading-experience.md` | ✅ Concluída |
| **FASE 03** | Arquitetura (Técnica & Performance) | `03-technical-architecture-performance.md` | ✅ Concluída (condicional) |
| **FASE 03.1** | Validação de Escala (Spike — plano + evidência local) | `03.1-scale-validation-spike.md` | ✅ Plano + evidência local · ⏳ eixos de infra pendentes |
| **FASE 03.2** | Enriquecimento do Harness Local (laboratório) | `03.2-local-harness-enhancement.md` | ✅ Especificado · ⏳ extensões a implementar |
| **FASE 03.3** | Execução do Spike (runbook provisionado) | `03.3-spike-execution-runbook.md` | ✅ Runbook pronto · ⏳ **Execução pendente** |
| **FASE 04** | Editorial (Sistema & E-E-A-T) | `04-editorial-system-eeat.md` | ✅ Concluída |
| **FASE 05** | SEO/CRO (Conversão & Growth) | `05-conversion-growth-system.md` | ✅ Concluída |
| **FASE 06** | Implementação | `06-implementation-plan.md` + `platform/` | ✅ **v1 implementada e verificada** (local) |
| **FASE 07** | Qualidade | `07-testing-quality-strategy.md` | ✅ Ativa (gate executável + navegador real) |
| **FASE 08** | Escala (Deploy & Operação) | `08-deployment-operations.md`, `09-analytics-measurement.md` | ✅ Especificada · ⏳ execução no deploy real |

> **Observação de honestidade:** o roadmap genérico proposto (Fundação → Estratégia → Produto → Arquitetura → Design → SEO/CRO → Implementação → Qualidade → Escala) foi **mapeado** para os documentos reais acima. Duas remapeações importantes: (1) **Design** não é uma fase tardia — o design system foi front-carregado no doc **02** (FASE 02); por isso a "FASE 04" do roadmap genérico corresponde ao nosso doc de **Editorial**. (2) **SEO e CRO não são um documento único:** SEO nasce no doc **01** (arquitetura da informação) e a conversão/CRO está no doc **05**.

---

## 5. Dependências Entre Documentos

Um documento só deve ser considerado **estável** depois que seus predecessores estão aprovados. Alterar um documento a montante obriga a revisar os a jusante.

```
00 Fundação (princípios — raiz de tudo)
        │
        ▼
01 IA & Modelo de Dados ──────────────┐
        │                             │
        ▼                             ▼
02 Design System              03 Arquitetura Técnica
        │                             │
        │                             ▼
        │                     03.1 Spike (plano + evidência local)
        │                             │
        │                             ▼
        │                     03.2 Harness local enriquecido (laboratório)
        │                             │
        │                             ▼
        │                     03.3 Execução provisionada  ◄── GATE CRÍTICO
        │                             │
        └──────────────┬──────────────┘
                       ▼
              04 Sistema Editorial
                       │
                       ▼
              05 Conversão & Growth
                       │
                       ▼
        ┌──────────────┴───────────────┐
        ▼                              ▼
06 Implementação  (só após veredito APROVADO do spike)
        │
        ▼
07 Qualidade ──► 08 Deploy/Operação ──► 09 Analytics
```

**Regras de dependência:**
- **00 é raiz** — nenhum documento contradiz seus princípios sem justificativa registrada (ADR).
- **A execução provisionada do spike é o gate crítico:** o plano (03.1), a evidência local e o laboratório enriquecido (03.2) já existem; a Fase 06 (Implementação) **não começa** sem o veredito **APROVADO** dos eixos de infra (03.3) — ou REVISÃO resolvida e re-testada.
- **01 congela após o spike:** o modelo de dados só é considerado final quando validado sob escala real (parte local já validada; build/CMS reais pendentes).

---

## 6. Status Atual

**📅 Data de referência:** v1 implementada e verificada localmente · **Branch:** `claude/blog-os-foundation-benchmarking-44tatg`

**✅ Concluído**
- **Documentação 00–09 completa** (fundação → analytics), coerente e com referências cruzadas verificadas.
- **Laboratório de escala executado:** série 1k→1M medida; fan-out de invalidação **plano (p50/p95 = 18/25) em 1000×**; auditorias de canibalização/órfãos exatas; política de âncora decidida com dados (`spike/README.md`).
- **Plataforma v1 (`platform/`):** build estático zero-dependências com gate bloqueante, build incremental com `--explain`, design system em tokens (claro/escuro, contraste AA computado), 6 artigos reais em blocos tipados, sitemap/RSS/robots/JSON-LD/CSP.
- **Verificação real:** 3 violações plantadas → 3 builds bloqueados; 12 páginas sem link quebrado; navegador Chromium (desktop/mobile/dark): 0 erros de console, artigo com ~20KB/1 request/≤499B de JS, legível sem JS; defeito de grid mobile encontrado e corrigido na verificação (doc 06 §4.3).
- **ADRs 0001–0003 aceitos com evidência**; 0004 proposto (só o deploy fecha).

**🔍 Decisões em aberto (não bloqueiam a v1)**
- **02** — família de fonte definitiva e acento de marca (v1 usa system stack por performance; trocável por tokens).
- **05** — modelo de receita primário e ferramenta de email/CRM (decidir com dados de audiência).

**⏳ Pendências explícitas (exigem deploy real — docs 08 e 03.3)**
- CWV de campo p75 (H4), cache hit ratio/TTFB global (H3), aceitação do ADR-0004.
- Autores reais com credenciais antes de launch público (E-E-A-T pleno — o conteúdo demo é assinado institucionalmente e declara isso).
- Ativação do sistema de captura/newsletter (Fase 05) e das camadas de analytics (doc 09).

**🚧 Bloqueios**
- Nenhum bloqueio interno. O único gate restante é externo: **deploy em CDN real** para medir o que só produção mede.

---

## 7. Regras do Projeto

Regras inegociáveis que governam como o Blog OS é construído:

1. **Nenhuma implementação sem documentação aprovada.** Código só começa após o documento correspondente estar aprovado e, no caso da arquitetura, após o spike (03.1) dar APROVADO.
2. **Nenhuma decisão arquitetural sem justificativa.** Toda escolha estrutural é fundamentada e, se relevante, registrada como ADR (§8).
3. **Todos os documentos são versionados.** Tudo vive em `docs/` sob controle de versão (git); mudanças relevantes são commits descritivos.
4. **Decisões importantes geram registros.** Escolhas com impacto estrutural ou de longo prazo viram ADR — a rastreabilidade é parte do produto.
5. **Princípios da Fase 00 são a régua.** Qualquer proposta que contrarie os 50 princípios exige justificativa explícita e registro.
6. **O planejamento não vira código por inércia.** Protótipos de spike são descartáveis; o produto do spike é o **relatório de decisão**, não o código.
7. **Escala e performance são premissas, não ajustes finais.** Nenhuma decisão que degrade linearmente com catálogo ou tráfego é aceita (invariantes RENDER-1/CACHE-1/PERF-1).

---

## 8. Registro de Decisões Arquiteturais (ADRs)

Decisões importantes deverão gerar **ADRs — Architecture Decision Records**: documentos curtos e imutáveis que registram *o que* foi decidido, *por quê*, e *quais alternativas* foram descartadas. ADRs dão rastreabilidade e evitam re-litigar decisões já tomadas.

**Quando criar um ADR**
- Escolha de stack (CMS, framework de render, edge/CDN).
- Estratégia de renderização, cache/invalidação, modelo de dados.
- Decisões de segurança, i18n, modelo de receita.
- Qualquer escolha estrutural difícil de reverter.

**Onde vivem:** `docs/adr/`, numerados sequencialmente e **imutáveis** (uma decisão revertida gera um **novo** ADR que supersede o anterior — não se edita o antigo).

**Formato (template `docs/adr/0000-template.md`):**

```markdown
# ADR-XXXX: <Título da decisão>

- **Status:** Proposto | Aceito | Substituído por ADR-YYYY | Descartado
- **Data:** AAAA-MM-DD
- **Decisores:** <papéis>
- **Documentos relacionados:** <ex.: 03, 03.1>

## Contexto
Qual problema/força motivou a decisão. Restrições e invariantes em jogo.

## Decisão
O que foi decidido, de forma clara e afirmativa.

## Alternativas consideradas
- Alternativa A — por que foi descartada
- Alternativa B — por que foi descartada

## Consequências
Positivas, negativas e riscos aceitos. O que esta decisão obriga ou impede no futuro.
```

**Primeiros ADRs (criados em status `Proposto` — decisão congelada até o spike):**
- [`ADR-0001`](adr/0001-cms-selection.md) — Escolha do CMS headless.
- [`ADR-0002`](adr/0002-rendering-strategy.md) — Estratégia de renderização (SSG+ISR + islands).
- [`ADR-0003`](adr/0003-cache-invalidation.md) — Modelo de invalidação de cache por `Content`.
- [`ADR-0004`](adr/0004-edge-cdn-security.md) — Fornecedor de edge/CDN e camada de segurança.

> A análise (contexto, alternativas, critérios objetivos de aceitação) já está escrita em cada ADR. Cada um vira `Aceito` **apenas** quando a execução do spike (03.1 local + 03.3 provisionado) produzir os números que satisfaçam suas condições. Isso adianta o raciocínio sem violar o gate.

---

## 9. Próximos Passos

**Estado:** documentação 00–09 completa · laboratório 1k→1M executado · **plataforma v1 implementada e verificada localmente** · ADRs 0001–0003 aceitos com evidência.

**O que já foi feito nesta fase** (detalhes e números no doc 06 §4 e em `spike/README.md`):
- Extensões do 03.2 implementadas e série completa medida (fan-out plano até 1M; política de âncora BUILD decidida com `explain`).
- ADR-0001 aceito (armazenamento file-based v1) — colapsou H7/H8 por construção e destravou a implementação sem infra.
- `platform/` construída e verificada: gate testado com violações plantadas, incremental medido, navegador real (desktop/mobile/dark) sem erros.

**Marco restante — deploy real** (fecha o projeto ponta a ponta):
1. Escolher CDN/edge pelos critérios do ADR-0004 e publicar o `dist/` (deploy atômico — doc 08).
2. Medir H3 (hit ratio > 95%, TTFB p75 < 200ms multi-região) e H4 (CWV de campo p75) — runbook `03.3`, escopo reduzido a esses dois eixos.
3. Aceitar o ADR-0004 com os números; ativar analytics camadas 1–3 (doc 09).
4. Antes de launch público: autoria individual com credenciais nos artigos (E-E-A-T pleno) e ativação da captura/newsletter (Fase 05).

> ⚠️ **Disciplina mantida:** nenhuma métrica de rede/CDN/campo foi estimada ou simulada — tudo que está registrado foi medido de verdade neste ambiente, e o que não pôde ser medido está marcado como pendência. Essa fronteira é o que torna a documentação confiável.

---

*Documentação central do Blog OS. Mantida atualizada a cada novo documento ou mudança de status.*
