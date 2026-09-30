import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowRight, Check, X, ShieldCheck, ShieldAlert, FileText, FileSignature, Network, Radar, Target, Handshake, Eye, MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { buscarPorCodigo, statusCertificado } from "@/lib/certificados";
import { Logo } from "@/components/brand/Logo";
import { MetaChips } from "@/components/marketing/MetaChips";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ codigo: string }> }): Promise<Metadata> {
  const { codigo } = await params;
  const cert = await buscarPorCodigo(codigo);
  return {
    title: cert ? `${cert.titular} · Certificado de privacidade de dados` : "Verificação de certificado",
    robots: { index: false },
  };
}

const SIGNIFICA = [
  {
    icon: Target,
    t: "Seus dados têm finalidade definida",
    d: "Cada informação coletada — no formulário, no WhatsApp, no anúncio — tem um motivo registrado e uma base legal.",
  },
  {
    icon: Handshake,
    t: "Existe contrato protegendo seus dados",
    d: "Está formalizado por escrito quem é responsável pelos dados e como eles podem ser usados.",
  },
  {
    icon: Eye,
    t: "Ferramentas de terceiros sob controle",
    d: "Todas as plataformas que tocam nos seus dados estão mapeadas e registradas.",
  },
  {
    icon: Radar,
    t: "Monitoramento contínuo",
    d: "A documentação não foi feita uma vez e esquecida: ela é acompanhada pela Dattis e conferida de novo a cada acesso.",
  },
];

