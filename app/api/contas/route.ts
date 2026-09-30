import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  agencias,
  contasCliente,
  atividadesTratamento,
  contaSubprocessadores,
  subprocessadoresCatalogo,
  dpas,
} from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { FLOW_TEMPLATES, gerarConteudoDpa, type FlowKey } from "@/lib/rat-templates";

export const runtime = "nodejs";

export async function GET() {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });

  const contas = await db.query.contasCliente.findMany({
    where: eq(contasCliente.agenciaId, sessao.agenciaId),
    orderBy: (t, { desc }) => desc(t.createdAt),
  });

  return NextResponse.json({ ok: true, contas });
}

export async function POST(req: Request) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const nome = typeof body?.nome === "string" ? body.nome.trim() : "";
  const cnpj = typeof body?.cnpj === "string" && body.cnpj.trim() ? body.cnpj.trim() : null;
  const contatoNome = typeof body?.contatoNome === "string" ? body.contatoNome.trim() : null;
  const contatoEmail = typeof body?.contatoEmail === "string" ? body.contatoEmail.trim() : null;
  const crmNome = typeof body?.crmNome === "string" && body.crmNome.trim() ? body.crmNome.trim() : null;

  const flows: FlowKey[] = (["capi", "ads", "whatsapp", "crm"] as FlowKey[]).filter(
    (f) => body?.flows?.[f] === true
  );

  if (!nome) {
    return NextResponse.json({ ok: false, error: "Informe o nome do cliente." }, { status: 400 });
  }

  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) });
  if (!agencia) return NextResponse.json({ ok: false, error: "Agência não encontrada." }, { status: 404 });

  if (agencia.clientesContratados != null) {
    const ativas = await db.query.contasCliente.findMany({ where: eq(contasCliente.agenciaId, sessao.agenciaId), columns: { id: true } });
    if (ativas.length >= agencia.clientesContratados) {
      return NextResponse.json(
        {
          ok: false,
          error: `Seu plano cobre ${agencia.clientesContratados} cliente(s) e todos já estão ativos. Fale com a Dattis pra incluir mais clientes.`,
        },
        { status: 403 },
      );
    }
  }

  const [conta] = await db
    .insert(contasCliente)
    .values({
      agenciaId: sessao.agenciaId,
      nome,
      cnpj,
      contatoNome,
      contatoEmail,
      flowCapi: flows.includes("capi"),
      flowAds: flows.includes("ads"),
      flowWhatsapp: flows.includes("whatsapp"),
      flowCrm: flows.includes("crm"),
      crmNome,
    })
    .returning();

  // RAT: uma atividade por flow marcado
  if (flows.length > 0) {
    await db.insert(atividadesTratamento).values(
      flows.map((f) => ({
        agenciaId: sessao.agenciaId,
        contaClienteId: conta.id,
        nomeAtividade: FLOW_TEMPLATES[f].nomeAtividade,
        categoriasDado: FLOW_TEMPLATES[f].categoriasDado,
        finalidade: FLOW_TEMPLATES[f].finalidade,
        baseLegal: FLOW_TEMPLATES[f].baseLegal,
        titulares: FLOW_TEMPLATES[f].titulares,
        prazoRetencao: FLOW_TEMPLATES[f].prazoRetencao,
      }))
    );
  }

  // Subprocessadores: herdados do catálogo por flow, exceto CRM (que pode ser customizado)
  const chavesCatalogo = flows
    .filter((f) => f !== "crm")
    .map((f) => FLOW_TEMPLATES[f].subprocessadorChave)
    .filter((c): c is string => !!c);

  const catalogoEncontrado = chavesCatalogo.length
    ? await db.query.subprocessadoresCatalogo.findMany({
        where: inArray(subprocessadoresCatalogo.chave, chavesCatalogo),
      })
    : [];

  const novosSubprocessadores: {
    contaClienteId: string;
    subprocessadorCatalogoId: string | null;
    nomeCustomizado: string | null;
    finalidade: string;
  }[] = catalogoEncontrado.map((c) => ({
    contaClienteId: conta.id,
    subprocessadorCatalogoId: c.id,
    nomeCustomizado: null,
    finalidade: c.finalidadePadrao,
  }));

  if (flows.includes("crm")) {
    if (crmNome) {
      novosSubprocessadores.push({
        contaClienteId: conta.id,
        subprocessadorCatalogoId: null,
        nomeCustomizado: crmNome,
        finalidade: FLOW_TEMPLATES.crm.finalidade,
      });
    } else {
      const rdStation = await db.query.subprocessadoresCatalogo.findFirst({
        where: eq(subprocessadoresCatalogo.chave, "rd-station"),
      });
      if (rdStation) {
        novosSubprocessadores.push({
          contaClienteId: conta.id,
          subprocessadorCatalogoId: rdStation.id,
          nomeCustomizado: null,
          finalidade: rdStation.finalidadePadrao,
        });
      }
    }
  }

  if (novosSubprocessadores.length > 0) {
    await db.insert(contaSubprocessadores).values(novosSubprocessadores);
  }

  const nomesParaDpa = [
    ...catalogoEncontrado.map((c) => c.nome),
    ...(flows.includes("crm") ? [crmNome ?? "RD Station"] : []),
  ];

  const conteudoSnapshot = gerarConteudoDpa({
    agenciaNome: agencia.nome,
    contaNome: nome,
    contaCnpj: cnpj,
    subprocessadores: nomesParaDpa,
  });

  const [dpa] = await db
    .insert(dpas)
    .values({
      agenciaId: sessao.agenciaId,
      contaClienteId: conta.id,
      conteudoSnapshot,
    })
    .returning();

  return NextResponse.json({ ok: true, conta, dpaId: dpa.id });
}
