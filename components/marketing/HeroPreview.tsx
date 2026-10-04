/**
 * Eco estático do painel Dattis — não é screenshot, é o próprio sistema
 * visual montado em pequena escala. Decorativo.
 */
const RAIL_ITEMS = [true, false, false, false];
const STEPS = ["Conta", "RAT", "DPA", "Subprocessadores"];
const BARS = [
  { l: "RAT em dia", v: 92, c: "#45d190" },
  { l: "DPA assinado", v: 78, c: "#45d190" },
  { l: "Subprocessadores", v: 64, c: "#45d190" },
  { l: "Canal do titular", v: 41, c: "#f38536" },
];

export function HeroPreview() {
  return (
    <div aria-hidden="true" className="pointer-events-none select-none rounded-[28px] bg-white/60 p-2.5 shadow-[0_20px_60px_rgba(0,40,32,0.15)] sm:p-3">
      <div className="flex overflow-hidden rounded-[20px] bg-white text-[#0a120f]">
        <div className="hidden w-12 shrink-0 flex-col items-center gap-3 bg-[#002820] py-4 sm:flex">
          <div className="h-4 w-4 rounded-md bg-[#6ceead]" />
          {RAIL_ITEMS.map((active, i) => (
            <div key={i} className={"h-4 w-4 rounded-full " + (active ? "bg-white/90" : "bg-white/20")} />
          ))}
        </div>

        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="flex items-center justify-between border-b border-[#e3e3e1] pb-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.05em] text-[#59645f]">Painel · Loja Aurora</p>
              <p className="font-display text-[16px] leading-tight">Conta em dia</p>
            </div>
            <span className="rounded-full bg-[#cff5e1] px-2.5 py-1 text-[10px] font-semibold text-[#05563a]">Relatório pronto</span>
          </div>

          <div className="mt-4 flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-1.5">
                <span
                  className={
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[9px] font-bold " +
                    (i < 3 ? "bg-[#45d190] text-[#002820]" : "border border-[#d0d3cf] text-[#8b948f]")
                  }
                >
                  {i < 3 ? "✓" : i + 1}
                </span>
                <span className="hidden text-[9px] text-[#59645f] xl:block">{s}</span>
                {i < STEPS.length - 1 && <span className={"h-px flex-1 " + (i < 2 ? "bg-[#45d190]" : "bg-[#e3e3e1]")} />}
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {[
              { l: "Contas", v: "24" },
              { l: "DPAs pendentes", v: "4" },
              { l: "Subproc.", v: "11" },
            ].map((k) => (
              <div key={k.l} className="rounded-2xl bg-[#f4f4f2] p-3">
                <p className="font-mono text-[8.5px] uppercase tracking-[0.04em] text-[#59645f]">{k.l}</p>
                <p className="font-display mt-1 text-[24px] leading-none">{k.v}</p>
              </div>
            ))}
          </div>

          <div className="mt-2.5 space-y-2 rounded-2xl bg-[#f4f4f2] p-3">
            {BARS.map((b, i) => (
              <div key={b.l} className="flex items-center gap-2">
                <span className="w-24 shrink-0 text-[9.5px] text-[#59645f]">{b.l}</span>
                <span className="h-1.5 flex-1 rounded-full bg-[#e3e3e1]">
                  <span className="an-carrega block h-full rounded-full" style={{ width: `${b.v}%`, background: b.c, "--d": `${400 + i * 160}ms` } as React.CSSProperties} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
