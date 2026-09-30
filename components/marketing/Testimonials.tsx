"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

type Item = { quote: string; name: string; role: string };

export function Testimonials({ kicker, title, items, note }: { kicker: string; title: string; items: Item[]; note: string }) {
  const [i, setI] = useState(0);
  const go = (d: number) => setI((n) => (n + d + items.length) % items.length);

  return (
    <section className="relative z-10 bg-canvas">
      <div className="w-full overflow-hidden px-5 py-24 sm:px-10 lg:px-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="t-eyebrow mb-4">{kicker}</p>
            <h2 className="t-display max-w-2xl">{title}</h2>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => go(-1)} aria-label="Anterior" className="arrow-circle rotate-180">
              <ArrowRight size={18} strokeWidth={1.6} />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Próximo" className="arrow-circle">
              <ArrowRight size={18} strokeWidth={1.6} />
            </button>
          </div>
        </div>

        <div className="mt-12">
          <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
            {items.map((t, idx) => (
              <figure key={idx} className="w-full shrink-0 pr-1">
                <div className="block-card max-w-4xl p-8 sm:p-12">
                  <blockquote className="font-display text-[clamp(1.4rem,2.6vw,2rem)] leading-snug text-ink">“{t.quote}”</blockquote>
                  <figcaption className="mt-8 flex flex-wrap items-center gap-2">
                    <span className="tag">{t.name}</span>
                    <span className="tag tag-white">{t.role}</span>
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
        </div>

        <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.04em] text-faint">{note}</p>
      </div>
    </section>
  );
}
