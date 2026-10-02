import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { agencias, contasCliente, atividadesTratamento, contaSubprocessadores, subprocessadoresCatalogo, varreduraResultados } from "@/lib/db/schema";
import { fluxosDaConta } from "@/lib/fluxos";
import { dpaVigente, situacaoDpa, versoesAnteriores } from "@/lib/dpa";
import ContaDetalhe from "./ContaDetalhe";
import { SITE_URL, urlAbsoluta } from "@/lib/site";
import { estatisticaCookies } from "@/lib/cookies-stats";

const iso = (d: Date | null) => (d ? d.toISOString() : null);

export default async function ContaDetalhePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ aba?: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return null;
  const { id } = await params;
  const { aba } = await searchParams;

  const conta = await db.query.contasCliente.findFirst({
    where: and(eq(contasCliente.id, id), eq(contasCliente.agenciaId, sessao.agenciaId)),
  });
  if (!conta) notFound();

  const [atividades, subsRaw, dpa, versoes, vig, agencia] = await Promise.all([
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
    dpaVigente(id),
    versoesAnteriores(id),
    db.query.varreduraResultados.findFirst({
      where: eq(varreduraResultados.contaClienteId, id),
      orderBy: (t, { desc }) => desc(t.verificadoEm),
    }),
    db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) }),
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
      temDat={agencia?.plano !== "start"}
      cookies={{ token: conta.cookiesToken, config: conta.cookiesConfig ?? null, estatistica: await estatisticaCookies(conta.cookiesToken), origem: SITE_URL }}
      politica={{ url: conta.politicaPublicadaEm && conta.slug ? urlAbsoluta(`/p/${conta.slug}/privacidade`) : null, email: conta.emailPrivacidade ?? "" }}
      abaInicial={aba === "dpa" || aba === "sub" || aba === "vig" ? aba : "rat"}
      conta={{
        id: conta.id,
        nome: conta.nome,
        cnpj: conta.cnpj,
        contatoNome: conta.contatoNome,
        contatoEmail: conta.contatoEmail,
        contatoWhatsapp: conta.contatoWhatsapp,
        site: conta.site,
        fluxos: fluxosDaConta(conta).map((f) => f.key),
      }}
      vigilancia={vig ? { nota: vig.nota, verificadoEm: vig.verificadoEm.toISOString(), alvo: vig.alvo, achados: vig.achados } : null}
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
      responsavelPadrao={{ nome: agencia?.responsavelNome ?? "", cargo: agencia?.responsavelCargo ?? "" }}
      contrato={
        dpa
          ? {
              id: dpa.id,
              versao: dpa.versao,
              situacao: situacaoDpa(dpa),
              conteudoSnapshot: dpa.conteudoSnapshot,
              hashConteudo: dpa.hashConteudo,
              temLink: !!dpa.tokenAssinatura,
              agencia: { nome: dpa.assinanteNome, cargo: dpa.assinanteCargo, em: iso(dpa.assinadoEm), ip: dpa.assinadoIp },
              cliente: { nome: dpa.clienteNome, cargo: dpa.clienteCargo, email: dpa.clienteEmail, em: iso(dpa.clienteAssinadoEm), ip: dpa.clienteIp },
            }
          : null
      }
      versoes={versoes.map((v) => ({
        id: v.id,
        versao: v.versao,
        assinado: situacaoDpa(v) === "assinado",
        criadoEm: v.createdAt.toISOString(),
        substituidoEm: iso(v.substituidoEm),
      }))}
    />
  );
}
