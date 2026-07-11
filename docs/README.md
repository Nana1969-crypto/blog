# BLOG OS — Documentação Central

> Índice oficial de toda a documentação do Blog OS. Ponto de partida para qualquer pessoa que entra no projeto.
> Versão 1.0 · Fase atual: **Planejamento (pré-implementação)** · Branch de trabalho: `claude/blog-os-foundation-benchmarking-44tatg`

> **Nota de precisão:** este README reflete o **estado real** do repositório. Documentos existentes estão marcados ✅; documentos ainda **não criados** aparecem como 🔲 *Planejado* — não confunda planejamento com entrega. Nenhuma implementação de código existe ainda: o projeto está integralmente na fase de planejamento estratégico.

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
├── 03.2-spike-execution-runbook.md            ✅ Runbook de execução do spike provisionado
├── 04-editorial-system-eeat.md                ✅ Sistema editorial e E-E-A-T
├── 05-conversion-growth-system.md             ✅ Sistema de conversão e growth
│
├── (planejados — ainda não criados)
├── 06-implementation-plan.md                  🔲 Plano de implementação
├── 07-testing-quality-strategy.md             🔲 Estratégia de testes e qualidade
├── 08-deployment-operations.md                🔲 Deploy e operação
├── 09-analytics-measurement.md                🔲 Analytics e medição de jornada
│
└── adr/                                        ✅ Architecture Decision Records (ver §8)
    ├── README.md                               ✅ Índice e processo de ADRs
    ├── 0000-template.md                        ✅ Template
    ├── 0001-cms-selection.md                   🟡 Proposto (pendente do spike)
    ├── 0002-rendering-strategy.md              🟡 Proposto (pendente do spike)
    ├── 0003-cache-invalidation.md              🟡 Proposto (pendente do spike)
    └── 0004-edge-cdn-security.md               🟡 Proposto (pendente do spike)

