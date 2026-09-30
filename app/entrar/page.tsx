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
      <h1 className="t-display">Entrar</h1>
      <p className="mt-3 text-body-sm text-muted">Acesse o painel da sua agência.</p>

      <form className="font-ui mt-8 space-y-4" onSubmit={submit}>
        <label className="block">
          <span className="text-body-sm font-medium text-body">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="field-input mt-1.5"
          />
        </label>
        <label className="block">
          <span className="text-body-sm font-medium text-body">Senha</span>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="field-input mt-1.5"
          />
        </label>
        {erro && <div className="rounded-xl bg-danger-tint px-4 py-3 text-body-sm text-danger">{erro}</div>}
        <button type="submit" disabled={enviando} className="btn btn-dark btn-lg w-full">
          {enviando ? "Entrando..." : "Entrar →"}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-3 font-mono text-caption uppercase text-faint">
        <span className="h-px flex-1 bg-line" />
        ou
        <span className="h-px flex-1 bg-line" />
      </div>

      <a href="/api/auth/demo" className="btn btn-primary btn-lg mt-6 w-full whitespace-normal text-center leading-snug">
        Testar a plataforma sem senha →
      </a>
      <p className="font-ui mt-2 text-caption text-faint">
        Acesso de demonstração com dados de exemplo, sem precisar criar conta.
      </p>

      <p className="font-ui mt-8 text-body-sm">
        Ainda não é cliente?{" "}
        <Link href="/planos" className="nav-link">
          Ver planos e assinar
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
