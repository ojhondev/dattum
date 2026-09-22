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
    <button className="painel-sair-btn" onClick={sair} type="button">
      Sair
    </button>
  );
}
