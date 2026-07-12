'use strict';
// Design tokens — Fase 02 §2: 3 camadas (primitivos → semânticos → componente).
// A camada semântica é a que troca entre temas; componentes só consomem semânticos.
// O contraste AA é VERIFICADO por código em check.js (COLOR-1) — nunca "no olho".

// ---- Camada 1: primitivos ----
const primitives = {
  white: '#ffffff',
  gray050: '#f6f8fa', gray100: '#eaeef2', gray300: '#d1d9e0',
  gray500: '#59636e', gray600: '#454f5a', gray800: '#1f2328',
  ink900: '#0e1116', ink800: '#161b22', ink600: '#2b3340',
  mist200: '#e6e9ee', mist400: '#9aa4b2',
  blue700: '#0b5cc4', blue800: '#09479a', blue300: '#7ab5ff', blue200: '#a8cdff',
  amber100: '#fff3d6', amber800: '#5f4200', amberD: '#3a2f14',
  green100: '#dcf5e3', green800: '#0f5127', greenD: '#12291a',
};

// ---- Camada 2: semânticos (por tema) ----
const themes = {
  light: {
    'color-bg': primitives.white,
    'color-surface': primitives.gray050,
    'color-border': primitives.gray300,
    'color-text': primitives.gray800,
    'color-text-2': primitives.gray500,
    'color-accent': primitives.blue700,
    'color-accent-hover': primitives.blue800,
    'color-focus': primitives.blue700,
    'color-code-bg': primitives.gray050,
    'color-callout-tip-bg': primitives.green100,
    'color-callout-tip-fg': primitives.green800,
    'color-callout-warn-bg': primitives.amber100,
    'color-callout-warn-fg': primitives.amber800,
  },
  dark: {
    'color-bg': primitives.ink900,
    'color-surface': primitives.ink800,
    'color-border': primitives.ink600,
    'color-text': primitives.mist200,
    'color-text-2': primitives.mist400,
    'color-accent': primitives.blue300,
    'color-accent-hover': primitives.blue200,
    'color-focus': primitives.blue300,
    'color-code-bg': primitives.ink800,
    'color-callout-tip-bg': primitives.greenD,
    'color-callout-tip-fg': primitives.green100,
    'color-callout-warn-bg': primitives.amberD,
    'color-callout-warn-fg': primitives.amber100,
  },
};

// Pares texto/fundo que DEVEM cumprir WCAG AA (verificados em check.js).
// [fg, bg, mínimo] — 4.5 corpo, 3.0 texto grande/UI.
const contrastPairs = (t) => [
  [t['color-text'], t['color-bg'], 4.5],
  [t['color-text-2'], t['color-bg'], 4.5],
  [t['color-accent'], t['color-bg'], 4.5],
  [t['color-text'], t['color-surface'], 4.5],
  [t['color-callout-tip-fg'], t['color-callout-tip-bg'], 4.5],
  [t['color-callout-warn-fg'], t['color-callout-warn-bg'], 4.5],
];

// ---- Tipografia e espaçamento (Fase 02 §3/§5) ----
const scale = {
  'text-xs': '0.778rem',   // 14px
  'text-sm': '0.889rem',   // 16px
  'text-base': '1rem',     // 18px (html base 112.5%)
  'text-lg': '1.111rem',   // 20px
  'text-xl': '1.389rem',   // 25px
  'text-2xl': '1.722rem',  // 31px
  'text-3xl': '2.167rem',  // 39px
  'text-4xl': '2.722rem',  // 49px
  'measure': '42rem',      // ~66ch (TYPO-1)
  'leading-body': '1.6',
  'leading-tight': '1.15',
  'font-body': "Charter, Georgia, Cambria, 'Times New Roman', serif",
  'font-ui': "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  'font-mono': "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
  'radius': '8px',
  'motion-fast': '120ms',
};

// ---- Contraste WCAG (usado por check.js e testes) ----
function relLuminance(hex) {
  const c = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrastRatio(fg, bg) {
  const [l1, l2] = [relLuminance(fg), relLuminance(bg)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
}

// ---- Emissão de CSS custom properties ----
function themeVars(t) {
  return Object.entries(t).map(([k, v]) => `--${k}:${v};`).join('');
}
function tokensCss() {
  const s = Object.entries(scale).map(([k, v]) => `--${k}:${v};`).join('');
  return [
    `:root{${s}${themeVars(themes.light)}color-scheme:light dark;}`,
    `@media (prefers-color-scheme: dark){:root:not([data-theme]){${themeVars(themes.dark)}}}`,
    `:root[data-theme="dark"]{${themeVars(themes.dark)}}`,
    `:root[data-theme="light"]{${themeVars(themes.light)}}`,
  ].join('\n');
}

module.exports = { primitives, themes, scale, contrastPairs, contrastRatio, tokensCss };
