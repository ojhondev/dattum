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
      className="flex w-full items-center gap-2.5 rounded-full px-3.5 py-2.5 font-mono text-[13px] uppercase tracking-[0.03em] text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white"
    >
      Sair
    </button>
  );
}
