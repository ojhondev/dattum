import { ordenarAchados, type Achado } from "@/lib/vigilancia-tipos";
import { SeveridadeChip } from "./VigilanciaChips";

/** Lista de achados da vigilância: alertas primeiro, itens OK resumidos no fim. */
export function ListaAchados({ achados, mostrarOk = true }: { achados: Achado[]; mostrarOk?: boolean }) {
  const ordenados = ordenarAchados(achados);
  const alertas = ordenados.filter((a) => a.severidade !== "ok");
  const oks = ordenados.filter((a) => a.severidade === "ok");

  return (
    <div className="flex flex-col gap-2.5">
      {alertas.length === 0 && (
        <p className="rounded-2xl bg-brand-tint px-4 py-3 text-body-sm text-brand-ink">Nenhum alerta nesta verificação.</p>
      )}
      {alertas.map((a) => (
        <div key={a.codigo + a.titulo} className="rounded-2xl border border-line bg-surface px-4 py-3.5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-medium text-ink">{a.titulo}</p>
            <span className="flex items-center gap-1.5">
              {a.artigo && <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-faint">LGPD {a.artigo}</span>}
              <SeveridadeChip severidade={a.severidade} />
            </span>
          </div>
          <p className="mt-1 text-body-sm leading-relaxed text-body">{a.detalhe}</p>
          {a.correcao && (
            <p className="mt-1.5 text-body-sm leading-relaxed text-muted">
              <b className="font-semibold text-ink">Como corrigir:</b> {a.correcao}
            </p>
          )}
        </div>
      ))}
      {mostrarOk && oks.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {oks.map((a) => (
            <span key={a.codigo + a.titulo} title={a.detalhe}>
              <SeveridadeChip severidade="ok">{a.titulo}</SeveridadeChip>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
