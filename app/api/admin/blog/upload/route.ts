import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAdmin } from "@/lib/admin";
import { slugify } from "@/lib/markdown";

export const runtime = "nodejs";

const TIPOS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };
const MAX = 4 * 1024 * 1024;

/**
 * Tipo real do arquivo pelos primeiros bytes (a "assinatura"), sem confiar no tipo que o navegador declara:
 * um arquivo renomeado para .png continua sendo o que é.
 */
function tipoReal(b: Uint8Array): string | null {
  const ini = (...xs: number[]) => xs.every((x, i) => b[i] === x);
  const ascii = (de: number, txt: string) => [...txt].every((c, i) => b[de + i] === c.charCodeAt(0));
  if (ini(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (ini(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (ascii(0, "GIF87a") || ascii(0, "GIF89a")) return "image/gif";
  if (ascii(0, "RIFF") && ascii(8, "WEBP")) return "image/webp";
  if (ascii(4, "ftyp") && (ascii(8, "avif") || ascii(8, "avis"))) return "image/avif";
  return null;
}

// Upload de imagem do blog (capa ou imagem no texto) pro Vercel Blob.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const arquivo = form?.get("arquivo");
  if (!(arquivo instanceof File)) return NextResponse.json({ ok: false, error: "Envie uma imagem." }, { status: 400 });
  const ext = TIPOS[arquivo.type];
  if (!ext) return NextResponse.json({ ok: false, error: "Formato não aceito. Use JPG, PNG, WebP, AVIF ou GIF." }, { status: 400 });
  if (arquivo.size > MAX) return NextResponse.json({ ok: false, error: "Imagem acima de 4 MB. Comprima antes de enviar." }, { status: 400 });
  const conteudo = new Uint8Array(await arquivo.arrayBuffer());
  const real = tipoReal(conteudo);
  if (!real) {
    return NextResponse.json({ ok: false, error: "O conteúdo do arquivo não é uma imagem JPG, PNG, WebP, AVIF ou GIF válida." }, { status: 400 });
  }

  const nome = slugify(arquivo.name.replace(/\.[^.]+$/, "")) || "imagem";
  const blob = await put(`blog/${nome}.${TIPOS[real]}`, Buffer.from(conteudo), { access: "public", addRandomSuffix: true, contentType: real });
  return NextResponse.json({ ok: true, url: blob.url });
}
