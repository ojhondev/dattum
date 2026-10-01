import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { PixelEdge } from "@/components/marketing/PixelEdge";
import { JsonLd } from "@/components/seo/JsonLd";
import { CATEGORIAS, categoriaSlug, type PostLista } from "@/lib/blog";
import { schemaBreadcrumb } from "@/lib/schema-org";
import { SITE_URL } from "@/lib/site";
import { ListaPosts } from "./ListaPosts";

/** Página de listagem do blog (todas ou por categoria). */
export function BlogIndice({ posts, categoriaAtual, titulo, subtitulo }: { posts: PostLista[]; categoriaAtual?: string; titulo: string; subtitulo: string }) {
  const usadas = CATEGORIAS;
  const caminho = categoriaAtual ? `/blog/categoria/${categoriaSlug(categoriaAtual)}` : "/blog";

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-gradient-to-br from-canvas via-canvas to-brand-tint">
          <div className="w-full px-5 pb-14 pt-14 sm:px-10 sm:pt-20 lg:px-14">
            <p className="t-eyebrow">{categoriaAtual ? `Blog · ${categoriaAtual}` : "Blog Dattis"}</p>
            <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.5rem,5.2vw,4.2rem)] leading-[1.06] text-ink">{titulo}</h1>
            <p className="mt-5 max-w-2xl text-[18px] leading-relaxed text-body">{subtitulo}</p>
            <nav aria-label="Categorias" className="mt-9 flex flex-wrap gap-1.5">
              <Link href="/blog" className={"tag " + (!categoriaAtual ? "" : "tag-white border border-line")}>
                Todos
              </Link>
              {usadas.map((c) => (
                <Link key={c} href={`/blog/categoria/${categoriaSlug(c)}`} className={"tag " + (categoriaAtual === c ? "" : "tag-white border border-line")}>
                  {c}
                </Link>
              ))}
            </nav>
          </div>
        </section>

        <section className="w-full px-5 pb-20 sm:px-10 lg:px-14">
          {posts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-display text-[26px] text-ink">Os primeiros artigos estão chegando.</p>
              <p className="mt-3 text-body">Enquanto isso, descubra quanto sua agência está exposta à LGPD.</p>
              <Link href="/diagnostico" className="btn btn-dark btn-lg mt-7">
                Fazer a Auditoria da sua agência <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <ListaPosts posts={posts} />
          )}
        </section>

        <PixelEdge bg="var(--color-canvas)" fill="var(--color-forest)" />
        <section className="bg-forest text-white">
          <div className="grid w-full gap-8 px-5 py-16 sm:px-10 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:px-14">
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.06em] text-brand">Auditoria da sua agência</p>
              <h2 className="mt-4 max-w-2xl font-display text-[clamp(1.8rem,3.4vw,2.8rem)] leading-tight text-white">
                Leu sobre o risco? Descubra em 3 minutos quanto sua agência está exposta.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href="/diagnostico" className="btn btn-primary btn-lg">
                Fazer a auditoria
              </Link>
              <Link href="/planos" className="btn btn-lg border-white/25 text-white hover:border-white/60">
                Ver planos
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <JsonLd
        dados={[
          {
            "@context": "https://schema.org",
            "@type": categoriaAtual ? "CollectionPage" : "Blog",
            name: titulo,
            description: subtitulo,
            url: `${SITE_URL}${caminho}`,
            inLanguage: "pt-BR",
            publisher: { "@id": `${SITE_URL}/#organizacao` },
            blogPost: posts.slice(0, 20).map((p) => ({
              "@type": "BlogPosting",
              headline: p.titulo,
              url: `${SITE_URL}/blog/${p.slug}`,
              datePublished: p.publicadoEm?.toISOString(),
              author: p.autor ? { "@type": "Person", name: p.autor.nome } : undefined,
            })),
          },
          schemaBreadcrumb(
            categoriaAtual
              ? [
                  { nome: "Início", url: "/" },
                  { nome: "Blog", url: "/blog" },
                  { nome: categoriaAtual, url: caminho },
                ]
              : [
                  { nome: "Início", url: "/" },
                  { nome: "Blog", url: "/blog" },
                ],
          ),
        ]}
      />
    </>
  );
}
