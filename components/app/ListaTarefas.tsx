import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Tarefa } from "@/lib/tarefas";

const VISIVEIS = 6;

const MARCA: Record<Tarefa["urgencia"], { rotulo: string; classe: string }> = {
  1: { rotulo: "Hoje", classe: "bg-danger-tint text-danger" },
  2: { rotulo: "Importante", classe: "bg-warn-tint text-warn" },
  3: { rotulo: "Para completar", classe: "bg-surface-2 text-muted" },
};

function Linha({ t }: { t: Tarefa }) {
  const m = MARCA[t.urgencia];
  return (
    <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={"rounded-full px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.04em] " + m.classe}>{m.rotulo}</span>
          {t.cliente && <span className="text-[12.5px] text-muted">{t.cliente}</span>}
        </div>
        <p className="mt-1.5 text-[15.5px] font-medium leading-snug text-ink">{t.titulo}</p>
        <p className="mt-0.5 text-[13.5px] leading-snug text-muted">{t.detalhe}</p>
      </div>
      <Link href={t.acao.href} className={"barra-btn shrink-0 self-start sm:self-auto " + (t.urgencia === 1 ? "primario" : "")}>
        {t.acao.rotulo} <ArrowRight size={14} />
      </Link>
    </li>
  );
}

/** "O que fazer agora": as pendências da carteira, cada uma com o botão que resolve. */
export function ListaTarefas({ tarefas }: { tarefas: Tarefa[] }) {
  if (!tarefas.length) {
    return (
      <section className="bloco flex items-center gap-4 p-6" data-tour="tarefas">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-tint text-brand-ink">
          <CheckCircle2 size={22} />
        </span>
        <div>
          <h2 className="text-[17px] font-medium text-ink">Tudo em dia</h2>
          <p className="mt-0.5 text-[14px] text-muted">Nenhuma pendência na carteira. A Dattis avisa aqui quando algo precisar de você.</p>
        </div>
      </section>
    );
  }
  const hoje = tarefas.filter((t) => t.urgencia === 1).length;
  return (
    <section className="bloco overflow-hidden" data-tour="tarefas">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-5 py-4">
        <h2 className="font-display text-[22px] leading-tight text-ink">O que fazer agora</h2>
        <p className="text-[13.5px] text-muted">
          {tarefas.length} pendência(s){hoje ? ` · ${hoje} para hoje` : ""}
        </p>
      </header>
      <ul className="divide-y divide-line">
        {tarefas.slice(0, VISIVEIS).map((t) => (
          <Linha key={t.id} t={t} />
        ))}
      </ul>
      {tarefas.length > VISIVEIS && (
        <details className="border-t border-line">
          <summary className="cursor-pointer px-5 py-3 text-[14px] text-muted hover:text-ink">Ver mais {tarefas.length - VISIVEIS}</summary>
          <ul className="divide-y divide-line border-t border-line">
            {tarefas.slice(VISIVEIS).map((t) => (
              <Linha key={t.id} t={t} />
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
