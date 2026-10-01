import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { dpas } from "@/lib/db/schema";
import { automatizarCertificados } from "@/lib/automacao";
import { filtroVigente, ipDe, registrarAssinatura, situacaoDpa, userAgentDe } from "@/lib/dpa";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Assinatura do CLIENTE (controlador), pelo link que a agência enviou. Sem login: o token é a credencial.
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await req.json().catch(() => null);
  const nome = typeof body?.nome === "string" ? body.nome.trim().slice(0, 120) : "";
  const cargo = typeof body?.cargo === "string" ? body.cargo.trim().slice(0, 120) : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 160) : "";
  if (!nome || !cargo || !EMAIL.test(email) || body?.aceite !== true) {
    return NextResponse.json({ ok: false, error: "Preencha nome, cargo, um e-mail válido e confirme que leu e concorda." }, { status: 400 });
  }

  const atual = token.length >= 20 ? await db.query.dpas.findFirst({ where: and(eq(dpas.tokenAssinatura, token), filtroVigente) }) : null;
  if (!atual) return NextResponse.json({ ok: false, error: "Este link não é mais válido. Peça um novo para a agência." }, { status: 404 });
  if (atual.clienteAssinadoEm) return NextResponse.json({ ok: false, error: "Este contrato já foi assinado pelo cliente." }, { status: 409 });

  const dpa = await registrarAssinatura(atual, "cliente", { nome, cargo, email, ip: ipDe(req), userAgent: userAgentDe(req) });
  if (!dpa) return NextResponse.json({ ok: false, error: "Este contrato já foi assinado pelo cliente." }, { status: 409 });

  if (situacaoDpa(dpa) === "assinado") await automatizarCertificados(dpa.agenciaId).catch(() => null);
  return NextResponse.json({ ok: true });
}
