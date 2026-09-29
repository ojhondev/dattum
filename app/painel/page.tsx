import Link from "next/link";
import { eq } from "drizzle-orm";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { contasCliente, dpas } from "@/lib/db/schema";

export default async function PainelDashboard() {
  const sessao = await getSessao();
  if (!sessao) return null;

  const [contas, dpasPendentes] = await Promise.all([
    db.query.contasCliente.findMany({ where: eq(contasCliente.agenciaId, sessao.agenciaId) }),
    db.query.dpas.findMany({ where: eq(dpas.agenciaId, sessao.agenciaId) }),
  ]);

  const pendentes = dpasPendentes.filter((d) => d.status !== "assinado").length;

  return (
    <div>
      <p className="t-eyebrow mb-2">Dattis · Painel</p>
      <h1 className="t-heading-lg">Sua operação de compliance, em um lugar só</h1>
      <p className="mt-3 max-w-2xl text-body text-muted">
        Cada conta de cliente que você ativa aqui já sai com o que a LGPD exige: o que vocês fazem com o dado dela, o
        contrato com o cliente e a lista de ferramentas que tocam esse dado.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="font-ui text-caption text-muted">Contas ativas</p>
          <p className="font-display mt-2 text-[2.2rem] font-bold tabular-nums text-ink">{contas.length}</p>
        </div>
        <div className="card">
          <p className="font-ui text-caption text-muted">Contratos pendentes</p>
          <p className={"font-display mt-2 text-[2.2rem] font-bold tabular-nums " + (pendentes > 0 ? "text-warn" : "text-ink")}>{pendentes}</p>
        </div>
        <div className="card">
          <p className="font-ui text-caption text-muted">Contratos assinados</p>
          <p className="font-display mt-2 text-[2.2rem] font-bold tabular-nums text-ink">{dpasPendentes.length - pendentes}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/painel/contas/novo" className="btn btn-primary">
          Ativar conta nova →
        </Link>
        <Link href="/diagnostico" className="btn btn-ghost">
          Refazer Diagnóstico Expresso
        </Link>
        <Link href="/auditoria" className="btn btn-ghost">
          Auditar um site
        </Link>
      </div>

      {contas.length === 0 && (
        <div className="card-flush mt-8 p-12 text-center text-body-sm text-muted">
          Nenhuma conta ativada ainda. Comece ativando a primeira conta de cliente — a Dattis já gera o RAT e o
          contrato automaticamente.
        </div>
      )}
    </div>
  );
}
