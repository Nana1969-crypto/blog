# BLOG OS — Fase 03

## Arquitetura Técnica & Performance

> Traduz os princípios técnicos (Fase 00), os contratos de dados (Fase 01) e o design system (Fase 02) em uma arquitetura concreta: estratégia de renderização, entrega na borda, cache, armazenamento de conteúdo, segurança e orçamento de performance — validados contra escala real (100k páginas / 1M visitas).
> Status: **Proposta para aprovação** · Versão 1.0 · Depende de: `00`, `01`, `02`
> Escopo: **decisões de arquitetura e especificação**. Nenhum código de produção, infraestrutura provisionada ou migração nesta fase. As escolhas de stack são recomendações fundamentadas, com critérios e alternativas.

---

## 1. Resumo Executivo

A Fase 00 fixou: **estático por padrão, incremental para escala, dinâmico só quando necessário** (Princípio 36), **entregar da borda** (37), **cache agressivo** (38), **JS orçado** (39), **segurança como infraestrutura** (42) e **medir com usuários reais** (41). A Fase 01 tornou conteúdo **dado estruturado com unidade de invalidação = `Content`**. Esta fase decide **como servir isso a 1M de visitas e 100k páginas sem degradar**.

Decisões-âncora:

1. **Arquitetura desacoplada (headless):** fonte de conteúdo (Fase 01) separada da camada de apresentação (Fase 02). Permite trocar qualquer camada sem reescrever o acervo.
2. **Renderização híbrida SSG + ISR**, dinâmico só nas bordas funcionais (busca, personalização leve). O custo de render **não cresce com o tráfego**.
3. **Entrega e compute na borda (edge/CDN)** com cache em camadas e invalidação por `Content`.
4. **Segurança de infraestrutura** desde o dia 1 (TLS, headers, WAF, mínimo de dependências).
5. **Orçamento de performance como gate de release**, medido por RUM (usuários reais) + lab.

**Princípio-guia da fase:** *a página mais rápida é a que já está pronta e cacheada perto do usuário; nada que degrade linearmente com o catálogo ou o tráfego entra na arquitetura.*

---

## 2. Estratégia de Renderização (a decisão central)

### 2.1 Matriz de renderização por tipo de página

| Tipo de página | Estratégia | Racional |
|---|---|---|
| **Article / Pillar / Cluster** | **SSG + ISR** (estático, regenerado por publicação/revisão) | Conteúdo muda raramente; deve ser servido pré-renderizado da borda. Regeneração incremental por `Content` (Fase 01) evita rebuild de 100k. |
| **Home / Hub** | **ISR** com revalidação curta | Muda com novos destaques; incremental mantém frescor sem custo por request. |
| **Author** | **SSG + ISR** | Perfil estável; regenera quando o autor publica. |
| **Search / filtros** | **Edge dinâmico** (função na borda + índice) | Combinatório demais para pré-render; roda perto do usuário. |
| **Newsletter / captura** | **Estático + ilha interativa** | Casca estática; só o formulário hidrata. |

> **Invariante RENDER-1:** custo de renderização **O(mudanças)**, não **O(tráfego)** nem **O(catálogo)**. Publicar um artigo regenera aquele artigo (+ páginas de índice afetadas), nunca o site inteiro (Fase 00, Pergunta 2).

### 2.2 Por que não SSR puro por request

SSR dinâmico a cada visita foi rejeitado na Fase 00 (anti-padrão): custo e latência crescem com o tráfego. Com 1M de visitas/mês, servir HTML pronto do cache de borda é ordens de grandeza mais barato e rápido. SSR fica reservado a superfícies genuinamente dinâmicas (busca).

### 2.3 Ilhas de interatividade (islands / partial hydration)

