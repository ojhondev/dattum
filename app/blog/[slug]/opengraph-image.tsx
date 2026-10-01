import { postPorSlug } from "@/lib/blog";
import { imagemOg, OG_SIZE } from "@/lib/og";

export const alt = "Artigo do blog Dattis";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 600;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await postPorSlug(slug);
  return imagemOg({
    eyebrow: post?.categoria ?? "Blog",
    titulo: post?.titulo ?? "Blog Dattis",
    rodape: post?.autor ? `Por ${post.autor.nome} · dattis` : "Blog Dattis",
  });
}
