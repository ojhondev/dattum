// Markdown → HTML do blog. Isomórfico: o mesmo render serve a página pública e a pré-visualização do editor.
import { Marked, type Tokens } from "marked";

export type ItemSumario = { id: string; texto: string; nivel: 2 | 3 };

export function slugify(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/-$/, "");
}

const textoPuro = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&[a-z#0-9]+;/gi, " ");
const escapar = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Só deixa passar link http(s), e-mail, telefone, caminho do site e âncora. Bloqueia javascript:, data: etc. */
function hrefSeguro(href: string) {
  const h = (href || "").trim();
  if (/^[a-z][a-z0-9+.-]*:/i.test(h) && !/^(https?|mailto|tel):/i.test(h)) return "#";
  return escapar(h);
}

/**
 * `seguro`: para texto que veio de agência/cliente (política pública): HTML cru vira texto.
 * O blog (escrito só pelo admin) aceita HTML no Markdown.
 */
export function renderMarkdown(md: string, opts: { siteHost?: string; seguro?: boolean } = {}) {
  const sumario: ItemSumario[] = [];
  const usados = new Map<string, number>();
  const marked = new Marked({ gfm: true, breaks: false });

  marked.use({
    renderer: {
      heading(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, { tokens, depth, text }: Tokens.Heading) {
        const html = this.parser.parseInline(tokens);
        const base = slugify(textoPuro(text)) || "secao";
        const n = usados.get(base) ?? 0;
        usados.set(base, n + 1);
        const id = n ? `${base}-${n}` : base;
        // O título do artigo é o único H1 da página; # no conteúdo vira H2.
        const nivel = Math.min(6, Math.max(2, depth));
        if (nivel === 2 || nivel === 3) sumario.push({ id, texto: textoPuro(html), nivel });
        return `<h${nivel} id="${id}">${html}</h${nivel}>\n`;
      },
      link(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, { href, title, tokens }: Tokens.Link) {
        const html = this.parser.parseInline(tokens);
        const externo = /^https?:\/\//.test(href) && !(opts.siteHost && href.includes(opts.siteHost));
        const t = title ? ` title="${escapar(title)}"` : "";
        const destino = hrefSeguro(href);
        return externo
          ? `<a href="${destino}"${t} target="_blank" rel="noopener">${html}</a>`
          : `<a href="${destino}"${t}>${html}</a>`;
      },
      image({ href, title, text }: Tokens.Image) {
        const legenda = title ? `<figcaption>${escapar(title)}</figcaption>` : "";
        return `<figure><img src="${hrefSeguro(href)}" alt="${text.replace(/"/g, "&quot;")}" loading="lazy" decoding="async" />${legenda}</figure>`;
      },
      ...(opts.seguro ? { html: ({ text }: Tokens.HTML | Tokens.Tag) => escapar(text) } : {}),
    },
  });

  const html = (marked.parse(md || "", { async: false }) as string)
    .replace(/<p>(<figure>[\s\S]*?<\/figure>)<\/p>/g, "$1") // imagem sozinha no parágrafo vira figura solta
    .replace(/<table>/g, '<div class="tabela"><table>')
    .replace(/<\/table>/g, "</table></div>");
  return { html, sumario };
}

export function contarPalavras(md: string) {
  const limpo = (md || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`|~-]/g, " ");
  return limpo.split(/\s+/).filter(Boolean).length;
}

export const minutosDeLeitura = (md: string) => Math.max(1, Math.round(contarPalavras(md) / 200));
