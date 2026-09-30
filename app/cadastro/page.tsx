"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/marketing/AuthShell";

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
    <AuthShell panelHeadline="Sua operação de compliance, em um lugar só.">
      <h1 className="t-display">Criar conta grátis</h1>
      <p className="mt-3 text-body-sm text-muted">Ative sua agência e comece a documentar as suas contas de cliente.</p>

      <form className="font-ui mt-8 space-y-4" onSubmit={submit}>
        <label className="block">
          <span className="text-body-sm font-medium text-body">Nome da agência</span>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="field-input mt-1.5"
          />
        </label>
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
          <span className="text-body-sm font-medium text-body">Senha (mínimo 8 caracteres)</span>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            minLength={8}
            required
            className="field-input mt-1.5"
          />
        </label>
        {erro && <div className="rounded-xl bg-danger-tint px-4 py-3 text-body-sm text-danger">{erro}</div>}
        <button type="submit" disabled={enviando} className="btn btn-dark btn-lg w-full">
          {enviando ? "Criando..." : "Criar conta →"}
        </button>
      </form>

      <p className="font-ui mt-8 text-body-sm">
        Já tem conta?{" "}
        <Link href="/entrar" className="nav-link">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
