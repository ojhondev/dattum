"use client";

import { useEffect, useRef, useState } from "react";

export type Trecho = { texto: string; destaque?: boolean; quebraAntes?: boolean };

/**
 * Texto que trava na tela (sticky) e se revela palavra por palavra conforme a rolagem:
 * começa em cinza e fica branco. Trechos com `destaque` mantêm a cor verde o tempo todo.
 * O efeito acompanha a rolagem da própria pessoa (não é animação automática); com
 * prefers-reduced-motion só a transição de cor é desligada (regra global em globals.css).
 */
export function ScrollRevealText({ eyebrow, trechos }: { eyebrow: string; trechos: Trecho[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [progresso, setProgresso] = useState(0);

  useEffect(() => {
    let raf = 0;
    const calcular = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const curso = r.height - window.innerHeight;
      setProgresso(curso > 0 ? Math.min(1, Math.max(0, -r.top / curso)) : 1);
    };
    const agendar = () => {
      if (!raf) raf = requestAnimationFrame(calcular);
    };
    calcular();
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    return () => {
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const palavras = trechos.flatMap((t) =>
    t.texto.split(" ").map((w, i) => ({ w, destaque: !!t.destaque, quebra: !!t.quebraAntes && i === 0 })),
  );
  // Termina de revelar um pouco antes do fim do curso, pra frase completa ficar parada um instante.
  const reveladas = Math.round(Math.min(1, progresso * 1.2) * palavras.length);

  return (
    <div ref={ref} className="relative h-[260vh]">
      <div className="sticky top-0 flex h-svh flex-col justify-center px-5 pb-10 pt-[96px] sm:px-10 lg:px-14">
        <p className="t-eyebrow !text-white/80">{eyebrow}</p>
        <h2 className="mt-6 font-display text-[clamp(2.1rem,5.4vw,5.6rem)] leading-[1.08] tracking-[-0.01em]">
          {palavras.map((p, i) => (
            <span key={i}>
              {p.quebra && <br />}
              <span
                className="transition-colors duration-300"
                style={{ color: p.destaque ? "var(--color-brand)" : i < reveladas ? "#ffffff" : "rgba(255,255,255,0.22)" }}
              >
                {p.w}
              </span>{" "}
            </span>
          ))}
        </h2>
      </div>
    </div>
  );
}
