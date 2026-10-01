import { and, eq, inArray } from "drizzle-orm";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { agencias, contasCliente, contaSubprocessadores, subprocessadoresCatalogo } from "@/lib/db/schema";
import { fluxosDaConta } from "@/lib/fluxos";
import { TIPOS_DOCUMENTO } from "@/lib/documentos";
import { GeradorDocumentos, type ContaDoc } from "./GeradorDocumentos";

export const dynamic = "force-dynamic";

export default async function DocumentosPage({ searchParams }: { searchParams: Promise<{ conta?: string; tipo?: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return null;
  const { conta, tipo } = await searchParams;

  const [agencia, contas] = await Promise.all([
    db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) }),
    db.query.contasCliente.findMany({ where: eq(contasCliente.agenciaId, sessao.agenciaId), orderBy: (t, { asc }) => asc(t.nome) }),
  ]);
  if (!agencia) return null;
  const ids = contas.map((c) => c.id);
  const ferramentas = ids.length
    ? await db
        .select({ conta: contaSubprocessadores.contaClienteId, custom: contaSubprocessadores.nomeCustomizado, nome: subprocessadoresCatalogo.nome, pais: subprocessadoresCatalogo.pais })
        .from(contaSubprocessadores)
        .leftJoin(subprocessadoresCatalogo, eq(contaSubprocessadores.subprocessadorCatalogoId, subprocessadoresCatalogo.id))
        .where(and(inArray(contaSubprocessadores.contaClienteId, ids), eq(contaSubprocessadores.ativo, true)))
    : [];

  const lista: ContaDoc[] = contas.map((c) => ({
    id: c.id,
    dados: {
      agencia: { nome: agencia.nome, cnpj: agencia.cnpj, email: agencia.email },
      conta: { nome: c.nome, cnpj: c.cnpj, site: c.site, contatoNome: c.contatoNome, contatoEmail: c.contatoEmail, fluxos: fluxosDaConta(c).map((f) => f.key) },
      ferramentas: ferramentas.filter((f) => f.conta === c.id).map((f) => ({ nome: f.custom ?? f.nome ?? "—", pais: f.custom ? null : f.pais })),
    },
  }));

  const contaInicial = lista.find((c) => c.id === conta)?.id ?? lista[0]?.id ?? "";
  const tipoInicial = TIPOS_DOCUMENTO.find((t) => t.id === tipo)?.id ?? TIPOS_DOCUMENTO[0].id;

  return (
    <div className="max-w-[1400px]">
      <h1 className="t-display max-w-3xl">Documentos prontos para cada cliente</h1>
      <p className="mt-3 max-w-2xl text-body leading-relaxed text-body">
        Escolha o cliente e o documento: a Dattis monta o texto com o CNPJ, o site, as operações de tráfego e as ferramentas
        dele. Preencha as lacunas destacadas e baixe em Word ou PDF.
      </p>
      <div className="mt-8">
        <GeradorDocumentos contas={lista} contaInicial={contaInicial} tipoInicial={tipoInicial} />
      </div>
    </div>
  );
}
