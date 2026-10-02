"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileCheck2 } from "lucide-react";

/** Faixa no topo do painel enquanto a agência não aceitou a versão atual dos documentos legais. */
export function AvisoTermos({ versao, atualizacao }: { versao: string; atualizacao: boolean }) {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);

  const aceitar = async () => {
    setSalvando(true);
    const r = await fetch("/api/agencia/termos", { method: "POST" }).catch(() => null);
    setSalvando(false);
    if (r?.ok) router.refresh();
  };

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-[20px] border border-line-strong bg-brand-tint px-5 py-4 sm:flex-row sm:items-center">
      <FileCheck2 size={22} className="hidden shrink-0 text-brand-ink sm:block" />
      <p className="flex-1 text-[14.5px] leading-relaxed text-ink">
        {atualizacao ? "Atualizamos" : "Publicamos"} os{" "}
        <a href="/termos" target="_blank" className="font-medium underline underline-offset-2">Termos de Uso</a>, a{" "}
        <a href="/privacidade" target="_blank" className="font-medium underline underline-offset-2">Política de Privacidade</a> e o{" "}
        <a href="/contrato-de-dados" target="_blank" className="font-medium underline underline-offset-2">Contrato de dados</a> da Dattis
        (versão {versao}). Leia e confirme o aceite para continuar usando a plataforma.
      </p>
      <button type="button" onClick={aceitar} disabled={salvando} className="painel-btn shrink-0 self-start sm:self-auto">
        {salvando ? "Salvando..." : "Li e aceito"}
      </button>
    </div>
  );
}
