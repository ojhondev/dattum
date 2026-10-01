import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { isAdmin } from "@/lib/admin";
import { slugify } from "@/lib/markdown";
import { lerCamposPost, revalidarBlog } from "@/lib/blog-admin";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  const { id } = await params;
  const atual = await db.query.posts.findFirst({ where: eq(posts.id, id) });
  if (!atual) return NextResponse.json({ ok: false, error: "Artigo não encontrado." }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Corpo inválido." }, { status: 400 });
  const c = lerCamposPost(body);

  if (c.slug !== undefined) {
    c.slug = slugify(c.slug);
    if (!c.slug) return NextResponse.json({ ok: false, error: "A URL do artigo não pode ficar vazia." }, { status: 400 });
    const repetido = await db.query.posts.findFirst({ where: and(eq(posts.slug, c.slug), ne(posts.id, id)) });
    if (repetido) return NextResponse.json({ ok: false, error: `Já existe um artigo com a URL /blog/${c.slug}.` }, { status: 409 });
  }
  if (c.titulo !== undefined && !c.titulo) return NextResponse.json({ ok: false, error: "O título não pode ficar vazio." }, { status: 400 });

  const set = Object.fromEntries(Object.entries(c).filter(([, v]) => v !== undefined)) as Partial<typeof posts.$inferInsert>;
  // Publicar sem data = agora. Data no futuro = agendado.
  if (set.status === "publicado" && !(set.publicadoEm ?? atual.publicadoEm)) set.publicadoEm = new Date();
  set.atualizadoEm = new Date();

  const [post] = await db.update(posts).set(set).where(eq(posts.id, id)).returning();
  revalidarBlog([atual.slug, post.slug]);
  return NextResponse.json({ ok: true, post });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  const { id } = await params;
  const [post] = await db.delete(posts).where(eq(posts.id, id)).returning({ slug: posts.slug });
  if (!post) return NextResponse.json({ ok: false, error: "Artigo não encontrado." }, { status: 404 });
  revalidarBlog([post.slug]);
  return NextResponse.json({ ok: true });
}
