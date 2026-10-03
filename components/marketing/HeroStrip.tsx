"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import marca from "../../public/brand/icone-sidebar-menta.png";

/**
 * Faixa do hero: uma conta de cliente ativada na Dattis, passo a passo — ferramentas
 * mapeadas, RAT, contrato, aviso de cookies, vigilância e selo. Os cartões acendem em
 * sequência (um trilho em cima mostra o avanço) e a história recomeça. No celular a
 * faixa desliza para manter o cartão da vez no centro. Decorativo.
 *
 * Estado inicial (SSR, sem JS): primeiro passo aceso, o resto aguardando — tudo legível.
 * Com prefers-reduced-motion vai direto para "tudo feito" e para.
 */

const N = 6;
const RITMO = 1900; // ms por passo
const PAUSA = 2; // passos extras parados com tudo feito antes de recomeçar

type Passo = { rotulo: string; legenda: string; corpo: React.ReactNode };

function Ferramentas() {
  return (
    <div className="flex h-full flex-col">
      <p className="font-display text-[21px] leading-tight text-ink">Loja Aurora</p>
      <p className="mt-0.5 font-mono text-[10.5px] text-muted">lojaaurora.com.br</p>
      <div className="mt-auto flex flex-wrap gap-1.5">
        {["Meta Ads", "WhatsApp", "Google Ads", "RD Station"].map((t, i) => (
          <span
            key={t}
            className="fx-pop rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[11px] text-ink"
            style={{ "--d": `${150 + i * 140}ms` } as React.CSSProperties}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function Rat() {
  const linhas = [
    ["Finalidade", "Campanhas", 70],
    ["Base legal", "Art. 7º, IX", 55],
    ["Retenção", "6 meses", 45],
  ] as const;
  return (
    <dl className="flex h-full flex-col justify-end divide-y divide-line text-[12px]">
      {linhas.map(([k, v, w], i) => (
        <div key={k} className="grid grid-cols-[76px_1fr] items-center gap-2 py-2">
          <dt className="text-muted">{k}</dt>
          <dd className="grid">
            <span className="fx-fade fx-antes col-start-1 row-start-1 h-2 self-center rounded-full bg-line" style={{ width: `${w}%` }} />
            <span
              className="fx-fade fx-depois col-start-1 row-start-1 text-ink"
              style={{ transitionDelay: `${200 + i * 220}ms` }}
            >
              {v}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Contrato() {
  return (
    <div className="flex h-full flex-col">
      <div className="space-y-1.5">
        {[100, 92, 96, 70].map((w, i) => (
          <span key={i} className="block h-[4px] rounded-full bg-line" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="mt-auto">
        <svg viewBox="0 0 120 30" className="h-8 w-28 text-ink" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path
            pathLength={1}
            className="fx-traco"
            d="M3 21c7-12 12-16 14-11s-5 12-2 10 9-14 12-12-3 10 0 9 7-8 10-8 2 6 5 5 9-7 14-7 5 5 10 4 11-4 18-4"
          />
        </svg>
        <div className="h-px bg-line-strong" />
        <p className="mt-1.5 grid text-[11px]">
          <span className="fx-fade fx-antes col-start-1 row-start-1 text-muted">Aguardando assinatura</span>
          <span className="fx-fade fx-depois col-start-1 row-start-1 text-ink" style={{ transitionDelay: "900ms" }}>
            Ana Souza · assinado 14:32
          </span>
        </p>
      </div>
    </div>
  );
}

function Cookies() {
  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 overflow-hidden rounded-xl border border-line bg-surface-2">
        <div className="space-y-1.5 p-2.5">
          <span className="block h-2 w-1/2 rounded-full bg-line" />
          <span className="block h-1.5 w-4/5 rounded-full bg-line" />
          <span className="block h-1.5 w-3/5 rounded-full bg-line" />
        </div>
        <div className="fx-fade fx-depois absolute inset-x-1.5 bottom-1.5 rounded-lg bg-rail p-2 text-white shadow-lg">
          <p className="flex items-center gap-1.5 text-[10.5px]">
            <Image src={marca} alt="" className="h-3 w-auto" />
            Sua privacidade importa
          </p>
          <div className="mt-1.5 flex gap-1">
            <span className="rounded-full border border-white/25 px-2 py-0.5 text-[9.5px]">Recusar</span>
            <span className="fx-fade rounded-full bg-white/15 px-2 py-0.5 text-[9.5px] [[data-feito]_&]:bg-brand [[data-feito]_&]:text-rail" style={{ transitionDelay: "1000ms" }}>
              Aceitar
            </span>
          </div>
        </div>
      </div>
      <p className="mt-2.5 grid text-[11.5px]">
        <span className="fx-fade fx-antes col-start-1 row-start-1 flex items-center gap-1.5 text-muted">
          <span className="h-2 w-2 rounded-full bg-orange" /> Pixel sem consentimento
        </span>
        <span className="fx-fade fx-depois col-start-1 row-start-1 flex items-center gap-1.5 text-ink" style={{ transitionDelay: "1300ms" }}>
          <span className="h-2 w-2 rounded-full bg-brand-strong" /> Pixel só depois do aceite
        </span>
      </p>
    </div>
  );
}

function Vigilancia() {
  return (
    <div className="flex h-full items-center gap-4">
      <div className="fx-anel grid h-[76px] w-[76px] shrink-0 place-items-center rounded-full" style={{ "--alvo": 96 } as React.CSSProperties}>
        <div className="grid h-[62px] w-[62px] place-items-center rounded-full bg-surface">
          <span className="fx-num font-display text-[24px] leading-none text-ink" style={{ "--alvo": 96 } as React.CSSProperties} />
        </div>
      </div>
      <div className="text-[11.5px] leading-snug">
        <p className="text-ink">Hoje, 06:00</p>
        <p className="mt-1 text-muted">Cadeado, pixel, formulários e contrato</p>
      </div>
    </div>
  );
}

function Selo() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="fx-pop an-brilho flex w-full items-center gap-2.5 rounded-2xl bg-rail px-3 py-3 text-white" style={{ "--d": "200ms" } as React.CSSProperties}>
        <Image src={marca} alt="" className="h-7 w-auto shrink-0" />
        <span className="min-w-0">
          <span className="block font-mono text-[8.5px] tracking-[0.1em] text-brand">DATTIS · LGPD</span>
          <span className="block font-display text-[14px] leading-tight">Privacidade verificada</span>
        </span>
      </div>
      <p className="font-mono text-[10.5px] text-muted">DTS-7K3F-9QPA</p>
    </div>
  );
}

const PASSOS: Passo[] = [
  { rotulo: "Conta ativada", legenda: "Ferramentas do cliente mapeadas", corpo: <Ferramentas /> },
  { rotulo: "RAT", legenda: "Registro gerado sozinho", corpo: <Rat /> },
  { rotulo: "Contrato", legenda: "Cliente assina pelo celular", corpo: <Contrato /> },
  { rotulo: "Cookies", legenda: "Banner segura o pixel", corpo: <Cookies /> },
  { rotulo: "Vigilância", legenda: "Site conferido todo dia", corpo: <Vigilancia /> },
  { rotulo: "Selo", legenda: "Qualquer pessoa confere", corpo: <Selo /> },
];

export function HeroStrip() {
  const [passo, setPasso] = useState(0);
  const palco = useRef<HTMLDivElement | null>(null);
  const faixa = useRef<HTMLDivElement | null>(null);

  // Relógio da história: só anda com a faixa visível e a aba aberta.
  useEffect(() => {
    const el = palco.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => setPasso(N), 0);
      return () => clearTimeout(t);
    }
    let timer: ReturnType<typeof setInterval> | undefined;
    const parar = () => {
      clearInterval(timer);
      timer = undefined;
    };
    const andar = () => {
      if (timer || document.hidden) return;
      timer = setInterval(() => {
        if (document.documentElement.classList.contains("video-aberto")) return; // vídeo aberto por cima: a faixa espera
        setPasso((p) => (p >= N + PAUSA - 1 ? -1 : p + 1));
      }, RITMO);
    };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? andar() : parar()), { threshold: 0.2 });
    io.observe(el);
    const aba = () => (document.hidden ? parar() : el.getBoundingClientRect().top < innerHeight && andar());
    document.addEventListener("visibilitychange", aba);
    return () => {
      parar();
      io.disconnect();
      document.removeEventListener("visibilitychange", aba);
    };
  }, []);

  // Tela estreita: desliza a faixa para o cartão da vez ficar no centro.
  useEffect(() => {
    const centralizar = () => {
      const p = palco.current;
      const f = faixa.current;
      if (!p || !f) return;
      const sobra = f.scrollWidth - p.clientWidth;
      if (sobra <= 0) {
        f.style.transform = "";
        return;
      }
      const alvo = f.children[Math.min(Math.max(passo, 0), N - 1) + 1] as HTMLElement | undefined; // [0] é o trilho
      if (!alvo) return;
      const x = alvo.offsetLeft + alvo.offsetWidth / 2 - p.clientWidth / 2;
      f.style.transform = `translateX(${-Math.min(Math.max(x, 0), sobra)}px)`;
    };
    centralizar();
    window.addEventListener("resize", centralizar);
    return () => window.removeEventListener("resize", centralizar);
  }, [passo]);

  const progresso = Math.min(Math.max(passo, 0), N - 1) / (N - 1);

  return (
    <div ref={palco} aria-hidden="true" className="pointer-events-none relative w-full select-none overflow-hidden pb-14 pt-14">
      <div ref={faixa} className="fx-faixa relative mx-auto flex w-max gap-4 px-5">
        {/* Trilho: liga o centro do primeiro ao do último cartão */}
        <div className="absolute left-[calc(1.25rem+100px)] right-[calc(1.25rem+100px)] top-[5px] h-[2px] rounded-full bg-line">
          <div
            className="fx-trilho-fill h-full rounded-full bg-brand-strong"
            style={{ transform: `scaleX(${passo < 0 ? 0 : progresso})` }}
          />
        </div>
        {PASSOS.map((s, i) => {
          const feito = passo >= i;
          const ativo = passo === i;
          return (
            <div key={s.rotulo} className="relative flex w-[200px] shrink-0 flex-col items-center gap-5">
              <span
                className={
                  "relative z-10 h-3 w-3 rounded-full border-2 transition-colors duration-500 " +
                  (feito ? "border-brand-strong bg-brand-strong" : "border-line-strong bg-canvas") +
                  (ativo ? " an-pulso" : "")
                }
              />
              <div
                data-feito={feito ? "" : undefined}
                data-ativo={ativo ? "" : undefined}
                className="fx-card flex h-[244px] w-full flex-col rounded-[20px] border border-line bg-surface p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted">{s.rotulo}</p>
                  <span className="relative h-5 w-5 rounded-full border border-line">
                    <span className="fx-pop absolute -inset-px grid place-items-center rounded-full bg-brand-strong text-rail">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  </span>
                </div>
                <div className="mt-4 min-h-0 flex-1">{s.corpo}</div>
                <p className="mt-3 border-t border-line pt-2.5 text-[12px] leading-snug text-body">{s.legenda}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
