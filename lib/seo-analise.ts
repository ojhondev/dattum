// Análise de SEO on-page do artigo, ao vivo no editor do CMS. Sem dependência de servidor.
import { contarPalavras, slugify } from "@/lib/markdown";

export type NivelCheck = "ok" | "aviso" | "erro";
export type Check = { id: string; grupo: "Palavra-chave" | "Título e descrição" | "Conteúdo" | "Links e mídia" | "Leitura"; nivel: NivelCheck; texto: string; peso: number };

export type EntradaSeo = {
  titulo: string;
  seoTitulo?: string | null;
  seoDescricao?: string | null;
  resumo?: string | null;
  slug: string;
  conteudo: string;
  palavraChave?: string | null;
  capaUrl?: string | null;
  capaAlt?: string | null;
  faq?: { pergunta: string; resposta: string }[];
  siteHost?: string;
};

export const LIMITES = { tituloMin: 35, tituloMax: 60, descMin: 120, descMax: 158, palavrasMin: 800 };

const normalizar = (s: string) =>
  (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const contem = (texto: string, termo: string) => !!termo && normalizar(texto).includes(normalizar(termo));

function ocorrencias(texto: string, termo: string) {
  if (!termo) return 0;
  const t = normalizar(texto);
  const k = normalizar(termo).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (t.match(new RegExp(`(^|[^a-z0-9])${k}(?=[^a-z0-9]|$)`, "g")) || []).length;
}

export const tituloEfetivo = (e: Pick<EntradaSeo, "titulo" | "seoTitulo">) => (e.seoTitulo?.trim() || e.titulo || "").trim();
export const descricaoEfetiva = (e: Pick<EntradaSeo, "seoDescricao" | "resumo">) => (e.seoDescricao?.trim() || e.resumo?.trim() || "").trim();

export function analisarSeo(e: EntradaSeo) {
  const checks: Check[] = [];
  const add = (c: Check) => checks.push(c);
  const kw = (e.palavraChave || "").trim();
  const titulo = tituloEfetivo(e);
  const desc = descricaoEfetiva(e);
  const md = e.conteudo || "";
  const palavras = contarPalavras(md);
  const paragrafos = md.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p && !/^(#|!\[|\||>|-|\*|\d+\.)/.test(p));
  const primeiro = paragrafos[0] ?? "";
  const subtitulos = [...md.matchAll(/^#{2,3}\s+(.+)$/gm)].map((m) => m[1]);
  const links = [...md.matchAll(/(?<!!)\[[^\]]*\]\(([^)\s]+)[^)]*\)/g)].map((m) => m[1]);
  const internos = links.filter((h) => h.startsWith("/") || (!!e.siteHost && h.includes(e.siteHost)));
  const externos = links.filter((h) => /^https?:\/\//.test(h) && !(e.siteHost && h.includes(e.siteHost)));
  const imagens = [...md.matchAll(/!\[([^\]]*)\]\(/g)].map((m) => m[1]);

  // Palavra-chave
  if (!kw) {
    add({ id: "kw", grupo: "Palavra-chave", nivel: "erro", peso: 12, texto: "Defina a palavra-chave foco (o termo que a pessoa digita no Google)." });
  } else {
    add({ id: "kw", grupo: "Palavra-chave", nivel: "ok", peso: 4, texto: `Palavra-chave foco: “${kw}”.` });
    const posTitulo = normalizar(titulo).indexOf(normalizar(kw));
    add(
      posTitulo === -1
        ? { id: "kw-titulo", grupo: "Palavra-chave", nivel: "erro", peso: 10, texto: "A palavra-chave não aparece no título SEO." }
        : posTitulo > titulo.length / 2
          ? { id: "kw-titulo", grupo: "Palavra-chave", nivel: "aviso", peso: 10, texto: "Palavra-chave no título, mas no final. No começo do título ela pesa mais." }
          : { id: "kw-titulo", grupo: "Palavra-chave", nivel: "ok", peso: 10, texto: "Palavra-chave no começo do título SEO." },
    );
    add(contem(desc, kw)
      ? { id: "kw-desc", grupo: "Palavra-chave", nivel: "ok", peso: 6, texto: "Palavra-chave na meta description." }
      : { id: "kw-desc", grupo: "Palavra-chave", nivel: "aviso", peso: 6, texto: "Use a palavra-chave na meta description (o Google destaca em negrito)." });
    add(slugify(e.slug).includes(slugify(kw))
      ? { id: "kw-slug", grupo: "Palavra-chave", nivel: "ok", peso: 6, texto: "Palavra-chave na URL." }
      : { id: "kw-slug", grupo: "Palavra-chave", nivel: "aviso", peso: 6, texto: `Coloque a palavra-chave na URL (ex.: /blog/${slugify(kw)}).` });
    add(contem(primeiro, kw)
      ? { id: "kw-intro", grupo: "Palavra-chave", nivel: "ok", peso: 6, texto: "Palavra-chave no primeiro parágrafo." }
      : { id: "kw-intro", grupo: "Palavra-chave", nivel: "aviso", peso: 6, texto: "Cite a palavra-chave logo no primeiro parágrafo." });
    add(subtitulos.some((s) => contem(s, kw))
      ? { id: "kw-sub", grupo: "Palavra-chave", nivel: "ok", peso: 5, texto: "Palavra-chave em pelo menos um subtítulo." }
      : { id: "kw-sub", grupo: "Palavra-chave", nivel: "aviso", peso: 5, texto: "Use a palavra-chave (ou variação) em um subtítulo H2/H3." });
    const dens = palavras ? (ocorrencias(md, kw) * kw.split(/\s+/).length * 100) / palavras : 0;
    add(dens < 0.4
      ? { id: "kw-dens", grupo: "Palavra-chave", nivel: "aviso", peso: 5, texto: `Densidade da palavra-chave baixa (${dens.toFixed(1)}%). Ideal entre 0,5% e 2,5%.` }
      : dens > 2.8
        ? { id: "kw-dens", grupo: "Palavra-chave", nivel: "erro", peso: 5, texto: `Palavra-chave repetida demais (${dens.toFixed(1)}%). Soa forçado e o Google penaliza.` }
        : { id: "kw-dens", grupo: "Palavra-chave", nivel: "ok", peso: 5, texto: `Densidade da palavra-chave boa (${dens.toFixed(1)}%).` });
  }

  // Título e descrição
  add(titulo.length < LIMITES.tituloMin
    ? { id: "titulo-len", grupo: "Título e descrição", nivel: "aviso", peso: 8, texto: `Título SEO curto (${titulo.length} caracteres). Use de ${LIMITES.tituloMin} a ${LIMITES.tituloMax}.` }
    : titulo.length > LIMITES.tituloMax
      ? { id: "titulo-len", grupo: "Título e descrição", nivel: "erro", peso: 8, texto: `Título SEO longo (${titulo.length}). O Google corta depois de ~${LIMITES.tituloMax} caracteres.` }
      : { id: "titulo-len", grupo: "Título e descrição", nivel: "ok", peso: 8, texto: `Título SEO com ${titulo.length} caracteres.` });
  add(!desc
    ? { id: "desc-len", grupo: "Título e descrição", nivel: "erro", peso: 8, texto: "Escreva a meta description: é o texto que aparece embaixo do título no Google." }
    : desc.length < LIMITES.descMin
      ? { id: "desc-len", grupo: "Título e descrição", nivel: "aviso", peso: 8, texto: `Meta description curta (${desc.length}). Use de ${LIMITES.descMin} a ${LIMITES.descMax} caracteres.` }
      : desc.length > LIMITES.descMax
        ? { id: "desc-len", grupo: "Título e descrição", nivel: "aviso", peso: 8, texto: `Meta description longa (${desc.length}); vai aparecer cortada.` }
        : { id: "desc-len", grupo: "Título e descrição", nivel: "ok", peso: 8, texto: `Meta description com ${desc.length} caracteres.` });
  add(e.slug.length > 75
    ? { id: "slug", grupo: "Título e descrição", nivel: "aviso", peso: 3, texto: "URL longa. Prefira de 3 a 6 palavras." }
    : { id: "slug", grupo: "Título e descrição", nivel: "ok", peso: 3, texto: "URL curta e legível." });

  // Conteúdo
  add(palavras < 300
    ? { id: "palavras", grupo: "Conteúdo", nivel: "erro", peso: 10, texto: `Só ${palavras} palavras. Conteúdo raso dificilmente ranqueia; mire em ${LIMITES.palavrasMin}+.` }
    : palavras < LIMITES.palavrasMin
      ? { id: "palavras", grupo: "Conteúdo", nivel: "aviso", peso: 10, texto: `${palavras} palavras. Artigos com ${LIMITES.palavrasMin}+ palavras costumam ranquear melhor.` }
      : { id: "palavras", grupo: "Conteúdo", nivel: "ok", peso: 10, texto: `${palavras} palavras — conteúdo aprofundado.` });
  const subIdeal = Math.max(1, Math.floor(palavras / 300));
  add(subtitulos.length === 0
    ? { id: "subtitulos", grupo: "Conteúdo", nivel: "erro", peso: 5, texto: "Nenhum subtítulo (##). Divida o texto em seções." }
    : subtitulos.length < subIdeal
      ? { id: "subtitulos", grupo: "Conteúdo", nivel: "aviso", peso: 5, texto: `Poucos subtítulos (${subtitulos.length}). Use um a cada ~300 palavras.` }
      : { id: "subtitulos", grupo: "Conteúdo", nivel: "ok", peso: 5, texto: `${subtitulos.length} subtítulos organizando o texto.` });
  add((e.faq?.length ?? 0) >= 2
    ? { id: "faq", grupo: "Conteúdo", nivel: "ok", peso: 3, texto: `${e.faq!.length} perguntas frequentes (podem aparecer como resultado expandido no Google).` }
    : { id: "faq", grupo: "Conteúdo", nivel: "aviso", peso: 3, texto: "Adicione 2+ perguntas frequentes: viram dados estruturados (FAQ) para o Google." });

  // Links e mídia
  add(internos.length === 0
    ? { id: "internos", grupo: "Links e mídia", nivel: "erro", peso: 6, texto: "Nenhum link interno. Linke para /planos, /diagnostico ou outros artigos." }
    : { id: "internos", grupo: "Links e mídia", nivel: "ok", peso: 6, texto: `${internos.length} link(s) interno(s).` });
  add(externos.length === 0
    ? { id: "externos", grupo: "Links e mídia", nivel: "aviso", peso: 3, texto: "Nenhum link externo. Citar fonte oficial (gov.br, ANPD) dá autoridade." }
    : { id: "externos", grupo: "Links e mídia", nivel: "ok", peso: 3, texto: `${externos.length} link(s) para fontes externas.` });
  add(!e.capaUrl
    ? { id: "capa", grupo: "Links e mídia", nivel: "aviso", peso: 4, texto: "Sem imagem de capa — o compartilhamento no WhatsApp/LinkedIn fica sem imagem." }
    : !e.capaAlt?.trim()
      ? { id: "capa", grupo: "Links e mídia", nivel: "aviso", peso: 4, texto: "Descreva a imagem de capa (texto alternativo)." }
      : { id: "capa", grupo: "Links e mídia", nivel: "ok", peso: 4, texto: "Capa com texto alternativo." });
  if (imagens.length) {
    const semAlt = imagens.filter((a) => !a.trim()).length;
    add(semAlt
      ? { id: "alts", grupo: "Links e mídia", nivel: "aviso", peso: 3, texto: `${semAlt} imagem(ns) no texto sem descrição (alt).` }
      : { id: "alts", grupo: "Links e mídia", nivel: "ok", peso: 3, texto: "Todas as imagens do texto têm descrição." });
  }

  // Leitura
  const longos = paragrafos.filter((p) => p.split(/\s+/).length > 120).length;
  add(longos
    ? { id: "paragrafos", grupo: "Leitura", nivel: "aviso", peso: 3, texto: `${longos} parágrafo(s) com mais de 120 palavras. Quebre para leitura no celular.` }
    : { id: "paragrafos", grupo: "Leitura", nivel: "ok", peso: 3, texto: "Parágrafos curtos, bons para o celular." });
  const frases = md.replace(/[#*>`|-]/g, " ").split(/[.!?]+\s/).filter((f) => f.trim().split(/\s+/).length > 3);
  const mediaFrase = frases.length ? frases.reduce((s, f) => s + f.trim().split(/\s+/).length, 0) / frases.length : 0;
  add(mediaFrase > 25
    ? { id: "frases", grupo: "Leitura", nivel: "aviso", peso: 3, texto: `Frases longas (média de ${Math.round(mediaFrase)} palavras). Mire em até 20.` }
    : { id: "frases", grupo: "Leitura", nivel: "ok", peso: 3, texto: `Frases com média de ${Math.round(mediaFrase)} palavras.` });

  const total = checks.reduce((s, c) => s + c.peso, 0);
  const pontos = checks.reduce((s, c) => s + (c.nivel === "ok" ? c.peso : c.nivel === "aviso" ? c.peso * 0.5 : 0), 0);
  const nota = total ? Math.round((pontos / total) * 100) : 0;
  return { nota, checks, palavras };
}

export function faixaSeo(nota: number) {
  if (nota >= 80) return { label: "Ótimo", classe: "bg-brand-tint text-brand-ink" };
  if (nota >= 60) return { label: "Bom", classe: "bg-caution-tint text-caution" };
  return { label: "Fraco", classe: "bg-danger-tint text-danger" };
}
