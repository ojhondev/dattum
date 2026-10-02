import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
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

/** Moldura de navegador em volta de um print do app. */
function Tela({ src, alt, endereco, prioridade = false }: { src: StaticImageData; alt: string; endereco: string; prioridade?: boolean }) {
  return (
    <figure className="overflow-hidden rounded-[18px] border border-line bg-surface shadow-[0_30px_60px_-30px_rgba(0,40,32,0.35)]">
      <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-[#e0e5e2]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#e0e5e2]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#e0e5e2]" />
        <span className="ml-3 truncate rounded-md bg-surface px-3 py-0.5 font-mono text-[11px] text-muted">{endereco}</span>
      </div>
      <Image src={src} alt={alt} sizes="(min-width: 1024px) 55vw, 100vw" className="h-auto w-full" priority={prioridade} placeholder="blur" />
    </figure>
  );
}

function Celular({ src, alt }: { src: StaticImageData; alt: string }) {
  return (
    <figure className="mx-auto w-[min(300px,80%)] rounded-[44px] border-[10px] border-rail bg-rail shadow-[0_30px_60px_-25px_rgba(0,40,32,0.45)]">
      <Image src={src} alt={alt} sizes="300px" className="h-auto w-full rounded-[34px]" placeholder="blur" />
    </figure>
  );
}

type Recurso = {
  id: string;
  rotulo: string;
  titulo: string;
  texto: string;
  pontos: string[];
  visual: React.ReactNode;
};

const RECURSOS: Recurso[] = [
  {
    id: "cookies",
    rotulo: "Aviso de cookies",
    titulo: "Banner de cookies que segura o pixel até o visitante aceitar",
    texto:
      "Uma linha de código no site do cliente e pronto: o aviso pede o consentimento, só deixa o Pixel do Meta e as tags do Google rodarem depois do “Aceitar” e guarda a prova de cada escolha.",
    pontos: ["Aceitar, recusar ou personalizar, como a LGPD pede", "Prova de consentimento com data, página e versão", "Números de aceite por site, direto no painel"],
    visual: (
      <div className="flex flex-col gap-4">
        <Tela src={bannerCookies} alt="Aviso de cookies da Dattis no rodapé de um site, com Aceitar todos, Recusar e Personalizar" endereco="site-do-cliente.com.br" />
        <Tela src={cookiesNumeros} alt="Módulo Cookies no painel da Dattis com as escolhas dos visitantes nos últimos 30 dias" endereco="dattis · Cookies" />
      </div>
    ),
  },
  {
    id: "gtm",
    rotulo: "Google Tag Manager",
    titulo: "Integração com o Gerenciador de Tags e o Modo de consentimento do Google",
    texto:
      "O aviso já liga o Modo de consentimento v2 que o Google exige. Para quem usa o Gerenciador de Tags, WordPress, Shopify ou outro construtor, a Dattis mostra o passo a passo e confere a instalação sozinha.",
    pontos: ["Tags do Google respeitam a escolha automaticamente", "Passo a passo por plataforma, em português", "“Verificar instalação” aponta o que falta ajustar"],
    visual: <Tela src={cookiesGtm} alt="Passo a passo de instalação do aviso de cookies com o Google Tag Manager" endereco="dattis · Cookies · instalação" />,
  },
  {
    id: "selo",
    rotulo: "Selo verificável",
    titulo: "Selo no rodapé da agência e de cada cliente, verificável por qualquer pessoa",
    texto:
      "Quando a documentação fica completa, o certificado sai sozinho. O selo mostra a situação do dia e, ao clicar, abre a página de verificação com o nome da agência. Versão clara, escura e PNG para materiais.",
    pontos: ["Emitido e renovado automaticamente", "Fica inválido sozinho se algo deixar de estar em dia", "QR Code para propostas e apresentações"],
    visual: (
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 rounded-[18px] bg-surface-2 p-5">
          <Image src={seloClaro} alt="Selo Dattis versão clara: este site passa por verificações diárias de privacidade e segurança de dados, conforme a LGPD" sizes="(min-width: 1024px) 40vw, 90vw" className="h-auto w-full max-w-[520px]" />
          <Image src={seloEscuro} alt="Selo Dattis versão escura" sizes="(min-width: 1024px) 40vw, 90vw" className="h-auto w-full max-w-[520px]" />
        </div>
        <Tela src={certificados} alt="Certificado emitido no painel, com código do selo e QR Code" endereco="dattis · Certificados e selo" />
      </div>
    ),
  },
  {
    id: "vigilancia",
    rotulo: "Monitoramento diário",
    titulo: "Vigilância automática todo dia às 6h, nos sites e na documentação",
    texto:
      "A Dattis visita o site de cada cliente e confere cadeado de segurança, pixel disparando sem consentimento, formulário sem política e contrato vencido. O problema aparece no painel antes de virar denúncia ou BM suspensa.",
    pontos: ["Nota de 0 a 100 por cliente", "Alertas por gravidade, com o que corrigir", "Certificado e selo acompanham o resultado"],
    visual: <Tela src={vigilancia} alt="Tela de Vigilância da Dattis com a nota de cada cliente e os alertas" endereco="dattis · Vigilância" />,
  },
  {
    id: "assinatura",
    rotulo: "Contrato assinado",
    titulo: "O cliente assina o contrato de dados pelo celular, sem criar conta",
    texto:
      "A agência assina no painel e manda um link pelo WhatsApp. O cliente lê, assina e baixa o PDF. Ficam registrados nome, e-mail, data, IP, navegador e o resumo criptográfico do texto.",
    pontos: ["Assinatura das duas partes, como a LGPD pede", "Nova versão automática quando a operação muda", "Histórico de versões e PDF com evidências"],
    visual: <Celular src={assinaturaCelular} alt="Página de assinatura do contrato de dados no celular do cliente" />,
  },
  {
    id: "titular",
    rotulo: "Política e canal do titular",
    titulo: "Política de privacidade pronta e um canal para os pedidos das pessoas",
    texto:
      "A Dattis publica a política de privacidade de cada cliente, sempre atualizada, para colar no site e no formulário de anúncio do Meta e do Google. Quem quiser ver ou apagar os próprios dados pede por ali, com protocolo e prazo de 15 dias.",
    pontos: ["Escrita a partir do que a agência faz de verdade", "Link pronto para o Formulário instantâneo do Meta", "Pedidos com protocolo e aviso de prazo no painel"],
    visual: (
      <div className="flex flex-col gap-4">
        <Tela src={politica} alt="Política de privacidade pública de um cliente, hospedada pela Dattis" endereco="dattis · política de privacidade da Loja Aurora" />
        <Tela src={titulares} alt="Tela de pedidos de titulares no painel, com protocolo e prazo" endereco="dattis · Pedidos de titulares" />
      </div>
    ),
  },
  {
    id: "dat",
    rotulo: "Resumo para o cliente",
    titulo: "Um resumo de conformidade para mandar ao cliente todo mês",
    texto:
      "O DAT mostra registro, contrato, ferramentas, site e certificado numa folha só, com link sempre atualizado ou PDF. É a entrega recorrente que prova o valor da agência e ajuda a renovar o contrato.",
    pontos: ["Link público sempre com os dados do dia", "PDF para anexar no relatório mensal", "Próximos passos em linguagem simples"],
    visual: <Tela src={dat} alt="Resumo de conformidade (DAT) de um cliente" endereco="dattis · Resumo para o cliente" />,
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
    <section id="funcionalidades" className="bg-canvas">
      <div className="w-full px-5 py-20 sm:px-10 lg:px-14 lg:py-28">
        <p className="t-eyebrow">Funcionalidades</p>
        <h2 className="t-display mt-4 max-w-4xl">Além da papelada: a Dattis trabalha todo dia pela sua agência</h2>
        <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-body">
          Telas reais da plataforma. Nada de mockup: é isso que sua agência e seus clientes usam no dia a dia.
        </p>
        <nav aria-label="Funcionalidades" className="mt-8 flex flex-wrap gap-1.5">
          {RECURSOS.map((r) => (
            <a key={r.id} href={`#func-${r.id}`} className="tag tag-white border border-line hover:border-line-strong">
              {r.rotulo}
            </a>
          ))}
        </nav>

        <div className="mt-16 flex flex-col gap-24 lg:gap-32">
          {RECURSOS.map((r, i) => (
            <article id={`func-${r.id}`} key={r.id} className="grid scroll-mt-28 items-center gap-10 lg:grid-cols-12 lg:gap-14">
              <div className={"lg:col-span-5 " + (i % 2 ? "lg:order-2" : "")}>
                <p className="font-mono text-[12px] uppercase tracking-[0.06em] text-brand-ink">{r.rotulo}</p>
                <h3 className="mt-3 font-display text-[clamp(1.7rem,3vw,2.5rem)] leading-[1.12] text-ink">{r.titulo}</h3>
                <p className="mt-5 text-[17px] leading-relaxed text-body">{r.texto}</p>
                <ul className="mt-6 flex flex-col gap-2.5">
                  {r.pontos.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-[15.5px] text-ink">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-strong text-rail">
                        <Check size={13} strokeWidth={2.5} />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={"min-w-0 lg:col-span-7 " + (i % 2 ? "lg:order-1" : "")}>{r.visual}</div>
            </article>
          ))}
        </div>

        <div className="mt-28 rounded-[32px] bg-rail px-6 py-12 text-white sm:px-12">
          <p className="font-mono text-[12px] uppercase tracking-[0.06em] text-brand">E ainda</p>
          <ul className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {EXTRAS.map((e) => (
              <li key={e} className="flex items-start gap-3 text-[16px] leading-snug text-white/90">
                <Check size={18} className="mt-0.5 shrink-0 text-brand" />
                {e}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
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
