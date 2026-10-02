import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { usuarios } from "@/lib/db/schema";

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

/** Sessão da agência. Sem `usuarioId` é o dono (o login da própria agência); com ele, uma pessoa da equipe. */
export type Sessao = { agenciaId: string; usuarioId: string | null };

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

export async function destruirSessao() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
