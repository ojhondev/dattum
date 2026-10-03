"use client";

import { useEffect, useRef, useState } from "react";
import { FileBarChart, Search, Users } from "lucide-react";

type ContaResumo = { id: string; nome: string };

/**
 * "Gerar relatório" na barra superior: um clique abre o relatório da carteira já pronto para
 * salvar em PDF; a lista embaixo gera o de um cliente só.
 */
export function BotaoRelatorio() {
  const [aberto, setAberto] = useState(false);
  const [contas, setContas] = useState<ContaResumo[] | null>(null);
  const [busca, setBusca] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!aberto) return;
    if (!contas)
      fetch("/api/contas")
        .then((r) => r.json())
        .then((r) => setContas((r.contas ?? []).map((c: ContaResumo) => ({ id: c.id, nome: c.nome }))))
        .catch(() => setContas([]));
    const fora = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setAberto(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto, contas]);

  const lista = (contas ?? []).filter((c) => c.nome.toLowerCase().includes(busca.trim().toLowerCase()));

  return (
    <div ref={ref} className="relative" data-tour="gerar-relatorio">
      <button type="button" onClick={() => setAberto((v) => !v)} aria-expanded={aberto} className="barra-btn primario !h-10 !rounded-xl">
        <FileBarChart size={16} />
        <span className="hidden sm:inline">Gerar relatório</span>
      </button>
      {aberto && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-[min(340px,calc(100vw-32px))] rounded-2xl border border-line bg-surface p-2 shadow-[var(--shadow-pop)]">
          <a href="/painel/relatorio?imprimir=1" className="flex items-center gap-3 rounded-xl bg-brand-tint px-3 py-3 transition-colors hover:bg-brand-tint-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-rail text-brand">
              <Users size={17} />
            </span>
            <span>
              <span className="block text-[14px] font-medium text-ink">Carteira inteira</span>
              <span className="block text-[12.5px] text-muted">Todos os clientes, com o que falta fazer, em PDF</span>
            </span>
          </a>
          <p className="px-3 pb-1.5 pt-3 font-mono text-[11px] uppercase tracking-[0.05em] text-muted">Ou de um cliente</p>
          {contas && contas.length > 6 && (
            <label className="mx-1 mb-1 flex items-center gap-2 rounded-lg border border-line px-2.5 py-1.5">
              <Search size={14} className="text-faint" />
              <span className="sr-only">Buscar cliente</span>
              <input id="busca-relatorio" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar cliente" className="min-w-0 flex-1 bg-transparent text-[13.5px] outline-none" />
            </label>
          )}
          <div className="max-h-[260px] overflow-y-auto">
            {contas === null ? (
              <p className="px-3 py-3 text-[13px] text-muted">Carregando...</p>
            ) : lista.length === 0 ? (
              <p className="px-3 py-3 text-[13px] text-muted">{contas.length ? "Nenhum cliente com esse nome." : "Nenhum cliente cadastrado ainda."}</p>
            ) : (
              lista.map((c) => (
                <a key={c.id} href={`/painel/relatorio?conta=${c.id}&imprimir=1`} className="menu-item">
                  {c.nome}
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
