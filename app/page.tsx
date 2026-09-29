import Link from "next/link";
import { ArrowRight, ArrowDown, FileText, FileSignature, Network, ShieldCheck, FileCheck } from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { HeroPreview } from "@/components/marketing/HeroPreview";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { Reveal } from "@/components/marketing/Reveal";
import { ParticleField } from "@/components/marketing/ParticleField";
import { PillarsShowcase, type Pillar } from "@/components/marketing/PillarsShowcase";
import { Marquee } from "@/components/marketing/Marquee";
import { Testimonials } from "@/components/marketing/Testimonials";
import { Faq } from "@/components/marketing/Faq";

const FLUID = "w-full px-5 sm:px-10 lg:px-20";

const PILLARS: Pillar[] = [
  {
    id: "rat",
    tab: "RAT",
    heading: "O que fazemos com o dado de cada cliente",
    body: "Gerado automaticamente pra cada conta: qual ferramenta usa o dado, pra quê, com que base legal. O inventário que a LGPD exige e que, na prática, quase nenhuma agência mantém atualizado.",
    cta: "Ver o módulo de RAT",
    href: "/cadastro",
    panel: "rat",
    tint: "",
  },
  {
    id: "dpa",
    tab: "DPA",
    heading: "O contrato entre você e seu cliente",
    body: "Formaliza quem é operador e quem é controlador — protege sua agência se o cliente tentar jogar toda a responsabilidade pra cima de vocês. Assinatura eletrônica direto na plataforma.",
    cta: "Ver o módulo de DPA",
    href: "/cadastro",
    panel: "dpa",
    tint: "",
  },
  {
    id: "subprocessadores",
    tab: "Subprocessadores",
    heading: "Quem mais mexe nesse dado",
    body: "Toda ferramenta que toca o dado do cliente — Meta Ads, WhatsApp Business API, RD Station — mapeada por conta, com alerta quando uma ferramenta nova entra sem contrato.",
    cta: "Ver o registro",
    href: "/cadastro",
    panel: "subprocessadores",
    tint: "",
  },
];

const TOOLS = [
  { icon: FileText, name: "RAT", short: "Registro de Atividades de Tratamento gerado por conta de cliente." },
  { icon: FileSignature, name: "DPA", short: "Contrato de Operador de Dados, com assinatura eletrônica." },
  { icon: Network, name: "Subprocessadores", short: "Mapa das ferramentas que tocam o dado de cada cliente." },
  { icon: ShieldCheck, name: "Auditoria", short: "Reexecução periódica do motor de diagnóstico nas campanhas ativas." },
  { icon: FileCheck, name: "DAT", short: "Resumo de conformidade que sua agência manda pro cliente dela." },
];

