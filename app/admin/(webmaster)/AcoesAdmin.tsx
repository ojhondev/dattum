"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, RefreshCw } from "lucide-react";
import { linkWhatsappPara } from "@/lib/contato";

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

/** Gera um link de redefinição de senha (vale 3 dias) e oferece copiar ou mandar pelo WhatsApp da agência. */
export function LinkSenha({ agenciaId, agenciaNome, contato }: { agenciaId: string; agenciaNome: string; contato: string | null }) {
  const [url, setUrl] = useState<string | null>(null);
  const [estado, setEstado] = useState("");

  const gerar = async () => {
    if (!confirm(`Gerar um link de redefinição de senha para ${agenciaNome}? Ele vale por 3 dias e só pode ser usado uma vez.`)) return;
    setEstado("gerando");
    const r = await fetch(`/api/admin/agencias/${agenciaId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "link-senha" }),
    })
      .then((x) => x.json())
      .catch(() => ({ ok: false }));
    setEstado(r.ok ? "" : "erro");
    if (r.ok) setUrl(r.url);
  };

  if (!url) {
    return (
      <button type="button" onClick={gerar} disabled={estado === "gerando"} className="btn btn-ghost">
        {estado === "gerando" ? "Gerando..." : estado === "erro" ? "Tentar de novo" : "Link de senha"}
      </button>
    );
  }
  const msg = `Olá! Aqui é da Dattis. Segue o link para criar uma nova senha de acesso da ${agenciaNome} (vale por 3 dias): ${url}`;
  const wa = linkWhatsappPara(contato, msg) ?? `https://wa.me/?text=${encodeURIComponent(msg)}`;
  return (
    <span className="flex flex-col gap-1.5">
      <button type="button" className="btn btn-ghost" onClick={() => navigator.clipboard.writeText(url).then(() => setEstado("copiado"))}>
        {estado === "copiado" ? "Copiado" : "Copiar link"}
      </button>
      <a href={wa} target="_blank" rel="noopener" className="btn btn-primary">
        Enviar no WhatsApp
      </a>
    </span>
  );
}

/** Plano, clientes contratados e suspensão de uma agência (ex.: inadimplência). */
export function GerenciarAgencia({
  agenciaId,
  agenciaNome,
  plano,
  clientes,
  suspensa,
  servicoDpo,
}: {
  agenciaId: string;
  agenciaNome: string;
  plano: string;
  clientes: number | null;
  suspensa: boolean;
  servicoDpo: boolean;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [p, setP] = useState(plano);
  const [n, setN] = useState(String(clientes ?? 1));
  const [estado, setEstado] = useState("");

  const enviar = async (corpo: Record<string, unknown>) => {
    setEstado("salvando");
    const r = await fetch(`/api/admin/agencias/${agenciaId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) })
      .then((x) => x.json())
      .catch(() => ({ ok: false }));
    setEstado(r.ok ? "" : (r.error ?? "Erro"));
    if (r.ok) {
      setAberto(false);
      router.refresh();
    }
  };

  const alternarSuspensao = () => {
    const texto = suspensa
      ? `Reativar ${agenciaNome}? O painel volta a funcionar na hora.`
      : `Suspender ${agenciaNome}? A agência perde o acesso ao painel e os certificados aparecem como suspensos. Os dados ficam preservados.`;
    if (confirm(texto)) enviar({ acao: suspensa ? "reativar" : "suspender" });
  };

  if (!aberto) {
    return (
      <button type="button" className="btn btn-ghost" onClick={() => setAberto(true)}>
        Plano e acesso
      </button>
    );
  }
  return (
    <span className="flex min-w-[190px] flex-col gap-2 rounded-xl border border-line bg-surface p-3">
      <select aria-label="Plano" value={p} onChange={(e) => setP(e.target.value)} className="field-input !py-2">
        <option value="start">Start</option>
        <option value="growth">Growth</option>
        <option value="scale">Scale</option>
      </select>
      <input aria-label="Clientes contratados" type="number" min={1} max={1000} value={n} onChange={(e) => setN(e.target.value)} className="field-input !py-2" />
      <button type="button" className="btn btn-primary" disabled={estado === "salvando"} onClick={() => enviar({ acao: "plano", plano: p, clientes: Number(n) })}>
        Salvar plano
      </button>
      {plano !== "start" ? (
        <span className="text-[12.5px] text-muted">Dattis como DPO: incluso no plano</span>
      ) : (
        <label className="flex items-center gap-2 text-[13px] text-body">
          <input
            type="checkbox"
            checked={servicoDpo}
            disabled={estado === "salvando"}
            onChange={(e) => enviar({ acao: "servico-dpo", ativo: e.target.checked })}
            className="h-4 w-4 accent-[var(--color-brand-strong)]"
          />
          Serviço de DPO (adicional)
        </label>
      )}
      <button type="button" className={"btn " + (suspensa ? "btn-primary" : "btn-ghost text-danger")} disabled={estado === "salvando"} onClick={alternarSuspensao}>
        {suspensa ? "Reativar acesso" : "Suspender acesso"}
      </button>
      <button type="button" className="text-[13px] text-muted underline" onClick={() => setAberto(false)}>
        Fechar
      </button>
      {estado && estado !== "salvando" && <span className="text-[12px] text-danger">{estado}</span>}
    </span>
  );
}
