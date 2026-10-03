import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { PixelEdge } from "@/components/marketing/PixelEdge";
import { LeiBar } from "@/components/marketing/LeiBar";
import { Faq } from "@/components/marketing/Faq";
import { JsonLd } from "@/components/seo/JsonLd";
import { schemaBreadcrumb, schemaFaq } from "@/lib/schema-org";
import { SITE_URL } from "@/lib/site";
import { linkContato } from "@/lib/contato";

// Página institucional pensada para busca orgânica: responde "o que é a Dattis",
// "LGPD para agência de tráfego" e variações. Texto direto, termos técnicos explicados.

const URL = "/o-que-e-a-dattis";
const TITULO = "O que é a Dattis: plataforma de LGPD para agências de tráfego pago";
const DESCRICAO =
  "A Dattis é a plataforma de LGPD para agências de tráfego pago: RAT, contrato de operador (DPA), aviso de cookies, selo de privacidade e dossiê para BM suspensa.";

export const metadata: Metadata = {
  title: { absolute: "O que é a Dattis | LGPD para agências de tráfego pago" },
  description: DESCRICAO,
  keywords: [
    "o que é a Dattis",
    "LGPD para agências",
    "LGPD para agência de tráfego pago",
    "LGPD agência de marketing digital",
    "adequação à LGPD",
    "plataforma de LGPD",
    "RAT registro de atividades de tratamento",
    "DPA contrato de operador de dados",
    "banner de cookies LGPD",
    "selo LGPD",
    "BM suspensa",
  ],
  alternates: { canonical: URL },
  openGraph: { type: "article", url: URL, title: TITULO, description: DESCRICAO, locale: "pt_BR", siteName: "Dattis" },
};

const FATOS = [
  { k: "O que é", v: "Plataforma online de adequação à LGPD" },
  { k: "Para quem", v: "Agências de tráfego pago e marketing digital" },
  { k: "Quanto custa", v: "De R$ 47 a R$ 297 por cliente da agência, por mês" },
  { k: "Base", v: "Lei nº 13.709/2018, a LGPD" },
];

const PUBLICOS = [
  {
    t: "Donos e sócios de agência de tráfego pago",
    d: "Quem responde pela agência e quer resolver a LGPD sem virar especialista em lei nem contratar um time jurídico.",
  },
  {
    t: "Gestores de tráfego e de mídia",
    d: "Quem configura pixel, API de Conversões, formulário de lead e públicos personalizados no Meta Ads e no Google Ads todos os dias.",
  },
  {
    t: "Agências de lançamento e de infoprodutos",
    d: "Quem capta milhares de leads por campanha, opera WhatsApp, e-mail e CRM em nome do produtor e precisa provar que faz isso do jeito certo.",
  },
  {
    t: "Agências de performance e de social media",
    d: "Quem cuida de CRM, automação e atendimento no WhatsApp de vários clientes ao mesmo tempo.",
  },
];

const ENTREGAS = [
  { t: "Registro de atividades de tratamento (RAT)", d: "O que a agência faz com os dados de cada cliente, gerado sozinho ao cadastrar o cliente." },
  { t: "Contrato de operador de dados (DPA)", d: "Assinado pela agência e pelo cliente, pelo celular, com registro de data, IP e resumo criptográfico." },
  { t: "Lista de subprocessadores", d: "Meta, Google, WhatsApp, CRM e automação de cada cliente, com aviso quando entra ferramenta nova." },
  { t: "Aviso de cookies com consentimento", d: "Banner que segura o Pixel do Meta e as tags do Google até o visitante aceitar, com Modo de consentimento v2." },
  { t: "Política de privacidade e canal do titular", d: "Página pronta para o site e para o formulário de anúncio, com pedidos dos titulares e prazo controlado." },
  { t: "Certificado e selo de privacidade", d: "Selo no rodapé do site da agência e de cada cliente, que qualquer pessoa confere por QR Code." },
  { t: "Vigilância diária", d: "Todo dia às 6h a Dattis confere os sites e a documentação e aponta o que precisa de ajuste." },
  { t: "Dossiê para BM suspensa", d: "Os documentos que a contestação no Meta pede, reunidos num arquivo só." },
];

