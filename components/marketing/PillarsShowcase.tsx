"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type Pillar = {
  id: string;
  tab: string;
  heading: string;
  body: string;
  cta: string;
  href: string;
  panel: "rat" | "dpa" | "subprocessadores";
  tint: string;
};

const PANEL_BG: Record<Pillar["panel"], string> = {
  rat: "#c9f5df",
  dpa: "#dbf5ee",
  subprocessadores: "#e7f0e2",
};

function MiniRat() {
  return (
    <div className="w-full max-w-xs rounded-none border border-line bg-surface p-4">
      <p className="font-ui text-caption text-muted">Conversion API (CAPI)</p>
      <div className="mt-3 space-y-2 font-ui text-caption">
        <div className="flex items-center justify-between">
          <span className="text-body">Categoria de dado</span>
          <span className="text-muted">contato hasheado</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-body">Base legal</span>
          <span className="text-muted">art. 7º, IX</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-body">Retenção</span>
          <span className="text-muted">6 meses</span>
        </div>
      </div>
    </div>
  );
}

function MiniDpa() {
  const rows = [
    { l: "Operadora", v: "Agência Aurora" },
    { l: "Controladora", v: "Loja Aurora" },
    { l: "Status", v: "Assinado" },
  ];
  return (
    <div className="w-full max-w-xs rounded-none border border-line bg-surface p-4">
      <p className="font-ui text-caption text-muted">Contrato de operador (DPA)</p>
      <div className="mt-3 space-y-1.5 font-ui text-caption">
        {rows.map((r) => (
          <div key={r.l} className="flex items-center justify-between">
            <span className="text-smoke">{r.l}</span>
            <span className="text-muted">{r.v}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pill pill-ok">Assinado eletronicamente</div>
    </div>
  );
}

function MiniSubprocessadores() {
  const rows = [
    { t: "Meta Ads", n: 24 },
    { t: "WhatsApp Business API", n: 22 },
    { t: "RD Station", n: 11 },
  ];
  return (
    <div className="w-full max-w-xs rounded-none border border-line bg-surface p-4">
      <p className="font-ui text-caption text-muted">Registro de subprocessadores</p>
      <div className="mt-3 space-y-2.5">
        {rows.map((r) => (
          <div key={r.t}>
            <div className="font-ui mb-1 flex justify-between text-caption">
              <span>{r.t}</span>
              <span className="text-muted">{r.n} contas</span>
            </div>
            <div className="relative h-3 rounded-none bg-line">
              <div className="absolute inset-y-0 left-0 rounded-none bg-brand" style={{ width: `${(r.n / 24) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PillarsShowcase({
  kicker,
  title,
  pillars,
  fluid = "w-full px-5 sm:px-10 lg:px-20",
}: {
  kicker: string;
  title: string;
  pillars: Pillar[];
  fluid?: string;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (paused || !inView) return;
    const id = setInterval(() => setActive((a) => (a + 1) % pillars.length), 4200);
    return () => clearInterval(id);
  }, [paused, inView, pillars.length]);

  const p = pillars[active];

  return (
    <section ref={wrapRef} className={`${fluid} py-24`} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <p className="t-eyebrow mb-3">{kicker}</p>
      <h2 className="t-heading-lg max-w-2xl">{title}</h2>

      <div className="mt-10 rounded-[var(--radius-card-lg)] border border-line bg-surface p-6 sm:p-10">
        <div className="flex flex-wrap gap-3">
          {pillars.map((pillar, i) => (
            <button
              key={pillar.id}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              className={
                "font-display rounded-none px-4 py-2 text-[clamp(1.6rem,4vw,2.6rem)] font-light tracking-[-0.03em] transition-colors " +
                (i === active ? "bg-surface-2 text-ink" : "text-faint hover:text-muted")
              }
            >
              {pillar.tab}
            </button>
          ))}
        </div>

        <div key={p.id} className="mt-8 grid items-center gap-8 rise lg:grid-cols-2">
          <div>
            <h3 className="t-heading">{p.heading}</h3>
            <p className="mt-4 max-w-md text-body text-muted">{p.body}</p>
            <Link href={p.href} className="nav-link mt-6 inline-flex items-center gap-1.5 text-[15px]">
              {p.cta} <ArrowRight size={15} />
            </Link>
          </div>
          <div className="on-light flex min-h-[300px] items-center justify-center rounded-none p-8" style={{ background: PANEL_BG[p.panel] }}>
            {p.panel === "rat" && <MiniRat />}
            {p.panel === "dpa" && <MiniDpa />}
            {p.panel === "subprocessadores" && <MiniSubprocessadores />}
          </div>
        </div>
      </div>
    </section>
  );
}
