"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Copy, Link2, Mail, MessageCircle } from "lucide-react";
import { linkWhatsappPara } from "@/lib/contato";

export type ContratoDados = {
  id: string;
  versao: number;
  situacao: "rascunho" | "aguarda_cliente" | "aguarda_agencia" | "assinado";
  conteudoSnapshot: string;
  hashConteudo: string | null;
  temLink: boolean;
  agencia: { nome: string | null; cargo: string | null; em: string | null; ip: string | null } | null;
  cliente: { nome: string | null; cargo: string | null; email: string | null; em: string | null; ip: string | null } | null;
};

export type VersaoContrato = { id: string; versao: number; assinado: boolean; criadoEm: string; substituidoEm: string | null };

const PILULA: Record<ContratoDados["situacao"], { classe: string; texto: string }> = {
  rascunho: { classe: "pendente", texto: "Ninguém assinou ainda" },
  aguarda_cliente: { classe: "pendente", texto: "Falta o cliente assinar" },
  aguarda_agencia: { classe: "pendente", texto: "Falta a agência assinar" },
  assinado: { classe: "ok", texto: "Assinado pelas duas partes" },
};

const dataHora = (iso: string) => new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

function Assinado({ nome, cargo, email, em, ip }: { nome: string | null; cargo: string | null; email?: string | null; em: string; ip: string | null }) {
  return (
    <div className="mt-3 text-[14px] leading-relaxed text-body">
      <p className="text-ink">
        <b className="font-semibold">{nome}</b> · {cargo}
      </p>
      {email && <p>{email}</p>}
      <p className="text-muted">
        {dataHora(em)} · IP {ip ?? "-"}
      </p>
    </div>
  );
}

