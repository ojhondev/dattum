"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X, AlertTriangle } from "lucide-react";
import { linkAssinar } from "@/lib/contato";

const EVENTO = "dattis:abrir-calculadora";
const CHAVE = "dattis:calculadora-vista";
const ATRASO_MS = 5000;
const PRECO_GROWTH = 97;
const TETO_MULTA = 50_000_000;

export function abrirCalculadora() {
  window.dispatchEvent(new Event(EVENTO));
}

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function Faixa({
  id,
  label,
  valor,
  min,
  max,
  passo,
  formato,
  onChange,
}: {
  id: string;
  label: string;
  valor: number;
  min: number;
  max: number;
  passo: number;
  formato: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[15px] font-medium text-ink">{label}</span>
        <span className="font-display text-[22px] text-ink">{formato(valor)}</span>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={passo}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[var(--color-brand-strong)]"
      />
    </label>
  );
}

/** Calculadora multa x custo pra agência de tráfego. Abre sozinha após 5s (uma vez a cada 7 dias) ou por evento. */
export function CalculadoraPopup() {
  const [aberto, setAberto] = useState(false);
  const [clientes, setClientes] = useState(10);
  const [faturamento, setFaturamento] = useState(80_000);
  const [verba, setVerba] = useState(150_000);
  const fecharRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const abrir = () => setAberto(true);
    window.addEventListener(EVENTO, abrir);

    let vistaRecente = false;
    try {
      const t = Number(localStorage.getItem(CHAVE) ?? 0);
      vistaRecente = Date.now() - t < 7 * 24 * 60 * 60 * 1000;
    } catch {
      /* sem armazenamento: abre normalmente */
    }
    const timer = vistaRecente ? undefined : setTimeout(abrir, ATRASO_MS);

    return () => {
      window.removeEventListener(EVENTO, abrir);
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!aberto) return;
    try {
      localStorage.setItem(CHAVE, String(Date.now()));
    } catch {
      /* ignora */
    }
    fecharRef.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    window.addEventListener("keydown", esc);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", esc);
      document.body.style.overflow = overflow;
    };
  }, [aberto]);

  if (!aberto) return null;

  const multa = Math.min(0.02 * faturamento * 12, TETO_MULTA);
  const dattisMes = clientes * PRECO_GROWTH;
  const dattisAno = dattisMes * 12;
  const bmParada = (verba / 30) * 7;
  const incidente = multa + bmParada;
  const vezes = dattisAno > 0 ? incidente / dattisAno : 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-6" onClick={() => setAberto(false)}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="calc-titulo"
        onClick={(e) => e.stopPropagation()}
        className="relative grid max-h-[94svh] w-full max-w-5xl overflow-y-auto rounded-t-[32px] bg-canvas sm:rounded-[40px] lg:grid-cols-[1.05fr_1fr]"
      >
        <button
          ref={fecharRef}
          type="button"
          onClick={() => setAberto(false)}
          aria-label="Fechar calculadora"
          className="absolute right-4 top-4 z-10 rounded-full bg-surface p-2 text-ink shadow-[var(--shadow-chip)] hover:bg-surface-2"
        >
          <X size={20} />
        </button>

        <div className="px-7 pb-8 pt-10 sm:px-10 sm:pt-12">
          <p className="flex items-center gap-2 font-mono text-[13px] uppercase tracking-[0.04em] text-warn">
            <AlertTriangle size={15} /> Calculadora de risco · agência de tráfego
          </p>
          <h2 id="calc-titulo" className="t-heading-lg mt-4 max-w-md">
            Quanto sua agência arrisca sem documentação de LGPD?
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-body">
            Três números da sua operação. A conta é na hora.
          </p>

          <div className="mt-8 flex flex-col gap-7">
            <Faixa
              id="calc-clientes"
              label="Clientes que sua agência atende"
              valor={clientes}
              min={1}
              max={150}
              passo={1}
              formato={(v) => String(v)}
              onChange={setClientes}
            />
            <Faixa
              id="calc-faturamento"
              label="Faturamento mensal da agência"
              valor={faturamento}
              min={10_000}
              max={2_000_000}
              passo={10_000}
              formato={brl}
              onChange={setFaturamento}
            />
            <Faixa
              id="calc-verba"
              label="Verba de mídia que vocês gerenciam por mês"
              valor={verba}
              min={10_000}
              max={5_000_000}
              passo={10_000}
              formato={brl}
              onChange={setVerba}
            />
          </div>
        </div>

        <div className="flex flex-col bg-rail px-7 pb-9 pt-10 text-white sm:px-10 sm:pt-12">
          <p className="font-mono text-[12px] uppercase tracking-[0.05em] text-white/60">Multa máxima por infração</p>
          <p className="mt-2 font-display text-[clamp(2.4rem,5vw,3.6rem)] leading-none text-orange">{brl(multa)}</p>
          <p className="mt-2 text-[13px] text-white/60">2% do faturamento anual, limitada a R$ 50 milhões (art. 52, LGPD)</p>

          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-[20px] bg-white/[0.06] p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-white/60">7 dias de BM suspensa</p>
              <p className="mt-2 font-display text-[26px] leading-none text-white">{brl(bmParada)}</p>
              <p className="mt-2 text-[12px] leading-snug text-white/60">em mídia dos seus clientes parada</p>
            </div>
            <div className="rounded-[20px] bg-brand p-5 text-on-brand">
              <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-on-brand/70">Dattis Growth</p>
              <p className="mt-2 font-display text-[26px] leading-none">{brl(dattisMes)}/mês</p>
              <p className="mt-2 text-[12px] leading-snug text-on-brand/75">
                {clientes} {clientes === 1 ? "cliente" : "clientes"} × R$ {PRECO_GROWTH}
              </p>
            </div>
          </div>

          <p className="mt-7 font-display text-[clamp(1.3rem,2.2vw,1.7rem)] leading-snug">
            Um único incidente pode custar <span className="text-orange">{brl(incidente)}</span>
            {vezes >= 1.5 ? (
              <>
                {" "}— <span className="text-brand">{vezes >= 100 ? "mais de 100" : vezes.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} vezes</span> o
                que a Dattis custa por ano.
              </>
            ) : (
              <>
                . A Dattis custa <span className="text-brand">{brl(dattisAno)}</span> por ano pra sua carteira inteira.
              </>
            )}
          </p>
          <p className="mt-2 text-[12px] text-white/50">Incidente = multa máxima + 7 dias de BM suspensa. Sem contar multa diária, publicação da infração e suspensão do tratamento de dados.</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href={linkAssinar("Growth")} target="_blank" rel="noopener" className="btn btn-primary btn-lg">
              Proteger minha agência
            </a>
            <Link href="/planos" onClick={() => setAberto(false)} className="btn btn-lg border-white/25 text-white hover:border-white/60">
              Ver planos
            </Link>
          </div>
          <p className="mt-6 text-[11px] leading-relaxed text-white/45">
            Valores máximos previstos na LGPD. A multa efetivamente aplicada depende da dosimetria da ANPD. A estimativa de
            BM suspensa considera a verba mensal dividida por 30 dias.
          </p>
        </div>
      </div>
    </div>
  );
}

export function BotaoCalculadora({ className = "btn btn-ghost btn-lg", children }: { className?: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={abrirCalculadora} className={className}>
      {children}
    </button>
  );
}
