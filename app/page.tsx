"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ArrowRight, ArrowUpRight, ShieldAlert, Scale, FileWarning } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

function BrowserChrome({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden py-0 ring-foreground/10 shadow-2xl shadow-black/10">
      <div className="flex items-center gap-1.5 border-b border-border bg-muted/60 px-4 py-3">
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="ml-2 truncate font-mono text-[11px] text-muted-foreground">{url}</span>
      </div>
      <div className="min-h-[320px] p-6 sm:p-8">{children}</div>
    </Card>
  );
}

function FieldPair({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <p className="mb-1 font-mono text-[11px] font-bold tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="text-sm leading-relaxed text-foreground/90">{value}</p>
    </div>
  );
}

function RatPreview() {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-5">
      <h4 className="mb-4 font-semibold text-foreground">Conversion API (CAPI) e Custom Audiences</h4>
      <div className="grid grid-cols-2 gap-4">
        <FieldPair
          full
          label="Categorias de dado"
          value="Dado de contato hasheado (e-mail, telefone), identificador de dispositivo, evento de conversão"
        />
        <FieldPair label="Finalidade" value="Otimizar e mensurar campanhas de tráfego pago via Meta Ads em nome do cliente" />
        <FieldPair label="Base legal" value="Legítimo interesse do controlador e execução do contrato (art. 7º, IX e V, LGPD)" />
        <FieldPair label="Titulares" value="Leads e clientes do cliente final atendido pela agência" />
        <FieldPair label="Prazo de retenção" value="Enquanto durar a campanha ativa, mais 6 meses" />
      </div>
    </div>
  );
}

function DpaPreview() {
  return (
    <div>
      <Badge className="mb-4 bg-accent text-accent-foreground">Assinado eletronicamente</Badge>
      <div className="rounded-lg border border-border bg-muted/40 p-5 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-foreground/90">
        {`CONTRATO DE OPERAÇÃO DE DADOS PESSOAIS (DPA)

Firmado nos termos da Lei nº 13.709/2018 (LGPD), entre:
OPERADORA: Agência Aurora Tráfego.
CONTROLADORA: Loja Aurora.

1. OBJETO
A Agência tratará dados pessoais em nome do Cliente exclusivamente
para a execução dos serviços de tráfego pago contratados...

3. SUBPROCESSADORES AUTORIZADOS
  - Meta Ads (Facebook/Instagram)
  - WhatsApp Business API`}
      </div>
    </div>
  );
}

