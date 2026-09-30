"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

type Item = { href: string; label: string };

export function MobileNav({
  items,
  ctaLabel,
  ctaHref,
  enterLabel,
}: {
  items: Item[];
  ctaLabel: string;
  ctaHref: string;
  enterLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button type="button" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(true)} className="rounded-full p-2 text-ink">
        <Menu size={24} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-canvas">
          <div className="flex h-[76px] items-center justify-end px-5">
            <button type="button" aria-label="Fechar" onClick={() => setOpen(false)} className="rounded-full p-2">
              <X size={24} />
            </button>
          </div>
          <nav className="flex flex-col px-5 pt-2">
            {items.map((it) => (
              <Link key={it.href} href={it.href} onClick={() => setOpen(false)} className="font-display border-b border-line py-4 text-[26px]">
                {it.label}
              </Link>
            ))}
            <div className="mt-8 flex flex-col gap-3">
              <Link href={ctaHref} onClick={() => setOpen(false)} className="btn btn-dark btn-lg">
                {ctaLabel}
              </Link>
              <Link href="/entrar" onClick={() => setOpen(false)} className="btn btn-primary btn-lg">
                {enterLabel}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
