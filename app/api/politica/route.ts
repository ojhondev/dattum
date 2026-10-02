import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, contasCliente } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { contaDaAgencia } from "@/lib/contas";
import { slugDisponivel } from "@/lib/politica-publica";
import { urlAbsoluta } from "@/lib/site";
import { EMAIL_DEMO } from "@/lib/admin-dados";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function alvo(req: Request) {
  const sessao = await getSessao();
  if (!sessao) return { erro: NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 }) };
  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) });
  if (!agencia) return { erro: NextResponse.json({ ok: false, error: "Agência não encontrada." }, { status: 404 }) };
  if (agencia.plano === "start") return { erro: NextResponse.json({ ok: false, error: "A política pública faz parte dos planos Growth e Scale." }, { status: 403 }) };
  const url = new URL(req.url);
  const body = req.method === "POST" ? await req.json().catch(() => null) : null;
  const contaId = (body?.contaId as string | undefined) ?? url.searchParams.get("contaId");
  if (!contaId) return { agencia, conta: null, body };
  const conta = await contaDaAgencia(contaId, agencia.id);
  if (!conta) return { erro: NextResponse.json({ ok: false, error: "Conta não encontrada." }, { status: 404 }) };
  return { agencia, conta, body };
}

/** Publica (ou atualiza o canal de) a política pública da agência ou de uma conta de cliente. */
export async function POST(req: Request) {
  const r = await alvo(req);
  if (r.erro) return r.erro;
  // Conta demo é compartilhada: ninguém publica e-mail próprio nela.
  const email = r.agencia.email === EMAIL_DEMO ? "" : typeof r.body?.email === "string" ? r.body.email.trim().toLowerCase().slice(0, 160) : "";
  if (email && !EMAIL.test(email)) return NextResponse.json({ ok: false, error: "O e-mail de privacidade não parece válido." }, { status: 400 });
  // O titular precisa de um canal. A agência sempre tem o e-mail de acesso; a conta, só se o contato foi informado.
  const temOutroCanal = r.conta ? !!(r.conta.contatoEmail || r.conta.contatoWhatsapp) : true;
  if (!email && !temOutroCanal && r.agencia.email !== EMAIL_DEMO) {
    return NextResponse.json({ ok: false, error: "Informe o e-mail que vai receber pedidos sobre dados pessoais." }, { status: 400 });
  }

  if (r.conta) {
    const slug = r.conta.slug ?? (await slugDisponivel(r.conta.nome));
    await db
      .update(contasCliente)
      .set({ slug, emailPrivacidade: email || null, politicaPublicadaEm: r.conta.politicaPublicadaEm ?? new Date() })
      .where(eq(contasCliente.id, r.conta.id));
    return NextResponse.json({ ok: true, url: urlAbsoluta(`/p/${slug}/privacidade`) });
  }
  const slug = r.agencia.slug ?? (await slugDisponivel(r.agencia.nome));
  await db
    .update(agencias)
    .set({ slug, emailPrivacidade: email || null, politicaPublicadaEm: r.agencia.politicaPublicadaEm ?? new Date() })
    .where(eq(agencias.id, r.agencia.id));
  return NextResponse.json({ ok: true, url: urlAbsoluta(`/p/${slug}/privacidade`) });
}

/** Tira a política do ar. O endereço fica reservado e volta a valer se publicar de novo. */
export async function DELETE(req: Request) {
  const r = await alvo(req);
  if (r.erro) return r.erro;
  if (r.conta) await db.update(contasCliente).set({ politicaPublicadaEm: null }).where(eq(contasCliente.id, r.conta.id));
  else await db.update(agencias).set({ politicaPublicadaEm: null }).where(eq(agencias.id, r.agencia.id));
  return NextResponse.json({ ok: true });
}
