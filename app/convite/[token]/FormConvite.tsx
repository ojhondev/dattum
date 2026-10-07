"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CampoSenha } from "@/components/marketing/CampoSenha";

export function FormConvite({ token, nomeInicial }: { token: string; nomeInicial: string }) {
  const router = useRouter();
  const [nome, setNome] = useState(nomeInicial);
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [aceite, setAceite] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (senha.length < 8) return setErro("A senha precisa ter pelo menos 8 caracteres.");
    if (senha !== confirma) return setErro("As duas senhas não são iguais.");
    setEnviando(true);
    setErro("");
    const r = await fetch("/api/convite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, nome, senha, aceite }) })
      .then((x) => x.json())
      .catch(() => ({ ok: false, error: "Sem conexão. Tente de novo." }));
    if (!r.ok) {
      setEnviando(false);
      return setErro(r.error ?? "Não foi possível entrar.");
    }
    router.push("/painel");
    router.refresh();
  };

  return (
    <form className="font-ui mt-8 space-y-4" onSubmit={enviar}>
      <label className="block">
        <span className="text-body-sm font-medium text-body">Seu nome</span>
        <input id="conv-nome" value={nome} onChange={(e) => setNome(e.target.value)} required autoComplete="name" className="field-input mt-1.5" />
      </label>
      <label className="block">
        <span className="text-body-sm font-medium text-body">Senha (mínimo 8 caracteres)</span>
        <CampoSenha id="conv-senha" value={senha} onChange={(e) => setSenha(e.target.value)} minLength={8} required autoComplete="new-password" className="field-input mt-1.5" />
      </label>
      <label className="block">
        <span className="text-body-sm font-medium text-body">Repita a senha</span>
        <CampoSenha id="conv-confirma" value={confirma} onChange={(e) => setConfirma(e.target.value)} minLength={8} required autoComplete="new-password" className="field-input mt-1.5" />
      </label>
      <label className="flex items-start gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5 text-body-sm leading-snug text-body">
        <input id="conv-aceite" type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} required className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Li os{" "}
          <a href="/termos" target="_blank" className="nav-link">
            Termos de Uso
          </a>{" "}
          e a{" "}
          <a href="/privacidade" target="_blank" className="nav-link">
            Política de Privacidade
          </a>{" "}
          da Dattis.
        </span>
      </label>
      {erro && <div className="rounded-xl bg-danger-tint px-4 py-3 text-body-sm text-danger">{erro}</div>}
      <button type="submit" disabled={enviando} className="btn btn-dark btn-lg w-full">
        {enviando ? "Entrando..." : "Criar senha e entrar"}
      </button>
    </form>
  );
}
