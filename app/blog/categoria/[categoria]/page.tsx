import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIAS, categoriaSlug, postsPublicados } from "@/lib/blog";
import { BlogIndice } from "@/components/blog/BlogIndice";

export const revalidate = 600;

const achar = (slug: string) => CATEGORIAS.find((c) => categoriaSlug(c) === slug);

export function generateStaticParams() {
  return CATEGORIAS.map((c) => ({ categoria: categoriaSlug(c) }));
}

export async function generateMetadata({ params }: { params: Promise<{ categoria: string }> }): Promise<Metadata> {
  const { categoria } = await params;
  const nome = achar(categoria);
  if (!nome) return {};
  const posts = await postsPublicados({ categoria });
  return {
    title: `${nome}: artigos para agências de tráfego`,
    description: `Artigos da Dattis sobre ${nome.toLowerCase()} para agências de tráfego pago: o que a LGPD exige, riscos e como se proteger na prática.`,
    alternates: { canonical: `/blog/categoria/${categoria}` },
    // Categoria vazia não deve ser indexada (conteúdo raso).
    robots: posts.length ? undefined : { index: false, follow: true },
  };
}

export default async function CategoriaPage({ params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params;
  const nome = achar(categoria);
  if (!nome) notFound();
  const posts = await postsPublicados({ categoria });
  return (
    <BlogIndice
      posts={posts}
      categoriaAtual={nome}
      titulo={nome}
      subtitulo={`Tudo o que publicamos sobre ${nome.toLowerCase()} para agências de tráfego pago.`}
    />
  );
}
