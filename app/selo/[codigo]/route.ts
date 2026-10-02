import { CORES, SELO_ALTURA, SELO_LARGURA, dadosSelo, logoBase64, temaDe } from "@/lib/selo";

export const runtime = "nodejs";

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Selo SVG para o rodapé do site (?tema=claro|escuro). Sempre reflete o status atual do certificado. */
export async function GET(req: Request, { params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const tema = temaDe(new URL(req.url).searchParams.get("tema"));
  const [selo, logo] = await Promise.all([dadosSelo(codigo), logoBase64(tema)]);
  const c = CORES[tema];
  const fonte = `font-family="'Public Sans','Segoe UI',Helvetica,Arial,sans-serif"`;

  // Logo 1003×346 → 104×36
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SELO_LARGURA}" height="${SELO_ALTURA}" viewBox="0 0 ${SELO_LARGURA} ${SELO_ALTURA}" role="img" aria-label="Dattis: ${esc(selo.linhas.join(" "))} ${esc(selo.codigo)}">
  <rect x="0.5" y="0.5" width="${SELO_LARGURA - 1}" height="${SELO_ALTURA - 1}" rx="${c.raio}" fill="${c.fundo}" stroke="${c.borda}"/>
  <image href="data:image/png;base64,${logo}" x="30" y="32" width="104" height="36"/>
  <text x="156" y="35" ${fonte} font-size="15" fill="${c.texto}">${esc(selo.linhas[0])}</text>
  <text x="156" y="55" ${fonte} font-size="15" fill="${c.texto}">${esc(selo.linhas[1])}</text>
  <text x="156" y="78" ${fonte} font-size="14" font-weight="600" letter-spacing="0.3" fill="${c.codigo[selo.estado]}">${esc(selo.codigo)}</text>
</svg>`;

  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=300" },
  });
}
