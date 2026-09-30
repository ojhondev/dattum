import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CircleCheck,
  FileText,
  FileSignature,
  Network,
  FileCheck,
  ShieldCheck,
  Radar,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { PixelEdge } from "@/components/marketing/PixelEdge";
import { MetaChips, ArrowLink } from "@/components/marketing/MetaChips";
import { Faq } from "@/components/marketing/Faq";

export const metadata: Metadata = {
  title: "Planos",
  description: "Planos da Dattis por faixa de contas de cliente ativas — não pelo faturamento da agência.",
};

const CONTATO = "mailto:contato@dattis.com?subject=Planos%20Dattis";

type Plano = {
  nome: string;
  faixa: string;
  itens: string[];
  cta: string;
  destaque?: boolean;
};

const PLANOS: Plano[] = [
  {
    nome: "Start",
    faixa: "Até 10 contas de cliente ativas",
    itens: ["Auditoria trimestral de pixel e consentimento", "Canal do titular: SLA de 15 dias úteis", "Suporte por e-mail e chat"],
    cta: "Falar com a gente",
  },
  {
    nome: "Growth",
    faixa: "11 a 30 contas de cliente ativas",
    itens: ["Auditoria mensal de pixel e consentimento", "Canal do titular: SLA de 10 dias úteis", "Suporte prioritário"],
    cta: "Falar com a gente",
    destaque: true,
  },
  {
    nome: "Scale",
    faixa: "31 a 100 contas de cliente ativas",
    itens: ["Auditoria semanal de pixel e consentimento", "Canal do titular: SLA de 5 dias úteis", "Gestor de conta dedicado"],
    cta: "Falar com a gente",
  },
  {
    nome: "Enterprise",
    faixa: "Mais de 100 contas de cliente ativas",
    itens: ["Auditoria contínua com alertas", "SLA definido em contrato", "DPO dedicado e integração customizada"],
    cta: "Falar com o time",
  },
];

const COMPARATIVO: { linha: string; valores: string[] }[] = [
  { linha: "Contas de cliente ativas", valores: ["Até 10", "11 a 30", "31 a 100", "100+"] },
  { linha: "Auditoria de pixel e consentimento", valores: ["Trimestral", "Mensal", "Semanal", "Contínua + alertas"] },
  { linha: "SLA do canal do titular", valores: ["15 dias úteis", "10 dias úteis", "5 dias úteis", "Em contrato"] },
  { linha: "Suporte", valores: ["E-mail + chat", "Prioritário", "Gestor dedicado", "DPO dedicado"] },
];

const SPRINT = [
  "Contrato de operador (DPA) padrão para a carteira",
  "Mapeamento inicial de subprocessadores",
  "Canal do titular centralizado",
  "Protocolo básico de resposta a incidente",
];

const FAQ_PLANOS = [
  {
    q: "Por que o preço é por conta de cliente, e não pelo faturamento da agência?",
    a: "Porque é o número de contas que define o trabalho e a exposição: cada conta tem o próprio RAT, o próprio contrato e as próprias ferramentas tocando dado. É a mesma régua da contabilidade — por volume, não por quão importante é o cliente.",
  },
  {
    q: "O que conta como conta de cliente ativa?",
    a: "Cada cliente que sua agência ativa no painel da Dattis e que continua em operação. Conta encerrada sai da contagem no ciclo seguinte.",
  },
  {
    q: "Posso testar antes de contratar?",
    a: "Sim. Você pode criar uma conta grátis e ativar clientes no painel, ou entrar direto na demonstração com dados de exemplo, sem senha, pela página de login.",
  },
  {
    q: "Existe fidelidade?",
    a: "O contrato mínimo sugerido é de 12 meses, com aviso de 30 dias para encerrar. Compliance de operador não é algo que se liga e desliga sem deixar a agência exposta no meio do caminho.",
  },
];

