"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Copy, MessageCircle, UserPlus } from "lucide-react";

export type PessoaEquipe = { id: string; nome: string; email: string; situacao: "ativo" | "convite" | "desativado"; ultimoAcesso: string | null };

const PILULA = { ativo: ["ok", "Ativo"], convite: ["pendente", "Convite pendente"], desativado: ["pendente", "Desativado"] } as const;

function LinkConvite({ url, nome }: { url: string; nome: string }) {
  const [copiado, setCopiado] = useState(false);
  const msg = `Olá, ${nome.split(" ")[0]}! Te convidei para o painel da agência na Dattis. Crie sua senha por este link (vale 7 dias): ${url}`;
  return (
    <div className="mt-3 rounded-xl border border-brand-strong bg-brand-tint p-3">
      <p className="text-[13px] font-medium text-ink">Link de acesso para {nome} (vale 7 dias, uso único)</p>
      <input readOnly value={url} aria-label="Link de convite" className="mt-2 w-full bg-transparent font-mono text-[12px] text-ink outline-none" />
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className="painel-btn ghost" onClick={() => navigator.clipboard.writeText(url).then(() => setCopiado(true))}>
          <Copy size={14} /> {copiado ? "Copiado" : "Copiar link"}
        </button>
        <a href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener" className="painel-btn">
          <MessageCircle size={14} /> Enviar no WhatsApp
        </a>
      </div>
    </div>
  );
}

/** Equipe da agência: convidar pessoas, gerar novo convite, desativar e remover. Só o dono gerencia. */
export function EquipeCard({ pessoas, podeGerenciar, bloqueado }: { pessoas: PessoaEquipe[]; podeGerenciar: boolean; bloqueado: boolean }) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [convite, setConvite] = useState<{ url: string; nome: string; id?: string } | null>(null);

  const convidar = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    const r = await fetch("/api/equipe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome, email }) })
      .then((x) => x.json())
      .catch(() => ({ ok: false }));
    setEnviando(false);
    if (!r.ok) return setErro(r.error ?? "Não foi possível convidar.");
    setConvite({ url: r.url, nome });
    setNome("");
    setEmail("");
    router.refresh();
  };

  const acao = async (p: PessoaEquipe, a: "convite" | "desativar" | "reativar" | "remover") => {
    if (a === "remover" && !confirm(`Remover ${p.nome} da equipe? A pessoa perde o acesso na hora. O que ela fez continua no registro de atividades.`)) return;
    if (a === "desativar" && !confirm(`Desativar o acesso de ${p.nome}? Você pode reativar depois.`)) return;
    const r = await fetch(`/api/equipe/${p.id}`, {
      method: a === "remover" ? "DELETE" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: a === "remover" ? undefined : JSON.stringify({ acao: a }),
    })
      .then((x) => x.json())
      .catch(() => ({ ok: false }));
    if (!r.ok) return setErro(r.error ?? "Não foi possível concluir.");
    if (a === "convite") setConvite({ url: r.url, nome: p.nome, id: p.id });
    router.refresh();
  };

  return (
    <section className="rounded-[20px] border border-line bg-surface p-5 sm:p-6" data-tour="cfg-equipe">
      <h2 className="font-display text-[22px] text-ink">Equipe</h2>
      <p className="mt-1 text-[14px] leading-relaxed text-muted">
        Cada pessoa entra com o próprio e-mail e senha, e tudo o que ela faz fica no registro de atividades. Senha compartilhada é justamente o
        que a LGPD pede para evitar.
      </p>

      <ul className="mt-4 flex flex-col gap-2">
        <li className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-canvas px-4 py-3">
          <span className="text-[14px] text-ink">
            <b className="font-semibold">Dono da conta</b> <span className="text-muted">· login principal da agência</span>
          </span>
          <span className="painel-pill ok">Dono</span>
        </li>
        {pessoas.map((p) => (
          <li key={p.id} className="rounded-xl bg-canvas px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="min-w-0 text-[14px]">
                <b className="font-semibold text-ink">{p.nome}</b> <span className="text-muted">· {p.email}</span>
                {p.ultimoAcesso && <span className="block text-[12.5px] text-muted">Último acesso: {new Date(p.ultimoAcesso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>}
              </span>
              <span className={`painel-pill ${PILULA[p.situacao][0]}`}>{PILULA[p.situacao][1]}</span>
            </div>
            {podeGerenciar && (
              <div className="mt-2 flex flex-wrap gap-3 text-[13px]">
                {p.situacao !== "desativado" && (
                  <button type="button" className="text-ink underline" onClick={() => acao(p, "convite")}>
                    {p.situacao === "convite" ? "Gerar novo link de convite" : "Gerar link para nova senha"}
                  </button>
                )}
                {p.situacao === "desativado" ? (
                  <button type="button" className="text-ink underline" onClick={() => acao(p, "reativar")}>
                    Reativar acesso
                  </button>
                ) : (
                  <button type="button" className="text-muted underline hover:text-ink" onClick={() => acao(p, "desativar")}>
                    Desativar acesso
                  </button>
                )}
                <button type="button" className="text-muted underline hover:text-danger" onClick={() => acao(p, "remover")}>
                  Remover
                </button>
              </div>
            )}
            {convite?.id === p.id && <LinkConvite url={convite.url} nome={convite.nome} />}
          </li>
        ))}
      </ul>

      {podeGerenciar && (
        <form onSubmit={convidar} className="mt-5 border-t border-line pt-5">
          <p className="flex items-center gap-2 text-[15px] font-medium text-ink">
            <UserPlus size={17} /> Convidar pessoa
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input id="eq-nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" required disabled={bloqueado} className="field-input" aria-label="Nome" />
            <input id="eq-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail de trabalho" required disabled={bloqueado} className="field-input" aria-label="E-mail" />
            <button type="submit" className="painel-btn" disabled={enviando || bloqueado}>
              {enviando ? "Gerando..." : "Gerar convite"}
            </button>
          </div>
          <p className="mt-2 text-[12.5px] text-muted">A Dattis gera um link de convite (vale 7 dias) para você mandar por WhatsApp ou e-mail.</p>
          {convite && !convite.id && <LinkConvite url={convite.url} nome={convite.nome} />}
        </form>
      )}
      {erro && <p className="painel-error mt-3">{erro}</p>}
    </section>
  );
}
