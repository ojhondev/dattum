"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/marketing/AuthShell";
import { linkAssinar } from "@/lib/contato";

function CadastroForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [codigo, setCodigo] = useState(params.get("codigo") ?? "");
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
        body: JSON.stringify({ nome, email, senha, codigo }),
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
    <AuthShell panelHeadline="Proteja sua agência e seus clientes antes que a multa chegue.">
      <h1 className="t-display">Ativar acesso</h1>
      <p className="mt-3 text-body-sm text-muted">
        Recebeu o código de ativação depois do pagamento? Crie aqui o acesso da sua agência — o plano
        contratado já vem vinculado ao código.
      </p>

      <form className="font-ui mt-8 space-y-4" onSubmit={submit}>
        <label className="block">
          <span className="text-body-sm font-medium text-body">Código de ativação</span>
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            required
            placeholder="ATV-XXXX-XXXX"
            className="field-input mt-1.5 font-mono uppercase"
          />
        </label>
        <label className="block">
          <span className="text-body-sm font-medium text-body">Nome da agência</span>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required className="field-input mt-1.5" />
        </label>
        <label className="block">
          <span className="text-body-sm font-medium text-body">E-mail</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="field-input mt-1.5" />
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
          {enviando ? "Ativando..." : "Ativar acesso"}
        </button>
      </form>

      <p className="font-ui mt-8 text-body-sm">
        Já é cliente?{" "}
        <Link href="/entrar" className="nav-link">
          Entrar
        </Link>
        <span className="text-muted"> · </span>
        <a href={linkAssinar()} target="_blank" rel="noopener" className="nav-link">
          Ainda não tem código? Fale com a Dattis
        </a>
      </p>
    </AuthShell>
  );
}

export default function CadastroPage() {
  return (
    <Suspense fallback={null}>
      <CadastroForm />
    </Suspense>
  );
}