- A página é **HTML legível antes de qualquer JS** (Princípio 39).
- Só componentes interativos hidratam (TOC, FAQ acordeão, busca, formulário, toggle de tema) — o resto é HTML/CSS estático.
- **Invariante RENDER-2:** JS não bloqueia leitura; LCP não depende de hidratação.

---

## 3. Armazenamento de Conteúdo (headless)

O conteúdo é **dado estruturado** (Fase 01). O armazenamento deve preservar isso.

### 3.1 Critérios de escolha (não a marca, mas os requisitos)

| Requisito | Origem | Implicação |
|---|---|---|
| Modelagem de blocos tipados + relações (intenção, taxonomia, grafo) | Fase 01 §2–5 | Suporte a schema estruturado e referências, não HTML solto |
| Versionamento de conteúdo (auditoria de frescor, reversão) | Fase 01 §11 | Histórico de revisões |
| API de leitura performática para build/ISR em escala | Fase 00 P2 | Consulta eficiente de 100k itens; entrega incremental |
| Governança editorial (rascunho→revisão→publicação, gate) | Fase 01 §8 | Estados e permissões |
| Preview de conteúdo estruturado | Fase 00 §6.4 | Render de rascunho |
| Portabilidade / sem lock-in de apresentação | Princípio 21, CNT-4 | Conteúdo exportável como dados |

### 3.2 Recomendação e alternativas

- **Recomendado:** **CMS headless orientado a conteúdo estruturado** (blocos/portable text), desacoplado da apresentação. Atende blocos tipados, versionamento e API de leitura.
- **Alternativas avaliadas:**
  - *Git-based / arquivos estruturados:* excelente versionamento e portabilidade; risco de UX editorial pobre e build lento em 100k — mitigável com build incremental.
  - *Banco relacional próprio + camada de conteúdo:* máximo controle; maior custo de construção e manutenção (tensão com Princípio 11).
- **Invariante STORE-1:** qualquer que seja a escolha, o **contrato de dados da Fase 01 é a fronteira** — a apresentação nunca depende de detalhes do armazenamento (desacoplamento, Princípio 12).

> **Decisão final de fornecedor:** a definir na Fase 03.1 (spike técnico) com um **teste de escala real de 100k itens** medindo tempo de build incremental, custo de API e DX editorial.

---

## 4. Entrega na Borda e Cache

### 4.1 Camadas de cache (do mais rápido ao mais lento)

```
1. Cache de borda (CDN)      →  HTML/estáticos pré-renderizados  (maioria dos hits)
2. Cache de dados/ISR        →  resultado de render reutilizável
3. Origem (build/CMS)        →  só em regeneração/miss
```

- **Maioria absoluta das requisições** é servida do nível 1 (borda), perto do usuário (Princípio 37, lição Cloudflare/Vercel).
- **Assets estáticos** (CSS, fontes, JS, imagens) com cache imutável + fingerprint de conteúdo (cache "eterno", invalidado por hash).

### 4.2 Invalidação por `Content` (a peça crítica de escala)

- **Unidade de invalidação = `Content`** (Fase 01). Publicar/atualizar um item:
  1. regenera aquele `Content`;
  2. regenera páginas de índice/hub que o listam (derivado do grafo, Fase 01 §5);
  3. purga a borda apenas dessas rotas.
- **Invariante CACHE-1:** invalidação é **seletiva e derivada do grafo de conteúdo** — nunca "purga tudo". Isso é o que mantém 100k páginas viáveis.

### 4.3 Imagens

- Otimização por pipeline (formatos modernos, tamanhos responsivos, `srcset`), servida da borda, com dimensões reservadas (zero CLS — Fase 02 §10).
- Lazy-load abaixo da dobra; LCP image priorizada.

---

## 5. Orçamento de Performance (gate de release)

Core Web Vitals são **requisito**, não meta (Princípio 35). O orçamento é validável e bloqueia deploy.

### 5.1 Metas (medidas em campo — p75)

