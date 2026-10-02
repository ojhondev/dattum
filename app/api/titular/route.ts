import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, contasCliente, pedidosTitular } from "@/lib/db/schema";
import { limitarIp, respostaLimite } from "@/lib/limite";
import { ipDe } from "@/lib/dpa";
import { PRAZO_DIAS, TIPOS_PEDIDO, novoProtocolo } from "@/lib/titulares";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Formulário "Exercer meus direitos" das políticas públicas (/p/{slug}/privacidade). Sem login. */
export async function POST(req: Request) {
  if (await limitarIp(req, "titular", 5, 3600)) return respostaLimite(60);
  const b = await req.json().catch(() => null);
  const slug = typeof b?.slug === "string" ? b.slug.slice(0, 80) : "";
  const nome = typeof b?.nome === "string" ? b.nome.trim().slice(0, 120) : "";
  const email = typeof b?.email === "string" ? b.email.trim().toLowerCase().slice(0, 160) : "";
  const tipo = TIPOS_PEDIDO.some((t) => t.id === b?.tipo) ? (b.tipo as string) : "";
  const mensagem = typeof b?.mensagem === "string" ? b.mensagem.trim().slice(0, 2000) : "";
  if (!nome || !EMAIL.test(email) || !tipo) return NextResponse.json({ ok: false, error: "Preencha nome, um e-mail válido e o tipo de pedido." }, { status: 400 });
  if (b?.aceite !== true) return NextResponse.json({ ok: false, error: "Confirme que as informações são suas." }, { status: 400 });
  if (typeof b?.site === "string" && b.site) return NextResponse.json({ ok: true, protocolo: novoProtocolo() }); // armadilha para robôs

  // Dono da política: agência ou conta de cliente, só se a política estiver publicada.
  const ag = await db.query.agencias.findFirst({ where: eq(agencias.slug, slug) });
  const conta = ag ? null : await db.query.contasCliente.findFirst({ where: eq(contasCliente.slug, slug) });
  const agenciaId = ag?.id ?? conta?.agenciaId;
  if (!agenciaId || !(ag?.politicaPublicadaEm ?? conta?.politicaPublicadaEm)) return NextResponse.json({ ok: false, error: "Política não encontrada." }, { status: 404 });

  const protocolo = novoProtocolo();
  await db.insert(pedidosTitular).values({
    agenciaId,
    contaClienteId: conta?.id ?? null,
    protocolo,
    nome,
    email,
    tipo,
    mensagem: mensagem || null,
    prazo: new Date(Date.now() + PRAZO_DIAS * 86_400_000),
    ipHash: createHash("sha256").update(`${process.env.SESSION_SECRET ?? "dattis"}:${ipDe(req)}`).digest("hex"),
  });
  return NextResponse.json({ ok: true, protocolo, prazoDias: PRAZO_DIAS });
}
