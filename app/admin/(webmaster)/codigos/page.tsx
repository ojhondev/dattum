import { desc, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, codigosAtivacao } from "@/lib/db/schema";
import { origemAtual } from "@/lib/certificados";
import { NovoCodigo, CodigoLinha } from "./CodigosClient";

export const dynamic = "force-dynamic";

export default async function AdminCodigosPage() {
  const [codigos, origem] = await Promise.all([
    db.query.codigosAtivacao.findMany({ orderBy: desc(codigosAtivacao.criadoEm) }),
    origemAtual(),
  ]);
  const ids = codigos.map((c) => c.agenciaId).filter((id): id is string => !!id);
  const ags = ids.length ? await db.query.agencias.findMany({ where: inArray(agencias.id, ids) }) : [];
  const agPorId = new Map(ags.map((a) => [a.id, a]));

  const disponiveis = codigos.filter((c) => !c.usadoEm && !c.revogado).length;
  const usados = codigos.filter((c) => c.usadoEm).length;

  return (
    <div>
      <div className="max-w-6xl">
        <p className="t-eyebrow">Códigos de ativação</p>
        <h1 className="t-display mt-3">Um código por cliente, de uso único</h1>
        <p className="mt-4 max-w-2xl text-body leading-relaxed text-body">
          Depois que o pagamento for confirmado, gere o código do cliente e envie pelo WhatsApp. Ele cria o acesso da
          agência com o plano já vinculado — e o código deixa de valer assim que for usado.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          <span className="tag">{disponiveis} disponível(is)</span>
          <span className="tag tag-white">{usados} usado(s)</span>
        </div>

        <NovoCodigo />

        <section className="mt-12">
          <h2 className="t-heading-lg">Gerados</h2>
          {codigos.length === 0 ? (
            <div className="block-card mt-6 p-12 text-center text-body">Nenhum código gerado ainda.</div>
          ) : (
            <ul className="mt-6 flex flex-col gap-3">
              {codigos.map((c) => {
                const ag = c.agenciaId ? agPorId.get(c.agenciaId) : undefined;
                return (
                  <CodigoLinha
                    key={c.id}
                    origem={origem}
                    c={{
                      id: c.id,
                      codigo: c.codigo,
                      clienteNome: c.clienteNome,
                      clienteContato: c.clienteContato,
                      plano: c.plano,
                      clientes: c.clientes,
                      criadoEm: c.criadoEm.toLocaleDateString("pt-BR"),
                      status: c.revogado ? "revogado" : c.usadoEm ? "usado" : "disponivel",
                      usadoPor: ag ? `${ag.nome} · ${ag.email}` : null,
                      usadoEm: c.usadoEm ? c.usadoEm.toLocaleString("pt-BR") : null,
                    }}
                  />
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