const NAO_E = [
  { t: "Não é um escritório de advocacia", d: "A Dattis cuida da conformidade do dia a dia. Processos e casos complexos vão para um parceiro jurídico." },
  { t: "Não é a ANPD nem fala em nome dela", d: "Os relatórios e o selo são da Dattis, identificados como tal, e nunca imitam comunicação oficial." },
  { t: "Não é certificado digital ICP-Brasil", d: "É um certificado de privacidade de dados: mostra que a documentação da empresa está registrada e em dia." },
];

const FAQ = [
  {
    q: "O que é a Dattis?",
    a: "A Dattis é uma plataforma brasileira de adequação à LGPD feita para agências de tráfego pago e marketing digital. Ela organiza o registro de atividades de tratamento (RAT), o contrato de operador de dados (DPA), a lista de ferramentas que tratam dados, o aviso de cookies, a política de privacidade e o selo de cada cliente da agência, e confere tudo isso todos os dias.",
  },
  {
    q: "Agência de tráfego pago precisa se adequar à LGPD?",
    a: "Sim. Quando a agência sobe listas no Meta, recebe leads de formulário, opera CRM ou atende no WhatsApp em nome do cliente, ela trata dados pessoais como operadora (art. 5º, VII da LGPD). A lei prevê responsabilidade solidária entre operador e controlador (art. 42): se der problema, a agência pode responder junto com o cliente.",
  },
  {
    q: "O que são RAT e DPA?",
    a: "O RAT (registro de atividades de tratamento) é a anotação do que a empresa faz com os dados: quais dados, pra quê, onde ficam e por quanto tempo (art. 37). O DPA é o contrato entre o cliente, dono dos dados, e a agência, que executa o tratamento seguindo as instruções dele (art. 39). A Dattis gera os dois para cada cliente da agência.",
  },
  {
    q: "A Dattis ajuda quando a BM é suspensa?",
    a: "Sim. O Dossiê para BM reúne os dados da empresa, o contrato de operação, o registro de atividades, as ferramentas e o certificado, com um texto-base para a contestação. A decisão continua sendo do Meta, mas a agência contesta no mesmo dia, com a documentação organizada.",
  },
  {
    q: "Quanto custa a Dattis?",
    a: "De R$ 47 a R$ 297 por cliente da agência, por mês, sem fidelidade. O plano Growth, de R$ 97, cobre o essencial: contrato com assinatura eletrônica, certificado e selo, dossiê para BM, vigilância diária e resumo de conformidade para o cliente.",
  },
  {
    q: "A Dattis substitui um advogado ou um DPO?",
    a: "Não substitui advogado: a Dattis automatiza a parte operacional da LGPD e encaminha casos complexos a um parceiro jurídico. Já o papel de encarregado (DPO) pode ser assumido pela Dattis no plano Scale.",
  },
];

