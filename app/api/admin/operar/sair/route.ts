import { NextResponse } from "next/server";
import { destruirSessao, getSessao } from "@/lib/auth";

export const runtime = "nodejs";

/** Sai da conta da agência e volta ao Portal do DPO (no mesmo endereço em que a pessoa está). */
export async function GET(req: Request) {
  const sessao = await getSessao();
  if (sessao?.operador) await destruirSessao();
  return NextResponse.redirect(new URL("/admin/dpo", req.url));
}
