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
import { VideoDattis } from "@/components/marketing/VideoDattis";
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

const PASSOS = [
  { t: "Você diz quem são seus clientes", d: "Nome, site e as ferramentas que a agência usa em cada um: Meta Ads, Google, WhatsApp, CRM. Leva poucos minutos." },
  { t: "O DPO da Dattis cuida de tudo", d: "Registro, contrato com cada cliente, aviso de cookies, pedidos de titulares e vigilância diária dos sites. Quem faz somos nós." },
  { t: "Você recebe a prova", d: "Relatório para mandar ao cliente, selo de privacidade no site e dossiê pronto se a BM cair. Tudo registrado no seu painel." },
];

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
    d: "Mandar o relatório de conformidade e o certificado pro cliente vira entrega recorrente — mais um motivo pra ele renovar com você. E quem faz o trabalho é o seu DPO na Dattis.",
    tags: ["Retenção", "Valor percebido"],
  },
];

const DPO_FUNCOES = [
  { icon: Inbox, label: "Responde os pedidos dos titulares dentro do prazo" },
  { icon: GraduationCap, label: "Prepara e cobra os contratos de cada cliente" },
  { icon: MessageSquareWarning, label: "Acompanha a vigilância e pede os ajustes nos sites" },
  { icon: Landmark, label: "Responde à ANPD e é o contato público (Scale)" },
  { icon: Siren, label: "Conduz a resposta a incidentes (Scale)" },
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
    q: "O que significa a Dattis ser o DPO da minha agência?",
    a: "Que a gente faz o trabalho de privacidade por você. Nos planos Growth e Scale, o DPO da Dattis opera a LGPD de cada cliente que você atende: mantém o registro em dia, prepara e cobra os contratos, acompanha o aviso de cookies, responde os pedidos de titulares e pede os ajustes nos sites quando a vigilância encontra algo. Tudo fica registrado no seu painel.",
  },
  {
    q: "Minha agência precisa mesmo de um DPO?",
    a: "Se você gerencia campanhas, CRM, WhatsApp ou automação em nome de clientes, a LGPD trata sua agência como operadora de dados (art. 5º, VII) e prevê responsabilidade solidária com o cliente (art. 42). Alguém precisa cuidar disso de forma contínua: registro, contratos, pedidos de titulares. É esse o papel do DPO.",
  },
  {
    q: "Qual a diferença entre os planos?",
    a: "No Start (R$ 47 por cliente/mês), a própria agência usa a plataforma e faz tudo. No Growth (R$ 97), a Dattis é o DPO da sua agência e faz o trabalho por você. No Scale (R$ 297), além disso, a Dattis é nomeada encarregada oficial da agência, responde à ANPD, conduz incidentes e você tem um gestor dedicado.",
  },
  {
    q: "A Dattis assina contratos ou mexe nas minhas contas sem eu saber?",
    a: "Não. Assinar é da agência e do cliente: o DPO prepara o contrato e cobra as assinaturas. Ele só entra na sua conta com a sua autorização, que você liga e desliga quando quiser, e cada ação fica registrada com o nome dele. Login, senha e equipe continuam só com você.",
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
    q: "Isso substitui um advogado?",
    a: "Não. A Dattis cuida da operação de privacidade do dia a dia, como DPO. Contencioso e casos complexos continuam sendo encaminhados a um parceiro jurídico.",
  },
];

function ModuleText({ tecnico, titulo, body, cta, href, dark = false }: { tecnico: string; titulo: string; body: string; cta: string; href: string; dark?: boolean }) {
  return (
    <div>
      <span className={"inline-flex rounded-full px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.04em] " + (dark ? "bg-brand text-rail" : "bg-rail text-brand")}>
        {tecnico}
      </span>
      <h3 className={"mt-5 max-w-lg font-display text-[clamp(1.6rem,2.6vw,2.2rem)] leading-[1.12] " + (dark ? "text-white" : "text-ink")}>{titulo}</h3>
      <p className={"mt-5 max-w-md text-[17px] leading-relaxed " + (dark ? "text-white/85" : "text-body")}>{body}</p>
      <ArrowLink href={href} className={"mt-8 " + (dark ? "!text-white" : "")}>
        {cta}
      </ArrowLink>
    </div>
  );
}

const CARD = "block-card flex flex-col justify-between gap-12 px-8 pt-12 sm:px-14 sm:pt-16 lg:col-span-6";