function SubprocessadoresPreview() {
  const rows = [
    { nome: "Meta Ads (Facebook/Instagram)", categoria: "Publicidade", contas: 24 },
    { nome: "Google Ads / Google Analytics", categoria: "Publicidade", contas: 19 },
    { nome: "WhatsApp Business API", categoria: "Atendimento", contas: 22 },
    { nome: "RD Station", categoria: "CRM/Automação", contas: 11 },
  ];
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th className="border-b border-border px-3 py-2.5 text-left font-mono text-[10.5px] font-bold tracking-wide text-muted-foreground uppercase">Ferramenta</th>
          <th className="border-b border-border px-3 py-2.5 text-left font-mono text-[10.5px] font-bold tracking-wide text-muted-foreground uppercase">Categoria</th>
          <th className="border-b border-border px-3 py-2.5 text-left font-mono text-[10.5px] font-bold tracking-wide text-muted-foreground uppercase">Em quantas contas</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.nome}>
            <td className="border-b border-border px-3 py-3 text-foreground/90 last:border-0">{r.nome}</td>
            <td className="border-b border-border px-3 py-3 text-foreground/90 last:border-0">{r.categoria}</td>
            <td className="border-b border-border px-3 py-3 text-foreground/90 last:border-0">{r.contas}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AuditoriaPreview() {
  const findings = [
    { label: "Meta Pixel / CAPI", detail: "Confirmado por requisição de rede real", bad: true },
    { label: "Banner de consentimento de cookies", detail: "Não encontrado no DOM renderizado", bad: true },
    { label: "HTTPS", detail: "Certificado válido", bad: false },
    { label: "Política de privacidade", detail: "Link encontrado no rodapé", bad: false },
  ];
  return (
    <div>
      <div className="mb-5 flex items-center gap-5">
        <div
          className="flex size-[72px] shrink-0 items-center justify-center rounded-full"
          style={{ background: "conic-gradient(var(--chart-2) 132deg, var(--border) 0)" }}
        >
          <div className="flex size-[55px] flex-col items-center justify-center rounded-full bg-card">
            <span className="text-base leading-none font-bold text-foreground">38%</span>
            <span className="mt-0.5 font-mono text-[8px] font-bold text-muted-foreground uppercase">Médio</span>
          </div>
        </div>
        <div>
          <p className="mb-1 text-[15px] font-semibold text-foreground">Risco Médio — dá pra corrigir rápido, antes que vire problema</p>
          <p className="font-mono text-[13px] text-muted-foreground">lojaaurora.com.br</p>
        </div>
      </div>
      {findings.map((f) => (
        <div key={f.label} className="flex items-start gap-2.5 border-b border-border py-2.5 last:border-0">
          <span
            className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] ${
              f.bad ? "bg-destructive/15 text-destructive" : "bg-accent text-accent-foreground"
            }`}
          >
            {f.bad ? "!" : "✓"}
          </span>
          <div>
            <div className="text-sm font-semibold text-foreground">{f.label}</div>
            <div className="mt-0.5 text-[13px] text-muted-foreground">{f.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const PROBLEMA_CARDS = [
  {
    icon: Scale,
    titulo: "Multa solidária",
    texto:
      "Se sua agência sai das instruções do cliente — reaproveita lista entre contas, mistura CRM/WhatsApp de clientes diferentes — ela se equipara ao controlador e herda multa de até 2% do faturamento, limitada a R$ 50 milhões por infração (art. 52, LGPD).",
  },
  {
    icon: ShieldAlert,
    titulo: "Responsabilidade solidária",
    texto:
      "Como operadora, a agência responde junto com o cliente por qualquer dano ao titular do dado (art. 42, LGPD) — o titular pode acionar qualquer um dos dois, não só o dono da campanha.",
  },
  {
    icon: FileWarning,
    titulo: "Sem prova, sem defesa",
    texto:
      "Boa-fé e mitigação prévia reduzem a pena em caso de sanção (art. 52, §1º) — mas só valem se houver histórico documentado. Sem RAT, DPA e canal do titular registrados, não tem o que mostrar.",
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
  const [activeModule, setActiveModule] = useState<ModuleKey>("rat");
  const active = MODULES.find((m) => m.key === activeModule)!;

  return (
    <div className="bg-background text-foreground">
      {/* announcement bar */}
      <a
        href="mailto:contato@dattis.com?subject=Preciso%20de%20ajuda%20urgente%20com%20LGPD"
        className="block bg-gradient-to-r from-primary/70 via-primary to-primary/70 py-2 text-center text-[13px] font-semibold text-secondary underline underline-offset-2 hover:no-underline"
      >
        Sofreu uma denúncia ou multa? Fale com a gente com urgência
      </a>

      {/* nav */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-secondary text-secondary-foreground">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/brand/logo-fundo-dark.png" alt="Dattis" width={110} height={21} priority className="h-[21px] w-auto" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-secondary-foreground/80 transition-colors hover:bg-white/10 hover:text-secondary-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/entrar" className="hidden text-sm font-semibold text-secondary-foreground hover:opacity-80 sm:block">
              Entrar
            </Link>
            <Link href="/cadastro" className={cn(buttonVariants(), "rounded-full")}>
              Começar grátis
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
                  <Link href="/cadastro" className={cn(buttonVariants(), "rounded-full")}>
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
        <section className="px-5 pt-20 pb-16 text-center sm:pt-28 sm:pb-24">
          <div className="mx-auto max-w-3xl">
            <Badge variant="outline" className="mb-6 border-primary/40 font-mono text-[11px] font-semibold tracking-wide text-primary uppercase">
              Dattis · Compliance LGPD para agências de tráfego pago
            </Badge>
            <h1 className="mx-auto max-w-2xl text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
              Agência de tráfego: descumprir a LGPD sai caro.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-foreground/70">
              A Dattis gera, para cada cliente que sua agência atende, o registro do que vocês fazem com o dado dele, o
              contrato assinado entre vocês e a lista de ferramentas que também tocam esse dado — sem precisar
              contratar um advogado por documento.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/cadastro" className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-full px-7 text-base")}>
                Começar grátis <ArrowRight />
              </Link>
              <Link
                href="/diagnostico"
                className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-12 rounded-full px-7 text-base")}
              >
                Fazer o Diagnóstico Expresso
              </Link>
            </div>
            <p className="mt-6 font-mono text-xs text-muted-foreground">
              Baseado na Lei 13.709/2018 (LGPD) · feito para agências de tráfego pago e lançamento
            </p>
          </div>
        </section>

        {/* problema */}
        <section id="problema" className="border-t border-border px-5 py-20 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <Badge variant="outline" className="mb-4 font-mono text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              O problema
            </Badge>
            <h2 className="max-w-3xl text-3xl leading-tight font-semibold text-balance sm:text-4xl">
              Sua agência gera, coleta, cruza e compartilha dados pessoais todos os dias pra criar e executar campanhas
              dos seus clientes. Mas quem garante que todo esse tratamento está{" "}
              <span className="text-primary">de acordo com a lei?</span>
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {PROBLEMA_CARDS.map((c) => (
                <Card key={c.titulo} className="gap-3 p-6">
                  <c.icon className="size-5 text-primary" />
                  <h3 className="text-lg font-semibold">{c.titulo}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{c.texto}</p>
                </Card>
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

          <div className="relative mx-auto mt-14 max-w-4xl">
            <Tabs value={activeModule} onValueChange={(v) => setActiveModule(v as ModuleKey)}>
              <TabsList className="mx-auto mb-8 h-auto flex-wrap justify-center gap-2 bg-transparent p-0">
                {MODULES.map((m) => (
                  <TabsTrigger
                    key={m.key}
                    value={m.key}
                    className="rounded-full border border-white/20 bg-white/5 px-4 py-2 font-mono text-[13px] font-semibold text-secondary-foreground/70 data-active:border-primary data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none"
                  >
                    <span className="opacity-55">dattis/</span>
                    {m.slug}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="mb-6 text-center">
                <h3 className="text-xl font-semibold text-secondary-foreground sm:text-2xl">{active.simples}</h3>
                <p className="mt-1 font-mono text-[11px] tracking-wide text-primary uppercase">{active.tecnico}</p>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-secondary-foreground/70">{active.descricao}</p>
              </div>

              {MODULES.map((m) => (
                <TabsContent key={m.key} value={m.key}>
                  <BrowserChrome url={m.url}>
                    {m.key === "rat" && <RatPreview />}
                    {m.key === "dpa" && <DpaPreview />}
                    {m.key === "subprocessadores" && <SubprocessadoresPreview />}
                    {m.key === "auditoria" && <AuditoriaPreview />}
                  </BrowserChrome>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* por que agora — credibilidade real, sem depoimento fabricado */}
        <section id="por-que-agora" className="border-t border-border px-5 py-20 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <Badge variant="outline" className="mb-4 font-mono text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Por que agora
            </Badge>
            <h2 className="max-w-2xl text-3xl leading-tight font-semibold text-balance sm:text-4xl">
              O risco não é hipotético — já tem tese acadêmica e fiscalização real sobre isso
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <Card className="gap-2 p-6">
                <span className="font-mono text-3xl font-bold text-primary">180 mil+</span>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  agências de marketing e comunicação no Brasil, 91,3% com atuação digital — a grande maioria ainda
                  trata dado de cliente como responsabilidade só do controlador.
                </p>
              </Card>
              <Card className="gap-2 p-6">
                <span className="font-mono text-3xl font-bold text-primary">19 processos</span>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  abertos pela ANPD em um único mês (junho de 2026) — recorde histórico da autarquia. A fiscalização
                  está acelerando, não o contrário.
                </p>
              </Card>
              <Card className="gap-2 p-6">
                <span className="font-mono text-3xl font-bold text-primary">Tese publicada</span>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  A PUC Goiás já publicou pesquisa acadêmica específica sobre violação da LGPD por agências de
                  marketing digital — o cruzamento já é objeto de estudo, não hipótese.
                </p>
              </Card>
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
            <Link href="/cadastro" className={cn(buttonVariants({ size: "lg" }), "mt-10 h-12 rounded-full px-7 text-base")}>
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
