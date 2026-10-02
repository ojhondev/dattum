import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, usuarios } from "@/lib/db/schema";
import { and } from "drizzle-orm";
import { registrar } from "@/lib/registro";
import { criarSessao } from "@/lib/auth";
import { ativarAgencia } from "@/lib/ativacao";
import {
  GOOGLE_CODIGO_COOKIE,
  GOOGLE_NEXT_COOKIE,
  GOOGLE_STATE_COOKIE,
  GOOGLE_VERIFIER_COOKIE,
  googleRedirectUri,
  trocarCodigoGoogle,
} from "@/lib/oauth-google";

export const dynamic = "force-dynamic";

const TEMPORARIOS = [GOOGLE_STATE_COOKIE, GOOGLE_VERIFIER_COOKIE, GOOGLE_NEXT_COOKIE, GOOGLE_CODIGO_COOKIE];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const store = await cookies();
  const codigo = store.get(GOOGLE_CODIGO_COOKIE)?.value ?? "";
  const limpar = () => TEMPORARIOS.forEach((c) => store.set(c, "", { path: "/", maxAge: 0 }));
  const falhar = (erro: string) => {
    limpar();
    const destino = codigo ? `/cadastro?codigo=${encodeURIComponent(codigo)}&erro=${erro}` : `/entrar?erro=${erro}`;
    return NextResponse.redirect(new URL(destino, url.origin));
  };

  if (url.searchParams.get("error")) return falhar("google_cancelado");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const stateSalvo = store.get(GOOGLE_STATE_COOKIE)?.value;
  const verifier = store.get(GOOGLE_VERIFIER_COOKIE)?.value;
  const proximo = store.get(GOOGLE_NEXT_COOKIE)?.value || "/painel";
  if (!code || !state || !stateSalvo || !verifier || state !== stateSalvo) return falhar("google_sessao");

  let perfil;
  try {
    perfil = await trocarCodigoGoogle(code, verifier, googleRedirectUri(url.origin));
  } catch (err) {
    console.error("[google callback]", err);
    return falhar("google_falhou");
  }
  if (!perfil.emailVerificado) return falhar("google_email");

  // Pessoa da equipe: Google já vinculado ou mesmo e-mail do convite aceito
  const membro =
    (await db.query.usuarios.findFirst({ where: and(eq(usuarios.googleSub, perfil.sub), eq(usuarios.ativo, true)) })) ??
    (await db.query.usuarios.findFirst({ where: and(eq(usuarios.email, perfil.email), eq(usuarios.ativo, true)) }));
  if (membro && membro.senhaHash) {
    await db.update(usuarios).set({ googleSub: membro.googleSub ?? perfil.sub, ultimoAcesso: new Date() }).where(eq(usuarios.id, membro.id));
    await criarSessao(membro.agenciaId, membro.id);
    await registrar({ agenciaId: membro.agenciaId, usuarioId: membro.id }, "Entrou na plataforma", "Com Google");
    limpar();
    return NextResponse.redirect(new URL(proximo, url.origin));
  }

  // 1) Conta já vinculada a este Google  2) conta com o mesmo e-mail (vincula)  3) código de ativação (cria)
  let agencia = await db.query.agencias.findFirst({ where: eq(agencias.googleSub, perfil.sub) });
  if (!agencia) {
    const porEmail = await db.query.agencias.findFirst({ where: eq(agencias.email, perfil.email) });
    if (porEmail) {
      [agencia] = await db.update(agencias).set({ googleSub: perfil.sub }).where(eq(agencias.id, porEmail.id)).returning();
    }
  }
  if (!agencia) {
    if (!codigo) return falhar("google_sem_conta");
    const r = await ativarAgencia({ codigo, nome: "", email: perfil.email, googleSub: perfil.sub, aceitouTermos: true }); // o botão só inicia com o aceite marcado
    if (!r.ok) return falhar("codigo_invalido");
    agencia = r.agencia;
  }

  await criarSessao(agencia.id);
  limpar();
  return NextResponse.redirect(new URL(proximo, url.origin));
}
