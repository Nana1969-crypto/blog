# BLOG OS — Fase 01

## Arquitetura de Informação & Modelo de Dados

> Traduz os princípios da Fase 00 em estruturas concretas: taxonomia, modelo de intenção canônica, schema de conteúdo em blocos, grafo de interlinking, URLs e contratos de metadados.
> Status: **Proposta para aprovação** · Versão 1.0 · Depende de: `00-foundation-benchmarking.md`
> Escopo: **design e especificação**. Nenhuma implementação, migração ou código de produção nesta fase. Os schemas abaixo são *contratos*, expressos de forma agnóstica de tecnologia.

---

## 1. Resumo Executivo

A Fase 00 estabeleceu que **SEO nasce na arquitetura** e que **conteúdo é dado, não HTML**. Esta fase materializa isso.

Definimos:

1. **Modelo de Intenção Canônica** — a unidade atômica de estratégia: uma intenção de busca → uma URL. Elimina canibalização por design.
2. **Taxonomia governada** — Pilares → Clusters → Artigos, rasa e estável, refletida em URLs e breadcrumbs.
3. **Schema de conteúdo em blocos tipados** — conteúdo estruturado, portável, reutilizável e à prova de futuro.
4. **Grafo de interlinking** — links internos como dado de primeira classe, não texto solto, com regras de distribuição de autoridade.
5. **Contrato de metadados e schema.org** — E-E-A-T, frescor e rich results embutidos no modelo.
6. **Estratégia de URLs e redirects** — estáveis, semânticas, com política de mudança/aposentadoria.

**Princípio-guia da fase:** *tudo que afeta SEO, descoberta ou reuso é modelado como dado explícito e validável — nunca implícito no corpo do texto.*

---

## 2. Modelo de Intenção Canônica

A canibalização (Fase 00, anti-padrão) acontece quando várias URLs disputam a mesma intenção. Resolvemos isso tornando a **intenção** uma entidade de primeira classe, anterior ao artigo.

### 2.1 Entidade `SearchIntent`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | ID | sim | Identificador estável da intenção |
| `canonicalQuery` | string | sim | A formulação canônica da pergunta/consulta do usuário |
| `intentType` | enum | sim | `informational` \| `commercial` \| `transactional` \| `navigational` |
| `funnelStage` | enum | sim | `ToFu` \| `MoFu` \| `BoFu` |
| `primaryKeyword` | string | sim | Keyword principal |
| `secondaryKeywords` | string[] | não | Variações e sub-intenções cobertas pela mesma URL |
| `searchVolume` | int | não | Volume estimado |
| `difficulty` | int | não | Dificuldade estimada (0–100) |
| `businessValue` | enum | sim | `0`–`3` (score de valor de negócio — lição Ahrefs) |
| `priorityScore` | number | derivado | Função de volume × valor × (1/dificuldade) × intenção |
| `canonicalContentId` | ref → Content | sim | **A única** peça que atende esta intenção |
| `status` | enum | sim | `identified` \| `planned` \| `covered` \| `retired` |

### 2.2 Regras de governança (invariantes)

- **INV-1:** Toda `SearchIntent` com `status = covered` aponta para exatamente **um** `Content` (`canonicalContentId`).
- **INV-2:** Um `Content` pode atender **N** intenções secundárias, mas cada intenção pertence a **um único** `Content`. (1 intenção → 1 URL; 1 URL → N intenções relacionadas.)
- **INV-3:** Duas intenções não podem compartilhar o mesmo `primaryKeyword`. Auditoria automática de sobreposição bloqueia publicação em conflito.
- **INV-4:** A priorização de pauta usa `priorityScore` — nunca só volume (Princípio 8, Fase 00).

> **Por quê:** ao planejar a partir da intenção (não do artigo), a canibalização vira impossível por construção, e a autoridade concentra-se em páginas fortes.

---

## 3. Taxonomia

### 3.1 Hierarquia (rasa e estável)

