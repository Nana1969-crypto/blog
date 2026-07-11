#!/usr/bin/env bash
# SPIKE 03.2 §1 — série de escala reproduzível (CÓDIGO DESCARTÁVEL)
# Uso: bash spike/run-series.sh [--with-1m]
set -euo pipefail
cd "$(dirname "$0")/.."

SCALES=(1000 10000 50000 100000)
LIGHT=""
if [[ "${1:-}" == "--with-1m" ]]; then SCALES+=(1000000); fi

echo "scale,mode,gen_s,gen_rssMB,val_s,val_rssMB,cpu_user_s,artifact_MB,fo_p50,fo_p95,fo_max,lookup_p95_ns,max_cluster,urls,sitemaps,orphans_ok,dup_ok"
for N in "${SCALES[@]}"; do
  DIR="spike/out_$N"
  MODE="full"; EXTRA=""
  if [[ "$N" -ge 1000000 ]]; then MODE="light"; EXTRA="--light"; fi
  node --max-old-space-size=7000 spike/generate.js --articles "$N" --seed 42 --out "$DIR" $EXTRA >/dev/null 2>&1
  node --max-old-space-size=7000 spike/validate.js --out "$DIR" >/dev/null 2>&1
  node -e "
    const s=require('./$DIR/summary.json'), r=require('./$DIR/report.json');
    const f=r.scaleSignals['CACHE-1 / H1 (fan-out de invalidação por publicação)'];
    const l=r.scaleSignals['H2 (lookup indexado em memória — proxy)'];
    const c=r.scaleSignals['§3 (pior caso de paginação)'];
    const o=r.invariants['LINK-1 / H6 (órfãos)'];
    const d=r.invariants['INV-3 / H5 (canibalização)'];
    console.log(['$N','$MODE',s.genSeconds,s.rssMB,r.perf.validateSeconds,r.perf.rssMB,r.perf.cpuUserSec,r.perf.artifactMB,
      f.paginasRegeneradas_p50,f.paginasRegeneradas_p95,f.paginasRegeneradas_max,l.lookup_ns_p95,
      c.maiorClusterEmArtigos,r.seoStructure.urlsIndexaveis,r.seoStructure.sitemaps.arquivos,
      o.casam,(d.keywordsDuplicadas===d.plantadasNaGeracao)?'SIM':'NAO'].join(','));
  "
done
