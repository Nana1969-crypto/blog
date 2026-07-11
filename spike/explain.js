'use strict';
/*
 * SPIKE 03.2 §3.4 — Modo EXPLAIN de invalidação (CÓDIGO DESCARTÁVEL)
 * Para um Content dado, lista as ROTAS EXATAS que uma publicação/atualização
 * purga e regenera, derivadas do grafo (CACHE-1 / ADR-0003):
 *   1. a própria rota do Content;
 *   2. índices fixos afetados: home, pillar hub, cluster hub;
 *   3. sitemap segmentado que contém a URL;
 *   4. páginas que o referenciam por inlink (se âncoras resolvidas no build).
 *
 * Uso: node spike/explain.js --out spike/out_100000 --content content_123 [--anchors build|runtime]
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');

function parseArgs(argv) {
  const a = { out: path.join(__dirname, 'out'), content: 'content_0', anchors: 'build' };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--out') a.out = argv[++i];
    else if (argv[i] === '--content') a.content = argv[++i];
    else if (argv[i] === '--anchors') a.anchors = argv[++i];
  }
  return a;
}

function streamLines(file, onObj) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
    rl.on('line', (l) => { if (l) onObj(JSON.parse(l)); });
    rl.on('close', resolve); rl.on('error', reject);
  });
}

async function main() {
  const args = parseArgs(process.argv);
  const t0 = Date.now();

  let target = null;
  await streamLines(path.join(args.out, 'content.ndjson'), (o) => { if (o.id === args.content) target = o; });
  if (!target) { console.error(`Content ${args.content} não encontrado`); process.exit(1); }

  // Inlinks: quem aponta para o alvo (só relevante se âncoras resolvidas no build).
  const inlinkSources = new Set();
  await streamLines(path.join(args.out, 'links.ndjson'), (o) => {
    if (o.toContentId === args.content && o.relation !== 'pillar_up') inlinkSources.add(o.fromContentId);
  });

  const routes = {
    contentRoute: target.seo.canonicalUrl,
    fixedIndexes: ['/', `/pillar:${target.pillarId}`, `/cluster:${target.clusterId}`],
    sitemapSegment: `sitemap-${Math.floor(parseInt(args.content.split('_')[1], 10) / 50000)}.xml`,
    anchorPolicy: args.anchors,
    inlinkFanout: args.anchors === 'build' ? inlinkSources.size : 0,
    inlinkSample: args.anchors === 'build' ? [...inlinkSources].slice(0, 10) : [],
  };
  const totalRoutes = 1 + routes.fixedIndexes.length + 1 + routes.inlinkFanout;

  console.log(JSON.stringify({
    explain: `publicar/atualizar ${args.content}`,
    ...routes,
    totalRoutesToRegenerate: totalRoutes,
    elapsedSec: Number(((Date.now() - t0) / 1000).toFixed(1)),
    nota: args.anchors === 'build'
      ? 'política BUILD: mudanças de título propagam para páginas com inlink (fan-out acima)'
      : 'política RUNTIME: âncoras resolvidas na entrega; fan-out de regeneração = 0 inlinks (custo movido para o serve)',
  }, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
