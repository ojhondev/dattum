import { and, desc, eq, lte, ne } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { posts, autores, configuracoes } from "@/lib/db/schema";
import { slugify } from "@/lib/markdown";

export const CATEGORIAS = ["LGPD", "Tráfego pago", "BM e Meta Ads", "Segurança de dados", "Gestão de agência"];
export const categoriaSlug = (c: string) => slugify(c);

/** Publicado e com data já passada (data futura = agendado, ainda invisível). */
const visivel = () => and(eq(posts.status, "publicado"), lte(posts.publicadoEm, new Date()));

export type PostLista = Awaited<ReturnType<typeof postsPublicados>>[number];

export async function postsPublicados(opts: { categoria?: string; limite?: number; excetoId?: string } = {}) {
  const rows = await db
    .select({ post: posts, autor: autores })
    .from(posts)
    .leftJoin(autores, eq(posts.autorId, autores.id))
    .where(and(visivel(), opts.excetoId ? ne(posts.id, opts.excetoId) : undefined))
    .orderBy(desc(posts.publicadoEm))
    .limit(opts.limite ?? 500);
  return rows
    .filter((r) => !opts.categoria || categoriaSlug(r.post.categoria) === opts.categoria)
    .map((r) => ({ ...r.post, autor: r.autor }));
}

export async function postPorSlug(slug: string) {
  const [r] = await db
    .select({ post: posts, autor: autores })
    .from(posts)
    .leftJoin(autores, eq(posts.autorId, autores.id))
    .where(and(eq(posts.slug, slug), visivel()))
    .limit(1);
  return r ? { ...r.post, autor: r.autor } : null;
}

export async function postPorId(id: string) {
  const [r] = await db.select({ post: posts, autor: autores }).from(posts).leftJoin(autores, eq(posts.autorId, autores.id)).where(eq(posts.id, id)).limit(1);
  return r ? { ...r.post, autor: r.autor } : null;
}

export type PostCompleto = NonNullable<Awaited<ReturnType<typeof postPorSlug>>>;

// ---------- Configurações globais de SEO ----------

export const CHAVES_CONFIG = [
  "google_verificacao",
  "bing_verificacao",
  "site_descricao",
  "instagram",
  "linkedin",
  "youtube",
  // Dados da empresa (Termos, Privacidade, contrato de dados)
  "empresa_razao_social",
  "empresa_cnpj",
  "empresa_endereco",
  "email_contato",
  "encarregado_nome",
  "encarregado_email",
] as const;
export type ChaveConfig = (typeof CHAVES_CONFIG)[number];

export const lerConfiguracoes = unstable_cache(
  async () => {
    try {
      const rows = await db.select().from(configuracoes);
      return Object.fromEntries(rows.map((r) => [r.chave, r.valor])) as Partial<Record<ChaveConfig, string>>;
    } catch {
      return {} as Partial<Record<ChaveConfig, string>>;
    }
  },
  ["configuracoes-site"],
  { tags: ["configuracoes"], revalidate: 3600 },
);
