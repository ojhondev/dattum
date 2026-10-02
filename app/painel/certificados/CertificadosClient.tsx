"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, ExternalLink } from "lucide-react";

export function EmitirCertificado({ contas }: { contas: { id: string; nome: string }[] }) {
  const router = useRouter();
  const [contaId, setContaId] = useState("");
  const [dominio, setDominio] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    try {
      const res = await fetch("/api/certificados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contaId: contaId || null, dominio }),
      });
      const data = await res.json();
      if (!data.ok) {
        setErro(data.error ?? "Não foi possível emitir.");
      } else {
        setDominio("");
        router.refresh();
      }
    } catch {
      setErro("Não foi possível emitir agora. Tenta de novo.");
    }
    setEnviando(false);
  };

  return (
    <form onSubmit={submit} className="block-card mt-10 grid gap-5 px-8 py-10 sm:px-10 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
      <label className="block">
        <span className="text-body-sm font-medium text-body">Emitir para</span>
        <select id="cert-conta" value={contaId} onChange={(e) => setContaId(e.target.value)} className="field-input mt-1.5">
          <option value="">Minha agência</option>
          {contas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-body-sm font-medium text-body">Site onde o selo vai aparecer (opcional)</span>
        <input
          id="cert-dominio"
          type="text"
          value={dominio}
          onChange={(e) => setDominio(e.target.value)}
          placeholder="lojaaurora.com.br"
          className="field-input mt-1.5"
        />
      </label>
      <button type="submit" disabled={enviando} className="btn btn-dark btn-lg">
        {enviando ? "Emitindo..." : "Emitir certificado"}
      </button>
      {erro && <p className="rounded-xl bg-warn-tint px-4 py-3 text-body-sm text-warn lg:col-span-3">{erro}</p>}
    </form>
  );
}

type CertView = {
  id: string;
  codigo: string;
  titular: string;
  dominio: string | null;
  tipo: string;
  automatico: boolean;
  validoAte: string;
  revogado: boolean;
  estado: "ok" | "pendente" | "invalido";
};

export function CertificadoCard({ cert, origem }: { cert: CertView; origem: string }) {
  const router = useRouter();
  const [copiado, setCopiado] = useState(false);
  const [tema, setTema] = useState<"claro" | "escuro">("claro");
  const verificar = `${origem}/verificar/${cert.codigo}`;
  const embed = `<a href="${verificar}" target="_blank" rel="noopener"><img src="${origem}/selo/${cert.codigo}?tema=${tema}" alt="Site verificado pela Dattis: privacidade e segurança de dados conforme a LGPD. Clique para conferir." width="380" height="67" style="max-width:100%;height:auto"></a>`;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(embed);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      /* clipboard indisponível */
    }
  };

  const revogar = async () => {
    if (!confirm(`Revogar o certificado ${cert.codigo}? O selo passa a mostrar "Certificado inválido".`)) return;
    await fetch(`/api/certificados/${cert.id}`, { method: "PATCH" });
    router.refresh();
  };

  const pill =
    cert.estado === "ok"
      ? <span className="pill pill-ok">Válido</span>
      : cert.estado === "pendente"
        ? <span className="pill pill-warn">Com pendências</span>
        : <span className="pill pill-danger">{cert.revogado ? "Revogado" : "Expirado"}</span>;

  return (
    <li className="grid min-w-0 grid-cols-1 gap-6 rounded-[20px] border border-line bg-surface p-5 sm:p-6 lg:grid-cols-[1fr_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-[22px]">{cert.titular}</span>
          <span className="pill pill-neutral">{cert.tipo}</span>
          {cert.automatico && <span className="pill pill-brand">Automático</span>}
          {pill}
        </div>
        <p className="mt-1 font-mono text-[13px] text-muted">
          {cert.codigo}
          {cert.dominio ? ` · ${cert.dominio}` : ""} · válido até {cert.validoAte}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <p className="t-eyebrow">Selo para o rodapé do site</p>
          <div className="flex rounded-full border border-line p-0.5" role="radiogroup" aria-label="Versão do selo">
            {(["claro", "escuro"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={tema === t}
                onClick={() => setTema(t)}
                className={"rounded-full px-3 py-1 text-[13px] " + (tema === t ? "bg-rail text-white" : "text-body hover:text-ink")}
              >
                {t === "claro" ? "Fundo claro" : "Fundo escuro"}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 rounded-2xl bg-[#f4f4f2] p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/selo/${cert.codigo}?tema=${tema}`} alt={`Selo ${cert.codigo}`} width={380} height={67} className="h-auto max-w-full" />
        </div>
        <p className="mt-4 text-[13px] font-medium text-body">Código para colar no rodapé (o selo mostra sempre a situação do dia):</p>
        <div className="mt-2 flex items-stretch gap-2">
          <code className="thin-scroll block min-w-0 flex-1 overflow-x-auto whitespace-nowrap rounded-xl bg-surface-2 px-4 py-3 font-mono text-[12px] text-body">
            {embed}
          </code>
          <button type="button" onClick={copiar} className="btn btn-ghost shrink-0" aria-label="Copiar código">
            {copiado ? <Check size={15} /> : <Copy size={15} />} {copiado ? "Copiado" : "Copiar"}
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a href={`/verificar/${cert.codigo}`} target="_blank" rel="noopener" className="btn btn-ghost">
            Ver verificação <ExternalLink size={14} />
          </a>
          <a href={`/selo/${cert.codigo}/png?tema=${tema}`} download className="btn btn-dark">
            Baixar PNG do selo
          </a>
          <a href={`/qr/${cert.codigo}`} download={`qrcode-${cert.codigo}.svg`} className="btn btn-ghost">
            Baixar QR Code
          </a>
          {!cert.revogado && (
            <button type="button" onClick={revogar} className="text-[13px] text-muted underline underline-offset-2 hover:text-danger">
              Revogar
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-5 lg:flex-col lg:items-end">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/qr/${cert.codigo}`} alt={`QR Code ${cert.codigo}`} width={110} height={110} className="rounded-lg border border-line" />
      </div>
    </li>
  );
}
