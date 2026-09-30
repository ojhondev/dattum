import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowRight } from "lucide-react";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { contasCliente, dpas } from "@/lib/db/schema";

const TH = "border-b border-line px-5 py-3.5 text-left font-mono text-[12px] font-normal uppercase tracking-[0.04em] text-muted";
const TD = "border-b border-line px-5 py-4";

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
    <div className="max-w-6xl">
      <p className="t-eyebrow">Dattis · Contas de cliente</p>
      <h1 className="t-display mt-3">Contas de cliente</h1>
      <p className="mt-4 max-w-2xl text-body leading-relaxed text-body">
        Cada linha é um cliente que sua agência atende. Ao ativar uma conta, a Dattis já gera automaticamente o que
        ela precisa: o registro do que vocês fazem com o dado dela e o contrato entre vocês.
      </p>

      <div className="mt-8">
        <Link href="/painel/contas/novo" className="btn btn-primary btn-lg">
          Ativar conta nova <ArrowRight size={16} />
        </Link>
      </div>

      <div className="card-flush mt-10 overflow-x-auto">
        {contas.length === 0 ? (
          <div className="p-12 text-center text-body-sm text-muted">Nenhuma conta ativada ainda.</div>
        ) : (
          <table className="w-full min-w-[560px] border-collapse text-body-sm">
            <thead>
              <tr className="bg-surface-2">
                <th className={TH}>Cliente</th>
                <th className={TH}>Fluxos ativos</th>
                <th className={TH}>Contrato (DPA)</th>
              </tr>
            </thead>
            <tbody>
              {contas.map((conta) => {
                const dpa = dpaPorConta.get(conta.id);
                const flows = [conta.flowCapi && "CAPI", conta.flowAds && "Ads", conta.flowWhatsapp && "WhatsApp", conta.flowCrm && "CRM"].filter(
                  (f): f is string => Boolean(f),
                );
                return (
                  <tr key={conta.id} className="transition-colors last:[&>td]:border-b-0 hover:bg-surface-2">
                    <td className={TD}>
                      <Link href={`/painel/contas/${conta.id}`} className="font-display text-[18px] text-ink hover:underline">
                        {conta.nome}
                      </Link>
                    </td>
                    <td className={TD}>
                      {flows.length > 0 ? (
                        <span className="flex flex-wrap gap-1.5">
                          {flows.map((f) => (
                            <span key={f} className="pill pill-neutral">
                              {f}
                            </span>
                          ))}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className={TD}>
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
