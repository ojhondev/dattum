"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/marketing/AuthShell";
import { BotaoGoogle, mensagemErroGoogle } from "@/components/marketing/BotaoGoogle";
import { CampoSenha } from "@/components/marketing/CampoSenha";
import { digitosCelular, mascaraCelular, problemaNoCelular } from "@/lib/telefone";

function CadastroForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [codigo, setCodigo] = useState(params.get("codigo") ?? "");
  const [comCodigo, setComCodigo] = useState(!!params.get("codigo"));
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(() => mensagemErroGoogle(params.get("erro")) ?? "");
  const [enviando, setEnviando] = useState(false);
  const [aceite, setAceite] = useState(false);

  const codigoValido = comCodigo && codigo.trim().length >= 6;
  const problemaWhatsapp = problemaNoCelular(whatsapp);
  const whatsappValido = !problemaWhatsapp;
  // Só reclama do número depois que ele foi digitado inteiro (11 dígitos) ou quando a pessoa sai do campo.
  const [saiuWhatsapp, setSaiuWhatsapp] = useState(false);
  const mostrarErroWhatsapp = !!whatsapp && !!problemaWhatsapp && (saiuWhatsapp || digitosCelular(whatsapp).length === 11);
  const pendenteGoogle = !nome.trim()
    ? "Preencha o nome da agência para continuar com o Google."
    : !whatsappValido && !codigoValido
      ? (problemaWhatsapp ?? "Preencha o WhatsApp com DDD para continuar com o Google.")
      : !aceite
        ? "Marque o aceite acima para continuar com o Google."
        : null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    try {
      const res = await fetch("/api/auth/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, whatsapp, email, senha, codigo: comCodigo ? codigo : "", aceite }),
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
      <h1 className="t-display">Criar conta</h1>
      <p className="mt-3 text-body-sm text-muted">
        Crie o acesso da sua agência e conheça a plataforma com os seus clientes. Contratos, documentos, selo e
        certificado são liberados quando o plano for ativado.
      </p>

      <form className="font-ui mt-8 space-y-4" onSubmit={submit}>
        <label className="block">
          <span className="text-body-sm font-medium text-body">Nome da agência</span>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required autoComplete="organization" className="field-input mt-1.5" />
        </label>
        <label className="block">
          <span className="text-body-sm font-medium text-body">WhatsApp com DDD</span>
          <input
            type="tel"
            inputMode="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(mascaraCelular(e.target.value))}
            onBlur={() => setSaiuWhatsapp(true)}
            aria-invalid={mostrarErroWhatsapp}
            required={!codigoValido}
            placeholder="(11) 99999-9999"
            autoComplete="tel"
            className="field-input mt-1.5"
          />
          {mostrarErroWhatsapp ? (
            <span className="mt-1 block text-caption text-danger">{problemaWhatsapp}</span>
          ) : (
            <span className="mt-1 block text-caption text-faint">É por aqui que a Dattis fala com você para ativar o plano.</span>
          )}
        </label>

        {comCodigo ? (
          <label className="block">
            <span className="text-body-sm font-medium text-body">Código de ativação</span>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="ATV-XXXX-XXXX"
              className="field-input mt-1.5 font-mono uppercase"
            />
            <span className="mt-1 block text-caption text-faint">Com o código, a conta já nasce com o plano contratado.</span>
          </label>
        ) : (
          <button type="button" className="nav-link text-body-sm" onClick={() => setComCodigo(true)}>
            Já pagou e recebeu um código de ativação?
          </button>
        )}

        <label className="flex items-start gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5 text-body-sm leading-snug text-body">
          <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} required className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-brand-strong)]" />
          <span>
            Li e aceito os{" "}
            <a href="/termos" target="_blank" className="nav-link">Termos de Uso</a>, a{" "}
            <a href="/privacidade" target="_blank" className="nav-link">Política de Privacidade</a> e o{" "}
            <a href="/contrato-de-dados" target="_blank" className="nav-link">Contrato de dados</a> da Dattis.
          </span>
        </label>
        <div className="pt-1">
          <BotaoGoogle
            codigo={codigoValido ? codigo : undefined}
            cadastro={{ nome, whatsapp: digitosCelular(whatsapp) }}
            desabilitado={!!pendenteGoogle}
            rotulo="Criar conta com Google"
          />
          <p className="mt-2 text-caption text-faint">{pendenteGoogle ?? "Usa o e-mail da sua conta Google para entrar."}</p>
        </div>
        <div className="flex items-center gap-3 font-mono text-caption uppercase text-faint">
          <span className="h-px flex-1 bg-line" />
          ou com e-mail e senha
          <span className="h-px flex-1 bg-line" />
        </div>
        <label className="block">
          <span className="text-body-sm font-medium text-body">E-mail</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="field-input mt-1.5" />
        </label>
        <label className="block">
          <span className="text-body-sm font-medium text-body">Senha (mínimo 8 caracteres)</span>
          <CampoSenha
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            minLength={8}
            required
            autoComplete="new-password"
            className="field-input mt-1.5"
          />
        </label>
        {erro && <div className="rounded-xl bg-danger-tint px-4 py-3 text-body-sm text-danger">{erro}</div>}
        <button type="submit" disabled={enviando} className="btn btn-dark btn-lg w-full">
          {enviando ? "Criando..." : "Criar conta"}
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

export default function CadastroPage() {
  return (
    <Suspense fallback={null}>
      <CadastroForm />
    </Suspense>
  );
}
