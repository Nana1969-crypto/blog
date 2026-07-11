# ADR-0004: Edge/CDN e camada de segurança

- **Status:** 🟡 Proposto — decisão pendente do Spike de Escala (03.1)
- **Data:** (a definir na aceitação)
- **Decisores:** CTO, Staff Eng, Security Engineer, Performance Eng
- **Documentos relacionados:** 03 §4/§6, 03.1 §6/§7

## Contexto

A maioria absoluta das requisições deve ser servida da **borda**, perto do usuário (`Princípio 37`), com TTFB p75 < 200ms global. Segurança é **infraestrutura**, não add-on (`SEC-1`): TLS, headers (CSP/HSTS), WAF, rate limiting e proteção a bots/DDoS desde o dia 1.

## Decisão (candidata)

**CDN/edge com compute na borda + camada de segurança integrada:**
- Entrega de HTML estático/ISR e assets imutáveis (fingerprint de conteúdo) da borda.
- WAF, rate limiting, anti-DDoS e bot management na borda.
- Headers de segurança padrão (CSP restritiva com allowlist mínima, HSTS, etc.).

**Condição objetiva para virar `Aceito`:** no spike (03.1 §6/§7),
- TTFB global p75 < 200ms de múltiplas regiões.
- Cache hit ratio (HTML) > 95%; assets estáticos com cache imutável funcional.
- Coalescência de origin sob stampede (sem sobrecarregar a origem no miss).
- CSP restritiva não quebra embeds/analytics essenciais (allowlist revisada).

## Alternativas consideradas

- **CDN "burra" (só cache) + segurança em camada separada** — descartada: mais peças, maior latência e superfície; preferir borda com compute + segurança integrada (lição Cloudflare).
- **Sem WAF/bot management no início** — descartada: visibilidade atrai ataques; segurança é premissa (SEC-1), não fase posterior.

## Consequências

- **Positiva:** performance global e segurança como uma única decisão de plataforma; superfície de ataque minimizada (site majoritariamente estático).
- **Negativa/risco:** CSP dura pode exigir ajuste de embeds; acoplamento ao provedor de edge (mitigado por manter a lógica de domínio independente — ARCH-1).
- **Reabre este ADR se:** a CSP inviabilizar mídia necessária, ou o provedor não cobrir regiões-alvo com o TTFB exigido.
