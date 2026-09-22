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
      <p className="painel-eyebrow">Dattis · Contas de cliente</p>
      <h1 className="painel-title">Contas de cliente</h1>
      <p className="painel-lede">
        Cada linha é um cliente que sua agência atende. Ao ativar uma conta, a Dattis já gera
        automaticamente o que ela precisa: o registro do que vocês fazem com o dado dela e o
        contrato entre vocês.
      </p>

      <div style={{ marginBottom: 24 }}>
        <Link href="/painel/contas/novo" className="painel-btn">
          Ativar conta nova →
        </Link>
      </div>

      <div className="painel-table-wrap">
        {contas.length === 0 ? (
          <div className="painel-empty">Nenhuma conta ativada ainda.</div>
        ) : (
          <table className="painel-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Fluxos ativos</th>
                <th>Contrato (DPA)</th>
              </tr>
            </thead>
            <tbody>
              {contas.map((conta) => {
                const dpa = dpaPorConta.get(conta.id);
                const flows = [
                  conta.flowCapi && "CAPI",
                  conta.flowAds && "Ads",
                  conta.flowWhatsapp && "WhatsApp",
                  conta.flowCrm && "CRM",
                ].filter(Boolean);
                return (
                  <tr key={conta.id}>
                    <td>
                      <Link href={`/painel/contas/${conta.id}`}>{conta.nome}</Link>
                    </td>
                    <td>{flows.length > 0 ? flows.join(", ") : "—"}</td>
                    <td>
                      {dpa?.status === "assinado" ? (
                        <span className="painel-pill ok">Assinado</span>
                      ) : (
                        <span className="painel-pill pendente">Pendente</span>
                      )}
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
