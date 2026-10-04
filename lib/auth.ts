import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, usuarios } from "@/lib/db/schema";
import { isAdmin } from "@/lib/admin";

const COOKIE_NAME = "dattis_session";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dattis-dev-secret-troque-em-producao"
);

export async function hashSenha(senha: string) {
  return bcrypt.hash(senha, 10);
}

export async function verificarSenha(senha: string, hash: string) {
  return bcrypt.compare(senha, hash);
}

/**
 * Sessão da agência. Sem `usuarioId` é o dono (o login da própria agência); com ele, uma pessoa da equipe.
 * Com `operador`, é o DPO da Dattis operando a conta a pedido da agência (nome de quem opera).
 */
export type Sessao = { agenciaId: string; usuarioId: string | null; operador?: string | null };

/** A Dattis atua como DPO da agência nos planos Growth e Scale; no Start a agência opera sozinha (salvo adicional contratado). */
export const temServicoDpo = (a: { plano: string; servicoDpo: boolean }) => a.plano !== "start" || a.servicoDpo;

/**
 * Sessão do DPO da Dattis dentro da conta de uma agência. Dura 8 horas e só continua valendo enquanto
 * o login de administrador estiver ativo e a agência mantiver o acesso autorizado (ver getSessao).
 */
export async function criarSessaoOperador(agenciaId: string, operador: string) {
  const token = await new SignJWT({ agenciaId, operador })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
  const store = await cookies();
  store.set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
}

export async function criarSessao(agenciaId: string, usuarioId: string | null = null) {
  const token = await new SignJWT(usuarioId ? { agenciaId, usuarioId } : { agenciaId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getSessao(): Promise<Sessao | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.agenciaId !== "string") return null;
    if (typeof payload.operador === "string") {
      // DPO da Dattis: precisa do login de admin ativo e da autorização da agência a cada acesso.
      if (!(await isAdmin())) return null;
      const a = await db.query.agencias.findFirst({ where: eq(agencias.id, payload.agenciaId), columns: { acessoDattis: true, plano: true, servicoDpo: true } });
      if (!a || !a.acessoDattis || !temServicoDpo(a)) return null;
      return { agenciaId: payload.agenciaId, usuarioId: null, operador: payload.operador };
    }
    const usuarioId = typeof payload.usuarioId === "string" ? payload.usuarioId : null;
    if (usuarioId) {
      // Pessoa desativada ou removida perde o acesso na hora, mesmo com o cookie ainda válido.
      const u = await db.query.usuarios.findFirst({
        where: and(eq(usuarios.id, usuarioId), eq(usuarios.agenciaId, payload.agenciaId), eq(usuarios.ativo, true)),
        columns: { id: true },
      });
      if (!u) return null;
    }
    return { agenciaId: payload.agenciaId, usuarioId };
  } catch {
    return null;
  }
}

export const ehDono = (s: Sessao | null) => !!s && !s.usuarioId;

/** O DPO da Dattis operando a conta: age como o dono, mas não mexe em login, senha, equipe nem na própria autorização. */
export const ehOperador = (s: Sessao | null) => !!s?.operador;

export async function destruirSessao() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
