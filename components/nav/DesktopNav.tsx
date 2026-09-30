"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { NAV_GROUPS } from "@/components/nav/nav-data";

/** Blocos pixelados que aparecem no canto do cartão ao passar o mouse (como no proofmode.org). */
function PixelCanto() {
  const q: [number, number, number][] = [
    [96, 0, 18], [78, 18, 18], [114, 18, 18], [96, 36, 14], [60, 6, 12], [118, 50, 12],
  ];
  return (
    <svg viewBox="0 0 132 70" className="absolute right-0 top-0 h-[70px] w-[132px] text-brand-tint-2" aria-hidden="true">
      {q.map(([x, y, s], i) => (
        <rect key={i} x={x} y={y} width={s} height={s} fill="currentColor" />
      ))}
    </svg>
  );
}

export function DesktopNav() {
  const [aberto, setAberto] = useState<string | null>(null);
  const fecharTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const abrir = (label: string) => {
    if (fecharTimer.current) clearTimeout(fecharTimer.current);
    setAberto(label);
  };
  const agendarFechar = () => {
    if (fecharTimer.current) clearTimeout(fecharTimer.current);
    fecharTimer.current = setTimeout(() => setAberto(null), 140);
  };

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  const grupo = NAV_GROUPS.find((g) => g.label === aberto);

  return (
    <nav className="hidden lg:block" onMouseLeave={agendarFechar} aria-label="Principal">
      <ul className="flex items-center gap-2">
        {NAV_GROUPS.map((g) => (
          <li key={g.label}>
            <button
              type="button"
              aria-expanded={aberto === g.label}
              onMouseEnter={() => abrir(g.label)}
              onFocus={() => abrir(g.label)}
              onClick={() => (aberto === g.label ? setAberto(null) : abrir(g.label))}
              className="inline-flex items-center gap-2.5 px-4 py-5 text-[16px] text-ink"
            >
              {g.label}
              <ChevronDown size={20} strokeWidth={1.5} className={"transition-transform " + (aberto === g.label ? "rotate-180" : "")} />
            </button>
          </li>
        ))}
      </ul>

      {grupo && (
        <div
          onMouseEnter={() => abrir(grupo.label)}
          className="absolute inset-x-0 top-full z-30 border-t border-line bg-canvas shadow-[0_24px_48px_-12px_rgba(10,18,15,0.18)]"
        >
          <ul className="flex justify-center gap-5 p-5">
            {grupo.items.map((it) => {
              const Icon = it.icon;
              return (
                <li key={it.label} className="max-w-[20%] flex-1">
                  <Link
                    href={it.href}
                    onClick={() => setAberto(null)}
                    className="group relative block h-full overflow-hidden rounded-[20px] bg-gradient-to-b from-canvas to-surface p-5 transition-colors duration-300 hover:from-brand-tint"
                  >
                    <span className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <PixelCanto />
                    </span>
                    <span className="relative flex items-start justify-between gap-3">
                      <span className="font-mono text-[15px] uppercase tracking-[0.03em] text-ink">{it.label}</span>
                      <Icon size={18} strokeWidth={1.6} className="shrink-0 text-ink" />
                    </span>
                    <span className="relative mt-6 block text-[14px] leading-snug text-body">{it.desc}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
}
