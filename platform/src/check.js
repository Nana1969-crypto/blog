'use strict';
// Verificação pós-build (Fase 07): falha com exit≠0 se qualquer checagem violar.
//  1. Links internos resolvem para arquivos no dist (zero broken links)
//  2. Toda <img> tem alt; headings sem pulo de nível; exatamente 1 h1/página
//  3. JSON-LD parseia e tem @type
//  4. <title> e meta description presentes e únicos
//  5. Contraste AA COMPUTADO para os pares de token em ambos os temas (COLOR-1)
//  6. Orçamento de JS inline por página (RENDER-2)

const fs = require('fs');
const path = require('path');
const { themes, contrastPairs, contrastRatio } = require('./tokens');

const DIST = path.join(__dirname, '..', 'dist');
const problems = [];
const prob = (f, msg) => problems.push(`${f}: ${msg}`);

function* htmlFiles(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* htmlFiles(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

// ---- 5. contraste AA por tema (independe das páginas) ----
for (const [name, t] of Object.entries(themes)) {
  for (const [fg, bg, min] of contrastPairs(t)) {
    const r = contrastRatio(fg, bg);
    if (r < min) prob(`tokens[${name}]`, `contraste ${fg}/${bg} = ${r.toFixed(2)} < ${min} (COLOR-1)`);
  }
}

const titles = new Map();
let pages = 0, totalJsBytes = 0;

for (const file of htmlFiles(DIST)) {
  pages++;
  const rel = path.relative(DIST, file);
  const html = fs.readFileSync(file, 'utf8');

  // 1. links internos
  for (const m of html.matchAll(/href="(\/[^"#]*)"/g)) {
    const href = m[1];
    if (href.startsWith('//')) continue;
    const clean = href.split('?')[0];
    const target = clean.endsWith('/') ? path.join(DIST, clean, 'index.html') : path.join(DIST, clean);
    if (!fs.existsSync(target)) prob(rel, `link interno quebrado: ${href}`);
  }

  // 2. imgs com alt + headings
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt="/.test(m[0])) prob(rel, `img sem alt: ${m[0].slice(0, 60)}`);
  }
  const hs = [...html.matchAll(/<h([1-4])[\s>]/g)].map((m) => Number(m[1]));
  const h1s = hs.filter((h) => h === 1).length;
  if (h1s !== 1) prob(rel, `${h1s} h1 na página (esperado 1)`);
  let prev = 1;
  for (const h of hs) {
    if (h > prev + 1) prob(rel, `pulo de heading: h${prev} → h${h}`);
    prev = h;
  }

  // 3. JSON-LD
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const o = JSON.parse(m[1]);
      if (!o['@type']) prob(rel, 'JSON-LD sem @type');
    } catch { prob(rel, 'JSON-LD inválido (não parseia)'); }
  }

  // 4. title/description únicos
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  if (!title) prob(rel, 'sem <title>');
  else if (titles.has(title) && rel !== '404.html') prob(rel, `title duplicado com ${titles.get(title)}`);
  else titles.set(title, rel);
  if (!/<meta name="description" content="[^"]+"/.test(html)) prob(rel, 'sem meta description');

  // 6. orçamento de JS inline (exclui JSON-LD, que não é executável)
  let js = 0;
  for (const m of html.matchAll(/<script(?![^>]*ld\+json)[^>]*>([\s\S]*?)<\/script>/g)) js += m[1].length;
  totalJsBytes = Math.max(totalJsBytes, js);
  if (js > 2048) prob(rel, `JS inline ${js}B > orçamento 2048B (RENDER-2)`);
}

if (problems.length) {
  console.error(`\n✖ CHECK FALHOU (${problems.length} problemas):\n`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log(`✓ check ok — ${pages} páginas: links íntegros, alt ok, headings ok, JSON-LD válido, titles únicos, contraste AA (2 temas) verificado, JS máx/página ${totalJsBytes}B`);
