import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { criarSessao } from "@/lib/auth";
import { limitarIp, respostaLimite } from "@/lib/limite";
import { ativarAgencia, CODIGO_INVALIDO, TERMOS_NAO_ACEITOS } from "@/lib/ativacao";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (await limitarIp(req, "cadastro", 10, 3600)) return respostaLimite(60);
  const body = await req.json().catch(() => null);
  const nome = typeof body?.nome === "string" ? body.nome.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const senha = typeof body?.senha === "string" ? body.senha : "";
  const codigo = typeof body?.codigo === "string" ? body.codigo.trim().toUpperCase() : "";

  if (!codigo) return NextResponse.json({ ok: false, error: CODIGO_INVALIDO }, { status: 403 });
  if (body?.aceite !== true) return NextResponse.json({ ok: false, error: TERMOS_NAO_ACEITOS }, { status: 400 });

  if (!nome || !email || senha.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Preencha nome, e-mail e uma senha com pelo menos 8 caracteres." },
      { status: 400 }
    );
  }

  const existente = await db.query.agencias.findFirst({ where: eq(agencias.email, email) });
  if (existente) {
    return NextResponse.json(
      { ok: false, error: "Já existe uma conta com esse e-mail. Tenta entrar." },
      { status: 409 }
    );
  }

  const r = await ativarAgencia({ codigo, nome, email, senha, aceitouTermos: true });
  if (!r.ok) return NextResponse.json({ ok: false, error: r.erro }, { status: r.erro === CODIGO_INVALIDO ? 403 : 500 });

  await criarSessao(r.agencia.id);
  return NextResponse.json({ ok: true });
}
