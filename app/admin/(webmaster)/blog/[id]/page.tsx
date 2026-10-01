import { notFound } from "next/navigation";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { autores } from "@/lib/db/schema";
import { postPorId, CATEGORIAS } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";
import { isoParaLocal } from "@/lib/datas";
import { Editor } from "./Editor";

export const dynamic = "force-dynamic";

export default async function EditarArtigo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, listaAutores] = await Promise.all([postPorId(id), db.select({ id: autores.id, nome: autores.nome }).from(autores).orderBy(asc(autores.criadoEm))]);
  if (!post) notFound();

  return (
    <Editor
      siteUrl={SITE_URL}
      autores={listaAutores}
      categorias={CATEGORIAS.includes(post.categoria) ? CATEGORIAS : [post.categoria, ...CATEGORIAS]}
      inicial={{
        id: post.id,
        titulo: post.titulo,
        slug: post.slug,
        resumo: post.resumo,
        conteudo: post.conteudo,
        capaUrl: post.capaUrl ?? "",
        capaAlt: post.capaAlt ?? "",
        categoria: post.categoria,
        tags: post.tags,
        autorId: post.autorId ?? "",
        status: post.status === "publicado" ? "publicado" : "rascunho",
        publicadoEm: isoParaLocal(post.publicadoEm?.toISOString() ?? null),
        seoTitulo: post.seoTitulo ?? "",
        seoDescricao: post.seoDescricao ?? "",
        palavraChave: post.palavraChave ?? "",
        canonical: post.canonical ?? "",
        ogImagem: post.ogImagem ?? "",
        noindex: post.noindex,
        faq: post.faq,
      }}
    />
  );
}
