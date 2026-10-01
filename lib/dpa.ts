import { createHash, randomBytes } from "node:crypto";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, contaSubprocessadores, contasCliente, dpas, subprocessadoresCatalogo } from "@/lib/db/schema";
import { gerarConteudoDpa } from "@/lib/rat-templates";

export type Dpa = typeof dpas.$inferSelect;

/** Situação do contrato: só fica "assinado" quando agência E cliente assinaram. */
export type SituacaoDpa = "rascunho" | "aguarda_cliente" | "aguarda_agencia" | "assinado";

export function situacaoDpa(d: Pick<Dpa, "assinadoEm" | "clienteAssinadoEm">): SituacaoDpa {
  if (d.assinadoEm && d.clienteAssinadoEm) return "assinado";
  if (d.assinadoEm) return "aguarda_cliente";
  if (d.clienteAssinadoEm) return "aguarda_agencia";
  return "rascunho";
}

export const ROTULO_SITUACAO: Record<SituacaoDpa, string> = {
  rascunho: "Ninguém assinou ainda",
  aguarda_cliente: "Falta o cliente assinar",
  aguarda_agencia: "Falta a agência assinar",
  assinado: "Assinado pelas duas partes",
};

/** Data em que o contrato ficou completo (a última das duas assinaturas). */
export const dataAssinaturaCompleta = (d: Pick<Dpa, "assinadoEm" | "clienteAssinadoEm">) =>
  d.assinadoEm && d.clienteAssinadoEm ? new Date(Math.max(d.assinadoEm.getTime(), d.clienteAssinadoEm.getTime())) : null;

export const hashTexto = (texto: string) => createHash("sha256").update(texto, "utf8").digest("hex");

/** Token público de alta entropia (link de assinatura e link do DAT). */
export const novoToken = () => randomBytes(24).toString("base64url");

export const filtroVigente = isNull(dpas.substituidoEm);

export async function dpaVigente(contaId: string) {
  return db.query.dpas.findFirst({
    where: and(eq(dpas.contaClienteId, contaId), filtroVigente),
    orderBy: desc(dpas.versao),
  });
}

export async function versoesAnteriores(contaId: string) {
  return db.query.dpas.findMany({
    where: eq(dpas.contaClienteId, contaId),
    orderBy: desc(dpas.versao),
  });
}

export function ipDe(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "desconhecido";
}

export const userAgentDe = (req: Request) => (req.headers.get("user-agent") ?? "").slice(0, 400) || null;

type Assinante = { nome: string; cargo: string; ip: string; userAgent: string | null };

/** Grava uma assinatura (agência ou cliente). Congela o texto pelo hash na primeira assinatura. */
export async function registrarAssinatura(dpa: Dpa, parte: "agencia" | "cliente", a: Assinante & { email?: string | null }) {
  const agora = new Date();
  const campos =
    parte === "agencia"
      ? { assinanteNome: a.nome, assinanteCargo: a.cargo, assinadoEm: agora, assinadoIp: a.ip, assinadoUserAgent: a.userAgent }
      : { clienteNome: a.nome, clienteCargo: a.cargo, clienteEmail: a.email ?? null, clienteAssinadoEm: agora, clienteIp: a.ip, clienteUserAgent: a.userAgent };
  const depois = { ...dpa, ...campos };
  const completo = situacaoDpa(depois) === "assinado";

  const [atualizado] = await db
    .update(dpas)
    .set({ ...campos, hashConteudo: dpa.hashConteudo ?? hashTexto(dpa.conteudoSnapshot), status: completo ? "assinado" : "rascunho" })
    .where(and(eq(dpas.id, dpa.id), filtroVigente, parte === "agencia" ? isNull(dpas.assinadoEm) : isNull(dpas.clienteAssinadoEm)))
    .returning();
  return atualizado ?? null;
}

