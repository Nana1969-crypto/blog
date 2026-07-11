# BLOG OS — Fase 02

## Design System & Sistema de Leitura

> Traduz os princípios de UX/Design (Fase 00) e os blocos tipados (Fase 01) em um sistema visual coerente: tokens, escala tipográfica de leitura longa, grid, cor, tema claro/escuro, e o contrato visual de cada componente.
> Status: **Proposta para aprovação** · Versão 1.0 · Depende de: `00-foundation-benchmarking.md`, `01-information-architecture-data-model.md`
> Escopo: **especificação de design**. Valores de tokens são contratos; nenhuma implementação de código, CSS de produção ou componente construído nesta fase.

---

## 1. Resumo Executivo

A Fase 00 estabeleceu que **design existe para facilitar a leitura** (Princípio 23) e que a percepção de qualidade vem de **tipografia, espaçamento e velocidade** (lições Stripe/Linear/Apple), não de decoração. A Fase 01 tornou o conteúdo **dado estruturado em blocos**. Esta fase define **como cada bloco se torna experiência de leitura de primeira classe**.

Definimos:

1. **Design tokens** — a fonte única de verdade para cor, tipografia, espaçamento, raio, sombra, movimento. Nada é "chumbado" em componente.
2. **Sistema tipográfico de leitura longa** — escala modular, medida de linha controlada (~66 caracteres), ritmo vertical baseado em grid.
3. **Sistema de cor com tema claro/escuro** de primeira classe, com contraste AA garantido por construção.
4. **Grid e espaçamento** — ritmo vertical consistente, respiração (whitespace) como ferramenta de foco.
5. **Contrato visual dos 14 blocos** da Fase 01 → componentes de leitura.
6. **Movimento e microinterações** com propósito, e **orçamento de acessibilidade** embutido.

**Princípio-guia da fase:** *cada decisão visual serve à velocidade de leitura, ao foco e à confiança — nunca à ornamentação. Menos, porém melhor (Apple).*

---

## 2. Fundamentos de Tokens

Tokens são organizados em **3 camadas** (padrão de design systems maduros — Stripe/Linear):

```
Primitivos      →  Semânticos          →  De componente
(valores brutos)   (papel/intenção)       (uso específico)
gray-900           color.text.primary     button.bg.default
size-4             space.md               article.maxWidth
```

- **Primitivos:** paleta e escalas cruas, sem significado (ex.: `gray-100…900`, `space-1…12`).
- **Semânticos:** mapeiam primitivos a *intenção* (ex.: `color.text.primary`, `color.surface.raised`). É a camada que **troca no dark mode**.
- **De componente:** referenciam semânticos; garantem consistência (Princípio 28).

> **Por quê 3 camadas:** permite trocar tema (claro/escuro) e rebrand alterando apenas o mapeamento semântico, sem tocar componentes — essencial para evoluir a 100k páginas sem reescrever nada (Fase 01, CNT-4).

---

## 3. Sistema Tipográfico (o coração da leitura)

Tipografia é o produto (Princípio 23). O padrão-ouro de legibilidade da Fase 00 (Backlinko/Stripe) vira regra.

### 3.1 Famílias

| Papel | Escolha (contrato) | Racional |
|---|---|---|
| **Leitura (corpo)** | Serifada ou humanista de alta legibilidade, com boa altura-x | Conforto em leitura longa; melhor rastreamento de linha |
| **Interface / títulos** | Sans-serif geométrica-humanista neutra | Clareza, ar "premium" sóbrio (Linear/Stripe) |
| **Mono** | Mono legível | Blocos `code` |

- **Fontes auto-hospedadas e subsetadas** (Princípio 39/40): evita FOUT/CLS e dependência externa (segurança/performance, lições Cloudflare/Vercel). `font-display: swap` com fallback métrico casado para não deslocar layout.
- **Máximo de 2 famílias** em uso simultâneo — disciplina de craft.

### 3.2 Escala modular

Escala tipográfica com razão **1.25 (major third)**, base **18px** (leitura confortável em desktop; nunca abaixo de 16px no corpo — Princípio 26).

