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
  const h2Ref = useRef<HTMLHeadingElement | null>(null);
  const [fonte, setFonte] = useState<number | null>(null);

  // No celular o texto se ajusta pra ocupar quase toda a altura livre da tela (sem cortar palavra).
  useEffect(() => {
    let largura = 0;
    const ajustar = () => {
      const h2 = h2Ref.current;
      const caixa = h2?.parentElement;
      if (!h2 || !caixa) return;
      if (window.innerWidth >= 1024) {
        h2.style.fontSize = "";
        setFonte(null);
        return;
      }
      const cs = getComputedStyle(caixa);
      const eyebrow = (h2.previousElementSibling as HTMLElement | null)?.offsetHeight ?? 0;
      const livre = caixa.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - eyebrow - parseFloat(getComputedStyle(h2).marginTop);
      const alvo = livre * 0.98;
      let min = 24;
      let max = 76;
      for (let i = 0; i < 14; i++) {
        const meio = (min + max) / 2;
        h2.style.fontSize = `${meio}px`;
        if (h2.scrollHeight <= alvo && h2.scrollWidth <= h2.clientWidth + 1) min = meio;
        else max = meio;
      }
      const melhor = Math.floor(min * 10) / 10;
      h2.style.fontSize = `${melhor}px`;
      setFonte(melhor);
    };
    const aoRedimensionar = () => {
      if (window.innerWidth === largura) return; // ignora a barra de endereço do celular abrindo/fechando
      largura = window.innerWidth;
      ajustar();
    };
    aoRedimensionar();
    document.fonts?.ready.then(ajustar);
    window.addEventListener("resize", aoRedimensionar);
    return () => window.removeEventListener("resize", aoRedimensionar);
  }, []);

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
      <div className="sticky top-0 flex h-svh flex-col justify-center px-5 pb-6 pt-[92px] sm:px-10 sm:pb-10 sm:pt-[96px] lg:px-14">
        <p className="t-eyebrow !text-white/80">{eyebrow}</p>
        <h2
          ref={h2Ref}
          style={fonte ? { fontSize: `${fonte}px` } : undefined}
          className="mt-4 font-display text-[clamp(2.1rem,min(5.4vw,8.6svh),5.6rem)] leading-[1.04] tracking-[-0.01em] sm:mt-6 lg:leading-[1.08]"
        >
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
