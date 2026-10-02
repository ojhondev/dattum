import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { politicaPorSlug } from "@/lib/politica-publica";
import { renderMarkdown } from "@/lib/markdown";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

// Fora do Google de propósito: centenas de políticas parecidas no domínio da Dattis
// pareceriam conteúdo repetido. O link de rodapé para a Dattis continua valendo.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await politicaPorSlug((await params).slug);
  return {
    title: p ? { absolute: `Política de Privacidade · ${p.titular}` } : "Política de Privacidade",
    robots: { index: false, follow: true },
  };
}

export default async function PoliticaPublicaPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await politicaPorSlug((await params).slug);
  if (!p) notFound();
  const { html, sumario } = renderMarkdown(p.markdown, { siteHost: new URL(SITE_URL).host });
  const secoes = sumario.filter((s) => s.nivel === 2);
  const atualizada = p.atualizadaEm.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

  return (
    <div className="min-h-svh bg-canvas">
      <header className="border-b border-line bg-gradient-to-br from-canvas via-canvas to-brand-tint">
        <div className="w-full px-5 pb-10 pt-12 sm:px-10 sm:pt-16 lg:px-14">
          <p className="t-eyebrow">{p.titular}</p>
          <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.06] text-ink">Política de Privacidade</h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-body">
            Como {p.tipo === "agencia" ? "a" : ""} {p.titular} trata seus dados pessoais, com quem compartilha e como você exerce seus direitos.
          </p>
          <p className="mt-6 flex flex-wrap gap-1.5">
            <span className="tag tag-white border border-line">Atualizada em {atualizada}</span>
            {p.certificado && (
              <Link href={`/verificar/${p.certificado.codigo}`} className="tag tag-white inline-flex items-center gap-1.5 border border-line">
                <ShieldCheck size={13} /> Certificado de privacidade válido
              </Link>
            )}
          </p>
        </div>
      </header>

      <main className="w-full px-5 pb-16 pt-10 sm:px-10 lg:grid lg:grid-cols-[240px_minmax(0,760px)] lg:gap-16 lg:px-14">
        <aside className="hidden lg:block">
          <nav aria-label="Nesta política" className="sticky top-8">
            <p className="font-mono text-[12px] uppercase tracking-[0.05em] text-muted">Nesta política</p>
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
        <div className="artigo artigo-legal" dangerouslySetInnerHTML={{ __html: html }} />
      </main>

      <footer className="border-t border-line px-5 py-6 sm:px-10 lg:px-14">
        <p className="text-[13px] text-muted">
          Política mantida com a{" "}
          <a href={`${SITE_URL}/?utm_source=politica&utm_medium=rodape`} className="font-medium text-ink underline underline-offset-2">
            Dattis
          </a>
          , plataforma de conformidade com a LGPD para agências de tráfego.
        </p>
      </footer>
    </div>
  );
}
