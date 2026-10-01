"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

const ROTULO = "block font-mono text-[11px] uppercase tracking-[0.05em] text-muted";

type Config = Record<string, string>;

const CAMPOS: { chave: string; rotulo: string; ajuda: string; area?: boolean }[] = [
  {
    chave: "google_verificacao",
    rotulo: "Google Search Console — código de verificação",
    ajuda: "No Search Console escolha “Prefixo do URL” → “Tag HTML” e cole aqui a tag inteira ou só o código.",
  },
  { chave: "bing_verificacao", rotulo: "Bing Webmaster Tools — código (msvalidate.01)", ajuda: "Opcional. O Bing também alimenta ChatGPT e Copilot." },
  {
    chave: "site_descricao",
    rotulo: "Descrição padrão do site",
    ajuda: "Usada nas páginas sem descrição própria. 120 a 158 caracteres.",
    area: true,
  },
  { chave: "instagram", rotulo: "Instagram (URL)", ajuda: "Entra nos dados da organização (sameAs) pro Google ligar os perfis à marca." },
  { chave: "linkedin", rotulo: "LinkedIn (URL)", ajuda: "" },
  { chave: "youtube", rotulo: "YouTube (URL)", ajuda: "" },
];

export function ConfiguracoesSeo({ inicial }: { inicial: Config }) {
  const router = useRouter();
  const [cfg, setCfg] = useState<Config>(inicial);
  const [estado, setEstado] = useState<"" | "salvando" | "salvo" | "erro">("");

  const salvar = async () => {
    setEstado("salvando");
    const r = await fetch("/api/admin/configuracoes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cfg) })
      .then((x) => x.json())
      .catch(() => ({ ok: false }));
    setEstado(r.ok ? "salvo" : "erro");
    router.refresh();
  };

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        salvar();
      }}
    >
      {CAMPOS.map((c) => (
        <div key={c.chave}>
          <label htmlFor={c.chave} className={ROTULO}>
            {c.rotulo}
          </label>
          {c.area ? (
            <textarea id={c.chave} rows={3} value={cfg[c.chave] ?? ""} onChange={(e) => setCfg({ ...cfg, [c.chave]: e.target.value })} className="field-input mt-1.5 resize-y" />
          ) : (
            <input id={c.chave} value={cfg[c.chave] ?? ""} onChange={(e) => setCfg({ ...cfg, [c.chave]: e.target.value })} className="field-input mt-1.5" />
          )}
          {c.chave === "site_descricao" && <p className="mt-1 font-mono text-[11px] text-muted">{(cfg[c.chave] ?? "").length} caracteres</p>}
          {c.ajuda && <p className="mt-1 text-[13px] leading-snug text-muted">{c.ajuda}</p>}
        </div>
      ))}
      <div className="flex items-center gap-3">
        <button type="submit" className="btn btn-primary" disabled={estado === "salvando"}>
          {estado === "salvando" ? "Salvando..." : "Salvar configurações"}
        </button>
        {estado === "salvo" && <span className="text-[14px] text-brand-ink">Salvo. A tag de verificação já está no código do site.</span>}
        {estado === "erro" && <span className="text-[14px] text-danger">Não foi possível salvar.</span>}
      </div>
    </form>
  );
}

type Autor = { id?: string; nome: string; cargo: string; bio: string; fotoUrl: string };

function FormAutor({ autor, onSalvo }: { autor: Autor; onSalvo: () => void }) {
  const [a, setA] = useState<Autor>(autor);
  const [estado, setEstado] = useState("");

  const enviarFoto = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      setEstado("Enviando foto...");
      const fd = new FormData();
      fd.append("arquivo", f);
      const r = await fetch("/api/admin/blog/upload", { method: "POST", body: fd }).then((x) => x.json()).catch(() => ({ ok: false }));
      setEstado(r.ok ? "" : r.error ?? "Falha no upload.");
      if (r.ok) setA((x) => ({ ...x, fotoUrl: r.url }));
    };
    input.click();
  };

  const salvar = async () => {
    setEstado("Salvando...");
    const r = await fetch("/api/admin/autores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(a) })
      .then((x) => x.json())
      .catch(() => ({ ok: false }));
    setEstado(r.ok ? "Salvo." : r.error ?? "Erro ao salvar.");
    if (r.ok) onSalvo();
  };

  return (
    <div className="grid gap-4 rounded-2xl bg-surface-2 p-4 sm:grid-cols-[88px_1fr]">
      <div className="flex flex-col items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={a.fotoUrl || "/marketing/especialista.png"} alt="" className="h-[72px] w-[72px] rounded-full object-cover" />
        <button type="button" onClick={enviarFoto} className="inline-flex items-center gap-1 text-[12px] text-brand-ink hover:underline">
          <Upload size={12} /> Foto
        </button>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <input aria-label="Nome" value={a.nome} onChange={(e) => setA({ ...a, nome: e.target.value })} placeholder="Nome" className="field-input" />
        <input aria-label="Cargo" value={a.cargo} onChange={(e) => setA({ ...a, cargo: e.target.value })} placeholder="Cargo (ex.: Especialista em LGPD)" className="field-input" />
        <textarea
          aria-label="Bio"
          value={a.bio}
          onChange={(e) => setA({ ...a, bio: e.target.value })}
          placeholder="Bio curta: experiência com tráfego pago e LGPD. Isso reforça autoridade (E-E-A-T) pro Google."
          rows={2}
          className="field-input resize-y sm:col-span-2"
        />
        <div className="flex items-center gap-3 sm:col-span-2">
          <button type="button" onClick={salvar} className="btn btn-dark">
            {a.id ? "Salvar autor" : "Adicionar autor"}
          </button>
          {estado && <span className="text-[13px] text-muted">{estado}</span>}
        </div>
      </div>
    </div>
  );
}

export function Autores({ autores }: { autores: Autor[] }) {
  const router = useRouter();
  const [novo, setNovo] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      {autores.map((a) => (
        <FormAutor key={a.id} autor={a} onSalvo={() => router.refresh()} />
      ))}
      {novo ? (
        <FormAutor
          autor={{ nome: "", cargo: "", bio: "", fotoUrl: "" }}
          onSalvo={() => {
            setNovo(false);
            router.refresh();
          }}
        />
      ) : (
        <button type="button" onClick={() => setNovo(true)} className="btn btn-ghost self-start">
          Adicionar autor
        </button>
      )}
    </div>
  );
}
