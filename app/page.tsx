"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ArrowRight, ArrowUpRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "#problema", label: "O Problema" },
  { href: "#solucao", label: "Soluções" },
  { href: "#por-que-agora", label: "Jurídico" },
  { href: "#planos", label: "Planos" },
];

type ModuleKey = "rat" | "dpa" | "subprocessadores" | "auditoria";

const MODULES: {
  key: ModuleKey;
  slug: string;
  simples: string;
  tecnico: string;
  descricao: string;
  url: string;
}[] = [
  {
    key: "rat",
    slug: "rat",
    simples: "O que fazemos com o dado de cada cliente",
    tecnico: "Registro de Atividades de Tratamento (RAT)",
    descricao:
      "Gerado automaticamente pra cada conta de cliente: qual ferramenta usa o dado, pra quê, com que base legal. O inventário que a LGPD exige e que, na prática, quase nenhuma agência mantém atualizado.",
    url: "painel.dattis.com/contas/loja-aurora/rat",
  },
  {
    key: "dpa",
    slug: "dpa",
    simples: "O contrato entre você e seu cliente",
    tecnico: "Contrato de Operador de Dados (DPA)",
    descricao:
      "Formaliza quem é operador e quem é controlador entre a agência e o cliente dela — protege vocês se o cliente tentar jogar toda a responsabilidade pra cima da agência. Assinatura eletrônica direto na plataforma.",
    url: "painel.dattis.com/contas/loja-aurora/dpa",
  },
  {
    key: "subprocessadores",
    slug: "subprocessadores",
    simples: "Quem mais mexe nesse dado",
    tecnico: "Registro de subprocessadores",
    descricao:
      "Toda ferramenta que toca o dado do cliente — Meta Ads, WhatsApp Business API, RD Station — mapeada por conta, com alerta quando uma ferramenta nova entra sem contrato.",
    url: "painel.dattis.com/subprocessadores",
  },
  {
    key: "auditoria",
    slug: "auditoria",
    simples: "Verificação contínua, não uma vez só",
    tecnico: "Auditoria periódica",
    descricao:
      "A Dattis reroda o motor de diagnóstico sobre as campanhas ativas da agência — pixel, cookie, canal do titular — pra pegar o que mudou antes que vire multa.",
    url: "dattis.com/auditoria/loja-aurora",
  },
];

const PROBLEMA_CARDS = [
  {
    titulo: "2% de multa\nsob faturamento",
    texto: "Sua agência pode sofrer multa de até 2% do faturamento, limitada a R$ 50 milhões por infração.",
  },
  {
    titulo: "Proibição no\nTratamento de Dados",
    texto:
      "Medida prevista no art. 52 a ANPD pode determinar a proibição parcial ou total do exercício de atividades relacionadas ao tratamento de dados.",
  },
  {
    titulo: "Indiciamento\ncriminal",
    texto: "Condutas envolvendo dados pessoais podem gerar responsabilidade civil e  responsabilização criminal",
  },
];

