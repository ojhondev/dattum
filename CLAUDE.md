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
- **`/auditoria` é nova (2026-09-22, upgrade pra crawler real em 2026-09-22)**:
  usuário cola a URL de um site, o backend (`app/api/auditoria/route.ts`, rota Node
  dinâmica) abre a página num **navegador headless real** (puppeteer-core +
  `@sparticuz/chromium-min`) — não é mais regex em HTML estático. Detecção:
  - Pixels/tags (Meta, GA/GTM, TikTok, LinkedIn, Google Ads) confirmados por
    **requisição de rede real** (`page.on('request')`, hostname da requisição) — pega
    tag injetada via GTM/JS depois do load.
  - Cookies reais lidos via CDP (`Network.getAllCookies`) pra corroborar (_fbp, _ga,
    _ttp etc.).
  - Consentimento, política de privacidade e formulário checados no **DOM renderizado**
    (`page.evaluate`), não no HTML cru — pega conteúdo montado via JS/SPA.
  Cada achado tem peso; score = pontos atingidos ÷ 17 (mesmas faixas Baixo/Médio/Alto/
  Crítico do Diagnóstico). Cada achado ativado vem com **"Como corrigir"** — passo a
  passo concreto (ex: ativar Google Consent Mode v2, instalar CMP), pedido explícito do
  usuário. Frontend em `app/auditoria/page.tsx` + `auditoria.css` (mesmos tokens Aikido,
  duplicados do `diagnostico.css` — as duas rotas ainda não compartilham um módulo de
  tokens comum).
  - **Infra serverless — armadilha já resolvida**: `@sparticuz/chromium` (com o binário
    embutido, ~35-52MB) falha em produção na Vercel com `"input directory .../bin does
    not exist"` — o Node File Tracing da Vercel não inclui o binário porque o caminho é
    resolvido em runtime, não via `require()` estático. Fix: `@sparticuz/chromium-min`
    (67KB, sem binário) + `chromium.executablePath(CHROMIUM_PACK_URL)` apontando pro
    pack oficial nos releases do GitHub do Sparticuz — baixado pra `/tmp` no cold start.
    **A versão do pack na URL tem que ficar em lockstep com a versão instalada do
    pacote** (não existe alias "latest" que funcione aqui, o nome do arquivo tem a
    versão). `next.config.ts` marca `puppeteer-core` e `@sparticuz/chromium-min` como
    `serverExternalPackages`. `maxDuration = 60` (cold start baixa o pack + sobe o
    browser + navega de verdade — bem mais lento que um `fetch` simples).
  - Local dev usa Chrome/Edge instalado na máquina (`resolveExecutablePath` detecta o
    binário local antes de cair pro pack remoto) — só a Vercel usa o pack do Sparticuz.
  **Isso é uma varredura automática com navegador real, ainda assim não é uma auditoria
  jurídica** — não vê backend, cookies definidos após interação do usuário, nem
  contratos. O disclaimer no resultado e o footer deixam isso explícito; nunca reportar
  um achado que o crawler não confirmou de verdade (sem fabricar violação). Proteção
  básica contra SSRF: bloqueia localhost, IPs privados (10.*/172.16-31.*/192.168.*/
  169.254.*) e hostname sem ponto, antes de abrir o navegador.

