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
- Logo oficial em [`public/logo-dattum.png`](public/logo-dattum.png) (wordmark preto
  "dattum.", fundo transparente) — invertido via CSS (`.header-logo`) quando o fundo
  atrás dele é escuro (tema escuro do visitante, ou os blocos `--mast-bg` do site).
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

- Next.js 16 (App Router, Turbopack) + TypeScript, componente da home como Client
  Component (`"use client"`) só pela barra de utilidade fechável (`useState`)
- CSS próprio (design tokens em `app/globals.css`) — sem Tailwind. Identidade visual
  **v3 (site)**: preto/branco/creme + acento azul (`--blue`) para elementos
  informativos (barra de progresso, cards "Como a Dattum atua") + pills pastel
  azul/amarelo/verde, tipografia Inter 700–900 nos títulos + IBM Plex Mono nos labels.
  Isso **substitui** a identidade navy + dourado + serifa Spectral descrita no PRD §11
  (documento ainda não sincronizado com essa mudança — ver nota abaixo).
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
