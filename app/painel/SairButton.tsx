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
      className="flex w-full items-center gap-2.5 rounded-full px-3.5 py-2.5 font-mono text-[13px] uppercase tracking-[0.03em] text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white"
      onClick={sair}
      type="button"
    >
      Sair
    </button>
  );
}
