import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { criarSessao } from "@/lib/auth";
import { limitarIp, respostaLimite } from "@/lib/limite";
import { criarAgencia, CODIGO_INVALIDO, normalizarWhatsapp, TERMOS_NAO_ACEITOS } from "@/lib/ativacao";
import { EMAIL_VALIDO, problemaNaSenha } from "@/lib/validacao";
import { problemaNoCelular } from "@/lib/telefone";

export const runtime = "nodejs";

/** Cadastro pelo site. O código de ativação é opcional: sem ele, a conta nasce em exploração (ver criarAgencia). */
export async function POST(req: Request) {
  if (await limitarIp(req, "cadastro", 10, 3600)) return respostaLimite(60);
  const body = await req.json().catch(() => null);
  const nome = typeof body?.nome === "string" ? body.nome.trim().slice(0, 120) : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 160) : "";
  const senha = typeof body?.senha === "string" ? body.senha : "";
  const codigo = typeof body?.codigo === "string" ? body.codigo.trim().toUpperCase().slice(0, 40) : "";
  const whatsapp = normalizarWhatsapp(body?.whatsapp);

  if (body?.aceite !== true) return NextResponse.json({ ok: false, error: TERMOS_NAO_ACEITOS }, { status: 400 });
  if (!nome || !EMAIL_VALIDO.test(email) || problemaNaSenha(senha)) {
    return NextResponse.json(
      { ok: false, error: problemaNaSenha(senha) ?? "Preencha o nome da agência e um e-mail válido." },
      { status: 400 }
    );
  }
  // Sem código, o WhatsApp é como a Dattis fala com quem acabou de se cadastrar.
  if (!codigo && !whatsapp) {
    const erro = problemaNoCelular(typeof body?.whatsapp === "string" ? body.whatsapp : "") ?? "Informe um WhatsApp com DDD.";
    return NextResponse.json({ ok: false, error: erro }, { status: 400 });
  }

  const existente = await db.query.agencias.findFirst({ where: eq(agencias.email, email) });
  if (existente) {
    return NextResponse.json(
      { ok: false, error: "Já existe uma conta com esse e-mail. Tenta entrar." },
      { status: 409 }
    );
  }

  const r = await criarAgencia({ codigo, nome, email, senha, whatsapp, aceitouTermos: true });
  if (!r.ok) return NextResponse.json({ ok: false, error: r.erro }, { status: r.erro === CODIGO_INVALIDO ? 403 : 500 });

  await criarSessao(r.agencia.id);
  return NextResponse.json({ ok: true });
}
