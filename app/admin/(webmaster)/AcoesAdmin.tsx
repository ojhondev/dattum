"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, RefreshCw } from "lucide-react";

/** Dispara a vigilância agora: tudo, uma agência ou uma conta. */
export function RodarVarredura({
  agenciaId,
  contaId,
  rotulo = "Rodar varredura agora",
  className = "btn btn-primary",
}: {
  agenciaId?: string;
  contaId?: string;
  rotulo?: string;
  className?: string;
}) {
  const router = useRouter();
  const [rodando, setRodando] = useState(false);
  const [msg, setMsg] = useState("");

  const rodar = async () => {
    setRodando(true);
    setMsg("");
    const res = await fetch("/api/admin/vigilancia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agenciaId, contaId }),
    });
    const data = await res.json().catch(() => ({ ok: false }));
    setRodando(false);
    if (!data.ok) return setMsg(data.error ?? "Falhou.");
    const v = data.varredura;
    setMsg(`${v.alvos} alvo(s) · ${v.criticos} crítico(s) · ${v.altos} alto(s)`);
    router.refresh();
  };

  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      <button type="button" onClick={rodar} disabled={rodando} className={className}>
        <RefreshCw size={15} className={rodando ? "animate-spin" : ""} />
        {rodando ? "Varrendo..." : rotulo}
      </button>
      {msg && <span className="text-body-sm text-muted">{msg}</span>}
    </span>
  );
}

/** Exporta linhas já carregadas na página como CSV (separador ;, abre direto no Excel em pt-BR). */
export function ExportarCsv({ nome, linhas }: { nome: string; linhas: (string | number | null)[][] }) {
  const baixar = () => {
    const csv = linhas
      .map((l) => l.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";"))
      .join("\r\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = nome;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button type="button" onClick={baixar} className="btn btn-ghost">
      <Download size={15} /> Exportar CSV
    </button>
  );
}
