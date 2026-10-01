"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bold,
  Eye,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Plus,
  Quote,
  Table,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { renderMarkdown, slugify, contarPalavras, minutosDeLeitura } from "@/lib/markdown";
import { isoParaLocal, localParaIso, ehFuturo } from "@/lib/datas";
import { analisarSeo, faixaSeo, tituloEfetivo, descricaoEfetiva, LIMITES, type Check } from "@/lib/seo-analise";

export type PostEditavel = {
  id: string;
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  capaUrl: string;
  capaAlt: string;
  categoria: string;
  tags: string[];
  autorId: string;
  status: "rascunho" | "publicado";
  publicadoEm: string; // datetime-local (horário de Brasília)
  seoTitulo: string;
  seoDescricao: string;
  palavraChave: string;
  canonical: string;
  ogImagem: string;
  noindex: boolean;
  faq: { pergunta: string; resposta: string }[];
};

type Props = {
  inicial: PostEditavel;
  autores: { id: string; nome: string }[];
  categorias: string[];
  siteUrl: string;
};

const ROTULO = "block font-mono text-[11px] uppercase tracking-[0.05em] text-muted";


function Contador({ atual, min, max }: { atual: number; min: number; max: number }) {
  const pct = Math.min(100, (atual / max) * 100);
  const cor = atual === 0 ? "bg-line-strong" : atual < min ? "bg-caution" : atual > max ? "bg-danger" : "bg-brand-strong";
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
        <div className={"h-full rounded-full transition-all " + cor} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-[11px] tabular-nums text-muted">
        {atual}/{max}
      </span>
    </div>
  );
}

function AnelNota({ nota }: { nota: number }) {
  const f = faixaSeo(nota);
  const cor = nota >= 80 ? "var(--color-brand-strong)" : nota >= 60 ? "var(--color-caution)" : "var(--color-danger)";
  return (
    <div className="flex items-center gap-4">
      <div className="grid h-[72px] w-[72px] place-items-center rounded-full" style={{ background: `conic-gradient(${cor} ${nota * 3.6}deg, var(--color-surface-2) 0)` }}>
        <div className="grid h-[58px] w-[58px] place-items-center rounded-full bg-surface font-display text-[24px] tabular-nums text-ink">{nota}</div>
      </div>
      <div>
        <span className={"inline-block rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.04em] " + f.classe}>{f.label}</span>
        <p className="mt-1.5 text-[13px] leading-snug text-muted">Nota de SEO on-page. Mire em 80+ antes de publicar.</p>
      </div>
    </div>
  );
}

function ItemCheck({ c }: { c: Check }) {
  const cor = c.nivel === "ok" ? "bg-brand-strong" : c.nivel === "aviso" ? "bg-caution" : "bg-danger";
  return (
    <li className="flex gap-2.5 text-[13.5px] leading-snug text-body">
      <span className={"mt-[5px] h-2 w-2 shrink-0 " + cor} />
      {c.texto}
    </li>
  );
}

const BOTOES = [
  { icone: Heading2, titulo: "Subtítulo (H2)" },
  { icone: Heading3, titulo: "Subtítulo menor (H3)" },
  { icone: Bold, titulo: "Negrito" },
  { icone: Italic, titulo: "Itálico" },
  { icone: LinkIcon, titulo: "Link" },
  { icone: List, titulo: "Lista" },
  { icone: ListOrdered, titulo: "Lista numerada" },
  { icone: Quote, titulo: "Destaque" },
  { icone: Table, titulo: "Tabela" },
  { icone: Minus, titulo: "Divisória" },
  { icone: ImagePlus, titulo: "Imagem (upload)" },
];

