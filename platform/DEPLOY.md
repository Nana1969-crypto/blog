# Como publicar o Blog OS

O site é 100% estático (pasta `dist/` gerada por `node src/build.js`). Há **três formas** de publicá-lo na Cloudflare, da mais simples à mais automática. Todas produzem o mesmo resultado.

## Opção 1 — Upload manual (mais rápido, sem configurar nada)

1. Gere o site: `node src/build.js && node src/check.js` (ou use o `.zip` já pronto).
2. No Cloudflare dashboard → **Workers & Pages → Create application → Upload your static files**.
3. Nome do projeto: `blog-os`. Arraste a pasta `dist/` (ou o conteúdo do zip). **Deploy**.

Bom para colocar no ar agora. Cada atualização exige repetir o upload.

## Opção 2 — Deploy automático via GitHub Actions (recomendado)

Já configurado em `.github/workflows/deploy.yml`. Cada `git push` na branch `main`:
roda o build, roda o **gate de qualidade** (falha o deploy se algo violar), e publica.

**Configuração única** — adicione 2 secrets no GitHub (repo → **Settings → Secrets and variables → Actions → New repository secret**):

| Secret | Onde obter |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare → **My Profile → API Tokens → Create Token → template "Edit Cloudflare Workers"** |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare → **Workers & Pages** → Account ID (coluna da direita) |

Depois disso, publicar = dar merge na `main`. Sem cliques no dashboard.

## Opção 3 — Linha de comando (para quem usa terminal)

```bash
cd platform
node src/build.js && node src/check.js
npx wrangler login            # ou: export CLOUDFLARE_API_TOKEN=***
npx wrangler deploy
```

---

### Depois do primeiro deploy
- Domínio próprio: no Worker `blog-os` → **Settings → Domains & Routes → Add Custom Domain**.
- Ao definir o domínio, atualize `baseUrl` em `content/site.json` e rode o build de novo
  (o `canonical`, o sitemap e o RSS usam esse endereço).
