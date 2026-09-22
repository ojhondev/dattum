import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { contasCliente, atividadesTratamento, contaSubprocessadores, subprocessadoresCatalogo, dpas } from "@/lib/db/schema";
import ContaDetalhe from "./ContaDetalhe";

export default async function ContaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return null;
  const { id } = await params;

  const conta = await db.query.contasCliente.findFirst({
    where: and(eq(contasCliente.id, id), eq(contasCliente.agenciaId, sessao.agenciaId)),
  });
  if (!conta) notFound();

  const [atividades, subsRaw, dpa] = await Promise.all([
    db.query.atividadesTratamento.findMany({
      where: eq(atividadesTratamento.contaClienteId, id),
      orderBy: (t, { asc }) => asc(t.createdAt),
    }),
    db
      .select({
        id: contaSubprocessadores.id,
        nomeCustomizado: contaSubprocessadores.nomeCustomizado,
        finalidade: contaSubprocessadores.finalidade,
        ativo: contaSubprocessadores.ativo,
        catalogoNome: subprocessadoresCatalogo.nome,
        catalogoCategoria: subprocessadoresCatalogo.categoria,
        catalogoPais: subprocessadoresCatalogo.pais,
      })
      .from(contaSubprocessadores)
      .leftJoin(subprocessadoresCatalogo, eq(contaSubprocessadores.subprocessadorCatalogoId, subprocessadoresCatalogo.id))
      .where(eq(contaSubprocessadores.contaClienteId, id)),
    db.query.dpas.findFirst({ where: eq(dpas.contaClienteId, id) }),
  ]);

  const subprocessadores = subsRaw.map((s) => ({
    id: s.id,
    nome: s.nomeCustomizado ?? s.catalogoNome ?? "—",
    categoria: s.catalogoCategoria ?? "Ferramenta própria da agência",
    pais: s.catalogoPais ?? "—",
    finalidade: s.finalidade,
    ativo: s.ativo,
  }));

  return (
    <ContaDetalhe
      conta={{
        id: conta.id,
        nome: conta.nome,
        cnpj: conta.cnpj,
        contatoNome: conta.contatoNome,
        contatoEmail: conta.contatoEmail,
      }}
      atividadesIniciais={atividades.map((a) => ({
        id: a.id,
        nomeAtividade: a.nomeAtividade,
        categoriasDado: a.categoriasDado,
        finalidade: a.finalidade,
        baseLegal: a.baseLegal,
        titulares: a.titulares,
        prazoRetencao: a.prazoRetencao,
      }))}
      subprocessadores={subprocessadores}
      dpaInicial={
        dpa
          ? {
              id: dpa.id,
              status: dpa.status,
              conteudoSnapshot: dpa.conteudoSnapshot,
              versao: dpa.versao,
              assinanteNome: dpa.assinanteNome,
              assinanteCargo: dpa.assinanteCargo,
              assinadoEm: dpa.assinadoEm ? dpa.assinadoEm.toISOString() : null,
              assinadoIp: dpa.assinadoIp,
            }
          : null
      }
    />
  );
}
