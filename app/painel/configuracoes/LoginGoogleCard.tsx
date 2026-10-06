"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mensagemErroGoogle } from "@/components/marketing/BotaoGoogle";

/** Conectar e desconectar o login com Google da agência (só o dono). */
export function LoginGoogleCard({
  conectado,
  senhaDefinida,
  podeGerenciar,
  retorno,
}: {
  conectado: boolean;
  senhaDefinida: boolean;
  podeGerenciar: boolean;
  /** ?google= da volta do Google: "conectado" ou um código de erro */
  retorno: string | null;
}) {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);
  const [erro, setErro] = useState("");

  const desconectar = async () => {
    if (!confirm("Desconectar o Google? Depois disso, a agência entra só com e-mail e senha.")) return;
    setSaindo(true);
    setErro("");
    const r = await fetch("/api/agencia/google", { method: "DELETE" })
      .then((x) => x.json())
      .catch(() => ({ ok: false }));
    setSaindo(false);
    if (!r.ok) return setErro(r.error ?? "Não foi possível desconectar agora.");
    router.replace("/painel/configuracoes");
    router.refresh();
  };

  const aviso = retorno === "conectado" ? null : mensagemErroGoogle(retorno);

  return (
    <section className="bloco p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[12px] uppercase tracking-[0.04em] text-muted">Login com Google</p>
        <span className={`painel-pill ${conectado ? "ok" : "pendente"}`}>{conectado ? "Conectado" : "Não conectado"}</span>
      </div>
      <p className="mt-2 text-[14.5px] leading-relaxed text-body">
        {conectado
          ? "A agência pode entrar com o botão “Continuar com Google”, além do e-mail e senha."
          : "Conecte uma conta Google para entrar com um clique, sem digitar senha. Pode ser uma conta com outro e-mail."}
      </p>

      {retorno === "conectado" && <p className="mt-3 rounded-xl bg-brand-tint px-3 py-2 text-[14px] text-brand-ink">Pronto: o login com Google está conectado.</p>}
      {aviso && <p className="mt-3 rounded-xl bg-warn-tint px-3 py-2 text-[14px] text-warn">{aviso}</p>}
      {erro && <div className="painel-error mt-3">{erro}</div>}

      {podeGerenciar && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {conectado ? (
            <>
              <button type="button" className="painel-btn ghost" onClick={desconectar} disabled={saindo || !senhaDefinida}>
                {saindo ? "Desconectando..." : "Desconectar o Google"}
              </button>
              {!senhaDefinida && <span className="text-[13px] text-muted">Crie uma senha ao lado antes de desconectar.</span>}
            </>
          ) : (
            // Link comum (não <Link>): é uma rota de API que redireciona para o Google, não pode ser pré-carregada.
            <a href="/api/auth/google?vincular=1" className="painel-btn">
              Conectar conta Google
            </a>
          )}
        </div>
      )}
    </section>
  );
}
