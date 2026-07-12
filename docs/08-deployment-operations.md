# BLOG OS — Fase 08

## Deploy e Operação

> Como o `dist/` vai ao ar e como a operação mantém as invariantes. A saída da v1 é **estática pura** — o deploy é cópia de arquivos para uma CDN; não há servidor de aplicação para operar.
> Status: **Especificado (v1)** · Depende de: `03` (arquitetura), `06` (implementação), ADR-0004 (proposto)

---

## 1. Modelo de deploy

```
git push (branch) → PR → build+check verdes (CI) → merge
                                     ↓
                          build no pipeline → dist/
                                     ↓
                    upload atômico para CDN/edge (ADR-0004)
```

- **Publicar = merge.** O fluxo editorial (Fase 04) e o fluxo de deploy são o mesmo fluxo git — uma única fonte de verdade, auditável por commit.
- **Deploy atômico:** o dist inteiro sobe versionado; rollback = repontar para o deploy anterior (imutável). Sem estado de servidor, rollback é O(1) e sem risco.
- **Assets com fingerprint** (quando houver assets externos ao HTML): cache imutável; o HTML é o único artefato com revalidação.

## 2. Cache na borda (executa o ADR-0003)

| Artefato | Política |
|---|---|
| HTML (`*/index.html`) | cache na borda com revalidação curta OU purga seletiva por rota no deploy (a lista de rotas afetadas vem do `--explain`/manifest do build) |
| `sitemap.xml`, `rss.xml`, `robots.txt` | revalidação curta |
| Assets fingerprinted | `immutable`, 1 ano |

- O build incremental já produz a informação de invalidação (rotas afetadas); o passo de deploy só a traduz em chamadas de purga da CDN escolhida.

## 3. Segurança em produção (SEC-1)

- `dist/_headers` já define: **CSP restritiva** (`default-src 'none'` + inline controlado), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. Ativar HSTS na CDN (com cautela de rollout) e TLS obrigatório.
- Superfície de ataque: **zero endpoints dinâmicos** na v1. WAF/rate-limit da CDN cobrem o restante (ADR-0004).
- Dependências de runtime: **zero**. Dependência de build: Node puro. SCA trivial.

## 4. Operação e observabilidade

- **Monitorar (mínimo v1):** disponibilidade (uptime da CDN), erros 4xx/5xx na borda, validade do certificado, tamanho/contagem do sitemap vs. páginas publicadas (drift = bug de build).
- **Pós-deploy:** smoke test automático — buscar 3 URLs (home, um artigo, sitemap) e validar 200 + conteúdo esperado.
- **RUM entra junto com o deploy** (doc 09) — é também o item H4 do 03.3.
- **Runbook de incidente:** site estático degrada de poucas formas; para cada uma, a resposta é rollback do deploy (atômico) ou purga de cache. Documentar o comando exato da CDN escolhida no momento do setup.

## 5. Runbook Cloudflare (fornecedor selecionado — ADR-0004)

O deploy usa **Workers com static assets**. A configuração está pronta em `platform/wrangler.jsonc` e **validada com `--dry-run`** (wrangler 4.110.0). Duas rotas de execução:

**Rota A — CLI (mais direta):**
```bash
cd platform
node src/build.js && node src/check.js     # pipeline verde obrigatório
npx wrangler login                          # ou export CLOUDFLARE_API_TOKEN=***
npx wrangler deploy                         # publica em https://blog-os.<subdominio>.workers.dev
```

**Rota B — Workers Builds (CI da Cloudflare, sem token local):** conectar o repositório GitHub no dashboard (Workers & Pages → Create → conectar repo), build command `cd platform && node src/build.js && node src/check.js`, deploy command `npx wrangler deploy` — cada push na branch de produção publica automaticamente, com preview em branches.

**Pós-deploy (fecha o 03.3, escopo H3/H4, e aceita o ADR-0004):**
1. Smoke test: home, um artigo e `sitemap.xml` respondendo 200 com conteúdo esperado; headers de segurança ativos (CSP visível na resposta).
2. Apontar domínio próprio (Custom Domain no Worker) e **atualizar `baseUrl` em `platform/content/site.json`** (canonical/sitemap/RSS usam esse valor) + rebuild/redeploy.
3. Medir **H3**: TTFB p75 < 200ms multi-região, cache hit ratio > 95% (analytics do Worker/zone), propagação < 60s após redeploy.
4. Ativar RUM e coletar **H4** (CWV de campo p75) — doc 09 camadas 1–3.
5. Registrar os números no ADR-0004 → `Aceito`.

> **Segurança operacional:** o token de API (se usado) vive em variável de ambiente/secret do CI — nunca em arquivo versionado nem colado em chat. Escopo mínimo: `Workers Scripts:Edit`.
