"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { NAV_GROUPS } from "@/components/nav/nav-data";

export function MobileNav({
  ctaLabel,
  ctaHref,
  enterLabel,
}: {
  ctaLabel: string;
  ctaHref: string;
  enterLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [aberto, setAberto] = useState<string | null>(null);
  const fechar = () => {
    setOpen(false);
    setAberto(null);
  };

  return (
    <div className="lg:hidden">
      <button type="button" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(true)} className="rounded-full p-2 text-ink">
        <Menu size={26} />
      </button>

      {open &&
        createPortal(
        <div className="fixed inset-0 z-50 flex flex-col bg-canvas">
          <div className="flex h-[76px] shrink-0 items-center justify-between px-4">
            <Logo height={32} />
            <button type="button" aria-label="Fechar" onClick={fechar} className="rounded-full p-2 text-ink">
              <X size={26} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 pb-32">
            {NAV_GROUPS.map((g) => {
              const isOpen = aberto === g.label;
              return (
                <div key={g.label}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setAberto(isOpen ? null : g.label)}
                    className="flex w-full items-center justify-between py-5 text-left text-[16px] text-ink"
                  >
                    {g.label}
                    <ChevronDown size={22} strokeWidth={1.5} className={"transition-transform " + (isOpen ? "rotate-180" : "")} />
                  </button>
                  {isOpen && (
                    <ul className="flex flex-col gap-5 border-t border-line pb-6 pt-5">
                      {g.items.map((it) => (
                        <li key={it.href + it.label}>
                          <Link href={it.href} onClick={fechar} className="block">
                            <span className="block text-[15px] font-medium text-ink">{it.label}</span>
                            <span className="mt-0.5 block text-[14px] text-muted">{it.desc}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-4 bg-gradient-to-t from-canvas via-canvas to-transparent px-4 pb-8 pt-10">
            <Link href={ctaHref} onClick={fechar} className="btn btn-dark">
              {ctaLabel}
            </Link>
            <Link href="/entrar" onClick={fechar} className="btn btn-primary">
              {enterLabel}
            </Link>
          </div>
        </div>,
          document.body,
        )}
    </div>
  );
}
