import { configParaScript, gerarScript } from "@/lib/cookies-banner";
import { donoDoToken, registrarDeteccao } from "@/lib/cookies-sites";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

const JS = { "Content-Type": "application/javascript; charset=utf-8", "Access-Control-Allow-Origin": "*", "X-Robots-Tag": "noindex" };

/**
 * /c/{token}.js — o aviso de cookies que a agência cola no topo do site.
 * Token inválido, plano sem o recurso ou agência suspensa: devolve um script vazio (o site não quebra).
 */
export async function GET(req: Request, { params }: { params: Promise<{ arquivo: string }> }) {
  const { arquivo } = await params;
  const token = arquivo.replace(/\.js$/, "");
  const dono = await donoDoToken(token).catch(() => null);
  if (!dono) {
    return new Response("/* Aviso de cookies Dattis: site não encontrado ou desativado. */", { headers: { ...JS, "Cache-Control": "public, max-age=60" } });
  }
  // O site que carregou o script prova que o aviso está instalado (a página vem no Referer).
  await registrarDeteccao(token, req.headers.get("referer"));
  const cfg = configParaScript(token, dono.config, {
    api: `${SITE_URL}/api/consentimento`,
    marcaUrl: `${SITE_URL}/?utm_source=aviso-cookies&utm_medium=selo`,
    logoUrl: `${SITE_URL}/brand/logo-fundo-claro.png`,
    selo: dono.selo,
    politicaPadrao: dono.politicaPadrao,
    ignorar: dono.ignorar,
  });
  return new Response(gerarScript(cfg), {
    headers: { ...JS, "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=86400" },
  });
}