const MISSAO_PILLS = [
  "Gerar RAT por conta",
  "Assinar DPA eletronicamente",
  "Mapear subprocessadores",
  "Rodar auditoria periódica",
  "Centralizar canal do titular",
  "Consolidar tudo no DAT",
];

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-background text-foreground">
      {/* announcement bar */}
      <a
        href="mailto:contato@dattis.com?subject=Preciso%20de%20ajuda%20urgente%20com%20LGPD"
        className="block bg-gradient-to-r from-primary via-primary/45 to-white py-2 text-center text-[13px] font-semibold text-secondary underline underline-offset-2 hover:no-underline"
      >
        Sofreu uma denúncia ou multa? Fale com a gente com urgência
      </a>

      {/* nav */}
      <header className="sticky top-0 z-50 bg-secondary text-secondary-foreground">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/brand/logo-fundo-dark.png" alt="Dattis" width={110} height={21} priority className="h-[21px] w-auto" />
          </Link>

          <nav className="hidden items-center gap-1 rounded-full bg-[#e6fffa] p-1.5 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/agendar" className="hidden text-sm font-semibold text-secondary-foreground hover:opacity-80 sm:block">
              Agendar um papo
            </Link>
            <Link href="/cadastro" className={cn(buttonVariants(), "rounded-full text-secondary")}>
              Começar
            </Link>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <Button variant="ghost" size="icon" className="text-secondary-foreground md:hidden" onClick={() => setMobileOpen(true)}>
                <Menu />
              </Button>
              <SheetContent side="right" className="w-full bg-secondary text-secondary-foreground sm:max-w-xs">
                <SheetHeader className="flex-row items-center justify-between">
                  <SheetTitle className="text-secondary-foreground">
                    <Image src="/brand/logo-fundo-dark.png" alt="Dattis" width={100} height={19} className="h-[19px] w-auto" />
                  </SheetTitle>
                  <SheetClose render={<Button variant="ghost" size="icon" className="text-secondary-foreground" />}>
                    <X />
                  </SheetClose>
                </SheetHeader>
                <nav className="flex flex-col gap-1 px-4">
                  {NAV_LINKS.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className="border-b border-white/10 py-3 font-display text-xl font-medium"
                    >
                      {l.label}
                    </a>
                  ))}
                </nav>
                <div className="mt-auto flex flex-col gap-2 p-4">
                  <Link
                    href="/entrar"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "border-white/25 bg-transparent text-secondary-foreground hover:bg-white/10 hover:text-secondary-foreground"
                    )}
                  >
                    Entrar
                  </Link>
                  <Link href="/cadastro" className={cn(buttonVariants(), "rounded-full text-secondary")}>
                    Começar grátis
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main>
        {/* hero */}
        <section className="relative bg-secondary px-5 pt-14 pb-16 text-center text-secondary-foreground sm:pt-20 sm:pb-24">
          <div className="mx-auto max-w-6xl">
            <p className="mb-5 text-xs text-secondary-foreground/55">
              Baseado na Lei 13.709/2018 (LGPD) · feito para agências de tráfego pago
            </p>
            <h1 className="mx-auto text-5xl leading-[1.35] font-semibold text-balance sm:text-7xl">
              Agência de Tráfego:
              <br />
              Descumprir a LGPD gera multas.
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-secondary-foreground/70">
              Captação, armazenamento e gestão de dados sem os controles adequados podem expor sua agência a riscos e
              multas de milhares de reais.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/cadastro"
                className={cn(buttonVariants({ size: "lg" }), "h-11 rounded-full px-7 text-[15px] text-secondary")}
              >
                Começar
              </Link>
              <Link
                href="/agendar"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-11 rounded-full border-white/30 bg-transparent px-7 text-[15px] text-secondary-foreground hover:bg-white/10 hover:text-secondary-foreground"
                )}
              >
                Agendar um papo
              </Link>
            </div>
          </div>
        </section>

        <div className="relative z-10 -mt-10 px-5 sm:-mt-20">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border-4 border-primary/70 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/marketing/demo-plataforma.png" alt="Demonstração da plataforma Dattis" className="w-full" />
          </div>
        </div>

        {/* problema */}
        <section id="problema" className="px-5 pt-16 pb-20 sm:pt-20 sm:pb-24">
          <div className="mx-auto max-w-5xl">
            <p className="mb-5 font-mono text-[13px] font-bold tracking-[0.1em] text-secondary uppercase">O problema</p>
            <h2 className="max-w-4xl text-3xl leading-tight font-semibold text-balance text-muted-foreground sm:text-4xl">
              Sua agência gera, coleta, cruza e compartilha dados pessoais todos os dias para criar e executar
              campanhas. Mas quem garante que todo esse tratamento está de{" "}
              <span className="text-primary">acordo com a lei?</span>
            </h2>
            <div className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-6">
              {PROBLEMA_CARDS.map((c) => (
                <div key={c.titulo}>
                  <h3 className="text-xl leading-tight font-semibold text-secondary whitespace-pre-line">{c.titulo}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* solução */}
        <section id="solucao" className="relative overflow-hidden bg-secondary px-5 py-24 text-secondary-foreground sm:py-28">
          <Image
            src="/marketing/solucao-glow.png"
            alt=""
            fill
            aria-hidden
            className="pointer-events-none object-cover object-top opacity-90"
          />
          <div className="relative mx-auto max-w-5xl text-center">
            <Badge variant="outline" className="mb-4 border-primary/40 font-mono text-[11px] font-semibold tracking-wide text-primary uppercase">
              A solução
            </Badge>
            <h2 className="mx-auto max-w-2xl text-3xl leading-tight font-semibold text-balance sm:text-4xl">
              A Dattis entende de agência e torna tudo mais seguro: para você e para o cliente
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-secondary-foreground/75">
              Transforma a exposição da sua agência como operadora numa rotina de documentos — do jeito que a
              contabilidade já é: fixa, recorrente, e resolvida antes de virar problema.
            </p>

            <div className="mx-auto mt-8 flex max-w-md items-center gap-3 rounded-full border border-white/20 bg-white/5 py-2 pr-2 pl-4 text-left backdrop-blur-sm">
              <Badge className="shrink-0 bg-primary text-primary-foreground">DAT gerado</Badge>
              <span className="text-sm text-secondary-foreground/85">A Dattis atualizou o DAT da conta. Envie por e-mail pro cliente.</span>
            </div>
            <p className="mx-auto mt-3 max-w-md text-xs text-secondary-foreground/55">
              O DAT reúne o status do RAT, do DPA e dos subprocessadores de uma conta num único documento — a prova de
              conformidade que sua agência manda pro cliente dela.
            </p>
          </div>

          <div className="relative mx-auto mt-20 flex max-w-5xl flex-col gap-20 sm:mt-28 sm:gap-28">
            {MODULES.map((m, i) => (
              <div
                key={m.key}
                className={cn(
                  "flex flex-col items-center gap-8 sm:gap-12 md:flex-row",
                  i % 2 === 1 && "md:flex-row-reverse"
                )}
              >
                <div className="flex-1 text-center md:text-left">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1 font-mono text-[12px] font-semibold text-secondary-foreground/70">
                    <span className="opacity-55">dattis/</span>
                    {m.slug}
                  </span>
                  <h3 className="mt-4 text-2xl leading-tight font-semibold text-secondary-foreground sm:text-3xl">
                    {m.simples}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-secondary-foreground/70">{m.descricao}</p>
                  <Link
                    href="/cadastro"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-80"
                  >
                    Começar agora <ArrowRight className="size-4" />
                  </Link>
                </div>
                <div className="flex-1">
                  <div className="overflow-hidden rounded-2xl border-2 border-primary/50 shadow-2xl shadow-black/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/marketing/demo-plataforma.png"
                      alt={`Tela de ${m.tecnico} na plataforma Dattis`}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* por que agora — credibilidade real, sem depoimento fabricado */}
        <section id="por-que-agora" className="border-t border-border px-5 py-20 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <Card className="grid gap-0 overflow-hidden p-0 sm:grid-cols-2">
              <div className="flex aspect-video items-center justify-center bg-muted sm:aspect-auto">
                <span className="font-mono text-xs text-muted-foreground">[Foto/vídeo do cliente entra aqui]</span>
              </div>
              <div className="flex flex-col justify-center gap-4 p-8">
                <span className="font-mono text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Ler o caso completo ↗
                </span>
                <p className="text-xl leading-snug font-semibold text-balance">
                  &ldquo;[Depoimento real de uma agência cliente entra aqui — resultado que a Dattis trouxe pra
                  operação dela]&rdquo;
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">[Nome do responsável]</span> [Cargo] na [Nome da
                  agência]
                </p>
                <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4">
                  <div>
                    <p className="font-mono text-2xl font-bold text-foreground">[00]+</p>
                    <p className="text-xs text-muted-foreground">Agências atendidas</p>
                  </div>
                  <div>
                    <p className="font-mono text-2xl font-bold text-foreground">[00]</p>
                    <p className="text-xs text-muted-foreground">Contas por agência</p>
                  </div>
                  <div>
                    <p className="font-mono text-2xl font-bold text-foreground">[00]d</p>
                    <p className="text-xs text-muted-foreground">Sprint de higienização</p>
                  </div>
                </div>
              </div>
            </Card>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {["Agência A", "Agência B", "Agência C", "Agência D"].map((label) => (
                <div
                  key={label}
                  className="flex h-16 items-center justify-center rounded-lg border border-dashed border-border font-mono text-xs text-muted-foreground"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* missão / CTA final */}
        <section className="bg-secondary px-5 py-20 text-center text-secondary-foreground sm:py-24">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl leading-snug font-semibold text-balance sm:text-3xl">
              Compliance de agência, do jeito que a contabilidade já é: fixo, recorrente, e resolvido antes de virar
              problema.
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {MISSAO_PILLS.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-white/20 px-4 py-2 text-[13px] font-medium text-secondary-foreground/80"
                >
                  {p}
                </span>
              ))}
            </div>
            <Link href="/cadastro" className={cn(buttonVariants({ size: "lg" }), "mt-10 h-12 rounded-full px-7 text-base text-secondary")}>
              Começar grátis <ArrowRight />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-5 py-14">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <Image src="/brand/logo-fundo-claro.png" alt="Dattis" width={100} height={19} className="h-[19px] w-auto" />
            <p className="mt-4 max-w-[26ch] text-sm text-muted-foreground">
              Compliance LGPD para agências de tráfego pago e lançamento.
            </p>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">Plataforma</p>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li><a href="#solucao" className="hover:text-foreground">RAT</a></li>
              <li><a href="#solucao" className="hover:text-foreground">DPA</a></li>
              <li><a href="#solucao" className="hover:text-foreground">Subprocessadores</a></li>
              <li><a href="#solucao" className="hover:text-foreground">Auditoria</a></li>
              <li><a href="#solucao" className="hover:text-foreground">DAT</a></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">Empresa</p>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li><Link href="/diagnostico" className="hover:text-foreground">Diagnóstico Expresso</Link></li>
              <li><Link href="/auditoria" className="hover:text-foreground">Auditoria pública</Link></li>
              <li><Link href="/entrar" className="hover:text-foreground">Entrar</Link></li>
              <li><Link href="/cadastro" className="hover:text-foreground">Criar conta</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">Contato</p>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <a href="mailto:contato@dattis.com" className="inline-flex items-center gap-1 hover:text-foreground">
                  contato@dattis.com <ArrowUpRight className="size-3.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-6xl border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Dattis. Baseado na Lei nº 13.709/2018 (LGPD).
        </div>
      </footer>
    </div>
  );
}
