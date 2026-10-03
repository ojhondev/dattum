"use client";

import { Printer } from "lucide-react";

export function BotaoImprimir() {
  return (
    <button type="button" className="barra-btn primario" onClick={() => window.print()}>
      <Printer size={15} /> Salvar em PDF
    </button>
  );
}
