"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/marketing/AuthShell";

function EntrarForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    try {
      const res = await fetch("/api/auth/entrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json();
      if (!data.ok) {
        setErro(data.error ?? "Não foi possível entrar.");
        setEnviando(false);
        return;
      }
      router.push(params.get("proximo") || "/painel");
      router.refresh();
    } catch {
      setErro("Não foi possível entrar agora. Tenta de novo.");
      setEnviando(false);
    }
  };

  return (
    <AuthShell panelHeadline="Sua operação de compliance, em um lugar só.">
      <h1 className="t-heading-lg">Entrar</h1>
      <p className="mt-3 text-body-sm text-muted">Acesse o painel da sua agência.</p>

      <form className="font-ui mt-8 space-y-4" onSubmit={submit}>
        <label className="block">
          <span className="text-body-sm text-body">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1.5 w-full rounded-none border border-line-strong bg-surface px-3 py-2.5 text-body-sm text-ink"
          />
        </label>
        <label className="block">
          <span className="text-body-sm text-body">Senha</span>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="mt-1.5 w-full rounded-none border border-line-strong bg-surface px-3 py-2.5 text-body-sm text-ink"
          />
        </label>
        {erro && <div className="border border-danger/30 bg-danger-tint px-3 py-2.5 text-body-sm text-danger">{erro}</div>}
        <button type="submit" disabled={enviando} className="btn btn-primary w-full justify-center py-2.5 text-body-sm">
          {enviando ? "Entrando..." : "Entrar →"}
        </button>
      </form>

      <p className="font-ui mt-8 text-body-sm">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="nav-link">
          Criar conta grátis
        </Link>
      </p>
    </AuthShell>
  );
}

export default function EntrarPage() {
  return (
    <Suspense fallback={null}>
      <EntrarForm />
    </Suspense>
  );
}
