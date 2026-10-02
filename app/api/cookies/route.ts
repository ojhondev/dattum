import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, contasCliente, type ConfigCookies } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { contaDaAgencia } from "@/lib/contas";
import { novoToken } from "@/lib/dpa";

export const runtime = "nodejs";

/**
 * Ativa o aviso de cookies (gera o token do script) ou salva a configuração dele,
 * para a agência (sem contaId) ou para uma conta de cliente.
 */
export async function POST(req: Request) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) });
  if (!agencia) return NextResponse.json({ ok: false, error: "Agência não encontrada." }, { status: 404 });
  if (agencia.plano === "start") return NextResponse.json({ ok: false, error: "O aviso de cookies faz parte dos planos Growth e Scale." }, { status: 403 });

  const b = await req.json().catch(() => null);
  const conta = typeof b?.contaId === "string" ? await contaDaAgencia(b.contaId, agencia.id) : null;
  if (b?.contaId && !conta) return NextResponse.json({ ok: false, error: "Conta não encontrada." }, { status: 404 });

  const atual = (conta ? conta.cookiesConfig : agencia.cookiesConfig) ?? {};
  const config: ConfigCookies = { ...atual };
  if (typeof b?.cor === "string") config.cor = /^#[0-9a-f]{6}$/i.test(b.cor) ? b.cor : undefined;
  if (typeof b?.flutuante === "boolean") config.flutuante = b.flutuante;
  if (typeof b?.politicaUrl === "string") {
    const u = b.politicaUrl.trim();
    if (u && !/^https?:\/\/[^\s]+\.[^\s]+/i.test(u)) return NextResponse.json({ ok: false, error: "O link da política precisa começar com https://" }, { status: 400 });
    config.politicaUrl = u || undefined;
  }

  const token = (conta ? conta.cookiesToken : agencia.cookiesToken) ?? novoToken();
  if (conta) await db.update(contasCliente).set({ cookiesToken: token, cookiesConfig: config }).where(eq(contasCliente.id, conta.id));
  else await db.update(agencias).set({ cookiesToken: token, cookiesConfig: config }).where(eq(agencias.id, agencia.id));
  return NextResponse.json({ ok: true, token });
}
