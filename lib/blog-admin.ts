import { revalidatePath } from "next/cache";

/** Depois de salvar/publicar: invalida blog, artigo, categorias, sitemap e RSS. */
export function revalidarBlog(slugs: (string | null | undefined)[] = []) {
  revalidatePath("/blog");
  revalidatePath("/blog/categoria/[categoria]", "page");
  revalidatePath("/blog/[slug]", "page");
  for (const s of slugs) if (s) revalidatePath(`/blog/${s}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/blog/rss.xml");
}

const texto = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);
const textoOuNulo = (v: unknown, max = 500) => {
  if (v === null) return null;
  const t = texto(v, max);
  return t === undefined ? undefined : t || null;
};

/** Normaliza o corpo enviado pelo editor. Campos ausentes ficam undefined (não alteram). */
export function lerCamposPost(b: Record<string, unknown>) {
  const tags = Array.isArray(b.tags)
    ? b.tags
        .filter((t): t is string => typeof t === "string" && !!t.trim())
        .map((t) => t.trim().slice(0, 40))
        .slice(0, 12)
    : undefined;
  const faq = Array.isArray(b.faq)
    ? b.faq
        .map((f) => {
          const item = f as { pergunta?: unknown; resposta?: unknown };
          return { pergunta: texto(item?.pergunta, 300) ?? "", resposta: texto(item?.resposta, 2000) ?? "" };
        })
        .filter((f) => f.pergunta && f.resposta)
        .slice(0, 12)
    : undefined;
  const data = typeof b.publicadoEm === "string" && b.publicadoEm ? new Date(b.publicadoEm) : b.publicadoEm === null ? null : undefined;
  return {
    titulo: texto(b.titulo, 200),
    slug: texto(b.slug, 90),
    resumo: texto(b.resumo, 400),
    conteudo: typeof b.conteudo === "string" ? b.conteudo.slice(0, 200_000) : undefined,
    capaUrl: textoOuNulo(b.capaUrl, 1000),
    capaAlt: textoOuNulo(b.capaAlt, 300),
    categoria: texto(b.categoria, 60),
    tags,
    autorId: b.autorId === null || b.autorId === "" ? null : typeof b.autorId === "string" ? b.autorId : undefined,
    status: b.status === "publicado" || b.status === "rascunho" ? (b.status as string) : undefined,
    publicadoEm: data && !isNaN(data.getTime()) ? data : data === null ? null : undefined,
    seoTitulo: textoOuNulo(b.seoTitulo, 120),
    seoDescricao: textoOuNulo(b.seoDescricao, 320),
    palavraChave: textoOuNulo(b.palavraChave, 80),
    canonical: textoOuNulo(b.canonical, 500),
    ogImagem: textoOuNulo(b.ogImagem, 1000),
    noindex: typeof b.noindex === "boolean" ? b.noindex : undefined,
    faq,
  };
}
