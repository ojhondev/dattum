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
      className="font-ui flex w-full items-center gap-2.5 rounded-none px-2.5 py-2 text-body-sm text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
      onClick={sair}
      type="button"
    >
      Sair
    </button>
  );
}
