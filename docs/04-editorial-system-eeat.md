# BLOG OS — Fase 04

## Sistema Editorial & E-E-A-T

> Operacionaliza os princípios editoriais (Fase 00 §8), o gate de qualidade e as entidades de autoria/fontes (Fase 01) em um **sistema de produção de conteúdo**: workflow, padrões de qualidade, autoridade dos autores, ciclo de atualização e confiabilidade. É o que transforma "profundidade vence volume" de intenção em processo repetível.
> Status: **Proposta para aprovação** · Versão 1.0 · Depende de: `00`, `01`, `02`, `03`
> Escopo: **processo e especificação editorial**. Nenhuma implementação de código. Define contratos operacionais, não ferramentas construídas.

---

## 1. Resumo Executivo

A Fase 00 estabeleceu que a autoridade do Blog OS é **sistêmica** (marca + processo + autores), não refém de uma marca pessoal única (contra-exemplo Backlinko/Neil Patel), e que **profundidade e originalidade são o moat** (Princípios 14, 16). A Fase 01 modelou `Author`, `Source`, `reviewedAt` e o gate. Esta fase define **como o conteúdo é produzido, revisado, publicado e mantido em escala sem perder qualidade**.

Definimos:

1. **Fluxo editorial** — da intenção à publicação e à manutenção, com estados e responsáveis.
2. **Padrão de qualidade** — critérios objetivos que um artigo deve atingir (o gate da Fase 01 §8, detalhado).
3. **Sistema de autoridade (E-E-A-T)** — como Experience, Expertise, Authoritativeness e Trust são construídos e provados.
4. **Ciclo de atualização** — frescor como disciplina contínua (Princípio 6), com poda e consolidação.
5. **Confiabilidade** — fontes, transparência, correções.

**Princípio-guia da fase:** *cada artigo é um ativo de longo prazo que deve satisfazer a intenção melhor que qualquer concorrente — o processo existe para garantir isso repetidamente, não ocasionalmente.*

---

## 2. Fluxo Editorial (da intenção ao ativo mantido)

O fluxo parte da **intenção canônica** (Fase 01 §2), não de uma "ideia de post".

```
1. DESCOBERTA      →  identificar SearchIntent (volume × valor × intenção)
2. PRIORIZAÇÃO     →  priorityScore; encaixe em pillar/cluster
3. BRIEF           →  contrato do artigo (intenção, ângulo, fontes, autor)
4. PRODUÇÃO        →  rascunho em blocos tipados (Fase 01 §4)
5. REVISÃO         →  qualidade + precisão (revisor especialista se necessário)
6. GATE            →  validações automáticas + editoriais (Fase 01 §8)
7. PUBLICAÇÃO      →  ISR regenera o Content + índices (Fase 03)
8. MANUTENÇÃO      →  ciclo de atualização (revisar/consolidar/aposentar)
```

### 2.1 Estados do conteúdo (alinhados à Fase 01)

| Estado | Significado | Transição |
|---|---|---|
| `draft` | Em produção | → `in_review` quando o autor conclui |
| `in_review` | Em revisão editorial/especialista | → `published` (gate ok) ou volta a `draft` |
| `published` | Publicado e no ar | → ciclo de manutenção |
| `retired` | Aposentado | 301/consolidação ou 410 (Fase 01 §7) |

### 2.2 Papéis (RACI resumido)

| Etapa | Responsável | Aprova |
|---|---|---|
| Descoberta/priorização | SEO Architect + Content Strategist | PM |
| Brief | Content Strategist | Editor |
| Produção | Autor (`Author`) | — |
| Revisão de qualidade | Editor | — |
| Revisão de precisão | Revisor especialista (`reviewerId`) | Editor |
| Publicação | Editor | — |
| Manutenção | Dono do cluster | Editor |

---

## 3. Brief Editorial (contrato do artigo)

Nenhum artigo começa sem brief. O brief é o contrato que garante que o resultado satisfaça a intenção.

