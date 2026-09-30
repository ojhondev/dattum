"use client";

import { useState } from "react";
import { Printer, Copy, Check } from "lucide-react";

export function DossieActions({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      /* clipboard indisponível */
    }
  };

  return (
    <div className="no-print flex flex-wrap gap-3">
      <button type="button" onClick={copiar} className="btn btn-ghost btn-lg">
        {copiado ? <Check size={16} /> : <Copy size={16} />} {copiado ? "Texto copiado" : "Copiar texto"}
      </button>
      <button type="button" onClick={() => window.print()} className="btn btn-dark btn-lg">
        <Printer size={16} /> Salvar em PDF
      </button>
    </div>
  );
}
