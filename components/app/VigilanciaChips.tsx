import { SEVERIDADE, faixaDaNota, type Severidade } from "@/lib/vigilancia-tipos";

/** Nota da vigilância (0–100) com a faixa: Protegido / Atenção / Exposto / Crítico. */
export function NotaVigilancia({ nota, compacto = false }: { nota: number | null | undefined; compacto?: boolean }) {
  if (nota == null) return <span className="pill pill-neutral">Aguardando</span>;
  const f = faixaDaNota(nota);
  return (
    <span className={"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[12px] uppercase tracking-[0.03em] " + SEVERIDADE[f.severidade].classe}>
      <span className="tabular-nums">{nota}</span>
      {!compacto && <span>· {f.label}</span>}
    </span>
  );
}

export function SeveridadeChip({ severidade, children }: { severidade: Severidade; children?: React.ReactNode }) {
  return (
    <span className={"inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.04em] " + SEVERIDADE[severidade].classe}>
      <span className={"h-1.5 w-1.5 rounded-full " + SEVERIDADE[severidade].ponto} />
      {children ?? SEVERIDADE[severidade].label}
    </span>
  );
}

export function ContagemSeveridades({ criticos, altos, medios }: { criticos: number; altos: number; medios: number }) {
  if (criticos + altos + medios === 0) return <SeveridadeChip severidade="ok">Sem alertas</SeveridadeChip>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {criticos > 0 && <SeveridadeChip severidade="critico">{criticos} crítico{criticos > 1 ? "s" : ""}</SeveridadeChip>}
      {altos > 0 && <SeveridadeChip severidade="alto">{altos} alto{altos > 1 ? "s" : ""}</SeveridadeChip>}
      {medios > 0 && <SeveridadeChip severidade="medio">{medios} médio{medios > 1 ? "s" : ""}</SeveridadeChip>}
    </span>
  );
}