/** Monta o texto do contrato com os dados atuais da conta, da agência e das ferramentas. */
export async function textoAtualDoDpa(contaId: string) {
  const conta = await db.query.contasCliente.findFirst({ where: eq(contasCliente.id, contaId) });
  if (!conta) return null;
  const [agencia, subs] = await Promise.all([
    db.query.agencias.findFirst({ where: eq(agencias.id, conta.agenciaId) }),
    db
      .select({ nome: contaSubprocessadores.nomeCustomizado, catalogo: subprocessadoresCatalogo.nome })
      .from(contaSubprocessadores)
      .leftJoin(subprocessadoresCatalogo, eq(contaSubprocessadores.subprocessadorCatalogoId, subprocessadoresCatalogo.id))
      .where(and(eq(contaSubprocessadores.contaClienteId, contaId), eq(contaSubprocessadores.ativo, true))),
  ]);
  return gerarConteudoDpa({
    agenciaNome: agencia?.nome ?? "",
    agenciaCnpj: agencia?.cnpj ?? null,
    contaNome: conta.nome,
    contaCnpj: conta.cnpj,
    subprocessadores: subs.map((s) => s.catalogo ?? s.nome ?? "").filter(Boolean),
  });
}

/**
 * Atualiza o contrato depois de mudar a conta. Sem nenhuma assinatura, reescreve o rascunho.
 * Já assinado (por qualquer parte) e com texto diferente: guarda a versão antiga e abre uma nova,
 * que precisa ser assinada de novo — a não ser que `novaVersaoSeAssinado` seja false.
 */
export async function atualizarDpaDaConta(contaId: string, opts: { novaVersaoSeAssinado: boolean }) {
  const [texto, atual] = await Promise.all([textoAtualDoDpa(contaId), dpaVigente(contaId)]);
  if (!texto) return { acao: "nenhuma" as const };
  const conta = await db.query.contasCliente.findFirst({ where: eq(contasCliente.id, contaId) });
  if (!conta) return { acao: "nenhuma" as const };

  if (!atual) {
    const [novo] = await db.insert(dpas).values({ agenciaId: conta.agenciaId, contaClienteId: contaId, conteudoSnapshot: texto }).returning();
    return { acao: "nova_versao" as const, dpa: novo };
  }
  if (atual.conteudoSnapshot === texto) return { acao: "nenhuma" as const, dpa: atual };

  if (!atual.assinadoEm && !atual.clienteAssinadoEm) {
    const [dpa] = await db.update(dpas).set({ conteudoSnapshot: texto }).where(eq(dpas.id, atual.id)).returning();
    return { acao: "atualizado" as const, dpa };
  }
  if (!opts.novaVersaoSeAssinado) return { acao: "nenhuma" as const, dpa: atual };

  await db.update(dpas).set({ substituidoEm: new Date(), tokenAssinatura: null }).where(eq(dpas.id, atual.id));
  const [novo] = await db
    .insert(dpas)
    .values({ agenciaId: conta.agenciaId, contaClienteId: contaId, conteudoSnapshot: texto, versao: atual.versao + 1 })
    .returning();
  return { acao: "nova_versao" as const, dpa: novo };
}

/** Rascunhos de todas as contas da agência refletem o nome/CNPJ novos (contratos assinados não mudam). */
export async function atualizarRascunhosDaAgencia(agenciaId: string) {
  const contas = await db.select({ id: contasCliente.id }).from(contasCliente).where(eq(contasCliente.agenciaId, agenciaId));
  for (const c of contas) await atualizarDpaDaConta(c.id, { novaVersaoSeAssinado: false });
}

/** Mapa conta → contrato vigente, para listas e indicadores. */
export async function dpasVigentesPorConta(contaIds: string[]) {
  if (!contaIds.length) return new Map<string, Dpa>();
  const rows = await db.query.dpas.findMany({ where: and(inArray(dpas.contaClienteId, contaIds), filtroVigente) });
  return new Map(rows.map((d) => [d.contaClienteId, d]));
}
