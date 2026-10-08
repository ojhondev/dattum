import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  FileSignature,
  FolderOpen,
  Network,
  Radar,
  ShieldAlert,
  UserRoundCheck,
  ClipboardList,
  Siren,
} from "lucide-react";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { VideoDattis } from "@/components/marketing/VideoDattis";
import logoDark from "../../public/brand/logo-fundo-dark.png";
import iso27001 from "../../public/selos/iso-27001.webp";
import iso27701 from "../../public/selos/iso-27701.webp";
import { FormLead } from "./FormLead";
import { Testimonials } from "@/components/marketing/Testimonials";
import { DEPOIMENTOS } from "@/lib/depoimentos";

// Landing de anúncios (fundo preto, copy agressiva) para agências de tráfego. Estrutura: hero com formulário,
// "a LGPD já está sendo cobrada", solução, vídeo, como funciona, situações reais, depoimentos e CTA final.

export const metadata: Metadata = {
  title: "DPO para agências de tráfego · Evite multas pela LGPD",
  description:
    "Sua agência trata os dados dos clientes e responde junto quando dá problema. A Dattis vira o DPO da agência: contratos, registros, dossiê para BM suspensa e vigilância diária.",
};

const COBRADA = [
  { n: "1ª multa", t: "da ANPD foi para uma microempresa. Ser pequeno nunca foi escudo." },
  { n: "2%", t: "do faturamento por infração, até R$ 50 milhões cada (art. 52 da LGPD)." },
  { n: "Art. 42", t: "O operador responde junto quando trata dados fora da lei. Operador, no caso, é a sua agência." },
  { n: "Exposição", t: "A ANPD pode tornar a infração pública. Seu cliente descobre antes de você ligar pra ele." },
];

const SOLUCAO = [
  { icon: UserRoundCheck, t: "Um DPO sem contratar ninguém", d: "A Dattis opera a LGPD de cada cliente como DPO da sua agência. No Scale, vira a encarregada oficial perante a ANPD." },
  { icon: FileSignature, t: "Contrato e registro de cada cliente", d: "Registro do que a agência faz com os dados (RAT) e contrato de dados (DPA) prontos em minutos, assinados pelo celular." },
  { icon: Network, t: "Ferramentas mapeadas", d: "Meta, Google, WhatsApp, CRM, Zapier: a lista de quem recebe os dados de cada cliente, sempre atualizada." },
  { icon: FolderOpen, t: "Dossiê para BM suspensa", d: "Restringiram a Business Manager? Os documentos para contestar saem num clique, com texto-base pronto." },
  { icon: Radar, t: "Vigilância diária dos sites", d: "Todo dia às 6h: pixel antes do consentimento, formulário sem aviso, política faltando. Você sabe antes do problema." },
  { icon: BadgeCheck, t: "Selo que vira argumento de venda", d: "Certificado público com QR Code no seu site e no do cliente. Uma prova que a agência concorrente não tem." },
];

const PASSOS = [
  { t: "Fale com a gente", d: "Conversa rápida no WhatsApp. Plano por cliente e sem fidelidade." },
  { t: "Cadastre os clientes", d: "Uns 4 minutos por cliente: a Dattis monta registro, contrato e lista de ferramentas sozinha." },
  { t: "Agência blindada", d: "DPO atuando, contratos assinados, sites vigiados e o selo no ar provando tudo isso." },
];

const SITUACOES = [
  {
    icon: Siren,
    t: "BM restrita na sexta à noite",
    d: "Campanha parada, cliente ligando. Com a Dattis, o dossiê com contrato, registro e certificado já existe: é baixar e contestar.",
  },
  {
    icon: ClipboardList,
    t: "Cliente grande mandou o questionário de LGPD",
    d: "Antes de fechar ou renovar, o jurídico dele quer provas. Você responde com documentos assinados, não com promessa.",
  },
  {
    icon: ShieldAlert,
    t: "Um lead reclamou dos próprios dados",
    d: "Pedido de titular tem prazo. O canal e a resposta pronta estão na plataforma, e no Growth e no Scale o DPO responde por você.",
  },
];

const CTA_TOPO = "#lead";

