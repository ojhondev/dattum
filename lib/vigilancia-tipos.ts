// Tipos e rótulos da Vigilância — sem dependência de Node, pode ser usado em componentes client.

export type Severidade = "critico" | "alto" | "medio" | "ok";

export type Achado = {
  codigo: string;
  grupo: "site" | "documentacao";
  severidade: Severidade;
  titulo: string;
  detalhe: string;
  correcao?: string;
  artigo?: string;
};

export const SEVERIDADE: Record<Severidade, { label: string; classe: string; ponto: string; peso: number }> = {
  critico: { label: "Crítico", classe: "bg-danger-tint text-danger", ponto: "bg-danger", peso: 30 },
  alto: { label: "Alto", classe: "bg-warn-tint text-warn", ponto: "bg-warn", peso: 15 },
  medio: { label: "Médio", classe: "bg-caution-tint text-caution", ponto: "bg-caution", peso: 5 },
  ok: { label: "OK", classe: "bg-brand-tint text-brand-ink", ponto: "bg-brand-strong", peso: 0 },
};

export function notaDosAchados(achados: Achado[]) {
  const desconto = achados.reduce((s, a) => s + SEVERIDADE[a.severidade].peso, 0);
  return Math.max(0, 100 - desconto);
}

export function contarSeveridades(achados: Achado[]) {
  return {
    criticos: achados.filter((a) => a.severidade === "critico").length,
    altos: achados.filter((a) => a.severidade === "alto").length,
    medios: achados.filter((a) => a.severidade === "medio").length,
  };
}

export function faixaDaNota(nota: number): { label: string; severidade: Severidade } {
  if (nota >= 85) return { label: "Protegido", severidade: "ok" };
  if (nota >= 65) return { label: "Atenção", severidade: "medio" };
  if (nota >= 40) return { label: "Exposto", severidade: "alto" };
  return { label: "Crítico", severidade: "critico" };
}

const ORDEM: Severidade[] = ["critico", "alto", "medio", "ok"];
export const ordenarAchados = (achados: Achado[]) =>
  [...achados].sort((a, b) => ORDEM.indexOf(a.severidade) - ORDEM.indexOf(b.severidade));
