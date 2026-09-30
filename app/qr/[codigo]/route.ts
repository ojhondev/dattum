import QRCode from "qrcode";
import { buscarPorCodigo } from "@/lib/certificados";

export const runtime = "nodejs";

/** QR Code (SVG) que aponta pra página pública de verificação do certificado. */
export async function GET(req: Request, { params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const cert = await buscarPorCodigo(codigo);
  if (!cert) return new Response("Certificado não encontrado", { status: 404 });

  const url = `${new URL(req.url).origin}/verificar/${cert.codigo}`;
  const svg = await QRCode.toString(url, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#002820", light: "#ffffff" },
  });

  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "public, max-age=86400" },
  });
}
