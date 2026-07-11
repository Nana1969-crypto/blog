'use strict';
// Gera corpo em blocos tipados conforme o contrato da Fase 01 §4.2.
// Proporção de tipos aproxima a esperada em produção — para medir custo real
// de render por bloco (evita o viés de "lorem-ipsum plano", 03.1 §11.1).

const { randInt } = require('./prng');

// Palavras sintéticas curtas apenas para dar peso realista ao richText.
function words(rng, n) {
  const bank = [
    'seo', 'conteudo', 'busca', 'intencao', 'autoridade', 'cluster', 'pilar',
    'performance', 'cache', 'render', 'leitura', 'conversao', 'grafo', 'schema',
    'usuario', 'pagina', 'artigo', 'dados', 'estrutura', 'metrica', 'escala',
  ];
  let out = [];
  for (let i = 0; i < n; i++) out.push(bank[randInt(rng, 0, bank.length - 1)]);
  return out.join(' ');
}

// Constrói a árvore de blocos. `linkTargets` são ids de Content candidatos a
// interlinking contextual (as arestas são registradas fora, no gerador).
function buildBody(rng, blockCount, opts) {
  const blocks = [];
  // answer-first: primeiro parágrafo é a resposta essencial (Princípio 15).
  blocks.push({ type: 'paragraph', richText: words(rng, randInt(rng, 25, 45)) });

  let h2 = 0;
  for (let i = 0; i < blockCount; i++) {
    const r = rng();
    if (r < 0.18) {
      h2++;
      blocks.push({ type: 'heading', level: 2, text: words(rng, 4), anchor: `h-${h2}` });
    } else if (r < 0.62) {
      blocks.push({ type: 'paragraph', richText: words(rng, randInt(rng, 20, 60)) });
    } else if (r < 0.72) {
      blocks.push({ type: 'list', ordered: rng() < 0.5, items: Array.from({ length: randInt(rng, 3, 7) }, () => words(rng, randInt(rng, 4, 12))) });
    } else if (r < 0.80) {
      // imagem — alt obrigatório (CNT-1)
      blocks.push({ type: 'image', assetId: `img_${opts.contentId}_${i}`, alt: words(rng, randInt(rng, 4, 9)), caption: words(rng, 6) });
    } else if (r < 0.86) {
      blocks.push({ type: 'table', headers: ['a', 'b', 'c'], rows: Array.from({ length: randInt(rng, 2, 6) }, () => [words(rng, 2), words(rng, 2), words(rng, 2)]), caption: words(rng, 5) });
    } else if (r < 0.90) {
      blocks.push({ type: 'code', language: 'ts', content: words(rng, randInt(rng, 10, 40)) });
    } else if (r < 0.94) {
      blocks.push({ type: 'callout', variant: ['info', 'warn', 'tip'][randInt(rng, 0, 2)], richText: words(rng, randInt(rng, 8, 20)) });
    } else if (r < 0.97) {
      blocks.push({ type: 'faq', items: Array.from({ length: randInt(rng, 2, 4) }, () => ({ question: words(rng, 6) + '?', answerRichText: words(rng, randInt(rng, 15, 30)) })) });
    } else {
      blocks.push({ type: 'quote', richText: words(rng, randInt(rng, 8, 18)), attribution: words(rng, 2) });
    }
  }
  return blocks;
}

module.exports = { buildBody };
