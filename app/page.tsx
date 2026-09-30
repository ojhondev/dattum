import Link from "next/link";
import { ArrowRight, CircleCheck } from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { PixelEdge } from "@/components/marketing/PixelEdge";
import { HeroStrip } from "@/components/marketing/HeroStrip";
import { ArrowLink } from "@/components/marketing/MetaChips";
import { RatVisual, DpaVisual, SubsVisual, AuditVisual, DatVisual } from "@/components/marketing/ModuleVisuals";
import { Testimonials } from "@/components/marketing/Testimonials";
import { Faq } from "@/components/marketing/Faq";

const CHECKLIST = ["RAT por conta de cliente", "DPA com assinatura eletrônica", "Subprocessadores mapeados", "Auditoria contínua"];

const LEI = [
  { art: "Art. 37", t: "Registro das operações de tratamento" },
  { art: "Art. 39", t: "Operador segue as instruções do controlador" },
  { art: "Art. 42", t: "Responsabilidade solidária do operador" },
  { art: "Art. 46", t: "Medidas de segurança" },
];

const POR_QUE_AGORA = [
  {
    title: "19 processos abertos pela ANPD em um único mês",
    body: "Junho de 2026 bateu o recorde histórico da autarquia. A fiscalização está acelerando, não o contrário.",
    tags: ["ANPD", "Fiscalização"],
    stat: "Jun 2026",
  },
  {
    title: "180 mil+ agências de marketing no Brasil",
    body: "91,3% com atuação digital — e a grande maioria ainda trata dado de cliente como responsabilidade só do controlador.",
    tags: ["Mercado", "Agências"],
    stat: "91,3% digitais",
  },
  {
    title: "Já existe tese acadêmica sobre o tema",
    body: "A PUC Goiás publicou pesquisa específica sobre violação da LGPD por agências de marketing digital. O cruzamento já é objeto de estudo, não hipótese.",
    tags: ["Pesquisa", "LGPD"],
    stat: "PUC Goiás",
  },
];

const FAQ_ITEMS = [
  {
    q: "Minha agência precisa mesmo de RAT e DPA?",
    a: "Se você gerencia CRM, WhatsApp, tráfego ou automação em nome de clientes, a LGPD trata sua agência como operadora de dados (art. 5º, VII) — e prevê responsabilidade solidária com o cliente (art. 42). RAT e DPA são os documentos que provam que essa operação está regular.",
  },
  {
    q: "O que é o DAT?",
    a: "É o documento-resumo que reúne o status do RAT, do DPA e dos subprocessadores de uma conta — a prova de conformidade que sua agência manda pro cliente dela, sempre que ele perguntar.",
  },
  {
    q: "Isso substitui um advogado?",
    a: "Não. A Dattis automatiza a parte operacional (documentos, mapeamento, auditoria). Contencioso e casos complexos continuam sendo encaminhados a um parceiro jurídico.",
  },
  {
    q: "Quanto tempo leva pra ativar uma conta nova?",
    a: "O wizard de ativação já gera o RAT e o DPA da conta assim que você marca os fluxos padrão (CAPI, WhatsApp, CRM) — minutos, não dias.",
  },
];