export default function OQueEADattisPage() {
  return (
    <div className="relative">
      <JsonLd
        dados={[
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "@id": `${SITE_URL}${URL}#pagina`,
            url: `${SITE_URL}${URL}`,
            name: TITULO,
            description: DESCRICAO,
            inLanguage: "pt-BR",
            about: { "@id": `${SITE_URL}/#organizacao` },
            isPartOf: { "@id": `${SITE_URL}/#site` },
          },
          schemaBreadcrumb([
            { nome: "Início", url: "/" },
            { nome: "O que é a Dattis", url: URL },
          ]),
          schemaFaq(FAQ.map((f) => ({ pergunta: f.q, resposta: f.a }))),
          {
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: "O que é a Dattis: LGPD para agências de tráfego pago",
            description:
              "Em 30 segundos: por que toda agência de tráfego trata dados pessoais e responde junto com o cliente pela LGPD, e como a Dattis organiza registro, contrato, cookies, selo e dossiê para BM suspensa.",
            thumbnailUrl: `${SITE_URL}/videos/dattis-desktop.jpg`,
            contentUrl: `${SITE_URL}/videos/dattis-desktop.mp4`,
            uploadDate: "2026-10-03",
            duration: "PT30S",
            inLanguage: "pt-BR",
            publisher: { "@id": `${SITE_URL}/#organizacao` },
          },
        ]}
      />
      <SiteHeader />

      <main>
        {/* ABERTURA */}
        <section className="px-5 pb-16 pt-12 sm:px-10 sm:pt-16 lg:px-14">
          <nav aria-label="Você está em" className="font-mono text-[12px] uppercase tracking-[0.05em] text-muted">
            <Link href="/" className="hover:text-ink">
              Início
            </Link>
            <span className="mx-2">/</span>
            <span className="text-ink">O que é a Dattis</span>
          </nav>
          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-end">
            <div>
              <p className="t-eyebrow">Sobre a Dattis</p>
              <h1 className="mt-5 max-w-[20ch] font-display text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.05] text-ink">
                O que é a Dattis: a plataforma de LGPD para agências de tráfego pago
              </h1>
              <p className="mt-7 max-w-2xl text-[19px] leading-relaxed text-body">
                <strong className="font-semibold text-ink">A Dattis é uma plataforma brasileira de adequação à LGPD feita para agências de tráfego pago e marketing digital.</strong>{" "}
                Ela organiza o registro de atividades de tratamento (RAT), o contrato de operador de dados (DPA), o aviso de cookies,
                a política de privacidade e o selo de cada cliente da agência, e confere tudo isso todos os dias.
              </p>
            </div>
            <dl className="grid gap-px overflow-hidden rounded-[24px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-1">
              {FATOS.map((f) => (
                <div key={f.k} className="bg-surface px-6 py-4">
                  <dt className="font-mono text-[11.5px] uppercase tracking-[0.05em] text-muted">{f.k}</dt>
                  <dd className="mt-1 text-[16px] text-ink">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* VÍDEO: horizontal a partir do tablet, vertical no celular; só baixa quando a pessoa dá play */}
        <section aria-labelledby="video-titulo" className="px-5 pb-20 sm:px-10 lg:px-14">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h2 id="video-titulo" className="font-display text-[clamp(1.5rem,2.6vw,2rem)] leading-tight text-ink">
                A Dattis em 30 segundos
              </h2>
              <p className="text-[14.5px] text-muted">Por que a agência responde pelos dados e como a Dattis resolve isso.</p>
            </div>
            <video
              controls
              playsInline
              preload="none"
              poster="/videos/dattis-desktop.jpg"
              className="mt-5 hidden aspect-video w-full rounded-[24px] border border-line bg-surface md:block"
              aria-label="Vídeo: o que é a Dattis"
            >
              <source src="/videos/dattis-desktop.mp4" type="video/mp4" />
            </video>
            <video
              controls
              playsInline
              preload="none"
              poster="/videos/dattis-mobile.jpg"
              className="mx-auto mt-5 aspect-[9/16] w-full max-w-[400px] rounded-[24px] border border-line bg-surface md:hidden"
              aria-label="Vídeo: o que é a Dattis"
            >
              <source src="/videos/dattis-mobile.mp4" type="video/mp4" />
            </video>
          </div>
        </section>

        <PixelEdge bg="var(--color-canvas)" fill="var(--color-forest)" />

        {/* POR QUE FOI FUNDADA */}
        <section className="bg-forest text-white">
          <div className="grid w-full gap-12 px-5 pb-24 pt-10 sm:px-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:px-14">
            <div>
              <p className="font-mono text-[13px] uppercase tracking-[0.06em] text-brand">Por que a Dattis foi fundada</p>
              <h2 className="mt-5 font-display text-[clamp(2rem,4vw,3.2rem)] leading-[1.08] text-white">
                A agência de tráfego trata dados de dezenas de empresas e quase nenhuma está preparada para isso.
              </h2>
            </div>
            <div className="flex flex-col gap-5 text-[17px] leading-relaxed text-white/80 lg:pt-12">
              <p>
                Toda agência de tráfego pago lida com dados pessoais o dia inteiro: sobe listas de clientes para criar públicos no
                Meta Ads, recebe leads de formulário, envia conversões pela API, atende no WhatsApp e alimenta o CRM. Para a LGPD,
                isso faz da agência uma <strong className="font-semibold text-white">operadora de dados</strong> (art. 5º, VII) de
                cada cliente que ela atende.
              </p>
              <p>
                E a lei prevê <strong className="font-semibold text-white">responsabilidade solidária</strong> entre operador e
                controlador (art. 42). Se um lead reclamar, se a ANPD fiscalizar ou se o Meta suspender a BM, a agência pode
                responder junto com o cliente. Se ela usar os dados fora das instruções do cliente, por exemplo misturando listas
                entre contas, passa a responder como se fosse a dona dos dados.
              </p>
              <p>
                As soluções de LGPD que existiam foram pensadas para uma empresa cuidando dos próprios dados, não para uma agência
                que opera dados de vinte, cinquenta ou cem clientes ao mesmo tempo. Consultoria jurídica para cada cliente sai caro
                e não acompanha o ritmo de campanha.
              </p>
              <p className="text-white">
                A Dattis nasceu para resolver isso: fazer da LGPD na agência algo tão simples e recorrente quanto a contabilidade.
                Uma obrigação fixa, organizada num painel só, que protege a agência e ainda vira argumento de venda.
              </p>
            </div>
          </div>
        </section>

        <PixelEdge bg="var(--color-forest)" fill="var(--color-brand)" />

        {/* PARA QUEM */}
        <section className="on-light bg-brand">
          <div className="w-full px-5 pb-24 pt-10 sm:px-10 lg:px-14">
            <p className="t-eyebrow !text-rail">Para quem é a Dattis</p>
            <h2 className="t-display mt-4 max-w-4xl text-rail">Feita para quem opera dados de clientes em campanhas, todos os dias</h2>
            <ul className="mt-12 grid gap-4 md:grid-cols-2">
              {PUBLICOS.map((p) => (
                <li key={p.t} className="rounded-[28px] bg-white/80 p-7">
                  <h3 className="font-display text-[24px] leading-tight text-rail">{p.t}</h3>
                  <p className="mt-3 text-[16px] leading-relaxed text-rail/80">{p.d}</p>
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-3xl text-[16px] leading-relaxed text-rail/85">
              Os clientes da agência, como e-commerces, infoprodutores e negócios locais, também saem ganhando: recebem o contrato,
              a política de privacidade, o aviso de cookies e o selo no próprio site, sem precisar contratar nada à parte.
            </p>
          </div>
        </section>

        <PixelEdge flip bg="var(--color-canvas)" fill="var(--color-brand)" />

        {/* O QUE FAZ */}
        <section className="bg-canvas">
          <div className="w-full px-5 py-20 sm:px-10 lg:px-14">
            <p className="t-eyebrow">O que a Dattis faz</p>
            <h2 className="t-display mt-4 max-w-4xl">Tudo o que a LGPD pede da agência, num painel só</h2>
            <ul className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
              {ENTREGAS.map((e) => (
                <li key={e.t} className="border-t border-line-strong pt-5">
                  <h3 className="font-display text-[20px] leading-snug text-ink">{e.t}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-body">{e.d}</p>
                </li>
              ))}
            </ul>
            <Link href="/#funcionalidades" className="btn btn-dark mt-12">
              Ver as telas da plataforma <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* O QUE NÃO É */}
        <section className="bg-canvas">
          <div className="w-full px-5 pb-24 sm:px-10 lg:px-14">
            <div className="rounded-[40px] border border-line bg-surface px-6 py-12 sm:px-12">
              <p className="t-eyebrow">Para não ter dúvida</p>
              <h2 className="mt-4 font-display text-[clamp(1.8rem,3.4vw,2.6rem)] leading-tight text-ink">O que a Dattis não é</h2>
              <ul className="mt-10 grid gap-8 md:grid-cols-3">
                {NAO_E.map((n) => (
                  <li key={n.t}>
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-muted">
                      <X size={17} />
                    </span>
                    <h3 className="mt-4 font-display text-[20px] leading-snug text-ink">{n.t}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-body">{n.d}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <Faq title="Perguntas sobre a Dattis" items={FAQ} />

        {/* CTA */}
        <section className="bg-rail text-white">
          <div className="grid w-full gap-10 px-5 py-20 sm:px-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-14">
            <div>
              <h2 className="max-w-3xl font-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight text-white">
                Quer ver como a Dattis funciona na sua agência?
              </h2>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-white/80">
                {["Sem fidelidade", "A partir de R$ 47 por cliente", "Demonstração sem senha"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check size={16} className="text-brand" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/api/auth/demo" prefetch={false} className="btn btn-primary">
                Testar a plataforma <ArrowRight size={16} />
              </Link>
              <a
                href={linkContato("Olá! Li sobre a Dattis e quero entender como funciona na minha agência.")}
                target="_blank"
                rel="noopener"
                className="btn border-white/25 text-white hover:border-white/60"
              >
                Falar com a equipe
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <LeiBar />
    </div>
  );
}
