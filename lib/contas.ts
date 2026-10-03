import { and, eq, inArray, isNull, or } from "drizzle-orm";
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
import { atualizarDpaDaConta, hashTexto } from "@/lib/dpa";

export const CHAVES_FLUXO = FLUXOS.map((f) => f.key);

/** Catálogo que a agência pode usar: o da Dattis (agencia_id nulo) mais as ferramentas que ela cadastrou. */
const visivelPara = (agenciaId: string) => or(isNull(subprocessadoresCatalogo.agenciaId), eq(subprocessadoresCatalogo.agenciaId, agenciaId));

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
  agenciaCnpj?: string | null;
  nome: string;
  cnpj?: string | null;
  contatoNome?: string | null;
  contatoEmail?: string | null;
  contatoWhatsapp?: string | null;
  site?: string | null;
  crmNome?: string | null;
  flows: FlowKey[];
  /** Ferramentas escolhidas pela agência no seletor (chaves do catálogo), além das que vêm das operações. */
  ferramentas?: string[];
  /** Ferramentas fora do catálogo, pelo nome. */
  ferramentasPersonalizadas?: string[];
  /** Só para a demonstração: contrato já assinado pelas duas partes. */
  assinatura?: { agencia: { nome: string; cargo: string }; cliente: { nome: string; cargo: string; email: string }; ip: string };
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
      contatoWhatsapp: params.contatoWhatsapp ?? null,
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
          fluxo: f,
        };
      }),
    );
  }

  const chaves = [...new Set(flows.flatMap((f) => FLOW_TEMPLATES[f].subprocessadorChaves))];
  if (tem("crm") && !crmNome) chaves.push("rd-station");

  const catalogo = chaves.length
    ? await db.query.subprocessadoresCatalogo.findMany({ where: and(inArray(subprocessadoresCatalogo.chave, chaves), isNull(subprocessadoresCatalogo.agenciaId)) })
    : [];

  const doFluxo = new Set(catalogo.map((c) => c.chave));
  const extrasChaves = [...new Set(params.ferramentas ?? [])].filter((k) => !doFluxo.has(k));
  const extras = extrasChaves.length
    ? await db.query.subprocessadoresCatalogo.findMany({ where: and(inArray(subprocessadoresCatalogo.chave, extrasChaves), visivelPara(agenciaId)) })
    : [];
  const personalizadas = [...new Set((params.ferramentasPersonalizadas ?? []).map((n) => n.trim()).filter(Boolean))].filter(
    (n) => !(tem("crm") && crmNome === n),
  );

  const subs = [
    ...catalogo.map((c) => ({ subprocessadorCatalogoId: c.id as string | null, nomeCustomizado: null as string | null, finalidade: c.finalidadePadrao, origem: "fluxo" })),
    ...extras.map((c) => ({ subprocessadorCatalogoId: c.id as string | null, nomeCustomizado: null as string | null, finalidade: c.finalidadePadrao, origem: "manual" })),
    ...(tem("crm") && crmNome ? [{ subprocessadorCatalogoId: null, nomeCustomizado: crmNome, finalidade: FLOW_TEMPLATES.crm.finalidade, origem: "fluxo" }] : []),
    ...personalizadas.map((n) => ({ subprocessadorCatalogoId: null, nomeCustomizado: n, finalidade: FINALIDADE_PERSONALIZADA, origem: "manual" })),
  ].map((s) => ({ ...s, contaClienteId: conta.id }));
  if (subs.length > 0) await db.insert(contaSubprocessadores).values(subs);

  const conteudoSnapshot = gerarConteudoDpa({
    agenciaNome,
    agenciaCnpj: params.agenciaCnpj ?? null,
    contaNome: nome,
    contaCnpj: params.cnpj ?? null,
    subprocessadores: [...catalogo.map((c) => c.nome), ...extras.map((c) => c.nome), ...(tem("crm") && crmNome ? [crmNome] : []), ...personalizadas],
  });

  const a = params.assinatura;
  const agora = a ? new Date() : null;
  const [dpa] = await db
    .insert(dpas)
    .values({
      agenciaId,
      contaClienteId: conta.id,
      conteudoSnapshot,
      status: a ? "assinado" : "rascunho",
      hashConteudo: a ? hashTexto(conteudoSnapshot) : null,
      assinanteNome: a?.agencia.nome ?? null,
      assinanteCargo: a?.agencia.cargo ?? null,
      assinadoEm: agora,
      assinadoIp: a?.ip ?? null,
      clienteNome: a?.cliente.nome ?? null,
      clienteCargo: a?.cliente.cargo ?? null,
      clienteEmail: a?.cliente.email ?? null,
      clienteAssinadoEm: agora,
      clienteIp: a?.ip ?? null,
    })
    .returning();

  return { conta, dpa };
}