| Campo do brief | Vincula a |
|---|---|
| `SearchIntent` canônica + intenção secundárias | Fase 01 §2 |
| Ângulo/tese (o que torna esta peça superior — Skyscraper) | Princípio 16 |
| `funnelStage` e objetivo de conversão da página | Princípio 44 |
| Pillar/cluster e links internos-alvo (`pillar_up`, contextuais) | Fase 01 §5 |
| Autor previsto + necessidade de revisor especialista | E-E-A-T |
| Fontes obrigatórias / dados originais a produzir | Princípios 16, 19 |
| Estrutura mínima (answer-first, TOC, FAQ) | Fase 02 §8 |
| CTA contextual único | Princípio 45 |

---

## 4. Padrão de Qualidade (o gate, detalhado)

Detalha o gate da Fase 01 §8. **Bloqueantes** (automáticas) já cobertas na Fase 01. Aqui, os **critérios editoriais** que o revisor humano valida:

### 4.1 Satisfação de intenção (o critério soberano)

- [ ] A peça responde a `canonicalQuery` **melhor** que os 3 primeiros concorrentes (profundidade + clareza + completude — Princípio 9).
- [ ] Cobre as sub-intenções (`secondaryKeywords`) sem desviar do foco (uma URL, N intenções — Fase 01 INV-2).
- [ ] **Answer-first:** a resposta essencial aparece no `dek`/primeiros blocos (Princípio 15).

### 4.2 Profundidade e originalidade (o moat)

- [ ] Traz algo **não-copiável**: dado próprio, exemplo real, experiência de primeira mão, ou opinião fundamentada (Princípios 14, 16).
- [ ] Figuras/diagramas **originais** onde ajudam a compreensão (não stock decorativo — Princípio 33).
- [ ] Sem "enchimento": cada seção agrega; conteúdo raso é reprovado.

### 4.3 Estrutura e leitura

- [ ] Escaneável: H2/H3 lógicos, listas, TOC, parágrafos curtos (Fase 02 §3).
- [ ] Blocos tipados corretos (tabela para comparação, callout para destaque, FAQ estruturada).
- [ ] Um CTA contextual, alinhado ao tema (Princípio 45).

### 4.4 Confiabilidade

- [ ] Afirmações relevantes têm `Source` citada (Princípio 19).
- [ ] Autor com bio/credenciais adequadas ao tema (E-E-A-T).
- [ ] Revisão de especialista quando o tema exige (YMYL, técnico sensível).

> **Invariante EDIT-1:** o critério §4.1 (satisfação de intenção) é soberano. Um artigo tecnicamente correto que não satisfaz a intenção melhor que os concorrentes **não publica** — publicar seria criar um passivo de SEO e de marca (Fase 00, anti-padrão "conteúdo superficial").

---

## 5. Sistema de Autoridade — E-E-A-T

Autoridade é construída no sistema, provada na página e reconhecida por buscadores/IA.

### 5.1 Como cada dimensão é construída

| Dimensão | Como o Blog OS constrói | Onde aparece |
|---|---|---|
| **Experience** | Autores com experiência real no tema; exemplos e casos de primeira mão | Corpo do artigo, bio |
| **Expertise** | Autores/revisores especialistas; `expertiseAreas` vinculadas a pillars | `Author`, revisão |
| **Authoritativeness** | Cobertura completa de clusters, citações, backlinks conquistados por qualidade | Grafo interno, autoridade temática |
| **Trust** | Fontes citadas, transparência, correções, datas reais, sem dark patterns | Schema, rodapé editorial, política |

### 5.2 Provas de autoridade na página (derivadas do modelo — Fase 01/02)

- Autor visível com bio, expertise e `sameAs` (schema Person).
- `publishedAt` / `updatedAt` / `reviewedAt` reais e expostos (frescor honesto).
- Fontes citadas; metodologia transparente quando há dados originais.
- Revisor especialista creditado quando aplicável.

### 5.3 Governança de autores (evitar o risco de concentração — Fase 00)

- **Invariante EEAT-1:** a autoridade pertence ao **sistema** (marca + processo + múltiplos autores), não a uma pessoa. Nenhum autor único é ponto de falha; a saída de um autor não derruba a autoridade do acervo.
- Pool de autores/revisores por área de expertise; padrão de bio e credenciais.

---

## 6. Ciclo de Atualização (frescor como disciplina — Princípio 6)

Conteúdo é ativo vivo. Nada é "publicar e esquecer".

### 6.1 Cadência de revisão

