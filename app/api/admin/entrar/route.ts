import { NextResponse } from "next/server";
import { limitarIp, respostaLimite } from "@/lib/limite";
import { criarSessaoAdmin, senhaAdminCorreta } from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (await limitarIp(req, "admin", 10, 900)) return respostaLimite(15);
  const body = await req.json().catch(() => null);
  const senha = typeof body?.senha === "string" ? body.senha : "";
  if (!senhaAdminCorreta(senha)) {
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ ok: false, error: "Senha incorreta." }, { status: 401 });
  }
  await criarSessaoAdmin();
  return NextResponse.json({ ok: true });
}
