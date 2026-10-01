import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { autores, posts, configuracoes } from "@/lib/db/schema";
import { analisarSeo } from "@/lib/seo-analise";
import { SITE_URL } from "@/lib/site";
import { agoraMs } from "@/lib/utils";
import { ConfiguracoesSeo, Autores } from "./SeoClient";

export const dynamic = "force-dynamic";

type Estado = "ok" | "aviso" | "erro";
const COR: Record<Estado, string> = { ok: "bg-brand-strong", aviso: "bg-caution", erro: "bg-danger" };

export default async function AdminSeo() {
  const [cfgRows, lista, listaAutores] = await Promise.all([
    db.select().from(configuracoes),
    db.select().from(posts),
    db.select().from(autores).orderBy(asc(autores.criadoEm)),
  ]);
  const cfg = Object.fromEntries(cfgRows.map((r) => [r.chave, r.valor]));
  const host = new URL(SITE_URL).host;
  const agora = agoraMs();
  const publicados = lista.filter((p) => p.status === "publicado" && p.publicadoEm && p.publicadoEm.getTime() <= agora);
  const analises = publicados.map((p) => ({ p, nota: analisarSeo({ ...p, siteHost: host }).nota }));
  const semDescricao = publicados.filter((p) => !p.seoDescricao && !p.resumo).length;
  const fracos = analises.filter((a) => a.nota < 60);
  const semCapa = publicados.filter((p) => !p.capaUrl).length;
  const dominioProprio = !host.endsWith(".vercel.app");

  const saude: { estado: Estado; texto: string; detalhe?: string }[] = [
    dominioProprio
      ? { estado: "ok", texto: `Domínio próprio: ${host}` }
      : {
          estado: "erro",
          texto: `O site está em ${host}`,
          detalhe:
            "Domínio .vercel.app é compartilhado e passa menos confiança pro Google. Conecte um domínio próprio (ex.: dattis.com.br) na Vercel e atualize NEXT_PUBLIC_SITE_URL — todo o SEO acompanha automaticamente.",
        },
    cfg.google_verificacao
      ? { estado: "ok", texto: "Google Search Console verificado (tag no código do site)" }
      : { estado: "erro", texto: "Google Search Console não configurado", detalhe: "Sem isso você não vê quais buscas trazem visitas nem consegue pedir indexação." },
    cfg.bing_verificacao ? { estado: "ok", texto: "Bing Webmaster verificado" } : { estado: "aviso", texto: "Bing Webmaster não configurado (opcional)" },
    { estado: "ok", texto: "Sitemap automático com páginas, categorias e artigos", detalhe: `${SITE_URL}/sitemap.xml` },
    { estado: "ok", texto: "robots.txt bloqueando painel, admin e API", detalhe: `${SITE_URL}/robots.txt` },
    { estado: "ok", texto: "RSS do blog", detalhe: `${SITE_URL}/blog/rss.xml` },
    { estado: "ok", texto: "Dados estruturados: Organização, Site, Artigo, Trilha e FAQ" },
    { estado: "ok", texto: "Imagem de compartilhamento gerada para cada artigo" },
    publicados.length >= 8
      ? { estado: "ok", texto: `${publicados.length} artigos publicados` }
      : {
          estado: "aviso",
          texto: `${publicados.length} artigo(s) publicado(s)`,
          detalhe: "Para ganhar autoridade num tema, publique com constância: 1 a 2 artigos por semana nos primeiros 3 meses.",
        },
    semDescricao ? { estado: "erro", texto: `${semDescricao} artigo(s) sem meta description` } : { estado: "ok", texto: "Todos os artigos com meta description" },
    fracos.length
      ? { estado: "aviso", texto: `${fracos.length} artigo(s) publicado(s) com SEO abaixo de 60`, detalhe: fracos.map((f) => f.p.titulo).join(" · ") }
      : { estado: "ok", texto: "Nenhum artigo publicado com SEO fraco" },
    semCapa ? { estado: "aviso", texto: `${semCapa} artigo(s) sem imagem de capa` } : { estado: "ok", texto: "Todos os artigos com capa" },
  ];

  const passos = [
    { t: "Conecte um domínio próprio", d: "Na Vercel: Settings → Domains. Depois atualize a variável NEXT_PUBLIC_SITE_URL com o domínio novo." },
    { t: "Verifique no Google Search Console", d: "search.google.com/search-console → Adicionar propriedade → Prefixo do URL → Tag HTML. Cole a tag no campo abaixo e clique em Verificar lá." },
    { t: "Envie o sitemap", d: "No Search Console: Sitemaps → digite sitemap.xml → Enviar. Novos artigos entram sozinhos nele." },
    { t: "Peça indexação de cada artigo novo", d: "Inspeção de URL → cole a URL do artigo → Solicitar indexação. Acelera de semanas para dias." },
    { t: "Publique com constância e linke entre artigos", d: "Cada artigo deve linkar para /diagnostico, /planos e para 1 ou 2 outros artigos do blog." },
  ];

  return (
    <div className="max-w-6xl">
      <p className="t-eyebrow">WebMaster · SEO</p>
      <h1 className="t-display mt-3 max-w-3xl">SEO e indexação no Google</h1>

      <div className="mt-10 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <section className="rounded-[24px] border border-line bg-surface p-6">
          <h2 className="t-heading">Saúde do SEO</h2>
          <ul className="mt-5 flex flex-col gap-3">
            {saude.map((s) => (
              <li key={s.texto} className="flex gap-3">
                <span className={"mt-[7px] h-2.5 w-2.5 shrink-0 " + COR[s.estado]} />
                <span>
                  <span className="block text-[15px] text-ink">{s.texto}</span>
                  {s.detalhe &&
                    (s.detalhe.startsWith("http") ? (
                      <a href={s.detalhe} target="_blank" rel="noopener" className="text-[13px] text-brand-ink hover:underline">
                        {s.detalhe}
                      </a>
                    ) : (
                      <span className="block text-[13px] leading-snug text-muted">{s.detalhe}</span>
                    ))}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[24px] bg-rail p-6 text-white">
          <h2 className="font-display text-[1.5rem] text-white">Como aparecer no Google</h2>
          <ol className="mt-5 flex flex-col gap-4">
            {passos.map((p, i) => (
              <li key={p.t} className="flex gap-3.5">
                <span className="pixel-corners pixel-corners-sm grid h-7 w-7 shrink-0 place-items-center bg-brand font-mono text-[13px] text-on-brand">{i + 1}</span>
                <span>
                  <span className="block text-[15px] text-white">{p.t}</span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-white/65">{p.d}</span>
                </span>
              </li>
            ))}
          </ol>
          <a href="https://search.google.com/search-console" target="_blank" rel="noopener" className="btn btn-primary mt-6">
            Abrir o Search Console
          </a>
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[24px] border border-line bg-surface p-6">
          <h2 className="t-heading">Configurações</h2>
          <div className="mt-5">
            <ConfiguracoesSeo inicial={cfg} />
          </div>
        </section>
        <section className="rounded-[24px] border border-line bg-surface p-6">
          <h2 className="t-heading">Autores</h2>
          <p className="mt-1 text-[13px] leading-snug text-muted">Autor com nome, foto e bio reais aumenta a confiança do Google no conteúdo (E-E-A-T).</p>
          <div className="mt-5">
            <Autores autores={listaAutores.map((a) => ({ id: a.id, nome: a.nome, cargo: a.cargo ?? "", bio: a.bio ?? "", fotoUrl: a.fotoUrl ?? "" }))} />
          </div>
        </section>
      </div>
    </div>
  );
}
