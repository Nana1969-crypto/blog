# ADR-0001: Seleção do armazenamento de conteúdo (v1: repositório estruturado file-based)

- **Status:** ✅ Aceito (escopo v1) — supersedível quando a operação editorial exigir CMS SaaS
- **Data:** 2026-07-11
- **Decisores:** CTO, Staff Eng, Content Strategist, SEO Architect
- **Documentos relacionados:** 01 (modelo de dados), 03 §3, 03.1/03.2 (evidência local), 04 (workflow editorial), 06 (implementação)

## Contexto

O conteúdo do Blog OS é **dado estruturado em blocos tipados** (Fase 01 §4). A Fase 03 §3.2 listou três candidatos: CMS headless SaaS, **repositório git-based de arquivos estruturados**, e banco próprio. A decisão estava congelada aguardando números de infraestrutura (H7 rate limit/custo de API; H8 workflow SaaS).

O laboratório (03.2) amadureceu e o projeto recebeu mandato de conclusão. Reavaliando os candidatos contra esse cenário:

- O risco que exigia infra para medir (**H7/H8**) é um risco **exclusivo do candidato SaaS**. O candidato git-based **não tem API remota** — H7 e H8 colapsam por construção: sem rate limit, sem custo por chamada, sem teto de itens; o workflow editorial é o fluxo git (branch → PR → gate no build → merge = publicação), e o versionamento (Fase 01 §11) é nativo.
- O build incremental e as consultas do candidato git-based são **medíveis localmente** — exatamente o que o harness e o build real fazem.
- Fraqueza conhecida: UX editorial para autores não-técnicos. Aceitável na v1 (equipe editorial reduzida); vira gatilho de revisão.

## Decisão

**v1 usa repositório estruturado file-based:** conteúdo como arquivos JSON de blocos tipados versionados em git, consumidos por um build estático próprio (ADR-0002). O contrato de dados da Fase 01 é a fronteira (STORE-1); a apresentação não conhece o armazenamento (ARCH-1).

**Condições de aceitação verificadas (medidas, não estimadas):**
- Modelagem de blocos + relações: contrato da Fase 01 implementado e validado no gate do build.
- Versionamento: nativo (git) — histórico, reversão e auditoria de frescor por commit.
- Leitura para build em escala: harness mediu série 1k→1M sub-linear; build real medido no doc 06.
- Sem teto de itens/API; custo de armazenamento ~zero na v1.
- Portabilidade total: JSON estruturado exportável por definição.

## Alternativas consideradas

- **CMS headless SaaS** — melhor UX editorial; reintroduz H7/H8 (rate limit, custo, teto) que exigem spike provisionado. **Adiado**, não descartado: vira novo ADR quando o gatilho abaixo disparar.
- **Banco relacional próprio** — controle máximo; custo de construção/manutenção injustificado na v1 (Princípio 11).

## Consequências

- **Positivas:** zero lock-in, zero custo de API, workflow editorial auditável (PR + gate), build medível localmente, backup/replicação triviais.
- **Negativas/risco aceito:** edição exige tocar JSON (mitigável com tooling leve); sem preview WYSIWYG na v1.
- **Gatilho de revisão (novo ADR):** quando houver autores não-técnicos regulares OU >~50 publicações/semana OU necessidade de agendamento/permissões finas que o fluxo git não cubra com conforto. A migração é barata por construção: o conteúdo já é dado estruturado portável (CNT-4).
