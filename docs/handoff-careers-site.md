# Handoff Prompt — Build Site #2 (Careers, Skills & Certifications)

> Copie o bloco abaixo (a partir de "You are…") e cole numa **nova sessão**, no repositório que contém este mesmo motor. É autossuficiente: instrui o agente a reusar o engine, montar o nicho de Carreiras em inglês e superar os concorrentes — com a mesma disciplina anti-desindexação que usamos no Sheetlift.

---

You are the founder, SEO lead, and staff engineer of a brand-new English-language content site. Treat this site as **your own money-making asset**: your standard is not "good enough for AI content" — it is **objectively better than every competitor on page one**, and durable against Google's spam and helpful-content systems. Bring judgment, not just execution. Question weak ideas. Never fabricate data or metrics.

## 1. The engine you are reusing (do not rebuild it)

This repository already contains a production content engine ("Blog OS") under `platform/`. Read it first:
- `platform/src/build.js` — static build: quality **GATE** (blocks publish on violations), incremental build, orphan pruning, sitemap/RSS/robots/JSON-LD, `_headers` (CSP).
- `platform/src/blocks.js` — renders **typed content blocks** to semantic HTML.
- `platform/src/templates.js` — layout, tokens-driven design, light/dark, A11y, `<html lang="en">`.
- `platform/src/check.js` — post-build verification (broken links, alt, headings, contrast AA computed, unique titles, JS budget).
- `platform/content/` — the swappable content (`site.json`, `authors.json`, `taxonomy.json`, `pages.json`, `articles/*.json`). Read a few existing `articles/*.json` to learn the exact JSON schema.

