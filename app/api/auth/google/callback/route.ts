import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, usuarios } from "@/lib/db/schema";
import { and } from "drizzle-orm";
import { registrar } from "@/lib/registro";
import { criarSessao, ehDono, ehOperador, getSessao } from "@/lib/auth";
import { registrarErro } from "@/lib/erros";
import { criarAgencia, normalizarWhatsapp } from "@/lib/ativacao";
import {
  GOOGLE_CADASTRO_COOKIE,
  GOOGLE_CODIGO_COOKIE,
  GOOGLE_NEXT_COOKIE,
  GOOGLE_STATE_COOKIE,
  GOOGLE_VERIFIER_COOKIE,
  GOOGLE_VINCULAR_COOKIE,
  googleRedirectUri,
  trocarCodigoGoogle,
} from "@/lib/oauth-google";

export const dynamic = "force-dynamic";

const TEMPORARIOS = [GOOGLE_STATE_COOKIE, GOOGLE_VERIFIER_COOKIE, GOOGLE_NEXT_COOKIE, GOOGLE_CODIGO_COOKIE, GOOGLE_VINCULAR_COOKIE, GOOGLE_CADASTRO_COOKIE];

/** Dados do formulário de cadastro guardados no início do login (nome da agência e WhatsApp). */
function lerCadastro(valor: string | undefined) {
  try {
    const d = JSON.parse(valor ?? "");
    const nome = typeof d?.nome === "string" ? d.nome.trim().slice(0, 120) : "";
    const whatsapp = normalizarWhatsapp(d?.whatsapp);
    return nome && whatsapp ? { nome, whatsapp } : null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const store = await cookies();
  const codigo = store.get(GOOGLE_CODIGO_COOKIE)?.value ?? "";
  const vincular = store.get(GOOGLE_VINCULAR_COOKIE)?.value === "1";
  const cadastro = lerCadastro(store.get(GOOGLE_CADASTRO_COOKIE)?.value);
  const limpar = () => TEMPORARIOS.forEach((c) => store.set(c, "", { path: "/", maxAge: 0 }));
  const falhar = (erro: string) => {
    limpar();
    const destino = vincular
      ? `/painel/configuracoes?google=${erro}`
      : codigo
        ? `/cadastro?codigo=${encodeURIComponent(codigo)}&erro=${erro}`
        : cadastro
          ? `/cadastro?erro=${erro}`
          : `/entrar?erro=${erro}`;
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
    // Aparece em /admin/sistema: a resposta do Google diz se é a chave (invalid_client) ou o código (invalid_grant).
    await registrarErro({ tipo: "servidor", mensagem: `Login com Google falhou: ${(err as Error).message}`.slice(0, 500), rota: "/api/auth/google/callback", metodo: "GET" });
    return falhar("google_falhou");
  }
  if (!perfil.emailVerificado) return falhar("google_email");

  // Conectar o Google pela tela de Configurações: vincula esta conta Google à agência logada.
  if (vincular) {
    const sessao = await getSessao();
    if (!sessao || !ehDono(sessao) || ehOperador(sessao)) return falhar("sem_permissao");
    const [outraAgencia, membroComEsse] = await Promise.all([
      db.query.agencias.findFirst({ where: eq(agencias.googleSub, perfil.sub), columns: { id: true } }),
      db.query.usuarios.findFirst({ where: eq(usuarios.googleSub, perfil.sub), columns: { id: true } }),
    ]);
    // Uma conta Google entra em um só lugar: senão o login cairia na agência errada.
    if ((outraAgencia && outraAgencia.id !== sessao.agenciaId) || membroComEsse) return falhar("google_em_uso");
    await db.update(agencias).set({ googleSub: perfil.sub }).where(eq(agencias.id, sessao.agenciaId));
    await registrar(sessao, "Conectou o login com Google", perfil.email);
    limpar();
    return NextResponse.redirect(new URL("/painel/configuracoes?google=conectado", url.origin));
  }

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

  // 1) Conta já vinculada a este Google  2) conta com o mesmo e-mail (vincula)  3) cadastro novo, com código (plano ativo) ou sem (exploração)
  let agencia = await db.query.agencias.findFirst({ where: eq(agencias.googleSub, perfil.sub) });
  if (!agencia) {
    const porEmail = await db.query.agencias.findFirst({ where: eq(agencias.email, perfil.email) });
    if (porEmail) {
      [agencia] = await db.update(agencias).set({ googleSub: perfil.sub }).where(eq(agencias.id, porEmail.id)).returning();
    }
  }
  if (!agencia) {
    if (!codigo && !cadastro) return falhar("google_sem_conta");
    // O botão só inicia com o aceite marcado (ver /api/auth/google).
    const r = await criarAgencia({ codigo, nome: cadastro?.nome ?? "", email: perfil.email, googleSub: perfil.sub, whatsapp: cadastro?.whatsapp, aceitouTermos: true });
    if (!r.ok) return falhar(codigo ? "codigo_invalido" : "cadastro_falhou");
    agencia = r.agencia;
  }

  await criarSessao(agencia.id);
  await registrar({ agenciaId: agencia.id, usuarioId: null }, "Entrou na plataforma", "Com Google");
  limpar();
  return NextResponse.redirect(new URL(proximo, url.origin));
}
