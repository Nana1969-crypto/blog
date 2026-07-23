'use strict';
// Renderer de blocos tipados (Fase 01 §4.2) → HTML semântico.
// Puro: recebe blocos + resolvedor de links, devolve HTML e efeitos colaterais
// declarados (arestas de link, headings para TOC). Não conhece armazenamento (ARCH-1).
//
// richText: string simples OU array de spans:
//   'texto' | {b:'negrito'} | {i:'itálico'} | {code:'inline'} |
//   {link:{ref:'article:<id>'|'https://...', text:'âncora'}}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderRich(rt, ctx) {
  if (typeof rt === 'string') return esc(rt);
  return rt.map((sp) => {
    if (typeof sp === 'string') return esc(sp);
    if (sp.b) return `<strong>${esc(sp.b)}</strong>`;
    if (sp.i) return `<em>${esc(sp.i)}</em>`;
    if (sp.code) return `<code>${esc(sp.code)}</code>`;
    if (sp.link) {
      const { ref, text } = sp.link;
      if (ref.startsWith('article:')) {
        const id = ref.slice(8);
        const url = ctx.resolve(id); // lança se o alvo não existir (LINK-4 no build)
        ctx.edges.push({ to: id, anchor: text });
        return `<a href="${esc(url)}">${esc(text)}</a>`;
      }
      // Link externo: rel de segurança padrão.
      return `<a href="${esc(ref)}" rel="noopener noreferrer">${esc(text)}</a>`;
    }
    throw new Error(`span desconhecido: ${JSON.stringify(sp)}`);
  }).join('');
}

function slugAnchor(text) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const renderers = {
  paragraph: (b, ctx) => `<p>${renderRich(b.richText, ctx)}</p>`,

  heading: (b, ctx) => {
    const lvl = b.level;
    if (lvl < 2 || lvl > 4) throw new Error(`heading level inválido: ${lvl}`);
    const anchor = b.anchor || slugAnchor(b.text);
    ctx.headings.push({ level: lvl, text: b.text, anchor });
    return `<h${lvl} id="${esc(anchor)}">${esc(b.text)}</h${lvl}>`;
  },

  list: (b, ctx) => {
    const tag = b.ordered ? 'ol' : 'ul';
    const items = b.items.map((it) => `<li>${renderRich(it, ctx)}</li>`).join('');
    return `<${tag}>${items}</${tag}>`;
  },

  callout: (b, ctx) => {
    const labels = { info: 'Note', tip: 'Tip', warn: 'Warning' };
    const v = b.variant in labels ? b.variant : 'info';
    return `<aside class="callout callout-${v}" role="note">` +
      `<strong class="callout-label">${labels[v]}:</strong> ${renderRich(b.richText, ctx)}</aside>`;
  },

  table: (b, ctx) => {
    if (!b.caption) throw new Error('table exige caption (A11y)');
    const head = `<tr>${b.headers.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr>`;
    const rows = b.rows.map((r) => `<tr>${r.map((c) => `<td>${renderRich(c, ctx)}</td>`).join('')}</tr>`).join('');
    return `<div class="table-wrap"><table><caption>${esc(b.caption)}</caption>` +
      `<thead>${head}</thead><tbody>${rows}</tbody></table></div>`;
  },

  code: (b) => `<pre><code class="lang-${esc(b.language || 'text')}">${esc(b.content)}</code></pre>`,

  image: (b) => {
    if (!b.alt || !b.alt.trim()) throw new Error('image sem alt (CNT-1)');
    const cap = b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : '';
    return `<figure><img src="${esc(b.src)}" alt="${esc(b.alt)}" loading="lazy" ` +
      `width="${b.width || 1200}" height="${b.height || 675}">${cap}</figure>`;
  },

  // Diagrama original inline (SVG autoral do repositório — conteúdo de primeira
  // parte, não input de usuário). alt vai em role=img + aria-label.
  figure: (b) => {
    if (!b.alt || !b.alt.trim()) throw new Error('figure sem alt (CNT-1)');
    const cap = b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : '';
    return `<figure class="diagram" role="img" aria-label="${esc(b.alt)}">${b.svg}${cap}</figure>`;
  },

  quote: (b, ctx) => {
    const attr = b.attribution ? `<footer>— ${esc(b.attribution)}</footer>` : '';
    return `<blockquote><p>${renderRich(b.richText, ctx)}</p>${attr}</blockquote>`;
  },

  faq: (b, ctx) => {
    ctx.faq.push(...b.items);
    ctx.headings.push({ level: 2, text: 'Frequently asked questions', anchor: 'faq' });
    const items = b.items.map((it) =>
      `<details class="faq-item"><summary>${esc(it.question)}</summary>` +
      `<p>${renderRich(it.answerRichText, ctx)}</p></details>`).join('');
    return `<section class="faq" aria-label="Frequently asked questions"><h2 id="faq">Frequently asked questions</h2>${items}</section>`;
  },

  divider: () => '<hr>',
};

// Renderiza a árvore. ctx acumula: headings (TOC), edges (grafo), faq (schema).
function renderBlocks(blocks, resolve) {
  const ctx = { headings: [], edges: [], faq: [], resolve };
  const html = blocks.map((b) => {
    const r = renderers[b.type];
    if (!r) throw new Error(`bloco desconhecido: ${b.type}`);
    return r(b, ctx);
  }).join('\n');
  return { html, ...ctx };
}

module.exports = { renderBlocks, esc, slugAnchor };
