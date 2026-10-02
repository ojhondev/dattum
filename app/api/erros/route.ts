import { NextResponse } from "next/server";
import { registrarErro } from "@/lib/erros";
import { limitarIp } from "@/lib/limite";

export const runtime = "nodejs";

/** Erros do navegador (telas que quebraram), enviados pelas páginas de erro do app. */
export async function POST(req: Request) {
  if (await limitarIp(req, "erros", 30, 3600)) return new NextResponse(null, { status: 204 });
  const b = await req.json().catch(() => null);
  if (typeof b?.mensagem !== "string") return new NextResponse(null, { status: 204 });
  await registrarErro({ tipo: "navegador", mensagem: b.mensagem, rota: typeof b.rota === "string" ? b.rota : null, digest: typeof b.digest === "string" ? b.digest : null, pilha: typeof b.pilha === "string" ? b.pilha : null });
  return new NextResponse(null, { status: 204 });
}
