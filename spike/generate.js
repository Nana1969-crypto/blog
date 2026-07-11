'use strict';
/*
 * SPIKE DE ESCALA — Gerador de dados sintéticos (Fase 03.1 §2)
 * CÓDIGO DESCARTÁVEL. Não é produção. Produz um dataset que exercita o modelo
 * de dados da Fase 01 sob escala, com distribuições realistas e casos-limite
 * plantados (03.1 §2.2), para os validadores locais (validate.js).
 *
 * Uso:
 *   node spike/generate.js --articles 5000 --seed 42 --out spike/out
 *   node spike/generate.js --articles 100000            # alvo do spike
 *
 * Saída: NDJSON (uma entidade por linha) — escala sem estourar memória.
 */

const fs = require('fs');
const path = require('path');
const { mulberry32, randInt, zipfIndex, articleBlockCount } = require('./lib/prng');
const { buildBody } = require('./lib/blocks');

function parseArgs(argv) {
  const a = { articles: 5000, seed: 42, out: path.join(__dirname, 'out'), linksPerArticle: 15, light: false };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--articles') a.articles = parseInt(argv[++i], 10);
    else if (k === '--seed') a.seed = parseInt(argv[++i], 10);
    else if (k === '--out') a.out = argv[++i];
    else if (k === '--links') a.linksPerArticle = parseInt(argv[++i], 10);
    else if (k === '--light') a.light = true; // 03.2: omite o corpo em blocos (projeção 1M sem estourar disco)
  }
  return a;
}

// 03.2 §2.1: tags com vocabulário power-law (poucas tags dominam).
const TAG_VOCAB_SIZE = 400;
function pickTags(rng, zipf) {
  const n = 3 + Math.floor(rng() * 6); // 3–8
  const set = new Set();
  while (set.size < n) set.add(`tag_${zipf(rng, TAG_VOCAB_SIZE)}`);
  return [...set];
}

function slugify(s, rng) {
  // Inclui, deliberadamente, uma fração de slugs com unicode/acentos (03.1 §2.2).
  const accents = rng() < 0.03 ? 'ção-áéí' : '';
  return (s + accents).toLowerCase().replace(/[^a-z0-9çãáéí-]/g, '-');
}

// Órfão plantado (sem pillar_up): função DETERMINÍSTICA de `i`, usada de forma
// idêntica no passo de content e no passo de links — garante que o marcador
// _isOrphan case exatamente com a ausência da aresta pillar_up (03.1 §2.2).
function isPlantedOrphan(i) {
  return (i * 2654435761 >>> 0) % 1000 < 5; // ~0.5%
}

