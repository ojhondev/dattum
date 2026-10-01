"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, RefreshCw } from "lucide-react";
import type { Achado } from "@/lib/vigilancia-tipos";
import { ListaAchados } from "@/components/app/ListaAchados";
import { NotaVigilancia } from "@/components/app/VigilanciaChips";

export type ResultadoVigilancia = { nota: number; verificadoEm: string; alvo: string | null; achados: Achado[] } | null;

/** Site do cliente, editável — é o endereço que a vigilância diária verifica. */
export function SiteDaConta({ contaId, siteInicial }: { contaId: string; siteInicial: string | null }) {
  const router = useRouter();
  const [editando, setEditando] = useState(!siteInicial);
  const [site, setSite] = useState(siteInicial ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const salvar = async () => {
    setSalvando(true);
    setErro("");
    const res = await fetch(`/api/contas/${contaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site }),
    });
    const data = await res.json().catch(() => ({ ok: false }));
    setSalvando(false);
    if (!data.ok) return setErro(data.error ?? "Não foi possível salvar.");
    setSite(data.site ?? "");
    setEditando(!data.site);
    router.refresh();
  };

  if (!editando) {
    return (
      <span className="inline-flex flex-wrap items-center gap-2 text-body-sm">
        <Globe size={15} className="text-muted" />
        <a href={site} target="_blank" rel="noopener noreferrer" className="text-ink underline-offset-2 hover:underline">
          {site.replace(/^https?:\/\//, "")}
        </a>
        <button type="button" onClick={() => setEditando(true)} className="font-mono text-[12px] uppercase tracking-[0.04em] text-muted hover:text-ink">
          Alterar
        </button>
      </span>
    );
  }

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        salvar();
      }}
    >
      <label htmlFor="site-conta" className="sr-only">
        Site do cliente
      </label>
      <input
        id="site-conta"
        type="text"
        inputMode="url"
        value={site}
        onChange={(e) => setSite(e.target.value)}
        placeholder="Site do cliente (ex.: lojaaurora.com.br)"
        className="field-input w-[300px] max-w-full py-2"
      />
      <button type="submit" disabled={salvando} className="btn btn-dark">
        {salvando ? "Salvando..." : "Salvar site"}
      </button>
      {siteInicial && (
        <button type="button" onClick={() => { setSite(siteInicial); setEditando(false); }} className="btn btn-ghost">
          Cancelar
        </button>
      )}
      {erro && <span className="w-full text-body-sm text-warn">{erro}</span>}
    </form>
  );
}

export function VigilanciaDaConta({ contaId, resultado, temSite }: { contaId: string; resultado: ResultadoVigilancia; temSite: boolean }) {
  const router = useRouter();
  const [verificando, setVerificando] = useState(false);
  const [aviso, setAviso] = useState("");

  const verificar = async () => {
    setVerificando(true);
    setAviso("");
    const res = await fetch("/api/vigilancia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contaId }),
    });
    const data = await res.json().catch(() => ({ ok: false }));
    setVerificando(false);
    if (!data.ok) return setAviso(data.error ?? "Não foi possível verificar agora.");
    router.refresh();
  };

  return (
    <div>
      <p className="painel-lede" style={{ marginBottom: 20 }}>
        Todo dia a Dattis confere o site e a documentação deste cliente: HTTPS, certificado SSL, pixel disparando sem banner
        de cookies, formulário sem política de privacidade, contrato e registro em dia.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {resultado && <NotaVigilancia nota={resultado.nota} />}
        <span className="text-body-sm text-muted">
          {resultado ? `Última verificação: ${new Date(resultado.verificadoEm).toLocaleString("pt-BR")}` : "Ainda não verificado."}
        </span>
        <button type="button" onClick={verificar} disabled={verificando} className="btn btn-ghost ml-auto">
          <RefreshCw size={15} className={verificando ? "animate-spin" : ""} />
          {verificando ? "Verificando..." : "Verificar agora"}
        </button>
      </div>
      {aviso && <p className="mt-3 text-body-sm text-warn">{aviso}</p>}
      {!temSite && (
        <p className="mt-4 rounded-2xl bg-caution-tint px-4 py-3 text-body-sm text-caution">
          Cadastre o site do cliente (acima) pra vigilância checar pixel, HTTPS e política de privacidade.
        </p>
      )}

      {resultado && (
        <div className="mt-6">
          <ListaAchados achados={resultado.achados} />
        </div>
      )}
    </div>
  );
}
