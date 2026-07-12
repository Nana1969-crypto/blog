'use strict';
// Build estático do Blog OS — zero dependências externas.
// Pipeline: carregar → GATE (Fase 01 §8, bloqueante) → render → índices → sitemap/RSS/robots.
// Incremental: manifest por hash (artigo + código compartilhado); publicar 1 artigo
// regenera apenas as rotas afetadas (CACHE-1/ADR-0003, âncoras no build).
//
// Uso:
//   node platform/src/build.js               # build (incremental se houver manifest)
//   node platform/src/build.js --force       # ignora manifest
//   node platform/src/build.js --explain <articleId>  # rotas afetadas por 1 publicação

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { renderBlocks, esc } = require('./blocks');
const T = require('./templates');

const ROOT = path.join(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const DIST = path.join(ROOT, 'dist');
const MANIFEST = path.join(ROOT, '.build-manifest.json');

const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);

// ---------------------------------------------------------------- carga
function loadAll() {
  const site = readJson(path.join(CONTENT, 'site.json'));
  const authors = readJson(path.join(CONTENT, 'authors.json'));
  const taxonomy = readJson(path.join(CONTENT, 'taxonomy.json'));
  const artDir = path.join(CONTENT, 'articles');
  const articles = fs.readdirSync(artDir).filter((f) => f.endsWith('.json'))
    .map((f) => ({ ...readJson(path.join(artDir, f)), _file: f, _raw: fs.readFileSync(path.join(artDir, f), 'utf8') }));
  site.pillars = taxonomy.pillars;
  return { site, authors, taxonomy, articles };
}

function urlFor(article, taxonomy) {
  const cluster = taxonomy.clusters.find((c) => c.id === article.clusterId);
  const pillar = taxonomy.pillars.find((p) => p.id === cluster.pillarId);
  return { url: `/${pillar.slug}/${cluster.slug}/${article.slug}/`, pillar, cluster };
}

// ---------------------------------------------------------------- GATE (bloqueante)
// Validações automáticas da Fase 01 §8 — o build FALHA listando todas as violações.
function runGate({ articles, authors, taxonomy }) {
  const errors = [];
  const err = (id, msg) => errors.push(`[${id}] ${msg}`);
  const kw = new Map(); const titles = new Map(); const descs = new Map(); const slugs = new Map();

  for (const a of articles) {
    // taxonomia válida (TAX-1)
    const cluster = taxonomy.clusters.find((c) => c.id === a.clusterId);
    if (!cluster) { err(a.id, `clusterId inexistente: ${a.clusterId}`); continue; }
    if (!taxonomy.pillars.find((p) => p.id === cluster.pillarId)) err(a.id, 'cluster sem pillar');

    // intenção canônica (INV-1/3)
    if (!a.intent || !a.intent.primaryKeyword) err(a.id, 'sem intenção canônica (INV-1)');
    else {
      const k = a.intent.primaryKeyword.toLowerCase();
      if (kw.has(k)) err(a.id, `canibalização: primaryKeyword "${k}" já usada por ${kw.get(k)} (INV-3)`);
      kw.set(k, a.id);
    }

    // slug único
    if (slugs.has(a.slug)) err(a.id, `slug duplicado com ${slugs.get(a.slug)}`);
    slugs.set(a.slug, a.id);

    // SEO meta (§6)
    if (!a.seo || !a.seo.metaTitle) err(a.id, 'sem metaTitle');
    else {
      if (a.seo.metaTitle.length > 60) err(a.id, `metaTitle com ${a.seo.metaTitle.length} chars (máx 60)`);
      if (titles.has(a.seo.metaTitle)) err(a.id, `metaTitle duplicado com ${titles.get(a.seo.metaTitle)}`);
      titles.set(a.seo.metaTitle, a.id);
    }
    if (!a.seo || !a.seo.metaDescription) err(a.id, 'sem metaDescription');
    else {
      if (a.seo.metaDescription.length > 155) err(a.id, `metaDescription com ${a.seo.metaDescription.length} chars (máx 155)`);
      if (descs.has(a.seo.metaDescription)) err(a.id, `metaDescription duplicada com ${descs.get(a.seo.metaDescription)}`);
      descs.set(a.seo.metaDescription, a.id);
    }

    // E-E-A-T: autor com bio; datas; dek answer-first
    const author = authors.find((au) => au.id === a.authorId);
    if (!author) err(a.id, `autor inexistente: ${a.authorId}`);
    else if (!author.bio || author.bio.length < 40) err(a.id, 'bio do autor insuficiente (E-E-A-T)');
    if (!a.publishedAt) err(a.id, 'sem publishedAt');
    if (!a.dek || a.dek.length < 40) err(a.id, 'dek ausente/curto (answer-first, Princípio 15)');

    // estrutura mínima (CNT-3): ≥2 h2 e ≥1 link interno contextual
    const h2s = a.body.filter((b) => b.type === 'heading' && b.level === 2).length;
    if (h2s < 2) err(a.id, `estrutura fraca: ${h2s} h2 (mínimo 2, CNT-3)`);
    const hasInternal = JSON.stringify(a.body).includes('"article:');
    if (!hasInternal) err(a.id, 'sem link interno contextual (LINK-3)');

    // fontes citadas (Princípio 19)
    if (!a.sources || a.sources.length < 1) err(a.id, 'sem fontes citadas (Princípio 19)');
  }
  return errors;
}