// Escrita com backpressure: se o buffer do stream encher, aguarda 'drain'.
// Sem isso, 1M de artigos (~17M linhas) bufferiza na memória e estoura o heap.
function makeWriter(stream) {
  return (obj) => {
    const ok = stream.write(JSON.stringify(obj) + '\n');
    if (ok) return null;
    return new Promise((res) => stream.once('drain', res));
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const rng = mulberry32(args.seed);
  fs.mkdirSync(args.out, { recursive: true });

  const N = args.articles;
  // Proporções escaladas a partir do alvo de 100k (03.1 §2.1).
  const nPillars = Math.max(4, Math.round((N / 100000) * 40));
  const clustersPerPillar = 30;
  const nClusters = nPillars * clustersPerPillar;
  const nAuthors = Math.max(10, Math.round((N / 100000) * 3000));

  const t0 = Date.now();
  const streams = {};
  const writers = {};
  for (const name of ['pillars', 'clusters', 'authors', 'content', 'intents', 'links']) {
    streams[name] = fs.createWriteStream(path.join(args.out, `${name}.ndjson`));
    writers[name] = makeWriter(streams[name]);
  }
  const write = async (name, obj) => { const p = writers[name](obj); if (p) await p; };

  // ---- Autores (cauda longa: poucos prolíficos) ----
  for (let i = 0; i < nAuthors; i++) {
    await write('authors', {
      id: `author_${i}`,
      name: `Autor ${i}`,
      bio: `Especialista com experiência real — autor ${i}.`,
      expertiseAreas: [`pillar_${i % nPillars}`],
      avatarAssetId: `avatar_${i}`,
    });
  }

  // ---- Pillars e Clusters ----
  for (let p = 0; p < nPillars; p++) {
    await write('pillars', { id: `pillar_${p}`, slug: slugify(`tema-${p}`, rng), title: `Tema ${p}`, description: `Pilar ${p}`, order: p });
    for (let c = 0; c < clustersPerPillar; c++) {
      const cid = `cluster_${p}_${c}`;
      await write('clusters', { id: cid, pillarId: `pillar_${p}`, slug: slugify(`sub-${p}-${c}`, rng), title: `Subtema ${p}.${c}` });
    }
  }

  // ---- Content + Intents ----
  // Plantamos casos-limite: orphans, near-duplicate intents, giant cluster.
  const giantClusterId = `cluster_0_0`; // recebe uma fração desproporcional (pior caso de paginação)
  const contentIds = new Array(N);
  let plantedOrphans = 0;
  let plantedDupIntents = 0;
  let prevWasDup = false; // garante que cada dup pareie com um predecessor NÃO-dup

  for (let i = 0; i < N; i++) {
    const id = `content_${i}`;
    contentIds[i] = id;
    // ~2% dos artigos vão para o cluster gigante; resto distribuído.
    const inGiant = rng() < 0.02;
    const p = inGiant ? 0 : zipfIndex(rng, nPillars); // pillars quentes concentram conteúdo
    const c = inGiant ? 0 : randInt(rng, 0, clustersPerPillar - 1);
    const clusterId = inGiant ? giantClusterId : `cluster_${p}_${c}`;
    const author = zipfIndex(rng, nAuthors); // autores quentes publicam mais

    const type = 'article';
    const blockCount = articleBlockCount(rng);
    const body = args.light ? undefined : buildBody(rng, blockCount, { contentId: id });
    const tags = pickTags(rng, zipfIndex);

    // publishedAt/updatedAt espalhados por ~4 anos (exercita ciclo de frescor).
    const daysAgo = randInt(rng, 0, 1460);
    const publishedAt = new Date(Date.now() - daysAgo * 86400000).toISOString();
    const updatedAt = new Date(Date.now() - randInt(rng, 0, daysAgo) * 86400000).toISOString();

    // Caso-limite plantado: ~0.5% órfãos (sem pillar_up) — validador deve pegar.
    const isOrphan = isPlantedOrphan(i);
    if (isOrphan) plantedOrphans++;

    // Caso-limite plantado: ~0.4% intenções quase-duplicadas (mesma primaryKeyword).
    // Só planta se o predecessor NÃO for dup — assim keyword_${i-1} existe de fato
    // e o par é uma duplicata real (planted == detected exatamente).
    const dup = rng() < 0.004 && i > 0 && !prevWasDup;
    const primaryKeyword = dup ? `keyword_${i - 1}` : `keyword_${i}`;
    if (dup) plantedDupIntents++;
    prevWasDup = dup;

    await write('content', {
      id,
      type,
      slug: slugify(`artigo-${i}`, rng),
      clusterId,
      pillarId: `pillar_${p}`,
      title: `Artigo ${i}`,
      dek: 'Resposta essencial answer-first.',
      authorIds: [`author_${author}`],
      publishedAt,
      updatedAt,
      status: 'published',
      seo: { metaTitle: `Artigo ${i}`, metaDescription: `Desc ${i}`, canonicalUrl: `/tema-${p}/sub-${p}-${c}/artigo-${i}` },
      tags,
      blockCount,
      body,
      _isOrphan: isOrphan, // marcador só para o spike (não é campo de produção)
    });

    await write('intents', {
      id: `intent_${i}`,
      canonicalQuery: `pergunta ${i}`,
      intentType: ['informational', 'commercial', 'transactional'][randInt(rng, 0, 2)],
      funnelStage: ['ToFu', 'MoFu', 'BoFu'][randInt(rng, 0, 2)],
      primaryKeyword,
      searchVolume: randInt(rng, 10, 50000),
      difficulty: randInt(rng, 1, 100),
      businessValue: randInt(rng, 0, 3),
      canonicalContentId: id,
      status: 'covered',
    });

    if ((i + 1) % 20000 === 0) process.stderr.write(`  content ${i + 1}/${N}\n`);
  }

  // ---- Grafo de interlinking (arestas) ----
  // pillar_up (LINK-1) para não-órfãos + contextuais power-law + alguns next_step.
  let edgeCount = 0;
  const retiredTargets = new Set(); // caso-limite: links para itens "a aposentar" (LINK-4)
  for (let i = 0; i < N; i++) {
    if (rng() < 0.003) retiredTargets.add(i); // ~0.3% marcados como futuros retired
  }

  for (let i = 0; i < N; i++) {
    const from = `content_${i}`;
    // pillar_up (LINK-1), exceto para órfãos plantados — mesma função determinística
    // usada no passo de content, garantindo consistência entre marcador e aresta.
    if (!isPlantedOrphan(i)) {
      await write('links', { fromContentId: from, toContentId: `pillar_${i % nPillars}`, anchorText: 'ver pilar', relation: 'pillar_up', placement: 'body' });
      edgeCount++;
    }

    // Contextuais: alvos escolhidos por power-law (páginas quentes recebem mais inlinks).
    const nLinks = Math.max(0, Math.round(args.linksPerArticle + randInt(rng, -4, 4)));
    for (let k = 0; k < nLinks; k++) {
      let target = zipfIndex(rng, N);
      if (target === i) target = (i + 1) % N;
      const rel = rng() < 0.15 ? 'next_step' : 'contextual';
      await write('links', {
        fromContentId: from,
        toContentId: `content_${target}`,
        anchorText: `link ${k}`,
        relation: rel,
        placement: 'body',
        _toRetired: retiredTargets.has(target), // marcador de caso-limite p/ validador
      });
      edgeCount++;
    }
    if ((i + 1) % 20000 === 0) process.stderr.write(`  links ~${edgeCount}\n`);
  }

  let pending = 0;
  const done = () => {
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    const mem = Math.round(process.memoryUsage().rss / 1048576);
    const summary = {
      articles: N, pillars: nPillars, clusters: nClusters, authors: nAuthors,
      edges: edgeCount, plantedOrphans, plantedDupIntents,
      giantClusterShareApprox: '~2%', retiredTargets: retiredTargets.size,
      genSeconds: Number(secs), rssMB: mem, seed: args.seed, out: args.out,
    };
    fs.writeFileSync(path.join(args.out, 'summary.json'), JSON.stringify(summary, null, 2));
    process.stderr.write(`\nGERADO em ${secs}s | rss ${mem}MB\n`);
    process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
  };
  for (const name of Object.keys(streams)) {
    pending++;
    streams[name].end(() => { if (--pending === 0) done(); });
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
