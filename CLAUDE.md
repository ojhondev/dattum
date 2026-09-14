# Dattum

Consultoria de compliance LGPD + DPO-as-a-Service para **agências de marketing digital
e de lançamento** (v2.0 — pivô de ICP, ver PRD nota de versão), operada por uma
plataforma própria. Modelo: diagnóstico de operador → sprint de higienização de 10 dias
úteis → assinatura recorrente dos onze serviços "obrigações acessórias" (PRD §09), por
faixa de contas de cliente geridas.

- **Não é** escritório de advocacia genérico, nem selo/certificação, nem uma notificação
  da ANPD — o diagnóstico é sempre um documento privado, assinado e identificado como
  Dattum (ver PRD §03, decisão vinculante sobre o mecanismo de urgência).
- **Não é mais** um produto vendido direto ao e-commerce como motor principal — isso
  virou canal secundário (Modelo A, PRD §02.2), repassado pelas agências assinantes. O
  produto original da v1.0 está preservado como Anexo A (PRD §19).
- Visão completa de produto em [`docs/PRD.md`](docs/PRD.md).
- Metodologia de investigação (reconhecimento público, teste "mystery lead", evidência
  documental) em [`docs/METODOLOGIA-INVESTIGACAO.md`](docs/METODOLOGIA-INVESTIGACAO.md)
  — agora central ao funil (PRD §05, §06.2), não mais um playbook à parte.
- Fonte da landing page publicada em [`design/landing.html`](design/landing.html) — o app
  Next.js em `app/` é a versão canônica, ambos sincronizados com o ICP de agências.
- Wordmark renderizado como texto (`.wordmark`, Barlow Condensed 600), não como imagem
  — `public/logo-dattum.png` (PNG antigo, preto sobre transparente) ficou obsoleto e
  não é mais referenciado pelo site.
- Imagens de pessoas/fotos na landing são **placeholders** (`.photo-placeholder`,
  `.diff-photo`) — texto "Imagem — placeholder", aguardando fotos reais do usuário.
- A landing segue a referência visual de 6 seções que o usuário mandou (baseada no
  layout da Deel, deel.com/pt, com copy própria da Dattum): utility bar → header →
  hero → `#solucoes` (3 cards com barra de progresso) → "Como a Dattum atua" (timeline
  3 colunas) → `#quem-atendemos` (2 painéis escuros: diferenciais + infra) → prova
  social honesta → `#exemplo` + `#precos` → footer. **Duas seções da referência não
  foram replicadas literalmente**: o carrossel de depoimentos de cliente (a Dattum não
  tem cliente real — substituído pela seção "Exemplo ilustrativo", `#exemplo`) e a
  alegação "mais de 500 agências" (número fictício do template — substituído por uma
  frase honesta + a lista de ferramentas auditadas, `.marcas`). Nunca reintroduzir
  prova social fabricada nessas seções — mesmo princípio do PRD §03.

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript, home como Client Component
  (`"use client"`) por causa da barra de utilidade fechável, do menu mobile, do
  seletor de dores (checkboxes reais com `aria-pressed`), do scroll-reveal
  (`IntersectionObserver`) e da animação de gauge/barras de progresso no load.
- CSS próprio (design tokens em `app/globals.css`) — sem Tailwind. Identidade visual
  **v4 (site)**, baseada em extração real de tokens do design da Deel (deel.com/pt):
  Cosmos (`#201547`, fundo do hero) + Violet (`#5938b7`, CTA) + Lavender (accent word,
  só na zona do hero) + Lime/Amber (hero-visual) + Obsidian (`#141414`, painéis escuros)
  sobre fundo Cream (`#fffbf4`, não branco puro). Tipografia: **Barlow Condensed**
  (500/600/700) nos títulos via `next/font/google`, **Inter** no corpo, IBM Plex Mono só
  em labels pequenos (chips de artigo de lei). Isso **substitui** a identidade v3
  (preto/branco/creme + azul) e a identidade navy/dourado/Spectral do PRD §11 (documento
  ainda não sincronizado com essa mudança).
- Hero **full-bleed** (`.hero`, sem `.wrap`, sem border-radius, grid de 2 colunas) —
  layout de referência real da Deel, não um card contido.
- Wordmark é **texto estilizado** (`dattum.` em Barlow Condensed 600), não mais a
  imagem `public/logo-dattum.png` — decisão espelhando como a própria Deel renderiza
  "deel." como texto, não logo.
- **Identidade de marca fixa**: o site não se adapta ao tema (claro/escuro) do sistema
  do visitante — igual à própria Deel. Não reintroduzir `@media (prefers-color-scheme:
  dark)` ou `[data-theme="dark"]` sobre os tokens de página (`--cream`, `--graphite`
  etc.); só os blocos deliberadamente escuros (`--cosmos`, `--obsidian`) são escuros,
  sempre.
- Deploy: Vercel — repositório `github.com/ojhondev/dattum`
- Banco: Neon (Postgres serverless), a provisionar conforme o MVP (PRD §13) precisar de
  schema real — nenhuma tabela ainda, este é o estágio de provisionamento de infra.

## Dev

- Dev server: `npm run dev` (porta 3012 em `A:/Velo/.claude/launch.json`, preview `dattum`).
- Build de produção + lint antes de commitar (`npm run build`, `npm run lint`).

## Convenções (ver `dev.md`)

- Ambiente mockado primeiro: toda integração real (scanner de diagnóstico, geração de
  PDF, etc.) entra com mock no formato da API real antes da integração de verdade.
- Commits pequenos e descritivos, em português, no imperativo.
- `.cache/` e `.tmp/` locais ao projeto, nunca `os.tmpdir()`.