```
Pillar (Tema amplo)
  └─ Cluster (Subtema / conjunto de intenções relacionadas)
        └─ Content (Artigo — atende 1 intenção canônica)
```

- **Profundidade máxima: 3 níveis.** Taxonomias profundas confundem usuário e diluem autoridade (Fase 00, §6.3).
- **Pillar** = página-pilar ampla + hub do tema.
- **Cluster** = agrupamento de intenções; pode ter uma página-cluster própria ou ser apenas organizacional.
- **Content** = artigo que atende uma intenção canônica e aponta de volta à pilar (modelo pillar/cluster, Princípio 3).

### 3.2 Entidade `Pillar`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | ID | sim | |
| `slug` | string | sim | Segmento de URL, estável |
| `title` | string | sim | |
| `description` | string | sim | Proposta de valor do tema |
| `pillarContentId` | ref → Content | sim | A página-pilar (conteúdo âncora) |
| `order` | int | não | Ordenação na navegação |

### 3.3 Entidade `Cluster`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | ID | sim | |
| `pillarId` | ref → Pillar | sim | Pai |
| `slug` | string | sim | |
| `title` | string | sim | |
| `description` | string | não | |
| `clusterContentId` | ref → Content | não | Página-cluster opcional |

### 3.4 Regras de taxonomia

- **TAX-1:** Todo `Content` pertence a exatamente um `Cluster` (que pertence a um `Pillar`). Sem conteúdo órfão.
- **TAX-2:** `slug` de pillar/cluster é **imutável** após publicação. Mudança exige redirect explícito (§7).
- **TAX-3:** A taxonomia é **governada**: criar pillar/cluster é decisão editorial revisada, não ação livre — evita a proliferação caótica (anti-padrão Notion/Semrush, Fase 00).

---

## 4. Schema de Conteúdo em Blocos

Conteúdo é **dado estruturado** (Princípio 21). O corpo do artigo não é HTML nem Markdown solto: é uma **árvore de blocos tipados**, cada um com contrato próprio. Isso garante portabilidade, reuso, consistência e re-renderização sem reescrita.

### 4.1 Entidade `Content`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | ID | sim | |
| `type` | enum | sim | `pillar` \| `cluster` \| `article` |
| `slug` | string | sim | Segmento final da URL |
| `clusterId` | ref → Cluster | sim | Localização na taxonomia |
| `title` | string | sim | Título específico, orientado a intenção |
| `dek` | string | sim | Subtítulo/resumo (answer-first, Princípio 15) |
| `body` | Block[] | sim | Árvore de blocos tipados (§4.2) |
| `authorIds` | ref → Author[] | sim | Autoria (E-E-A-T, Princípio 18) |
| `reviewerId` | ref → Author | não | Revisor especialista (temas sensíveis) |
| `sources` | Source[] | não | Fontes citadas (Princípio 19) |
| `publishedAt` | datetime | sim | |
| `updatedAt` | datetime | sim | Frescor real (Princípio 6) |
| `reviewedAt` | datetime | não | Última revisão de precisão |
| `status` | enum | sim | `draft` \| `in_review` \| `published` \| `retired` |
| `seo` | SeoMeta | sim | Contrato de metadados (§6) |
| `qualityGatePassed` | bool | derivado | Gate editorial (§8) |

### 4.2 Blocos tipados (`Block`)

Cada bloco tem `type`, um `id` estável e um payload validado. Conjunto inicial:

| Bloco | Payload (resumo) | Função editorial |
|---|---|---|
| `heading` | `level (2-4)`, `text`, `anchor` | Estrutura + TOC automática |
| `paragraph` | `richText` (spans com marcas) | Texto de leitura |
| `list` | `ordered`, `items[]` | Escaneabilidade |
| `callout` | `variant (info/warn/tip)`, `richText` | Destaque contextual |
| `table` | `headers[]`, `rows[][]`, `caption` | Comparações (Princípio 17) |
| `code` | `language`, `content` | Exemplos técnicos |
| `image` | `assetId`, `alt (obrigatório)`, `caption` | Explicação visual + A11y (Princípios 33, 32) |
| `figure` | `assetId`, `alt`, `caption`, `source` | Diagrama original com crédito |
| `quote` | `richText`, `attribution` | Citação |
| `faq` | `items[] {question, answerRichText}` | FAQ → schema.org FAQ (§6) |
| `internalLink` | `targetContentId`, `context` | Interlinking como dado (§5) |
| `cta` | `ctaId`, `variant` | Conversão contextual (um por página, Princípio 45) |
| `embed` | `provider`, `ref` | Mídia externa controlada |
| `divider` | — | Ritmo visual |

