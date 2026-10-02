import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { contaDaAgencia, normalizarSite } from "@/lib/contas";
import { verificarInstalacao } from "@/lib/cookies-instalacao";
import { limitarIp, respostaLimite } from "@/lib/limite";

export const runtime = "nodejs";
export const maxDuration = 30;

/** "Verificar instalação": abre o site e confere se o aviso de cookies foi colado do jeito certo. */
export async function POST(req: Request) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  if (await limitarIp(req, "verificar-cookies", 30, 3600)) return respostaLimite(60);
  const b = await req.json().catch(() => null);
  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) });
  const conta = typeof b?.contaId === "string" ? await contaDaAgencia(b.contaId, sessao.agenciaId) : null;
  const token = conta ? conta.cookiesToken : agencia?.cookiesToken;
  const site = normalizarSite(typeof b?.site === "string" && b.site ? b.site : (conta?.site ?? ""));
  if (!token) return NextResponse.json({ ok: false, error: "Ative o aviso de cookies primeiro." }, { status: 400 });
  if (!site) return NextResponse.json({ ok: false, error: "Informe o endereço do site para verificar." }, { status: 400 });
  return NextResponse.json({ ok: true, site, ...(await verificarInstalacao(site, token)) });
}
