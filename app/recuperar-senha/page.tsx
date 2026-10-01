"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/marketing/AuthShell";
import { linkContato } from "@/lib/contato";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [modo, setModo] = useState<"" | "email" | "whatsapp">("");
  const [erro, setErro] = useState("");

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    const r = await fetch("/api/auth/recuperar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) })
      .then((x) => x.json())
      .catch(() => ({ ok: false, error: "Sem conexão. Tente de novo." }));
    setEnviando(false);
    if (!r.ok) return setErro(r.error ?? "Não foi possível continuar.");
    setModo(r.modo);
  };

  return (
    <AuthShell panelHeadline="Sua operação de compliance, em um lugar só.">
      <h1 className="t-display">Esqueci minha senha</h1>

      {modo === "email" ? (
        <p className="mt-4 text-body-sm leading-relaxed text-body">
          Se existir uma conta com <b>{email}</b>, enviamos um link para criar uma nova senha. Ele vale por 1 hora. Confira também a caixa
          de spam.
        </p>
      ) : modo === "whatsapp" ? (
        <div className="mt-4">
          <p className="text-body-sm leading-relaxed text-body">
            Fale com a equipe Dattis pelo WhatsApp: conferimos que a conta é sua e mandamos um link para você criar uma nova senha.
          </p>
          <a
            href={linkContato(`Olá! Esqueci a senha do painel da Dattis. Meu e-mail de acesso é ${email}.`)}
            target="_blank"
            rel="noopener"
            className="btn btn-dark btn-lg mt-6 w-full"
          >
            Pedir link pelo WhatsApp
          </a>
        </div>
      ) : (
        <>
          <p className="mt-3 text-body-sm text-muted">Informe o e-mail de acesso da agência.</p>
          <form className="font-ui mt-8 space-y-4" onSubmit={enviar}>
            <label className="block">
              <span className="text-body-sm font-medium text-body">E-mail</span>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="field-input mt-1.5" />
            </label>
            {erro && <div className="rounded-xl bg-danger-tint px-4 py-3 text-body-sm text-danger">{erro}</div>}
            <button type="submit" disabled={enviando} className="btn btn-dark btn-lg w-full">
              {enviando ? "Enviando..." : "Continuar"}
            </button>
          </form>
        </>
      )}

      <p className="font-ui mt-8 text-body-sm">
        Entra com o Google? Use o botão{" "}
        <Link href="/entrar" className="nav-link">
          Continuar com Google
        </Link>
        , que não precisa de senha.
      </p>
    </AuthShell>
  );
}