// ---------------------------------------------------------------- grafo/afetados
// Rotas afetadas pela publicação de um artigo (política de âncora BUILD — ADR-0003):
// a própria rota + home + pillar hub + páginas que linkam para ele + sitemap/RSS.
function affectedRoutes(articleId, rendered, taxonomy) {
  const self = rendered.find((r) => r.article.id === articleId);
  if (!self) throw new Error(`artigo desconhecido: ${articleId}`);
  const inlinkers = rendered.filter((r) => r.edges.some((e) => e.to === articleId)).map((r) => r.url);
  return {
    content: self.url,
    fixedIndexes: ['/', `/${self.pillar.slug}/`, `/autores/`],
    inlinkers,
    feeds: ['/sitemap.xml', '/rss.xml'],
    total: 1 + 3 + inlinkers.length + 2,
  };
}

// ---------------------------------------------------------------- build
function build(opts = {}) {
  const t0 = Date.now();
  const { site, authors, taxonomy, articles } = loadAll();

  // GATE
  const gateErrors = runGate({ articles, authors, taxonomy });
  if (gateErrors.length) {
    console.error(`\n✖ GATE DE QUALIDADE FALHOU (${gateErrors.length} violações):\n`);
    for (const e of gateErrors) console.error('  ' + e);
    process.exit(1);
  }

  // hash do código compartilhado: mudou template/token → rebuild total
  const sharedHash = sha(['tokens.js', 'blocks.js', 'templates.js', 'build.js']
    .map((f) => fs.readFileSync(path.join(__dirname, f), 'utf8')).join(''));
  const prev = (!opts.force && fs.existsSync(MANIFEST)) ? readJson(MANIFEST) : { sharedHash: null, articles: {} };
  const fullRebuild = prev.sharedHash !== sharedHash;

  // resolvedor de links internos (LINK-4: alvo inexistente quebra o build)
  const byId = new Map(articles.map((a) => [a.id, a]));
  const resolve = (id) => {
    const target = byId.get(id);
    if (!target) throw new Error(`link interno para artigo inexistente: ${id} (LINK-4)`);
    return urlFor(target, taxonomy).url;
  };

  // render de todos (barato em N pequeno; o incremental decide o que ESCREVER)
  const rendered = articles.map((a) => {
    const { url, pillar, cluster } = urlFor(a, taxonomy);
    const { html, headings, edges, faq } = renderBlocks(a.body, resolve);
    a._faq = faq; a._url = url;
    const words = JSON.stringify(a.body).split(/\s+/).length;
    const readingMin = Math.max(1, Math.round(words / 220));
    return { article: a, url, pillar, cluster, html, headings, edges, readingMin };
  });

  if (opts.explain) {
    const routes = affectedRoutes(opts.explain, rendered, taxonomy);
    console.log(JSON.stringify({ explain: opts.explain, ...routes }, null, 2));
    return;
  }

  fs.mkdirSync(DIST, { recursive: true });
  const writePage = (urlPath, html) => {
    const dir = path.join(DIST, urlPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
  };

  // páginas de artigo — incremental por hash do JSON fonte
  let written = 0, skipped = 0;
  const manifest = { sharedHash, articles: {} };
  const changedIds = [];
  for (const r of rendered) {
    const h = sha(r.article._raw);
    manifest.articles[r.article.id] = h;
    if (!fullRebuild && prev.articles[r.article.id] === h) { skipped++; continue; }
    changedIds.push(r.article.id);
    const author = authors.find((au) => au.id === r.article.authorId);
    const others = rendered.filter((x) => x.cluster.id === r.cluster.id && x.article.id !== r.article.id);
    const nextStep = others.length
      ? { href: others[0].url, label: others[0].article.title, why: 'continue no tema com o próximo guia do cluster' }
      : { href: `/${r.pillar.slug}/`, label: r.pillar.title, why: 'veja o mapa completo do tema' };
    writePage(r.url, T.articlePage({ site, article: r.article, url: r.url, pillar: r.pillar, cluster: r.cluster, author, bodyHtml: r.html, headings: r.headings, readingMin: r.readingMin, nextStep }));
    written++;
  }

  // páginas quentes afetadas por mudanças (âncora BUILD): quem linka para um mudado
  if (!fullRebuild && changedIds.length) {
    const changedSet = new Set(changedIds);
    for (const r of rendered) {
      if (manifest.articles[r.article.id] === prev.articles[r.article.id] &&
          r.edges.some((e) => changedSet.has(e.to))) {
        const author = authors.find((au) => au.id === r.article.authorId);
        const others = rendered.filter((x) => x.cluster.id === r.cluster.id && x.article.id !== r.article.id);
        const nextStep = others.length
          ? { href: others[0].url, label: others[0].article.title, why: 'continue no tema com o próximo guia do cluster' }
          : { href: `/${r.pillar.slug}/`, label: r.pillar.title, why: 'veja o mapa completo do tema' };
        writePage(r.url, T.articlePage({ site, article: r.article, url: r.url, pillar: r.pillar, cluster: r.cluster, author, bodyHtml: r.html, headings: r.headings, readingMin: r.readingMin, nextStep }));
        written++; skipped--;
      }
    }
  }

  // índices (sempre regenerados: home, pillars, autores) — baratos e afetados por qualquer mudança
  const sorted = [...rendered].sort((a, b) => (b.article.updatedAt || b.article.publishedAt).localeCompare(a.article.updatedAt || a.article.publishedAt));
  writePage('/', T.homePage({ site, pillars: taxonomy.pillars, latest: sorted.map((r) => r.article).slice(0, 8) }));
  for (const p of taxonomy.pillars) {
    const clusters = taxonomy.clusters.filter((c) => c.pillarId === p.id);
    const articlesByCluster = {};
    for (const r of rendered) (articlesByCluster[r.cluster.id] ||= []).push(r.article);
    writePage(`/${p.slug}/`, T.pillarPage({ site, pillar: p, clusters, articlesByCluster }));
  }
  for (const au of authors) {
    const list = rendered.filter((r) => r.article.authorId === au.id).map((r) => r.article);
    writePage(`/autores/${au.slug}/`, T.authorPage({ site, author: au, articles: list }));
  }

  // política editorial (transparência — Fase 04 §7)
  writePage('/politica-editorial/', T.simplePage({
    site, title: 'Política editorial', path: '/politica-editorial/',
    description: 'Como produzimos, revisamos e atualizamos o conteúdo.',
    bodyHtml: site.editorialPolicyHtml,
  }));

  // 404 + robots + sitemap + RSS
  fs.writeFileSync(path.join(DIST, '404.html'), T.notFoundPage({ site }));
  fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.baseUrl}/sitemap.xml\n`);

  const urls = ['/', ...taxonomy.pillars.map((p) => `/${p.slug}/`), ...rendered.map((r) => r.url),
    ...authors.map((a) => `/autores/${a.slug}/`), '/politica-editorial/'];
  // segmentação: >50k exigiria índice de sitemaps (medido no harness); v1 cabe em 1
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `<url><loc>${site.baseUrl}${u}</loc></url>`).join('\n') + '\n</urlset>\n');

  fs.writeFileSync(path.join(DIST, 'rss.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>` +
    `<title>${esc(site.name)}</title><link>${site.baseUrl}</link><description>${esc(site.promise)}</description>` +
    sorted.slice(0, 20).map((r) =>
      `<item><title>${esc(r.article.title)}</title><link>${site.baseUrl}${r.url}</link>` +
      `<description>${esc(r.article.dek)}</description><pubDate>${new Date(r.article.publishedAt).toUTCString()}</pubDate>` +
      `<guid>${site.baseUrl}${r.url}</guid></item>`).join('') +
    `</channel></rss>\n`);

  // headers para deploy estático (CSP restritiva — SEC-1); formato _headers (Netlify/CF Pages)
  fs.writeFileSync(path.join(DIST, '_headers'), `/*
  Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; form-action 'none'
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
`);

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
  const ms = Date.now() - t0;
  console.log(`✓ build ok em ${ms}ms — artigos: ${written} regenerados, ${skipped} pulados (incremental${fullRebuild ? ' OFF: código mudou' : ' ON'}); ${urls.length} URLs no sitemap`);
}

// ---------------------------------------------------------------- CLI
const argv = process.argv.slice(2);
const opts = { force: argv.includes('--force') };
const ei = argv.indexOf('--explain');
if (ei >= 0) opts.explain = argv[ei + 1];
build(opts);
