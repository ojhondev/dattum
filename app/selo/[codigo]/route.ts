import { buscarPorCodigo, statusCertificado } from "@/lib/certificados";

export const runtime = "nodejs";

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Selo SVG pra rodapé de site. Reflete o status atual do certificado. */
export async function GET(_req: Request, { params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const cert = await buscarPorCodigo(codigo);
  const status = cert ? await statusCertificado(cert) : null;

  const estado = !cert || !status?.valido ? "invalido" : status.emDia ? "ok" : "pendente";
  const titulo = estado === "ok" ? "Privacidade verificada" : estado === "pendente" ? "Verificação pendente" : "Certificado inválido";
  const bg = estado === "ok" ? "#002820" : "#f4f4f2";
  const fg = estado === "ok" ? "#ffffff" : "#0a120f";
  const sub = estado === "ok" ? "#6ceead" : "#59645f";
  const dot = estado === "ok" ? "#6ceead" : estado === "pendente" ? "#f38536" : "#d84a4a";
  const mark =
    estado === "ok"
      ? `<path d="M22.5 32.5l5 5 10-11" fill="none" stroke="#002820" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<path d="M30 25v8M30 38.5v.5" fill="none" stroke="#0a120f" stroke-width="3" stroke-linecap="round"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="232" height="64" viewBox="0 0 232 64" role="img" aria-label="Dattis — ${esc(titulo)}">
  <rect x="0.5" y="0.5" width="231" height="63" rx="31.5" fill="${bg}" stroke="${estado === "ok" ? "#002820" : "#d0d3cf"}"/>
  <circle cx="30" cy="32" r="18" fill="${dot}"/>
  ${mark}
  <text x="58" y="22" font-family="ui-monospace,SFMono-Regular,Menlo,Consolas,monospace" font-size="9" letter-spacing="0.8" fill="${sub}">DATTIS · LGPD</text>
  <text x="58" y="38" font-family="Georgia,'Times New Roman',serif" font-size="14.5" fill="${fg}">${esc(titulo)}</text>
  <text x="58" y="52" font-family="ui-monospace,SFMono-Regular,Menlo,Consolas,monospace" font-size="9" fill="${sub}">${esc(cert?.codigo ?? codigo.toUpperCase())}</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
