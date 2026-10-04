import Link from "next/link";
import { eq, inArray } from "drizzle-orm";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { contasCliente, contaSubprocessadores, subprocessadoresCatalogo } from "@/lib/db/schema";
import { ExternalLink } from "lucide-react";
import { BarraModulo, BuscaModulo, SelecaoModulo } from "@/components/app/Modulo";
import { ferramentasDaAgencia } from "@/lib/ferramentas-agencia";
import { AdicionarFerramenta } from "@/components/app/AdicionarFerramenta";
import { ExcluirFerramenta } from "@/components/app/ExcluirFerramenta";

const TH = "border-b border-line px-5 py-3 text-left font-mono text-[11.5px] font-normal uppercase tracking-[0.04em] text-muted";
const TD = "border-b border-line px-5 py-3.5";
const PROPRIA = "Informada pela agência";

/**
 * Todas as ferramentas que tocam dados de algum cliente, consolidadas (em quais clientes cada uma está),
 * mais as que a agência cadastrou com nome, link e categoria, mesmo que ainda sem cliente.
 */
export default async function SubprocessadoresPage({ searchParams }: { searchParams: Promise<{ q?: string; categoria?: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return null;
  const { q, categoria } = await searchParams;
  const termo = (q ?? "").trim().toLowerCase();

  const [contas, proprias] = await Promise.all([
    db.query.contasCliente.findMany({ where: eq(contasCliente.agenciaId, sessao.agenciaId), columns: { id: true, nome: true }, orderBy: (t, { asc }) => asc(t.nome) }),
    ferramentasDaAgencia(sessao.agenciaId),
  ]);
  const linhas = contas.length
    ? await db
        .select({
          contaClienteId: contaSubprocessadores.contaClienteId,
          nomeCustomizado: contaSubprocessadores.nomeCustomizado,
          catalogoNome: subprocessadoresCatalogo.nome,
          catalogoCategoria: subprocessadoresCatalogo.categoria,
          catalogoPais: subprocessadoresCatalogo.pais,
        })
        .from(contaSubprocessadores)
        .leftJoin(subprocessadoresCatalogo, eq(contaSubprocessadores.subprocessadorCatalogoId, subprocessadoresCatalogo.id))
        .where(inArray(contaSubprocessadores.contaClienteId, contas.map((c) => c.id)))
    : [];

  const contaPorId = new Map(contas.map((c) => [c.id, c]));
  const grupos = new Map<string, { nome: string; categoria: string; pais: string; contas: { id: string; nome: string }[]; propria?: { id: string; site: string | null } }>();
  for (const l of linhas) {
    const nome = l.nomeCustomizado ?? l.catalogoNome ?? "—";
    if (!grupos.has(nome)) grupos.set(nome, { nome, categoria: l.catalogoCategoria ?? PROPRIA, pais: l.catalogoPais ?? "—", contas: [] });
    const c = contaPorId.get(l.contaClienteId);
    if (c && !grupos.get(nome)!.contas.some((x) => x.id === c.id)) grupos.get(nome)!.contas.push(c);
  }
  for (const p of proprias) {
    const g = grupos.get(p.nome);
    if (g) g.propria = { id: p.id, site: p.site };
    else grupos.set(p.nome, { nome: p.nome, categoria: p.categoria, pais: "—", contas: [], propria: { id: p.id, site: p.site } });
  }
  const todos = [...grupos.values()].sort((a, b) => b.contas.length - a.contas.length || a.nome.localeCompare(b.nome));
  const categorias = [...new Set(todos.map((g) => g.categoria))].sort();
  const lista = todos
    .filter((g) => !termo || `${g.nome} ${g.categoria}`.toLowerCase().includes(termo))
    .filter((g) => !categoria || g.categoria === categoria);

  return (
    <div className="max-w-[1400px]">
      <BarraModulo
        esquerda={
          <>
            <BuscaModulo placeholder="Buscar ferramenta" />
            {categorias.length > 1 && (
              <SelecaoModulo
                nome="categoria"
                rotulo="Categoria"
                opcoes={[{ valor: "todas", rotulo: "Todas", n: todos.length }, ...categorias.map((c) => ({ valor: c, rotulo: c, n: todos.filter((g) => g.categoria === c).length }))]}
              />
            )}
          </>
        }
        direita={<AdicionarFerramenta />}
      />

      <div className="bloco overflow-x-auto">
        {lista.length === 0 ? (
          <div className="p-12 text-center text-[14px] text-muted">
            {todos.length ? "Nenhuma ferramenta com esse filtro." : "Nenhuma ferramenta ainda. Elas aparecem aqui quando você escolhe as ferramentas de cada cliente, ou cadastra uma em Adicionar ferramenta."}
          </div>
        ) : (
          <>
          <ul className="divide-y divide-line md:hidden">
            {lista.map((g) => (
              <li key={g.nome} className="flex items-start gap-3 px-4 py-3.5">
                <div className="min-w-0 flex-1">
                  <Nome g={g} />
                  <p className="mt-0.5 text-[12.5px] text-muted">
                    {g.categoria} · {g.contas.length} cliente(s)
                  </p>
                </div>
                {g.propria && <ExcluirFerramenta id={g.propria.id} nome={g.nome} emUso={g.contas.length} />}
              </li>
            ))}
          </ul>
          <table className="hidden w-full border-collapse text-[14px] md:table">
            <thead>
              <tr className="bg-surface-2">
                <th className={TH}>Ferramenta</th>
                <th className={TH}>Categoria</th>
                <th className={TH}>País</th>
                <th className={TH}>Clientes</th>
                <th className={TH}>
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {lista.map((g) => (
                <tr key={g.nome} className="align-top last:[&>td]:border-b-0 hover:bg-surface-2">
                  <td className={TD}>
                    <Nome g={g} />
                  </td>
                  <td className={TD + " text-muted"}>{g.categoria}</td>
                  <td className={TD + " text-muted"}>{g.pais}</td>
                  <td className={TD}>
                    <span className="flex flex-wrap gap-1">
                      {g.contas.slice(0, 6).map((c) => (
                        <Link key={c.id} href={`/painel/contas/${c.id}?aba=ferramentas`} className="rounded-md bg-surface-2 px-2 py-0.5 text-[12.5px] text-body hover:text-ink">
                          {c.nome}
                        </Link>
                      ))}
                      {g.contas.length > 6 && <span className="px-1 text-[12.5px] text-muted">+{g.contas.length - 6}</span>}
                      {g.contas.length === 0 && <span className="text-[12.5px] text-muted">Nenhum ainda</span>}
                    </span>
                  </td>
                  <td className={TD + " w-12 text-right"}>{g.propria && <ExcluirFerramenta id={g.propria.id} nome={g.nome} emUso={g.contas.length} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </>
        )}
      </div>
    </div>
  );
}

function Nome({ g }: { g: { nome: string; propria?: { id: string; site: string | null } } }) {
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="font-medium text-ink">{g.nome}</span>
      {g.propria && <span className="rounded-md bg-brand-tint px-1.5 py-0.5 text-[11.5px] text-brand-ink">Da agência</span>}
      {g.propria?.site && (
        <a href={g.propria.site} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[12.5px] text-muted hover:text-ink">
          {g.propria.site.replace(/^https?:\/\//, "")} <ExternalLink size={12} />
        </a>
      )}
    </span>
  );
}
