import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

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

export async function criarSessao(agenciaId: string) {
  const token = await new SignJWT({ agenciaId })
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

export async function getSessao(): Promise<{ agenciaId: string } | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.agenciaId !== "string") return null;
    return { agenciaId: payload.agenciaId };
  } catch {
    return null;
  }
}

export async function destruirSessao() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
