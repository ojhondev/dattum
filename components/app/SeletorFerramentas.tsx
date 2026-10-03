"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Search, X } from "lucide-react";
import { CATALOGO_FERRAMENTAS, CATEGORIAS_FERRAMENTA } from "@/lib/ferramentas";
import { AdicionarFerramenta, type FerramentaPropria } from "@/components/app/AdicionarFerramenta";

export type SelecaoFerramentas = { chaves: string[]; personalizadas: string[] };

const normal = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/**
 * Corpo do seletor (controlado): busca, categorias à esquerda e as ferramentas como blocos marcáveis.
 * Cada ferramenta marcada vira um subprocessador do cliente e entra no contrato.
 */
export function SeletorFerramentasCorpo({
  valor,
  onChange,
  proprias = [],
  altura = "h-[min(62vh,560px)]",
}: {
  valor: SelecaoFerramentas;
  onChange: (v: SelecaoFerramentas) => void;
  /** Ferramentas que a agência cadastrou: aparecem junto do catálogo. */
  proprias?: FerramentaPropria[];
  altura?: string;
}) {
  const [busca, setBusca] = useState("");
  const [cat, setCat] = useState<string>("todas");
  const [minhas, setMinhas] = useState<FerramentaPropria[]>(proprias);
  const catalogo = useMemo(() => [...minhas, ...CATALOGO_FERRAMENTAS], [minhas]);
  const marcadas = useMemo(() => new Set(valor.chaves), [valor.chaves]);

  const porCategoria = useMemo(() => {
    const m = new Map<string, number>();
    for (const f of catalogo) if (marcadas.has(f.chave)) m.set(f.categoriaId, (m.get(f.categoriaId) ?? 0) + 1);
    return m;
  }, [marcadas, catalogo]);

  const lista = useMemo(() => {
    const q = normal(busca.trim());
    return catalogo.filter(
      (f) =>
        (q ? normal(`${f.nome} ${f.categoria}`).includes(q) : true) &&
        (cat === "todas" || q
          ? true
          : cat === "marcadas"
            ? marcadas.has(f.chave)
            : cat === "agencia"
              ? (f as FerramentaPropria).daAgencia
              : f.categoriaId === cat),
    );
  }, [busca, cat, marcadas, catalogo]);

  const alternar = (chave: string) =>
    onChange({ ...valor, chaves: marcadas.has(chave) ? valor.chaves.filter((k) => k !== chave) : [...valor.chaves, chave] });
  const cadastrada = (f: FerramentaPropria) => {
    setMinhas((m) => [f, ...m]);
    onChange({ ...valor, chaves: [...valor.chaves, f.chave] });
    setBusca("");
    setCat("marcadas");
  };

  const total = valor.chaves.length + valor.personalizadas.length;
  const categorias = [
    { id: "todas", nome: "Todas", n: catalogo.length, marcadas: 0 },
    { id: "marcadas", nome: "Marcadas", n: total, marcadas: 0 },
    ...(minhas.length ? [{ id: "agencia", nome: "Da agência", n: minhas.length, marcadas: 0 }] : []),
    ...CATEGORIAS_FERRAMENTA.map((c) => ({ id: c.id, nome: c.nome, n: 0, marcadas: porCategoria.get(c.id) ?? 0 })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5 focus-within:border-brand-strong">
        <Search size={16} className="shrink-0 text-faint" />
        <span className="sr-only">Buscar ferramenta</span>
        <input
          id="busca-ferramenta"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder={`Buscar entre ${catalogo.length} ferramentas (ex.: Kommo, Hotmart, Stape)`}
          className="min-w-0 flex-1 bg-transparent text-[14.5px] text-ink outline-none placeholder:text-faint"
        />
        {busca && (
          <button type="button" onClick={() => setBusca("")} aria-label="Limpar busca" className="text-faint hover:text-ink">
            <X size={16} />
          </button>
        )}
      </label>

      <div className={"grid min-h-0 grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] gap-4 md:grid-cols-[220px_minmax(0,1fr)] md:grid-rows-1 " + altura}>
        {/* Categorias: lista vertical no computador, fileira rolável no celular */}
        <nav aria-label="Categorias" className="-mx-1 flex min-w-0 gap-1 overflow-x-auto px-1 pb-1 md:mx-0 md:flex-col md:overflow-y-auto md:overflow-x-visible md:px-0 md:pb-0">
          {categorias.map((c) => {
            const ativa = !busca && cat === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCat(c.id);
                  setBusca("");
                }}
                className={
                  "flex shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-[13.5px] transition-colors md:shrink " +
                  (ativa ? "bg-rail text-white" : "text-body hover:bg-surface-2")
                }
              >
                <span className="whitespace-nowrap md:whitespace-normal">{c.nome}</span>
                {(c.n || c.marcadas) > 0 && (
                  <span className={"rounded-full px-1.5 font-mono text-[11px] tabular-nums " + (ativa ? "bg-white/15" : c.marcadas ? "bg-brand-tint text-brand-ink" : "text-faint")}>
                    {c.n || c.marcadas}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="min-h-0 overflow-y-auto pr-1">
          {cat === "marcadas" && !busca && valor.personalizadas.length > 0 && (
            <ul className="mb-3 flex flex-wrap gap-2">
              {valor.personalizadas.map((n) => (
                <li key={n} className="flex items-center gap-2 rounded-full border border-brand-strong bg-brand-tint py-1.5 pl-3 pr-2 text-[13px] text-ink">
                  {n}
                  <button
                    type="button"
                    aria-label={`Remover ${n}`}
                    onClick={() => onChange({ ...valor, personalizadas: valor.personalizadas.filter((x) => x !== n) })}
                    className="grid h-5 w-5 place-items-center rounded-full text-muted hover:bg-surface hover:text-ink"
                  >
                    <X size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {lista.length === 0 ? (
            <p className="rounded-xl bg-surface-2 px-4 py-8 text-center text-[14px] text-muted">
              {cat === "marcadas" && !busca ? "Nenhuma ferramenta marcada ainda." : "Nada encontrado. Adicione pelo nome logo abaixo."}
            </p>
          ) : (
            <ul className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {lista.map((f) => {
                const on = marcadas.has(f.chave);
                return (
                  <li key={f.chave}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => alternar(f.chave)}
                      className={
                        "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors " +
                        (on ? "border-brand-strong bg-brand-tint" : "border-line bg-surface hover:border-line-strong")
                      }
                    >
                      <span className={"grid h-5 w-5 shrink-0 place-items-center rounded-md border " + (on ? "border-brand-strong bg-brand-strong text-rail" : "border-line-strong")}>
                        {on && <Check size={13} strokeWidth={3} />}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] text-ink">{f.nome}</span>
                        <span className="block truncate text-[11.5px] text-muted">
                          {busca || cat === "todas" || cat === "marcadas" ? `${f.categoria} · ` : ""}
                          {(f as FerramentaPropria).daAgencia ? "Cadastrada pela agência" : f.pais}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13.5px] leading-snug text-muted">Não achou? Cadastre com nome, link e categoria: ela fica disponível para todos os seus clientes.</p>
        <AdicionarFerramenta classe="barra-btn shrink-0" nomeInicial={busca.trim()} onCriada={cadastrada} />
      </div>
    </div>
  );
}

/** Seletor em janela, ligado a um cliente: salva direto e refaz o contrato. */
export function ModalFerramentas({
  contaId,
  inicial,
  contratoAssinado,
  aberto,
  onFechar,
  proprias = [],
}: {
  proprias?: FerramentaPropria[];
  contaId: string;
  inicial: SelecaoFerramentas;
  contratoAssinado: boolean;
  aberto: boolean;
  onFechar: () => void;
}) {
  const router = useRouter();
  const [valor, setValor] = useState(inicial);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!aberto) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  const mudou =
    [...valor.chaves].sort().join("|") !== [...inicial.chaves].sort().join("|") ||
    [...valor.personalizadas].sort().join("|") !== [...inicial.personalizadas].sort().join("|");

  const salvar = async () => {
    if (contratoAssinado && mudou && !confirm("Mudar as ferramentas gera uma nova versão do contrato, que precisa ser assinada de novo pela agência e pelo cliente. Continuar?"))
      return;
    setSalvando(true);
    setErro("");
    const r = await fetch(`/api/contas/${contaId}/ferramentas`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(valor),
    })
      .then((x) => x.json())
      .catch(() => ({ ok: false, error: "Sem conexão. Tente de novo." }));
    setSalvando(false);
    if (!r.ok) return setErro(r.error ?? "Não foi possível salvar.");
    onFechar();
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-rail/50 backdrop-blur-sm sm:items-center sm:p-6" onClick={onFechar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-ferramentas"
        className="flex max-h-[100svh] w-full max-w-5xl flex-col gap-5 overflow-y-auto rounded-t-[24px] bg-canvas p-5 shadow-2xl sm:rounded-[24px] sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="titulo-ferramentas" className="font-display text-[24px] leading-tight text-ink">
              Ferramentas deste cliente
            </h2>
            <p className="mt-1 text-[14px] text-muted">Marque tudo o que recebe dados dele. Cada ferramenta entra na lista de subprocessadores e no contrato.</p>
          </div>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:bg-surface hover:text-ink">
            <X size={18} />
          </button>
        </div>
        <SeletorFerramentasCorpo valor={valor} onChange={setValor} proprias={proprias} />
        {erro && <div className="painel-error">{erro}</div>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13.5px] text-muted">
            {valor.chaves.length + valor.personalizadas.length} ferramenta(s) marcada(s)
            {contratoAssinado && mudou ? " · o contrato ganha uma nova versão" : ""}
          </p>
          <div className="flex gap-2">
            <button type="button" className="painel-btn ghost" onClick={onFechar}>
              Cancelar
            </button>
            <button type="button" className="painel-btn" onClick={salvar} disabled={salvando || !mudou}>
              {salvando ? "Salvando..." : "Salvar ferramentas"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
