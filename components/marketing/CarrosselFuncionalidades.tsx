"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Pause, Play } from "lucide-react";

export type Slide = {
  id: string;
  rotulo: string;
  titulo: string;
  texto: string;
  pontos: string[];
  visual: React.ReactNode;
};

const DURACAO = 7000; // ms em cada funcionalidade

/**
 * Carrossel contínuo das funcionalidades: passa sozinho (barra de progresso na aba da vez),
 * pausa no hover/foco, com setas, botão de pausa, abas clicáveis e arrastar no celular.
 * O último slide emenda no primeiro (cópia no fim da pista), sem voltar rebobinando.
 * Links do menu (/#func-cookies etc.) abrem direto o slide certo.
 * Com prefers-reduced-motion não passa sozinho.
 */
export function CarrosselFuncionalidades({ slides }: { slides: Slide[] }) {
  const n = slides.length;
  const [pos, setPos] = useState(0); // 0..n (n = cópia do primeiro)
  const [seco, setSeco] = useState(false); // troca sem transição (emenda do loop)
  const [pausaUsuario, setPausaUsuario] = useState(false);
  const [pausaHover, setPausaHover] = useState(false);
  const [foraDaTela, setForaDaTela] = useState(true);
  const [reduz, setReduz] = useState(false);
  const secao = useRef<HTMLDivElement | null>(null);
  const abas = useRef<HTMLDivElement | null>(null);
  const toque = useRef<number | null>(null);

  const atual = pos % n;
  const pausado = pausaUsuario || pausaHover || foraDaTela || reduz;

  const ir = useCallback((k: number) => {
    setSeco(false);
    setPos(k);
  }, []);
  const proximo = useCallback(() => {
    setSeco(false);
    setPos((p) => Math.min(p + 1, n));
  }, [n]);
  const anterior = () => {
    if (pos > 0) {
      setSeco(false);
      setPos(pos - 1);
      return;
    }
    // Do primeiro para o último: pula para a cópia sem animar e anda um para trás.
    setSeco(true);
    setPos(n);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setSeco(false);
        setPos(n - 1);
      }),
    );
  };

  // Chegou na cópia do primeiro: volta ao primeiro de verdade sem animar.
  const fimDaTransicao = (e: React.TransitionEvent) => {
    if (e.target !== e.currentTarget || pos !== n) return;
    setSeco(true);
    setPos(0);
    requestAnimationFrame(() => requestAnimationFrame(() => setSeco(false)));
  };

  // Só passa sozinho com a seção na tela; reduced-motion desliga o automático.
  useEffect(() => {
    const el = secao.current;
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const aplicar = () => setReduz(mq.matches);
    const t = setTimeout(aplicar, 0);
    mq.addEventListener("change", aplicar);
    const io = el ? new IntersectionObserver(([e]) => setForaDaTela(!e.isIntersecting), { threshold: 0.25 }) : null;
    if (el) io?.observe(el);
    return () => {
      clearTimeout(t);
      mq.removeEventListener("change", aplicar);
      io?.disconnect();
    };
  }, []);

  // Links do menu: #func-<id> abre o slide correspondente.
  useEffect(() => {
    const abrir = () => {
      const id = decodeURIComponent(location.hash.replace(/^#func-/, ""));
      const k = slides.findIndex((s) => s.id === id);
      if (k >= 0) {
        setSeco(true);
        setPos(k);
        requestAnimationFrame(() => requestAnimationFrame(() => setSeco(false)));
      }
    };
    const t = setTimeout(abrir, 0);
    window.addEventListener("hashchange", abrir);
    return () => {
      clearTimeout(t);
      window.removeEventListener("hashchange", abrir);
    };
  }, [slides]);

  // Mantém a aba da vez visível quando a fileira de abas rola (celular).
  useEffect(() => {
    const c = abas.current;
    const aba = c?.children[atual] as HTMLElement | undefined;
    if (!c || !aba || c.scrollWidth <= c.clientWidth) return;
    c.scrollTo({ left: aba.offsetLeft - c.clientWidth / 2 + aba.offsetWidth / 2, behavior: "smooth" });
  }, [atual]);

  const pista = [...slides, slides[0]];

  return (
    <div
      ref={secao}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Funcionalidades da Dattis"
      onMouseEnter={() => setPausaHover(true)}
      onMouseLeave={() => setPausaHover(false)}
      onFocus={() => setPausaHover(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setPausaHover(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") proximo();
        if (e.key === "ArrowLeft") anterior();
      }}
    >
      {/* Abas + controles */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div ref={abas} role="tablist" aria-label="Escolha a funcionalidade" className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 xl:flex-nowrap">
          {slides.map((s, k) => {
            const ativa = k === atual;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                id={`aba-func-${s.id}`}
                aria-selected={ativa}
                aria-controls={`painel-func-${s.id}`}
                onClick={() => ir(k)}
                className={
                  "relative shrink-0 overflow-hidden rounded-full border px-3.5 py-2.5 text-[13px] leading-none transition-colors " +
                  (ativa ? "border-brand bg-white/[0.08] text-white" : "border-white/15 text-white/65 hover:border-white/40 hover:text-white")
                }
              >
                {ativa && (
                  <span
                    key={pos}
                    aria-hidden="true"
                    className="fs-progresso absolute inset-0 bg-brand/25"
                    style={{ "--dur": `${DURACAO}ms`, animationPlayState: pausado ? "paused" : "running" } as React.CSSProperties}
                    onAnimationEnd={() => !reduz && proximo()}
                  />
                )}
                <span className="relative">{s.rotulo}</span>
              </button>
            );
          })}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <p className="mr-1 font-mono text-[13px] tabular-nums text-white/60" aria-live="polite">
            <span className="text-white">{String(atual + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
          </p>
          <button type="button" onClick={anterior} aria-label="Funcionalidade anterior" className="fs-controle">
            <ArrowLeft size={18} strokeWidth={1.6} />
          </button>
          <button
            type="button"
            onClick={() => setPausaUsuario((v) => !v)}
            aria-label={pausaUsuario ? "Continuar passando" : "Pausar"}
            className="fs-controle"
          >
            {pausaUsuario ? <Play size={16} strokeWidth={1.8} /> : <Pause size={16} strokeWidth={1.8} />}
          </button>
          <button type="button" onClick={proximo} aria-label="Próxima funcionalidade" className="fs-controle fs-controle-forte">
            <ArrowRight size={18} strokeWidth={1.6} />
          </button>
        </div>
      </div>

      {/* Pista */}
      <div
        className="mt-10 overflow-hidden"
        onTouchStart={(e) => (toque.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (toque.current == null) return;
          const dx = e.changedTouches[0].clientX - toque.current;
          toque.current = null;
          if (Math.abs(dx) > 50) (dx < 0 ? proximo : anterior)();
        }}
      >
        <div
          className="fs-pista flex"
          data-seco={seco ? "" : undefined}
          style={{ transform: `translateX(${-pos * 100}%)` }}
          onTransitionEnd={fimDaTransicao}
        >
          {pista.map((s, k) => {
            const ativo = k === pos;
            const copia = k === n;
            return (
              <article
                key={copia ? "copia" : s.id}
                id={copia ? undefined : `painel-func-${s.id}`}
                role={copia ? undefined : "tabpanel"}
                aria-labelledby={copia ? undefined : `aba-func-${s.id}`}
                aria-hidden={!ativo || copia}
                inert={!ativo || copia}
                data-ativo={ativo ? "" : undefined}
                className="grid w-full shrink-0 items-center gap-10 lg:grid-cols-12 lg:gap-14"
              >
                <div className="lg:col-span-5">
                  <p className="fs-entra font-mono text-[12px] uppercase tracking-[0.06em] text-brand">{s.rotulo}</p>
                  <h3 className="fs-entra mt-3 font-display text-[clamp(1.7rem,3vw,2.6rem)] leading-[1.1] text-white" style={{ "--d": "80ms" } as React.CSSProperties}>
                    {s.titulo}
                  </h3>
                  <p className="fs-entra mt-5 text-[17px] leading-relaxed text-white/80" style={{ "--d": "160ms" } as React.CSSProperties}>
                    {s.texto}
                  </p>
                  <ul className="mt-6 flex flex-col gap-2.5">
                    {s.pontos.map((p, j) => (
                      <li key={p} className="fs-entra flex items-start gap-3 text-[15.5px] text-white" style={{ "--d": `${240 + j * 80}ms` } as React.CSSProperties}>
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand text-rail">
                          <Check size={13} strokeWidth={2.5} />
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="min-w-0 lg:col-span-7">{s.visual}</div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
