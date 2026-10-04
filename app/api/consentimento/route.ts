import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { consentimentos } from "@/lib/db/schema";
import { donoDoToken, registrarDeteccao } from "@/lib/cookies-sites";
import { limitarIp } from "@/lib/limite";
import { ipDe } from "@/lib/dpa";

export const runtime = "nodejs";

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
const ok = () => new Response(null, { status: 204, headers: CORS });

export function OPTIONS() {
  return ok();
}

/**
 * Prova de consentimento enviada pelo aviso de cookies (sendBeacon, texto puro, de qualquer site).
 * Guarda a escolha, a versão do texto e um hash do IP — nunca o IP em si.
 */
export async function POST(req: Request) {
  if (await limitarIp(req, "consentimento", 120, 3600)) return ok();
  const texto = await req.text().catch(() => "");
  let b: Record<string, unknown> | null = null;
  try {
    b = JSON.parse(texto.slice(0, 4000));
  } catch {
    return ok();
  }
  const token = typeof b?.token === "string" ? b.token.slice(0, 64) : "";
  const acao = ["aceitar", "recusar", "personalizar"].includes(b?.acao as string) ? (b!.acao as string) : null;
  const visitante = typeof b?.visitante === "string" ? b.visitante.slice(0, 40) : "";
  const versao = typeof b?.versao === "string" ? b.versao.slice(0, 20) : "";
  const cats = (b?.categorias ?? {}) as Record<string, unknown>;
  if (!token || !acao || !visitante || !versao) return ok();

  const dono = await donoDoToken(token).catch(() => null);
  if (!dono) return ok();

  const segredo = process.env.SESSION_SECRET ?? "dattis";
  await db
    .insert(consentimentos)
    .values({
      token,
      agenciaId: dono.agenciaId,
      contaClienteId: dono.contaId,
      visitante,
      acao,
      categorias: { estatisticas: cats.estatisticas === true, marketing: cats.marketing === true },
      versao,
      url: typeof b?.url === "string" ? b.url.slice(0, 300) : null,
      ipHash: createHash("sha256").update(`${segredo}:${ipDe(req)}`).digest("hex"),
    })
    .catch((e) => console.error("[consentimento]", e));
  await registrarDeteccao(token, typeof b?.url === "string" ? b.url : null);
  return ok();
}
