import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  contasCliente,
  atividadesTratamento,
  contaSubprocessadores,
  subprocessadoresCatalogo,
  dpas,
} from "@/lib/db/schema";
import { FLOW_TEMPLATES, gerarConteudoDpa } from "@/lib/rat-templates";
import { FLUXOS, type FlowKey } from "@/lib/fluxos";

export const CHAVES_FLUXO = FLUXOS.map((f) => f.key);

/** Normaliza o site informado pra https://host[/caminho], ou null se não for um endereço válido. */
export function normalizarSite(input: unknown): string | null {
  if (typeof input !== "string") return null;
  let raw = input.trim();
  if (!raw) return null;
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  try {
    const u = new URL(raw);
    if (!u.hostname.includes(".")) return null;
    return `${u.protocol}//${u.host}${u.pathname === "/" ? "" : u.pathname}`;
  } catch {
    return null;
  }
}

/**
 * Cria a conta de cliente e já gera o que a LGPD exige: uma atividade de RAT por fluxo,
 * as ferramentas (subprocessadores) herdadas do catálogo e o contrato (DPA) em rascunho.
 */
export async function ativarConta(params: {
  agenciaId: string;
  agenciaNome: string;
  nome: string;
  cnpj?: string | null;
  contatoNome?: string | null;
  contatoEmail?: string | null;
  site?: string | null;
  crmNome?: string | null;
  flows: FlowKey[];
  assinatura?: { nome: string; cargo: string; ip: string };
}) {
  const { agenciaId, agenciaNome, nome, flows } = params;
  const crmNome = params.crmNome ?? null;
  const tem = (f: FlowKey) => flows.includes(f);

  const [conta] = await db
    .insert(contasCliente)
    .values({
      agenciaId,
      nome,
      cnpj: params.cnpj ?? null,
      contatoNome: params.contatoNome ?? null,
      contatoEmail: params.contatoEmail ?? null,
      site: params.site ?? null,
      flowPublicos: tem("publicos"),
      flowCapi: tem("capi"),
      flowAds: tem("ads"),
      flowFormularios: tem("formularios"),
      flowWhatsapp: tem("whatsapp"),
      flowCrm: tem("crm"),
      crmNome,
    })
    .returning();

  if (flows.length > 0) {
    await db.insert(atividadesTratamento).values(
      flows.map((f) => {
        const t = FLOW_TEMPLATES[f];
        return {
          agenciaId,
          contaClienteId: conta.id,
          nomeAtividade: t.nomeAtividade,
          categoriasDado: t.categoriasDado,
          finalidade: t.finalidade,
          baseLegal: t.baseLegal,
          titulares: t.titulares,
          prazoRetencao: t.prazoRetencao,
        };
      }),
    );
  }

  const chaves = [...new Set(flows.flatMap((f) => FLOW_TEMPLATES[f].subprocessadorChaves))];
  if (tem("crm") && !crmNome) chaves.push("rd-station");

  const catalogo = chaves.length
    ? await db.query.subprocessadoresCatalogo.findMany({ where: inArray(subprocessadoresCatalogo.chave, chaves) })
    : [];

  const subs = catalogo.map((c) => ({
    contaClienteId: conta.id,
    subprocessadorCatalogoId: c.id as string | null,
    nomeCustomizado: null as string | null,
    finalidade: c.finalidadePadrao,
  }));
  if (tem("crm") && crmNome) {
    subs.push({ contaClienteId: conta.id, subprocessadorCatalogoId: null, nomeCustomizado: crmNome, finalidade: FLOW_TEMPLATES.crm.finalidade });
  }
  if (subs.length > 0) await db.insert(contaSubprocessadores).values(subs);

  const conteudoSnapshot = gerarConteudoDpa({
    agenciaNome,
    contaNome: nome,
    contaCnpj: params.cnpj ?? null,
    subprocessadores: [...catalogo.map((c) => c.nome), ...(tem("crm") && crmNome ? [crmNome] : [])],
  });

  const a = params.assinatura;
  const [dpa] = await db
    .insert(dpas)
    .values({
      agenciaId,
      contaClienteId: conta.id,
      conteudoSnapshot,
      status: a ? "assinado" : "rascunho",
      assinanteNome: a?.nome ?? null,
      assinanteCargo: a?.cargo ?? null,
      assinadoEm: a ? new Date() : null,
      assinadoIp: a?.ip ?? null,
    })
    .returning();

  return { conta, dpa };
}

export async function contaDaAgencia(id: string, agenciaId: string) {
  const conta = await db.query.contasCliente.findFirst({ where: eq(contasCliente.id, id) });
  return conta && conta.agenciaId === agenciaId ? conta : null;
}