### 4.3 Regras de conteúdo

- **CNT-1:** `image`/`figure` exigem `alt` não-vazio (bloqueio de publicação sem alt — A11y AA).
- **CNT-2:** Links internos usam o bloco `internalLink` (ou marca `internalLink` em richText), **nunca** URL crua embutida — para que o grafo (§5) seja íntegro.
- **CNT-3:** Um `Content` do tipo `article` deve conter ≥1 `heading` nível 2 e a estrutura mínima do gate (§8).
- **CNT-4:** Blocos são portáveis: nenhum bloco carrega estilos inline; apresentação vem do design system (Fase 02).

> **Por quê blocos e não HTML/Markdown:** com 100k artigos (Fase 00, Pergunta 2), precisamos re-renderizar, migrar de tema, gerar AMP/feeds/versão para IA e auditar acessibilidade — tudo isso só é viável se o conteúdo for dado estruturado, não markup congelado.

---

## 5. Grafo de Interlinking

Links internos distribuem autoridade e guiam a jornada (Princípio 5). Tratamo-los como **arestas de um grafo**, não como texto.

### 5.1 Entidade `InternalLink` (aresta)

| Campo | Tipo | Descrição |
|---|---|---|
| `fromContentId` | ref → Content | Origem |
| `toContentId` | ref → Content | Destino |
| `anchorText` | string | Texto âncora (relevância semântica) |
| `relation` | enum | `pillar_up` \| `cluster_sibling` \| `contextual` \| `next_step` |
| `placement` | enum | `body` \| `related` \| `breadcrumb` |

### 5.2 Regras do grafo

- **LINK-1 (pillar_up):** todo `article` tem ≥1 aresta `pillar_up` para sua página-pilar (modelo pillar/cluster).
- **LINK-2 (reciprocidade):** a página-pilar referencia seus artigos principais (`cluster` down).
- **LINK-3 (relevância):** links contextuais devem ser semanticamente relevantes; interlinking assistido pelo sistema sugere candidatos por cluster/intenção, mas a decisão é editorial (Princípio 5).
- **LINK-4 (integridade):** ao aposentar/redirecionar um `Content`, o sistema detecta arestas de entrada e força atualização/redirect — **sem links internos quebrados**.
- **LINK-5 (profundidade de cliques):** todo `Content` publicado deve ser alcançável da home em ≤3 cliques (rastreabilidade e descoberta em escala — Fase 00, Pergunta 2).

> Com o grafo explícito, conseguimos auditar autoridade interna, detectar páginas órfãs, medir profundidade de cliques e manter a integridade a 100k páginas — impossível com links soltos no texto.

---

## 6. Contrato de Metadados e Schema.org

Metadados de SEO e E-E-A-T são **campos do modelo**, validados no gate — não improvisados por página (Princípio 7).

### 6.1 `SeoMeta`

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `metaTitle` | string | sim | ≤ 60 chars recomendado; único no site |
| `metaDescription` | string | sim | ≤ 155 chars; orientada a clique |
| `canonicalUrl` | url | sim | Auto-derivada da taxonomia; ver §7 |
| `ogImageAssetId` | ref | sim | Social/rich preview |
| `robots` | enum | sim | `index,follow` por padrão |
| `structuredData` | object[] | derivado | Gerado do conteúdo (§6.2) |

### 6.2 Schema.org gerado (derivado do modelo, não escrito à mão)

