import type { Metadata } from "next";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { CheckCircle2, Circle, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { db } from "@/lib/db";
import { agencias, contasCliente, dpas } from "@/lib/db/schema";
import { filtroVigente } from "@/lib/dpa";
import { FormAssinaturaCliente } from "./FormAssinaturaCliente";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Assinatura de contrato", robots: { index: false, follow: false } };

const dataHora = (d: Date) => d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

function Parte({ titulo, nome, em }: { titulo: string; nome: string | null; em: Date | null }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5">
      {em ? <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-brand-ink" /> : <Circle size={20} className="mt-0.5 shrink-0 text-faint" />}
      <div className="min-w-0 text-[14px] leading-snug">
        <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-muted">{titulo}</p>
        <p className="mt-1 text-ink">{em ? `${nome} assinou em ${dataHora(em)}` : "Aguardando assinatura"}</p>
      </div>
    </div>
  );
}

export default async function AssinarPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const dpa = token.length >= 20 ? await db.query.dpas.findFirst({ where: and(eq(dpas.tokenAssinatura, token), filtroVigente) }) : null;
  const [conta, agencia] = dpa
    ? await Promise.all([
        db.query.contasCliente.findFirst({ where: eq(contasCliente.id, dpa.contaClienteId) }),
        db.query.agencias.findFirst({ where: eq(agencias.id, dpa.agenciaId) }),
      ])
    : [null, null];

  return (
    <div className="min-h-svh bg-canvas">
      <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-5 sm:px-10">
        <Logo height={24} />
        <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.05em] text-muted">
          <ShieldCheck size={14} /> Assinatura eletrônica
        </span>
      </header>

      {!dpa || !conta || !agencia ? (
        <main className="mx-auto max-w-xl px-5 py-24 text-center">
          <h1 className="font-display text-[32px] leading-tight text-ink">Este link não está mais valendo</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-body">
            O contrato pode ter sido atualizado ou o link foi cancelado pela agência. Peça um novo link a quem enviou.
          </p>
        </main>
      ) : (
        <main className="mx-auto w-full max-w-3xl px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
          <p className="t-eyebrow">Contrato de dados pessoais · versão {dpa.versao}</p>
          <h1 className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] leading-[1.1] text-ink">
            {agencia.nome} enviou o contrato de dados de {conta.nome} para assinatura
          </h1>

          <div className="mt-7 rounded-[24px] bg-brand-tint px-6 py-5 text-[16px] leading-relaxed text-ink">
            <p className="font-semibold">Por que assinar</p>
            <p className="mt-2 text-body">
              A {agencia.nome} cuida de anúncios, atendimento ou automações da sua empresa e, para isso, usa dados de clientes e leads de
              vocês. A LGPD (art. 39) pede que essa relação seja formalizada: o contrato diz o que a agência pode fazer com os dados, quais
              ferramentas usa e como protege as informações. Ele protege também a sua empresa.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Parte titulo={`Agência · ${agencia.nome}`} nome={dpa.assinanteNome} em={dpa.assinadoEm} />
            <Parte titulo={`Cliente · ${conta.nome}`} nome={dpa.clienteNome} em={dpa.clienteAssinadoEm} />
          </div>

          <section aria-label="Texto do contrato" className="mt-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-[22px] text-ink">Contrato</h2>
              <a href={`/api/assinar/${token}/pdf`} target="_blank" rel="noopener" className="nav-link text-[14px]">
                Baixar PDF
              </a>
            </div>
            <pre className="mt-3 max-h-[55vh] overflow-y-auto whitespace-pre-wrap rounded-[20px] border border-line bg-surface px-5 py-5 font-serif text-[14.5px] leading-relaxed text-body sm:px-7">
              {dpa.conteudoSnapshot}
            </pre>
          </section>

          <section className="mt-8">
            <FormAssinaturaCliente
              token={token}
              contaNome={conta.nome}
              jaAssinou={dpa.clienteAssinadoEm ? { nome: dpa.clienteNome ?? "", em: dataHora(dpa.clienteAssinadoEm) } : null}
              nomeSugerido={conta.contatoNome ?? ""}
              emailSugerido={conta.contatoEmail ?? ""}
            />
          </section>

          <p className="mt-10 text-[13px] leading-relaxed text-muted">
            Para comprovar a assinatura, registramos nome, cargo, e-mail, data e hora, IP e navegador, além de um resumo criptográfico do
            texto (Lei nº 14.063/2020). A plataforma Dattis trata esses dados em nome da {agencia.nome}. Saiba mais na{" "}
            <Link href="/privacidade" className="nav-link">
              Política de Privacidade
            </Link>
            .
          </p>
        </main>
      )}
    </div>
  );
}
