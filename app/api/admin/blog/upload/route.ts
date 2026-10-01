import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAdmin } from "@/lib/admin";
import { slugify } from "@/lib/markdown";

export const runtime = "nodejs";

const TIPOS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };
const MAX = 4 * 1024 * 1024;

// Upload de imagem do blog (capa ou imagem no texto) pro Vercel Blob.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const arquivo = form?.get("arquivo");
  if (!(arquivo instanceof File)) return NextResponse.json({ ok: false, error: "Envie uma imagem." }, { status: 400 });
  const ext = TIPOS[arquivo.type];
  if (!ext) return NextResponse.json({ ok: false, error: "Formato não aceito. Use JPG, PNG, WebP, AVIF ou GIF." }, { status: 400 });
  if (arquivo.size > MAX) return NextResponse.json({ ok: false, error: "Imagem acima de 4 MB. Comprima antes de enviar." }, { status: 400 });

  const nome = slugify(arquivo.name.replace(/\.[^.]+$/, "")) || "imagem";
  const blob = await put(`blog/${nome}.${ext}`, arquivo, { access: "public", addRandomSuffix: true, contentType: arquivo.type });
  return NextResponse.json({ ok: true, url: blob.url });
}
