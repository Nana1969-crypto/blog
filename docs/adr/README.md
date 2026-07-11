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
| [0001](0001-cms-selection.md) | Seleção do CMS headless | 🟡 Proposto | Spike 03.1 §4, §8 |
| [0002](0002-rendering-strategy.md) | Estratégia de renderização | 🟡 Proposto | Spike 03.1 §5, §7 |
| [0003](0003-cache-invalidation.md) | Invalidação de cache | 🟡 Proposto | Spike 03.1 §6 |
| [0004](0004-edge-cdn-security.md) | Edge/CDN e camada de segurança | 🟡 Proposto | Spike 03.1 §6, §7 |

> **Estado atual:** os ADRs 0001–0004 estão em `Proposto` — a análise (contexto, alternativas, critérios) está pronta, mas **a decisão fica congelada até o spike produzir números**. Isso adianta o raciocínio sem pular o gate da Fase 03.1.