- **Painel operacional (`/painel`) é novo e real** (2026-09-22): os 3 módulos MVP do
  PRD — **RAT automatizado**, **Gerador de DPA**, **Registro de subprocessadores** —
  estão implementados fim a fim, testados no browser (cadastro → wizard → RAT/DPA/
  subprocessadores auto-gerados → assinatura → PDF → registro agregado).
  - **Banco**: Neon provisionado via Drizzle (`lib/db/schema.ts`, `lib/db/index.ts`,
    `drizzle.config.ts` — `npx drizzle-kit push` já rodado). Tabelas: `agencias`,
    `contas_cliente`, `subprocessadores_catalogo` (catálogo central seedado —
    `lib/db/seed.ts`, roda com `npx tsx lib/db/seed.ts` — Meta Ads, Google Ads,
    TikTok Ads, WhatsApp Business API, RD Station, Zapier), `conta_subprocessadores`,
    `atividades_tratamento` (RAT), `dpas`. **Regra não-negociável do PRD §12**: toda
    tabela de dado sensível tem `agencia_id`; dado por conta de cliente tem também
    `conta_cliente_id`; toda rota de API filtra por `agencia_id` da sessão, nunca
    confia em id vindo do client sem essa checagem.
  - **Auth**: sem NextAuth — `bcryptjs` (hash) + `jose` (JWT em cookie httpOnly
    `dattis_session`, 30 dias) em `lib/auth.ts`. `proxy.ts` (não `middleware.ts` —
    ver nota abaixo) protege tudo sob `/painel`, redireciona pra `/entrar` com
    `?proximo=`. MVP tem um único papel ("agência admin"); RBAC de analista/DPO/
    agência-operador do PRD fica pra v1.1/v2.
  - **Assinatura do DPA = click-wrap interno**, decisão confirmada com o usuário: nome
    + cargo + checkbox "li e concordo" grava `assinante_nome/cargo/assinado_em/
    assinado_ip` e trava o `conteudo_snapshot`. Sem integração de e-sig paga
    (ZapSign/Clicksign) nesse ciclo — troca fácil depois, schema já comporta.
  - **PDF do DPA** (`app/api/dpa/[id]/pdf/route.ts`) reaproveita a mesma infra
    puppeteer-core + `@sparticuz/chromium-min` da Auditoria — a lógica de resolver o
    executável (`resolveExecutablePath`) foi extraída pra `lib/browser.ts` e agora é
    compartilhada pelas duas rotas, pra não duplicar a armadilha do binário na
    Vercel (ver nota da Auditoria abaixo). Usa `page.setContent()` (não
    `page.goto()`) — sem navegação de rede, sem superfície de SSRF nova; **atenção**:
    `page.setContent` só aceita `waitUntil: "load"|"domcontentloaded"` no
    `puppeteer-core`, não `"networkidle0"` (isso é só pra `page.goto`).
  - **Wizard de ativação de conta** (`app/painel/contas/novo`): ao marcar os fluxos
    padrão (CAPI/Ads/WhatsApp/CRM), gera automaticamente as atividades de RAT
    correspondentes (`lib/rat-templates.ts` — `FLOW_TEMPLATES`), herda os
    subprocessadores do catálogo central pro fluxo marcado, e já cria o DPA em
    rascunho com o conteúdo montado (`gerarConteudoDpa`). Isso implementa
    literalmente a frase do PRD: "wizard importa as contas... e gera RAT + DPA
    automaticamente pra cada uma" + "base central... herdada por todas as contas".
  - **Linguagem da UI**: rótulo técnico nunca é o principal — "O que fazemos com o
    dado" (RAT), "Contrato com seu cliente" (DPA), "Quem mais mexe nesse dado"
    (subprocessadores), com o termo técnico como legenda pequena. Pedido explícito do
    usuário: "o lead não sabe o que é RAT, nem DPA, nem subprocessadores" — usa
    exatamente as frases "Simples" que já estavam na tabela de módulos do PRD.
  - **Diagnóstico e Auditoria continuam 100% abertos, sem login** — só ganharam um
    novo bloco de CTA (`.diag-cta` / `.audit-cta`) linkando pra `/cadastro` na tela
    de resultado. Nenhum comportamento anterior dessas duas rotas mudou.
  - **`middleware.ts` → `proxy.ts`**: no Next.js 16 a convenção `middleware` foi
    renomeada pra `proxy` (`export function proxy` em vez de `export function
    middleware`, mesmo `config.matcher`) — não recriar um `middleware.ts`, o arquivo
    correto é `proxy.ts` na raiz.
  - **Não implementado nesse ciclo** (fora de escopo, não confundir com pendência
    esquecida): edição/remoção de subprocessador customizado fora do wizard de
    ativação, CRUD de conta além de criar/excluir, qualquer papel além de "agência
    admin", e-sig real, e salvar resultado do Diagnóstico/Auditoria automaticamente
    numa conta logada.

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
- Banco: Neon (Postgres serverless) via Drizzle ORM — schema provisionado
  (2026-09-22), ver seção do painel operacional acima para as tabelas e convenções.

## Dev

- Dev server: `npm run dev` (porta 3012 em `A:/Velo/.claude/launch.json`, preview `dattum`).
- Build de produção + lint antes de commitar (`npm run build`, `npm run lint`).

## Convenções (ver `dev.md`)

- Ambiente mockado primeiro: toda integração real (scanner de diagnóstico, geração de
  PDF, etc.) entra com mock no formato da API real antes da integração de verdade.
- Commits pequenos e descritivos, em português, no imperativo.
- `.cache/` e `.tmp/` locais ao projeto, nunca `os.tmpdir()`.