const TRUST = [
  {
    title: "180 mil+ agências",
    body: "de marketing e comunicação no Brasil, 91,3% com atuação digital — a grande maioria ainda trata dado de cliente como responsabilidade só do controlador.",
  },
  {
    title: "19 processos",
    body: "abertos pela ANPD em um único mês (junho de 2026) — recorde histórico da autarquia. A fiscalização está acelerando, não o contrário.",
  },
  {
    title: "Tese publicada",
    body: "A PUC Goiás já publicou pesquisa acadêmica específica sobre violação da LGPD por agências de marketing digital — o cruzamento já é objeto de estudo, não hipótese.",
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

export default function LandingPage() {
  return (
    <div className="relative z-10">
      <div className="bg-rail">
        <p className="font-ui px-5 py-2.5 text-center text-[13px] text-white">
          Sofreu uma denúncia ou multa? <Link href="mailto:contato@dattis.com" className="underline underline-offset-2">Fale com a gente com urgência</Link>
        </p>
      </div>
      <SiteHeader />

      <main>
        <ParticleField>
          {/* HERO */}
          <section className={`${FLUID} flex min-h-[82vh] flex-col justify-center py-16`}>
            <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.05fr]">
              <div>
                <h1 className="t-display max-w-[16ch]">Descumprir a LGPD sai caro pra sua agência.</h1>
                <p className="mt-8 max-w-lg text-body leading-relaxed text-body">
                  A Dattis gera o RAT, o DPA e o registro de subprocessadores pra cada cliente que sua agência
                  atende — sem precisar contratar um advogado por documento.
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-6">
                  <Link href="/cadastro" className="btn btn-lg btn-dark">
                    Começar grátis <ArrowRight size={16} />
                  </Link>
                  <Link href="/#ferramentas" className="nav-link text-body-sm font-medium">
                    Ver módulos
                  </Link>
                </div>
              </div>
              <Reveal delay={80}>
                <HeroPreview />
              </Reveal>
            </div>
            <div className="mt-16 flex items-center gap-2 text-faint">
              <ArrowDown size={14} />
              <span className="font-ui text-caption uppercase tracking-[0.14em]">role pra ver como funciona</span>
            </div>
          </section>

          {/* GLOBO */}
          <section className="relative flex min-h-[110vh] items-center justify-center px-5 text-center">
            <div className="max-w-3xl">
              <h2 className="t-display">
                Sua agência já usa Meta, WhatsApp, RD Station, CRM —
                <br />
                <span className="mark">a Dattis organiza o resto.</span>
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-body text-muted">
                Cada ferramenta que toca o dado do seu cliente vira um subprocessador mapeado, automaticamente.
              </p>
            </div>
          </section>
        </ParticleField>

        {/* PILARES */}
        <div className="relative z-10 bg-canvas">
          <PillarsShowcase kicker="Como funciona" title="Três documentos, gerados pra cada conta de cliente" pillars={PILLARS} fluid={FLUID} />
        </div>

        {/* MARQUEE */}
        <Marquee
          line="Da bagunça de ferramentas espalhadas a um sistema só de conformidade."
          rowA={["RAT", "DPA", "Subprocessadores", "Auditoria", "DAT", "Art. 42 LGPD"]}
          rowB={["Meta Ads", "WhatsApp Business API", "RD Station", "Google Ads", "CRM", "Zapier"]}
        />

        {/* TRUST */}
        <section id="problema" className="relative z-10 border-y border-line bg-surface">
          <div className={`${FLUID} py-20`}>
            <h2 className="t-heading-lg max-w-2xl">O risco não é hipotético — já tem tese acadêmica e fiscalização real sobre isso</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {TRUST.map((c, i) => (
                <Reveal key={c.title} delay={i * 70} className="card">
                  <span className="font-ui text-caption text-muted">0{i + 1}</span>
                  <h3 className="t-heading mt-3">{c.title}</h3>
                  <p className="mt-3 text-body-sm text-muted">{c.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FERRAMENTAS */}
        <section id="ferramentas" className={`${FLUID} relative z-10 bg-canvas py-24`}>
          <h2 className="t-heading-lg max-w-2xl">Todos os módulos, numa plataforma só</h2>
          <p className="mt-4 max-w-xl text-body text-muted">Cada módulo abaixo já está em funcionamento — comece grátis pra ver o que ele gera.</p>
          <div className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-card-lg)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool, i) => (
              <Reveal key={tool.name} delay={i * 50} className="group flex flex-col bg-surface p-7">
                <tool.icon size={22} strokeWidth={1.5} className="text-ink" />
                <h3 className="t-heading mt-4">{tool.name}</h3>
                <p className="mt-2 flex-1 text-body-sm text-muted">{tool.short}</p>
                <Link href="/cadastro" className="nav-link mt-5 inline-flex w-fit items-center gap-1.5 text-[14px]">
                  Começar <ArrowRight size={14} />
                </Link>
              </Reveal>
            ))}
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
        <Faq kicker="Dúvidas" title="Perguntas frequentes" items={FAQ_ITEMS} />

        {/* CTA */}
        <section id="demo" className={`${FLUID} relative z-10 bg-canvas py-24 text-center`}>
          <h2 className="t-display mx-auto max-w-3xl">Pronto pra parar de torcer pra não cair fiscalização?</h2>
          <p className="mx-auto mt-4 max-w-md text-body text-muted">Comece grátis, sem cartão de crédito.</p>
          <Link href="/cadastro" className="btn btn-primary mt-8">
            Começar grátis <ArrowRight size={16} />
          </Link>
        </section>
      </main>

      <SiteFooter fluid={FLUID} />
    </div>
  );
}
