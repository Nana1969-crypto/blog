# ADR-0002: Estratégia de renderização

- **Status:** 🟡 Proposto — decisão pendente do Spike de Escala (03.1)
- **Data:** (a definir na aceitação)
- **Decisores:** CTO, Staff Eng, Performance Eng
- **Documentos relacionados:** 03 §2, 03.1 §5/§7, 02 (islands)

## Contexto

Com 100k páginas e 1M visitas/mês, o custo de renderização **não pode crescer com o tráfego nem com o catálogo** (`RENDER-1`). A leitura precisa estar disponível antes de qualquer JS (`RENDER-2`) e atingir CWV p75 em mobile modesto (`PERF-1`).

## Decisão (candidata)

**Renderização híbrida SSG + ISR + islands (partial hydration):**
- Article/Pillar/Cluster/Author: **SSG + ISR** (estático, regenerado por publicação/revisão).
- Home/Hub: **ISR** com revalidação curta.
- Search/filtros: **edge dinâmico**.
- Interatividade apenas em ilhas (TOC, FAQ, busca, formulário, toggle de tema).

**Condição objetiva para virar `Aceito`:** no spike (03.1 §5),
- Build incremental de 1 artigo < 30s e **curva plana** de 1k→100k→1M.
- Regeneração só das páginas de índice afetadas (derivadas do grafo).
- CWV p75 (LCP<2.0s, INP<200ms, CLS<0.1) atingidos em dispositivo modesto/3G (03.1 §7).

## Alternativas consideradas

- **SSR por request** — descartada: custo/latência crescem com o tráfego (Fase 00 anti-padrão; viola RENDER-1).
- **SSG puro (sem ISR)** — descartada: full rebuild de 100k a cada publicação é inviável (viola RENDER-1).
- **CSR/SPA** — descartada: prejudica SEO, LCP e leitura sem JS (viola RENDER-2 e Princípios de SEO/UX).

## Consequências

- **Positiva:** custo por visita ~O(1); páginas prontas na borda; leitura independente de JS.
- **Negativa/risco:** complexidade de ISR/invalidação (endereçada em ADR-0003).
- **Reabre este ADR se:** o build incremental medir curva ascendente com o catálogo no spike.
