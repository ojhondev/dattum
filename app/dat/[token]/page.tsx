import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { db } from "@/lib/db";
import { agencias, contasCliente } from "@/lib/db/schema";
import { montarDat } from "@/lib/dat";
import { origemAtual } from "@/lib/certificados";
import { RelatorioDat } from "@/components/app/RelatorioDat";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Resumo de conformidade LGPD", robots: { index: false, follow: false } };

// Link que a agência manda pro cliente: o DAT sempre com os dados do dia, sem login.
export default async function DatPublicoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const conta = token.length >= 20 ? await db.query.contasCliente.findFirst({ where: eq(contasCliente.tokenPublico, token) }) : null;
  const agencia = conta ? await db.query.agencias.findFirst({ where: eq(agencias.id, conta.agenciaId) }) : null;
  const dat = conta && agencia && agencia.plano !== "start" && !agencia.suspensa ? await montarDat(conta.id) : null;
  const origem = await origemAtual();

  return (
    <div className="min-h-svh bg-canvas">
      <header className="no-print flex items-center justify-between gap-4 border-b border-line px-5 py-5 sm:px-10">
        <Logo height={24} />
        <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.05em] text-muted">
          <ShieldCheck size={14} /> Resumo de conformidade
        </span>
      </header>
      <main className="px-4 pb-16 pt-8 sm:px-8 sm:pt-12">
        {dat ? (
          <RelatorioDat dat={dat} urlVerificacao={dat.certificado ? `${origem}/verificar/${dat.certificado.codigo}` : null} />
        ) : (
          <div className="mx-auto max-w-xl py-16 text-center">
            <h1 className="font-display text-[32px] leading-tight text-ink">Este link não está mais valendo</h1>
            <p className="mt-4 text-[17px] leading-relaxed text-body">Peça um link atualizado à agência que enviou o resumo.</p>
          </div>
        )}
      </main>
    </div>
  );
}
