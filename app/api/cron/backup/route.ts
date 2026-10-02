import { NextResponse } from "next/server";
import { fazerBackup } from "@/lib/backup";
import { registrarErro } from "@/lib/erros";

export const runtime = "nodejs";
export const maxDuration = 300;

// Backup semanal (Vercel Cron, vercel.json). A Vercel envia "Authorization: Bearer $CRON_SECRET".
export async function GET(req: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || req.headers.get("authorization") !== `Bearer ${segredo}`) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }
  const r = await fazerBackup().catch((e) => ({ ok: false as const, erro: String(e) }));
  if (!r.ok && process.env.BACKUP_READ_WRITE_TOKEN) {
    await registrarErro({ tipo: "servidor", mensagem: `Backup semanal falhou: ${r.erro}`, rota: "/api/cron/backup" });
  }
  return NextResponse.json(r);
}
