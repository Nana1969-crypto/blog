# ADR-0001: Seleção do CMS headless

- **Status:** 🟡 Proposto — decisão pendente do Spike de Escala (03.1)
- **Data:** (a definir na aceitação)
- **Decisores:** CTO, Staff Eng, Content Strategist, SEO Architect
- **Documentos relacionados:** 01 (modelo de dados), 03 §3, 03.1 §4/§8, 04 (workflow editorial)

## Contexto

O conteúdo do Blog OS é **dado estruturado em blocos tipados** (Fase 01 §4), não HTML solto. O armazenamento precisa preservar isso e sustentar 100k artigos, ~3.000 autores, workflow editorial (Fase 04) e o build incremental da Fase 03. Invariantes em jogo: `STORE-1` (contrato de dados é a fronteira), `ARCH-1` (apresentação não depende do fornecedor), `RENDER-1` (API não pode inviabilizar build incremental).

Requisitos derivados (Fase 03 §3.1):
- Modelagem de blocos tipados + relações (intenção canônica, taxonomia, grafo de links).
- Versionamento de conteúdo (auditoria de frescor, reversão).
- API de leitura performática para build/ISR em escala + previews.
- Workflow editorial (rascunho→revisão→publicação) e permissões multi-autor.
- Portabilidade / sem lock-in de apresentação.

## Decisão (candidata)

**CMS headless orientado a conteúdo estruturado** (blocos/portable text), desacoplado da apresentação, atrás de uma interface de repositório definida pelo domínio (ARCH-1).

**Condição objetiva para virar `Aceito`:** o fornecedor candidato deve, no spike (03.1 §4/§8), demonstrar:
- Latência de leitura p95 < 100ms sob concorrência de build.
- Build inicial de 100k **sem** estourar rate limit (bulk/backoff disponível).
- Busca do editor p95 < 500ms em 100k itens.
- Custo mensal projetado (100k itens + operação + ISR) dentro do teto de negócio.
- Ausência de teto de itens/campos abaixo de 100k (e margem rumo a 1M).

## Alternativas consideradas

- **CMS headless SaaS estruturado** — melhor DX editorial e API pronta; risco de teto de API/itens e custo por chamada (eliminatório se falhar §4).
- **Git-based / arquivos estruturados** — versionamento e portabilidade excelentes; risco de UX editorial pobre e build lento em 100k (mitigável com build incremental).
- **Banco relacional próprio + camada de conteúdo** — controle máximo e sem lock-in; maior custo de construção/manutenção (tensão com Princípio 11 — manutenibilidade).

## Consequências

- **Positiva:** conteúdo permanece dado portável; troca de apresentação sem reescrever acervo.
- **Negativa/risco:** dependência de fornecedor (mitigada por STORE-1/ARCH-1 e por manter export dos dados).
- **Reabre este ADR se:** custo escalar de forma não-linear rumo a 1M, ou o fornecedor impuser limite que quebre RENDER-1.
