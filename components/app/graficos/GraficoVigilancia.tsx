"use client";

import { useState } from "react";
import type { PontoSerie } from "@/lib/painel-dados";

const ALTURA = 220;
const MARGEM = { topo: 12, base: 26, esq: 34, dir: 8 };

// Teto "redondo" e par, pra a marca do meio também ser inteira.
function escalaMax(v: number) {
  if (v <= 4) return 4;
  if (v <= 10) return Math.ceil(v / 2) * 2;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

// Retângulo com cantos arredondados só na ponta oposta à linha de base.
function barra(x: number, y: number, w: number, h: number, paraCima: boolean) {
  const r = Math.min(4, w / 2, h);
  if (h <= 0) return "";
  if (paraCima) return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
  return `M${x},${y} V${y + h - r} Q${x},${y + h} ${x + r},${y + h} H${x + w - r} Q${x + w},${y + h} ${x + w},${y + h - r} V${y} Z`;
}

/** Barras divergentes por dia: checagens aprovadas pra cima, alertas pra baixo. */
export function GraficoVigilancia({ serie }: { serie: PontoSerie[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const largura = 720;
  const maxCima = escalaMax(Math.max(1, ...serie.map((p) => p.aprovadas)));
  const maxBaixo = escalaMax(Math.max(1, ...serie.map((p) => p.alertas)));
  const util = ALTURA - MARGEM.topo - MARGEM.base;
  const zero = MARGEM.topo + util * (maxCima / (maxCima + maxBaixo));
  const passo = (largura - MARGEM.esq - MARGEM.dir) / serie.length;
  const w = Math.max(3, Math.min(22, passo - 4));
  const yCima = (v: number) => zero - (v / maxCima) * (zero - MARGEM.topo);
  const yBaixo = (v: number) => zero + (v / maxBaixo) * (ALTURA - MARGEM.base - zero);
  const cadaRotulo = Math.ceil(serie.length / 8);
  const ponto = hover != null ? serie[hover] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${largura} ${ALTURA}`} className="block h-auto w-full" role="img" aria-label="Checagens aprovadas e alertas por dia">
        {/* grade e eixo */}
        {[maxCima, maxCima / 2].map((v) => (
          <g key={`c${v}`}>
            <line x1={MARGEM.esq} x2={largura - MARGEM.dir} y1={yCima(v)} y2={yCima(v)} stroke="var(--color-line)" strokeDasharray="3 4" />
            <text x={MARGEM.esq - 8} y={yCima(v) + 4} textAnchor="end" fontSize="11" fill="var(--color-faint)" fontFamily="var(--font-mono)">
              {v}
            </text>
          </g>
        ))}
        <line x1={MARGEM.esq} x2={largura - MARGEM.dir} y1={zero} y2={zero} stroke="var(--color-line-strong)" />
        <text x={MARGEM.esq - 8} y={zero + 4} textAnchor="end" fontSize="11" fill="var(--color-faint)" fontFamily="var(--font-mono)">
          0
        </text>
        <line x1={MARGEM.esq} x2={largura - MARGEM.dir} y1={yBaixo(maxBaixo)} y2={yBaixo(maxBaixo)} stroke="var(--color-line)" strokeDasharray="3 4" />
        <text x={MARGEM.esq - 8} y={yBaixo(maxBaixo) + 4} textAnchor="end" fontSize="11" fill="var(--color-faint)" fontFamily="var(--font-mono)">
          −{maxBaixo}
        </text>

        {serie.map((p, i) => {
          const x = MARGEM.esq + i * passo + (passo - w) / 2;
          const ativo = hover === i;
          const opac = hover == null || ativo ? 1 : 0.45;
          return (
            <g key={p.dia} opacity={opac}>
              {p.aprovadas > 0 && <path d={barra(x, yCima(p.aprovadas), w, zero - 1 - yCima(p.aprovadas), true)} fill="var(--color-grafico-ok)" />}
              {p.alertas > 0 && <path d={barra(x, zero + 1, w, yBaixo(p.alertas) - zero - 1, false)} fill="var(--color-grafico-alerta)" />}
              {p.aprovadas + p.alertas === 0 && <rect x={x} y={zero - 1} width={w} height={2} rx={1} fill="var(--color-line-strong)" />}
              {i % cadaRotulo === 0 && (
                <text x={x + w / 2} y={ALTURA - 6} textAnchor="middle" fontSize="11" fill="var(--color-faint)" fontFamily="var(--font-mono)">
                  {p.rotulo}
                </text>
              )}
              {/* área de toque maior que a barra */}
              <rect
                x={MARGEM.esq + i * passo}
                y={MARGEM.topo}
                width={passo}
                height={util}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                aria-label={`${p.rotulo}: ${p.aprovadas} aprovadas, ${p.alertas} alertas`}
              />
            </g>
          );
        })}
      </svg>
      {ponto && hover != null && (
        <div
          className="pointer-events-none absolute top-2 z-10 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[13px] shadow-[var(--shadow-pop)]"
          style={{ left: `clamp(0px, calc(${((MARGEM.esq + (hover + 0.5) * passo) / largura) * 100}% - 70px), calc(100% - 150px))` }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-muted">{ponto.rotulo}</p>
          <p className="mt-1 flex justify-between gap-6 text-ink">
            <span className="flex items-center gap-1.5">
              <i className="h-2 w-2 rounded-sm bg-grafico-ok" />
              Aprovadas
            </span>
            <b className="tabular-nums">{ponto.aprovadas}</b>
          </p>
          <p className="flex justify-between gap-6 text-ink">
            <span className="flex items-center gap-1.5">
              <i className="h-2 w-2 rounded-sm bg-grafico-alerta" />
              Alertas
            </span>
            <b className="tabular-nums">{ponto.alertas}</b>
          </p>
        </div>
      )}
    </div>
  );
}
