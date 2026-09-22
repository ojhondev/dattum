import { eq } from "drizzle-orm";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { contasCliente, contaSubprocessadores, subprocessadoresCatalogo } from "@/lib/db/schema";

export default async function SubprocessadoresPage() {
  const sessao = await getSessao();
  if (!sessao) return null;

  const contas = await db.query.contasCliente.findMany({ where: eq(contasCliente.agenciaId, sessao.agenciaId) });
  const contaIds = new Set(contas.map((c) => c.id));
  const contaNomePorId = new Map(contas.map((c) => [c.id, c.nome]));

  const linhas = await db
    .select({
      contaClienteId: contaSubprocessadores.contaClienteId,
      nomeCustomizado: contaSubprocessadores.nomeCustomizado,
      finalidade: contaSubprocessadores.finalidade,
      catalogoNome: subprocessadoresCatalogo.nome,
      catalogoCategoria: subprocessadoresCatalogo.categoria,
      catalogoPais: subprocessadoresCatalogo.pais,
    })
    .from(contaSubprocessadores)
    .leftJoin(subprocessadoresCatalogo, eq(contaSubprocessadores.subprocessadorCatalogoId, subprocessadoresCatalogo.id));

  const daAgencia = linhas.filter((l) => contaIds.has(l.contaClienteId));

  const agrupado = new Map<
    string,
    { nome: string; categoria: string; pais: string; contas: Set<string> }
  >();
  for (const l of daAgencia) {
    const nome = l.nomeCustomizado ?? l.catalogoNome ?? "—";
    const chave = nome;
    if (!agrupado.has(chave)) {
      agrupado.set(chave, {
        nome,
        categoria: l.catalogoCategoria ?? "Ferramenta própria da agência",
        pais: l.catalogoPais ?? "—",
        contas: new Set(),
      });
    }
    agrupado.get(chave)!.contas.add(contaNomePorId.get(l.contaClienteId) ?? "");
  }

  const grupos = Array.from(agrupado.values()).sort((a, b) => b.contas.size - a.contas.size);

  return (
    <div>
      <p className="painel-eyebrow">Dattis · Subprocessadores</p>
      <h1 className="painel-title">
        Quem mais mexe nesse dado
        <small>Registro de subprocessadores</small>
      </h1>
      <p className="painel-lede">
        Toda ferramenta terceira que passa pelo dado de algum cliente seu, consolidada aqui — em
        quantas contas cada uma está ativa. Pra adicionar ou remover uma ferramenta de uma conta
        específica, acesse a conta e a aba &quot;Quem mais mexe nesse dado&quot;.
      </p>

      <div className="painel-table-wrap">
        {grupos.length === 0 ? (
          <div className="painel-empty">Nenhum subprocessador registrado ainda.</div>
        ) : (
          <table className="painel-table">
            <thead>
              <tr>
                <th>Ferramenta</th>
                <th>Categoria</th>
                <th>País</th>
                <th>Em quantas contas</th>
              </tr>
            </thead>
            <tbody>
              {grupos.map((g) => (
                <tr key={g.nome}>
                  <td>{g.nome}</td>
                  <td>{g.categoria}</td>
                  <td>{g.pais}</td>
                  <td>{g.contas.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
