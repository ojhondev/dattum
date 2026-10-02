import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { contasCliente } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { CHAVES_FLUXO, editarConta, normalizarSite, type EdicaoConta } from "@/lib/contas";
import { registrar } from "@/lib/registro";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });

  const { id } = await params;

  const deletado = await db
    .delete(contasCliente)
    .where(and(eq(contasCliente.id, id), eq(contasCliente.agenciaId, sessao.agenciaId)))
    .returning();

  if (deletado.length === 0) {
    return NextResponse.json({ ok: false, error: "Conta não encontrada." }, { status: 404 });
  }

  await registrar(sessao, "Excluiu um cliente", deletado[0].nome);
  return NextResponse.json({ ok: true });
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Edita a conta. Só os campos enviados mudam (o card de site manda apenas `site`).
 * Mudar operações (flows), nome, CNPJ ou CRM refaz o contrato: nova versão se já tinha assinatura.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object") return NextResponse.json({ ok: false, error: "Nada para salvar." }, { status: 400 });

  const texto = (v: unknown, max = 200) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
  const e: EdicaoConta = {};

  if ("nome" in b) {
    const nome = texto(b.nome);
    if (!nome) return NextResponse.json({ ok: false, error: "Informe o nome do cliente." }, { status: 400 });
    e.nome = nome;
  }
  if ("cnpj" in b) e.cnpj = texto(b.cnpj, 30);
  if ("contatoNome" in b) e.contatoNome = texto(b.contatoNome, 120);
  if ("contatoEmail" in b) {
    e.contatoEmail = texto(b.contatoEmail, 160)?.toLowerCase() ?? null;
    if (e.contatoEmail && !EMAIL.test(e.contatoEmail)) return NextResponse.json({ ok: false, error: "O e-mail do contato não parece válido." }, { status: 400 });
  }
  if ("contatoWhatsapp" in b) e.contatoWhatsapp = texto(b.contatoWhatsapp, 30);
  if ("crmNome" in b) e.crmNome = texto(b.crmNome, 80);
  if ("site" in b) {
    const bruto = texto(b.site, 300);
    e.site = bruto ? normalizarSite(bruto) : null;
    if (bruto && !e.site) {
      return NextResponse.json({ ok: false, error: "Esse endereço não parece um site válido (ex.: lojaaurora.com.br)." }, { status: 400 });
    }
  }
  if ("flows" in b && b.flows && typeof b.flows === "object") {
    e.flows = CHAVES_FLUXO.filter((f) => b.flows[f] === true);
  }

  const r = await editarConta(id, sessao.agenciaId, e);
  if (!r) return NextResponse.json({ ok: false, error: "Conta não encontrada." }, { status: 404 });

  await registrar(sessao, "Editou um cliente", `${r.conta.nome}${r.contrato === "nova_versao" ? " · nova versão do contrato" : ""}`);
  return NextResponse.json({ ok: true, site: r.conta.site, contrato: r.contrato });
}
