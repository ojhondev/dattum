import type { Metadata } from "next";
import { Check, Minus, CircleCheck } from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { PixelEdge } from "@/components/marketing/PixelEdge";
import { ArrowLink } from "@/components/marketing/MetaChips";
import { Faq } from "@/components/marketing/Faq";
import { PLANOS, RECURSOS, destaquesDoPlano, type Plano } from "@/lib/planos";
import { linkAssinar } from "@/lib/contato";

const SPRINT = [
  "Contrato de operador (DPA) padrão para a carteira",
  "Mapeamento inicial de subprocessadores",
  "Canal do titular centralizado",
  "Protocolo básico de resposta a incidente",
];

export const metadata: Metadata = {
  title: "Planos",
  description: "Planos da Dattis de R$ 47 a R$ 297 por usuário/mês. Uma assinatura custa muito menos que uma multa da LGPD.",
};

const PILARES = Array.from(new Set(RECURSOS.map((r) => r.pilar)));

const FAQ_PLANOS = [
  {
    q: "Como funciona a cobrança por usuário?",
    a: "Você paga o valor do plano para cada pessoa da agência que acessa a Dattis. Uma agência com o dono e dois gestores de tráfego no Growth, por exemplo, paga 3 × R$ 97 por mês.",
  },
  {
    q: "Qual plano faz sentido pra minha agência?",
    a: "O Growth é o essencial: contrato com assinatura eletrônica, certificado e selo, Dossiê para BM, auditoria mensal e DAT. O Start organiza só a documentação básica. O Scale é pra quem quer a Dattis atuando como DPO (encarregado) da agência.",
  },
  {
    q: "O certificado vale pros meus clientes também?",
    a: "Sim. Nos planos Growth e Scale você emite certificado e selo pra própria agência e pra cada cliente, e coloca no rodapé dos sites. Qualquer pessoa confere pelo QR Code ou clicando no selo.",
  },
  {
    q: "Uma multa sai mesmo mais cara que a assinatura?",
    a: "A multa simples da LGPD chega a 2% do faturamento, limitada a R$ 50 milhões por infração (art. 52), fora a possibilidade de suspender o tratamento de dados — o que, pra uma agência, significa parar de rodar campanha. O Growth custa R$ 97 por usuário/mês.",
  },
  {
    q: "Posso ver a plataforma antes de assinar?",
    a: "Sim. Na página de login há um acesso de demonstração com dados de exemplo, sem senha.",
  },
  {
    q: "Como eu contrato?",
    a: "Fale com a gente pelo botão do plano: marcamos uma conversa rápida, enviamos o link de pagamento pelo WhatsApp e, confirmado o pagamento, você recebe o código de ativação pra criar o acesso da agência.",
  },
  {
    q: "Existe fidelidade?",
    a: "O contrato mínimo é de 12 meses, com aviso de 30 dias para encerrar. Compliance não é algo que se liga e desliga sem deixar a agência exposta no meio do caminho.",
  },
];