export function ContratoConta({
  contrato,
  versoes,
  contaNome,
  contato,
  responsavelPadrao,
}: {
  contrato: ContratoDados | null;
  versoes: VersaoContrato[];
  contaNome: string;
  contato: { nome: string | null; email: string | null; whatsapp: string | null };
  responsavelPadrao: { nome: string; cargo: string };
}) {
  const router = useRouter();
  const [nome, setNome] = useState(responsavelPadrao.nome);
  const [cargo, setCargo] = useState(responsavelPadrao.cargo);
  const [aceite, setAceite] = useState(false);
  const [assinando, setAssinando] = useState(false);
  const [erro, setErro] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  if (!contrato) {
    return (
      <div className="painel-table-wrap">
        <div className="painel-empty">Nenhum contrato gerado para esta conta.</div>
      </div>
    );
  }

  const assinarAgencia = async () => {
    if (!nome.trim() || !cargo.trim() || !aceite) return setErro("Preencha nome, cargo e confirme que leu e concorda.");
    setAssinando(true);
    setErro("");
    const r = await fetch(`/api/dpa/${contrato.id}/assinar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, cargo, aceite }),
    })
      .then((x) => x.json())
      .catch(() => ({ ok: false }));
    setAssinando(false);
    if (!r.ok) return setErro(r.error ?? "Não foi possível assinar agora.");
    router.refresh();
  };

  const gerarLink = async () => {
    setGerando(true);
    const r = await fetch(`/api/dpa/${contrato.id}/link`, { method: "POST" })
      .then((x) => x.json())
      .catch(() => ({ ok: false }));
    setGerando(false);
    if (r.ok) setLink(r.url);
    else setErro(r.error ?? "Não foi possível gerar o link.");
  };

  const cancelarLink = async () => {
    if (!confirm("Cancelar este link? Quem tiver o link antigo não conseguirá mais assinar. Você pode gerar outro depois.")) return;
    await fetch(`/api/dpa/${contrato.id}/link`, { method: "DELETE" });
    setLink(null);
    router.refresh();
  };

  const copiar = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link).catch(() => null);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const saudacao = contato.nome ? `Olá, ${contato.nome.split(" ")[0]}!` : "Olá!";
  const mensagem = link
    ? `${saudacao} Segue o contrato de dados pessoais entre a agência e a ${contaNome}, que a LGPD pede pra formalizar. É rápido: você lê e assina por este link: ${link}`
    : "";
  const whats = link ? (linkWhatsappPara(contato.whatsapp, mensagem) ?? `https://wa.me/?text=${encodeURIComponent(mensagem)}`) : null;
  const mail =
    link && contato.email
      ? `mailto:${contato.email}?subject=${encodeURIComponent(`Contrato de dados pessoais — ${contaNome}`)}&body=${encodeURIComponent(mensagem)}`
      : null;

  const pilula = PILULA[contrato.situacao];
  const anteriores = versoes.filter((v) => v.id !== contrato.id);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`painel-pill ${pilula.classe}`}>{pilula.texto}</span>
          <span className="font-mono text-[12px] uppercase tracking-[0.04em] text-muted">Versão {contrato.versao}</span>
        </div>
        <a className="painel-btn ghost" href={`/api/dpa/${contrato.id}/pdf`} target="_blank" rel="noopener noreferrer">
          Baixar PDF
        </a>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Agência */}
        <div className="rounded-[20px] border border-line bg-surface p-5">
          <p className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.04em] text-muted">
            {contrato.agencia?.em ? <CheckCircle2 size={16} className="text-brand-ink" /> : <Circle size={16} />}
            Agência (operadora)
          </p>
          {contrato.agencia?.em ? (
            <Assinado {...contrato.agencia} em={contrato.agencia.em} />
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              <label className="block">
                <span className="text-body-sm font-medium text-body">Seu nome</span>
                <input id="ag-nome" className="field-input mt-1.5" value={nome} onChange={(e) => setNome(e.target.value)} />
              </label>
              <label className="block">
                <span className="text-body-sm font-medium text-body">Cargo</span>
                <input id="ag-cargo" className="field-input mt-1.5" value={cargo} onChange={(e) => setCargo(e.target.value)} />
              </label>
              <label className="flex items-start gap-3 text-[14px] leading-snug text-body">
                <input id="ag-aceite" type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Li o contrato e assino em nome da agência.</span>
              </label>
              <div>
                <button className="painel-btn" type="button" onClick={assinarAgencia} disabled={assinando}>
                  {assinando ? "Assinando..." : "Assinar pela agência"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cliente */}
        <div className="rounded-[20px] border border-line bg-surface p-5">
          <p className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.04em] text-muted">
            {contrato.cliente?.em ? <CheckCircle2 size={16} className="text-brand-ink" /> : <Circle size={16} />}
            Cliente (controlador) · {contaNome}
          </p>
          {contrato.cliente?.em ? (
            <Assinado {...contrato.cliente} em={contrato.cliente.em} />
          ) : (
            <div className="mt-3">
              <p className="text-[14px] leading-relaxed text-body">
                O cliente assina pelo celular, sem criar conta. Gere o link e mande para {contato.nome ?? "o responsável"} pelo WhatsApp ou
                e-mail.
              </p>
              {link ? (
                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2">
                    <Link2 size={15} className="shrink-0 text-muted" />
                    <input readOnly value={link} aria-label="Link de assinatura" className="min-w-0 flex-1 bg-transparent font-mono text-[12px] text-ink outline-none" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="painel-btn ghost" onClick={copiar}>
                      <Copy size={14} /> {copiado ? "Copiado" : "Copiar"}
                    </button>
                    {whats && (
                      <a className="painel-btn" href={whats} target="_blank" rel="noopener">
                        <MessageCircle size={14} /> {contato.whatsapp ? "Enviar no WhatsApp" : "Abrir no WhatsApp"}
                      </a>
                    )}
                    {mail && (
                      <a className="painel-btn ghost" href={mail}>
                        <Mail size={14} /> Enviar por e-mail
                      </a>
                    )}
                  </div>
                  <button type="button" onClick={cancelarLink} className="self-start text-[13px] text-muted underline hover:text-danger">
                    Cancelar este link
                  </button>
                </div>
              ) : (
                <button type="button" className="painel-btn mt-4" onClick={gerarLink} disabled={gerando}>
                  {gerando ? "Gerando..." : contrato.temLink ? "Ver link de assinatura" : "Gerar link para o cliente assinar"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {erro && <div className="painel-error mt-4">{erro}</div>}

      <div className="dpa-doc mt-6">
        <pre>{contrato.conteudoSnapshot}</pre>
        {contrato.hashConteudo && <p className="mt-4 break-all font-mono text-[11px] text-muted">SHA-256 do texto assinado: {contrato.hashConteudo}</p>}
      </div>

      {anteriores.length > 0 && (
        <div className="mt-8">
          <p className="font-mono text-[12px] uppercase tracking-[0.04em] text-muted">Versões anteriores</p>
          <ul className="mt-3 flex flex-col gap-2">
            {anteriores.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-[14px]">
                <span className="text-ink">
                  Versão {v.versao} · {v.assinado ? "assinada" : "não assinada"}
                  {v.substituidoEm ? ` · substituída em ${new Date(v.substituidoEm).toLocaleDateString("pt-BR")}` : ""}
                </span>
                <a href={`/api/dpa/${v.id}/pdf`} target="_blank" rel="noopener" className="nav-link text-[13px]">
                  PDF
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
