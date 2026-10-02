import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pedidosTitular } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { registrar } from "@/lib/registro";
import { STATUS_PEDIDO } from "@/lib/titulares";

export const runtime = "nodejs";

/** Atualiza a situação de um pedido de titular e a anotação do que foi feito. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  const { id } = await params;
  const b = await req.json().catch(() => null);
  const status = typeof b?.status === "string" && STATUS_PEDIDO[b.status] ? (b.status as string) : null;
  const resposta = typeof b?.resposta === "string" ? b.resposta.trim().slice(0, 4000) : undefined;

  const p = await db.query.pedidosTitular.findFirst({ where: and(eq(pedidosTitular.id, id), eq(pedidosTitular.agenciaId, sessao.agenciaId)) });
  if (!p) return NextResponse.json({ ok: false, error: "Pedido não encontrado." }, { status: 404 });
  if ((status === "respondido" || status === "recusado") && !(resposta ?? p.resposta)) {
    return NextResponse.json({ ok: false, error: "Anote o que foi respondido ou feito antes de encerrar o pedido." }, { status: 400 });
  }

  await db
    .update(pedidosTitular)
    .set({
      ...(status ? { status } : {}),
      ...(resposta !== undefined ? { resposta: resposta || null } : {}),
      ...(status === "respondido" || status === "recusado" ? { respondidoEm: p.respondidoEm ?? new Date() } : {}),
      atualizadoEm: new Date(),
    })
    .where(eq(pedidosTitular.id, p.id));
  if (status && status !== p.status) await registrar(sessao, "Atualizou um pedido de titular", `${p.protocolo} · ${STATUS_PEDIDO[status].rotulo}`);
  return NextResponse.json({ ok: true });
}
