import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, registros, usuarios } from "@/lib/db/schema";
import type { Sessao } from "@/lib/auth";

/** Quem está logado, em nome legível: a pessoa da equipe ou o dono (responsável da agência). */
export async function autorDaSessao(s: Sessao) {
  if (s.operador) return { nome: `${s.operador} (DPO Dattis)`, email: null, usuarioId: null };
  if (s.usuarioId) {
    const u = await db.query.usuarios.findFirst({ where: eq(usuarios.id, s.usuarioId), columns: { nome: true, email: true } });
    if (u) return { nome: u.nome, email: u.email, usuarioId: s.usuarioId };
  }
  const a = await db.query.agencias.findFirst({ where: eq(agencias.id, s.agenciaId), columns: { nome: true, email: true, responsavelNome: true } });
  return { nome: a?.responsavelNome || a?.nome || "Dono da conta", email: a?.email ?? null, usuarioId: null };
}

/**
 * Registra uma ação na conta da agência (quem fez o quê e quando). Nunca derruba a ação principal.
 * Ex.: registrar(sessao, "Assinou o contrato", "Loja Aurora · versão 2").
 */
export async function registrar(s: Sessao, acao: string, detalhe?: string | null) {
  try {
    const autor = await autorDaSessao(s);
    await db.insert(registros).values({
      agenciaId: s.agenciaId,
      usuarioId: autor.usuarioId,
      autorNome: autor.nome,
      autorEmail: autor.email,
      acao: acao.slice(0, 120),
      detalhe: detalhe ? detalhe.slice(0, 300) : null,
    });
  } catch (e) {
    console.error("[registro]", e);
  }
}

export async function ultimosRegistros(agenciaId: string, limite = 50) {
  return db.query.registros.findMany({ where: eq(registros.agenciaId, agenciaId), orderBy: desc(registros.criadoEm), limit: limite });
}