spike/                                          ✅ Harness do spike (CÓDIGO DESCARTÁVEL)
├── README.md                                   ✅ Uso, resultados locais e limites
├── generate.js                                 ✅ Gerador de dados sintéticos (Fase 01)
├── validate.js                                 ✅ Validadores locais (H5/H6, sinais H1/H2)
└── lib/                                         ✅ PRNG determinístico + blocos tipados
```

> ⚠️ **`spike/` é código descartável, não produção** — ferramental da Fase 03.1. Já produz evidência local real (fan-out de invalidação plano em 100×, auditorias exatas); H3/H4/H7/H8 seguem pendentes de ambiente provisionado.

### Detalhamento por documento

| Doc | Objetivo | Dependências | Status | Próxima ação |
|---|---|---|---|---|
| **00** `foundation-benchmarking` | Posicionamento, benchmarking de 11 referências, 50 princípios, modelo ideal, perguntas críticas | — (raiz) | ✅ Concluído | Manter como fonte de princípios |
| **01** `information-architecture-data-model` | Intenção canônica, taxonomia, blocos tipados, grafo de interlinking, URLs, gate | 00 | ✅ Concluído | Congelar contrato após spike (03.1) |
| **02** `design-system-reading-experience` | Tokens, tipografia de leitura, cor/tema, grid, contrato dos blocos, A11y | 00, 01 | ✅ Concluído | Resolver decisões em aberto (fonte, acento) na Fase 04 |
| **03** `technical-architecture-performance` | Render híbrido, borda/cache, perf gate, segurança, clean architecture | 00, 01, 02 | ✅ Concluído (condicional ao spike) | Executar 03.1 antes de fechar stack |
| **03.1** `scale-validation-spike` | Plano de validação de escala (100k/1M) — hipóteses, cenário, métricas, critérios + evidência local do harness | 01, 03 | ✅ Concluído · evidência local coletada | Executar eixos que exigem infra (via 03.2) |
| **03.2** `spike-execution-runbook` | Runbook para executar H3/H4/H7/H8 + build real no ambiente provisionado; template de relatório de decisão | 03, 03.1, harness | ✅ Pronto para execução | **Provisionar ambiente e executar** (próximo marco) |
| **04** `editorial-system-eeat` | Workflow editorial, gate de qualidade, E-E-A-T, ciclo de atualização | 00, 01, 02, 03 | ✅ Concluído | Operacionalizar após aprovação da arquitetura |
| **05** `conversion-growth-system` | Funil, captura, relacionamento, medição, monetização | 00–04 | ✅ Concluído | Definir modelo de receita com dados |
| **06** `implementation-plan` | Sequência de construção, marcos, equipe, estimativas | 03.1 **APROVADO** | 🔲 Planejado | Criar após veredito do spike |
| **07** `testing-quality-strategy` | Testes (unit/e2e/perf/a11y/SEO), CI, gates automáticos | 06 | 🔲 Planejado | Criar junto ao plano de implementação |
| **08** `deployment-operations` | Ambientes, pipeline, rollback, observabilidade em produção | 03, 06 | 🔲 Planejado | Criar antes do primeiro deploy |
| **09** `analytics-measurement` | Instrumentação de jornada, RUM, privacidade por design | 05 | 🔲 Planejado | Criar antes de captação de leads |
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
| **FASE 03.2** | Execução do Spike (runbook provisionado) | `03.2-spike-execution-runbook.md` | ✅ Runbook pronto · ⏳ **Execução pendente** |
| **FASE 04** | Editorial (Sistema & E-E-A-T) | `04-editorial-system-eeat.md` | ✅ Concluída |
| **FASE 05** | SEO/CRO (Conversão & Growth) | `05-conversion-growth-system.md` | ✅ Concluída |
| **FASE 06** | Implementação | `06-implementation-plan.md` | 🔲 Bloqueada pela execução do spike (03.2) |
| **FASE 07** | Qualidade | `07-testing-quality-strategy.md` | 🔲 Não iniciada |
| **FASE 08** | Escala (Deploy & Operação) | `08-deployment-operations.md`, `09-analytics-measurement.md` | 🔲 Não iniciada |

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
        │                     03.2 Execução provisionada  ◄── GATE CRÍTICO
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
- **A execução do spike é o gate crítico:** o plano (03.1) e a evidência local já existem; a Fase 06 (Implementação) **não começa** sem o veredito **APROVADO** dos eixos de infra (03.2) — ou REVISÃO resolvida e re-testada.
- **01 congela após o spike:** o modelo de dados só é considerado final quando validado sob escala real (parte local já validada; build/CMS reais pendentes).

---

## 6. Status Atual

**📅 Data de referência:** planejamento pré-implementação · **Branch:** `claude/blog-os-foundation-benchmarking-44tatg`

**✅ Documentos concluídos (7)**
- `00-foundation-benchmarking.md`
- `01-information-architecture-data-model.md`
- `02-design-system-reading-experience.md`
- `03-technical-architecture-performance.md` *(aprovação condicional ao spike)*
- `03.1-scale-validation-spike.md` *(plano; execução pendente)*
- `04-editorial-system-eeat.md`
- `05-conversion-growth-system.md`

**🔍 Documentos em revisão / decisões em aberto**
- **02** — família de fonte do corpo, acento de marca, estilo de figuras (decidir na Fase 04 com dados).
- **03** — fornecedor de CMS e de edge, busca interna (decidir **no spike**).
- **05** — modelo de receita primário, ferramenta de email/CRM (decidir com dados de audiência).

**🔲 Próximos documentos**
- `06-implementation-plan.md` (após spike aprovado)
- `07-testing-quality-strategy.md`, `08-deployment-operations.md`, `09-analytics-measurement.md`

**🟡 ADRs criados em status Proposto** (análise pronta, decisão congelada até o spike)
- `adr/0001-cms-selection.md`, `adr/0002-rendering-strategy.md`, `adr/0003-cache-invalidation.md`, `adr/0004-edge-cdn-security.md`

**🚧 Bloqueios existentes**
- **BLOQUEIO PRINCIPAL:** a **execução completa** do Spike de Escala (03.1) trava toda a Fase 06 (Implementação). Nenhum código de produção deve começar antes do veredito. O harness local (`spike/`) já cobriu a parte que **não** exige infra (H5/H6, sinais H1/H2 — evidência positiva); resta o eixo que **exige ambiente provisionado**: H3 (cache/CDN), H4 (CWV de campo), H7 (API), H8 (CMS) e o build incremental real.
- **Dependências de decisão:** escolha de CMS/edge não pode ser fechada no papel — depende dos números que só o ambiente provisionado produz (ADRs 0001–0004 seguem `Proposto`).

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

> A análise (contexto, alternativas, critérios objetivos de aceitação) já está escrita em cada ADR. Cada um vira `Aceito` **apenas** quando a execução do spike (03.1 local + 03.2 provisionado) produzir os números que satisfaçam suas condições. Isso adianta o raciocínio sem violar o gate.

---

## 9. Próximos Passos

**Já feito:** harness local do spike executado — evidência real e positiva para H5, H6 e sinais de H1/H2 (fan-out de invalidação plano em 100×, auditorias exatas). Ver `spike/README.md` e `03.1` §9.1.

**Marco lógico imediato:** **executar os eixos do spike que exigem infraestrutura** (H3 cache/CDN, H4 CWV de campo, H7 API, H8 CMS + build real), seguindo o runbook `03.2-spike-execution-runbook.md`.

Sequência:
1. **Provisionar** o ambiente efêmero (CMS candidato + edge/CDN) conforme `03.2` §2.
2. **Gerar e importar** os dados do harness (100k/1M) e rodar o build real (`03.2` §3–§4).
3. **Medir** H3/H4/H7/H8 + build incremental contra as metas p95/p75, cruzando com o fan-out já medido localmente.
4. **Preencher o relatório de decisão** (`03.2` §5) com veredito por eixo (APROVADO / REVISÃO / REPROVADO).
5. **Atualizar os ADRs 0001–0004** (`Proposto` → `Aceito` ou reabrir).
6. Só então **criar `06-implementation-plan.md`** e iniciar a construção pelas fundações validadas.

> ⚠️ **Lembrete de disciplina:** o spike (local e provisionado) envolve código *descartável*, não produção. Nenhuma linha de código de produção antes do veredito APROVADO. Os documentos de planejamento, o harness e o futuro relatório de decisão são o alicerce — a implementação vem depois, sobre terreno validado. **Não fabricar métricas:** célula sem medição real fica `PENDENTE`.

---

*Documentação central do Blog OS. Mantida atualizada a cada novo documento ou mudança de status.*
