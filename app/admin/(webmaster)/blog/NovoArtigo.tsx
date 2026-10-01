"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export function NovoArtigo() {
  const router = useRouter();
  const [criando, setCriando] = useState(false);
  return (
    <button
      type="button"
      disabled={criando}
      onClick={async () => {
        setCriando(true);
        const r = await fetch("/api/admin/blog", { method: "POST" }).then((x) => x.json()).catch(() => ({ ok: false }));
        if (r.ok) router.push(`/admin/blog/${r.id}`);
        else setCriando(false);
      }}
      className="btn btn-primary btn-lg"
    >
      <Plus size={16} /> {criando ? "Criando..." : "Novo artigo"}
    </button>
  );
}
