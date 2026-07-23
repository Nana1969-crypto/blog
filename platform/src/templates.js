'use strict';
// Templates — Fase 02 §8: um objetivo por página, hierarquia controlada.
// HTML semântico, A11y AA, leitura sem JS (RENDER-2). Consomem apenas tokens.

const { tokensCss } = require('./tokens');
const { esc } = require('./blocks');

// ---- CSS base (inline no head: 1 request a menos; ~9KB) ----
const baseCss = `
*{box-sizing:border-box;margin:0}
html{font-size:112.5%}
body{font-family:var(--font-body);font-size:var(--text-base);line-height:var(--leading-body);
  color:var(--color-text);background:var(--color-bg);-webkit-font-smoothing:antialiased}
a{color:var(--color-accent);text-underline-offset:2px}
a:hover{color:var(--color-accent-hover)}
:focus-visible{outline:2px solid var(--color-focus);outline-offset:2px;border-radius:2px}
.skip-link{position:absolute;left:-9999px;top:0;background:var(--color-bg);padding:.5rem 1rem;z-index:10}
.skip-link:focus{left:0}
header.site{font-family:var(--font-ui);border-bottom:1px solid var(--color-border)}
.site-inner{max-width:64rem;margin:0 auto;padding:.9rem 1.25rem;display:flex;align-items:center;gap:1.25rem;flex-wrap:wrap}
.wordmark{font-weight:700;font-size:var(--text-lg);color:var(--color-text);text-decoration:none;letter-spacing:-.02em}
nav.pillars{display:flex;gap:1rem;flex-wrap:wrap;font-size:var(--text-sm)}
nav.pillars a{color:var(--color-text-2);text-decoration:none}
nav.pillars a:hover,nav.pillars a[aria-current]{color:var(--color-accent);text-decoration:underline}
.theme-toggle{margin-left:auto;font:inherit;font-size:var(--text-xs);cursor:pointer;
  background:var(--color-surface);color:var(--color-text);border:1px solid var(--color-border);
  border-radius:999px;padding:.35rem .8rem}
main{display:block;max-width:64rem;margin:0 auto;padding:2rem 1.25rem 4rem}
.reading{max-width:var(--measure)}
h1,h2,h3,h4{font-family:var(--font-ui);line-height:var(--leading-tight);letter-spacing:-.015em}
h1{font-size:clamp(1.9rem,4.5vw,var(--text-3xl));font-weight:700;margin:0 0 .6rem}
h2{font-size:var(--text-xl);font-weight:650;margin:2.2rem 0 .7rem}
h3{font-size:var(--text-lg);font-weight:650;margin:1.6rem 0 .5rem}
p,ul,ol{margin:0 0 1em}
li{margin:.3em 0}
ul,ol{padding-left:1.4rem}
.dek{font-size:var(--text-lg);color:var(--color-text-2);margin:0 0 1.1rem}
.meta{font-family:var(--font-ui);font-size:var(--text-xs);color:var(--color-text-2);
  display:flex;gap:.9rem;flex-wrap:wrap;margin-bottom:1.6rem}
.breadcrumb{font-family:var(--font-ui);font-size:var(--text-xs);margin-bottom:1.1rem}
.breadcrumb ol{list-style:none;padding:0;display:flex;gap:.4rem;flex-wrap:wrap}
.breadcrumb li+li::before{content:"›";margin-right:.4rem;color:var(--color-text-2)}
.breadcrumb a{color:var(--color-text-2)}
.article-grid{display:grid;grid-template-columns:1fr;gap:2.5rem}
.article-grid>*{min-width:0}
@media(min-width:64rem){.article-grid{grid-template-columns:minmax(0,var(--measure)) 15rem}}
.toc{font-family:var(--font-ui);font-size:var(--text-xs);align-self:start;order:-1}
@media(min-width:64rem){.toc{order:1;position:sticky;top:1.5rem}}
.toc-box{border:1px solid var(--color-border);border-radius:var(--radius);padding:1rem;background:var(--color-surface)}
.toc h2{margin:0 0 .5rem;font-size:var(--text-xs);text-transform:uppercase;letter-spacing:.06em;color:var(--color-text-2)}
.toc ol{list-style:none;padding:0;margin:0}
.toc a{text-decoration:none;color:var(--color-text-2);display:block;padding:.18rem 0}
.toc a:hover{color:var(--color-accent)}
.toc .lvl3{padding-left:.9rem}
.callout{border-radius:var(--radius);padding:.85rem 1rem;margin:0 0 1em;background:var(--color-surface);
  border:1px solid var(--color-border)}
.callout-tip{background:var(--color-callout-tip-bg);color:var(--color-callout-tip-fg);border-color:transparent}
.callout-warn{background:var(--color-callout-warn-bg);color:var(--color-callout-warn-fg);border-color:transparent}
.table-wrap{overflow-x:auto;margin:0 0 1em}
table{border-collapse:collapse;font-family:var(--font-ui);font-size:var(--text-sm);min-width:100%}
caption{text-align:left;font-size:var(--text-xs);color:var(--color-text-2);padding-bottom:.4rem}
th,td{border:1px solid var(--color-border);padding:.5rem .7rem;text-align:left;vertical-align:top}
th{background:var(--color-surface)}
pre{background:var(--color-code-bg);border:1px solid var(--color-border);border-radius:var(--radius);
  padding:1rem;overflow-x:auto;margin:0 0 1em;font-size:var(--text-sm)}
code{font-family:var(--font-mono);font-size:.92em}
blockquote{border-left:3px solid var(--color-accent);padding:.2rem 0 .2rem 1.1rem;margin:0 0 1em;color:var(--color-text-2)}
blockquote footer{font-family:var(--font-ui);font-size:var(--text-xs);margin-top:.4rem}
figure{margin:0 0 1em}
figure img{max-width:100%;height:auto;border-radius:var(--radius)}
figcaption{font-family:var(--font-ui);font-size:var(--text-xs);color:var(--color-text-2);margin-top:.45rem}
.diagram svg{max-width:100%;height:auto}
.faq-item{border:1px solid var(--color-border);border-radius:var(--radius);margin:0 0 .6rem;background:var(--color-surface)}
.faq-item summary{cursor:pointer;font-family:var(--font-ui);font-weight:600;font-size:var(--text-sm);padding:.8rem 1rem}
.faq-item p{padding:0 1rem 1rem}
hr{border:0;border-top:1px solid var(--color-border);margin:2rem 0}
.next-step{margin-top:2.6rem;border:1px solid var(--color-border);border-radius:var(--radius);
  padding:1.2rem 1.3rem;background:var(--color-surface);font-family:var(--font-ui)}
.next-step h2{margin:0 0 .4rem;font-size:var(--text-lg)}
.next-step p{margin:0;font-size:var(--text-sm);color:var(--color-text-2)}
.sources{margin-top:2.4rem;font-size:var(--text-sm)}
.sources h2{font-size:var(--text-lg)}
.sources ol{color:var(--color-text-2)}
.card-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(16rem,1fr));padding:0;list-style:none}
.card{border:1px solid var(--color-border);border-radius:var(--radius);padding:1.1rem 1.2rem;background:var(--color-surface)}
.card h2,.card h3{margin:0 0 .35rem;font-size:var(--text-lg)}
.card p{margin:0;font-size:var(--text-sm);color:var(--color-text-2)}
.card a{text-decoration:none;color:var(--color-text)}
.card a:hover{color:var(--color-accent)}
.hero{padding:2.2rem 0 1.4rem}
.hero p{font-size:var(--text-lg);color:var(--color-text-2);max-width:var(--measure)}
.list-plain{list-style:none;padding:0}
.list-plain li{border-bottom:1px solid var(--color-border);padding:.85rem 0}
.list-plain .t{font-family:var(--font-ui);font-weight:600;text-decoration:none;color:var(--color-text)}
.list-plain .t:hover{color:var(--color-accent)}
.list-plain .d{font-size:var(--text-sm);color:var(--color-text-2);margin:.15rem 0 0}
footer.site{border-top:1px solid var(--color-border);font-family:var(--font-ui);font-size:var(--text-xs);color:var(--color-text-2)}
footer.site .site-inner{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding:1.4rem 1.25rem}
footer.site a{color:var(--color-text-2)}
@media (prefers-reduced-motion: no-preference){a,button{transition:color var(--motion-fast) ease}}
`;

