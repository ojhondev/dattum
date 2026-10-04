import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowRight, Check, FileSignature, Fingerprint, Radar, Send, Smartphone } from "lucide-react";
import { MetaChips } from "@/components/marketing/MetaChips";
import { CarrosselFuncionalidades, type Slide } from "@/components/marketing/CarrosselFuncionalidades";
import bannerCookies from "../../public/marketing/app/banner-cookies.webp";
import cookiesNumeros from "../../public/marketing/app/cookies-numeros.webp";
import cookiesGtm from "../../public/marketing/app/cookies-gtm.webp";
import vigilancia from "../../public/marketing/app/vigilancia.webp";
import assinaturaCelular from "../../public/marketing/app/assinatura-celular.webp";
import politica from "../../public/marketing/app/politica.webp";
import titulares from "../../public/marketing/app/titulares.webp";
import dat from "../../public/marketing/app/dat.webp";
import seloClaro from "../../public/marketing/app/selo-claro.png";
import seloEscuro from "../../public/marketing/app/selo-escuro.png";
import certificados from "../../public/marketing/app/certificados.webp";

// Prints REAIS da plataforma (conta demo). Para atualizar: npx tsx scripts/capturar-telas.mts

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

/** Palco do slide: mesma proporção em todos, para a pista não pular de altura. */
function Palco({ children }: { children: React.ReactNode }) {
  return <div className="fs-palco relative aspect-[16/11] w-full overflow-hidden rounded-[28px] border border-white/10">{children}</div>;
}

