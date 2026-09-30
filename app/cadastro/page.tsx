"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/marketing/AuthShell";
import { PLANOS, type PlanoId } from "@/lib/planos";
import { linkAssinar } from "@/lib/contato";

function CadastroForm() {
  const router = useRouter();
  const params = useSearchParams();
  const inicial = PLANOS.find((p) => p.id === params.get("plano"))?.id ?? "growth";
  const [plano, setPlano] = useState<PlanoId>(inicial);
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
        body: JSON.stringify({ nome, email, senha, plano, codigo }),
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
        Recebeu o código de ativação depois do pagamento? Crie aqui o acesso da sua agência.
      </p>

      <form className="font-ui mt-8 space-y-4" onSubmit={submit}>
        <label className="block">
          <span className="text-body-sm font-medium text-body">Código de ativação</span>
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            required
            placeholder="DATTIS-XXXX-XXXX"
            className="field-input mt-1.5 font-mono uppercase"
          />
        </label>
        <fieldset>
          <legend className="text-body-sm font-medium text-body">Plano</legend>
          <div className="mt-1.5 grid gap-2">
            {PLANOS.map((p) => (
              <label
                key={p.id}
                className={
                  "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors " +
                  (plano === p.id ? "border-brand-strong bg-brand-tint" : "border-line-strong bg-surface hover:border-faint")
                }
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="plano"
                    value={p.id}
                    checked={plano === p.id}
                    onChange={() => setPlano(p.id)}
                    className="accent-[var(--color-brand-strong)]"
                  />
                  <span className="font-mono text-[14px] uppercase tracking-[0.03em]">{p.nome}</span>
                </span>
                <span className="text-[14px] text-body">
                  <span className="font-display text-[18px] text-ink">R$ {p.preco}</span> /usuário/mês
                </span>
              </label>
            ))}
          </div>
        </fieldset>
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
