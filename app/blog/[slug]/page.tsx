import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { postPorSlug, postsPublicados } from "@/lib/blog";
import { Artigo } from "@/components/blog/Artigo";
import { urlAbsoluta } from "@/lib/site";

export const revalidate = 1800; // 30 min: salvar/publicar no admin já invalida na hora (lib/blog-admin.ts)

export async function generateStaticParams() {
  const posts = await postsPublicados().catch(() => []);
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await postPorSlug(slug);
  if (!post) return { title: "Artigo não encontrado", robots: { index: false } };

  const titulo = post.seoTitulo || post.titulo;
  const descricao = post.seoDescricao || post.resumo;
  const imagem = post.ogImagem || post.capaUrl;
  return {
    // Título SEO absoluto: quem escreve controla o texto exato que aparece no Google.
    title: { absolute: titulo },
    description: descricao,
    keywords: [post.palavraChave, ...post.tags].filter((k): k is string => !!k),
    authors: post.autor ? [{ name: post.autor.nome }] : undefined,
    alternates: { canonical: post.canonical || `/blog/${post.slug}` },
    robots: post.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "article",
      url: `/blog/${post.slug}`,
      title: titulo,
      description: descricao,
      publishedTime: post.publicadoEm?.toISOString(),
      modifiedTime: post.atualizadoEm.toISOString(),
      section: post.categoria,
      tags: post.tags,
      authors: post.autor ? [post.autor.nome] : undefined,
      ...(imagem ? { images: [{ url: urlAbsoluta(imagem), width: 1200, height: 630, alt: post.capaAlt || post.titulo }] } : {}),
    },
    twitter: { card: "summary_large_image", title: titulo, description: descricao, ...(imagem ? { images: [urlAbsoluta(imagem)] } : {}) },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await postPorSlug(slug);
  if (!post) notFound();

  const outros = await postsPublicados({ excetoId: post.id, limite: 30 });
  const relacionados = [...outros.filter((p) => p.categoria === post.categoria), ...outros.filter((p) => p.categoria !== post.categoria)].slice(0, 3);
  return <Artigo post={post} relacionados={relacionados} />;
}
