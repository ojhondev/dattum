import { NextResponse } from "next/server";
import { executarVarredura } from "@/lib/vigilancia";
import { automatizarTodas } from "@/lib/automacao";

export const runtime = "nodejs";
export const maxDuration = 300;

// Disparado todo dia pelo Vercel Cron (vercel.json). A Vercel envia "Authorization: Bearer $CRON_SECRET".
export async function GET(req: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || req.headers.get("authorization") !== `Bearer ${segredo}`) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }
  const certificados = await automatizarTodas();
  const v = await executarVarredura({ origem: "cron" });
  return NextResponse.json({ ok: true, varredura: v, certificados });
}