/** Moldura de navegador em volta de um print, recortada no topo. */
function Janela({
  src,
  alt,
  endereco,
  className = "",
  corte = "aspect-[16/10]",
  atraso = 0,
}: {
  src: StaticImageData;
  alt: string;
  endereco: string;
  className?: string;
  corte?: string;
  atraso?: number;
}) {
  return (
    <figure className={"fs-entra absolute overflow-hidden rounded-[14px] bg-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.65)] " + className} style={d(atraso)}>
      <div className="flex items-center gap-1.5 border-b border-[#e3e3e1] bg-[#f9f9f7] px-3 py-2" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-[#e0e5e2]" />
        <span className="h-2 w-2 rounded-full bg-[#e0e5e2]" />
        <span className="h-2 w-2 rounded-full bg-[#e0e5e2]" />
        <span className="ml-2 truncate rounded-md bg-white px-2.5 py-0.5 font-mono text-[10px] text-[#59645f]">{endereco}</span>
      </div>
      <div className={"relative " + corte}>
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 50vw, 90vw" className="object-cover object-top" placeholder="blur" />
      </div>
    </figure>
  );
}

function Chips({ className, atraso, items }: { className: string; atraso: number; items: Parameters<typeof MetaChips>[0]["items"] }) {
  return (
    <div className={"fs-entra absolute hidden sm:block " + className} style={d(atraso)} aria-hidden="true">
      <MetaChips items={items} />
    </div>
  );
}

const SLIDES: Slide[] = [
  {
    id: "cookies",
    rotulo: "Aviso de cookies",
    titulo: "Banner de cookies que segura o pixel até o visitante aceitar",
    texto:
      "Uma linha de código no site do cliente e pronto: o aviso pede o consentimento, só deixa o Pixel do Meta e as tags do Google rodarem depois do “Aceitar” e guarda a prova de cada escolha.",
    pontos: ["Aceitar, recusar ou personalizar, como a LGPD pede", "Prova de consentimento com data, página e versão", "Números de aceite por site, direto no painel"],
    visual: (
      <Palco>
        <Janela src={cookiesNumeros} alt="Módulo Cookies no painel da Dattis com as escolhas dos visitantes nos últimos 30 dias" endereco="dattis · Cookies" className="left-[5%] top-[6%] w-[80%]" atraso={150} />
        <figure className="fs-entra absolute bottom-[6%] right-[4%] w-[72%] overflow-hidden rounded-[12px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]" style={d(450)}>
          <Image src={bannerCookies} alt="Aviso de cookies da Dattis no rodapé de um site, com Aceitar todos, Recusar e Personalizar" sizes="(min-width: 1024px) 40vw, 70vw" placeholder="blur" />
        </figure>
      </Palco>
    ),
  },
  {
    id: "gtm",
    rotulo: "Google Tag Manager",
    titulo: "Integração com o Gerenciador de Tags e o Modo de consentimento do Google",
    texto:
      "O aviso já liga o Modo de consentimento v2 que o Google exige. Para quem usa o Gerenciador de Tags, WordPress, Shopify ou outro construtor, a Dattis mostra o passo a passo e confere a instalação sozinha.",
    pontos: ["Tags do Google respeitam a escolha automaticamente", "Passo a passo por plataforma, em português", "“Verificar instalação” aponta o que falta ajustar"],
    visual: (
      <Palco>
        <Janela src={cookiesGtm} alt="Passo a passo de instalação do aviso de cookies com o Google Tag Manager" endereco="dattis · Cookies · instalação" className="left-[5%] top-[6%] w-[54%]" corte="aspect-[16/15]" atraso={150} />
        <div className="fs-entra absolute right-[5%] top-[16%] w-[42%] rounded-[16px] bg-white p-4 text-[#0a120f] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.65)]" style={d(450)} aria-hidden="true">
          <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-[#59645f]">Modo de consentimento v2</p>
          <p className="mt-1 text-[12.5px] font-medium">Depois do “Aceitar todos”</p>
          <ul className="mt-3 space-y-1.5 font-mono text-[10.5px]">
            {["ad_storage", "ad_user_data", "ad_personalization", "analytics_storage"].map((k) => (
              <li key={k} className="flex items-center justify-between gap-2 rounded-lg bg-[#f4f4f2] px-2 py-1.5">
                <span className="truncate">{k}</span>
                <span className="shrink-0 rounded-full bg-[#cff5e1] px-2 py-0.5 text-[#05563a]">granted</span>
              </li>
            ))}
          </ul>
        </div>
        <Chips className="bottom-[8%] right-[5%]" atraso={700} items={[{ icon: Check, label: "Instalação verificada", status: "sim" }]} />
      </Palco>
    ),
  },
  {
    id: "selo",
    rotulo: "Selo verificável",
    titulo: "Selo no rodapé da agência e de cada cliente, verificável por qualquer pessoa",
    texto:
      "Quando a documentação fica completa, o certificado sai sozinho. O selo mostra a situação do dia e, ao clicar, abre a página de verificação com o nome da agência. Versão clara, escura e PNG para materiais.",
    pontos: ["Emitido e renovado automaticamente", "Fica inválido sozinho se algo deixar de estar em dia", "QR Code para propostas e apresentações"],
    visual: (
      <Palco>
        <Image
          src={seloClaro}
          alt="Selo Dattis versão clara: este site passa por verificações diárias de privacidade e segurança de dados, conforme a LGPD"
          sizes="(min-width: 1024px) 34vw, 60vw"
          className="fs-entra absolute left-[7%] top-[9%] w-[60%] rounded-[10px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)]"
          style={d(150)}
        />
        <Image
          src={seloEscuro}
          alt="Selo Dattis versão escura"
          sizes="(min-width: 1024px) 34vw, 60vw"
          className="fs-entra absolute left-[20%] top-[27%] w-[60%] rounded-[10px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
          style={d(300)}
        />
        <Janela src={certificados} alt="Certificado emitido no painel, com código do selo e QR Code" endereco="dattis · Certificados e selo" className="bottom-[7%] right-[5%] w-[66%]" corte="aspect-[2184/836]" atraso={500} />
      </Palco>
    ),
  },
  {
    id: "vigilancia",
    rotulo: "Monitoramento diário",
    titulo: "Vigilância automática todo dia às 6h, nos sites e na documentação",
    texto:
      "A Dattis visita o site de cada cliente e confere cadeado de segurança, pixel disparando sem consentimento, formulário sem política e contrato vencido. O problema aparece no painel antes de virar denúncia ou BM suspensa.",
    pontos: ["Nota de 0 a 100 por cliente", "Alertas por gravidade, com o que corrigir", "Certificado e selo acompanham o resultado"],
    visual: (
      <Palco>
        <Janela src={vigilancia} alt="Tela de Vigilância da Dattis com a nota de cada cliente e os alertas" endereco="dattis · Vigilância" className="left-[5%] top-[6%] w-[90%]" atraso={150} />
        <Chips className="bottom-[6%] left-[4%]" atraso={500} items={[{ icon: Radar, label: "Verificado hoje às 06:00", status: "sim" }]} />
      </Palco>
    ),
  },
  {
    id: "assinatura",
    rotulo: "Contrato assinado",
    titulo: "O cliente assina o contrato de dados pelo celular, sem criar conta",
    texto:
      "A agência assina no painel e manda um link pelo WhatsApp. O cliente lê, assina e baixa o PDF. Ficam registrados nome, e-mail, data, IP, navegador e o resumo criptográfico do texto.",
    pontos: ["Assinatura das duas partes, como a LGPD pede", "Nova versão automática quando a operação muda", "Histórico de versões e PDF com evidências"],
    visual: (
      <Palco>
        <figure className="fs-entra absolute left-[8%] top-[6%] overflow-hidden rounded-t-[30px] border-[7px] border-b-0 border-[#0d3a2f] bg-[#0d3a2f] sm:left-[12%]" style={d(150)}>
          <Image src={assinaturaCelular} alt="Página de assinatura do contrato de dados no celular do cliente" sizes="260px" className="h-auto w-[clamp(150px,24vw,270px)] rounded-t-[23px]" placeholder="blur" />
        </figure>
        <div className="absolute right-[5%] top-[22%] hidden flex-col items-start gap-2.5 sm:flex" aria-hidden="true">
          {[
            { icon: FileSignature, label: "Assinado pelas duas partes", status: "sim" as const },
            { icon: Smartphone, label: "Sem criar conta", status: "sim" as const },
            { icon: Fingerprint, label: "Resumo SHA-256 do texto" },
          ].map((c, i) => (
            <div key={c.label} className="fs-entra" style={d(450 + i * 150)}>
              <MetaChips items={[c]} />
            </div>
          ))}
        </div>
      </Palco>
    ),
  },
  {
    id: "titular",
    rotulo: "Política e canal do titular",
    titulo: "Política de privacidade pronta e um canal para os pedidos das pessoas",
    texto:
      "A Dattis publica a política de privacidade de cada cliente, sempre atualizada, para colar no site e no formulário de anúncio do Meta e do Google. Quem quiser ver ou apagar os próprios dados pede por ali, com protocolo e prazo de 15 dias.",
    pontos: ["Escrita a partir do que a agência faz de verdade", "Link pronto para o Formulário instantâneo do Meta", "Pedidos com protocolo e aviso de prazo no painel"],
    visual: (
      <Palco>
        <Janela src={politica} alt="Política de privacidade pública de um cliente, hospedada pela Dattis" endereco="dattis · política da Loja Aurora" className="left-[5%] top-[6%] w-[72%]" atraso={150} />
        <Janela src={titulares} alt="Tela de pedidos de titulares no painel, com protocolo e prazo" endereco="dattis · Pedidos de titulares" className="bottom-[6%] right-[4%] w-[58%]" atraso={450} />
      </Palco>
    ),
  },
  {
    id: "dat",
    rotulo: "Resumo para o cliente",
    titulo: "Um resumo de conformidade para mandar ao cliente todo mês",
    texto:
      "O relatório mostra registro, contrato, ferramentas, site e certificado numa folha só, com link sempre atualizado ou PDF. É a entrega recorrente que prova o valor da agência e ajuda a renovar o contrato.",
    pontos: ["Link público sempre com os dados do dia", "PDF para anexar no relatório mensal", "Próximos passos em linguagem simples"],
    visual: (
      <Palco>
        <Janela src={dat} alt="Relatório de conformidade de um cliente" endereco="dattis · Resumo para o cliente" className="left-[5%] top-[6%] w-[90%]" atraso={150} />
        <Chips className="bottom-[6%] right-[4%]" atraso={500} items={[{ icon: Send, label: "Enviado pro cliente", status: "sim" }]} />
      </Palco>
    ),
  },
];

const EXTRAS = [
  "Um login por pessoa da equipe, com registro de quem fez o quê",
  "Exportação de todos os dados em um clique",
  "Tour guiado e ajuda com glossário sem juridiquês",
  "Dossiê pronto para contestar BM suspensa",
  "Documentos prontos: cláusula, política, aviso de formulário",
  "Painel com índice de conformidade da carteira",
];

export function Funcionalidades() {
  return (
    <section id="funcionalidades" className="fs-secao relative overflow-hidden bg-rail text-white">
      {/* Âncoras do menu (/#func-cookies…): o carrossel abre o slide certo */}
      {SLIDES.map((s) => (
        <span key={s.id} id={`func-${s.id}`} className="absolute top-0 scroll-mt-24" aria-hidden="true" />
      ))}
      <div className="relative w-full px-5 pb-20 pt-16 sm:px-10 lg:px-14 lg:pb-24 lg:pt-20">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-end">
          <div>
            <p className="font-mono text-[13px] uppercase tracking-[0.06em] text-brand">Funcionalidades</p>
            <h2 className="mt-4 max-w-4xl font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.06] text-white">
              Além da papelada: a Dattis trabalha todo dia pela sua agência
            </h2>
          </div>
          <p className="max-w-xl text-[18px] leading-relaxed text-white/75 lg:justify-self-end">
            Telas reais da plataforma, sem mockup. É aqui que o seu DPO na Dattis trabalha e onde você acompanha cada cliente.
          </p>
        </div>

        <div className="mt-12">
          <CarrosselFuncionalidades slides={SLIDES} />
        </div>

        <div className="mt-20 rounded-[32px] border border-white/10 bg-white/[0.04] px-6 py-10 sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
            <p className="font-mono text-[13px] uppercase tracking-[0.06em] text-brand">E ainda</p>
            <ul className="grid gap-x-10 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
              {EXTRAS.map((e) => (
                <li key={e} className="flex items-start gap-3 text-[15.5px] leading-snug text-white/90">
                  <Check size={18} className="mt-0.5 shrink-0 text-brand" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-10 flex flex-wrap gap-3 lg:pl-[252px]">
            <Link href="/api/auth/demo" prefetch={false} className="btn btn-primary">
              Testar a plataforma sem senha <ArrowRight size={16} />
            </Link>
            <Link href="/planos" className="btn border-white/25 text-white hover:border-white/60">
              Ver planos
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
