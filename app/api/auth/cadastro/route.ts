import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, codigosAtivacao } from "@/lib/db/schema";
import { hashSenha, criarSessao } from "@/lib/auth";

export const runtime = "nodejs";

const CODIGO_INVALIDO =
  "Código de ativação inválido ou já usado. Ele é enviado pela equipe Dattis depois da confirmação do pagamento.";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const nome = typeof body?.nome === "string" ? body.nome.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const senha = typeof body?.senha === "string" ? body.senha : "";
  const codigo = typeof body?.codigo === "string" ? body.codigo.trim().toUpperCase() : "";

  if (!codigo) return NextResponse.json({ ok: false, error: CODIGO_INVALIDO }, { status: 403 });

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

  // Reserva o código de forma atômica: só um cadastro consegue marcar como usado.
  const [reservado] = await db
    .update(codigosAtivacao)
    .set({ usadoEm: new Date() })
    .where(and(eq(codigosAtivacao.codigo, codigo), isNull(codigosAtivacao.usadoEm), eq(codigosAtivacao.revogado, false)))
    .returning();
  if (!reservado) return NextResponse.json({ ok: false, error: CODIGO_INVALIDO }, { status: 403 });

  try {
    const senhaHash = await hashSenha(senha);
    const [agencia] = await db
      .insert(agencias)
      .values({ nome, email, senhaHash, plano: reservado.plano })
      .returning();
    await db.update(codigosAtivacao).set({ agenciaId: agencia.id }).where(eq(codigosAtivacao.id, reservado.id));
    await criarSessao(agencia.id);
  } catch {
    await db.update(codigosAtivacao).set({ usadoEm: null }).where(eq(codigosAtivacao.id, reservado.id));
    return NextResponse.json({ ok: false, error: "Não foi possível criar a conta agora. Tenta de novo." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