export default async function VerificarPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const cert = await buscarPorCodigo(codigo);
  const status = cert ? await statusCertificado(cert) : null;
  const agencia = cert ? await db.query.agencias.findFirst({ where: eq(agencias.id, cert.agenciaId) }) : null;

  const estado = !cert || !status?.valido ? "invalido" : status.emDia ? "ok" : "pendente";
  const daAgencia = !!cert && !cert.contaClienteId;
  const agenciaNome = agencia?.nome ?? "";
  const agora = new Date().toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short", timeZone: "America/Sao_Paulo" });
  const fmt = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="min-h-svh bg-canvas">
      <header className="flex h-[76px] items-center justify-between px-4 sm:px-10">
        <Logo height={26} />
        <span className="t-eyebrow hidden sm:inline">Certificado de privacidade de dados</span>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6">
        {/* STATUS */}
        <div
          className={
            "on-light rounded-[40px] px-7 py-12 sm:px-14 sm:py-16 " +
            (estado === "ok" ? "bg-gradient-to-br from-brand to-brand-tint-2" : estado === "pendente" ? "bg-warn-tint" : "bg-danger-tint")
          }
        >
          <div className="flex flex-wrap items-center gap-1">
            <span className={"tag " + (estado === "ok" ? "" : estado === "pendente" ? "!bg-orange" : "!bg-danger !text-white")}>
              {estado === "ok" ? <ShieldCheck size={16} className="mr-2" /> : <ShieldAlert size={16} className="mr-2" />}
              {estado === "ok" ? "Certificado válido" : estado === "pendente" ? "Documentação com pendências" : "Certificado inválido"}
            </span>
            {cert && <span className="tag tag-white">Verificado agora · {agora}</span>}
          </div>

          {!cert && <h1 className="t-display mt-8 text-rail">Não encontramos o certificado {codigo.toUpperCase()}.</h1>}

          {cert && estado === "ok" && daAgencia && (
            <>
              <p className="mt-10 font-mono text-[15px] uppercase tracking-[0.04em] text-rail/80">Agência verificada</p>
              <h1 className="t-hero mt-3 max-w-[18ch] text-rail">{cert.titular}</h1>
              <p className="mt-6 max-w-3xl font-display text-[clamp(1.4rem,2.6vw,2rem)] leading-snug text-rail">
                está em conformidade com a LGPD e trata os seus dados com zelo, do primeiro clique ao último contato.
              </p>
            </>
          )}

          {cert && estado === "ok" && !daAgencia && (
            <>
              <p className="mt-10 font-mono text-[15px] uppercase tracking-[0.04em] text-rail/80">Empresa verificada</p>
              <h1 className="t-hero mt-3 max-w-[18ch] text-rail">{cert.titular}</h1>
              <p className="mt-6 max-w-3xl font-display text-[clamp(1.4rem,2.6vw,2rem)] leading-snug text-rail">
                protege os seus dados. O marketing desta empresa é operado pela agência{" "}
                <span className="underline decoration-rail/40 decoration-2 underline-offset-4">{agenciaNome}</span>, em conformidade com
                a LGPD.
              </p>
            </>
          )}

          {cert && estado === "pendente" && (
            <>
              <h1 className="t-display mt-8 max-w-3xl text-rail">{cert.titular}</h1>
              <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-body">
                A documentação de privacidade {daAgencia ? "desta agência" : `desta empresa, operada pela agência ${agenciaNome},`} está
                passando por atualização e tem itens pendentes neste momento. Confira abaixo o que já está em dia.
              </p>
            </>
          )}

          {cert && estado === "invalido" && (
            <>
              <h1 className="t-display mt-8 max-w-3xl text-rail">{cert.titular}</h1>
              <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-body">
                Este certificado {cert.revogado ? "foi revogado" : "expirou"} e não vale mais como comprovação.
              </p>
            </>
          )}

          {cert && (
            <div className="mt-10 flex flex-wrap gap-1">
              {cert.dominio && <span className="tag tag-white font-mono">{cert.dominio}</span>}
              <span className="tag tag-white font-mono">{cert.codigo}</span>
              <span className="tag tag-white">Emitido em {fmt(cert.emitidoEm)}</span>
              {!cert.revogado && <span className="tag tag-white">Válido até {fmt(cert.validoAte)}</span>}
            </div>
          )}
        </div>

        {cert && status && estado !== "invalido" && (
          <>
            {estado === "ok" && (
              <section className="mt-6 rounded-[40px] bg-rail px-7 py-12 text-white sm:px-14">
                <p className="font-mono text-[14px] uppercase tracking-[0.04em] text-brand">O que isso significa pra você</p>
                <h2 className="mt-5 max-w-3xl font-display text-[clamp(1.8rem,3.4vw,2.8rem)] leading-[1.12] text-white">
                  Quando você deixa seu nome, seu telefone ou seu e-mail aqui, eles não ficam soltos por aí.
                </h2>
                <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/80">
                  {daAgencia ? cert.titular : agenciaNome} mantém em dia tudo o que a Lei Geral de Proteção de Dados (Lei nº
                  13.709/2018) exige de quem trabalha com dados de pessoas — e prova isso de forma pública e verificável.
                </p>
                <ul className="mt-10 grid gap-4 sm:grid-cols-2">
                  {SIGNIFICA.map(({ icon: Icon, t, d }) => (
                    <li key={t} className="rounded-[20px] bg-white/[0.06] p-6">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-on-brand">
                        <Icon size={18} strokeWidth={1.8} />
                      </span>
                      <p className="mt-4 font-display text-[20px] leading-tight text-white">{t}</p>
                      <p className="mt-2 text-[15px] leading-relaxed text-white/75">{d}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="mt-6 grid gap-6 md:grid-cols-[1fr_240px]">
              <div className="block-card px-7 py-10 sm:px-10">
                <p className="t-label">Documentação conferida</p>
                <ul className="mt-6 flex flex-col gap-3">
                  {status.requisitos.map((r) => (
                    <li key={r.label} className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3.5">
                      <span
                        className={
                          "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full " +
                          (r.ok ? "bg-brand-strong text-on-brand" : "bg-orange text-ink")
                        }
                      >
                        {r.ok ? <Check size={14} strokeWidth={2.5} /> : <X size={14} strokeWidth={2.5} />}
                      </span>
                      <span>
                        <span className="block text-[15px] font-medium text-ink">{r.label}</span>
                        <span className="block text-[14px] text-muted">{r.detalhe}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                {estado === "ok" && (
                  <MetaChips
                    wrap
                    className="mt-8"
                    items={[
                      { icon: FileText, label: "Atividades registradas", status: "sim" },
                      { icon: FileSignature, label: "Contrato de proteção assinado", status: "sim" },
                      { icon: Network, label: "Ferramentas mapeadas", status: "sim" },
                      { icon: Radar, label: "Monitorado pela Dattis", status: "sim" },
                    ]}
                  />
                )}
              </div>
              <div className="card flex flex-col items-center justify-center text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/qr/${cert.codigo}`} alt={`QR Code de verificação ${cert.codigo}`} width={180} height={180} className="rounded-xl" />
                <p className="mt-4 text-[13px] leading-snug text-muted">Aponte a câmera pra abrir esta verificação a qualquer momento.</p>
              </div>
            </div>

            {estado === "ok" && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-line bg-surface px-6 py-5">
                <p className="flex items-center gap-3 text-[15px]">
                  <MessageCircle size={18} className="shrink-0 text-brand-ink" />
                  Dúvidas sobre como seus dados são usados? Fale direto com {daAgencia ? cert.titular : `${cert.titular} ou com a agência ${agenciaNome}`}.
                </p>
              </div>
            )}
          </>
        )}

        <div className="mt-14 flex flex-wrap items-end justify-between gap-6 border-t border-line pt-8">
          <div className="max-w-xl">
            <p className="font-display text-[22px]">Sua agência também pode provar que leva dados a sério.</p>
            <Link href="/planos" className="arrow-link mt-4 text-[13px]">
              Conhecer a Dattis
              <span className="arrow-circle h-9 w-9">
                <ArrowRight size={16} strokeWidth={1.6} />
              </span>
            </Link>
          </div>
          <p className="max-w-sm text-[12px] leading-relaxed text-faint">
            Certificado de privacidade de dados emitido pela Dattis com base na documentação registrada na plataforma,
            conferida no momento do acesso. Não substitui fiscalização da ANPD nem parecer jurídico e não é um certificado
            digital ICP-Brasil.
          </p>
        </div>
      </main>
    </div>
  );
}
