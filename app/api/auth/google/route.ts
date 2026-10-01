import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  GOOGLE_CODIGO_COOKIE,
  GOOGLE_NEXT_COOKIE,
  GOOGLE_STATE_COOKIE,
  GOOGLE_VERIFIER_COOKIE,
  googleConfigurado,
  googleRedirectUri,
  novoState,
  novoVerifier,
  urlLoginGoogle,
} from "@/lib/oauth-google";

export const dynamic = "force-dynamic";

const proximoSeguro = (next: string | null) =>
  next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/painel";

// Inicia o login com Google. ?codigo=ATV-... ativa uma conta nova; sem código, só entra numa conta existente.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const codigo = (url.searchParams.get("codigo") ?? "").trim().toUpperCase();
  const voltar = codigo ? `/cadastro?codigo=${encodeURIComponent(codigo)}&` : "/entrar?";

  if (codigo && url.searchParams.get("aceite") !== "1") return NextResponse.redirect(new URL(`${voltar}erro=termos`, url.origin));
  if (!googleConfigurado()) return NextResponse.redirect(new URL(`${voltar}erro=google_indisponivel`, url.origin));

  const state = novoState();
  const verifier = novoVerifier();
  const store = await cookies();
  const opts = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 600 };
  store.set(GOOGLE_STATE_COOKIE, state, opts);
  store.set(GOOGLE_VERIFIER_COOKIE, verifier, opts);
  store.set(GOOGLE_NEXT_COOKIE, proximoSeguro(url.searchParams.get("proximo")), opts);
  if (codigo) store.set(GOOGLE_CODIGO_COOKIE, codigo.slice(0, 40), opts);
  else store.set(GOOGLE_CODIGO_COOKIE, "", { ...opts, maxAge: 0 });

  return NextResponse.redirect(urlLoginGoogle(state, verifier, googleRedirectUri(url.origin)));
}
