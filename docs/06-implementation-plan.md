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

*(preenchido ao concluir — medições reais, nunca estimadas)*
