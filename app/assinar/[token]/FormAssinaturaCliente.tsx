"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export function FormAssinaturaCliente({
  token,
  contaNome,
  jaAssinou,
  nomeSugerido,
  emailSugerido,
}: {
  token: string;
  contaNome: string;
  jaAssinou: { nome: string; em: string } | null;
  nomeSugerido: string;
  emailSugerido: string;
}) {
  const router = useRouter();
  const [nome, setNome] = useState(nomeSugerido);
  const [cargo, setCargo] = useState("");
  const [email, setEmail] = useState(emailSugerido);
  const [aceite, setAceite] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  if (jaAssinou) {
    return (
      <div className="flex items-start gap-4 rounded-[24px] bg-forest px-6 py-6 text-white">
        <CheckCircle2 size={26} className="mt-0.5 shrink-0 text-brand" />
        <div>
          <p className="font-display text-[22px] leading-tight">Contrato assinado</p>
          <p className="mt-2 text-[15px] leading-relaxed text-white/80">
            {jaAssinou.nome} assinou em nome de {contaNome} em {jaAssinou.em}. Guarde uma cópia em PDF com as assinaturas e a trilha de
            evidências.
          </p>
          <a href={`/api/assinar/${token}/pdf`} target="_blank" rel="noopener" className="btn btn-primary mt-5">
            Baixar cópia em PDF
          </a>
        </div>
      </div>
    );
  }

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    const r = await fetch(`/api/assinar/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, cargo, email, aceite }),
    })
      .then((x) => x.json())
      .catch(() => ({ ok: false, error: "Sem conexão. Tente de novo." }));
    setEnviando(false);
    if (!r.ok) return setErro(r.error ?? "Não foi possível assinar agora.");
    router.refresh();
  };

  return (
    <form onSubmit={enviar} className="rounded-[24px] border border-line-strong bg-surface px-5 py-6 sm:px-7">
      <h2 className="font-display text-[22px] text-ink">Assinar em nome de {contaNome}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-body-sm font-medium text-body">Nome completo</span>
          <input id="ass-nome" value={nome} onChange={(e) => setNome(e.target.value)} required autoComplete="name" className="field-input mt-1.5" />
        </label>
        <label className="block">
          <span className="text-body-sm font-medium text-body">Cargo</span>
          <input
            id="ass-cargo"
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            required
            placeholder="Ex.: Sócia, Diretor"
            autoComplete="organization-title"
            className="field-input mt-1.5"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-body-sm font-medium text-body">E-mail</span>
          <input id="ass-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="field-input mt-1.5" />
        </label>
      </div>
      <label className="mt-5 flex items-start gap-3 text-[15px] leading-snug text-body">
        <input
          id="ass-aceite"
          type="checkbox"
          checked={aceite}
          onChange={(e) => setAceite(e.target.checked)}
          required
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-brand-strong)]"
        />
        <span>Li o contrato acima, concordo com os termos e declaro ter poderes para assinar em nome de {contaNome}.</span>
      </label>
      {erro && <p className="mt-4 rounded-xl bg-danger-tint px-4 py-3 text-body-sm text-danger">{erro}</p>}
      <button type="submit" disabled={enviando} className="btn btn-dark btn-lg mt-6 w-full sm:w-auto">
        {enviando ? "Assinando..." : "Assinar contrato"}
      </button>
    </form>
  );
}
