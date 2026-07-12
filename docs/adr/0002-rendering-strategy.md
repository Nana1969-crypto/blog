# ADR-0002: Estratégia de renderização

- **Status:** ✅ Aceito (v1) — com medições locais; CWV de campo pendente do deploy (03.3)
- **Data:** 2026-07-12
- **Decisores:** CTO, Staff Eng, Performance Eng
- **Documentos relacionados:** 03 §2, 03.1 §5/§7, 02 (islands)

## Contexto

Com 100k páginas e 1M visitas/mês, o custo de renderização **não pode crescer com o tráfego nem com o catálogo** (`RENDER-1`). A leitura precisa estar disponível antes de qualquer JS (`RENDER-2`) e atingir CWV p75 em mobile modesto (`PERF-1`).

## Decisão

**Renderização híbrida SSG + ISR + islands (partial hydration):**
- Article/Pillar/Cluster/Author: **SSG + ISR** (estático, regenerado por publicação/revisão).
- Home/Hub: **ISR** com revalidação curta.
- Search/filtros: **edge dinâmico**.
- Interatividade apenas em ilhas (TOC, FAQ, busca, formulário, toggle de tema).

**Condição objetiva para virar `Aceito`:** no spike (03.1 §5),
- Build incremental de 1 artigo < 30s e **curva plana** de 1k→100k→1M.
- Regeneração só das páginas de índice afetadas (derivadas do grafo).
- CWV p75 (LCP<2.0s, INP<200ms, CLS<0.1) atingidos em dispositivo modesto/3G (03.1 §7).

## Evidência de aceitação (medida)

- **Harness (03.2):** fan-out de invalidação p50/p95 plano (18/25) de 1k a 1M de artigos.
- **Build real (doc 06):** incremental regenera 0/6 sem mudança (21ms) e 1/6 + inlinkers com 1 edição (32ms) — custo O(mudanças) confirmado na implementação.
- **Navegador real:** artigo com 19,8KB/1 request/≤499B de JS; página legível com JS desligado (RENDER-2).
- **Pendente (03.3):** CWV de campo p75 em rede real — a saída estática torna o alvo atingível por construção, mas só o deploy confirma.

## Alternativas consideradas

- **SSR por request** — descartada: custo/latência crescem com o tráfego (Fase 00 anti-padrão; viola RENDER-1).
- **SSG puro (sem ISR)** — descartada: full rebuild de 100k a cada publicação é inviável (viola RENDER-1).
- **CSR/SPA** — descartada: prejudica SEO, LCP e leitura sem JS (viola RENDER-2 e Princípios de SEO/UX).

## Consequências

- **Positiva:** custo por visita ~O(1); páginas prontas na borda; leitura independente de JS.
- **Negativa/risco:** complexidade de ISR/invalidação (endereçada em ADR-0003).
- **Reabre este ADR se:** o build incremental medir curva ascendente com o catálogo no spike.
