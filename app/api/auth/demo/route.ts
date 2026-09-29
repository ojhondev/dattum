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
import { hashSenha, criarSessao } from "@/lib/auth";
import { FLOW_TEMPLATES, gerarConteudoDpa, type FlowKey } from "@/lib/rat-templates";

export const runtime = "nodejs";

const DEMO_EMAIL = "demo@dattis.com.br";
const DEMO_NOME = "Agência Demo Dattis";

const CONTAS_DEMO: { nome: string; cnpj: string; flows: FlowKey[]; assinado: boolean }[] = [
  { nome: "Loja Aurora (demo)", cnpj: "12.345.678/0001-90", flows: ["capi", "ads", "whatsapp"], assinado: true },
  { nome: "Studio Nova (demo)", cnpj: "98.765.432/0001-10", flows: ["ads", "crm"], assinado: false },
];

async function criarContaDemo(
  agenciaId: string,
  agenciaNome: string,
  def: (typeof CONTAS_DEMO)[number]
) {
  const [conta] = await db
    .insert(contasCliente)
    .values({
      agenciaId,
      nome: def.nome,
      cnpj: def.cnpj,
      flowCapi: def.flows.includes("capi"),
      flowAds: def.flows.includes("ads"),
      flowWhatsapp: def.flows.includes("whatsapp"),
      flowCrm: def.flows.includes("crm"),
    })
    .returning();

  await db.insert(atividadesTratamento).values(
    def.flows.map((f) => ({
      agenciaId,
      contaClienteId: conta.id,
      nomeAtividade: FLOW_TEMPLATES[f].nomeAtividade,
      categoriasDado: FLOW_TEMPLATES[f].categoriasDado,
      finalidade: FLOW_TEMPLATES[f].finalidade,
      baseLegal: FLOW_TEMPLATES[f].baseLegal,
      titulares: FLOW_TEMPLATES[f].titulares,
      prazoRetencao: FLOW_TEMPLATES[f].prazoRetencao,
    }))
  );

  const chavesCatalogo = def.flows
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

  if (def.flows.includes("crm")) {
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

  if (novosSubprocessadores.length > 0) {
    await db.insert(contaSubprocessadores).values(novosSubprocessadores);
  }

  const nomesParaDpa = catalogoEncontrado
    .map((c) => c.nome)
    .concat(def.flows.includes("crm") ? ["RD Station"] : []);

  const conteudoSnapshot = gerarConteudoDpa({
    agenciaNome,
    contaNome: def.nome,
    contaCnpj: def.cnpj,
    subprocessadores: nomesParaDpa,
  });

  await db.insert(dpas).values({
    agenciaId,
    contaClienteId: conta.id,
    conteudoSnapshot,
    status: def.assinado ? "assinado" : "rascunho",
    assinanteNome: def.assinado ? "Ana Souza" : null,
    assinanteCargo: def.assinado ? "Sócia-diretora" : null,
    assinadoEm: def.assinado ? new Date() : null,
    assinadoIp: def.assinado ? "203.0.113.10" : null,
  });
}

export async function GET(req: Request) {
  let agencia = await db.query.agencias.findFirst({ where: eq(agencias.email, DEMO_EMAIL) });

  if (!agencia) {
    const senhaHash = await hashSenha(crypto.randomUUID());
    const [novaAgencia] = await db
      .insert(agencias)
      .values({ nome: DEMO_NOME, email: DEMO_EMAIL, senhaHash })
      .returning();
    agencia = novaAgencia;

    for (const def of CONTAS_DEMO) {
      await criarContaDemo(agencia.id, agencia.nome, def);
    }
  }

  await criarSessao(agencia.id);

  return NextResponse.redirect(new URL("/painel", req.url));
}
