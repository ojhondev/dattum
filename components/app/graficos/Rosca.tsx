"use client";

import { useState } from "react";

export type FatiaRosca = { rotulo: string; valor: number; cor: string };
export type AbaRosca = { id: string; nome: string; centro: string; fatias: FatiaRosca[] };

const R = 70;
const ESPESSURA = 22;
const C = 2 * Math.PI * R;

/** Rosca com abas (ex.: clientes por situação / alertas por gravidade). Rótulo e valor sempre visíveis na legenda. */
export function Rosca({ abas }: { abas: AbaRosca[] }) {
  const [aba, setAba] = useState(abas[0]?.id);
  const atual = abas.find((a) => a.id === aba) ?? abas[0];
  const total = atual.fatias.reduce((s, f) => s + f.valor, 0);
  const visiveis = atual.fatias.filter((f) => f.valor > 0);
  const vao = visiveis.length > 1 ? 3 : 0; // 2–3px de respiro entre fatias
  let acumulado = 0;

  return (
    <div>
      <div className="flex gap-1 border-b border-line">
        {abas.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setAba(a.id)}
            className={"-mb-px border-b-2 px-3 pb-2.5 text-[13.5px] transition-colors " + (a.id === atual.id ? "border-brand-strong font-medium text-ink" : "border-transparent text-muted hover:text-ink")}
          >
            {a.nome}
          </button>
        ))}
      </div>
      <div className="mt-5 flex justify-center">
        <svg viewBox="0 0 180 180" className="h-[170px] w-[170px]" role="img" aria-label={`${atual.nome}: ${atual.fatias.map((f) => `${f.rotulo} ${f.valor}`).join(", ")}`}>
          <circle cx="90" cy="90" r={R} fill="none" stroke="var(--color-surface-2)" strokeWidth={ESPESSURA} />
          {total > 0 &&
            visiveis.map((f) => {
              const comp = (f.valor / total) * C;
              const el = (
                <circle
                  key={f.rotulo}
                  cx="90"
                  cy="90"
                  r={R}
                  fill="none"
                  stroke={f.cor}
                  strokeWidth={ESPESSURA}
                  strokeDasharray={`${Math.max(0, comp - vao)} ${C}`}
                  strokeDashoffset={-acumulado}
                  transform="rotate(-90 90 90)"
                >
                  <title>{`${f.rotulo}: ${f.valor}`}</title>
                </circle>
              );
              acumulado += comp;
              return el;
            })}
          <text x="90" y="84" textAnchor="middle" fontSize="11" fill="var(--color-muted)" fontFamily="var(--font-mono)">
            {atual.centro.toUpperCase()}
          </text>
          <text x="90" y="110" textAnchor="middle" fontSize="30" fill="var(--color-ink)" fontFamily="var(--font-display)">
            {total}
          </text>
        </svg>
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {atual.fatias.map((f) => (
          <li key={f.rotulo} className="flex items-center gap-2.5 text-[14px]">
            <span className="w-[42px] shrink-0 rounded-md py-0.5 text-center font-mono text-[11px] text-white" style={{ background: f.cor }}>
              {total ? Math.round((f.valor / total) * 100) : 0}%
            </span>
            <span className="flex-1 text-body">{f.rotulo}</span>
            <span className="font-medium tabular-nums text-ink">{f.valor}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
