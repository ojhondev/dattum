import { timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "dattis_admin";
const secret = new TextEncoder().encode(process.env.SESSION_SECRET ?? "dattis-dev-secret-troque-em-producao");

/** Compara com ADMIN_SENHA em tempo constante. Sem a env configurada, ninguém entra. */
export function senhaAdminCorreta(senha: string) {
  const esperada = process.env.ADMIN_SENHA ?? "";
  if (!esperada || !senha) return false;
  const a = Buffer.from(senha);
  const b = Buffer.from(esperada);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function criarSessaoAdmin() {
  const token = await new SignJWT({ papel: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function isAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.papel === "admin";
  } catch {
    return false;
  }
}

export async function encerrarSessaoAdmin() {
  (await cookies()).delete(COOKIE);
}
