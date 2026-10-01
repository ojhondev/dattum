import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { autores } from "@/lib/db/schema";
import { isAdmin } from "@/lib/admin";
import { slugify } from "@/lib/markdown";
import { revalidarBlog } from "@/lib/blog-admin";

export const runtime = "nodejs";

// Cria (sem id) ou atualiza (com id) um autor do blog.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  const b = await req.json().catch(() => null);
  const nome = typeof b?.nome === "string" ? b.nome.trim().slice(0, 80) : "";
  if (!nome) return NextResponse.json({ ok: false, error: "Informe o nome do autor." }, { status: 400 });
  const campo = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) || null : null);
  const campos = { nome, cargo: campo(b?.cargo, 120), bio: campo(b?.bio, 500), fotoUrl: campo(b?.fotoUrl, 1000) };
  const [autor] =
    typeof b?.id === "string"
      ? await db.update(autores).set(campos).where(eq(autores.id, b.id)).returning()
      : await db.insert(autores).values({ ...campos, slug: `${slugify(nome)}-${Date.now().toString(36)}` }).returning();
  revalidarBlog();
  return NextResponse.json({ ok: true, autor });
}