export function Editor({ inicial, autores, categorias, siteUrl }: Props) {
  const router = useRouter();
  const [p, setP] = useState<PostEditavel>(inicial);
  const [salvo, setSalvo] = useState<PostEditavel>(inicial);
  const [aba, setAba] = useState<"escrever" | "visualizar">("escrever");
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [enviandoImg, setEnviandoImg] = useState(false);
  const [slugManual, setSlugManual] = useState(!inicial.slug.startsWith("rascunho-"));
  const [serpMobile, setSerpMobile] = useState(false);
  const [tagsTexto, setTagsTexto] = useState(inicial.tags.join(", "));
  const area = useRef<HTMLTextAreaElement | null>(null);
  const host = new URL(siteUrl).host;

  const sujo = JSON.stringify(p) !== JSON.stringify(salvo);
  const set = <K extends keyof PostEditavel>(k: K, v: PostEditavel[K]) => setP((x) => ({ ...x, [k]: v }));

  const analise = useMemo(() => analisarSeo({ ...p, siteHost: host }), [p, host]);
  const previa = useMemo(() => (aba === "visualizar" ? renderMarkdown(p.conteudo, { siteHost: host }).html : ""), [aba, p.conteudo, host]);
  const palavras = contarPalavras(p.conteudo);

  const agendado = p.status === "publicado" && ehFuturo(p.publicadoEm);
  const statusRotulo = p.status === "rascunho" ? "Rascunho" : agendado ? "Agendado" : "Publicado";

  const salvar = useCallback(
    async (extra: Partial<PostEditavel> = {}) => {
      const dados = { ...p, ...extra };
      setSalvando(true);
      setMsg(null);
      const res = await fetch(`/api/admin/blog/${dados.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...dados, publicadoEm: localParaIso(dados.publicadoEm) }),
      });
      const r = await res.json().catch(() => ({ ok: false }));
      setSalvando(false);
      if (!r.ok) {
        setMsg({ tipo: "erro", texto: r.error ?? "Não foi possível salvar." });
        return false;
      }
      const atualizado = { ...dados, slug: r.post.slug, publicadoEm: isoParaLocal(r.post.publicadoEm) };
      setP(atualizado);
      setSalvo(atualizado);
      setMsg({ tipo: "ok", texto: extra.status === "publicado" ? (agendado ? "Agendado." : "Publicado e enviado pro sitemap.") : "Salvo." });
      router.refresh();
      return true;
    },
    [p, router, agendado],
  );

  // Ctrl/Cmd+S salva; aviso ao sair com alterações pendentes.
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        salvar();
      }
    };
    const sair = (e: BeforeUnloadEvent) => {
      if (sujo) e.preventDefault();
    };
    window.addEventListener("keydown", tecla);
    window.addEventListener("beforeunload", sair);
    return () => {
      window.removeEventListener("keydown", tecla);
      window.removeEventListener("beforeunload", sair);
    };
  }, [salvar, sujo]);

  const mudarTitulo = (titulo: string) => setP((x) => ({ ...x, titulo, slug: slugManual ? x.slug : slugify(titulo) }));

  // ---------- barra de formatação ----------
  const inserir = (antes: string, depois = "", padrao = "") => {
    const ta = area.current;
    if (!ta) return;
    const { selectionStart: i, selectionEnd: f, value } = ta;
    const sel = value.slice(i, f) || padrao;
    const novo = value.slice(0, i) + antes + sel + depois + value.slice(f);
    set("conteudo", novo);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(i + antes.length, i + antes.length + sel.length);
    });
  };
  const inserirLinha = (prefixo: string, padrao: string) => {
    const ta = area.current;
    if (!ta) return;
    const i = ta.selectionStart;
    const inicioLinha = ta.value.lastIndexOf("\n", i - 1) + 1;
    const novo = ta.value.slice(0, inicioLinha) + prefixo + (ta.value.slice(inicioLinha, ta.selectionEnd) || padrao) + ta.value.slice(ta.selectionEnd);
    set("conteudo", novo);
    requestAnimationFrame(() => ta.focus());
  };

  const enviarImagem = async (arquivo: File) => {
    setEnviandoImg(true);
    setMsg(null);
    const fd = new FormData();
    fd.append("arquivo", arquivo);
    const r = await fetch("/api/admin/blog/upload", { method: "POST", body: fd }).then((x) => x.json()).catch(() => ({ ok: false }));
    setEnviandoImg(false);
    if (!r.ok) {
      setMsg({ tipo: "erro", texto: r.error ?? "Falha no upload." });
      return null;
    }
    return r.url as string;
  };

  const escolherArquivo = (onUrl: (url: string, nome: string) => void) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp,image/avif,image/gif";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      const url = await enviarImagem(f);
      if (url) onUrl(url, f.name);
    };
    input.click();
  };

  const excluir = async () => {
    if (!confirm(`Excluir “${p.titulo}”? Isso remove o artigo do site e não pode ser desfeito.`)) return;
    await fetch(`/api/admin/blog/${p.id}`, { method: "DELETE" });
    router.push("/admin/blog");
    router.refresh();
  };

  const abrirPrevia = async () => {
    if (sujo && !(await salvar())) return;
    window.open(`/blog/previa/${p.id}`, "_blank");
  };

  const executar = (titulo: string) => FERRAMENTAS.find((f) => f.titulo === titulo)?.acao();
  const FERRAMENTAS: { icone: typeof Bold; titulo: string; acao: () => void }[] = [
    { icone: Heading2, titulo: "Subtítulo (H2)", acao: () => inserirLinha("## ", "Subtítulo") },
    { icone: Heading3, titulo: "Subtítulo menor (H3)", acao: () => inserirLinha("### ", "Subtítulo") },
    { icone: Bold, titulo: "Negrito", acao: () => inserir("**", "**", "texto") },
    { icone: Italic, titulo: "Itálico", acao: () => inserir("_", "_", "texto") },
    { icone: LinkIcon, titulo: "Link", acao: () => inserir("[", "](/planos)", "texto do link") },
    { icone: List, titulo: "Lista", acao: () => inserirLinha("- ", "item") },
    { icone: ListOrdered, titulo: "Lista numerada", acao: () => inserirLinha("1. ", "item") },
    { icone: Quote, titulo: "Destaque", acao: () => inserirLinha("> ", "frase em destaque") },
    { icone: Table, titulo: "Tabela", acao: () => inserir("\n| Coluna | Coluna |\n|---|---|\n| valor | valor |\n", "") },
    { icone: Minus, titulo: "Divisória", acao: () => inserir("\n---\n", "") },
    {
      icone: ImagePlus,
      titulo: "Imagem (upload)",
      acao: () => escolherArquivo((url, nome) => inserir(`\n![${nome.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ")}](${url})\n`, "")),
    },
  ];

  const tituloSerp = tituloEfetivo(p);
  const descSerp = descricaoEfetiva(p);
  const grupos = ["Palavra-chave", "Título e descrição", "Conteúdo", "Links e mídia", "Leitura"] as const;

  return (
    <div className="max-w-[1500px]">
      {/* barra superior */}
      <div className="sticky top-0 z-20 -mx-4 flex flex-wrap items-center gap-3 border-b border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:-mx-10 sm:px-10">
        <Link href="/admin/blog" className="inline-flex items-center gap-1.5 text-[14px] text-muted hover:text-ink">
          <ArrowLeft size={16} /> Artigos
        </Link>
        <span className={"pill " + (p.status === "rascunho" ? "pill-neutral" : agendado ? "pill-info" : "pill-ok")}>{statusRotulo}</span>
        <span className="text-[13px] text-muted">{salvando ? "Salvando..." : sujo ? "Alterações não salvas" : "Tudo salvo"}</span>
        {msg && <span className={"text-[13px] " + (msg.tipo === "ok" ? "text-brand-ink" : "text-danger")}>{msg.texto}</span>}
        <div className="ml-auto flex flex-wrap gap-2">
          <button type="button" onClick={abrirPrevia} className="btn btn-ghost">
            <Eye size={15} /> Pré-visualizar
          </button>
          {p.status === "publicado" ? (
            <>
              <button type="button" onClick={() => salvar({ status: "rascunho" })} className="btn btn-ghost" disabled={salvando}>
                Despublicar
              </button>
              <button type="button" onClick={() => salvar()} className="btn btn-primary" disabled={salvando}>
                Atualizar
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => salvar()} className="btn btn-ghost" disabled={salvando}>
                Salvar rascunho
              </button>
              <button type="button" onClick={() => salvar({ status: "publicado" })} className="btn btn-primary" disabled={salvando}>
                {ehFuturo(p.publicadoEm) ? "Agendar" : "Publicar"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_400px]">
        {/* coluna do texto */}
        <div className="min-w-0">
          <label htmlFor="titulo" className="sr-only">
            Título
          </label>
          <textarea
            id="titulo"
            rows={2}
            value={p.titulo}
            onChange={(e) => mudarTitulo(e.target.value.replace(/\n/g, " "))}
            placeholder="Título do artigo"
            className="w-full resize-none bg-transparent font-display text-[clamp(1.9rem,3.2vw,2.8rem)] leading-[1.12] text-ink outline-none placeholder:text-faint"
          />
          <label htmlFor="resumo" className={ROTULO + " mt-4"}>
            Subtítulo (aparece abaixo do título e no Google, se a meta description ficar vazia)
          </label>
          <textarea
            id="resumo"
            rows={2}
            value={p.resumo}
            onChange={(e) => set("resumo", e.target.value)}
            placeholder="Uma frase que diga por que vale a pena ler."
            className="field-input mt-1.5 resize-y text-[16px]"
          />

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 rounded-full bg-surface-2 p-1">
              {(["escrever", "visualizar"] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAba(a)}
                  className={"rounded-full px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.04em] " + (aba === a ? "bg-surface text-ink shadow-[var(--shadow-chip)]" : "text-muted")}
                >
                  {a}
                </button>
              ))}
            </div>
            <span className="font-mono text-[12px] text-muted">
              {palavras} palavras · {minutosDeLeitura(p.conteudo)} min de leitura{enviandoImg ? " · enviando imagem..." : ""}
            </span>
          </div>

          {aba === "escrever" ? (
            <div className="mt-3 overflow-hidden rounded-[20px] border border-line bg-surface">
              <div className="flex flex-wrap gap-0.5 border-b border-line bg-surface-2 px-2 py-1.5">
                {BOTOES.map((f) => (
                  <button key={f.titulo} type="button" title={f.titulo} aria-label={f.titulo} onClick={() => executar(f.titulo)} className="grid h-9 w-9 place-items-center rounded-lg text-body hover:bg-surface hover:text-ink">
                    <f.icone size={17} />
                  </button>
                ))}
              </div>
              <label htmlFor="conteudo" className="sr-only">
                Conteúdo em Markdown
              </label>
              <textarea
                id="conteudo"
                ref={area}
                value={p.conteudo}
                onChange={(e) => set("conteudo", e.target.value)}
                placeholder={"Escreva em Markdown.\n\n## Subtítulo\n\nParágrafo com **negrito** e [link](/planos).\n\n- item de lista"}
                className="block min-h-[62vh] w-full resize-y bg-surface px-5 py-4 font-mono text-[14.5px] leading-[1.75] text-ink outline-none"
              />
            </div>
          ) : (
            <div className="mt-3 rounded-[20px] border border-line bg-canvas px-5 py-8 sm:px-10">
              <div className="artigo mx-auto max-w-[680px]" dangerouslySetInnerHTML={{ __html: previa || "<p>Nada escrito ainda.</p>" }} />
            </div>
          )}

          {/* FAQ */}
          <section className="mt-10 rounded-[20px] border border-line bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="t-heading">Perguntas frequentes</h2>
                <p className="mt-1 text-[13px] text-muted">Aparecem no fim do artigo e viram dados estruturados (FAQ) para o Google.</p>
              </div>
              <button type="button" onClick={() => set("faq", [...p.faq, { pergunta: "", resposta: "" }])} className="btn btn-ghost">
                <Plus size={15} /> Adicionar pergunta
              </button>
            </div>
            <div className="mt-5 flex flex-col gap-4">
              {p.faq.map((f, i) => (
                <div key={i} className="grid gap-2 rounded-2xl bg-surface-2 p-4">
                  <div className="flex gap-2">
                    <input
                      aria-label={`Pergunta ${i + 1}`}
                      value={f.pergunta}
                      onChange={(e) => set("faq", p.faq.map((x, j) => (j === i ? { ...x, pergunta: e.target.value } : x)))}
                      placeholder="Pergunta"
                      className="field-input"
                    />
                    <button type="button" aria-label="Remover pergunta" onClick={() => set("faq", p.faq.filter((_, j) => j !== i))} className="grid w-11 shrink-0 place-items-center rounded-xl text-muted hover:bg-surface hover:text-danger">
                      <X size={17} />
                    </button>
                  </div>
                  <textarea
                    aria-label={`Resposta ${i + 1}`}
                    value={f.resposta}
                    onChange={(e) => set("faq", p.faq.map((x, j) => (j === i ? { ...x, resposta: e.target.value } : x)))}
                    placeholder="Resposta direta, em 2 ou 3 frases."
                    rows={3}
                    className="field-input resize-y"
                  />
                </div>
              ))}
              {p.faq.length === 0 && <p className="text-[14px] text-muted">Nenhuma pergunta ainda.</p>}
            </div>
          </section>

          <button type="button" onClick={excluir} className="mt-10 inline-flex items-center gap-2 text-[14px] text-muted hover:text-danger">
            <Trash2 size={15} /> Excluir artigo
          </button>
        </div>

        {/* barra lateral */}
        <aside className="flex flex-col gap-4">
          <section className="rounded-[20px] border border-line bg-surface p-5">
            <AnelNota nota={analise.nota} />
            <div className="mt-5 flex flex-col gap-4">
              {grupos.map((g) => {
                const itens = analise.checks.filter((c) => c.grupo === g);
                if (!itens.length) return null;
                return (
                  <div key={g}>
                    <p className={ROTULO}>{g}</p>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {itens.map((c) => (
                        <ItemCheck key={c.id} c={c} />
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-[20px] border border-line bg-surface p-5">
            <div className="flex items-center justify-between">
              <p className={ROTULO}>Prévia no Google</p>
              <div className="flex gap-1 rounded-full bg-surface-2 p-0.5">
                {["Computador", "Celular"].map((r, i) => (
                  <button key={r} type="button" onClick={() => setSerpMobile(i === 1)} className={"rounded-full px-2.5 py-1 text-[11px] " + (serpMobile === (i === 1) ? "bg-surface text-ink" : "text-muted")}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className={"mt-4 rounded-2xl bg-white p-4 text-left " + (serpMobile ? "max-w-[360px]" : "")} style={{ fontFamily: "Arial, sans-serif" }}>
              <div className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#f1f3f4]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icon.png" alt="" className="h-[18px] w-[18px] rounded-full" />
                </span>
                <span className="leading-tight">
                  <span className="block text-[14px] text-[#202124]">Dattis</span>
                  <span className="block text-[12px] text-[#4d5156]">
                    {host} › blog › {p.slug || "url-do-artigo"}
                  </span>
                </span>
              </div>
              <p className={"mt-2 text-[#1a0dab] " + (serpMobile ? "text-[18px] leading-snug" : "text-[20px] leading-snug")} style={{ display: "-webkit-box", WebkitLineClamp: serpMobile ? 2 : 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {tituloSerp || "Título do artigo"}
              </p>
              <p className="mt-1 text-[14px] leading-[1.55] text-[#4d5156]" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {descSerp || "Escreva a meta description: é o convite pra pessoa clicar no seu resultado e não no do concorrente."}
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-[20px] border border-line bg-surface p-5">
            <p className={ROTULO}>SEO</p>
            <div>
              <label htmlFor="kw" className={ROTULO}>
                Palavra-chave foco
              </label>
              <input id="kw" value={p.palavraChave} onChange={(e) => set("palavraChave", e.target.value)} placeholder="ex.: lgpd para agências" className="field-input mt-1.5" />
            </div>
            <div>
              <label htmlFor="seoTitulo" className={ROTULO}>
                Título SEO (vazio = título do artigo)
              </label>
              <input id="seoTitulo" value={p.seoTitulo} onChange={(e) => set("seoTitulo", e.target.value)} placeholder={p.titulo} className="field-input mt-1.5" />
              <Contador atual={tituloSerp.length} min={LIMITES.tituloMin} max={LIMITES.tituloMax} />
            </div>
            <div>
              <label htmlFor="seoDescricao" className={ROTULO}>
                Meta description
              </label>
              <textarea id="seoDescricao" rows={3} value={p.seoDescricao} onChange={(e) => set("seoDescricao", e.target.value)} placeholder={p.resumo || "Resumo persuasivo de 120 a 158 caracteres."} className="field-input mt-1.5 resize-y" />
              <Contador atual={descSerp.length} min={LIMITES.descMin} max={LIMITES.descMax} />
            </div>
            <div>
              <label htmlFor="slug" className={ROTULO}>
                URL
              </label>
              <div className="mt-1.5 flex items-center overflow-hidden rounded-xl border border-line bg-surface-2">
                <span className="pl-3 font-mono text-[12px] text-muted">/blog/</span>
                <input
                  id="slug"
                  value={p.slug}
                  onChange={(e) => {
                    setSlugManual(true);
                    set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }}
                  className="min-w-0 flex-1 bg-surface px-2 py-2.5 font-mono text-[13px] outline-none"
                />
              </div>
              <button type="button" onClick={() => set("slug", slugify(p.palavraChave || p.titulo))} className="mt-1.5 text-[12px] text-brand-ink hover:underline">
                Gerar a partir da {p.palavraChave ? "palavra-chave" : "título"}
              </button>
              {p.status === "publicado" && p.slug !== salvo.slug && (
                <p className="mt-1 text-[12px] text-warn">Mudar a URL de um artigo publicado quebra links que já apontam pra ele.</p>
              )}
            </div>
            <details>
              <summary className="cursor-pointer text-[13px] text-muted">Avançado</summary>
              <div className="mt-3 flex flex-col gap-3">
                <div>
                  <label htmlFor="canonical" className={ROTULO}>
                    URL canônica (só se o conteúdo original estiver em outro endereço)
                  </label>
                  <input id="canonical" value={p.canonical} onChange={(e) => set("canonical", e.target.value)} placeholder={`${siteUrl}/blog/${p.slug}`} className="field-input mt-1.5" />
                </div>
                <label className="flex items-start gap-2.5 text-[14px] text-body">
                  <input type="checkbox" checked={p.noindex} onChange={(e) => set("noindex", e.target.checked)} className="mt-1 accent-[var(--color-brand-strong)]" />
                  Não indexar no Google (noindex) — use só para conteúdo interno ou duplicado.
                </label>
              </div>
            </details>
          </section>

          <section className="flex flex-col gap-4 rounded-[20px] border border-line bg-surface p-5">
            <p className={ROTULO}>Publicação</p>
            <div>
              <label htmlFor="data" className={ROTULO}>
                Data de publicação (horário de Brasília) — no futuro = agendado
              </label>
              <input id="data" type="datetime-local" value={p.publicadoEm} onChange={(e) => set("publicadoEm", e.target.value)} className="field-input mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="categoria" className={ROTULO}>
                  Categoria
                </label>
                <select id="categoria" value={p.categoria} onChange={(e) => set("categoria", e.target.value)} className="field-input mt-1.5">
                  {categorias.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="autor" className={ROTULO}>
                  Autor
                </label>
                <select id="autor" value={p.autorId} onChange={(e) => set("autorId", e.target.value)} className="field-input mt-1.5">
                  <option value="">Equipe Dattis</option>
                  {autores.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="tags" className={ROTULO}>
                Tags (separadas por vírgula)
              </label>
              <input
                id="tags"
                value={tagsTexto}
                onChange={(e) => {
                  setTagsTexto(e.target.value);
                  set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean));
                }}
                placeholder="pixel, consentimento, meta ads"
                className="field-input mt-1.5"
              />
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-[20px] border border-line bg-surface p-5">
            <p className={ROTULO}>Imagem de capa</p>
            {p.capaUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.capaUrl} alt={p.capaAlt} className="aspect-[1200/630] w-full rounded-2xl object-cover" />
            ) : (
              <div className="grid aspect-[1200/630] place-items-center rounded-2xl bg-surface-2 text-center text-[13px] text-muted">
                Sem capa: o artigo usa uma imagem gerada automaticamente com o título.
              </div>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={() => escolherArquivo((url) => set("capaUrl", url))} className="btn btn-ghost flex-1" disabled={enviandoImg}>
                <Upload size={15} /> {enviandoImg ? "Enviando..." : p.capaUrl ? "Trocar imagem" : "Enviar imagem"}
              </button>
              {p.capaUrl && (
                <button type="button" onClick={() => set("capaUrl", "")} className="btn btn-ghost" aria-label="Remover capa">
                  <X size={15} />
                </button>
              )}
            </div>
            <div>
              <label htmlFor="capaAlt" className={ROTULO}>
                Descrição da imagem (alt) — acessibilidade e Google Imagens
              </label>
              <input id="capaAlt" value={p.capaAlt} onChange={(e) => set("capaAlt", e.target.value)} placeholder="ex.: Gestor de tráfego revisando o Gerenciador de Anúncios" className="field-input mt-1.5" />
            </div>
            <p className="text-[12px] leading-snug text-muted">Ideal: 1200×630 px, até 4 MB. Vira a imagem do link no WhatsApp, LinkedIn e Google Discover.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
