"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../auth.css";

export default function CadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    try {
      const res = await fetch("/api/auth/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });
      const data = await res.json();
      if (!data.ok) {
        setErro(data.error ?? "Não foi possível criar a conta.");
        setEnviando(false);
        return;
      }
      router.push("/painel");
      router.refresh();
    } catch {
      setErro("Não foi possível criar a conta agora. Tenta de novo.");
      setEnviando(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-eyebrow">Dattis</p>
        <h1 className="auth-title">Criar conta grátis</h1>
        <p className="auth-sub">Ative sua agência e comece a documentar as suas contas de cliente.</p>
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-field">
            <label htmlFor="nome">Nome da agência</label>
            <input id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div className="auth-field">
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="auth-field">
            <label htmlFor="senha">Senha (mínimo 8 caracteres)</label>
            <input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} minLength={8} required />
          </div>
          {erro && <div className="auth-error">{erro}</div>}
          <button className="auth-submit" type="submit" disabled={enviando}>
            {enviando ? "Criando..." : "Criar conta →"}
          </button>
        </form>
        <p className="auth-switch">
          Já tem conta? <Link href="/entrar">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
