"use client";

import { useRouter } from "next/navigation";

export default function SairButton() {
  const router = useRouter();

  const sair = async () => {
    await fetch("/api/auth/sair", { method: "POST" });
    router.push("/entrar");
    router.refresh();
  };

  return (
    <button
      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-mono text-[12px] uppercase tracking-[0.04em] text-muted transition-colors hover:bg-canvas hover:text-ink"
      onClick={sair}
      type="button"
    >
      Sair
    </button>
  );
}
