"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";

export default function AdminEntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    const res = await fetch("/api/admin/entrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
    const data = await res.json().catch(() => ({ ok: false }));
    if (!data.ok) {
      setErro(data.error ?? "Não foi possível entrar.");
      setEnviando(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="flex min-h-svh flex-col px-6 py-8 sm:px-12">
      <Logo height={26} />
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
        <p className="t-eyebrow">Área Dattis</p>
        <h1 className="t-display mt-3">Login master</h1>
        <p className="mt-3 text-body-sm text-muted">Painel WebMaster e Portal do DPO, com acesso a todas as agências.</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-body-sm font-medium text-body">E-mail</span>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className="field-input mt-1.5"
            />
          </label>
          <label className="block">
            <span className="text-body-sm font-medium text-body">Senha</span>
            <input
              id="admin-senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
              className="field-input mt-1.5"
            />
          </label>
          {erro && <div className="rounded-xl bg-danger-tint px-4 py-3 text-body-sm text-danger">{erro}</div>}
          <button type="submit" disabled={enviando} className="btn btn-dark btn-lg w-full">
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
