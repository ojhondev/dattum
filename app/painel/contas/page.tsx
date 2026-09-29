import Link from "next/link";
import { eq } from "drizzle-orm";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { contasCliente, dpas } from "@/lib/db/schema";

export default async function ContasPage() {
  const sessao = await getSessao();
  if (!sessao) return null;

  const contas = await db.query.contasCliente.findMany({
    where: eq(contasCliente.agenciaId, sessao.agenciaId),
    orderBy: (t, { desc }) => desc(t.createdAt),
  });

  const todosDpas = await db.query.dpas.findMany({ where: eq(dpas.agenciaId, sessao.agenciaId) });
  const dpaPorConta = new Map(todosDpas.map((d) => [d.contaClienteId, d]));

  return (
    <div>
      <p className="t-eyebrow mb-2">Dattis · Contas de cliente</p>
      <h1 className="t-heading-lg">Contas de cliente</h1>
      <p className="mt-3 max-w-2xl text-body text-muted">
        Cada linha é um cliente que sua agência atende. Ao ativar uma conta, a Dattis já gera automaticamente o que
        ela precisa: o registro do que vocês fazem com o dado dela e o contrato entre vocês.
      </p>

      <div className="mt-6">
        <Link href="/painel/contas/novo" className="btn btn-primary">
          Ativar conta nova →
        </Link>
      </div>

      <div className="card-flush mt-8 overflow-x-auto">
        {contas.length === 0 ? (
          <div className="p-12 text-center text-body-sm text-muted">Nenhuma conta ativada ainda.</div>
        ) : (
          <table className="w-full border-collapse text-body-sm">
            <thead>
              <tr className="bg-surface-2">
                <th className="border-b border-line px-4 py-3 text-left font-ui text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">Cliente</th>
                <th className="border-b border-line px-4 py-3 text-left font-ui text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">Fluxos ativos</th>
                <th className="border-b border-line px-4 py-3 text-left font-ui text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">Contrato (DPA)</th>
              </tr>
            </thead>
            <tbody>
              {contas.map((conta) => {
                const dpa = dpaPorConta.get(conta.id);
                const flows = [conta.flowCapi && "CAPI", conta.flowAds && "Ads", conta.flowWhatsapp && "WhatsApp", conta.flowCrm && "CRM"].filter(Boolean);
                return (
                  <tr key={conta.id} className="hover:bg-surface-2">
                    <td className="border-b border-line px-4 py-3">
                      <Link href={`/painel/contas/${conta.id}`} className="nav-link font-medium text-ink">
                        {conta.nome}
                      </Link>
                    </td>
                    <td className="border-b border-line px-4 py-3 text-muted">{flows.length > 0 ? flows.join(", ") : "—"}</td>
                    <td className="border-b border-line px-4 py-3">
                      {dpa?.status === "assinado" ? <span className="pill pill-ok">Assinado</span> : <span className="pill pill-warn">Pendente</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
