import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  GOOGLE_CADASTRO_COOKIE,
  GOOGLE_CODIGO_COOKIE,
  GOOGLE_NEXT_COOKIE,
  GOOGLE_STATE_COOKIE,
  GOOGLE_VERIFIER_COOKIE,
  GOOGLE_VINCULAR_COOKIE,
  googleConfigurado,
  googleRedirectUri,
  novoState,
  novoVerifier,
  urlLoginGoogle,
} from "@/lib/oauth-google";
import { ehDono, ehOperador, getSessao } from "@/lib/auth";
import { EMAIL_DEMO } from "@/lib/admin-dados";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { normalizarWhatsapp } from "@/lib/ativacao";

export const dynamic = "force-dynamic";

const proximoSeguro = (next: string | null) =>
  next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/painel";

// Inicia o login com Google. ?codigo=ATV-... ativa uma conta nova; ?cadastro=1&nome=...&whatsapp=... cria uma conta
// em exploração (sem código); ?vincular=1 conecta o Google à agência logada
// (pela tela de Configurações); sem nada, só entra numa conta existente.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const codigo = (url.searchParams.get("codigo") ?? "").trim().toUpperCase();
  const vincular = url.searchParams.get("vincular") === "1";
  const cadastro = !vincular && !codigo && url.searchParams.get("cadastro") === "1";
  const voltar = vincular
    ? "/painel/configuracoes?google="
    : codigo
      ? `/cadastro?codigo=${encodeURIComponent(codigo)}&erro=`
      : cadastro
        ? "/cadastro?erro="
        : "/entrar?erro=";

  if (vincular) {
    // Conectar o Google é ato do dono da conta, logado: nem a equipe, nem o DPO da Dattis, nem a demo.
    const sessao = await getSessao();
    if (!sessao) return NextResponse.redirect(new URL("/entrar?proximo=/painel/configuracoes", url.origin));
    const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId), columns: { email: true } });
    if (!ehDono(sessao) || ehOperador(sessao) || agencia?.email === EMAIL_DEMO) return NextResponse.redirect(new URL(`${voltar}sem_permissao`, url.origin));
  }

  if ((codigo || cadastro) && !vincular && url.searchParams.get("aceite") !== "1") return NextResponse.redirect(new URL(`${voltar}termos`, url.origin));
  const nome = (url.searchParams.get("nome") ?? "").trim().slice(0, 120);
  const whatsapp = normalizarWhatsapp(url.searchParams.get("whatsapp"));
  if (cadastro && (!nome || !whatsapp)) return NextResponse.redirect(new URL(`${voltar}dados_cadastro`, url.origin));
  if (!googleConfigurado()) return NextResponse.redirect(new URL(`${voltar}google_indisponivel`, url.origin));

  const state = novoState();
  const verifier = novoVerifier();
  const store = await cookies();
  const opts = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 600 };
  store.set(GOOGLE_STATE_COOKIE, state, opts);
  store.set(GOOGLE_VERIFIER_COOKIE, verifier, opts);
  store.set(GOOGLE_NEXT_COOKIE, vincular ? "/painel/configuracoes" : proximoSeguro(url.searchParams.get("proximo")), opts);
  if (codigo && !vincular) store.set(GOOGLE_CODIGO_COOKIE, codigo.slice(0, 40), opts);
  else store.set(GOOGLE_CODIGO_COOKIE, "", { ...opts, maxAge: 0 });
  if (vincular) store.set(GOOGLE_VINCULAR_COOKIE, "1", opts);
  else store.set(GOOGLE_VINCULAR_COOKIE, "", { ...opts, maxAge: 0 });
  if (cadastro) store.set(GOOGLE_CADASTRO_COOKIE, JSON.stringify({ nome, whatsapp }), opts);
  else store.set(GOOGLE_CADASTRO_COOKIE, "", { ...opts, maxAge: 0 });

  return NextResponse.redirect(urlLoginGoogle(state, verifier, googleRedirectUri(url.origin)));
}