export default function DpoParaAgenciasPage() {
  return (
    <div className="bg-[#050807] text-white">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#050807]/85 backdrop-blur">
        <div className="flex h-[72px] items-center justify-between px-4 sm:px-10">
          <Link href="/" aria-label="Dattis">
            <Image src={logoDark} alt="Dattis" height={28} width={Math.round((logoDark.width / logoDark.height) * 28)} priority />
          </Link>
          <a href={CTA_TOPO} className="btn btn-primary max-sm:!px-3.5 max-sm:!text-[12px]">
            Falar com especialista
          </a>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden px-4 pb-20 pt-14 sm:px-10 lg:pt-20">
          <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand/15 blur-[120px]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-brand">LGPD para agências de tráfego pago</p>
              <h1 className="text-white mt-5 font-display text-[clamp(2.2rem,4vw,3.6rem)] leading-[1.06]">
                Você roda campanha com os dados do cliente.
                <span className="block text-brand">Quando der problema, a conta também é sua.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-white/75">
                Pela LGPD, a agência é operadora dos dados de cada cliente e responde junto com ele. A Dattis vira o DPO da sua agência:
                documenta cada cliente, assina os contratos e prova que você está em dia. Sem contratar ninguém e sem parar a operação.
              </p>
              <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-white/10 pt-8">
                {[
                  ["2%", "do faturamento por infração"],
                  ["R$ 50 mi", "de teto por infração"],
                  ["1 BM", "suspensa pode parar todos os clientes"],
                ].map(([n, t]) => (
                  <div key={n}>
                    <dt className="font-display text-[clamp(1.6rem,3vw,2.3rem)] leading-none text-white">{n}</dt>
                    <dd className="mt-2 text-[13.5px] leading-snug text-white/60">{t}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <FormLead id="lead" />
          </div>
        </section>

        {/* A LGPD JÁ ESTÁ SENDO COBRADA */}
        <section className="border-y border-white/[0.06] bg-white/[0.02] px-4 py-20 sm:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-brand">A LGPD já está sendo cobrada</p>
            <h2 className="text-white mt-4 max-w-3xl font-display text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.1]">
              Não é mais &ldquo;um dia vão fiscalizar&rdquo;. Já estão fiscalizando.
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {COBRADA.map((c) => (
                <div key={c.n} className="rounded-[24px] border border-white/10 bg-[#0b100e] p-6">
                  <p className="font-display text-[clamp(1.9rem,3vw,2.5rem)] leading-none text-brand">{c.n}</p>
                  <p className="mt-4 text-[15px] leading-relaxed text-white/75">{c.t}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 grid items-center gap-6 rounded-[28px] border border-white/10 p-7 lg:grid-cols-[1fr_auto] lg:p-9">
              <p className="text-[17px] leading-relaxed text-white/80">
                E não é só a ANPD. Cliente grande já manda questionário de LGPD antes de fechar ou renovar contrato, e o Meta derruba
                Business Manager ao menor sinal de problema com dados. Agência sem documentação perde o contrato, ou perde a conta de anúncio
                no meio da campanha.
              </p>
              <a href={CTA_TOPO} className="btn btn-primary btn-lg">
                Quero minha agência em dia <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </section>

        {/* SOLUÇÃO */}
        <section className="px-4 py-24 sm:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-brand">Solução Dattis</p>
            <h2 className="text-white mt-4 max-w-3xl font-display text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.1]">
              Tudo o que a LGPD exige da sua agência, sem você virar advogado
            </h2>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-white/70">
              Nada de consultoria cara que entrega um PDF e some. Você assina, a Dattis opera, e tudo fica registrado num painel.
            </p>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SOLUCAO.map(({ icon: Icon, t, d }) => (
                <div key={t} className="group rounded-[24px] border border-white/10 bg-white/[0.03] p-7 transition-colors hover:border-brand/50">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-brand text-[#002820]">
                    <Icon size={20} strokeWidth={1.9} />
                  </span>
                  <p className="mt-5 font-display text-[22px] leading-tight">{t}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/70">{d}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
              <VideoDattis className="btn btn-lg border-white/25 text-white hover:border-white/60" />
              <a href={CTA_TOPO} className="btn btn-primary btn-lg">
                Quero a Dattis como DPO <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section className="border-t border-white/[0.06] px-4 py-24 sm:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-brand">Como funciona</p>
            <h2 className="text-white mt-4 max-w-3xl font-display text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.1]">
              Da primeira conversa à agência protegida, sem parar a operação
            </h2>
            <ol className="mt-12 grid gap-4 md:grid-cols-3">
              {PASSOS.map((p, i) => (
                <li key={p.t} className="rounded-[24px] border border-white/10 p-7">
                  <span className="font-mono text-[15px] text-brand">0{i + 1}</span>
                  <p className="mt-6 font-display text-[24px] leading-tight">{p.t}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/70">{p.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* SITUAÇÕES */}
        <section className="bg-white/[0.02] px-4 py-24 sm:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-brand">Acontece toda semana</p>
            <h2 className="text-white mt-4 max-w-3xl font-display text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.1]">
              A pergunta não é se vai acontecer com a sua agência. É se ela vai estar pronta.
            </h2>
            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              {SITUACOES.map(({ icon: Icon, t, d }) => (
                <div key={t} className="flex flex-col rounded-[24px] border border-white/10 bg-[#0b100e] p-7">
                  <Icon size={24} className="text-brand" />
                  <p className="mt-5 font-display text-[22px] leading-tight">{t}</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/70">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DEPOIMENTOS */}
        <div className="border-t border-white/[0.06]">
          <Testimonials escuro kicker="Histórias de agências" title="Agências que já colocaram a LGPD em ordem com a Dattis" items={DEPOIMENTOS} />
        </div>

        {/* CTA FINAL */}
        <section className="px-4 py-24 sm:px-10">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[40px] border border-brand/30 bg-gradient-to-br from-[#0b2a20] to-[#050807] px-7 py-16 text-center sm:px-14">
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-1/2 h-[360px] w-[620px] -translate-x-1/2 rounded-full bg-brand/20 blur-[110px]" />
            <div className="relative">
              <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-brand">Sem fidelidade · Cancele quando quiser</p>
              <h2 className="text-white mx-auto mt-5 max-w-3xl font-display text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.06]">
                Feche o próximo cliente com a LGPD já resolvida.
              </h2>
              <a href={CTA_TOPO} className="btn btn-primary btn-lg mt-9">
                Quero blindar minha agência <ArrowRight size={17} />
              </a>
              <ul className="mx-auto mt-9 flex max-w-3xl flex-wrap justify-center gap-x-7 gap-y-3 text-[14.5px] text-white/75">
                {["Plano por cliente, a partir de R$ 47/cliente/mês", "Seus dados protegidos (ISO 27001 e 27701)", "Suporte em português, no WhatsApp"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check size={16} className="text-brand" /> {t}
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex items-center justify-center gap-8">
                <Image src={iso27001} alt="Certificação ISO/IEC 27001" className="h-14 w-auto" />
                <Image src={iso27701} alt="Certificação ISO/IEC 27701" className="h-12 w-auto" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
