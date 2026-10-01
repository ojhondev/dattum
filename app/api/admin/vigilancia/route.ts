import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { executarVarredura } from "@/lib/vigilancia";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const agenciaId = typeof body?.agenciaId === "string" ? body.agenciaId : undefined;
  const contaId = typeof body?.contaId === "string" ? body.contaId : undefined;
  try {
    const v = await executarVarredura({ origem: "manual", agenciaId, contaId });
    return NextResponse.json({ ok: true, varredura: v });
  } catch {
    return NextResponse.json({ ok: false, error: "A varredura falhou. Veja o registro em Vigilância." }, { status: 500 });
  }
}