- **Article / BlogPosting** — de `title`, `dek`, `authorIds`, `publishedAt`, `updatedAt`, `image`.
- **BreadcrumbList** — da taxonomia Pillar → Cluster → Content.
- **FAQPage** — de qualquer bloco `faq`.
- **Person** (autor) + **Organization** — de `Author` e da entidade da marca.

### 6.3 Entidades de autoridade (E-E-A-T)

**`Author`**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | ID | sim | |
| `name` | string | sim | |
| `bio` | richText | sim | Credenciais e expertise (Princípio 18) |
| `expertiseAreas` | string[] | sim | Vincula autor a pillars |
| `avatarAssetId` | ref | sim | |
| `socialProfiles` | url[] | não | `sameAs` no schema Person |

**`Source`** (citação — Princípio 19)

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `label` | string | sim | Texto da referência |
| `url` | url | não | Origem |
| `accessedAt` | date | não | Data de acesso |

> **Preparação para busca por IA (Princípio 12 — GEO/AEO):** answer-first no `dek`, blocos `faq` estruturados, schema Article/FAQ/Author e fontes citáveis aumentam a chance de citação por LLMs e AI Overviews.

---

## 7. Estratégia de URLs e Redirects

URLs limpas, semânticas e **estáveis** (Princípio 4).

### 7.1 Padrão canônico

```
https://{dominio}/{pillar-slug}/{cluster-slug}/{content-slug}
```

- **Pillar:** `/{pillar-slug}` — a página-pilar é o hub do tema.
- **Cluster (opcional):** `/{pillar-slug}/{cluster-slug}`.
- **Sem datas, sem IDs, sem parâmetros voláteis** na URL canônica.
- **Minúsculas, hifens, ASCII/transliteração** — previsível e portável.

### 7.2 Entidade `Redirect`

| Campo | Tipo | Descrição |
|---|---|---|
| `from` | path | Caminho antigo |
| `to` | path/ref | Destino |
| `code` | enum | `301` (permanente, padrão) \| `410` (aposentado sem substituto) |
| `reason` | enum | `slug_change` \| `consolidation` \| `retirement` |

### 7.3 Regras de URL

- **URL-1:** `slug` imutável após publicação; qualquer mudança gera `Redirect 301` automático (TAX-2).
- **URL-2:** Consolidação (poda, Princípio 10): conteúdo fundido → `301` para a versão canônica; intenção do antigo é reatribuída (INV-2).
- **URL-3:** Aposentadoria sem substituto → `410` + remoção do sitemap.
- **URL-4:** `canonicalUrl` é sempre derivada da taxonomia — nunca digitada manualmente, evitando erro humano em escala.

---

## 8. Gate Editorial e de Qualidade

Nada publica sem passar por um **gate validável** (Princípio 22). O gate é parte do modelo, não um checklist informal.

### 8.1 Validações automáticas (bloqueiam publicação)

- [ ] `SearchIntent` canônica vinculada e sem conflito de `primaryKeyword` (INV-3).
- [ ] Pertence a um `Cluster`/`Pillar` válido (TAX-1).
- [ ] `metaTitle` e `metaDescription` presentes, dentro do limite e únicos.
- [ ] ≥1 aresta `pillar_up` (LINK-1) e alcançável em ≤3 cliques (LINK-5).
- [ ] Todo `image`/`figure` com `alt` (CNT-1); estrutura de headings válida (CNT-3).
- [ ] ≥1 autor com bio (E-E-A-T); `publishedAt`/`updatedAt` presentes.
- [ ] Schema.org gerado válido (§6.2).

### 8.2 Validações editoriais (revisão humana)

- [ ] Satisfaz a intenção melhor que os concorrentes (profundidade, originalidade — Princípios 9, 14, 16).
- [ ] Answer-first; escaneável; fontes citadas onde relevante.
- [ ] CTA contextual único, alinhado ao tema (Princípio 45).
- [ ] Revisão de especialista quando o tema exige (`reviewerId`).

