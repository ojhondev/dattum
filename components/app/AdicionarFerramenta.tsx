"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { CATEGORIAS_FERRAMENTA, type FerramentaCatalogo } from "@/lib/ferramentas";

export type FerramentaPropria = FerramentaCatalogo & { id?: string; site?: string | null; daAgencia?: boolean };

/**
 * Botão + janela para a agência cadastrar uma ferramenta que usa e não está no catálogo:
 * nome, link e categoria. Ela passa a aparecer no seletor de ferramentas de todos os clientes.
 */
export function AdicionarFerramenta({
  rotulo = "Adicionar ferramenta",
  classe = "barra-btn marca",
  nomeInicial = "",
  onCriada,
}: {
  rotulo?: string;
  classe?: string;
  nomeInicial?: string;
  onCriada?: (f: FerramentaPropria) => void;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState(nomeInicial);
  const [site, setSite] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!aberto) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setAberto(false);
    };
    document.addEventListener("keydown", esc, true);
    return () => document.removeEventListener("keydown", esc, true);
  }, [aberto]);

  const abrir = () => {
    setNome(nomeInicial);
    setSite("");
    setCategoriaId("");
    setErro("");
    setAberto(true);
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!nome.trim()) return setErro("Informe o nome da ferramenta.");
    if (!categoriaId) return setErro("Escolha a categoria.");
    setSalvando(true);
    setErro("");
    const r = await fetch("/api/ferramentas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome, site, categoriaId }) })
      .then((x) => x.json())
      .catch(() => ({ ok: false, error: "Sem conexão. Tente de novo." }));
    setSalvando(false);
    if (!r.ok) return setErro(r.error ?? "Não foi possível salvar.");
    const cat = CATEGORIAS_FERRAMENTA.find((c) => c.id === categoriaId)!;
    onCriada?.({
      id: r.ferramenta.id,
      chave: r.ferramenta.chave,
      nome: r.ferramenta.nome,
      categoria: cat.nome,
      categoriaId: cat.id,
      pais: "Não informado",
      finalidadePadrao: cat.finalidade,
      site: site || null,
      daAgencia: true,
    });
    setAberto(false);
    router.refresh();
  };

  return (
    <>
      <button type="button" className={classe} onClick={abrir}>
        <Plus size={15} /> {rotulo}
      </button>
      {aberto &&
        // Portal: fora de qualquer formulário em volta (o onboarding é um form).
        createPortal(
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-rail/50 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setAberto(false)}>
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-nova-ferramenta"
            onSubmit={salvar}
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-lg flex-col gap-4 rounded-t-[24px] bg-canvas p-5 shadow-2xl sm:rounded-[24px] sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="titulo-nova-ferramenta" className="font-display text-[22px] leading-tight text-ink">
                  Adicionar ferramenta
                </h2>
                <p className="mt-1 text-[14px] leading-relaxed text-muted">Uma ferramenta que a agência usa e não está no catálogo. Ela fica disponível para todos os seus clientes.</p>
              </div>
              <button type="button" onClick={() => setAberto(false)} aria-label="Fechar" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:bg-surface hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <label htmlFor="nf-nome" className="flex flex-col gap-1.5">
              <span className="text-[13px] text-muted">Nome da ferramenta</span>
              <input id="nf-nome" autoFocus value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Sistema de agendamento da clínica" className="field-input" maxLength={80} />
            </label>
            <label htmlFor="nf-site" className="flex flex-col gap-1.5">
              <span className="text-[13px] text-muted">Link (site da ferramenta)</span>
              <input id="nf-site" value={site} onChange={(e) => setSite(e.target.value)} inputMode="url" placeholder="ferramenta.com.br" className="field-input" />
            </label>
            <label htmlFor="nf-categoria" className="flex flex-col gap-1.5">
              <span className="text-[13px] text-muted">Categoria</span>
              <select id="nf-categoria" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className="field-input">
                <option value="">Escolha a categoria</option>
                {CATEGORIAS_FERRAMENTA.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
              {categoriaId && <span className="text-[12.5px] leading-snug text-muted">No contrato: {CATEGORIAS_FERRAMENTA.find((c) => c.id === categoriaId)?.finalidade}</span>}
            </label>

            {erro && <p className="rounded-xl bg-warn-tint px-4 py-3 text-[14px] text-warn">{erro}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" className="barra-btn" onClick={() => setAberto(false)}>
                Cancelar
              </button>
              <button type="submit" className="barra-btn primario" disabled={salvando}>
                {salvando ? "Salvando..." : "Adicionar ferramenta"}
              </button>
            </div>
          </form>
        </div>,
          document.body,
        )}
    </>
  );
}