| Métrica | Alvo | Observação |
|---|---|---|
| **LCP** | < 2.0s | HTML pré-renderizado + LCP image priorizada |
| **INP** | < 200ms | JS orçado; ilhas pequenas |
| **CLS** | < 0.1 | Dimensões reservadas; fonte com fallback métrico |
| **TTFB** | < 200ms | Borda/CDN |
| **JS inicial** | < ~100KB gz por rota de leitura | Ilhas apenas |
| **Peso total (artigo típico)** | orçamento definido | Imagens otimizadas dominam |

### 5.2 Medição

- **RUM (Real User Monitoring)** como fonte de verdade (Princípio 41): CWV de campo, segmentado por dispositivo/rota.
- **Lab (CI):** Lighthouse/perf budget em cada PR — bloqueia regressão antes do merge.
- **Invariante PERF-1:** um release que estoure o orçamento em qualquer métrica p75 **não sobe**. Performance é gate, não relatório.

---

## 6. Segurança (infraestrutura, não add-on — Princípio 42)

### 6.1 Controles de base

| Camada | Controle |
|---|---|
| **Transporte** | TLS obrigatório; HSTS |
| **Cabeçalhos** | CSP restritiva, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` |
| **Borda** | WAF, rate limiting, proteção DDoS/bots (lição Cloudflare) |
| **Dependências** | Mínimo necessário (Princípio 11); auditoria/SCA em CI; SBOM |
| **Superfície dinâmica** | Validação/sanitização de entrada (busca, formulários); sem confiança no cliente |
| **Segredos** | Fora do código; princípio do menor privilégio |
| **Conteúdo** | Blocos tipados sanitizados na renderização (sem HTML arbitrário injetado) |

- **Invariante SEC-1:** superfície de ataque minimizada por design — site majoritariamente estático reduz drasticamente vetores. Cada dependência e cada endpoint dinâmico é justificado.
- **Privacidade (LGPD/GDPR):** consentimento real, sem dark patterns (Princípio 49); analytics respeitando privacidade; dados de lead protegidos (base para Fase 05).

---

## 7. Arquitetura de Aplicação (Clean Architecture — Princípio 6)

Separação em camadas independentes de framework, para longevidade e evolutibilidade (Princípios 6, 12):

```
Domínio            →  entidades da Fase 01 (Content, Intent, Taxonomy, Link, Author)
                      regras de negócio puras (invariantes, gate)
