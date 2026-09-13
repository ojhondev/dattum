# Dattum

Consultoria de compliance LGPD + DPO-as-a-Service, exclusiva para e-commerces, operada
por uma plataforma própria. Modelo: diagnóstico técnico-jurídico gratuito → sprint de
regularização de 10 dias úteis → assinatura recorrente de Encarregado (DPO).

- **Não é** escritório de advocacia genérico, nem selo/certificação, nem uma notificação
  da ANPD — o diagnóstico é sempre um documento privado, assinado e identificado como
  Dattum (ver PRD §03, decisão vinculante sobre o mecanismo de urgência).
- Visão completa de produto em [`docs/PRD.md`](docs/PRD.md).
- Fonte da landing page publicada em [`design/landing.html`](design/landing.html)
  (versão estática usada como artifact) — o app Next.js em `app/` é a versão canônica.

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript
- CSS próprio (design tokens em `app/globals.css`) — sem Tailwind na landing, seguindo o
  design system jurídico-corporativo do PRD §10 (navy + dourado envelhecido, serifa
  Spectral + Inter + IBM Plex Mono via `next/font/google`)
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
