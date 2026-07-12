# BLOG OS — Fase 06

## Plano de Implementação (v1)

> Plano executável da primeira versão da plataforma, destravado pela decisão do ADR-0001 (armazenamento file-based v1), que colapsa os eixos H7/H8 do spike por construção e torna o build real **medível localmente**. Os eixos que continuam exigindo deploy real (H3 CDN, H4 CWV de campo) permanecem pendências explícitas do 03.3 — a v1 é projetada para passá-los por construção (estático puro, CDN-ready).
> Status: **Em execução** · Versão 1.0 · Depende de: `00–05`, `03.1/03.2` (evidência), ADR-0001

---

## 1. Escopo da v1

**Entra (tudo verificável localmente):**
- Estrutura de conteúdo file-based: blocos tipados da Fase 01 em JSON (`platform/content/`).
- Build estático **zero-dependências** (`platform/src/`): render de blocos → HTML semântico, com **gate de qualidade no build** (as validações automáticas da Fase 01 §8 — build falha se violar).
- Design system da Fase 02 como tokens CSS em 3 camadas, tipografia de leitura (18px/1.6/≤66ch), **dark/light de primeira classe**, contraste **AA verificado por script** (não por olho).
- Templates com objetivo único (Fase 02 §8): home/hub, pillar, artigo, autor, 404.
- SEO estrutural completo: URLs canônicas derivadas da taxonomia, schema.org (Organization, WebSite, Article, BreadcrumbList, FAQPage), sitemap, robots, RSS, meta/OG.
- **Build incremental com `--explain`** (política de âncora BUILD, ADR-0003): manifest por hash; publicar 1 artigo regenera só as rotas afetadas — medido.
- Conteúdo de demonstração real (2 pilares, 6 artigos) seguindo o sistema editorial da Fase 04.
- Verificação: gates + integridade de links + contraste + navegação real (Chromium/Playwright) com screenshots.

**Não entra na v1 (pendências explícitas):**
- Deploy real em CDN/edge (ADR-0004 permanece `Proposto`; a saída é 100% estática e CDN-ready — arquivo de headers incluído).
- Autores reais com credenciais (conteúdo demo usa autoria institucional "Equipe Blog OS", claramente identificada; **E-E-A-T pleno exige autores reais antes do launch público** — Fase 04).
- Newsletter/captura funcionando ponta a ponta (o bloco CTA existe; o backend de email é decisão de deploy — Fase 05/doc 09).
- Busca interna (v1 tem navegação por taxonomia; busca entra com o volume).

## 2. Arquitetura da implementação (espelha ARCH-1)

```
platform/
├── content/               # DOMÍNIO: dado estruturado (Fase 01) — não conhece apresentação
│   ├── site.json          # identidade, baseUrl
│   ├── authors.json
│   ├── taxonomy.json      # pillars + clusters
│   └── articles/*.json    # blocos tipados + seo + intent
├── src/                   # APLICAÇÃO/APRESENTAÇÃO
│   ├── tokens.js          # tokens 3 camadas → CSS custom properties
│   ├── blocks.js          # blocos tipados → HTML (renderer puro)
│   ├── templates.js       # layouts (home/pillar/article/author)
│   ├── build.js           # pipeline: gate → render → sitemap/RSS/robots → manifest incremental
│   └── check.js           # pós-build: links, alt, headings, contraste AA, unicidade de meta
└── dist/                  # saída estática (gitignored) — pronta para qualquer CDN
```

## 3. Critérios de aceite (verificados nesta fase)

- [ ] Gate do build **bloqueia** violações (testado com violação plantada).
- [ ] Contraste AA **computado** ≥4.5:1 (corpo) em ambos os temas.
- [ ] Zero links internos quebrados no `dist/` (verificado por script).
- [ ] Build incremental: editar 1 artigo regenera só rotas afetadas (explain + medição).
- [ ] JS por página de leitura ≤ ~2KB (apenas toggle de tema); página legível sem JS.
- [ ] Schema.org válido (JSON parseável, campos obrigatórios) em toda página.
- [ ] Navegação real verificada em Chromium (desktop + mobile + dark) com screenshots.

*Resultados registrados no §4 após execução.*

## 4. Resultados da execução

Todas as medições abaixo são reais, executadas nesta fase (ambiente local; navegador Chromium via Playwright; servidor estático local). O que depende de rede/CDN real permanece pendente do deploy (03.3).

### 4.1 Critérios de aceite — resultado

| Critério | Resultado |
|---|---|
| Gate bloqueia violações | ✅ 3 violações plantadas, 3 bloqueadas: canibalização (INV-3), link interno para artigo inexistente (LINK-4), metaTitle >60 chars — build falha listando cada uma |
| Contraste AA computado | ✅ 6 pares texto/fundo × 2 temas verificados por código em `check.js`; falha se <4.5:1 |
| Zero links quebrados | ✅ 12 páginas varridas, 0 quebrados |
| Build incremental | ✅ sem mudanças: 0 regenerados/6 pulados (21ms); 1 artigo editado: 1 regenerado/5 pulados (32ms); `--explain art-intencao` → 8 rotas exatas (própria + 3 índices + 2 inlinkers + 2 feeds) |
| JS por página | ✅ máx **499 bytes** (orçamento: 2048); página legível com JS desligado (verificado em navegador com JS desabilitado) |
| Schema.org válido | ✅ JSON-LD parseável com @type em toda página (Article, BreadcrumbList, FAQPage, WebSite, CollectionPage, Organization/Person) |
| Navegação real verificada | ✅ Chromium: desktop claro/escuro + mobile 390px; 0 erros de console; toggle de tema persiste (localStorage); 1º Tab foca skip-link; FAQ abre por teclado/clique; sem scroll horizontal no mobile |

### 4.2 Performance medida (navegador real, servidor local)

| Página | Transferido | FCP | Requests |
|---|---:|---:|---:|
| Home | 14,2 KB | 156ms | 2 (html + favicon data:) |
| Artigo (Core Web Vitals) | 19,8 KB | 68–140ms | 1 |
| Pillar (SEO Técnico) | 12,7 KB | 44ms | 1 |
| Artigo com diagrama SVG | 20,5 KB | 52ms | 1 |

> **Leitura honesta:** FCP local não é CWV de campo (sem latência de rede real). O que estes números provam: o peso de página (~20KB, 1 request, CSS inline, ≤499B de JS) está uma ordem de grandeza abaixo dos orçamentos da Fase 03 §5 — em CDN, os alvos de LCP/TTFB são atingíveis por construção. A confirmação de campo é o item H4 do 03.3.

### 4.3 Defeito encontrado e corrigido na verificação

A verificação mobile revelou **grid blowout**: o item do grid do artigo estourava o track (453px > 345px) porque `min-width:auto` deixava o min-content da tabela vazar, expandindo o layout viewport para 477px. Corrigido com `.article-grid>*{min-width:0}` e re-verificado (viewport 390px, tabela rolando dentro do wrapper). Registrado aqui porque é exatamente o tipo de defeito que só a verificação em navegador real pega — screenshot e medição, não suposição.
