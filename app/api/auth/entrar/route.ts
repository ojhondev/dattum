import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, usuarios } from "@/lib/db/schema";
import { limitarIp, excedeuLimite, respostaLimite } from "@/lib/limite";
import { verificarSenha, criarSessao } from "@/lib/auth";
import { registrar } from "@/lib/registro";
import { EMAIL_MASTER, credenciaisMasterCorretas, criarSessaoAdmin } from "@/lib/admin";

export const runtime = "nodejs";

const ERRO = () => NextResponse.json({ ok: false, error: "E-mail ou senha incorretos." }, { status: 401 });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if ((await limitarIp(req, "entrar", 20, 900)) || (email && (await excedeuLimite(`entrar:email:${email}`, 8, 900)))) return respostaLimite(15);
  const senha = typeof body?.senha === "string" ? body.senha : "";

  if (!email || !senha) {
    return NextResponse.json({ ok: false, error: "Informe e-mail e senha." }, { status: 400 });
  }

  // 0) Login master da Dattis: vai para o painel WebMaster (acesso a todas as agências)
  if (email === EMAIL_MASTER) {
    if (!credenciaisMasterCorretas(email, senha)) return ERRO();
    await criarSessaoAdmin();
    return NextResponse.json({ ok: true, destino: "/admin" });
  }

  // 1) Dono: o login da própria agência
  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.email, email) });
  if (agencia) {
    if (!(await verificarSenha(senha, agencia.senhaHash))) return ERRO();
    await criarSessao(agencia.id);
    await registrar({ agenciaId: agencia.id, usuarioId: null }, "Entrou na plataforma");
    return NextResponse.json({ ok: true });
  }

  // 2) Pessoa da equipe
  const u = await db.query.usuarios.findFirst({ where: and(eq(usuarios.email, email), eq(usuarios.ativo, true)) });
  if (!u?.senhaHash || !(await verificarSenha(senha, u.senhaHash))) return ERRO();
  await db.update(usuarios).set({ ultimoAcesso: new Date() }).where(eq(usuarios.id, u.id));
  await criarSessao(u.agenciaId, u.id);
  await registrar({ agenciaId: u.agenciaId, usuarioId: u.id }, "Entrou na plataforma");
  return NextResponse.json({ ok: true });
}
