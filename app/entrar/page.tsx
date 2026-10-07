"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/marketing/AuthShell";
import { BotaoGoogle, mensagemErroGoogle } from "@/components/marketing/BotaoGoogle";

function EntrarForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  // Google sem conta não é erro de digitação: vira um aviso que leva ao cadastro.
  const semConta = params.get("erro") === "google_sem_conta";
  const [erro, setErro] = useState(() => (semConta ? "" : mensagemErroGoogle(params.get("erro")) ?? ""));
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
      router.push(data.destino || params.get("proximo") || "/painel");
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

      <div className="mt-8">
        <BotaoGoogle proximo={params.get("proximo")} />
      </div>
      {semConta && (
        <div className="font-ui mt-4 rounded-xl border border-line px-4 py-3 text-body-sm">
          <p className="text-body">{mensagemErroGoogle("google_sem_conta")}</p>
          <Link href="/cadastro" className="btn btn-dark mt-3">
            Criar conta da agência →
          </Link>
        </div>
      )}
      <div className="mt-6 flex items-center gap-3 font-mono text-caption uppercase text-faint">
        <span className="h-px flex-1 bg-line" />
        ou com e-mail
        <span className="h-px flex-1 bg-line" />
      </div>

      <form className="font-ui mt-6 space-y-4" onSubmit={submit}>
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
        <p className="text-right text-body-sm">
          <Link href="/recuperar-senha" className="nav-link">
            Esqueci minha senha
          </Link>
        </p>
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
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="nav-link">
          Criar conta da agência
        </Link>
        <span className="text-muted"> · </span>
        <Link href="/planos" className="nav-link">
          Ver planos
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
