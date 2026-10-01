import Link from "next/link";
import { and, eq, isNull } from "drizzle-orm";
import { ArrowRight } from "lucide-react";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { agencias, contasCliente, dpas } from "@/lib/db/schema";
import { fluxosDaConta } from "@/lib/fluxos";
import { ultimosResultados } from "@/lib/vigilancia";
import { NotaVigilancia } from "@/components/app/VigilanciaChips";

const TH = "border-b border-line px-5 py-3.5 text-left font-mono text-[12px] font-normal uppercase tracking-[0.04em] text-muted";
const TD = "border-b border-line px-5 py-4";

export default async function ContasPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const termo = (q ?? "").trim().toLowerCase();
  const sessao = await getSessao();
  if (!sessao) return null;

  const todasContas = await db.query.contasCliente.findMany({
    where: eq(contasCliente.agenciaId, sessao.agenciaId),
    orderBy: (t, { desc }) => desc(t.createdAt),
  });
  const contas = termo ? todasContas.filter((c) => [c.nome, c.cnpj, c.site].some((v) => v?.toLowerCase().includes(termo))) : todasContas;

  const [todosDpas, resultados] = await Promise.all([
    db.query.dpas.findMany({ where: and(eq(dpas.agenciaId, sessao.agenciaId), isNull(dpas.substituidoEm)) }),
    ultimosResultados(sessao.agenciaId),
  ]);
  const notaPorConta = new Map(resultados.map((r) => [r.contaClienteId, r.nota]));
  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) });
  const limite = agencia?.clientesContratados ?? null;
  const noLimite = limite != null && todasContas.length >= limite;
  const dpaPorConta = new Map(todosDpas.map((d) => [d.contaClienteId, d]));

  return (
    <div className="max-w-6xl">
      <p className="t-eyebrow">Dattis · Contas de cliente</p>
      <h1 className="t-display mt-3">Contas de cliente</h1>
      <p className="mt-4 max-w-2xl text-body leading-relaxed text-body">
        Cada linha é um cliente que sua agência atende. Ao ativar uma conta, a Dattis já gera automaticamente o que
        ela precisa: o registro do que vocês fazem com o dado dela e o contrato entre vocês.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {noLimite ? (
          <span className="rounded-2xl bg-warn-tint px-4 py-3 text-body-sm text-warn">
            Todos os {limite} clientes do seu plano já estão ativos. Fale com a Dattis pra incluir mais.
          </span>
        ) : (
          <Link href="/painel/contas/novo" className="btn btn-primary btn-lg">
            Ativar conta nova <ArrowRight size={16} />
          </Link>
        )}
        {limite != null && (
          <span className="tag tag-white border border-line">
            {todasContas.length} de {limite} clientes contratados
          </span>
        )}
      </div>

      <div className="card-flush mt-10 overflow-x-auto">
        {contas.length === 0 ? (
          <div className="p-12 text-center text-body-sm text-muted">{termo ? `Nenhum cliente encontrado para “${q}”.` : "Nenhuma conta ativada ainda."}</div>
        ) : (
          <table className="w-full min-w-[760px] border-collapse text-body-sm">
            <thead>
              <tr className="bg-surface-2">
                <th className={TH}>Cliente</th>
                <th className={TH}>O que a agência faz com o dado</th>
                <th className={TH}>Contrato</th>
                <th className={TH}>Vigilância</th>
              </tr>
            </thead>
            <tbody>
              {contas.map((conta) => {
                const dpa = dpaPorConta.get(conta.id);
                const flows = fluxosDaConta(conta);
                return (
                  <tr key={conta.id} className="transition-colors last:[&>td]:border-b-0 hover:bg-surface-2">
                    <td className={TD}>
                      <Link href={`/painel/contas/${conta.id}`} className="font-display text-[18px] text-ink hover:underline">
                        {conta.nome}
                      </Link>
                      {conta.site && <span className="mt-0.5 block truncate text-[13px] text-muted">{conta.site.replace(/^https?:\/\//, "")}</span>}
                    </td>
                    <td className={TD}>
                      {flows.length > 0 ? (
                        <span className="flex flex-wrap gap-1.5">
                          {flows.map((f) => (
                            <span key={f.key} title={f.titulo} className="pill pill-neutral">
                              {f.curto}
                            </span>
                          ))}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className={TD}>
                      {dpa?.status === "assinado" ? (
                        <span className="pill pill-ok">Assinado</span>
                      ) : (
                        <span className="pill pill-warn">{dpa?.assinadoEm ? "Falta o cliente" : dpa?.clienteAssinadoEm ? "Falta a agência" : "Pendente"}</span>
                      )}
                    </td>
                    <td className={TD}>
                      <NotaVigilancia nota={notaPorConta.get(conta.id)} />
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
