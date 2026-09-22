"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import "../auth.css";

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
    <div className="auth-card">
      <p className="auth-eyebrow">Dattis</p>
      <h1 className="auth-title">Entrar</h1>
      <p className="auth-sub">Acesse o painel da sua agência.</p>
      <form className="auth-form" onSubmit={submit}>
        <div className="auth-field">
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="auth-field">
          <label htmlFor="senha">Senha</label>
          <input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        </div>
        {erro && <div className="auth-error">{erro}</div>}
        <button className="auth-submit" type="submit" disabled={enviando}>
          {enviando ? "Entrando..." : "Entrar →"}
        </button>
      </form>
      <p className="auth-switch">
        Ainda não tem conta? <Link href="/cadastro">Criar conta grátis</Link>
      </p>
    </div>
  );
}

export default function EntrarPage() {
  return (
    <div className="auth-page">
      <Suspense fallback={null}>
        <EntrarForm />
      </Suspense>
    </div>
  );
}
