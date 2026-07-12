# BLOG OS — Fase 09

## Analytics e Medição de Jornada

> Como medir a jornada completa (Fase 05 §7) **respeitando privacidade por design** (CONV-5). Especificação para ativação junto ao deploy — a v1 local não coleta nada, e isso é uma feature, não uma lacuna.
> Status: **Especificado** · Depende de: `05` (conversão), `08` (deploy)

---

## 1. Princípios (herdados e inegociáveis)

- **Privacidade por design:** consentimento real antes de qualquer rastreamento identificável; preferir analytics **sem cookies/sem PII** que dispensam banner por não rastrear indivíduos (LGPD/GDPR por construção).
- **Medir a jornada, não o clique** (P50): as métricas existem para responder perguntas de decisão, não para acumular dashboards.
- **Zero third-party no caminho crítico de leitura:** qualquer script de medição carrega depois do conteúdo, fora do orçamento de leitura (RENDER-2); se o analytics cair, a leitura não sente.

## 2. Camadas de medição (em ordem de ativação)

| Camada | O que responde | Ferramenta-tipo | Quando ativa |
|---|---|---|---|
| **1. Search Console** | descoberta: consultas, posições, impressões, canibalização residual | Google Search Console (sem código no site) | no deploy |
| **2. RUM / CWV de campo** | experiência real: LCP/INP/CLS p75 por rota e dispositivo | coleta web-vitals leve → endpoint próprio ou serviço privacy-first | no deploy (fecha H4 do 03.3) |
| **3. Analytics agregado** | engajamento: páginas/sessão, profundidade de leitura, cliques em interlinks e no next-step | analytics sem cookies (agregado, sem PII) | no deploy |
| **4. Funil de conversão** | lead: taxa de captura por cluster, origem, nutrição | junto do sistema de newsletter (Fase 05 §4) | quando a captura existir |

## 3. Métricas por estágio (implementa Fase 05 §7.1)

- **Descoberta:** cliques/impressões orgânicos por cluster; % de consultas com >1 URL (alerta de canibalização — cruza com o gate).
- **Engajamento:** profundidade de leitura (marcos de scroll agregados), cliques no bloco *next-step* (a conversão-continuação da v1), cliques em links internos.
- **Frescor:** idade média do acervo vs. cadência da Fase 04 §6 — derivável do próprio conteúdo, sem analytics.
- **Lead/receita:** definidos quando o mecanismo de captura for ativado; nunca antes (não se instrumenta o que não existe).

## 4. Decisões que estas métricas alimentam

| Pergunta | Métrica | Ação |
|---|---|---|
| Qual cluster expandir? | cliques orgânicos + engajamento por cluster | pauta do próximo ciclo (Fase 04 §2) |
| Que artigo atualizar? | queda de posição/cliques + idade | fila de refresh (Fase 04 §6) |
| O next-step funciona? | CTR do bloco next-step por artigo | ajustar destino/copy do próximo passo |
| A experiência regrediu? | CWV p75 por rota | investigar release; gate de PR já deveria ter pego |

## 5. O que NÃO faremos

- Sem pixels de terceiros de publicidade na v1; sem fingerprinting; sem session replay de leitores.
- Sem métricas de vaidade como alvo (pageview bruto não decide nada sozinho).
- Sem dark patterns de consentimento (CONV-5) — se um dia houver banner, recusar será tão fácil quanto aceitar.