- Cada `Content` tem **cadência sugerida por tipo/tema** (temas voláteis revisam mais).
- Ao vencer a cadência, o item é sinalizado para uma de três ações:
  1. **Revisar/refresh** — atualizar dados, exemplos, links; bump em `reviewedAt`/`updatedAt` (padrão Backlinko/Ahrefs).
  2. **Consolidar** — fundir com peça sobreposta; 301 para a canônica (Fase 01 §7, poda — Princípio 10).
  3. **Aposentar** — 410 se obsoleto sem substituto.

### 6.2 Sinais de que um artigo precisa de ação

- Queda de posição/tráfego (Observabilidade, Fase 03 §8).
- Dados/estatísticas datados; links quebrados (grafo — Fase 01 §5).
- Sobreposição de intenção detectada (auditoria de canibalização — Fase 01 INV-3).

> **Invariante EDIT-2:** frescor exposto ao usuário e ao schema **reflete mudança real**. Nunca "bump" cosmético de data sem revisão de conteúdo — isso queima confiança (Trust).

---

## 7. Confiabilidade e Transparência

- **Fontes:** afirmações relevantes citam `Source`; dados originais explicam metodologia.
- **Correções:** erros corrigidos são documentados (data + natureza da correção) — reforça Trust.
- **Transparência:** política editorial pública (como produzimos, revisamos e atualizamos); divulgação de patrocínios/afiliações.
- **Sem dark patterns** no conteúdo ou na conversão (Princípio 49) — a confiança é o ativo composto de longo prazo.

---

## 8. Escala Editorial sem Perder Qualidade (100k artigos)

Fechando a tensão volume × qualidade em escala:

| Desafio em escala | Como o sistema resolve |
|---|---|
| Manter padrão com muitos autores | Brief como contrato + gate objetivo (§3, §4) + pool de revisores |
| Evitar canibalização com muito conteúdo | Descoberta parte da intenção canônica (Fase 01 §2) |
| Acervo apodrecendo | Ciclo de atualização com cadência e poda (§6) |
| Consistência de estrutura | Blocos tipados + padrão de artigo (Fase 01/02) |
| Reuso e composição | Conteúdo como dado; blocos reutilizáveis (Notion, Fase 00) |

- **Invariante EDIT-3:** escala **nunca** justifica baixar o padrão (§4). Preferimos menos peças excelentes a muitas medianas (Princípio 14) — porque conteúdo raso é passivo, não ativo.

---

## 9. Checklist de Aprovação da Fase 04

### Processo
- [ ] Fluxo da intenção à manutenção com estados e papéis? **Sim** (§2).
### Qualidade
- [ ] Gate objetivo com satisfação de intenção soberana? **Sim** (§4, EDIT-1).
### E-E-A-T
- [ ] Autoridade sistêmica, provada na página, sem ponto único de falha? **Sim** (§5, EEAT-1).
### Frescor
- [ ] Ciclo de atualização com poda/consolidação e frescor honesto? **Sim** (§6, EDIT-2).
### Confiabilidade
- [ ] Fontes, correções e transparência definidas? **Sim** (§7).
### Escala
- [ ] Padrão mantido a 100k sem baixar qualidade? **Sim** (§8, EDIT-3).

### Dependências para próxima fase
- [ ] Fase 05 (Conversão) recebe: objetivo de conversão por artigo (do brief) e a base de confiança que precede qualquer pedido.

> **Recomendação da squad:** aprovar o sistema editorial e seguir para a **Fase 05 — Conversão & Growth**, última peça da fundação.

---

## 10. Riscos e Decisões em Aberto

- **Risco — gate travar a produção:** critérios rígidos podem reduzir throughput. *Mitigação:* separar bloqueantes automáticas de revisão editorial; investir em briefs bons (erro sai barato antes de escrever).
- **Risco — "refresh" cosmético:** pressão por frescor pode gerar bumps falsos. *Mitigação:* EDIT-2 — data reflete mudança real; auditoria.
- **Decisão em aberto — IA na produção editorial:** uso de IA para rascunho/pesquisa é permitido, mas **toda peça passa pelo mesmo gate humano** e responsabilidade de autoria; definir política explícita (originalidade e Trust não podem ser comprometidos).
- **Decisão em aberto — remuneração/incentivo de autores por qualidade** (não por volume) — desenhar para alinhar com EDIT-3.

*Fim do documento.*
