import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { dpas } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { automatizarCertificados } from "@/lib/automacao";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const nome = typeof body?.nome === "string" ? body.nome.trim() : "";
  const cargo = typeof body?.cargo === "string" ? body.cargo.trim() : "";
  const aceite = body?.aceite === true;

  if (!nome || !cargo || !aceite) {
    return NextResponse.json(
      { ok: false, error: "Informe nome, cargo e confirme que leu e concorda com os termos." },
      { status: 400 }
    );
  }

  const dpaAtual = await db.query.dpas.findFirst({
    where: and(eq(dpas.id, id), eq(dpas.agenciaId, sessao.agenciaId)),
  });
  if (!dpaAtual) return NextResponse.json({ ok: false, error: "DPA não encontrado." }, { status: 404 });
  if (dpaAtual.status === "assinado") {
    return NextResponse.json({ ok: false, error: "Este DPA já foi assinado." }, { status: 409 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "desconhecido";

  const [dpa] = await db
    .update(dpas)
    .set({
      status: "assinado",
      assinanteNome: nome,
      assinanteCargo: cargo,
      assinadoEm: new Date(),
      assinadoIp: ip,
    })
    .where(eq(dpas.id, id))
    .returning();

  // Contrato assinado costuma destravar o certificado: emite na hora, sem a agência pedir.
  const auto = await automatizarCertificados(sessao.agenciaId).catch(() => ({ emitidos: 0, renovados: 0 }));
  return NextResponse.json({ ok: true, dpa, certificadosEmitidos: auto.emitidos });
}