| Token | Tamanho (desktop) | Uso |
|---|---|---|
| `text.xs` | 14px | Legendas, metadados |
| `text.sm` | 16px | Texto secundário |
| `text.base` | 18px | **Corpo do artigo** |
| `text.lg` | 20px | Lead / `dek` |
| `text.xl` | 25px | H4 |
| `text.2xl` | 31px | H3 |
| `text.3xl` | 39px | H2 |
| `text.4xl` | 49px | H1 / título de artigo |
| `text.5xl` | 61px | Hero (home/pillar) |

- **Fluid type:** interpolação suave entre mobile e desktop via `clamp()` (contrato: mínimo mobile, máximo desktop) — sem breakpoints bruscos.

### 3.3 Métricas de leitura (invariantes)

- **MEDIDA (line length):** corpo limitado a **~66 caracteres** (`article.maxWidth ≈ 42rem`). Máximo de conforto/velocidade (Princípio 25).
- **ALTURA DE LINHA:** corpo `1.6`; títulos `1.15`. Ritmo vertical confortável.
- **ESPAÇAMENTO ENTRE PARÁGRAFOS:** ~`1em`, parágrafos curtos (1–4 linhas — padrão Backlinko).
- **PESO:** corpo `400`; ênfase `600`; títulos `600–700`. Contraste de peso cria hierarquia sem cor.
- **TRACKING:** levemente negativo em títulos grandes; neutro no corpo.

> **Invariante TYPO-1:** nenhuma superfície de leitura longa excede `article.maxWidth`. Largura de linha é acessibilidade e retenção, não estética.

---

## 4. Sistema de Cor

Cor serve à hierarquia e ao foco (Apple), não à decoração. Paleta **sóbria e neutra** com **um** acento de marca.

### 4.1 Estrutura semântica

| Token semântico | Papel | Exemplo de uso |
|---|---|---|
| `color.text.primary` | Texto principal | Corpo do artigo |
| `color.text.secondary` | Texto de apoio | Metadados, legendas |
| `color.text.muted` | Texto terciário | Placeholders |
| `color.surface.base` | Fundo da página | Background |
| `color.surface.raised` | Superfície elevada | Cards, callouts |
| `color.border.subtle` | Divisórias | Tabelas, dividers |
| `color.accent` | Acento de marca | Links, CTA primário |
| `color.accent.hover` | Estado hover | Interação |
| `color.focus` | Anel de foco | A11y — foco visível |
| `color.state.{info,warn,success,danger}` | Feedback | Callouts, validações |

### 4.2 Tema claro e escuro (Princípio 29)

- **Dark mode é de primeira classe**, não inversão automática. Cada token semântico tem valor para `light` e `dark`.
- Troca via `prefers-color-scheme` + toggle persistente do usuário.
- **No dark mode:** fundo não-preto puro (evita halação), texto não-branco puro, acento ajustado para manter contraste.

### 4.3 Contraste (invariante A11y)

- **Invariante COLOR-1:** todo par texto/fundo semântico atinge **WCAG AA** (≥4.5:1 corpo, ≥3:1 texto grande) em **ambos** os temas. Combinações que falham são proibidas no design system — validação automatizada (Princípio 32).
- Cor **nunca** é o único portador de informação (estados também usam ícone/texto).

---

## 5. Grid, Espaçamento e Layout

Espaço em branco é ferramenta de foco (Princípio 24, lição Apple).

### 5.1 Escala de espaçamento (base 4px)

`space-1=4` · `space-2=8` · `space-3=12` · `space-4=16` · `space-6=24` · `space-8=32` · `space-12=48` · `space-16=64` · `space-24=96`

- **Ritmo vertical:** todo espaçamento vertical é múltiplo da escala — cria cadência consistente entre blocos.

### 5.2 Layout de leitura (artigo)

```
| gutter |  TOC (sticky)  |     coluna de leitura (≤66ch)     | gutter |
                          |  blocos "full-bleed" opcionais    |
```

