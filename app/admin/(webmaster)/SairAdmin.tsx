"use client";

import { useRouter } from "next/navigation";

export function SairAdmin() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/sair", { method: "POST" });
        router.push("/admin/entrar");
        router.refresh();
      }}
      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-mono text-[12px] uppercase tracking-[0.04em] text-muted transition-colors hover:bg-canvas hover:text-ink"
    >
      Sair
    </button>
  );
}
