"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/** Com ?imprimir=1 na URL, abre a janela de impressão (salvar em PDF) assim que o relatório aparece. */
export function ImprimirAoAbrir() {
  const params = useSearchParams();
  const imprimir = params.get("imprimir") === "1";
  useEffect(() => {
    if (!imprimir) return;
    const t = setTimeout(() => window.print(), 700);
    return () => clearTimeout(t);
  }, [imprimir]);
  return null;
}
