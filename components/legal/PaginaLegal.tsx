import Link from "next/link";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { renderMarkdown } from "@/lib/markdown";
import { schemaBreadcrumb } from "@/lib/schema-org";
import { SITE_URL } from "@/lib/site";
import { DOCUMENTOS_LEGAIS, VERSAO_LEGAL, VIGENCIA_LEGAL, type DocumentoLegal } from "@/lib/legal";

/** Página de documento legal da Dattis (Termos, Privacidade, Contrato de dados), com sumário fixo no desktop. */
export function PaginaLegal({ id, markdown }: { id: DocumentoLegal; markdown: string }) {
  const doc = DOCUMENTOS_LEGAIS.find((d) => d.id === id)!;
  const { html, sumario } = renderMarkdown(markdown, { siteHost: new URL(SITE_URL).host });
  const secoes = sumario.filter((s) => s.nivel === 2);

  return (
    <>
      <SiteHeader />
      <JsonLd dados={schemaBreadcrumb([{ nome: "Início", url: "/" }, { nome: doc.titulo, url: doc.href }])} />
      <main>
        <section className="bg-gradient-to-br from-canvas via-canvas to-brand-tint">
          <div className="w-full px-5 pb-12 pt-14 sm:px-10 sm:pt-20 lg:px-14">
            <p className="t-eyebrow">Documentos legais da Dattis</p>
            <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.4rem,5vw,4rem)] leading-[1.06] text-ink">{doc.titulo}</h1>
            <p className="mt-5 max-w-2xl text-[18px] leading-relaxed text-body">{doc.resumo}</p>
            <p className="mt-6 flex flex-wrap gap-1.5">
              <span className="tag tag-white border border-line">Versão {VERSAO_LEGAL}</span>
              <span className="tag tag-white border border-line">Vigente desde {VIGENCIA_LEGAL}</span>
            </p>
            <nav aria-label="Documentos legais" className="mt-8 flex flex-wrap gap-1.5">
              {DOCUMENTOS_LEGAIS.map((d) => (
                <Link
                  key={d.id}
                  href={d.href}
                  aria-current={d.id === id ? "page" : undefined}
                  className={"tag " + (d.id === id ? "" : "tag-white border border-line")}
                >
                  {d.curto}
                </Link>
              ))}
            </nav>
          </div>
        </section>

        <div className="w-full px-5 pb-20 pt-10 sm:px-10 lg:grid lg:grid-cols-[260px_minmax(0,720px)] lg:gap-16 lg:px-14">
          <aside className="hidden lg:block">
            <nav aria-label="Neste documento" className="sticky top-[110px]">
              <p className="font-mono text-[12px] uppercase tracking-[0.05em] text-muted">Neste documento</p>
              <ol className="mt-4 flex flex-col gap-2 border-l border-line pl-4 text-[14px] leading-snug">
                {secoes.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-body hover:text-ink hover:underline">
                      {s.texto}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div>
            <details className="pixel-corners mb-10 bg-surface px-6 py-5 lg:hidden">
              <summary className="cursor-pointer list-none font-mono text-[12px] uppercase tracking-[0.05em] text-muted">Neste documento ({secoes.length} seções)</summary>
              <ol className="mt-4 flex flex-col gap-2 text-[15px]">
                {secoes.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-ink hover:underline">
                      {s.texto}
                    </a>
                  </li>
                ))}
              </ol>
            </details>
            <div className="artigo artigo-legal" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
