'use strict';
// PRNG determinístico (mulberry32) — reprodutibilidade entre execuções e fornecedores.
// Spike descartável: qualidade estatística "boa o suficiente", não criptográfica.

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Amostra um inteiro em [min, max].
function randInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

// Escolhe um índice com viés power-law (Zipf-like): poucos itens "quentes"
// concentram a maioria das referências — replica a realidade de SEO/links.
// Retorna índice em [0, n).
function zipfIndex(rng, n, exponent = 1.07) {
  // Inversão aproximada: u^(1/(1+exp)) mapeia para a cauda longa.
  const u = rng();
  const idx = Math.floor(Math.pow(u, exponent) * n);
  return idx >= n ? n - 1 : idx;
}

// Distribuição de tamanho de artigo: mistura de peças curtas e guias longos.
function articleBlockCount(rng) {
  const r = rng();
  if (r < 0.6) return randInt(rng, 12, 30); // maioria: artigos médios
  if (r < 0.9) return randInt(rng, 30, 60); // guias
  return randInt(rng, 60, 120); // pilares/guias longos (cauda)
}

module.exports = { mulberry32, randInt, zipfIndex, articleBlockCount };
