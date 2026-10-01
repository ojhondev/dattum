import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, autores } from "@/lib/db/schema";
import { isAdmin } from "@/lib/admin";

export const runtime = "nodejs";

// Cria um rascunho vazio e devolve o id pro editor.
export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  const [autor] = await db.select({ id: autores.id }).from(autores).limit(1);
  const [post] = await db
    .insert(posts)
    .values({ titulo: "Novo artigo", slug: `rascunho-${Date.now().toString(36)}`, autorId: autor?.id ?? null })
    .returning({ id: posts.id });
  return NextResponse.json({ ok: true, id: post.id });
}
