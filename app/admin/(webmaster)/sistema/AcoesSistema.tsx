"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

async function post(body: unknown) {
  return fetch("/api/admin/sistema", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    .then((x) => x.json())
    .catch(() => ({ ok: false }));
}

export function BackupAgora({ ativo }: { ativo: boolean }) {
  const router = useRouter();
  const [estado, setEstado] = useState("");
  return (
    <span className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        className="btn btn-primary"
        disabled={!ativo || estado === "..."}
        onClick={async () => {
          setEstado("...");
          const r = await post({ acao: "backup" });
          setEstado(r.ok ? "Backup feito." : (r.error ?? "Falhou."));
          router.refresh();
        }}
      >
        {estado === "..." ? "Fazendo backup..." : "Fazer backup agora"}
      </button>
      {estado && estado !== "..." && <span className="text-[13px] text-muted">{estado}</span>}
    </span>
  );
}

export function ResolverErro({ assinatura }: { assinatura: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-[13px] text-muted underline hover:text-ink"
      onClick={async () => {
        await post({ acao: "resolver", assinatura });
        router.refresh();
      }}
    >
      Marcar resolvido
    </button>
  );
}