// Toggle de tema: precisa rodar ANTES do paint para não piscar (Fase 02 §4.2).
const themeScript = `(function(){try{var t=localStorage.getItem('theme');
if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}})();`;
const toggleScript = `(function(){var b=document.querySelector('.theme-toggle');if(!b)return;
b.addEventListener('click',function(){var d=document.documentElement;
var cur=d.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
var nx=cur==='dark'?'light':'dark';d.setAttribute('data-theme',nx);
try{localStorage.setItem('theme',nx)}catch(e){}});})();`;

function baseLayout({ site, title, description, canonicalPath, jsonld = [], body, currentPillar }) {
  const canonical = site.baseUrl + canonicalPath;
  const nav = site.pillars.map((p) =>
    `<a href="/${p.slug}/"${currentPillar === p.slug ? ' aria-current="page"' : ''}>${esc(p.title)}</a>`).join('');
  const ld = jsonld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230b5cc4'/%3E%3Cpath d='M9 10h14M9 16h14M9 22h9' stroke='white' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E">
<link rel="alternate" type="application/rss+xml" title="${esc(site.name)}" href="/rss.xml">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<script>${themeScript}</script>
<style>${tokensCss()}${baseCss}</style>
${ld}
</head>
<body>
<a class="skip-link" href="#conteudo">Skip to content</a>
<header class="site"><div class="site-inner">
<a class="wordmark" href="/">${esc(site.name)}</a>
<nav class="pillars" aria-label="Topics">${nav}</nav>
<button class="theme-toggle" type="button" aria-label="Toggle light/dark theme">Theme</button>
</div></header>
<main id="conteudo">
${body}
</main>
<footer class="site"><div class="site-inner">
<span>© ${new Date().getFullYear()} ${esc(site.name)} — structured content, open to scrutiny.</span>
<span><a href="/editorial-policy/">Editorial policy</a> · <a href="/rss.xml">RSS</a></span>
</div></footer>
<script>${toggleScript}</script>
</body>
</html>`;
}

function breadcrumb(items) {
  const lis = items.map((it, i) =>
    it.href && i < items.length - 1
      ? `<li><a href="${esc(it.href)}">${esc(it.label)}</a></li>`
      : `<li aria-current="page">${esc(it.label)}</li>`).join('');
  return `<nav class="breadcrumb" aria-label="You are here"><ol>${lis}</ol></nav>`;
}

function tocHtml(headings) {
  const h2s = headings.filter((h) => h.level <= 3);
  if (h2s.length < 3) return '';
  const lis = h2s.map((h) =>
    `<li${h.level === 3 ? ' class="lvl3"' : ''}><a href="#${esc(h.anchor)}">${esc(h.text)}</a></li>`).join('');
  return `<aside class="toc" aria-label="In this article"><div class="toc-box"><h2>In this article</h2><ol>${lis}</ol></div></aside>`;
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

function articlePage({ site, article, url, pillar, cluster, author, bodyHtml, headings, readingMin, nextStep }) {
  const bc = breadcrumb([
    { label: 'Home', href: '/' },
    { label: pillar.title, href: `/${pillar.slug}/` },
    { label: article.title },
  ]);
  const updated = article.updatedAt && article.updatedAt !== article.publishedAt
    ? `<span>Updated <time datetime="${article.updatedAt}">${fmtDate(article.updatedAt)}</time></span>` : '';
  const body = `
${bc}
<div class="article-grid">
<article class="reading">
<h1>${esc(article.title)}</h1>
<p class="dek">${esc(article.dek)}</p>
<div class="meta">
<span>By <a href="/authors/${esc(author.slug)}/">${esc(author.name)}</a></span>
<span>Published <time datetime="${article.publishedAt}">${fmtDate(article.publishedAt)}</time></span>
${updated}
<span>${readingMin} min read</span>
</div>
${bodyHtml}
${article.sources && article.sources.length ? `<section class="sources"><h2 id="sources">Sources and references</h2><ol>${
  article.sources.map((s) => `<li>${s.url ? `<a href="${esc(s.url)}" rel="noopener noreferrer">${esc(s.label)}</a>` : esc(s.label)}</li>`).join('')
}</ol></section>` : ''}
<aside class="next-step"><h2>Next step</h2><p><a href="${esc(nextStep.href)}">${esc(nextStep.label)}</a> — ${esc(nextStep.why)}</p></aside>
</article>
${tocHtml(headings)}
</div>`;
  return baseLayout({
    site, title: article.seo.metaTitle, description: article.seo.metaDescription,
    canonicalPath: url, currentPillar: pillar.slug,
    jsonld: articleJsonLd({ site, article, url, pillar, author }),
    body,
  });
}

function articleJsonLd({ site, article, url, pillar, author }) {
  const ld = [{
    '@context': 'https://schema.org', '@type': 'Article',
    headline: article.title, description: article.dek,
    datePublished: article.publishedAt, dateModified: article.updatedAt || article.publishedAt,
    inLanguage: 'pt-BR',
    mainEntityOfPage: site.baseUrl + url,
    author: { '@type': author.type || 'Person', name: author.name, url: `${site.baseUrl}/authors/${author.slug}/` },
    publisher: { '@type': 'Organization', name: site.name, url: site.baseUrl },
  }, {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: site.baseUrl + '/' },
      { '@type': 'ListItem', position: 2, name: pillar.title, item: `${site.baseUrl}/${pillar.slug}/` },
      { '@type': 'ListItem', position: 3, name: article.title, item: site.baseUrl + url },
    ],
  }];
  if (article._faq && article._faq.length) {
    ld.push({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: article._faq.map((f) => ({
        '@type': 'Question', name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: typeof f.answerRichText === 'string' ? f.answerRichText : f.answerRichText.map((s) => typeof s === 'string' ? s : (s.b || s.i || s.code || (s.link && s.link.text) || '')).join('') },
      })),
    });
  }
  return ld;
}

function pillarPage({ site, pillar, clusters, articlesByCluster }) {
  const sections = clusters.map((c) => {
    const arts = (articlesByCluster[c.id] || []);
    const lis = arts.map((a) => `<li><a class="t" href="${esc(a._url)}">${esc(a.title)}</a><p class="d">${esc(a.dek)}</p></li>`).join('');
    return `<section aria-labelledby="c-${esc(c.slug)}"><h2 id="c-${esc(c.slug)}">${esc(c.title)}</h2><ul class="list-plain">${lis}</ul></section>`;
  }).join('\n');
  const body = `
${breadcrumb([{ label: 'Home', href: '/' }, { label: pillar.title }])}
<div class="reading hero"><h1>${esc(pillar.title)}</h1><p>${esc(pillar.description)}</p></div>
<div class="reading">${sections}</div>`;
  return baseLayout({
    site, title: `${pillar.title} — ${site.name}`, description: pillar.description,
    canonicalPath: `/${pillar.slug}/`, currentPillar: pillar.slug,
    jsonld: [{
      '@context': 'https://schema.org', '@type': 'CollectionPage',
      name: pillar.title, description: pillar.description, inLanguage: 'pt-BR',
      isPartOf: { '@type': 'WebSite', name: site.name, url: site.baseUrl },
    }],
    body,
  });
}

function homePage({ site, pillars, latest }) {
  const cards = pillars.map((p) =>
    `<li class="card"><h2><a href="/${p.slug}/">${esc(p.title)}</a></h2><p>${esc(p.description)}</p></li>`).join('');
  const lis = latest.map((a) =>
    `<li><a class="t" href="${esc(a._url)}">${esc(a.title)}</a><p class="d">${esc(a.dek)}</p></li>`).join('');
  const body = `
<div class="hero reading"><h1>${esc(site.tagline)}</h1><p>${esc(site.promise)}</p></div>
<section aria-label="Topics"><ul class="card-grid">${cards}</ul></section>
<section class="reading" aria-labelledby="recentes"><h2 id="recent">Featured guides</h2><ul class="list-plain">${lis}</ul></section>`;
  return baseLayout({
    site, title: `${site.name} — ${site.tagline}`, description: site.promise,
    canonicalPath: '/',
    jsonld: [{
      '@context': 'https://schema.org', '@type': 'WebSite',
      name: site.name, url: site.baseUrl, inLanguage: 'pt-BR',
      publisher: { '@type': 'Organization', name: site.name, url: site.baseUrl },
    }],
    body,
  });
}

function authorPage({ site, author, articles }) {
  const lis = articles.map((a) =>
    `<li><a class="t" href="${esc(a._url)}">${esc(a.title)}</a><p class="d">${esc(a.dek)}</p></li>`).join('');
  const body = `
${breadcrumb([{ label: 'Home', href: '/' }, { label: author.name }])}
<div class="reading hero"><h1>${esc(author.name)}</h1><p>${esc(author.bio)}</p></div>
<div class="reading"><h2>Articles</h2><ul class="list-plain">${lis}</ul></div>`;
  return baseLayout({
    site, title: `${author.name} — ${site.name}`, description: author.bio,
    canonicalPath: `/authors/${author.slug}/`,
    jsonld: [{
      '@context': 'https://schema.org', '@type': author.type || 'Person',
      name: author.name, description: author.bio, url: `${site.baseUrl}/authors/${author.slug}/`,
    }],
    body,
  });
}

function simplePage({ site, title, description, path, bodyHtml }) {
  const body = `${breadcrumb([{ label: 'Home', href: '/' }, { label: title }])}
<div class="reading hero"><h1>${esc(title)}</h1></div><div class="reading">${bodyHtml}</div>`;
  return baseLayout({ site, title: `${title} — ${site.name}`, description, canonicalPath: path, body });
}

function notFoundPage({ site }) {
  const body = `<div class="reading hero"><h1>Page not found</h1>
<p>This address may have changed. Go back to the <a href="/">home page</a> or explore the topics in the menu.</p></div>`;
  return baseLayout({ site, title: `Page not found — ${site.name}`, description: 'Error 404', canonicalPath: '/404.html', body });
}

module.exports = { articlePage, pillarPage, homePage, authorPage, simplePage, notFoundPage, fmtDate };
