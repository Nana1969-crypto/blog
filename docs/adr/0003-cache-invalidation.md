# ADR-0003: Invalidação de cache

- **Status:** 🟡 Proposto — decisão pendente do Spike de Escala (03.1)
- **Data:** (a definir na aceitação)
- **Decisores:** CTO, Staff Eng, Performance Eng
- **Documentos relacionados:** 03 §4, 03.1 §6, 01 §5 (grafo)

## Contexto

Escala só é viável se a invalidação for **seletiva**: publicar/atualizar um item não pode purgar o site inteiro (`CACHE-1`). A unidade de invalidação é o `Content` (Fase 01), e as páginas de índice afetadas são derivadas do **grafo de interlinking** (Fase 01 §5).

Ponto difícil identificado (Fase 03 §11, 03.1 §6): quando um artigo A muda de título, as âncoras de link em N páginas que apontam para A precisam refletir a mudança. É preciso decidir **âncoras resolvidas em runtime vs. no build**.

## Decisão (candidata)

**Invalidação seletiva por `Content`, derivada do grafo:** ao publicar/atualizar,
1. regenera o `Content`;
2. regenera páginas de índice/hub que o listam;
3. purga na borda apenas essas rotas.

Política de âncoras: **a definir no spike** — preferência inicial por *âncora derivada do título canônico resolvida no build* das páginas afetadas, com purga direcionada; alternativa é resolver o rótulo em runtime para reduzir fan-out de regeneração.

**Condição objetiva para virar `Aceito`:** no spike (03.1 §6),
- Publicar 1 artigo purga **apenas** as rotas do grafo (sem purga global).
- Cache hit ratio (HTML) > 95%; propagação global < 60s.
- O caso "título muda em artigo linkado por 500 páginas" resolve corretamente com fan-out aceitável.

## Alternativas consideradas

- **Purga global a cada publicação** — descartada: tempestade de regeneração; inviável em 100k (viola CACHE-1).
- **TTL curto sem invalidação dirigida** — descartada: ou serve conteúdo velho, ou desperdiça origin (tensão com PERF-1 e frescor).
- **Âncoras 100% em runtime** — considerada: elimina fan-out de regeneração, mas adiciona custo de resolução por request; avaliar no spike.

## Consequências

- **Positiva:** regeneração e purga proporcionais à mudança, não ao catálogo.
- **Negativa/risco:** lógica de fan-out do grafo é complexa e precisa de observabilidade (OBS-1) para detectar purgas erradas.
- **Reabre este ADR se:** o spike mostrar fan-out inaceitável ou invalidação parcial não confiável.
