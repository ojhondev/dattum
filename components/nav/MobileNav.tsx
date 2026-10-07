"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { NAV_GROUPS } from "@/components/nav/nav-data";
import { PixelEdge } from "@/components/marketing/PixelEdge";
import { WHATSAPP_EXIBICAO, linkContato } from "@/lib/contato";
import foto from "../../public/marketing/especialista.png";

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

  // Trava a rolagem da página por trás do menu.
  useEffect(() => {
    if (!open) return;
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && fechar();
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = antes;
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      <button type="button" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(true)} className="rounded-full p-2 text-ink">
        <Menu size={26} />
      </button>

      {open &&
        createPortal(
          <div role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-50 overflow-y-auto bg-canvas">
            <div className="flex min-h-full flex-col">
              <div className="flex h-[76px] shrink-0 items-center justify-between px-4 sm:px-10">
                <Logo height={32} />
                <button type="button" aria-label="Fechar" onClick={fechar} className="rounded-full p-2 text-ink">
                  <X size={26} />
                </button>
              </div>

              <nav className="flex flex-col gap-2 px-4 pt-2 sm:px-10">
                {NAV_GROUPS.map((g) => {
                  const isOpen = aberto === g.label;
                  return (
                    <div
                      key={g.label}
                      className={"pixel-corners transition-colors duration-200 " + (isOpen ? "bg-brand text-on-brand" : "bg-surface text-ink")}
                    >
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setAberto(isOpen ? null : g.label)}
                        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                      >
                        <span className="font-display text-[21px] leading-none">{g.label}</span>
                        <span
                          className={
                            "pixel-corners pixel-corners-sm flex h-8 w-8 items-center justify-center transition-colors " +
                            (isOpen ? "bg-rail text-brand" : "bg-surface-2 text-ink")
                          }
                        >
                          <ChevronDown size={18} strokeWidth={1.8} className={"transition-transform duration-200 " + (isOpen ? "rotate-180" : "")} />
                        </span>
                      </button>

                      {isOpen && (
                        <ul className="flex flex-col gap-1.5 px-2 pb-2">
                          {g.items.map((it) => {
                            const Icon = it.icon;
                            const externo = it.href.startsWith("http");
                            return (
                              <li key={it.href + it.label}>
                                <Link
                                  href={it.href}
                                  onClick={fechar}
                                  target={externo ? "_blank" : undefined}
                                  rel={externo ? "noopener" : undefined}
                                  className="pixel-corners flex items-center gap-3.5 bg-surface px-3.5 py-3 text-ink transition-colors active:bg-surface-2"
                                >
                                  <span className="pixel-corners pixel-corners-sm flex h-10 w-10 shrink-0 items-center justify-center bg-rail text-brand">
                                    <Icon size={18} strokeWidth={1.8} />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-[15px] font-medium leading-snug">{it.label}</span>
                                    <span className="mt-0.5 block text-[13px] leading-snug text-muted">{it.desc}</span>
                                  </span>
                                  <ArrowRight size={16} className="shrink-0 text-faint" />
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </nav>

              <div className="grid gap-2.5 px-4 pt-6 sm:grid-cols-2 sm:px-10">
                <Link href="/cadastro" onClick={fechar} className="btn btn-primary btn-lg w-full sm:col-span-2">
                  Criar conta
                </Link>
                <Link href={ctaHref} onClick={fechar} className="btn btn-dark btn-lg w-full">
                  {ctaLabel}
                </Link>
                <Link href="/entrar" onClick={fechar} className="btn btn-ghost btn-lg w-full">
                  {enterLabel}
                </Link>
              </div>

              <div className="mt-auto pt-10">
                <PixelEdge bg="var(--color-canvas)" fill="var(--color-forest)" />
                <a
                  href={linkContato("Olá! Vim pelo site da Dattis e quero falar com um especialista em LGPD pra agências.")}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-4 bg-forest px-4 pb-10 pt-4 text-white sm:px-10"
                >
                  <span className="block h-14 w-14 shrink-0 rounded-full bg-brand p-[3px]">
                    <Image src={foto} alt="" sizes="56px" className="h-full w-full rounded-full object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[11px] uppercase tracking-[0.06em] text-brand">Fale com Especialista</span>
                    <span className="mt-1 block font-display text-[19px] leading-tight">Tire suas dúvidas no WhatsApp</span>
                    <span className="mt-0.5 block text-[13px] text-white/60">{WHATSAPP_EXIBICAO}</span>
                  </span>
                  <ArrowRight size={18} className="shrink-0 text-brand" />
                </a>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
