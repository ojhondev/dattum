import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Plus } from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { PixelEdge } from "@/components/marketing/PixelEdge";
import { JsonLd } from "@/components/seo/JsonLd";
import { categoriaSlug, type PostCompleto, type PostLista } from "@/lib/blog";
import { renderMarkdown, minutosDeLeitura } from "@/lib/markdown";
import { schemaBreadcrumb, schemaFaq } from "@/lib/schema-org";
import { SITE_URL, urlAbsoluta } from "@/lib/site";
import { ListaPosts, AvatarAutor, dataCurta } from "./ListaPosts";
import { Compartilhar } from "./Compartilhar";

export function Artigo({ post, relacionados, previa = false }: { post: PostCompleto; relacionados: PostLista[]; previa?: boolean }) {
  const { html, sumario } = renderMarkdown(post.conteudo, { siteHost: new URL(SITE_URL).host });
  const url = `${SITE_URL}/blog/${post.slug}`;
  const minutos = minutosDeLeitura(post.conteudo);
  const capa = post.capaUrl ? urlAbsoluta(post.capaUrl) : null;

  return (
    <>
      <SiteHeader />
      {previa && (
        <div className="sticky top-[76px] z-30 bg-orange px-5 py-2.5 text-center font-mono text-[12px] uppercase tracking-[0.05em] text-ink">
          Pré-visualização — {post.status === "publicado" ? "publicado" : "rascunho, ainda não está no ar"}
        </div>
      )}
      <main>
        <article>
          {/* Hero dividido: texto à esquerda, capa à direita (modelo proofmode.org/blog) */}
          <header className="grid lg:min-h-[min(760px,calc(100svh-76px))] lg:grid-cols-2">
            <div className="flex items-center px-5 pb-10 pt-10 sm:px-10 lg:px-[clamp(40px,7vw,100px)] lg:py-24">
              <div className="w-full">
                <nav aria-label="Trilha" className="font-mono text-[12px] uppercase tracking-[0.05em] text-muted">
                  <Link href="/blog" className="hover:text-ink">
                    Blog
                  </Link>
                  <span className="mx-2">/</span>
                  <Link href={`/blog/categoria/${categoriaSlug(post.categoria)}`} className="hover:text-ink">
                    {post.categoria}
                  </Link>
                </nav>
                <h1 className="mt-6 font-display text-[clamp(2.3rem,4.4vw,3.75rem)] leading-[1.08] text-ink">{post.titulo}</h1>
                {post.resumo && <p className="mt-6 max-w-[52ch] text-[19px] leading-relaxed text-body sm:text-[20px]">{post.resumo}</p>}
                <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
                  {post.autor && (
                    <span className="flex items-center gap-2.5">
                      <AvatarAutor autor={post.autor} tamanho={56} />
                      <span className="text-[14px] leading-tight">
                        <span className="block font-medium text-ink">{post.autor.nome}</span>
                        {post.autor.cargo && <span className="text-muted">{post.autor.cargo}</span>}
                      </span>
                    </span>
                  )}
                  <span className="flex flex-wrap gap-1">
                    <time dateTime={post.publicadoEm?.toISOString()} className="tag tag-white">
                      {dataCurta(post.publicadoEm)}
                    </time>
                    <span className="tag tag-white">{minutos} min de leitura</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="relative min-h-[300px] overflow-hidden bg-forest sm:min-h-[420px] lg:min-h-0">
              {capa ? (
                <Image src={capa} alt={post.capaAlt || post.titulo} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-end p-10">
                  <span className="font-display text-[clamp(2rem,4vw,3.4rem)] leading-none text-brand">{post.categoria}</span>
                </div>
              )}
            </div>
          </header>
          <div className="relative z-10 -mt-[88px] sm:-mt-[96px]">
            <PixelEdge bg="transparent" fill="var(--color-canvas)" />
          </div>

          <div className="mx-auto w-full max-w-[720px] px-5 pb-16 pt-8 sm:px-8">
            {sumario.filter((s) => s.nivel === 2).length >= 3 && (
              <details className="pixel-corners mb-10 bg-surface px-6 py-5" open>
                <summary className="flex cursor-pointer list-none items-center justify-between font-mono text-[12px] uppercase tracking-[0.05em] text-muted [&_svg]:open:rotate-45">
                  Neste artigo
                  <Plus size={16} className="transition-transform" />
                </summary>
                <ol className="mt-4 flex flex-col gap-2 text-[16px]">
                  {sumario
                    .filter((s) => s.nivel === 2)
                    .map((s) => (
                      <li key={s.id}>
                        <a href={`#${s.id}`} className="text-ink hover:text-brand-ink hover:underline">
                          {s.texto}
                        </a>
                      </li>
                    ))}
                </ol>
              </details>
            )}

            <div className="artigo" dangerouslySetInnerHTML={{ __html: html }} />

            {post.faq.length > 0 && (
              <section className="mt-16">
                <h2 className="font-display text-[clamp(1.6rem,2.6vw,2.1rem)] leading-tight text-ink">Perguntas frequentes</h2>
                <div className="mt-6 flex flex-col gap-3">
                  {post.faq.map((f) => (
                    <details key={f.pergunta} className="group rounded-[20px] bg-surface px-6 py-5 [&_svg]:open:rotate-45">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[17px] text-ink">
                        {f.pergunta}
                        <Plus size={18} className="shrink-0 transition-transform" />
                      </summary>
                      <p className="mt-3 text-[16px] leading-relaxed text-body">{f.resposta}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {post.tags.length > 0 && (
              <div className="mt-12 flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <span key={t} className="tag tag-white border border-line">
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-10 flex flex-wrap items-center justify-between gap-5 border-y border-line py-6">
              {post.autor ? (
                <div className="flex items-center gap-3.5">
                  <AvatarAutor autor={post.autor} tamanho={64} />
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-muted">Escrito por</p>
                    <p className="font-display text-[19px] text-ink">{post.autor.nome}</p>
                    {post.autor.bio && <p className="mt-1 max-w-md text-[14px] leading-snug text-muted">{post.autor.bio}</p>}
                  </div>
                </div>
              ) : (
                <span />
              )}
              <Compartilhar url={url} titulo={post.titulo} />
            </div>

            <div className="pixel-corners mt-12 bg-rail p-8 text-white sm:p-10">
              <p className="font-mono text-[12px] uppercase tracking-[0.06em] text-brand">Auditoria da sua agência</p>
              <p className="mt-3 font-display text-[clamp(1.5rem,2.6vw,2rem)] leading-tight">Quanto a sua agência está exposta à LGPD?</p>
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/75">
                19 perguntas sobre pixel, lista de clientes, API de Conversões, WhatsApp e contratos. Resultado na hora.
              </p>
              <Link href="/diagnostico" className="btn btn-primary btn-lg mt-6">
                Fazer a auditoria <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </article>

        {relacionados.length > 0 && (
          <section className="w-full px-5 pb-20 pt-6 sm:px-10 lg:px-14">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-[clamp(2rem,3.4vw,2.9rem)] leading-tight text-ink">Mais artigos</h2>
              <Link href="/blog" className="btn btn-ghost">
                Ver todos
              </Link>
            </div>
            <ListaPosts posts={relacionados} />
          </section>
        )}
      </main>
      <SiteFooter />

      {!previa && (
        <JsonLd
          dados={[
            {
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "@id": `${url}#artigo`,
              mainEntityOfPage: url,
              headline: post.seoTitulo || post.titulo,
              description: post.seoDescricao || post.resumo,
              image: capa ? [capa] : [`${url}/opengraph-image`],
              datePublished: post.publicadoEm?.toISOString(),
              dateModified: post.atualizadoEm.toISOString(),
              inLanguage: "pt-BR",
              articleSection: post.categoria,
              keywords: [post.palavraChave, ...post.tags].filter(Boolean).join(", "),
              wordCount: post.conteudo.split(/\s+/).length,
              author: post.autor
                ? { "@type": "Person", name: post.autor.nome, jobTitle: post.autor.cargo ?? undefined, url: `${SITE_URL}/blog` }
                : { "@id": `${SITE_URL}/#organizacao` },
              publisher: { "@id": `${SITE_URL}/#organizacao` },
            },
            schemaBreadcrumb([
              { nome: "Início", url: "/" },
              { nome: "Blog", url: "/blog" },
              { nome: post.categoria, url: `/blog/categoria/${categoriaSlug(post.categoria)}` },
              { nome: post.titulo, url: `/blog/${post.slug}` },
            ]),
            ...(post.faq.length ? [schemaFaq(post.faq)] : []),
          ]}
        />
      )}
    </>
  );
}
