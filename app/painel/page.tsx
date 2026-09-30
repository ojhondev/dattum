import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowRight, FileSignature } from "lucide-react";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { contasCliente, dpas } from "@/lib/db/schema";

export default async function PainelDashboard() {
  const sessao = await getSessao();
  if (!sessao) return null;

  const [contas, todosDpas] = await Promise.all([
    db.query.contasCliente.findMany({
      where: eq(contasCliente.agenciaId, sessao.agenciaId),
      orderBy: (t, { desc }) => desc(t.createdAt),
    }),
    db.query.dpas.findMany({ where: eq(dpas.agenciaId, sessao.agenciaId) }),
  ]);

  const pendentes = todosDpas.filter((d) => d.status !== "assinado").length;
  const assinados = todosDpas.length - pendentes;
  const dpaPorConta = new Map(todosDpas.map((d) => [d.contaClienteId, d]));

  const kpis = [
    { label: "Contas ativas", value: contas.length, tone: "" },
    { label: "Contratos pendentes", value: pendentes, tone: pendentes > 0 ? "warn" : "" },
    { label: "Contratos assinados", value: assinados, tone: "" },
  ];

  return (
    <div className="max-w-6xl">
      <p className="t-eyebrow">Dattis · Painel</p>
      <h1 className="t-display mt-3 max-w-3xl">Sua operação de compliance, em um lugar só</h1>
      <p className="mt-4 max-w-2xl text-body leading-relaxed text-body">
        Cada conta de cliente que você ativa aqui já sai com o que a LGPD exige: o que vocês fazem com o dado dela, o
        contrato com o cliente e a lista de ferramentas que tocam esse dado.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className={"rounded-[20px] border p-6 " + (k.tone === "warn" ? "border-orange/40 bg-warn-tint" : "border-line bg-surface")}>
            <p className="t-eyebrow">{k.label}</p>
            <p className={"font-display mt-3 text-[3rem] leading-none tabular-nums " + (k.tone === "warn" ? "text-warn" : "text-ink")}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/painel/contas/novo" className="btn btn-primary btn-lg">
          Ativar conta nova <ArrowRight size={16} />
        </Link>
        <Link href="/painel/certificados" className="btn btn-ghost btn-lg">
          Emitir certificado
        </Link>
        <Link href="/painel/dossie" className="btn btn-ghost btn-lg">
          Dossiê para BM
        </Link>
        <Link href="/auditoria" className="btn btn-ghost btn-lg">
          Auditar um site
        </Link>
      </div>

      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="t-heading-lg">Contas recentes</h2>
          {contas.length > 0 && (
            <Link href="/painel/contas" className="arrow-link text-[13px]">
              Ver todas
              <span className="arrow-circle h-9 w-9">
                <ArrowRight size={16} strokeWidth={1.6} />
              </span>
            </Link>
          )}
        </div>

        {contas.length === 0 ? (
          <div className="block-card mt-6 p-12 text-center text-body text-body">
            Nenhuma conta ativada ainda. Comece ativando a primeira conta de cliente — a Dattis já gera o RAT e o contrato
            automaticamente.
          </div>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {contas.slice(0, 5).map((conta) => {
              const dpa = dpaPorConta.get(conta.id);
              const assinado = dpa?.status === "assinado";
              const flows = [conta.flowCapi && "CAPI", conta.flowAds && "Ads", conta.flowWhatsapp && "WhatsApp", conta.flowCrm && "CRM"].filter(
                (f): f is string => Boolean(f),
              );
              return (
                <li key={conta.id}>
                  <Link
                    href={`/painel/contas/${conta.id}`}
                    className="flex flex-wrap items-center gap-4 rounded-[20px] border border-line bg-surface px-5 py-4 transition-colors hover:border-brand-strong"
                  >
                    <span className="font-display min-w-[180px] flex-1 text-[20px]">{conta.nome}</span>
                    <span className="flex flex-wrap gap-1.5">
                      {flows.map((f) => (
                        <span key={f} className="pill pill-neutral">
                          {f}
                        </span>
                      ))}
                    </span>
                    <span className="meta-row">
                      <span className="meta-icon h-9 w-9 border border-line shadow-none">
                        <FileSignature size={15} strokeWidth={1.8} />
                      </span>
                      <span className="meta-label border border-line py-2.5 shadow-none">DPA assinado</span>
                      <span className={(assinado ? "meta-yes" : "meta-no") + " py-2.5"}>{assinado ? "SIM" : "NÃO"}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
