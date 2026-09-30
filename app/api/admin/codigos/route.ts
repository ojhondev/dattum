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
  const clientes = Number.isInteger(body?.clientes) && body.clientes >= 1 && body.clientes <= 1000 ? (body.clientes as number) : null;

  if (!clienteNome || !plano || !clientes) {
    return NextResponse.json({ ok: false, error: "Informe o nome do cliente, o plano e a quantidade de clientes." }, { status: 400 });
  }

  const [codigo] = await db
    .insert(codigosAtivacao)
    .values({ codigo: gerarCodigo("ATV"), clienteNome, clienteContato, plano, clientes })
    .returning();

  return NextResponse.json({ ok: true, codigo });
}
