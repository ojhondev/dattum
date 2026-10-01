import { postsPublicados } from "@/lib/blog";
import { SITE_URL, SITE_NOME } from "@/lib/site";

export const revalidate = 3600;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const posts = (await postsPublicados({ limite: 50 })).filter((p) => !p.noindex);
  const itens = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.titulo)}</title>
      <link>${SITE_URL}/blog/${p.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${p.slug}</guid>
      <pubDate>${(p.publicadoEm ?? p.criadoEm).toUTCString()}</pubDate>
      <category>${esc(p.categoria)}</category>
      <description>${esc(p.seoDescricao || p.resumo)}</description>${p.autor ? `\n      <dc:creator>${esc(p.autor.nome)}</dc:creator>` : ""}
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Blog ${SITE_NOME} — LGPD para agências de tráfego pago</title>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <description>LGPD, BM suspensa, pixel, API de Conversões e segurança de dados para agências de tráfego pago.</description>
    <language>pt-BR</language>
${itens}
  </channel>
</rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
