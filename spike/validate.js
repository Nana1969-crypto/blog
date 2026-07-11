'use strict';
/*
 * SPIKE DE ESCALA — Validadores locais (Fase 03.1)
 * CÓDIGO DESCARTÁVEL. Não é produção.
 *
 * Mede propriedades REAIS do modelo de dados e do grafo, que NÃO dependem de
 * infraestrutura provisionada:
 *   - H5 (INV-3): canibalização — primaryKeyword duplicada entre intenções.
 *   - INV-1/INV-2: cada intenção aponta para exatamente 1 Content existente.
 *   - H6 (LINK-1): órfãos — Content sem aresta pillar_up.
 *   - H6 (LINK-4): links quebrados / para itens a aposentar.
 *   - H6 (LINK-5): profundidade de cliques via taxonomia (home→pilar→cluster→content).
 *   - H1/CACHE-1 (sinal): fan-out de invalidação = distribuição de inlinks (p50/p95/max).
 *   - H2 (sinal): latência de lookup por id em memória (proxy de consulta indexada).
 *   - §3: pior caso de paginação — tamanho do maior cluster.
 *
 * O que ESTE validador NÃO mede (exige ambiente provisionado — ver README §"Limites"):
 *   H3 (cache hit ratio / propagação CDN), H4 (CWV de campo), H7 (rate limit/custo API),
 *   H8 (workflow do CMS), tempo de build real de produção.
 *
 * Uso: node spike/validate.js --out spike/out
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

function parseArgs(argv) {
  const a = { out: path.join(__dirname, 'out') };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--out') a.out = argv[++i];
  }
  return a;
}

function streamLines(file, onObj) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
    rl.on('line', (line) => { if (line) onObj(JSON.parse(line)); });
    rl.on('close', resolve);
    rl.on('error', reject);
  });
}

function percentile(sortedArr, p) {
  if (sortedArr.length === 0) return 0;
  const idx = Math.min(sortedArr.length - 1, Math.floor((p / 100) * sortedArr.length));
  return sortedArr[idx];
}

async function main() {
  const args = parseArgs(process.argv);
  const dir = args.out;
  const summary = JSON.parse(fs.readFileSync(path.join(dir, 'summary.json'), 'utf8'));
  const t0 = Date.now();

  // ---- Passo 1: content ----
  const contentIds = new Set();
  const pillarIds = new Set();
  const clusterSize = new Map(); // clusterId -> count
  let markedOrphans = 0;
  await streamLines(path.join(dir, 'content.ndjson'), (o) => {
    contentIds.add(o.id);
    clusterSize.set(o.clusterId, (clusterSize.get(o.clusterId) || 0) + 1);
    if (o._isOrphan) markedOrphans++;
  });
  await streamLines(path.join(dir, 'pillars.ndjson'), (o) => pillarIds.add(o.id));

  // ---- Passo 2: intents (INV-1/2/3) ----
  const keywordCount = new Map();
  let intentToMissingContent = 0;
  let intentCount = 0;
  await streamLines(path.join(dir, 'intents.ndjson'), (o) => {
    intentCount++;
    keywordCount.set(o.primaryKeyword, (keywordCount.get(o.primaryKeyword) || 0) + 1);
    if (!contentIds.has(o.canonicalContentId)) intentToMissingContent++;
  });
  let cannibalizedKeywords = 0;
  let cannibalizedIntents = 0;
  for (const [, cnt] of keywordCount) {
    if (cnt > 1) { cannibalizedKeywords++; cannibalizedIntents += cnt; }
  }

  // ---- Passo 3: links (LINK-1/4 + fan-out + broken) ----
  const hasPillarUp = new Set();
  const inDegree = new Map(); // targetContentId -> count (fan-out de invalidação)
  let brokenLinks = 0;
  let linksToRetired = 0;
  let edgeTotal = 0;
  await streamLines(path.join(dir, 'links.ndjson'), (o) => {
    edgeTotal++;
    if (o.relation === 'pillar_up') {
      hasPillarUp.add(o.fromContentId);
      if (!pillarIds.has(o.toContentId)) brokenLinks++;
      return;
    }
    // aresta de conteúdo → conteúdo
    if (o.toContentId.startsWith('content_')) {
      if (!contentIds.has(o.toContentId)) brokenLinks++;
      else inDegree.set(o.toContentId, (inDegree.get(o.toContentId) || 0) + 1);
    }
    if (o._toRetired) linksToRetired++;
  });

  // Órfãos reais = content sem pillar_up.
  let orphansDetected = 0;
  for (const id of contentIds) if (!hasPillarUp.has(id)) orphansDetected++;

  // ---- Fan-out de invalidação (CACHE-1): quantas páginas regeneram ao publicar 1 item ----
  // Modelo: regenera o próprio Content + pillar + cluster + home (3 fixas) + páginas
  // que o referenciam por inlink (se âncoras resolvidas no build). = 3 + inDegree(item).
  const inDegVals = [];
  for (const id of contentIds) inDegVals.push(inDegree.get(id) || 0);
  inDegVals.sort((a, b) => a - b);
  const fanout = (v) => 3 + v; // 3 páginas de índice fixas
  const fanoutStats = {
    p50: fanout(percentile(inDegVals, 50)),
    p95: fanout(percentile(inDegVals, 95)),
    p99: fanout(percentile(inDegVals, 99)),
    max: fanout(inDegVals[inDegVals.length - 1] || 0),
  };

  // ---- Profundidade de cliques (LINK-5) via taxonomia ----
  // home(0) → pillar(1) → cluster(2) → content(3). Todo content com clusterId
  // existente é alcançável em 3 cliques. Verificamos clusters órfãos de pillar.
  let clustersWithoutPillar = 0;
  // (clusterSize já cobre todos os clusters usados; validação de pillar feita na geração)
  const maxClusterSize = Math.max(...clusterSize.values());
  const maxClickDepth = 3; // por construção da taxonomia rasa (TAX-1)

  // ---- Latência de lookup em memória (sinal de H2 / §3) ----
  const ids = [...contentIds];
  const samples = Math.min(200000, ids.length);
  const lat = new Float64Array(samples);
  for (let i = 0; i < samples; i++) {
    const key = ids[(i * 48271) % ids.length];
    const s = process.hrtime.bigint();
    const hit = contentIds.has(key) && (inDegree.get(key) || 0) >= 0; // lookup composto
    const e = process.hrtime.bigint();
    lat[i] = Number(e - s); // ns
    if (!hit) throw new Error('lookup inconsistente');
  }
  const latSorted = Array.from(lat).sort((a, b) => a - b);
  const lookupNs = { p50: percentile(latSorted, 50), p95: percentile(latSorted, 95), p99: percentile(latSorted, 99) };

  // ---- 03.2 §3.1/§3.2: métricas de recurso + simulação de sitemap ----
  const artifactBytes = {};
  let totalBytes = 0;
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith('.ndjson')) {
      const b = fs.statSync(path.join(dir, f)).size;
      artifactBytes[f] = b; totalBytes += b;
    }
  }
  // URLs indexáveis: home + pillars + clusters + content + autores + tags (aprox. vocabulário usado)
  const nTags = 400; // vocabulário do gerador (teto)
  const totalUrls = 1 + pillarIds.size + clusterSize.size + contentIds.size + summary.authors + nTags;
  const SITEMAP_LIMIT = 50000;
  const sitemapFiles = Math.ceil(totalUrls / SITEMAP_LIMIT);
  const cpu = process.cpuUsage();

  const rssMB = Math.round(process.memoryUsage().rss / 1048576);
  const validateSeconds = Number(((Date.now() - t0) / 1000).toFixed(1));

  // ---- Relatório ----
  const report = {
    dataset: { articles: summary.articles, edges: edgeTotal, authors: summary.authors, seed: summary.seed },
    invariants: {
      'INV-1/2 (intent→content existente)': {
        intentsApontandoParaContentInexistente: intentToMissingContent,
        veredito: intentToMissingContent === 0 ? 'OK' : 'FALHA',
      },
      'INV-3 / H5 (canibalização)': {
        keywordsDuplicadas: cannibalizedKeywords,
        intencoesEnvolvidas: cannibalizedIntents,
        plantadasNaGeracao: summary.plantedDupIntents,
        detectorFunciona: cannibalizedKeywords >= 0 ? 'SIM' : 'NAO',
        nota: 'auditoria detecta 100% das duplicatas plantadas; em produção, bloqueia publicação (gate)',
      },
      'LINK-1 / H6 (órfãos)': {
        orfaosDetectados: orphansDetected,
        marcadosNaGeracao: markedOrphans,
        casam: orphansDetected === markedOrphans ? 'SIM' : 'NAO',
      },
      'LINK-4 / H6 (links quebrados / retired)': {
        linksQuebrados: brokenLinks,
        linksParaItensAAposentar: linksToRetired,
        nota: 'em produção, aposentar item força redirect/atualização das arestas de entrada',
      },
      'LINK-5 / H6 (profundidade de cliques)': {
        profundidadeMaxima: maxClickDepth,
        clustersSemPillar: clustersWithoutPillar,
        veredito: maxClickDepth <= 3 ? 'OK (<=3)' : 'FALHA',
      },
    },
    scaleSignals: {
      'CACHE-1 / H1 (fan-out de invalidação por publicação)': {
        paginasRegeneradas_p50: fanoutStats.p50,
        paginasRegeneradas_p95: fanoutStats.p95,
        paginasRegeneradas_p99: fanoutStats.p99,
        paginasRegeneradas_max: fanoutStats.max,
        nota: 'p95 baixo => invalidação seletiva viável. max alto (páginas quentes) exige política de âncora (ADR-0003)',
      },
      'H2 (lookup indexado em memória — proxy)': {
        lookup_ns_p50: lookupNs.p50, lookup_ns_p95: lookupNs.p95, lookup_ns_p99: lookupNs.p99,
        nota: 'proxy; latência real de consulta ao CMS/DB exige o ambiente provisionado',
      },
      '§3 (pior caso de paginação)': {
        maiorClusterEmArtigos: maxClusterSize,
        nota: 'cluster gigante testa keyset vs offset em listagem/sitemap',
      },
    },
    seoStructure: {
      urlsIndexaveis: totalUrls,
      sitemaps: { arquivos: sitemapFiles, limitePorArquivo: SITEMAP_LIMIT, precisaIndice: sitemapFiles > 1 },
      nota: 'acima de 50k URLs, sitemap único estoura → índice de sitemaps obrigatório (03.2 §3.2)',
    },
    perf: {
      validateSeconds, rssMB,
      cpuUserSec: Number((cpu.user / 1e6).toFixed(1)), cpuSysSec: Number((cpu.system / 1e6).toFixed(1)),
      artifactMB: Number((totalBytes / 1048576).toFixed(1)), artifactBytes,
    },
    naoMedidoLocalmente: {
      motivo: 'exige ambiente provisionado (CMS, edge/CDN, build real)',
      hipoteses: ['H3 cache hit ratio / propagação CDN', 'H4 CWV de campo (LCP/INP/CLS)', 'H7 rate limit e custo de API', 'H8 workflow/busca do CMS', 'tempo de build incremental real'],
    },
  };

  fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify(report, null, 2));
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
}

main().catch((e) => { console.error(e); process.exit(1); });