### 8.3 Ciclo de atualização (frescor — Princípio 6)

- Cada `Content` tem cadência de revisão sugerida por tipo.
- Conteúdo além da cadência é sinalizado para **revisar, consolidar ou aposentar** — nunca abandonar.
- `updatedAt`/`reviewedAt` refletem mudanças reais e são expostos ao usuário e ao schema.

---

## 9. Validação de Escala (100k páginas / 1M visitas)

Amarrando às Perguntas Críticas da Fase 00:

| Preocupação | Decisão desta fase que a resolve |
|---|---|
| Canibalização com o crescimento do catálogo | Modelo de Intenção Canônica + INV-1..4 (impossível por construção) |
| Descoberta e rastreabilidade a 100k páginas | Taxonomia rasa + Grafo de interlinking + LINK-5 (≤3 cliques) + sitemaps segmentados |
| Links internos quebrados em escala | Interlinking como dado + LINK-4 (integridade forçada) |
| Re-render / migração de tema sem reescrever acervo | Conteúdo em blocos tipados (CNT-4) |
| Build incremental (não regerar 100k por publicação) | Conteúdo desacoplado da apresentação; unidade de invalidação = `Content` (detalhe técnico → Fase 03) |
| Consistência de SEO/E-E-A-T por página | Metadados e schema derivados do modelo, validados no gate (§6, §8) |

> **Aberto para a Fase 03 (Arquitetura Técnica):** escolha de armazenamento (headless/DB), estratégia de render (SSG/ISR) e invalidação de cache. Esta fase define **o quê** (contratos); a Fase 03 define **o como** (stack), validando o modelo contra um teste real de 100k itens.

---

## 10. Checklist de Aprovação da Fase 01

### Modelo de dados
- [ ] Intenção canônica elimina canibalização por construção? **Sim** (INV-1..4).
- [ ] Conteúdo é dado estruturado e portável? **Sim** (blocos tipados, §4).

### SEO
- [ ] Taxonomia, URLs, interlinking e schema nascem do modelo? **Sim** (§3, §5, §6, §7).
- [ ] Metadados são validados, não improvisados? **Sim** (gate §8).

### Escala
- [ ] Descoberta, integridade de links e re-render funcionam a 100k? **Sim** (§9), pendente validação de stack na Fase 03.

### Editorial / E-E-A-T
- [ ] Autoria, fontes, frescor e gate de qualidade estão no modelo? **Sim** (§4.1, §6.3, §8).

### Dependências para próximas fases
- [ ] Fase 02 (Design System) recebe: blocos tipados sem estilo inline (CNT-4) prontos para receber tokens.
- [ ] Fase 03 (Técnica) recebe: contratos de entidade + unidade de invalidação para escolher stack e render.

> **Recomendação da squad:** aprovar os contratos e seguir para a **Fase 02 — Design System & Sistema de Leitura**, mapeando cada bloco tipado a um componente de leitura, e/ou **Fase 03 — Arquitetura Técnica**, validando o modelo contra escala real.

---

## 11. Riscos e Decisões em Aberto

- **Risco — rigidez da taxonomia rasa:** temas muito amplos podem pressionar por um 4º nível. *Mitigação:* usar `Cluster` organizacional sem página própria antes de aprofundar a hierarquia; revisar governança trimestralmente.
- **Risco — sobrecarga do gate editorial:** validações demais podem travar o time. *Mitigação:* separar bloqueantes (automáticas) de recomendações (revisão), como em §8.
- **Decisão em aberto — página-cluster própria vs. apenas organizacional:** definir por pillar conforme volume de intenções (a decidir com dados na Fase 04).
- **Decisão em aberto — versionamento de conteúdo:** histórico de revisões (para auditoria de frescor e reversão) — recomendado; especificar na Fase 03 junto ao armazenamento.
- **Decisão em aberto — i18n/multi-idioma:** o modelo de URL e intenção precisa acomodar `hreflang` se houver expansão internacional; sinalizado para avaliação antes da Fase 03.

*Fim do documento.*
