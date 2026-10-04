"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, MoreHorizontal, Search, X } from "lucide-react";

/*
  Padrão visual dos módulos do painel. Toda página segue a mesma ordem:
  1. (só em páginas de detalhe) CabecalhoDetalhe: voltar, nome, dados curtos, situação e ações.
  2. BarraModulo: barra fixa no topo com filtros/abas à esquerda e ações à direita.
  3. O conteúdo, sem texto de apresentação: o título e a descrição do módulo já estão na barra superior.
*/

/** Barra de funcionalidades: fica presa abaixo da barra superior ao rolar. */
export function BarraModulo({ esquerda, direita }: { esquerda?: React.ReactNode; direita?: React.ReactNode }) {
  return (
    <div className="no-print sticky top-[76px] z-10 -mx-4 mb-6 bg-canvas/92 px-4 py-3 backdrop-blur sm:-mx-10 sm:px-10">
      <div className="flex flex-col gap-2.5 rounded-2xl border border-line bg-surface p-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">{esquerda}</div>
        {direita && <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{direita}</div>}
      </div>
    </div>
  );
}

/** Cabeçalho das páginas de detalhe (um cliente, um dossiê): curto, com a situação em chips. */
export function CabecalhoDetalhe({
  voltar,
  titulo,
  meta,
  chips,
  acoes,
}: {
  voltar?: { href: string; rotulo: string };
  titulo: string;
  meta?: React.ReactNode;
  chips?: React.ReactNode;
  acoes?: React.ReactNode;
}) {
  return (
    <header className="mb-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {voltar && (
          <Link href={voltar.href} className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink">
            <ArrowLeft size={14} /> {voltar.rotulo}
          </Link>
        )}
        <h1 className="mt-2 truncate font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight text-ink">{titulo}</h1>
        {meta && <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13.5px] text-muted">{meta}</div>}
        {chips && <div className="mt-3 flex flex-wrap gap-1.5">{chips}</div>}
      </div>
      {acoes && <div className="no-print flex shrink-0 flex-wrap items-center gap-2">{acoes}</div>}
    </header>
  );
}

/** Chip de situação: verde (em dia), laranja (pendente), cinza (neutro). */
export function ChipSituacao({ tom, children }: { tom: "ok" | "pendente" | "neutro" | "alerta"; children: React.ReactNode }) {
  const cor = {
    ok: "bg-ok-tint text-brand-ink",
    pendente: "bg-warn-tint text-warn",
    alerta: "bg-danger-tint text-danger",
    neutro: "bg-surface-2 text-muted border border-line",
  }[tom];
  return (
    <span className={"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] " + cor}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

function useParam() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const definir = (nome: string, valor: string | null) => {
    const p = new URLSearchParams(params.toString());
    if (valor) p.set(nome, valor);
    else p.delete(nome);
    const q = p.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };
  return { valor: (nome: string) => params.get(nome), definir };
}

/** Busca que vive na URL (?q=), para a página filtrar no servidor. */
export function BuscaModulo({ placeholder = "Buscar...", nome = "q" }: { placeholder?: string; nome?: string }) {
  const { valor, definir } = useParam();
  const [texto, setTexto] = useState(valor(nome) ?? "");
  const atraso = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const mudar = (v: string) => {
    setTexto(v);
    clearTimeout(atraso.current);
    atraso.current = setTimeout(() => definir(nome, v.trim() || null), 250);
  };
  useEffect(() => () => clearTimeout(atraso.current), []);

  return (
    <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-canvas px-2.5 focus-within:border-brand-strong sm:w-[260px] sm:flex-none">
      <Search size={15} className="shrink-0 text-faint" />
      <span className="sr-only">{placeholder}</span>
      <input
        id={`busca-${nome}`}
        value={texto}
        onChange={(e) => mudar(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[13.5px] text-ink outline-none placeholder:text-faint"
      />
      {texto && (
        <button type="button" aria-label="Limpar" onClick={() => mudar("")} className="text-faint hover:text-ink">
          <X size={14} />
        </button>
      )}
    </label>
  );
}

/** Filtro em botões segmentados, na URL (?{nome}=valor). O valor padrão (o primeiro, se não informado) fica sem parâmetro. */
export function FiltroModulo({ nome, opcoes, padrao }: { nome: string; opcoes: { valor: string; rotulo: string; n?: number }[]; padrao?: string }) {
  const { valor, definir } = useParam();
  const base = padrao ?? opcoes[0]?.valor;
  const atual = valor(nome) ?? base;
  return (
    <div role="group" className="flex max-w-full flex-wrap gap-1 rounded-lg bg-canvas p-1">
      {opcoes.map((o) => {
        const on = atual === o.valor;
        return (
          <button
            key={o.valor}
            type="button"
            aria-pressed={on}
            onClick={() => definir(nome, o.valor === base ? null : o.valor)}
            className={
              "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors " +
              (on ? "bg-surface text-ink shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : "text-muted hover:text-ink")
            }
          >
            {o.rotulo}
            {o.n !== undefined && <span className="font-mono text-[11px] tabular-nums text-faint">{o.n}</span>}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Filtro em lista suspensa, na URL (?{nome}=valor), para quando há opções demais para botões
 * (ex.: as categorias de ferramentas). O valor padrão (o primeiro) fica sem parâmetro.
 */
export function SelecaoModulo({ nome, rotulo, opcoes }: { nome: string; rotulo: string; opcoes: { valor: string; rotulo: string; n?: number }[] }) {
  const { valor, definir } = useParam();
  const base = opcoes[0]?.valor;
  return (
    <label className="flex h-9 min-w-0 items-center gap-2 rounded-lg border border-line bg-canvas pl-2.5 pr-1 focus-within:border-brand-strong">
      <span className="shrink-0 text-[13px] text-muted">{rotulo}</span>
      <select
        id={`filtro-${nome}`}
        value={valor(nome) ?? base}
        onChange={(e) => definir(nome, e.target.value === base ? null : e.target.value)}
        className="h-full min-w-0 max-w-[240px] cursor-pointer bg-transparent text-[13.5px] text-ink outline-none"
      >
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
            {o.n !== undefined ? ` (${o.n})` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Abas de uma página de detalhe (controladas pela própria página). */
export function AbasModulo<T extends string>({ abas, atual, onChange }: { abas: { id: T; rotulo: string; n?: number }[]; atual: T; onChange: (id: T) => void }) {
  return (
    <div role="tablist" className="flex max-w-full flex-wrap gap-1 rounded-lg bg-canvas p-1">
      {abas.map((a) => {
        const on = a.id === atual;
        return (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(a.id)}
            className={
              "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-[13.5px] transition-colors " +
              (on ? "bg-surface text-ink shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : "text-muted hover:text-ink")
            }
          >
            {a.rotulo}
            {a.n !== undefined && <span className="font-mono text-[11px] tabular-nums text-faint">{a.n}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Menu "Mais" para ações secundárias. Os itens são links ou botões com a classe .menu-item. */
export function MenuAcoes({ children, rotulo = "Mais ações" }: { children: React.ReactNode; rotulo?: string }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setAberto(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-label={rotulo} aria-expanded={aberto} onClick={() => setAberto((v) => !v)} className="barra-btn !px-2.5">
        <MoreHorizontal size={17} />
      </button>
      {aberto && (
        <div role="menu" className="absolute right-0 top-[calc(100%+6px)] z-30 flex w-64 flex-col rounded-xl border border-line bg-surface p-1.5 shadow-[var(--shadow-pop)]" onClick={() => setAberto(false)}>
          {children}
        </div>
      )}
    </div>
  );
}
