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
      <p className="painel-eyebrow">Dattis · Painel</p>
      <h1 className="painel-title">Sua operação de compliance, em um lugar só</h1>
      <p className="painel-lede">
        Cada conta de cliente que você ativa aqui já sai com o que a LGPD exige: o que vocês
        fazem com o dado dela, o contrato com o cliente e a lista de ferramentas que tocam esse dado.
      </p>

      <div className="painel-cards">
        <div className="painel-card">
          <p className="painel-card-label">Contas ativas</p>
          <p className="painel-card-value">{contas.length}</p>
        </div>
        <div className="painel-card">
          <p className="painel-card-label">Contratos pendentes de assinatura</p>
          <p className={`painel-card-value ${pendentes > 0 ? "alert" : ""}`}>{pendentes}</p>
        </div>
        <div className="painel-card">
          <p className="painel-card-label">Contratos assinados</p>
          <p className="painel-card-value">{dpasPendentes.length - pendentes}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
        <Link href="/painel/contas/novo" className="painel-btn">
          Ativar conta nova →
        </Link>
        <Link href="/diagnostico" className="painel-btn ghost">
          Refazer Diagnóstico Expresso
        </Link>
        <Link href="/auditoria" className="painel-btn ghost">
          Auditar um site
        </Link>
      </div>

      {contas.length === 0 && (
        <div className="painel-table-wrap">
          <div className="painel-empty">
            Nenhuma conta ativada ainda. Comece ativando a primeira conta de cliente — a Dattis
            já gera o RAT e o contrato automaticamente.
          </div>
        </div>
      )}
    </div>
  );
}
