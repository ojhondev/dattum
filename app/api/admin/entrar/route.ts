import { NextResponse } from "next/server";
import { limitarIp, respostaLimite } from "@/lib/limite";
import { credenciaisMasterCorretas, criarSessaoAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (await limitarIp(req, "admin", 10, 900)) return respostaLimite(15);
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.slice(0, 160) : "";
  const senha = typeof body?.senha === "string" ? body.senha : "";
  if (!credenciaisMasterCorretas(email, senha)) {
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ ok: false, error: "E-mail ou senha incorretos." }, { status: 401 });
  }
  await criarSessaoAdmin();
  return NextResponse.json({ ok: true });
}
