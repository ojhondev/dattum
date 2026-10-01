"use client";

import { use, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/marketing/AuthShell";

export default function RedefinirSenhaPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (senha.length < 8) return setErro("A senha precisa ter pelo menos 8 caracteres.");
    if (senha !== confirma) return setErro("As duas senhas não são iguais.");
    setEnviando(true);
    setErro("");
    const r = await fetch("/api/auth/redefinir", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, senha }) })
      .then((x) => x.json())
      .catch(() => ({ ok: false, error: "Sem conexão. Tente de novo." }));
    if (!r.ok) {
      setEnviando(false);
      return setErro(r.error ?? "Não foi possível salvar a senha.");
    }
    router.push("/painel");
    router.refresh();
  };

  return (
    <AuthShell panelHeadline="Sua operação de compliance, em um lugar só.">
      <h1 className="t-display">Criar nova senha</h1>
      <p className="mt-3 text-body-sm text-muted">Depois de salvar, você já entra no painel.</p>
      <form className="font-ui mt-8 space-y-4" onSubmit={enviar}>
        <label className="block">
          <span className="text-body-sm font-medium text-body">Nova senha (mínimo 8 caracteres)</span>
          <input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} minLength={8} required autoComplete="new-password" className="field-input mt-1.5" />
        </label>
        <label className="block">
          <span className="text-body-sm font-medium text-body">Repita a nova senha</span>
          <input id="confirma" type="password" value={confirma} onChange={(e) => setConfirma(e.target.value)} minLength={8} required autoComplete="new-password" className="field-input mt-1.5" />
        </label>
        {erro && <div className="rounded-xl bg-danger-tint px-4 py-3 text-body-sm text-danger">{erro}</div>}
        <button type="submit" disabled={enviando} className="btn btn-dark btn-lg w-full">
          {enviando ? "Salvando..." : "Salvar e entrar"}
        </button>
      </form>
      <p className="font-ui mt-8 text-body-sm">
        Link expirado?{" "}
        <Link href="/recuperar-senha" className="nav-link">
          Pedir outro
        </Link>
      </p>
    </AuthShell>
  );
}
