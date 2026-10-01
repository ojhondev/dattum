import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { postsPublicados, CATEGORIAS, categoriaSlug } from "@/lib/blog";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = (await postsPublicados().catch(() => [])).filter((p) => !p.noindex && !p.canonical);
  const ultimoPost = posts[0]?.atualizadoEm ?? new Date();
  const categoriasUsadas = CATEGORIAS.filter((c) => posts.some((p) => p.categoria === c));

  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/planos`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/diagnostico`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/auditoria`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/termos`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacidade`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/contrato-de-dados`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/blog`, lastModified: ultimoPost, changeFrequency: "daily", priority: 0.8 },
    ...categoriasUsadas.map((c) => ({ url: `${SITE_URL}/blog/categoria/${categoriaSlug(c)}`, lastModified: ultimoPost, changeFrequency: "weekly" as const, priority: 0.5 })),
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.atualizadoEm,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: p.capaUrl ? [p.capaUrl.startsWith("http") ? p.capaUrl : `${SITE_URL}${p.capaUrl}`] : undefined,
    })),
  ];
}
