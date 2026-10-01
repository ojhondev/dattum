import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, autores } from "@/lib/db/schema";
import { analisarSeo, faixaSeo } from "@/lib/seo-analise";
import { SITE_URL } from "@/lib/site";
import { agoraMs } from "@/lib/utils";
import { NovoArtigo } from "./NovoArtigo";

export const dynamic = "force-dynamic";

const TH = "border-b border-line px-4 py-3 text-left font-mono text-[12px] font-normal uppercase tracking-[0.04em] text-muted";
const TD = "border-b border-line px-4 py-3.5 align-middle";

export default async function AdminBlog() {
  const rows = await db.select({ post: posts, autor: autores.nome }).from(posts).leftJoin(autores, eq(posts.autorId, autores.id)).orderBy(desc(posts.atualizadoEm));
  const agora = agoraMs();
  const host = new URL(SITE_URL).host;

  const lista = rows.map(({ post, autor }) => {
    const agendado = post.status === "publicado" && !!post.publicadoEm && post.publicadoEm.getTime() > agora;
    const estado = post.status !== "publicado" ? "rascunho" : agendado ? "agendado" : "publicado";
    return { post, autor, estado, seo: analisarSeo({ ...post, siteHost: host }).nota };
  });
  const publicados = lista.filter((l) => l.estado === "publicado").length;
  const mediaSeo = lista.length ? Math.round(lista.reduce((s, l) => s + l.seo, 0) / lista.length) : 0;

  return (
    <div className="max-w-7xl">
      <p className="t-eyebrow">WebMaster · Blog</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="t-display">Artigos do blog</h1>
        <NovoArtigo />
      </div>
      <p className="mt-4 max-w-2xl text-body leading-relaxed text-body">
        Cada artigo publicado entra sozinho no sitemap, no RSS e na página /blog, com dados estruturados pro Google. Use a nota de SEO
        do editor como guia antes de publicar.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <span className="tag">{publicados} publicado(s)</span>
        <span className="tag tag-white border border-line">{lista.filter((l) => l.estado === "agendado").length} agendado(s)</span>
        <span className="tag tag-white border border-line">{lista.filter((l) => l.estado === "rascunho").length} rascunho(s)</span>
        {lista.length > 0 && <span className="tag tag-white border border-line">SEO médio {mediaSeo}</span>}
        <a href="/blog" target="_blank" className="tag tag-white border border-line">
          Ver blog ↗
        </a>
      </div>

      <div className="card-flush mt-6 overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-body-sm">
          <thead>
            <tr className="bg-surface-2">
              <th className={TH}>Artigo</th>
              <th className={TH}>Status</th>
              <th className={TH}>Palavra-chave</th>
              <th className={TH}>SEO</th>
              <th className={TH}>Categoria</th>
              <th className={TH}>Atualizado</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(({ post, autor, estado, seo }) => {
              const f = faixaSeo(seo);
              return (
                <tr key={post.id} className="transition-colors last:[&>td]:border-b-0 hover:bg-surface-2">
                  <td className={TD}>
                    <Link href={`/admin/blog/${post.id}`} className="font-display text-[17px] text-ink hover:underline">
                      {post.titulo}
                    </Link>
                    <span className="block text-[12.5px] text-muted">
                      /blog/{post.slug}
                      {autor ? ` · ${autor}` : ""}
                    </span>
                  </td>
                  <td className={TD}>
                    {estado === "publicado" ? (
                      <span className="pill pill-ok">Publicado</span>
                    ) : estado === "agendado" ? (
                      <span className="pill pill-info" title={post.publicadoEm?.toLocaleString("pt-BR")}>
                        Agendado
                      </span>
                    ) : (
                      <span className="pill pill-neutral">Rascunho</span>
                    )}
                  </td>
                  <td className={TD + " text-muted"}>{post.palavraChave ?? "—"}</td>
                  <td className={TD}>
                    <span className={"inline-flex rounded-full px-2.5 py-1 font-mono text-[12px] tabular-nums " + f.classe}>
                      {seo} · {f.label}
                    </span>
                  </td>
                  <td className={TD}>{post.categoria}</td>
                  <td className={TD + " whitespace-nowrap text-muted"}>{post.atualizadoEm.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</td>
                </tr>
              );
            })}
            {lista.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted">
                  Nenhum artigo ainda. Clique em “Novo artigo”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
