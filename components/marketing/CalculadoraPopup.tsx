"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { linkAssinar } from "@/lib/contato";
import logoClaro from "../../public/brand/logo-fundo-claro.png";
import logoEscuro from "../../public/brand/logo-fundo-dark.png";

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
        <span className="text-[14px] text-muted">{label}</span>
        <span className="font-display text-[19px] text-ink">{formato(valor)}</span>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={passo}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--color-ink)]"
      />
    </label>
  );
}

function Resultado({ label, valor, nota }: { label: string; valor: string; nota: string }) {
  return (
    <div className="flex min-w-0 flex-col justify-between px-2 py-3.5 first:pl-0 last:pr-0 sm:px-4 sm:py-4">
      <span className="block text-[11px] leading-tight text-muted sm:text-[12px]">{label}</span>
      <span className="mt-1 block font-display text-[15px] leading-tight text-ink sm:text-[21px]">{valor}</span>
      <span className="mt-1 hidden text-[11px] leading-snug text-faint sm:block">{nota}</span>
    </div>
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

    // Links pra "#calculadora" (menu Ferramentas) abrem o popup sem sair da página.
    const aoClicar = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (a && a.getAttribute("href")?.endsWith("#calculadora")) {
        e.preventDefault();
        abrir();
      }
    };
    document.addEventListener("click", aoClicar, true);
    if (window.location.hash === "#calculadora") {
      abrir();
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }

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
      document.removeEventListener("click", aoClicar, true);
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
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 sm:items-center sm:p-6" onClick={() => setAberto(false)}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="calc-titulo"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[94svh] w-full max-w-[600px] overflow-y-auto rounded-t-[28px] bg-surface px-5 pb-4 pt-5 sm:rounded-[32px] sm:px-10 sm:pb-8 sm:pt-7"
      >
        <div className="flex items-center justify-between">
          <span className="inline-flex">
            <Image src={logoClaro} alt="Dattis" height={24} width={Math.round((logoClaro.width / logoClaro.height) * 24)} className="logo-light" />
            <Image src={logoEscuro} alt="Dattis" height={24} width={Math.round((logoEscuro.width / logoEscuro.height) * 24)} className="logo-dark" />
          </span>
          <button ref={fecharRef} type="button" onClick={() => setAberto(false)} aria-label="Fechar calculadora" className="rounded-full p-2 text-muted hover:bg-surface-2 hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <p className="t-eyebrow mt-4 sm:mt-6">Calculadora de risco</p>
        <h2 id="calc-titulo" className="mt-2 font-display text-[22px] leading-tight text-ink sm:text-[1.9rem]">
          Quanto sua agência arrisca sem documentação de LGPD?
        </h2>

        <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:gap-4">
          <Faixa id="calc-clientes" label="Clientes que sua agência atende" valor={clientes} min={1} max={150} passo={1} formato={(v) => String(v)} onChange={setClientes} />
          <Faixa id="calc-faturamento" label="Faturamento mensal da agência" valor={faturamento} min={10_000} max={2_000_000} passo={10_000} formato={brl} onChange={setFaturamento} />
          <Faixa id="calc-verba" label="Verba de mídia gerida por mês" valor={verba} min={10_000} max={5_000_000} passo={10_000} formato={brl} onChange={setVerba} />
        </div>

        <div className="mt-6 grid grid-cols-3 divide-x divide-line border-y border-line">
          <Resultado label="Multa máxima" valor={brl(multa)} nota="2% do faturamento anual (art. 52)" />
          <Resultado label="7 dias de BM parada" valor={brl(bmParada)} nota="mídia dos clientes parada" />
          <Resultado label="Dattis Growth" valor={`${brl(dattisMes)}/mês`} nota={`${clientes} ${clientes === 1 ? "cliente" : "clientes"} × R$ ${PRECO_GROWTH}`} />
        </div>

        <p className="mt-5 font-display text-[17px] leading-snug text-ink sm:text-[19px]">
          Um único incidente pode custar {brl(incidente)}
          {vezes >= 1.5 ? (
            <>
              {" "}— <span className="text-brand-ink">{vezes >= 100 ? "mais de 100" : vezes.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}×</span> o custo
              anual da Dattis.
            </>
          ) : (
            <>. A Dattis custa {brl(dattisAno)} por ano pra sua carteira inteira.</>
          )}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
          <a href={linkAssinar("Growth")} target="_blank" rel="noopener" className="btn btn-dark btn-lg w-full sm:w-auto">
            Proteger minha agência
          </a>
          <Link href="/planos" onClick={() => setAberto(false)} className="nav-link mx-auto text-[15px] sm:mx-0">
            Ver planos
          </Link>
        </div>

        <p className="mt-5 text-[11px] leading-relaxed text-faint">
          Valores máximos previstos na LGPD; a multa aplicada depende da dosimetria da ANPD. Incidente = multa máxima + 7 dias de
          BM suspensa (verba mensal ÷ 30).
        </p>
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
