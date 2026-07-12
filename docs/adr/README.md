# Architecture Decision Records (ADRs) — Blog OS

> Registro imutável das decisões arquiteturais do Blog OS. Cada ADR documenta **o que** foi decidido, **por quê** e **quais alternativas** foram descartadas. Ver processo em `../README.md` §8.

## Regras

- ADRs são **imutáveis** após aceitos. Uma decisão revertida gera um **novo** ADR que *supersede* o anterior — nunca se edita o antigo.
- Numeração sequencial de quatro dígitos: `NNNN-titulo-curto.md`.
- Status possíveis: `Proposto` · `Aceito` · `Substituído por ADR-YYYY` · `Descartado`.
- Um ADR só passa a `Aceito` quando sua decisão tem base — no caso das decisões estruturais abaixo, **base = evidência do Spike de Escala (03.1)**.

## Índice

| ADR | Título | Status | Decisão depende de |
|---|---|---|---|
| [0000](0000-template.md) | Template | — | — |
| [0001](0001-cms-selection.md) | Armazenamento de conteúdo (v1: file-based) | ✅ Aceito (v1) | — (condições medidas localmente; gatilho de revisão documentado) |
| [0002](0002-rendering-strategy.md) | Estratégia de renderização (estático + incremental + ilhas) | ✅ Aceito (v1) | CWV de campo → 03.3 |
| [0003](0003-cache-invalidation.md) | Invalidação de cache (âncora BUILD) | ✅ Aceito | — (explain + build real medidos) |
| [0004](0004-edge-cdn-security.md) | Edge/CDN e camada de segurança | 🟡 Proposto | Deploy real (03.3) — dist é CDN-ready com _headers/CSP prontos |

> **Estado atual:** 0001–0003 aceitos com evidência medida (harness 03.2 + build real doc 06). 0004 permanece proposto por honestidade: cache hit ratio, TTFB global e CWV de campo só existem com deploy real — o `dist/` já sai CDN-ready (estático puro + `_headers` com CSP) para tornar essa aceitação trivial quando o deploy acontecer.