function PlanoCard({ p }: { p: Plano }) {
  const dark = p.destaque;
  return (
    <div
      className={
        "flex flex-col rounded-[40px] px-8 py-10 sm:px-10 " +
        (dark ? "bg-rail text-white" : "block-card")
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={"font-display text-[18px] " + (dark ? "text-white" : "text-ink")}>Dattis</p>
          <p className={"t-label mt-1 " + (dark ? "text-white" : "text-ink")}>{p.nome}</p>
        </div>
        {dark && <span className="tag !px-3 !py-2 text-[11px]">Mais comum</span>}
      </div>

      <p className={"font-display mt-8 text-[26px] leading-tight " + (dark ? "text-white" : "text-ink")}>{p.faixa}</p>

      <div className="mt-6 flex items-baseline gap-2">
        <span className={"font-display text-[34px] leading-none " + (dark ? "text-brand" : "text-ink")}>Sob consulta</span>
      </div>

      <ul className="mt-8 flex flex-1 flex-col gap-3.5">
        {p.itens.map((it) => (
          <li key={it} className={"flex items-start gap-2.5 text-[15px] leading-snug " + (dark ? "text-white/85" : "text-body")}>
            <CircleCheck size={19} strokeWidth={1.5} className={"mt-px shrink-0 " + (dark ? "text-brand" : "text-brand-ink")} />
            {it}
          </li>
        ))}
      </ul>

      <Link href={CONTATO} className={"btn btn-lg mt-10 w-full " + (dark ? "btn-primary" : "btn-dark")}>
        {p.cta}
      </Link>
    </div>
  );
}

export default function PlanosPage() {
  return (
    <div className="relative">
      <SiteHeader />

      <main>
        {/* HERO */}
        <section className="px-5 pb-16 pt-14 text-center sm:pt-20">
          <p className="t-eyebrow">Planos</p>
          <h1 className="t-hero mx-auto mt-5 max-w-[18ch]">Você paga por conta de cliente, não pelo faturamento.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-[18px] leading-relaxed text-body">
            O que define o trabalho de compliance é quantas contas sua agência opera. Por isso a Dattis cobra por faixa de
            contas de cliente ativas — a mesma régua da contabilidade.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-1">
            <span className="tag">15% de desconto</span>
            <span className="tag tag-white">no plano anual</span>
          </div>
        </section>

        <PixelEdge bg="var(--color-canvas)" fill="var(--color-brand)" />

        {/* PLANOS */}
        <section className="on-light bg-brand">
          <div className="w-full px-4 pb-20 pt-10 sm:px-6 lg:px-8">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {PLANOS.map((p) => (
                <PlanoCard key={p.nome} p={p} />
              ))}
            </div>
            <p className="mx-auto mt-10 max-w-3xl text-center text-[15px] leading-relaxed text-rail/85">
              Valores por faixa em definição: estamos fechando preço junto com as primeiras agências. Fale com a gente pra
              entrar nessa conversa — ou comece grátis e ative suas contas agora.
            </p>

            {/* INCLUSO */}
            <div className="block-card mt-16 grid items-center gap-12 px-8 py-12 sm:px-14 sm:py-16 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="t-eyebrow">Incluso em todos os planos</p>
                <h2 className="t-display mt-4 max-w-xl">Os módulos da plataforma, sem cobrança por módulo</h2>
                <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-body">
                  Toda conta de cliente que você ativa já sai com o RAT, o contrato e o registro de subprocessadores. O plano
                  muda o volume de contas, a frequência da auditoria e o nível de suporte.
                </p>
                <ArrowLink href="/#modulos" className="mt-8">
                  Ver os módulos
                </ArrowLink>
              </div>
              <MetaChips
                items={[
                  { icon: FileText, label: "RAT por conta de cliente", status: "sim" },
                  { icon: FileSignature, label: "DPA com assinatura eletrônica", status: "sim" },
                  { icon: Network, label: "Registro de subprocessadores", status: "sim" },
                  { icon: FileCheck, label: "DAT pra enviar ao cliente", status: "sim" },
                  { icon: Radar, label: "Auditoria de pixel e consentimento", status: "sim" },
                  { icon: ShieldCheck, label: "Diagnóstico Expresso", status: "sim" },
                ]}
              />
            </div>
          </div>
        </section>

        {/* COMPARATIVO */}
        <section className="bg-canvas">
          <div className="w-full px-5 py-24 sm:px-10 lg:px-14">
            <h2 className="t-display">Compare os planos</h2>
            <div className="card-flush mt-10 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="bg-surface-2">
                    <th className="border-b border-line px-6 py-4 font-mono text-[12px] font-normal uppercase tracking-[0.04em] text-muted">
                      &nbsp;
                    </th>
                    {PLANOS.map((p) => (
                      <th
                        key={p.nome}
                        className={
                          "border-b border-line px-6 py-4 font-mono text-[14px] font-normal uppercase tracking-[0.03em] " +
                          (p.destaque ? "bg-brand-tint text-brand-ink" : "text-ink")
                        }
                      >
                        {p.nome}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIVO.map((row) => (
                    <tr key={row.linha} className="[&:last-child>*]:border-b-0">
                      <td className="border-b border-line px-6 py-5 text-[15px] text-muted">{row.linha}</td>
                      {row.valores.map((v, i) => (
                        <td
                          key={i}
                          className={"border-b border-line px-6 py-5 font-display text-[18px] " + (PLANOS[i].destaque ? "bg-brand-tint/60" : "")}
                        >
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <PixelEdge bg="var(--color-rail)" fill="var(--color-canvas)" flip />

        {/* SPRINT */}
        <section className="bg-rail text-white">
          <div className="grid w-full gap-14 px-5 pb-24 pt-14 sm:px-10 lg:grid-cols-2 lg:px-14">
            <div>
              <p className="font-mono text-[clamp(1.1rem,2vw,1.4rem)] uppercase tracking-[0.02em] text-brand">Pra começar</p>
              <h2 className="mt-6 font-display text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] text-white">
                Sprint de Higienização: sua agência regularizada em 10 dias úteis.
              </h2>
              <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-white/80">
                Taxa única, cobrada à parte. Se você fechar o plano anual junto, 50% do valor do sprint é abatido da
                primeira mensalidade.
              </p>
              <div className="mt-10 flex items-center gap-2">
                <Link href={CONTATO} className="tag">
                  Agendar o sprint
                </Link>
                <Link href={CONTATO} aria-label="Agendar o sprint" className="arrow-circle">
                  <ArrowRight size={18} strokeWidth={1.6} />
                </Link>
              </div>
            </div>

            <ul className="flex flex-col gap-3 self-center">
              {SPRINT.map((s, i) => (
                <li key={s} className="flex items-center gap-4 rounded-[20px] bg-white/[0.06] px-6 py-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand font-mono text-[14px] text-on-brand">
                    {i + 1}
                  </span>
                  <span className="text-[16px] text-white">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CONDIÇÕES */}
        <section className="on-light bg-gradient-to-br from-canvas to-brand-tint-2">
          <div className="w-full px-5 py-20 sm:px-10 lg:px-14">
            <h2 className="t-display">Condições</h2>
            <ul className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                { t: "12 meses", d: "Contrato mínimo sugerido" },
                { t: "30 dias", d: "Aviso prévio para encerrar" },
                { t: "15%", d: "De desconto no plano anual" },
              ].map((c) => (
                <li key={c.t} className="rounded-[20px] bg-white px-7 py-8">
                  <p className="font-display text-[44px] leading-none text-rail">{c.t}</p>
                  <p className="mt-3 text-[15px] text-body">{c.d}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Faq title="Dúvidas sobre os planos" items={FAQ_PLANOS} />

        {/* CTA */}
        <section className="on-light bg-orange">
          <div className="w-full px-5 py-16 sm:px-10 lg:px-14">
            <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight">
              Quer ver funcionando antes de falar de preço?
            </h2>
            <div className="mt-12 flex flex-wrap gap-3">
              <Link href="/cadastro" className="btn btn-leaf">
                Começar grátis
              </Link>
              <a href="/api/auth/demo" className="btn btn-dark">
                Ver a demonstração
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