export async function contaDaAgencia(id: string, agenciaId: string) {
  const conta = await db.query.contasCliente.findFirst({ where: eq(contasCliente.id, id) });
  return conta && conta.agenciaId === agenciaId ? conta : null;
}

export type EdicaoConta = {
  nome?: string;
  cnpj?: string | null;
  contatoNome?: string | null;
  contatoEmail?: string | null;
  contatoWhatsapp?: string | null;
  site?: string | null;
  crmNome?: string | null;
  flows?: FlowKey[];
};

const COLUNA_FLUXO: Record<FlowKey, "flowPublicos" | "flowCapi" | "flowAds" | "flowFormularios" | "flowWhatsapp" | "flowCrm"> = {
  publicos: "flowPublicos",
  capi: "flowCapi",
  ads: "flowAds",
  formularios: "flowFormularios",
  whatsapp: "flowWhatsapp",
  crm: "flowCrm",
};

/**
 * Edita a conta e mantém a documentação coerente: atividades de RAT e ferramentas acompanham
 * as operações marcadas, e o contrato é refeito (nova versão, se já tinha assinatura).
 */
export async function editarConta(contaId: string, agenciaId: string, e: EdicaoConta) {
  const conta = await contaDaAgencia(contaId, agenciaId);
  if (!conta) return null;

  const set: Partial<typeof contasCliente.$inferInsert> = {};
  if (e.nome !== undefined) set.nome = e.nome;
  if (e.cnpj !== undefined) set.cnpj = e.cnpj;
  if (e.contatoNome !== undefined) set.contatoNome = e.contatoNome;
  if (e.contatoEmail !== undefined) set.contatoEmail = e.contatoEmail;
  if (e.contatoWhatsapp !== undefined) set.contatoWhatsapp = e.contatoWhatsapp;
  if (e.site !== undefined) set.site = e.site;
  if (e.crmNome !== undefined) set.crmNome = e.crmNome;
  if (e.flows) for (const f of CHAVES_FLUXO) set[COLUNA_FLUXO[f]] = e.flows.includes(f);
  const [atual] = Object.keys(set).length
    ? await db.update(contasCliente).set(set).where(eq(contasCliente.id, contaId)).returning()
    : [conta];

  if (e.flows) {
    const antes = CHAVES_FLUXO.filter((f) => conta[COLUNA_FLUXO[f]]);
    const depois = e.flows;
    const saiu = antes.filter((f) => !depois.includes(f));
    const entrou = depois.filter((f) => !antes.includes(f));

    if (saiu.length) {
      await db.delete(atividadesTratamento).where(and(eq(atividadesTratamento.contaClienteId, contaId), inArray(atividadesTratamento.fluxo, saiu)));
    }
    if (entrou.length) {
      await db.insert(atividadesTratamento).values(
        entrou.map((f) => {
          const t = FLOW_TEMPLATES[f];
          return {
            agenciaId,
            contaClienteId: contaId,
            nomeAtividade: t.nomeAtividade,
            categoriasDado: t.categoriasDado,
            finalidade: t.finalidade,
            baseLegal: t.baseLegal,
            titulares: t.titulares,
            prazoRetencao: t.prazoRetencao,
            fluxo: f,
          };
        }),
      );
    }
  }

  if (e.flows || e.crmNome !== undefined) {
    // Ferramentas: as do catálogo seguem as operações; a ferramenta própria é o CRM informado.
    const flows = CHAVES_FLUXO.filter((f) => atual[COLUNA_FLUXO[f]]);
    const crmNome = atual.crmNome;
    const chaves = [...new Set(flows.flatMap((f) => FLOW_TEMPLATES[f].subprocessadorChaves))];
    if (flows.includes("crm") && !crmNome) chaves.push("rd-station");
    const catalogo = chaves.length
      ? await db.query.subprocessadoresCatalogo.findMany({ where: and(inArray(subprocessadoresCatalogo.chave, chaves), isNull(subprocessadoresCatalogo.agenciaId)) })
      : [];
    const existentes = await db.query.contaSubprocessadores.findMany({ where: eq(contaSubprocessadores.contaClienteId, contaId) });

    const querIds = new Set(catalogo.map((c) => c.id));
    // Só sai o que veio das operações; o que a agência escolheu no seletor fica.
    const remover = existentes.filter(
      (s) =>
        s.origem === "fluxo" &&
        (s.subprocessadorCatalogoId ? !querIds.has(s.subprocessadorCatalogoId) : !(flows.includes("crm") && crmNome && s.nomeCustomizado === crmNome)),
    );
    if (remover.length) await db.delete(contaSubprocessadores).where(inArray(contaSubprocessadores.id, remover.map((s) => s.id)));

    const temIds = new Set(existentes.map((s) => s.subprocessadorCatalogoId).filter(Boolean));
    const novos = catalogo
      .filter((c) => !temIds.has(c.id))
      .map((c) => ({ contaClienteId: contaId, subprocessadorCatalogoId: c.id as string | null, nomeCustomizado: null as string | null, finalidade: c.finalidadePadrao }));
    if (flows.includes("crm") && crmNome && !existentes.some((s) => !s.subprocessadorCatalogoId && s.nomeCustomizado === crmNome)) {
      novos.push({ contaClienteId: contaId, subprocessadorCatalogoId: null, nomeCustomizado: crmNome, finalidade: FLOW_TEMPLATES.crm.finalidade });
    }
    if (novos.length) await db.insert(contaSubprocessadores).values(novos);
  }

  const contrato = await atualizarDpaDaConta(contaId, { novaVersaoSeAssinado: true });
  return { conta: atual, contrato: contrato.acao };
}