Aplicação          →  casos de uso: publicar, revalidar, resolver rota, montar página
Apresentação       →  templates/componentes da Fase 02 (consomem tokens)
Infraestrutura     →  CMS, CDN, cache, busca, email (plugáveis atrás de interfaces)
```

- **Invariante ARCH-1:** o domínio (regras de conteúdo/SEO) **não conhece** framework, CMS ou CDN. Trocar qualquer detalhe de infra não toca o domínio.
- **Componentização** (Princípio 5): UI e blocos como componentes reutilizáveis; conteúdo como dados.

### 7.1 Recomendação de stack (fundamentada, não dogmática)

- **Camada de render/entrega:** framework com **SSG+ISR + islands + edge** first-class e forte otimização de assets (perfil Vercel/Next-like; alternativas com o mesmo modelo são aceitáveis se atenderem RENDER-1/2).
- **Distribuição/segurança:** CDN/edge com WAF e compute na borda (perfil Cloudflare-like).
- **Conteúdo:** headless estruturado (§3).
- **Critério decisivo:** aderência às invariantes RENDER/CACHE/PERF/SEC — **não** popularidade. Validação por spike de escala.

---

## 8. Observabilidade (Princípio 10)

- **RUM** (CWV de campo) + **erros** (client/edge) + **logs de build/regeneração** + **métricas de negócio** (tráfego, engajamento, conversão — base Fase 05).
- **Alertas** em regressão de CWV, erro de build/regeneração, pico de erro 4xx/5xx, falha de invalidação.
- **Invariante OBS-1:** decisões guiadas por dados reais, não intuição — agir antes do usuário perceber (Fase 00, Pergunta 1).

---

## 9. Validação de Escala — fechamento das Perguntas Críticas (Fase 00)

| Pergunta Crítica (Fase 00) | Resposta desta fase |
|---|---|
| **1M visitas/mês** | Estático/ISR servido da borda (§2, §4): custo por visita ~O(1); RUM + perf gate; WAF/anti-DDoS; JS orçado |
| **100k artigos** | Invalidação seletiva por `Content` (CACHE-1) + ISR (RENDER-1) + build incremental; sitemaps segmentados; grafo para descoberta |
| **O que separa de um blog comum** | Arquitetura desacoplada, render híbrido de borda, segurança de infra, orçamento de performance como gate, conteúdo como dado |
| **Riscos desde o início** | Stack que não escala (mitigado por RENDER-1 + spike de 100k), lock-in (STORE-1/ARCH-1), dependências (SEC-1), regressão de perf (PERF-1) |

- **Spike obrigatório antes da implementação (Fase 04+):** protótipo com **100k itens sintéticos** medindo build incremental, latência de borda p75, custo de API do CMS e CWV em dispositivo modesto. Sem esse número, a escolha de stack não é aprovada.

---

## 10. Checklist de Aprovação da Fase 03

### Renderização
- [ ] Custo de render é O(mudanças), não O(tráfego/catálogo)? **Sim** (RENDER-1).
### Entrega
- [ ] Maioria servida da borda com invalidação seletiva? **Sim** (§4, CACHE-1).
### Conteúdo
- [ ] Armazenamento preserva blocos tipados e desacopla apresentação? **Sim** (STORE-1).
### Performance
- [ ] CWV como gate de release medido por RUM? **Sim** (PERF-1).
### Segurança
- [ ] TLS, headers, WAF, mínimo de dependências desde o dia 1? **Sim** (SEC-1).
### Arquitetura
- [ ] Domínio independente de framework/infra (evolutível)? **Sim** (ARCH-1).
### Escala
- [ ] Plano de validação com 100k itens definido? **Sim** (§9 spike).

### Dependências para próximas fases
- [ ] Fase 04 (Editorial) recebe: workflow/preview e gate técnico prontos para operacionalizar produção de conteúdo.
- [ ] Fase 05 (Conversão) recebe: superfície dinâmica segura + observabilidade para formulários, newsletter e medição de jornada.

> **Recomendação da squad:** aprovar a arquitetura **condicionada ao spike de escala de 100k** (Fase 03.1) antes de qualquer implementação. Em seguida, **Fase 04 — Sistema Editorial & E-E-A-T** e **Fase 05 — Conversão & Growth**.

---

## 11. Riscos e Decisões em Aberto

- **Risco — build incremental do CMS em 100k:** alguns headless degradam. *Mitigação:* spike obrigatório (§9); critério de aprovação = tempo de build incremental sob limite.
- **Risco — CSP restritiva vs. embeds/analytics:** política dura pode quebrar mídia. *Mitigação:* allowlist mínima e revisada; preferir soluções self-hosted (lição Cloudflare/segurança).
- **Risco — complexidade de ISR/invalidação:** invalidação errada serve conteúdo velho ou purga demais. *Mitigação:* derivar invalidação do grafo (Fase 01) e testar; OBS-1 alerta falhas.
- **Decisão em aberto — fornecedor de CMS e de edge:** definir no spike com critérios de §3.1/§7.1 (aderência a invariantes, não marketing).
- **Decisão em aberto — busca interna:** índice na borda vs. serviço dedicado — decidir por volume/latência no spike.
- **Decisão em aberto — i18n/hreflang:** se houver expansão internacional (herdado da Fase 01 §11), impacta roteamento e cache — avaliar antes de fechar o stack.

*Fim do documento.*
