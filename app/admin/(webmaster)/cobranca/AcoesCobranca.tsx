"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { linkWhatsappPara } from "@/lib/contato";

async function post(url: string, body: unknown, method = "POST") {
  return fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    .then((x) => x.json())
    .catch(() => ({ ok: false }));
}

export function GerarCobrancas() {
  const router = useRouter();
  const [estado, setEstado] = useState("");
  return (
    <button
      type="button"
      className="btn btn-primary"
      disabled={estado === "..."}
      onClick={async () => {
        setEstado("...");
        const r = await post("/api/admin/cobrancas", { acao: "gerar" });
        setEstado(r.ok ? `${r.criadas} criada(s)` : "Erro");
        router.refresh();
      }}
    >
      {estado === "..." ? "Gerando..." : estado || "Gerar mensalidades do mês"}
    </button>
  );
}

/** Ações de uma mensalidade: marcar paga, reabrir, avisar no WhatsApp e suspender. */
export function AcoesCobranca({
  cobrancaId,
  status,
  diasAtraso,
  agencia,
  mensagem,
}: {
  cobrancaId: string;
  status: string;
  diasAtraso: number;
  agencia: { id: string; nome: string; whatsapp: string | null; suspensa: boolean };
  mensagem: string;
}) {
  const router = useRouter();
  const [ocupado, setOcupado] = useState(false);
  const acao = async (fn: () => Promise<{ ok: boolean; error?: string }>, confirmacao?: string) => {
    if (confirmacao && !confirm(confirmacao)) return;
    setOcupado(true);
    const r = await fn();
    setOcupado(false);
    if (!r.ok) alert(r.error ?? "Não foi possível concluir.");
    router.refresh();
  };
  const wa = linkWhatsappPara(agencia.whatsapp, mensagem) ?? `https://wa.me/?text=${encodeURIComponent(mensagem)}`;

  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {status !== "paga" ? (
        <button type="button" className="btn btn-primary" disabled={ocupado} onClick={() => acao(() => post(`/api/admin/cobrancas/${cobrancaId}`, { status: "paga" }, "PATCH"))}>
          Marcar paga
        </button>
      ) : (
        <button type="button" className="btn btn-ghost" disabled={ocupado} onClick={() => acao(() => post(`/api/admin/cobrancas/${cobrancaId}`, { status: "aberta" }, "PATCH"), "Reabrir esta mensalidade?")}>
          Reabrir
        </button>
      )}
      {status !== "paga" && (
        <a href={wa} target="_blank" rel="noopener" className="btn btn-ghost">
          <MessageCircle size={14} /> Avisar
        </a>
      )}
      {diasAtraso > 0 && !agencia.suspensa && (
        <button
          type="button"
          className="btn btn-ghost text-danger"
          disabled={ocupado}
          onClick={() =>
            acao(
              () => post(`/api/admin/agencias/${agencia.id}`, { acao: "suspender" }),
              `Suspender ${agencia.nome}? O painel fica bloqueado e os certificados aparecem como suspensos até a regularização.`,
            )
          }
        >
          Suspender
        </button>
      )}
      {agencia.suspensa && (
        <button type="button" className="btn btn-ghost" disabled={ocupado} onClick={() => acao(() => post(`/api/admin/agencias/${agencia.id}`, { acao: "reativar" }))}>
          Reativar
        </button>
      )}
    </span>
  );
}

export function ConfigCobranca({ agenciaId, dia, link }: { agenciaId: string; dia: number; link: string | null }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [d, setD] = useState(String(dia));
  const [l, setL] = useState(link ?? "");
  if (!aberto) {
    return (
      <button type="button" onClick={() => setAberto(true)} className="text-[12.5px] text-muted underline hover:text-ink">
        Dia {dia}
        {link ? " · link salvo" : " · sem link"}
      </button>
    );
  }
  return (
    <span className="flex flex-col gap-1.5">
      <input aria-label="Dia do vencimento" type="number" min={1} max={28} value={d} onChange={(e) => setD(e.target.value)} className="field-input !py-1.5" />
      <input aria-label="Link de pagamento" value={l} onChange={(e) => setL(e.target.value)} placeholder="https://link-de-pagamento" className="field-input !py-1.5" />
      <button
        type="button"
        className="btn btn-primary"
        onClick={async () => {
          const r = await post("/api/admin/cobrancas", { acao: "config", agenciaId, diaVencimento: Number(d), linkPagamento: l });
          if (!r.ok) return alert(r.error ?? "Erro");
          setAberto(false);
          router.refresh();
        }}
      >
        Salvar
      </button>
    </span>
  );
}