function PlanoCard({ p }: { p: Plano }) {
  const dark = p.destaque;
  const itens = destaquesDoPlano(p.id);
  return (
    <div className={"flex flex-col rounded-[40px] px-8 py-10 sm:px-10 " + (dark ? "bg-rail text-white" : "block-card")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={"font-display text-[18px] " + (dark ? "text-white" : "text-ink")}>Dattis</p>
          <p className={"t-label mt-1 " + (dark ? "text-white" : "text-ink")}>{p.nome}</p>
        </div>
        {dark && <span className="tag !px-3 !py-2 text-[11px]">Mais escolhido</span>}
      </div>

      <p className={"mt-6 text-[15px] leading-snug " + (dark ? "text-white/80" : "text-body")}>{p.resumo}</p>

      <div className="mt-8 flex items-end gap-2">
        <span className={"font-display text-[20px] leading-none " + (dark ? "text-brand" : "text-ink")}>R$</span>
        <span className={"font-display text-[64px] leading-[0.85] " + (dark ? "text-brand" : "text-ink")}>{p.preco}</span>
        <span className={"pb-1 text-[14px] " + (dark ? "text-white/70" : "text-muted")}>/usuário/mês</span>
      </div>

      <ul className="mt-9 flex flex-1 flex-col gap-3">
        {itens.map((it) => (
          <li key={it} className={"flex items-start gap-2.5 text-[15px] leading-snug " + (dark ? "text-white/90" : "text-body")}>
            <CircleCheck size={19} strokeWidth={1.5} className={"mt-px shrink-0 " + (dark ? "text-brand" : "text-brand-ink")} />
            {it}
          </li>
        ))}
      </ul>

      <a href={linkAssinar(p.nome)} target="_blank" rel="noopener" className={"btn btn-lg mt-10 w-full " + (dark ? "btn-primary" : "btn-dark")}>
        Assinar o {p.nome}
      </a>
    </div>
  );
}

function Celula({ v }: { v: boolean | string }) {
  if (v === true) return <Check size={18} strokeWidth={2.2} className="text-brand-ink" aria-label="Incluso" />;
  if (v === false) return <Minus size={18} className="text-faint" aria-label="Não incluso" />;
  return <span className="text-[15px]">{v}</span>;
}

export default function PlanosPage() {
  return (
    <div className="relative">
      <SiteHeader />

      <main>
        {/* HERO */}
        <section className="px-5 pb-16 pt-14 text-center sm:pt-20">
          <p className="t-eyebrow">Planos</p>
          <h1 className="t-hero mx-auto mt-5 max-w-[16ch]">Uma assinatura custa muito menos que uma multa.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-[18px] leading-relaxed text-body">
            Cada plano cobre os pilares da Dattis — documentação, proteção, relacionamento com o cliente e governança — e é
            cobrado por usuário da sua agência.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-1">
            <span className="tag">De R$ 47 a R$ 297</span>
            <span className="tag tag-white">por usuário/mês</span>
          </div>
        </section>

        <PixelEdge bg="var(--color-canvas)" fill="var(--color-brand)" />

        {/* PLANOS */}
        <section className="on-light bg-brand">
          <div className="w-full px-4 pb-24 pt-10 sm:px-6 lg:px-8">
            <div className="grid gap-5 lg:grid-cols-3">
              {PLANOS.map((p) => (
                <PlanoCard key={p.id} p={p} />
              ))}
            </div>
            <p className="mx-auto mt-10 max-w-2xl text-center text-[15px] leading-relaxed text-rail/85">
              Uma multa simples da LGPD pode chegar a 2% do faturamento, limitada a R$ 50 milhões por infração. Com três
              usuários no Growth, sua agência investe R$ 291 por mês.
            </p>
          </div>
        </section>

        {/* COMPARATIVO POR PILAR */}
        <section className="bg-canvas">
          <div className="w-full px-5 py-24 sm:px-10 lg:px-14">
            <h2 className="t-display">O que cada plano cobre, pilar por pilar</h2>
            <div className="card-flush mt-10 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="bg-surface-2">
                    <th className="w-[40%] border-b border-line px-6 py-4" />
                    {PLANOS.map((p) => (
                      <th
                        key={p.id}
                        className={
                          "border-b border-line px-6 py-4 font-mono text-[14px] font-normal uppercase tracking-[0.03em] " +
                          (p.destaque ? "bg-brand-tint text-brand-ink" : "text-ink")
                        }
                      >
                        {p.nome}
                        <span className="mt-1 block font-display text-[20px] normal-case tracking-normal text-ink">R$ {p.preco}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PILARES.map((pilar) => (
                    <PilarRows key={pilar} pilar={pilar} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <PixelEdge flip bg="var(--color-rail)" fill="var(--color-canvas)" />

        {/* DPO */}
        <section className="bg-rail text-white">
          <div className="grid w-full gap-14 px-5 pb-24 pt-14 sm:px-10 lg:grid-cols-2 lg:px-14">
            <div>
              <p className="font-mono text-[clamp(1.1rem,2vw,1.4rem)] uppercase tracking-[0.02em] text-brand">Plano Scale</p>
              <h2 className="mt-6 font-display text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] text-white">
                A Dattis como DPO da sua agência.
              </h2>
              <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-white/80">
                O encarregado de dados é quem responde pela privacidade da empresa: atende os titulares, fala com a ANPD e
                orienta a equipe. No Scale, esse papel é nosso — sem você contratar ninguém.
              </p>
              <ArrowLink href={linkAssinar("Scale")} className="mt-10 !text-white">
                Assinar o Scale
              </ArrowLink>
            </div>
            <ul className="flex flex-col gap-3 self-center">
              {[
                "Recebe e responde pedidos dos donos dos dados",
                "Responde às comunicações da ANPD",
                "Orienta sua equipe sobre boas práticas",
                "Conduz a resposta a incidentes de segurança",
              ].map((s, i) => (
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

        {/* SPRINT */}
        <section className="bg-canvas">
          <div className="grid w-full gap-14 px-5 py-24 sm:px-10 lg:grid-cols-2 lg:px-14">
            <div>
              <p className="t-eyebrow">Pra começar</p>
              <h2 className="t-display mt-4">Sprint de Higienização: sua agência regularizada em 10 dias úteis.</h2>
              <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-body">
                Taxa única, cobrada à parte. Se você fechar o plano anual junto, 50% do valor do sprint é abatido da
                primeira mensalidade.
              </p>
              <ArrowLink href={linkAssinar()} className="mt-9">
                Agendar o sprint
              </ArrowLink>
            </div>
            <ul className="flex flex-col gap-3 self-center">
              {SPRINT.map((s, i) => (
                <li key={s} className="flex items-center gap-4 rounded-[20px] border border-line bg-surface px-6 py-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand font-mono text-[14px] text-on-brand">
                    {i + 1}
                  </span>
                  <span className="text-[16px]">{s}</span>
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
                { t: "12 meses", d: "Contrato mínimo" },
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
            <h2 className="max-w-3xl font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight">
              Quer ver a plataforma antes de assinar?
            </h2>
            <div className="mt-12 flex flex-wrap gap-3">
              <a href={linkAssinar("Growth")} target="_blank" rel="noopener" className="btn btn-leaf">
                Falar com a Dattis
              </a>
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

function PilarRows({ pilar }: { pilar: string }) {
  const linhas = RECURSOS.filter((r) => r.pilar === pilar);
  return (
    <>
      <tr>
        <td colSpan={PLANOS.length + 1} className="border-b border-line bg-canvas px-6 pb-3 pt-7 font-mono text-[12px] uppercase tracking-[0.05em] text-muted">
          {pilar}
        </td>
      </tr>
      {linhas.map((r) => (
        <tr key={r.nome}>
          <td className="border-b border-line px-6 py-4 text-[15px]">{r.nome}</td>
          {PLANOS.map((p) => (
            <td key={p.id} className={"border-b border-line px-6 py-4 " + (p.destaque ? "bg-brand-tint/60" : "")}>
              <Celula v={r.valores[p.id]} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