const FINALIDADE_PERSONALIZADA = "Ferramenta usada pela agência na operação do cliente, informada pela agência.";

/**
 * Grava a seleção do seletor de ferramentas: o que está marcado fica (e entra como escolha da agência),
 * o que foi desmarcado sai, e o contrato é refeito (nova versão se já tinha assinatura).
 */
export async function definirFerramentas(contaId: string, agenciaId: string, chaves: string[], personalizadas: string[]) {
  const conta = await contaDaAgencia(contaId, agenciaId);
  if (!conta) return null;

  const querChaves = [...new Set(chaves)];
  const querNomes = [...new Set(personalizadas.map((n) => n.trim()).filter(Boolean))];
  const [catalogo, existentes] = await Promise.all([
    querChaves.length ? db.query.subprocessadoresCatalogo.findMany({ where: and(inArray(subprocessadoresCatalogo.chave, querChaves), visivelPara(agenciaId)) }) : [],
    db.query.contaSubprocessadores.findMany({ where: eq(contaSubprocessadores.contaClienteId, contaId) }),
  ]);
  const querIds = new Set(catalogo.map((c) => c.id));

  const remover = existentes.filter((s) => (s.subprocessadorCatalogoId ? !querIds.has(s.subprocessadorCatalogoId) : !querNomes.includes(s.nomeCustomizado ?? "")));
  if (remover.length) await db.delete(contaSubprocessadores).where(inArray(contaSubprocessadores.id, remover.map((s) => s.id)));

  const temIds = new Set(existentes.map((s) => s.subprocessadorCatalogoId).filter(Boolean));
  const temNomes = new Set(existentes.filter((s) => !s.subprocessadorCatalogoId).map((s) => s.nomeCustomizado));
  const novos = [
    ...catalogo.filter((c) => !temIds.has(c.id)).map((c) => ({ subprocessadorCatalogoId: c.id as string | null, nomeCustomizado: null as string | null, finalidade: c.finalidadePadrao })),
    ...querNomes.filter((n) => !temNomes.has(n)).map((n) => ({ subprocessadorCatalogoId: null, nomeCustomizado: n, finalidade: FINALIDADE_PERSONALIZADA })),
  ].map((s) => ({ ...s, contaClienteId: contaId, origem: "manual" }));
  if (novos.length) await db.insert(contaSubprocessadores).values(novos);

  const contrato = await atualizarDpaDaConta(contaId, { novaVersaoSeAssinado: true });
  return { conta, adicionadas: novos.length, removidas: remover.length, contrato: contrato.acao };
}