function ModuleText({ name, body, cta, href, dark = false }: { name: string; body: string; cta: string; href: string; dark?: boolean }) {
  return (
    <div>
      <p className={"font-display text-[20px] " + (dark ? "text-white" : "text-ink")}>Dattis</p>
      <p className={"t-label mt-1 " + (dark ? "text-white" : "text-ink")}>{name}</p>
      <p className={"mt-6 max-w-md text-[18px] leading-relaxed " + (dark ? "text-white/85" : "text-body")}>{body}</p>
      <ArrowLink href={href} className={"mt-8 " + (dark ? "!text-white" : "")}>
        {cta}
      </ArrowLink>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="relative">
      <div className="bg-rail">
        <p className="px-5 py-2.5 text-center text-[13px] text-white">
          Sofreu uma denúncia ou multa?{" "}
          <Link href="mailto:contato@dattis.com" className="underline underline-offset-2 hover:text-brand">
            Fale com a gente com urgência
          </Link>
        </p>
      </div>
      <SiteHeader />

      <main>
        {/* HERO */}
        <section className="overflow-hidden pt-14 sm:pt-20">
          <div className="mx-auto max-w-5xl px-5 text-center">
            <p className="t-eyebrow">Baseado na Lei nº 13.709/2018 (LGPD)</p>
            <h1 className="t-hero mx-auto mt-5 max-w-[17ch]">Descumprir a LGPD sai caro pra sua agência.</h1>
            <p className="mx-auto mt-6 max-w-2xl text-[18px] leading-relaxed text-body">
              Gere o RAT, o DPA e o registro de subprocessadores de cada cliente que sua agência atende — sem contratar um
              advogado por documento.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link href="/cadastro" className="btn btn-dark btn-lg">
                Começar grátis
              </Link>
              <Link href="/diagnostico" className="btn btn-primary btn-lg">
                Fazer diagnóstico
              </Link>
            </div>
          </div>
          <HeroStrip />
        </section>

        <PixelEdge bg="var(--color-canvas)" fill="var(--color-brand)" />

        {/* MÓDULOS */}
        <section id="modulos" className="on-light bg-brand">
          <div className="w-full px-4 pb-24 pt-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="t-display text-rail">Conheça o sistema de compliance da Dattis, feito pra operação de agência</h2>
              <ul className="mx-auto mt-10 flex w-fit flex-col gap-4 text-left">
                {CHECKLIST.map((c) => (
                  <li key={c} className="flex items-center gap-3 font-mono text-[15px] uppercase tracking-[0.02em] text-rail">
                    <CircleCheck size={22} strokeWidth={1.4} />
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-16 grid gap-5 lg:grid-cols-12">
              <div className="block-card flex flex-col justify-between gap-12 px-8 pt-12 sm:px-14 sm:pt-16 lg:col-span-6">
                <ModuleText
                  name="RAT"
                  body="O registro do que sua agência faz com o dado de cada cliente — ferramenta, finalidade, base legal e retenção — gerado automaticamente quando você ativa a conta."
                  cta="Ver o RAT"
                  href="/cadastro"
                />
                <RatVisual />
              </div>

              <div className="block-card flex flex-col justify-between gap-12 px-8 pt-12 sm:px-14 sm:pt-16 lg:col-span-6">
                <ModuleText
                  name="DPA"
                  body="O contrato entre você e seu cliente: deixa claro quem é operador e quem é controlador, com assinatura eletrônica direto na plataforma."
                  cta="Ver o DPA"
                  href="/cadastro"
                />
                <DpaVisual />
              </div>

              <div className="grid items-center gap-12 overflow-hidden rounded-[40px] bg-rail px-8 py-12 sm:px-14 sm:py-16 lg:col-span-12 lg:grid-cols-2">
                <ModuleText
                  dark
                  name="Subprocessadores"
                  body="Toda ferramenta que toca o dado do cliente — Meta Ads, WhatsApp Business API, RD Station — mapeada por conta, com alerta quando uma ferramenta nova entra sem contrato."
                  cta="Ver o registro"
                  href="/cadastro"
                />
                <div className="pb-6">
                  <SubsVisual />
                </div>
              </div>

              <div className="block-card flex flex-col justify-between gap-12 px-8 pt-12 sm:px-14 sm:pt-16 lg:col-span-6">
                <ModuleText
                  name="Auditoria"
                  body="Reexecuta o diagnóstico nos sites e campanhas ativas e aponta o que expõe sua agência: pixel sem aviso de cookies, formulário sem consentimento."
                  cta="Auditar um site"
                  href="/auditoria"
                />
                <AuditVisual />
              </div>

              <div className="block-card flex flex-col justify-between gap-12 px-8 pt-12 sm:px-14 sm:pt-16 lg:col-span-6">
                <ModuleText
                  name="DAT"
                  body="O resumo de conformidade de cada conta — RAT, DPA e subprocessadores num documento só — pra sua agência mandar pro cliente sempre que ele perguntar."
                  cta="Ver o DAT"
                  href="/cadastro"
                />
                <DatVisual />
              </div>
            </div>

            <div className="mt-24 text-center">
              <p className="t-eyebrow !text-rail">Baseado na LGPD</p>
              <ul className="mx-auto mt-8 grid max-w-5xl gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                {LEI.map((l) => (
                  <li key={l.art}>
                    <p className="font-display text-[30px] text-rail">{l.art}</p>
                    <p className="mt-1 text-[15px] text-rail/80">{l.t}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <PixelEdge flip bg="var(--color-rail)" fill="var(--color-brand)" />

        {/* O PROBLEMA */}
        <section
          id="problema"
          className="relative bg-rail bg-cover bg-center text-white"
          style={{ backgroundImage: "linear-gradient(180deg, rgba(0,40,32,0.55), rgba(0,40,32,0.92)), url(/marketing/solucao-glow.png)" }}
        >
          <div className="w-full px-5 pb-24 pt-16 sm:px-10 lg:px-14 lg:pb-32">
            <p className="font-mono text-[clamp(1.25rem,2.4vw,1.75rem)] uppercase tracking-[0.02em]">O problema</p>
            <h2 className="mt-8 max-w-5xl font-display text-[clamp(2rem,4.6vw,3.6rem)] leading-[1.12] text-white">
              Pela LGPD, a agência que opera o dado do cliente responde junto com ele. Uma denúncia de um lead já pode virar
              processo na ANPD.
            </h2>
            <div className="mt-12 flex items-center gap-2">
              <Link href="/diagnostico" className="tag">
                Medir meu risco
              </Link>
              <Link href="/diagnostico" aria-label="Medir meu risco" className="arrow-circle">
                <ArrowRight size={18} strokeWidth={1.6} />
              </Link>
            </div>
          </div>
        </section>

        {/* POR QUE AGORA */}
        <section id="por-que-agora" className="on-light bg-gradient-to-br from-canvas to-brand-tint-2">
          <div className="w-full px-5 py-24 sm:px-10 lg:px-14">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 className="t-display">Por que agora</h2>
              <ArrowLink href="/diagnostico">Fazer diagnóstico</ArrowLink>
            </div>

            <ul className="mt-12">
              {POR_QUE_AGORA.map((it) => (
                <li key={it.title} className="border-t border-brand-strong/60 py-10 first:border-t-0 first:pt-4">
                  <h3 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-tight">{it.title}</h3>
                  <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-body">{it.body}</p>
                  <div className="mt-7 flex flex-wrap items-center gap-1">
                    {it.tags.map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    <span className="tag tag-white">{it.stat}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* DEPOIMENTOS */}
        <Testimonials
          kicker="Prova social"
          title="O que agências dizem sobre a Dattis"
          note="[Depoimentos reais entram aqui antes da publicação — placeholder]"
          items={[
            {
              quote: "[Depoimento real de uma agência cliente entra aqui — resultado que a Dattis trouxe pra operação dela]",
              name: "[Nome do responsável]",
              role: "[Cargo] na [Nome da agência]",
            },
            {
              quote: "[Segundo depoimento entra aqui]",
              name: "[Nome do responsável]",
              role: "[Cargo] na [Nome da agência]",
            },
          ]}
        />

        {/* FAQ */}
        <Faq title="Perguntas frequentes" items={FAQ_ITEMS} />

        {/* FAIXA LILÁS */}
        <section className="on-light bg-lilac">
          <div className="w-full px-5 py-16 sm:px-10 lg:px-14">
            <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight">Descubra se sua agência está exposta.</h2>
            <div className="mt-12 flex flex-wrap items-center gap-1">
              <Link href="/diagnostico" className="tag">
                Diagnóstico
              </Link>
              <span className="tag tag-white">Grátis e sem cadastro</span>
              <Link href="/diagnostico" aria-label="Fazer diagnóstico" className="arrow-circle">
                <ArrowRight size={18} strokeWidth={1.6} />
              </Link>
            </div>
          </div>
        </section>

        {/* FAIXA LARANJA */}
        <section id="demo" className="on-light bg-orange">
          <div className="w-full px-5 py-16 sm:px-10 lg:px-14">
            <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight">
              Pronto pra parar de torcer pra não cair fiscalização?
            </h2>
            <Link href="/cadastro" className="btn btn-leaf mt-12">
              Começar grátis
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
