import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { postPorId, postsPublicados } from "@/lib/blog";
import { Artigo } from "@/components/blog/Artigo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pré-visualização", robots: { index: false, follow: false } };

// Pré-visualização de rascunho, só pra quem está logado no /admin.
export default async function PreviaPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/admin/entrar");
  const { id } = await params;
  const post = await postPorId(id);
  if (!post) notFound();
  const relacionados = (await postsPublicados({ excetoId: post.id, limite: 3 })).slice(0, 3);
  return <Artigo post={post} relacionados={relacionados} previa />;
}
