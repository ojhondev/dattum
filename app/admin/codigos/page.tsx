import { redirect } from "next/navigation";
import { desc, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, codigosAtivacao } from "@/lib/db/schema";
import { isAdmin } from "@/lib/admin";
import { origemAtual } from "@/lib/certificados";
import { Logo } from "@/components/brand/Logo";
import { NovoCodigo, CodigoLinha, SairAdmin } from "./CodigosClient";

export const dynamic = "force-dynamic";

export default async function AdminCodigosPage() {
  if (!(await isAdmin())) redirect("/admin/entrar");

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
    <div className="w-full px-5 pb-20 sm:px-10 lg:px-14">
      <header className="flex h-[76px] items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo height={26} />
          <span className="t-eyebrow hidden sm:inline">Área Dattis</span>
        </div>
        <SairAdmin />
      </header>

      <div className="max-w-6xl pt-6">
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
                      usuarios: c.usuarios,
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