- **Coluna de leitura central** limitada por `article.maxWidth`.
- **Blocos de largura estendida** (tabelas largas, figuras, code) podem "sangrar" além da coluna de texto de forma controlada — sem quebrar o ritmo.
- **TOC sticky** (desktop) navegável; colapsável no mobile (lição Stripe docs / Ahrefs).

### 5.3 Breakpoints (mobile-first — Princípio 31)

| Nome | Largura | Alvo |
|---|---|---|
| `base` | 0+ | **Mobile (caso base)** |
| `sm` | 640px | Mobile grande |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop amplo |

- **Design parte do `base`.** Alvos de toque ≥44px; nada de conteúdo escondido só por ser mobile.

---

## 6. Contrato Visual dos Blocos (Fase 01 → componentes de leitura)

Cada bloco tipado da Fase 01 (§4.2) recebe um contrato visual. Componentes **consomem tokens semânticos** — nunca valores crus (Princípio 28).

| Bloco | Tratamento visual | Notas de leitura/A11y |
|---|---|---|
| `heading` | Escala `text.3xl/2xl/xl` por nível; peso 600; âncora com foco visível | Hierarquia por tamanho+peso; alimenta TOC |
| `paragraph` | `text.base`, `line-height 1.6`, medida ≤66ch | Núcleo da experiência de leitura |
| `list` | Marcadores discretos; espaçamento entre itens | Escaneabilidade |
| `callout` | `surface.raised` + borda por `state`; ícone + rótulo | Cor + ícone (não só cor) |
| `table` | Cabeçalho enfatizado; zebra sutil; **scroll horizontal** no mobile | `<caption>` obrigatório; largura estendida |
| `code` | Fonte mono; `surface.raised`; botão copiar; realce sintático | Contraste AA no tema de código |
| `image` | Largura responsiva; `figure`+`figcaption`; lazy-load | `alt` obrigatório (Fase 01 CNT-1) |
| `figure` | Diagrama original + legenda + crédito da fonte | Explica, não decora (Princípio 33) |
| `quote` | Recuo + acento; atribuição em `text.secondary` | Hierarquia clara |
| `faq` | Acordeão acessível (teclado, aria-expanded) | Mapeia a FAQPage schema |
| `internalLink` | Link com `color.accent`, sublinhado; hover claro | Alvo ≥44px; distinguível sem cor |
| `cta` | Componente destacado, **um por página** | Contextual (Princípio 45); não intrusivo |
| `embed` | Contêiner com proporção fixa (evita CLS) | Reserva de espaço |
| `divider` | `border.subtle`; espaçamento generoso | Ritmo visual |

> **Invariante COMP-1:** nenhum componente introduz estilo fora dos tokens. Isso garante consistência e permite rebrand/tema por tokens (Fase 01 CNT-4).

---

## 7. Movimento e Microinterações

Movimento com propósito (Princípio 30); velocidade percebida como identidade (Princípio 34, lição Linear).

- **Durações:** `motion.fast=120ms`, `motion.base=200ms`, `motion.slow=320ms`. Easing padrão suave.
- **Uso permitido:** feedback de estado (hover, foco, expandir FAQ), transições de página sutis, prefetch de links no viewport (sensação instantânea).
- **Uso proibido:** animação decorativa que atrase leitura, parallax pesado, autoplay que distraia.
- **Invariante MOTION-1:** respeitar `prefers-reduced-motion` — desliga/reduz animações. A11y não-negociável.

---

## 8. Templates (um objetivo por página — Princípio 27)

Cada template define **um objetivo primário** e uma hierarquia visual controlada (lição Apple).

| Template | Objetivo primário | Elementos-chave |
|---|---|---|
| **Home / Hub** | Entrar em um tema / assinar newsletter | Proposta de valor (1 frase), pilares, evergreen em destaque, captura de newsletter |
| **Pillar** | Estabelecer autoridade no tema + distribuir para clusters | Hero do tema, índice de clusters, links `cluster` down (Fase 01 LINK-2) |
| **Article** | Satisfazer a intenção + próximo passo | Título, `dek` (answer-first), TOC, blocos, autor/fontes, 1 CTA contextual |
| **Author** | Reforçar E-E-A-T | Bio, expertise, artigos do autor (schema Person) |
| **Search / Cluster** | Descoberta | Busca rápida, resultados por relevância de cluster |

