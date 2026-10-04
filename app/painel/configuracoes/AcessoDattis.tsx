"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

/** Liga/desliga a autorização para o DPO da Dattis operar a conta. */
export function AcessoDattis({ ativo, podeMudar }: { ativo: boolean; podeMudar: boolean }) {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const mudar = async (novo: boolean) => {
    if (!novo && !confirm("Retirar o acesso? O DPO da Dattis sai da conta na hora e deixa de prestar o serviço até você autorizar de novo.")) return;
    setSalvando(true);
    setErro("");
    const r = await fetch("/api/agencia/acesso", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ativo: novo }) })
      .then((x) => x.json())
      .catch(() => ({ ok: false, error: "Sem conexão. Tente de novo." }));
    setSalvando(false);
    if (!r.ok) return setErro(r.error ?? "Não foi possível salvar.");
    router.refresh();
  };

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className={"flex items-center gap-3 rounded-2xl px-4 py-3 text-[14.5px] " + (ativo ? "bg-ok-tint text-brand-ink" : "bg-surface-2 text-body")}>
        <ShieldCheck size={18} className="shrink-0" />
        {ativo ? "Acesso autorizado: o DPO da Dattis pode operar a conta." : "Acesso desligado: a Dattis não entra na sua conta."}
      </div>
      {podeMudar && (
        <button type="button" className={"barra-btn self-start " + (ativo ? "" : "primario")} disabled={salvando} onClick={() => mudar(!ativo)}>
          {salvando ? "Salvando..." : ativo ? "Retirar o acesso" : "Autorizar o DPO da Dattis a operar a conta"}
        </button>
      )}
      {erro && <p className="painel-error">{erro}</p>}
    </div>
  );
}