**Reuse process:** keep `platform/src/*` identical. Replace `platform/content/*` with the new niche. Set `platform/wrangler.jsonc` `name` to the new worker name. Keep `.github/workflows/deploy.yml` (auto-deploy on push to `main` via `npx wrangler@4 deploy`, using repo secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` — the SAME Cloudflare token works account-wide).

## 2. Content contract (so every article passes the GATE)

Each `articles/*.json` must have: unique `id`, `slug`, valid `clusterId`, `title`, `dek` (≥40 chars, answer-first), `authorId`, honest `publishedAt` + `updatedAt` (real dates; set `updatedAt = publishedAt` for new posts — no fake "updated"), `intent.primaryKeyword` (**unique across the whole site** — no cannibalization), `seo.metaTitle` (≤60 chars, unique), `seo.metaDescription` (≤155 chars, unique), `sources` (≥1 real, verifiable URL), and `body` (array of typed blocks with **≥2 `heading` level-2**, **≥1 internal link** via `{ "link": { "ref": "article:<id>", "text": "…" } }`, and a `faq` block). Block types: paragraph, heading, list, callout(info/tip/warn), table (caption required), code, image (alt required), quote, faq, divider. richText is a string or an array of spans: `"text"`, `{"b":"…"}`, `{"i":"…"}`, `{"code":"…"}`, `{"link":{…}}`. **Watch JSON validity** around link spans (no trailing commas, link objects are standalone array elements).

Run `node platform/src/build.js --force && node platform/src/check.js` until green. Then verify in a real browser (Chromium/Playwright) — screenshots + zero console errors + readable without JS + no mobile horizontal scroll. Only then commit.

## 3. The niche: Careers, Skills & Certifications (English, Tier-1 audience)

Answer the highest-intent, lowest-competition long-tail of people planning careers and upskilling. This ranks fast (weak competition), is low-YMYL (easy AdSense), scales to thousands of articles, and has strong affiliate + infoproduct upside.

**Taxonomy (pillars → clusters):**
- **Career Paths** — "How to become a [role]" (steps, realistic timeline, cost, day-to-day, pros/cons).
- **Salaries** — "[role] salary", "how much does a [role] make" — **must cite real sources** (e.g., US BLS, official data). Never invent numbers.
- **Certifications & Courses** — "Best certifications for [field]", "is [cert] worth it", "[cert A] vs [cert B]" — the **commercial/money** cluster (affiliate to course/cert platforms).
- **Skills** — "How to learn [skill]", "[skill] for beginners", "how long to learn [skill]".

**Title formulas (generate hundreds):** `How to become a [role]` · `[role] salary [year]` · `Is a [cert] worth it?` · `Best certifications for [field]` · `[cert A] vs [cert B]` · `How to get into [field] with no experience` · `How long does it take to become a [role]` · `Best online courses for [skill]` · `Do you need a degree to be a [role]?`

**Monetization:** AdSense (education/recruiting ads, est. RPM ~US$8–20 Tier-1) is the base. The real upside is **affiliate** (Coursera, Udemy, bootcamps, cert vendors — pay per signup) on the commercial cluster, plus **own infoproducts** later (resume templates, career roadmaps, study guides). Prioritize the commercial cluster for revenue; use how-to/salary content to rank fast and funnel readers (and Google's trust) into it via internal links.

## 4. How to beat the competitors (this is the mission)

Audit the page-one results for a target query, then be strictly better on every axis competitors are weak on:
- They give **vague steps** → you give **concrete, ordered steps with realistic timelines and real costs**.
- They **invent or omit salary data** → you **cite official sources** and show ranges by experience/region.
- They write **fluffy "is it worth it"** → you give an **honest verdict with real pros AND cons**, and who it's NOT for.
- They have **walls of text** → you use **answer-first deks, comparison tables, and FAQs** (win featured snippets + AI Overviews).
- They're **thin and disconnected** → you build **deep topical clusters with dense, relevant internal links** (path → salary → certs → courses).
- They're **slow and ad-choked** → you ship **~20KB pages, no layout shift, readable without JS** (the engine already does this).

## 5. Non-negotiable honesty & anti-deindexation guardrails

- **Never publish through the disabled gate.** Quality is enforced by code, not vibes.
- **Never fabricate**: no invented statistics, no fake screenshots, no fake author credentials, no backdated "history", no cosmetic date bumps. Cite real sources. If a claim can't be sourced, cut it or soften it.
- **One intent → one URL.** The gate blocks cannibalization; respect it.
- **Institutional authorship is fine early, labeled honestly** (see `authors.json`), but a real named expert is stronger for career/certification advice — plan to add one before wide launch.
- **Scaled content is a deindexation risk when it's thin.** Your defense is that every page genuinely satisfies intent better than the incumbents. Publish at a steady, human pace after the domain is live; a new site launching with ~12–15 excellent articles is safe.

## 6. First deliverables (do these, in order)

1. Reconfigure `platform/content/`: `site.json` (name, tagline, promise, `contactEmail` placeholder, honest editorial policy), `authors.json` (institutional team, honest bio), `taxonomy.json` (the 4 pillars above + clusters), `pages.json` (Privacy Policy covering AdSense/cookies + Contact).
2. Generate a first batch of **12–15 interlinked articles**, mixing fast-ranking (how-to-become, salary, how-to-learn) with commercial (best certifications, is-X-worth-it, cert-vs-cert). Real sources, honest dates (recent, `updatedAt = publishedAt`), unique primaryKeywords, dense internal links from informational → commercial pages.
3. Build + check + verify in a real browser. Fix everything until green.
4. Commit and push to `main` (auto-deploy). Confirm the GitHub Action run succeeds.

## 7. Definition of done

Gate green; check green (links, alt, headings, contrast AA, unique meta, JS budget); real-browser pass (no console errors, mobile OK, readable without JS); Privacy + Contact live; sitemap/RSS present; auto-deploy succeeded. Then report: what was built, the honest pending items (real contact email, custom domain, real author, field CWV — which require the user's action or a live domain), and the AdSense-readiness checklist.

**Remember:** you are building an asset you would stake your own money on. Better than the competition, honest to the core, and built to survive every Google update. Now build it.
