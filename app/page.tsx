import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { lerConfiguracoes } from "@/lib/blog";
import { schemaOrganizacao, schemaSite, schemaFaq } from "@/lib/schema-org";
import { ArrowRight, CircleCheck, Inbox, MessageSquareWarning, GraduationCap, Siren, Landmark } from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { PixelEdge } from "@/components/marketing/PixelEdge";
import { HeroStrip } from "@/components/marketing/HeroStrip";
import { ArrowLink, MetaChips } from "@/components/marketing/MetaChips";
import {
  RatVisual,
  DpaVisual,
  SubsVisual,
  AuditVisual,
  DatVisual,
  CertVisual,
  DossieVisual,
  BmAlertVisual,
} from "@/components/marketing/ModuleVisuals";
import { Testimonials } from "@/components/marketing/Testimonials";
import { ScrollRevealText } from "@/components/marketing/ScrollRevealText";
import { LeiBar } from "@/components/marketing/LeiBar";
import { CalculadoraPopup, BotaoCalculadora } from "@/components/marketing/CalculadoraPopup";
import { Faq } from "@/components/marketing/Faq";
import { Funcionalidades } from "@/components/marketing/Funcionalidades";
import { linkContato } from "@/lib/contato";

const RISCOS = [
  {
    t: "2% de multa\nsob faturamento",
    d: "Sua agência pode sofrer multa de até 2% do faturamento, limitada a R$ 50 milhões por infração.",
  },
  {
    t: "Proibição no\nTratamento de Dados",
    d: "Medida prevista no art. 52 a ANPD pode determinar a proibição parcial ou total do exercício de atividades relacionadas ao tratamento de dados.",
  },
  {
    t: "Indiciamento\ncriminal",
    d: "Condutas envolvendo dados pessoais podem gerar responsabilidade civil e  responsabilização criminal",
  },
];

const CHECKLIST = ["RAT por conta de cliente", "Contrato com assinatura eletrônica", "Subprocessadores mapeados", "Certificado e selo verificáveis", "Dossiê para BM suspensa"];

const LEI = [
  { art: "Art. 37", t: "Registro das operações de tratamento" },
  { art: "Art. 39", t: "Operador segue as instruções do controlador" },
  { art: "Art. 42", t: "Responsabilidade solidária do operador" },
  { art: "Art. 46", t: "Medidas de segurança" },
];

const DIFERENCIAIS = [
  {
    t: "Você passa na due diligence de clientes grandes",
    d: "Empresas maiores mandam questionário de segurança e pedem contrato de operador antes de fechar com fornecedor. Quem já tem tudo pronto responde em minutos e fecha o contrato; quem não tem, fica de fora.",
    tags: ["Novos contratos", "Due diligence"],
  },
  {
    t: "Seu site mostra que você leva dado a sério",
    d: "O selo verificável no rodapé do seu site e do site dos seus clientes transmite confiança antes da primeira reunião — e qualquer pessoa confere com um clique.",
    tags: ["Selo", "Confiança"],
  },
  {
    t: "Sua operação não para quando a BM cai",
    d: "Com a documentação pronta, a contestação de uma BM suspensa sai no mesmo dia, organizada — em vez de dias caçando arquivo com campanha parada.",
    tags: ["BM suspensa", "Continuidade"],
  },
  {
    t: "Você deixa de dividir a culpa sozinho",
    d: "Contrato e registro mostram que a agência seguiu as instruções do cliente. Isso muda a sua posição quando alguém pergunta de quem é a responsabilidade.",
    tags: ["Art. 39", "Art. 42"],
  },
  {
    t: "Você retém clientes com um serviço a mais",
    d: "Mandar o resumo de conformidade (DAT) e o certificado pro cliente vira entrega recorrente — mais um motivo pra ele renovar com você.",
    tags: ["Retenção", "Valor percebido"],
  },
];

const DPO_FUNCOES = [
  { icon: Inbox, label: "Recebe pedidos e reclamações dos titulares" },
  { icon: Landmark, label: "Responde às comunicações da ANPD" },
  { icon: GraduationCap, label: "Orienta a equipe sobre boas práticas" },
  { icon: Siren, label: "Conduz a resposta a incidentes" },
  { icon: MessageSquareWarning, label: "É o contato público de privacidade" },
];