export const metadata: Metadata = {
  title: { absolute: "Dattis — o DPO da sua agência de tráfego pago" },
  description:
    "A Dattis é o DPO das agências de tráfego pago: cuidamos da LGPD de cada cliente que você atende, com contratos, registros, cookies, pedidos de titulares e vigilância diária. A partir de R$ 47 por cliente.",
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
            <p className="t-eyebrow">DPO para agências de tráfego pago · LGPD</p>
            <h1 className="t-hero t-hero-home mx-auto mt-5 max-w-[17ch]">
              <span className="text-brand-ink">Agência de Tráfego:</span> a Dattis é o seu DPO.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-[20px] leading-[1.4] text-body">
              Nós cuidamos da LGPD de cada cliente que a sua agência atende. Você continua rodando campanha, sem contratar
              ninguém e sem correr o risco de multas de até 2% do faturamento.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <VideoDattis />
              <Link href="/planos" className="btn btn-primary btn-lg">
                Quero a Dattis como DPO
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

        <PixelEdge bg="var(--color-forest)" fill="var(--color-brand)" />

        {/* MÓDULOS */}
        <section id="modulos" className="on-light bg-brand">
          <div className="w-full px-4 pb-24 pt-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <p className="t-eyebrow !text-rail">A solução</p>
              <h2 className="t-display mt-4 text-rail">A Dattis é o DPO da sua agência. E faz o trabalho por você.</h2>
              <p className="mx-auto mt-6 max-w-2xl text-[19px] leading-relaxed text-rail/85">
                O DPO é quem cuida da privacidade da empresa. A maioria das agências não tem um, e um DPO contratado não daria
                conta de dezenas de clientes. A Dattis assume esse papel: nós operamos a LGPD de cada cliente que você atende, e
                você acompanha tudo num painel, com cada ação registrada.
              </p>
            </div>

            <ol className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-3">
              {PASSOS.map((p, i) => (
                <li key={p.t} className="rounded-[28px] bg-white/75 p-6 sm:p-7">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-rail font-mono text-[15px] text-brand">{i + 1}</span>
                  <p className="mt-5 font-display text-[23px] leading-tight text-rail">{p.t}</p>
                  <p className="mt-2 text-[15.5px] leading-relaxed text-rail/80">{p.d}</p>
                </li>
              ))}
            </ol>

            <p className="mt-20 text-center font-mono text-[14px] uppercase tracking-[0.05em] text-rail">O que o seu DPO entrega</p>

            <div className="mt-8 grid gap-5 lg:grid-cols-12">
              <div className={CARD}>
                <ModuleText
                  tecnico="RAT · Registro de atividades"
                  titulo="Um registro do que sua agência faz com os dados de cada cliente"
                  body="Subir a lista de clientes no Meta, receber lead do formulário, atender no WhatsApp: tudo isso é tratar dados. A lei pede que fique anotado pra quê, onde e por quanto tempo. A Dattis anota sozinha quando você cadastra o cliente."
                  cta="Ver o RAT"
                  href="/planos"
                />
                <RatVisual />
              </div>

              <div className={CARD}>
                <ModuleText
                  tecnico="DPA · Contrato de dados"
                  titulo="Um contrato que deixa claro de quem é a responsabilidade"
                  body="O dono dos dados é o seu cliente; a agência só executa o que ele pede. Se der problema com um lead, o contrato mostra que você seguiu as instruções e não leva a culpa sozinho. O cliente assina pelo celular."
                  cta="Ver o DPA"
                  href="/planos"
                />
                <DpaVisual />
              </div>

              <div className="grid items-center gap-12 overflow-hidden rounded-[40px] bg-rail px-8 py-12 sm:px-14 sm:py-16 lg:col-span-12 lg:grid-cols-2">
                <ModuleText
                  dark
                  tecnico="Subprocessadores"
                  titulo="A lista das ferramentas que mexem nos dados dos seus clientes"
                  body="Meta, Google, WhatsApp, RD Station, Zapier. A lei pede que você saiba quais ferramentas recebem os dados de cada cliente. A Dattis monta essa lista e avisa quando entra uma ferramenta nova sem contrato."
                  cta="Ver o registro"
                  href="/planos"
                />
                <div className="pb-6">
                  <SubsVisual />
                </div>
              </div>

              <div className={CARD}>
                <ModuleText
                  tecnico="Certificado e selo"
                  titulo="Um selo no site que prova que está tudo em dia"
                  body="Vai no rodapé do seu site e do site de cada cliente. Qualquer pessoa clica e confere na hora. Passa confiança pro visitante e pro cliente que está decidindo se fecha com você."
                  cta="Ver o certificado"
                  href="/planos"
                />
                <CertVisual />
              </div>

              <div className={CARD}>
                <ModuleText
                  tecnico="Dossiê para BM"
                  titulo="Os documentos pra contestar uma BM suspensa, num clique"
                  body="Quando o Meta restringe uma conta, ele quer ver que a empresa é séria e cuida dos dados. A Dattis junta tudo num arquivo só: dados da empresa, contrato, registro e certificado, mais um texto-base pra contestação."
                  cta="Ver o dossiê"
                  href="/#bm-suspensa"
                />
                <DossieVisual />
              </div>

              <div className={CARD}>
                <ModuleText
                  tecnico="Auditoria"
                  titulo="Um raio-x dos sites dos seus clientes"
                  body="Mostra o que expõe a agência sem você precisar entender de código: pixel rodando antes do aviso de cookies, formulário sem consentimento, política de privacidade faltando."
                  cta="Auditar um site"
                  href="/auditoria"
                />
                <AuditVisual />
              </div>

              <div className={CARD}>
                <ModuleText
                  tecnico="Relatório para o cliente"
                  titulo="Um relatório simples pra mandar ao cliente"
                  body="Quando o cliente perguntar se está tudo certo com a LGPD, você manda um link ou um PDF com a situação dele. Vira mais uma entrega da agência e mais um motivo pra ele renovar."
                  cta="Ver o relatório"
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

        {/* FUNCIONALIDADES (prints reais da plataforma) */}
        <Funcionalidades />

        {/* BM SUSPENSA */}
        <section
          id="bm-suspensa"
          className="relative border-t border-white/10 bg-rail bg-cover bg-center text-white"
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
                  Como seu DPO, a Dattis já mantém a documentação de cada cliente em dia. Se a BM cair, o dossiê sai em um
                  clique: dados da empresa, contrato, registro de atividades, ferramentas, certificado e o texto-base da contestação.
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
              <h2 className="t-display mt-4 max-w-2xl">Por que sua agência precisa de um DPO. E por que ele pode ser a Dattis.</h2>
              <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-body">
                O DPO (encarregado de dados) é a pessoa responsável por ser o canal de comunicação entre a empresa, os donos
                dos dados e a ANPD — é o que prevê o art. 41 da LGPD. Na prática, é quem atende quando alguém pede pra saber o
                que foi feito com o próprio dado, quem responde à fiscalização e quem orienta a equipe no dia a dia.
              </p>
              <p className="mt-5 max-w-xl text-[18px] leading-relaxed text-body">
                Contratar um DPO custa caro e não escala: ele teria que acompanhar cada cliente que você atende. Nos planos Growth
                e Scale, a Dattis é o DPO da sua agência, cobrado por cliente atendido, sem você contratar ninguém.
              </p>
              <ArrowLink href="/planos" className="mt-9">
                Ver os planos com DPO
              </ArrowLink>
            </div>
            <div className="block-card px-8 py-10 sm:px-12">
              <p className="t-label">O que a Dattis faz como seu DPO</p>
              <MetaChips wrap className="mt-6" items={DPO_FUNCOES} />
            </div>
          </div>
        </section>

        {/* MULTA x ASSINATURA */}
        <section id="multa" className="bg-canvas pb-24">
          <div className="w-full px-5 sm:px-10 lg:px-14">
            <h2 className="t-display max-w-3xl">Um DPO custa muito menos que uma multa.</h2>
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
                <p className="font-display mt-6 text-[clamp(2.4rem,5vw,4rem)] leading-none text-brand">Seu DPO por R$ 97</p>
                <p className="mt-3 text-[15px] text-white/80">por cliente da sua agência, por mês</p>
                <ul className="mt-8 flex flex-1 flex-col gap-2.5">
                  {["A Dattis como DPO, cuidando de cada cliente", "Contratos e registros prontos e assinados", "Prova verificável no site", "Dossiê pronto se a BM cair"].map((s) => (
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
              Você e seu cliente estão expostos agora. Tenha um DPO cuidando disso antes que a fiscalização — ou o Meta — bata na porta.
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
