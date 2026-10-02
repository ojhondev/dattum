"use client";

import { useEffect, useRef } from "react";

/**
 * Palco das ilustrações animadas (classes .an-* em globals.css). Renderiza no estado
 * final; se a ilustração ainda está abaixo da dobra, volta ao início e toca uma vez ao
 * entrar na tela. Sem JS ou com prefers-reduced-motion, fica parada no estado final.
 */
export function Cena({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return; // já à vista: não pisca
    el.dataset.cena = "espera";
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.dataset.cena = "ativa";
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
