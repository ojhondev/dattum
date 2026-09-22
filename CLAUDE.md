# Dattum → Dattis (pivô v3, em andamento desde 2026-09-21)

**A marca é agora Dattis** — não mexer no nome do repositório GitHub
(`github.com/ojhondev/dattum`) nem no diretório (`A:\Dattum`), só no que aparece pro
usuário (copy, `<title>`, metadados, logo textual). O resto desta seção (abaixo) descreve
o produto **v2.0/Dattum**, ainda parcialmente válido mas **sendo substituído** pelo pivô
v3/Dattis:

- **ICP mudou**: de "agências de marketing digital e de lançamento" (genérico) para
  especificamente **agências de tráfego pago/performance** — pela dor operacional
  concreta delas: upload de Custom Audiences, CAPI/Enhanced Conversions com PII
  hasheada, leads via WhatsApp/CRM, landing pages sem consentimento. Tese explícita:
  **não é canal/revenda white-label** (ex: DPONet) — a agência é sempre cliente direta.
- **Produto**: 13 módulos em 5 grupos (A Entrada/Ativação, B Núcleo de conformidade por
  conta — RAT/DPA/subprocessadores/consent, C Operação contínua — alertas/treinamento/
  relatório, D DPO as a Service — camada humana que atravessa tudo, E Prova/crise —
  selo/incidente/dossiê Meta). Só 3 módulos são MVP: RAT automatizado, Gerador de DPA,
  Registro de subprocessadores — os demais (incl. DPO as a Service) são v1.1/v2, **não
  construir antes de validar** (ver roadmap do PRD: validação manual → playbook → MVP).
- **Ferramenta de Diagnóstico Expresso já é real**, portada em
  [`app/diagnostico/page.tsx`](app/diagnostico/page.tsx): 19 perguntas / 8 categorias
  (A–G risco, H sinal comercial), Sim=0/Parcial=1/Não=2 pontos, score por categoria
  (normalizado só pelas respondidas) + score geral (denominador **fixo** = todas as 17
  perguntas de risco × 2, não só as respondidas — ver algoritmo original, portado
  fielmente), níveis Baixo/Médio/Alto/Crítico (0–25/26–50/51–75/76–100%), resumo
  copiável, histórico em `localStorage` (`dattis_diag_history_v1`).
- **Identidade visual da ferramenta é IDÊNTICA à Aikido** (aikido.dev), a pedido
  explícito do usuário — não ao sistema Deel-based do site de marketing abaixo. Tokens
  extraídos ao vivo (`getComputedStyle` no :root, no botão primário real, no navbar):
  roxo `#6551f3` (`--primary--aiki--100`), escala neutra "carbon" `#f5f5f6`→`#010024`,
  escala de severidade vermelho/laranja/verde (sem amarelo — Aikido não tem essa 4ª
  matiz, então Médio e Alto usam dois tons de laranja, só Crítico é vermelho). Fonte
  real da Aikido é "Newgrotesk" (proprietária) — substituída por Inter (já carregada
  como `--font-body-fam`); Mono é JetBrains Mono (`--font-mono-fam`, novo). Todos os
  tokens ficam escopados em `.diag-page` (`app/diagnostico/diagnostico.css`), **não**
  em `:root` — não colidem com os tokens Deel-based do site em `app/globals.css`.
- **A home (`/`) ainda está no sistema visual e copy antigos (Dattum/Deel-based)** —
  branding e design da home ainda não foram atualizados pro pivô Dattis/Aikido. Não
  assumir que a home já reflete o novo posicionamento até isso ser feito explicitamente.
- **`/diagnostico` é fluxo estilo Typeform** (2026-09-21, a pedido do usuário): uma
  pergunta por tela, avanço automático (~380ms após clicar), score de risco fixo no
  header (persiste entre as telas), tela de resultado completo no final. Mesma lógica
  de score de antes, só a apresentação mudou pra sequencial.
- **`/auditoria` é nova (2026-09-22)**: usuário cola a URL de um site, o backend
  (`app/api/auditoria/route.ts`, rota dinâmica Node) faz `fetch` server-side do HTML
  público e roda checagem heurística por regex — pixels (Meta/GA/GTM/TikTok/LinkedIn/
  Google Ads), formulário capturando e-mail/telefone, link de WhatsApp, widget de chat,
  banner de consentimento de cookies (CMPs conhecidos + texto genérico), link de
  política de privacidade, HTTPS. Cada achado tem peso; score = pontos atingidos ÷ 17
  (mesmas faixas Baixo/Médio/Alto/Crítico do Diagnóstico). Frontend em
  `app/auditoria/page.tsx` + `auditoria.css` (mesmos tokens Aikido, duplicados do
  `diagnostico.css` — as duas rotas ainda não compartilham um módulo de tokens comum).
  **Isso é uma varredura heurística do HTML público, não uma auditoria jurídica** — não
  vê backend, cookies definidos após interação, nem contratos. O disclaimer no resultado
  e o footer deixam isso explícito; nunca reportar um achado que a regex não confirmou
  de verdade (sem fabricar violação). Proteção básica contra SSRF: bloqueia localhost,
  IPs privados (10.*/172.16-31.*/192.168.*/169.254.*) e hostname sem ponto.

---

## Produto v2.0 (Dattum, pré-pivô — parcialmente superseded, ver acima)

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
  prova social fabricada em `.marcas` ou `#exemplo` — mesmo princípio do PRD §03.
- **Exceção deliberada e confirmada pelo usuário** (2026-09-16): o `.trust-strip`
  (carrossel de placeholders logo abaixo do hero) usa a frase "Somos a escolha de mais
  de 100 agências..." — um número não verificado. Alertei sobre o conflito direto com a
  regra acima antes de implementar; o usuário optou explicitamente por "usar o texto
  como pedido, mesmo sem comprovação". Não reverter silenciosamente sem perguntar de
  novo — mas também não tratar essa exceção pontual como licença pra reintroduzir
  prova social fabricada em nenhuma outra seção.

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
