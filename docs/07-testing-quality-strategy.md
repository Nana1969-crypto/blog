# BLOG OS — Fase 07

## Estratégia de Testes e Qualidade

> Como a qualidade é garantida de forma **executável** — refletindo o que já está implementado e o que entra com o deploy.
> Status: **Ativo (v1)** · Depende de: `06` (implementação), `01` §8 (gate)

---

## 1. Filosofia: qualidade como gate, não como relatório

A tese das Fases 00–04 é que qualidade garantida por disciplina se perde; garantida por sistema, permanece. Na v1 isso é literal: **as verificações rodam no build e falham o build** — não existem "warnings acumulados".

## 2. Camadas de verificação (implementadas)

| Camada | Onde | O que bloqueia | Comprovação |
|---|---|---|---|
| **Gate editorial/SEO** | `platform/src/build.js` | canibalização (INV-3), taxonomia inválida (TAX-1), metaTitle/Description ausentes/longos/duplicados, autor sem bio (E-E-A-T), dek curto, <2 h2 (CNT-3), sem link interno (LINK-3), sem fontes (P19), link interno para alvo inexistente (LINK-4), slug duplicado | 3 violações plantadas → 3 builds falhados (doc 06 §4.1) |
| **Contrato de blocos** | `platform/src/blocks.js` | imagem/figura sem alt (CNT-1), tabela sem caption, heading fora de 2–4, bloco/span desconhecido | exceção derruba o render |
| **Pós-build** | `platform/src/check.js` | link interno quebrado no dist, img sem alt no HTML final, pulo de heading, ≠1 h1/página, JSON-LD inválido, title duplicado, **contraste < AA computado (2 temas)**, JS inline > 2KB/página | 12 páginas verdes; contraste calculado por código |
| **Navegador real** | Playwright + Chromium | erros de console, legibilidade sem JS, foco de teclado (skip-link), scroll horizontal mobile, persistência do tema | executado; 1 defeito real encontrado e corrigido (grid blowout — doc 06 §4.3) |

## 3. Regressão e CI

- **Comando único:** `node platform/src/build.js && node platform/src/check.js` — é o pipeline de CI inteiro da v1 (zero dependências; roda em qualquer runner Node).
- **Toda mudança de template/token** invalida o manifest (hash de código compartilhado) e força rebuild completo — impossibilita servir páginas com CSS velho.
- **Toda mudança de conteúdo** passa pelo mesmo gate — autor não tem caminho de publicação que pule as verificações (o fluxo é git: PR → build verde → merge).

## 4. O que entra com o deploy (pendências honestas)

- **Lighthouse CI com throttling** (aparelho modesto/3G) como gate de PR — os alvos da Fase 03 §5 viram assert.
- **RUM (CWV de campo)** — item H4 do 03.3; sem ele, performance de campo é hipótese bem fundamentada, não fato.
- **Verificação de headers em produção** (CSP/HSTS ativos) — o `_headers` está no dist; validar após deploy.
- **Teste de acessibilidade assistiva** (leitor de tela real) — a base semântica está verificada; a experiência com NVDA/VoiceOver deve ser validada por humano antes do launch.

## 5. Critério de saúde permanente

O repositório está saudável quando `build + check` passam do zero (`--force`) em ambiente limpo. Qualquer exceção documentada é dívida com prazo — não existe "verde com asterisco".
