"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { TIPOS_PEDIDO } from "@/lib/titulares";

/** "Exercer meus direitos": o titular faz o pedido direto pela política, e ele cai no painel da agência. */
export function FormTitular({ slug, titular }: { slug: string; titular: string }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [site, setSite] = useState(""); // campo invisível contra robôs
  const [aceite, setAceite] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [protocolo, setProtocolo] = useState<string | null>(null);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    const r = await fetch("/api/titular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, nome, email, tipo, mensagem, aceite, site }),
    })
      .then((x) => x.json())
      .catch(() => ({ ok: false, error: "Sem conexão. Tente de novo." }));
    setEnviando(false);
    if (!r.ok) return setErro(r.error ?? "Não foi possível enviar agora.");
    setProtocolo(r.protocolo);
  };

  if (protocolo) {
    return (
      <div className="flex items-start gap-4 rounded-[24px] bg-forest px-6 py-6 text-white">
        <CheckCircle2 size={26} className="mt-0.5 shrink-0 text-brand" />
        <div>
          <p className="font-display text-[22px] leading-tight">Pedido recebido</p>
          <p className="mt-2 text-[15px] leading-relaxed text-white/80">
            Seu protocolo é <b className="font-mono text-white">{protocolo}</b>. Guarde este número. A {titular} tem até 15 dias para responder no
            e-mail {email}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="rounded-[24px] border border-line-strong bg-surface px-5 py-6 sm:px-7">
      <h2 id="exercer-meus-direitos" className="font-display text-[24px] text-ink">
        Exercer meus direitos
      </h2>
      <p className="mt-1 text-[14.5px] leading-relaxed text-body">Faça seu pedido aqui. Você recebe um protocolo e a resposta chega no seu e-mail em até 15 dias.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-body-sm font-medium text-body">Nome completo</span>
          <input id="tit-nome" value={nome} onChange={(e) => setNome(e.target.value)} required autoComplete="name" className="field-input mt-1.5" />
        </label>
        <label className="block">
          <span className="text-body-sm font-medium text-body">E-mail para resposta</span>
          <input id="tit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="field-input mt-1.5" />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-body-sm font-medium text-body">O que você quer fazer?</span>
          <select id="tit-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} required className="field-input mt-1.5">
            <option value="" disabled>
              Escolha uma opção
            </option>
            {TIPOS_PEDIDO.map((t) => (
              <option key={t.id} value={t.id}>
                {t.rotulo}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="text-body-sm font-medium text-body">Detalhes (opcional)</span>
          <textarea
            id="tit-msg"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Ex.: o telefone ou e-mail que vocês têm, onde viu o anúncio, o que precisa ser corrigido."
            className="field-input mt-1.5 resize-y"
          />
        </label>
        <input type="text" tabIndex={-1} autoComplete="off" value={site} onChange={(e) => setSite(e.target.value)} className="hidden" aria-hidden="true" />
      </div>
      <label className="mt-4 flex items-start gap-3 text-[14px] leading-snug text-body">
        <input id="tit-aceite" type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} required className="mt-0.5 h-4 w-4 shrink-0" />
        <span>Declaro que sou o titular dos dados (ou seu representante legal) e que as informações acima são verdadeiras.</span>
      </label>
      {erro && <p className="mt-4 rounded-xl bg-danger-tint px-4 py-3 text-body-sm text-danger">{erro}</p>}
      <button type="submit" disabled={enviando} className="btn btn-dark btn-lg mt-5 w-full sm:w-auto">
        {enviando ? "Enviando..." : "Enviar pedido"}
      </button>
    </form>
  );
}