- **Invariante TPL-1:** um único CTA de conversão primário por template (Princípio 44/45). Sem competição pela atenção.

---

## 9. Acessibilidade (WCAG 2.2 AA — embutida, não adicionada)

Requisito, não favor (Princípio 32). Verificações que fazem parte do design system:

- **Contraste AA** garantido por tokens (COLOR-1).
- **Foco visível** em todo elemento interativo (`color.focus`), navegação por teclado completa.
- **Semântica** correta (headings hierárquicos, landmarks, `figure/figcaption`, `caption` em tabelas).
- **Alt text** obrigatório (Fase 01 CNT-1); ícones decorativos com `aria-hidden`.
- **Alvos de toque** ≥44px; espaçamento adequado.
- **`prefers-reduced-motion`** respeitado (MOTION-1).
- **Zoom até 200%** sem perda de conteúdo/funcionalidade (medida fluida ajuda).
- Cor nunca é o único sinal.

---

## 10. Performance do Design (o design não pode pesar — Princípios 35–40)

O design system tem **orçamento**:

- **Fontes:** ≤2 famílias, subsetadas, auto-hospedadas, com fallback métrico casado (zero CLS de fonte).
- **CSS:** dirigido por tokens; sem frameworks pesados; crítico inline, resto diferido.
- **Imagens:** formatos modernos, dimensões reservadas (sem CLS), lazy-load abaixo da dobra.
- **Zero layout shift:** `embed` e `image` reservam espaço; `CLS` alvo `< 0.1`.
- **Sem JS bloqueante** para leitura: a página é legível antes de qualquer hidratação (Princípio 39).
- **Invariante PERF-1:** o sistema visual respeita o perf budget da Fase 00 (LCP/INP/CLS); qualquer token/componente que o viole é rejeitado.

---

## 11. Checklist de Aprovação da Fase 02

### Leitura
- [ ] Medida de linha, escala tipográfica e ritmo vertical favorecem leitura longa? **Sim** (§3).
### Consistência
- [ ] Tudo deriva de tokens em 3 camadas; nenhum estilo solto? **Sim** (§2, COMP-1).
### Tema
- [ ] Claro e escuro de primeira classe, ambos AA? **Sim** (§4).
### Foco
- [ ] Um objetivo/hierarquia por template, um CTA primário? **Sim** (§8, TPL-1).
### Acessibilidade
- [ ] WCAG 2.2 AA embutida (contraste, foco, teclado, motion, alt)? **Sim** (§9).
### Performance
- [ ] Design respeita o perf budget (fontes, CSS, CLS)? **Sim** (§10, PERF-1).

### Dependências para próximas fases
- [ ] Fase 03 (Técnica) recebe: contrato de tokens + orçamento de assets para escolher stack de estilo/render sem retrabalho.
- [ ] Fase 04 (Editorial) recebe: templates e componentes de bloco para definir padrões de composição de artigo.

> **Recomendação da squad:** aprovar o sistema visual e seguir para a **Fase 03 — Arquitetura Técnica & Performance**, onde tokens, blocos e templates ganham estratégia de render (SSG/ISR), entrega na borda e cache, validados contra escala real.

---

## 12. Riscos e Decisões em Aberto

- **Risco — deriva do design system:** componentes ad hoc que fogem dos tokens ao longo do tempo. *Mitigação:* COMP-1 como regra validável + revisão de design; tokens como fonte única.
- **Risco — 2 famílias de fonte vs. performance:** cada peso/família custa bytes. *Mitigação:* subsetting agressivo, poucos pesos, fallback métrico.
- **Decisão em aberto — família serifada vs. sans para o corpo:** decidir com teste de legibilidade/leitura real na Fase 04 (A/B de retenção).
- **Decisão em aberto — acento de marca definitivo:** depende da identidade visual final; o contrato de token isola essa escolha (troca sem retrabalho).
- **Decisão em aberto — ilustração/estilo de figuras originais:** definir guia de diagramas na Fase 04 (originalidade = moat, Princípio 16).

*Fim do documento.*
