import { NextResponse } from "next/server";
import { criarSessao } from "@/lib/auth";
import { garantirDemo } from "@/lib/demo";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const agencia = await garantirDemo();
  await criarSessao(agencia.id);
  return NextResponse.redirect(new URL("/painel", req.url));
}
