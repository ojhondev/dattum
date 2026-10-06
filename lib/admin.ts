import { scryptSync, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "dattis_admin";
import { chaveDe } from "@/lib/segredo";

/** E-mail do login master (WebMaster + Portal do DPO, acesso a todas as agências). */
export const EMAIL_MASTER = (process.env.ADMIN_EMAIL || "dattisprivacy@gmail.com").trim().toLowerCase();

/**
 * Confere e-mail e senha do login master. A senha não fica em lugar nenhum: só o hash scrypt em
 * ADMIN_SENHA_HASH, no formato "salt:hash" (hex). Sem a env configurada, ninguém entra.
 */
export function credenciaisMasterCorretas(email: string, senha: string) {
  const [sal, hash] = (process.env.ADMIN_SENHA_HASH ?? "").split(":");
  if (!sal || !hash || !senha || senha.length > 200) return false;
  const emailOk = email.trim().toLowerCase() === EMAIL_MASTER;
  const calculado = scryptSync(senha, Buffer.from(sal, "hex"), 64);
  const esperado = Buffer.from(hash, "hex");
  const senhaOk = esperado.length === calculado.length && timingSafeEqual(calculado, esperado);
  return emailOk && senhaOk;
}

export async function criarSessaoAdmin() {
  const token = await new SignJWT({ papel: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(chaveDe("admin"));
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
    const { payload } = await jwtVerify(token, chaveDe("admin"));
    return payload.papel === "admin";
  } catch {
    return false;
  }
}

export async function encerrarSessaoAdmin() {
  (await cookies()).delete(COOKIE);
}
