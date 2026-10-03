import Link from "next/link";
import { and, count, eq, isNull, inArray } from "drizzle-orm";
import { Plus } from "lucide-react";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { agencias, contaSubprocessadores, contasCliente, dpas } from "@/lib/db/schema";
import { fluxosDaConta } from "@/lib/fluxos";
import { situacaoDpa } from "@/lib/dpa";
import { ultimosResultados } from "@/lib/vigilancia";
import { NotaVigilancia } from "@/components/app/VigilanciaChips";
import { BarraModulo, BuscaModulo, ChipSituacao, FiltroModulo } from "@/components/app/Modulo";

const TH = "border-b border-line px-5 py-3 text-left font-mono text-[11.5px] font-normal uppercase tracking-[0.04em] text-muted";
const TD = "border-b border-line px-5 py-3.5";

const CONTRATO = {
  assinado: { tom: "ok", rotulo: "Assinado" },
  aguarda_cliente: { tom: "pendente", rotulo: "Falta o cliente" },
  aguarda_agencia: { tom: "pendente", rotulo: "Falta a agência" },
  rascunho: { tom: "pendente", rotulo: "Sem assinatura" },
} as const;

export default async function ContasPage({ searchParams }: { searchParams: Promise<{ q?: string; situacao?: string }> }) {
  const { q, situacao } = await searchParams;
  const termo = (q ?? "").trim().toLowerCase();
  const sessao = await getSessao();
  if (!sessao) return null;

  const [todasContas, todosDpas, resultados, agencia] = await Promise.all([
    db.query.contasCliente.findMany({ where: eq(contasCliente.agenciaId, sessao.agenciaId), orderBy: (t, { desc }) => desc(t.createdAt) }),
    db.query.dpas.findMany({ where: and(eq(dpas.agenciaId, sessao.agenciaId), isNull(dpas.substituidoEm)) }),
    ultimosResultados(sessao.agenciaId),
    db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) }),
  ]);
  const ferramentas = todasContas.length
    ? await db
        .select({ conta: contaSubprocessadores.contaClienteId, n: count() })
        .from(contaSubprocessadores)
        .where(inArray(contaSubprocessadores.contaClienteId, todasContas.map((c) => c.id)))
        .groupBy(contaSubprocessadores.contaClienteId)
    : [];
  const nFerramentas = new Map(ferramentas.map((f) => [f.conta, Number(f.n)]));
  const notaPorConta = new Map(resultados.map((r) => [r.contaClienteId, r.nota]));
  const situacaoPorConta = new Map(todosDpas.map((d) => [d.contaClienteId, situacaoDpa(d)]));
  const limite = agencia?.clientesContratados ?? null;
  const noLimite = limite != null && todasContas.length >= limite;

  const assinadas = todasContas.filter((c) => situacaoPorConta.get(c.id) === "assinado").length;
  const contas = todasContas
    .filter((c) => !termo || [c.nome, c.cnpj, c.site].some((v) => v?.toLowerCase().includes(termo)))
    .filter((c) => (situacao === "pendentes" ? situacaoPorConta.get(c.id) !== "assinado" : situacao === "assinados" ? situacaoPorConta.get(c.id) === "assinado" : true));

  return (
    <div className="max-w-[1400px]">
      <BarraModulo
        esquerda={
          <>
            <BuscaModulo placeholder="Buscar cliente, CNPJ ou site" />
            <FiltroModulo
              nome="situacao"
              opcoes={[
                { valor: "todos", rotulo: "Todos", n: todasContas.length },
                { valor: "pendentes", rotulo: "Contrato pendente", n: todasContas.length - assinadas },
                { valor: "assinados", rotulo: "Contrato assinado", n: assinadas },
              ]}
            />
          </>
        }
        direita={
          <>
            {limite != null && (
              <span className={"px-2 text-[13px] tabular-nums " + (noLimite ? "text-warn" : "text-muted")}>
                {todasContas.length} de {limite} do plano
              </span>
            )}
            {noLimite ? (
              <span className="barra-btn pointer-events-none opacity-60">Limite do plano atingido</span>
            ) : (
              <Link href="/painel/contas/novo" data-tour="contas-nova" className="barra-btn primario">
                <Plus size={15} /> Novo cliente
              </Link>
            )}
          </>
        }
      />

      <div data-tour="contas-tabela" className="bloco overflow-x-auto">
        {contas.length === 0 ? (
          <div className="flex flex-col items-center gap-4 p-12 text-center text-[14px] text-muted">
            {termo || situacao ? (
              "Nenhum cliente com esse filtro."
            ) : (
              <>
                Nenhum cliente ainda. Cadastre o primeiro e a Dattis monta o registro, o contrato e a lista de ferramentas.
                <Link href="/painel/contas/novo" className="barra-btn primario">
                  <Plus size={15} /> Cadastrar cliente
                </Link>
              </>
            )}
          </div>
        ) : (
          <>
          <ul className="divide-y divide-line md:hidden">
            {contas.map((conta) => {
              const sit = CONTRATO[situacaoPorConta.get(conta.id) ?? "rascunho"];
              return (
                <li key={conta.id}>
                  <Link href={`/painel/contas/${conta.id}`} className="flex flex-col gap-2 px-4 py-3.5">
                    <span className="text-[15px] font-medium text-ink">{conta.nome}</span>
                    <span className="flex flex-wrap items-center gap-1.5">
                      <ChipSituacao tom={sit.tom}>{sit.rotulo}</ChipSituacao>
                      <ChipSituacao tom="neutro">{nFerramentas.get(conta.id) ?? 0} ferramenta(s)</ChipSituacao>
                      <NotaVigilancia nota={notaPorConta.get(conta.id)} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <table className="hidden w-full border-collapse text-[14px] md:table">
            <thead>
              <tr className="bg-surface-2">
                <th className={TH}>Cliente</th>
                <th className={TH}>O que a agência faz</th>
                <th className={TH}>Ferramentas</th>
                <th className={TH}>Contrato</th>
                <th className={TH}>Site</th>
              </tr>
            </thead>
            <tbody>
              {contas.map((conta) => {
                const sit = CONTRATO[situacaoPorConta.get(conta.id) ?? "rascunho"];
                const flows = fluxosDaConta(conta);
                return (
                  <tr key={conta.id} className="transition-colors last:[&>td]:border-b-0 hover:bg-surface-2">
                    <td className={TD}>
                      <Link href={`/painel/contas/${conta.id}`} className="font-medium text-ink hover:underline">
                        {conta.nome}
                      </Link>
                      {conta.site && <span className="mt-0.5 block truncate text-[12.5px] text-muted">{conta.site.replace(/^https?:\/\//, "")}</span>}
                    </td>
                    <td className={TD}>
                      {flows.length > 0 ? (
                        <span className="flex flex-wrap gap-1">
                          {flows.map((f) => (
                            <span key={f.key} title={f.titulo} className="rounded-md bg-surface-2 px-2 py-0.5 text-[12px] text-body">
                              {f.curto}
                            </span>
                          ))}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className={TD + " tabular-nums text-body"}>{nFerramentas.get(conta.id) ?? 0}</td>
                    <td className={TD}>
                      <ChipSituacao tom={sit.tom}>{sit.rotulo}</ChipSituacao>
                    </td>
                    <td className={TD}>
                      <NotaVigilancia nota={notaPorConta.get(conta.id)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </>
        )}
      </div>
    </div>
  );
}
