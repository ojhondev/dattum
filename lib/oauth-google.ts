import { createHash, randomBytes } from "node:crypto";
import { SITE_URL } from "@/lib/site";

// Login com Google — OAuth 2.0 + PKCE, sem biblioteca externa (trazido da Patrinu).

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo";

export const GOOGLE_STATE_COOKIE = "dattis_g_state";
export const GOOGLE_VERIFIER_COOKIE = "dattis_g_verifier";
export const GOOGLE_NEXT_COOKIE = "dattis_g_next";
export const GOOGLE_CODIGO_COOKIE = "dattis_g_codigo"; // código de ativação, quando o Google é usado no cadastro
export const GOOGLE_VINCULAR_COOKIE = "dattis_g_vincular"; // "1" quando o dono conecta o Google pela tela de Configurações

export function googleConfigurado(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/** URL de callback registrada no Google Cloud Console. Em dev usa a origem da requisição (localhost). */
export function googleRedirectUri(origem?: string): string {
  const base = (origem && /localhost|127\.0\.0\.1/.test(origem) ? origem : SITE_URL).replace(/\/$/, "");
  return `${base}/api/auth/google/callback`;
}

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const novoState = () => base64url(randomBytes(24));
export const novoVerifier = () => base64url(randomBytes(32));
const challenge = (verifier: string) => base64url(createHash("sha256").update(verifier).digest());

export function urlLoginGoogle(state: string, verifier: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: challenge(verifier),
    code_challenge_method: "S256",
    access_type: "online",
    prompt: "select_account",
  });
  return `${AUTH_ENDPOINT}?${params}`;
}

export type PerfilGoogle = { sub: string; email: string; emailVerificado: boolean; nome: string };

/** Troca o `code` por token e devolve o perfil. Lança em erro. */
export async function trocarCodigoGoogle(code: string, verifier: string, redirectUri: string): Promise<PerfilGoogle> {
  const tokenRes = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code_verifier: verifier,
    }),
  });
  if (!tokenRes.ok) throw new Error(`google token ${tokenRes.status}: ${await tokenRes.text()}`);
  const token = (await tokenRes.json()) as { access_token?: string };
  if (!token.access_token) throw new Error("google token sem access_token");

  const infoRes = await fetch(USERINFO_ENDPOINT, { headers: { Authorization: `Bearer ${token.access_token}` } });
  if (!infoRes.ok) throw new Error(`google userinfo ${infoRes.status}: ${await infoRes.text()}`);
  const info = (await infoRes.json()) as { sub: string; email: string; email_verified?: boolean; name?: string; given_name?: string };

  return {
    sub: info.sub,
    email: info.email.trim().toLowerCase(),
    emailVerificado: info.email_verified === true,
    nome: (info.name || info.given_name || info.email.split("@")[0]).trim(),
  };
}