const SANCOES = [
  "Advertência, com prazo para corrigir",
  "Multa simples de até 2% do faturamento, limitada a R$ 50 milhões por infração",
  "Multa diária",
  "Publicação da infração",
  "Bloqueio ou eliminação dos dados",
  "Suspensão ou proibição do tratamento de dados",
];

const FAQ_ITEMS = [
  {
    q: "Minha agência precisa mesmo de RAT e DPA?",
    a: "Se você gerencia CRM, WhatsApp, tráfego ou automação em nome de clientes, a LGPD trata sua agência como operadora de dados (art. 5º, VII) — e prevê responsabilidade solidária com o cliente (art. 42). RAT e DPA são os documentos que provam que essa operação está regular.",
  },
  {
    q: "A BM do meu cliente foi suspensa. A Dattis ajuda?",
    a: "Sim. O Dossiê para BM reúne em um documento os dados da empresa, o contrato de operação, o registro de atividades, as ferramentas que tratam dados e o certificado verificável, além de um texto-base pra contestação. A análise continua sendo do Meta, mas você contesta no mesmo dia e com a documentação organizada.",
  },
  {
    q: "O que o selo no rodapé do site comprova?",
    a: "Que a documentação de privacidade do titular — registro de atividades, contrato de operação e ferramentas — está registrada e em dia na Dattis. A verificação é feita na hora em que alguém clica no selo ou lê o QR Code. Não é selo da ANPD nem certificado ICP-Brasil.",
  },
  {
    q: "O que é o DAT?",
    a: "É o documento-resumo que reúne o status do RAT, do DPA e dos subprocessadores de uma conta — a prova de conformidade que sua agência manda pro cliente dela, sempre que ele perguntar.",
  },
  {
    q: "Quanto custa?",
    a: "De R$ 47 a R$ 297 por cliente da agência, por mês. O Growth, de R$ 97, é o plano que cobre o essencial: contrato com assinatura eletrônica, certificado e selo, Dossiê para BM e vigilância diária dos sites.",
  },
  {
    q: "Isso substitui um advogado?",
    a: "Não. A Dattis automatiza a parte operacional (documentos, mapeamento, auditoria). Contencioso e casos complexos continuam sendo encaminhados a um parceiro jurídico.",
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

const CARD = "block-card flex flex-col justify-between gap-12 px-8 pt-12 sm:px-14 sm:pt-16 lg:col-span-6";

export const metadata: Metadata = {
  title: { absolute: "Dattis — LGPD para agências de tráfego pago" },
  description:
    "Sua agência de tráfego está em conformidade com a LGPD? Registro de tratamento, contrato com o cliente, certificado de privacidade, vigilância diária e dossiê para BM suspensa. A partir de R$ 47 por cliente.",
  alternates: { canonical: "/" },
};

export default async function LandingPage() {
  const cfg = await lerConfiguracoes();
  return (
    <div className="relative">
      <JsonLd
        dados={[
          schemaOrganizacao([cfg.instagram, cfg.linkedin, cfg.youtube].filter((r): r is string => !!r)),
          schemaSite(),
          schemaFaq(FAQ_ITEMS.map((f) => ({ pergunta: f.q, resposta: f.a }))),
        ]}
      />
      <div className="announce">
        <p className="px-5 py-2.5 text-center text-[13px]">
          Sofreu uma denúncia ou multa?{" "}
          <a
            href={linkContato("Olá! Sofri uma denúncia ou multa e preciso de ajuda com urgência.")}
            target="_blank"
            rel="noopener"
            className="underline underline-offset-2"
          >
            Fale com a gente com urgência
          </a>
        </p>
      </div>
      <SiteHeader />

      <main>
        {/* HERO */}
        <section className="overflow-hidden pt-14 sm:pt-20">
          <div className="mx-auto max-w-5xl px-5 text-center">
            <p className="t-eyebrow">Baseado na Lei nº 13.709/2018 (LGPD)</p>
            <h1 className="t-hero t-hero-home mx-auto mt-5 max-w-[16ch]">
              <span className="text-brand-ink">Agência de Tráfego:</span> Descumprir a LGPD gera multas.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-[20px] leading-[1.4] text-body">
              Captação, armazenamento e gestão de dados sem os controles adequados podem expor sua agência a riscos e
              multas de milhares de reais.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link href="/planos" className="btn btn-dark btn-lg">
                Ver planos
              </Link>
              <Link href="/diagnostico" className="btn btn-primary btn-lg">
                Auditar minha agência
              </Link>
            </div>
          </div>
          <HeroStrip />
        </section>

        <PixelEdge bg="var(--color-canvas)" fill="var(--color-forest)" />

        {/* O PROBLEMA */}
        <section id="problema" className="bg-forest text-white">
          <ScrollRevealText
            eyebrow="O problema"
            trechos={[
              { texto: "Sua agência gera, coleta, cruza e compartilha dados pessoais todos os dias para criar e executar campanhas." },
              { texto: "Mas quem garante que todo esse tratamento está de", quebraAntes: true },
              { texto: "acordo com a lei?", destaque: true },
            ]}
          />
          <div className="w-full px-5 pb-24 sm:px-10 lg:px-14">
            <div className="grid gap-10 md:grid-cols-3">
              {RISCOS.map((r) => (
                <div key={r.t}>
                  <h3 className="whitespace-pre-line font-display text-[clamp(1.6rem,2.6vw,2.2rem)] leading-[1.1] text-white">{r.t}</h3>
                  <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-white/70">{r.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FUNCIONALIDADES (prints reais da plataforma) */}
        <Funcionalidades />

        <PixelEdge bg="var(--color-rail)" fill="var(--color-brand)" />

        {/* MÓDULOS */}
        <section id="modulos" className="on-light bg-brand">
          <div className="w-full px-4 pb-24 pt-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="t-display text-rail">Tudo o que a LGPD pede da sua agência, explicado e organizado</h2>
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
              <div className={CARD}>
                <ModuleText
                  name="RAT"
                  body="É a lista de tudo o que sua agência faz com os dados dos clientes: quais dados coleta, pra quê usa, onde guarda e por quanto tempo. A LGPD exige que ela exista — a Dattis monta sozinha quando você ativa a conta."
                  cta="Ver o RAT"
                  href="/planos"
                />
                <RatVisual />
              </div>

              <div className={CARD}>
                <ModuleText
                  name="DPA"
                  body="É o contrato que diz quem manda nos dados (seu cliente) e quem só executa (sua agência). Se algo der errado, ele mostra que a agência seguiu as instruções — e evita que você leve a culpa sozinho."
                  cta="Ver o DPA"
                  href="/planos"
                />
                <DpaVisual />
              </div>

              <div className="grid items-center gap-12 overflow-hidden rounded-[40px] bg-rail px-8 py-12 sm:px-14 sm:py-16 lg:col-span-12 lg:grid-cols-2">
                <ModuleText
                  dark
                  name="Subprocessadores"
                  body="São as ferramentas de outras empresas que também mexem nos dados: Meta, Google, WhatsApp, RD Station. A lei pede que você saiba quais são e deixe isso registrado. A Dattis faz a lista por cliente e avisa quando entra uma ferramenta nova."
                  cta="Ver o registro"
                  href="/planos"
                />
                <div className="pb-6">
                  <SubsVisual />
                </div>
              </div>

              <div className={CARD}>
                <ModuleText
                  name="Certificado e selo"
                  body="Um certificado com QR Code e um selo pro rodapé do site — da sua agência e de cada cliente. Qualquer pessoa clica e confere, na hora, que a documentação de privacidade está em dia."
                  cta="Ver o certificado"
                  href="/planos"
                />
                <CertVisual />
              </div>

              <div className={CARD}>
                <ModuleText
                  name="Dossiê para BM"
                  body="BM suspensa? A Dattis junta num documento só tudo o que você precisa pra contestar: dados da empresa, contrato, registro de atividades, ferramentas e certificado."
                  cta="Ver o dossiê"
                  href="/#bm-suspensa"
                />
                <DossieVisual />
              </div>

              <div className={CARD}>
                <ModuleText
                  name="Auditoria"
                  body="Varre os sites e páginas dos seus clientes e mostra o que expõe a agência: pixel rodando antes do aviso de cookies, formulário sem consentimento, política de privacidade faltando."
                  cta="Auditar um site"
                  href="/auditoria"
                />
                <AuditVisual />
              </div>

              <div className={CARD}>
                <ModuleText
                  name="DAT"
                  body="Um resumo com a situação de cada cliente — registro, contrato e ferramentas — pra você mandar sempre que ele perguntar se está tudo certo."
                  cta="Ver o DAT"
                  href="/planos"
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

        {/* BM SUSPENSA */}
        <section
          id="bm-suspensa"
          className="relative bg-rail bg-cover bg-center text-white"
          style={{ backgroundImage: "linear-gradient(180deg, rgba(0,40,32,0.6), rgba(0,40,32,0.95)), url(/marketing/solucao-glow.png)" }}
        >
          <div className="grid w-full items-center gap-16 px-5 pb-28 pt-14 sm:px-10 lg:grid-cols-[1.15fr_1fr] lg:px-14">
            <div>
              <p className="flex items-center gap-2 font-mono text-[15px] uppercase tracking-[0.03em] text-orange">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-orange" /> Urgente · BM suspensa
              </p>
              <h2 className="mt-6 font-display text-[clamp(2rem,4.4vw,3.5rem)] leading-[1.1] text-white">
                BM suspensa é campanha parada, cliente perdido e dinheiro indo embora todo dia.
              </h2>
              <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-white/85">
                Quando o Meta restringe uma Business Manager, a contestação pede que você prove que a empresa é legítima e
                trata dados do jeito certo. Ter documentos de conformidade verificáveis auxilia no processo de recuperação das
                contas — e economiza milhares de reais em mídia parada e cliente cancelado.
              </p>
              <div className="mt-8 rounded-[20px] border border-white/15 bg-white/[0.06] p-6">
                <p className="t-label !text-[18px] text-brand">Dossiê para BM</p>
                <p className="mt-2 text-[16px] leading-relaxed text-white/85">
                  A Dattis reúne, de forma organizada, todos os dados necessários pra contestar a suspensão: dados da empresa,
                  contrato, registro de atividades, ferramentas, certificado e o texto-base da contestação. Em um clique.
                </p>
              </div>
              <div className="mt-10 flex items-center gap-2">
                <Link href="/planos" className="tag">
                  Proteger minhas contas
                </Link>
                <Link href="/planos" aria-label="Ver planos" className="arrow-circle">
                  <ArrowRight size={18} strokeWidth={1.6} />
                </Link>
              </div>
            </div>
            <div className="pb-8">
              <BmAlertVisual />
            </div>
          </div>
        </section>

        <PixelEdge bg="var(--color-rail)" fill="var(--color-canvas)" />

        {/* DIFERENCIAL COMPETITIVO */}
        <section id="diferencial" className="on-light bg-gradient-to-br from-canvas to-brand-tint-2">
          <div className="w-full px-5 py-20 sm:px-10 lg:px-14">
            <p className="t-eyebrow">Diferencial competitivo</p>
            <h2 className="t-display mt-4 max-w-4xl">Se preocupar com conformidade e privacidade de dados é diferencial competitivo estratégico</h2>
            <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-body">
              Adequação à LGPD não é um documento que se faz uma vez. É gestão contínua — e a agência que consegue provar isso
              sai na frente de quem ainda torce pra não ser cobrada.
            </p>

            <ul className="mt-12">
              {DIFERENCIAIS.map((it) => (
                <li key={it.t} className="border-t border-brand-strong/60 py-10 first:border-t-0 first:pt-4">
                  <h3 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-tight">{it.t}</h3>
                  <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-body">{it.d}</p>
                  <div className="mt-7 flex flex-wrap items-center gap-1">
                    {it.tags.map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* DPO */}
        <section id="dpo" className="bg-canvas">
          <div className="grid w-full items-center gap-14 px-5 py-24 sm:px-10 lg:grid-cols-[1.1fr_1fr] lg:px-14">
            <div>
              <p className="t-eyebrow">DPO · Encarregado de dados</p>
              <h2 className="t-display mt-4 max-w-2xl">Quem responde pela privacidade da sua agência?</h2>
              <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-body">
                O DPO (encarregado de dados) é a pessoa responsável por ser o canal de comunicação entre a empresa, os donos
                dos dados e a ANPD — é o que prevê o art. 41 da LGPD. Na prática, é quem atende quando alguém pede pra saber o
                que foi feito com o próprio dado, quem responde à fiscalização e quem orienta a equipe no dia a dia.
              </p>
              <p className="mt-5 max-w-xl text-[18px] leading-relaxed text-body">
                A maioria das agências não tem ninguém nesse papel. No plano Scale, a Dattis assume a função de DPO da sua
                agência — sem você contratar ninguém.
              </p>
              <ArrowLink href="/planos" className="mt-9">
                Ver o plano Scale
              </ArrowLink>
            </div>
            <div className="block-card px-8 py-10 sm:px-12">
              <p className="t-label">O que o DPO faz</p>
              <MetaChips wrap className="mt-6" items={DPO_FUNCOES} />
            </div>
          </div>
        </section>

        {/* MULTA x ASSINATURA */}
        <section id="multa" className="bg-canvas pb-24">
          <div className="w-full px-5 sm:px-10 lg:px-14">
            <h2 className="t-display max-w-3xl">Uma assinatura custa muito menos que uma multa.</h2>
            <p className="mt-5 max-w-2xl text-[18px] leading-relaxed text-body">
              Você e seu cliente correm risco toda vez que um lead entra numa campanha. A pergunta não é se a fiscalização
              existe — é quanto custa estar sem prova quando ela chegar.
            </p>
            <BotaoCalculadora className="btn btn-dark btn-lg mt-8 max-w-full whitespace-normal text-center leading-snug">Calcular o risco da minha agência</BotaoCalculadora>
            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <div className="on-light rounded-[40px] bg-orange px-8 py-12 sm:px-12">
                <p className="t-label">Sem a Dattis</p>
                <p className="font-display mt-6 text-[clamp(2.4rem,5vw,4rem)] leading-none">Até R$ 50 mi</p>
                <p className="mt-3 text-[15px]">por infração, em multa simples de até 2% do faturamento (art. 52)</p>
                <ul className="mt-8 flex flex-col gap-2.5">
                  {SANCOES.map((s) => (
                    <li key={s} className="flex items-start gap-2.5 text-[15px]">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col rounded-[40px] bg-rail px-8 py-12 text-white sm:px-12">
                <p className="t-label text-white">Com a Dattis</p>
                <p className="font-display mt-6 text-[clamp(2.4rem,5vw,4rem)] leading-none text-brand">Um plano completo por R$ 97</p>
                <p className="mt-3 text-[15px] text-white/80">por cliente da sua agência, por mês</p>
                <ul className="mt-8 flex flex-1 flex-col gap-2.5">
                  {["Documentação de cada cliente pronta", "Prova verificável no site", "Dossiê pronto se a BM cair", "DPO no plano Scale"].map((s) => (
                    <li key={s} className="flex items-start gap-2.5 text-[15px] text-white/90">
                      <CircleCheck size={18} strokeWidth={1.6} className="mt-0.5 shrink-0 text-brand" />
                      {s}
                    </li>
                  ))}
                </ul>
                <Link href="/planos" className="btn btn-primary btn-lg mt-10 self-start">
                  Ver planos
                </Link>
              </div>
            </div>
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

        <Faq title="Perguntas frequentes" items={FAQ_ITEMS} />

        {/* FAIXA LILÁS */}
        <section className="on-light bg-lilac">
          <div className="w-full px-5 py-16 sm:px-10 lg:px-14">
            <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight">Descubra quanto sua agência está exposta.</h2>
            <div className="mt-12 flex flex-wrap items-center gap-1">
              <Link href="/diagnostico" className="tag">
                Auditoria da sua agência
              </Link>
              <span className="tag tag-white">19 perguntas, resultado na hora</span>
              <Link href="/diagnostico" aria-label="Fazer a auditoria da sua agência" className="arrow-circle">
                <ArrowRight size={18} strokeWidth={1.6} />
              </Link>
            </div>
          </div>
        </section>

        {/* FAIXA LARANJA */}
        <section id="demo" className="on-light bg-orange">
          <div className="w-full px-5 py-16 sm:px-10 lg:px-14">
            <h2 className="max-w-3xl font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight">
              Você e seu cliente estão expostos agora. Proteja a operação antes que a fiscalização — ou o Meta — bata na porta.
            </h2>
            <Link href="/planos" className="btn btn-leaf mt-12">
              Ver planos
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
      <LeiBar />
      <CalculadoraPopup />
    </div>
  );
}
