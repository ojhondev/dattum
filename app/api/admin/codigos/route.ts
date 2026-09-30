import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { codigosAtivacao } from "@/lib/db/schema";
import { isAdmin } from "@/lib/admin";
import { gerarCodigo } from "@/lib/certificados";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const clienteNome = typeof body?.clienteNome === "string" ? body.clienteNome.trim() : "";
  const clienteContato = typeof body?.clienteContato === "string" && body.clienteContato.trim() ? body.clienteContato.trim() : null;
  const plano = ["start", "growth", "scale"].includes(body?.plano) ? (body.plano as string) : null;
  const usuarios = Number.isInteger(body?.usuarios) && body.usuarios >= 1 && body.usuarios <= 500 ? (body.usuarios as number) : null;

  if (!clienteNome || !plano || !usuarios) {
    return NextResponse.json({ ok: false, error: "Informe o nome do cliente, o plano e a quantidade de usuários." }, { status: 400 });
  }

  const [codigo] = await db
    .insert(codigosAtivacao)
    .values({ codigo: gerarCodigo("ATV"), clienteNome, clienteContato, plano, usuarios })
    .returning();

  return NextResponse.json({ ok: true, codigo });
}
