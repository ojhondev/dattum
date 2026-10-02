import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { Passo } from "@/lib/primeiros-passos";

/** Card de primeiros passos do painel. Some sozinho quando tudo estiver feito. */
export function PrimeirosPassos({ passos }: { passos: Passo[] }) {
  const feitos = passos.filter((p) => p.feito).length;
  if (!passos.length || feitos === passos.length) return null;
  const proximo = passos.find((p) => !p.feito);

  return (
    <section data-tour="primeiros-passos" className="mb-4 rounded-[24px] border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-medium text-ink">Primeiros passos</h2>
          <p className="text-[13px] text-muted">
            {feitos} de {passos.length} concluídos. Siga na ordem e a agência fica protegida em poucos dias.
          </p>
        </div>
        <div className="h-2 w-full max-w-[220px] overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
          <div className="h-full rounded-full bg-brand-strong" style={{ width: `${(feitos / passos.length) * 100}%` }} />
        </div>
      </div>
      <ol className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {passos.map((p, i) => (
          <li key={p.titulo}>
            <Link
              href={p.href}
              className={
                "flex h-full items-start gap-3 rounded-2xl px-4 py-3 transition-colors " +
                (p.feito ? "bg-canvas text-muted" : p === proximo ? "bg-brand-tint ring-1 ring-brand-strong hover:bg-brand-tint-2" : "bg-canvas hover:bg-surface-2")
              }
            >
              <span
                className={
                  "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[11px] " +
                  (p.feito ? "bg-brand-strong text-rail" : "border border-line-strong text-muted")
                }
              >
                {p.feito ? <Check size={14} strokeWidth={2.5} /> : i + 1}
              </span>
              <span className="min-w-0">
                <span className={"block text-[14px] font-medium " + (p.feito ? "line-through decoration-1" : "text-ink")}>{p.titulo}</span>
                {!p.feito && <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">{p.detalhe}</span>}
              </span>
              {p === proximo && <ArrowRight size={16} className="ml-auto mt-1 shrink-0 text-brand-ink" />}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
