"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { STATUS_PEDIDO } from "@/lib/titulares";

export type PedidoView = {
  id: string;
  protocolo: string;
  nome: string;
  email: string;
  tipo: string;
  tipoRotulo: string;
  tipoArtigo: string;
  mensagem: string | null;
  status: string;
  resposta: string | null;
  origem: string;
  criadoEm: string;
  diasRestantes: number;
  encerrado: boolean;
};

function Prazo({ dias, encerrado }: { dias: number; encerrado: boolean }) {
  if (encerrado) return null;
  if (dias < 0) return <span className="painel-pill pendente !bg-danger-tint !text-danger">Atrasado {Math.abs(dias)} dia(s)</span>;
  if (dias <= 3) return <span className="painel-pill pendente !bg-warn-tint !text-warn">Vence em {dias} dia(s)</span>;
  return <span className="painel-pill pendente">{dias} dias para responder</span>;
}

export function PedidoItem({ p }: { p: PedidoView }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(!p.encerrado && p.status === "aberto");
  const [resposta, setResposta] = useState(p.resposta ?? "");
  const [estado, setEstado] = useState("");

  const salvar = async (status?: string) => {
    setEstado("salvando");
    const r = await fetch(`/api/titulares/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, resposta }) })
      .then((x) => x.json())
      .catch(() => ({ ok: false }));
    setEstado(r.ok ? "" : (r.error ?? "Não foi possível salvar."));
    if (r.ok) router.refresh();
  };

  const assunto = `Seu pedido sobre dados pessoais (protocolo ${p.protocolo})`;
  const corpo = `Olá, ${p.nome.split(" ")[0]}.\n\nRecebemos seu pedido "${p.tipoRotulo}" (protocolo ${p.protocolo}).\n\n`;

  return (
    <li className="rounded-[20px] border border-line bg-surface">
      <button type="button" onClick={() => setAberto(!aberto)} className="flex w-full flex-wrap items-center gap-3 px-5 py-4 text-left">
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-medium text-ink">{p.tipoRotulo}</span>
          <span className="block text-[13px] text-muted">
            {p.nome} · {p.origem} · <span className="font-mono">{p.protocolo}</span> · {new Date(p.criadoEm).toLocaleDateString("pt-BR")}
          </span>
        </span>
        <Prazo dias={p.diasRestantes} encerrado={p.encerrado} />
        <span className={`painel-pill ${STATUS_PEDIDO[p.status]?.classe ?? "pendente"}`}>{STATUS_PEDIDO[p.status]?.rotulo ?? p.status}</span>
      </button>
      {aberto && (
        <div className="border-t border-line px-5 py-4">
          <dl className="grid gap-2 text-[14px] sm:grid-cols-[160px_1fr]">
            <dt className="text-muted">Quem pediu</dt>
            <dd className="text-ink">
              {p.nome} · <a href={`mailto:${p.email}`} className="underline">{p.email}</a>
            </dd>
            <dt className="text-muted">Direito</dt>
            <dd className="text-body">{p.tipoArtigo}</dd>
            <dt className="text-muted">Mensagem</dt>
            <dd className="whitespace-pre-wrap text-body">{p.mensagem || "—"}</dd>
          </dl>
          <div className="mt-4 rounded-xl bg-canvas px-4 py-3 text-[13.5px] leading-relaxed text-body">
            <b className="text-ink">Como atender:</b> confirme que é a própria pessoa (responda para o e-mail informado), veja com o cliente quais dados
            existem nas ferramentas (CRM, planilhas, públicos dos anúncios, WhatsApp), faça o que foi pedido e responda em até 15 dias. Anote aqui o que
            foi feito: é a sua prova.
          </div>
          <label className="mt-4 block">
            <span className="text-body-sm font-medium text-body">O que foi respondido ou feito (anotação interna)</span>
            <textarea
              id={`resp-${p.id}`}
              value={resposta}
              onChange={(e) => setResposta(e.target.value)}
              rows={3}
              placeholder="Ex.: dados apagados do CRM e removidos dos públicos do Meta em 03/10; resposta enviada por e-mail."
              className="field-input mt-1.5 resize-y"
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={`mailto:${p.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`} className="painel-btn ghost">
              <Mail size={14} /> Responder por e-mail
            </a>
            {p.status === "aberto" && (
              <button type="button" className="painel-btn ghost" onClick={() => salvar("em_andamento")} disabled={estado === "salvando"}>
                Marcar em andamento
              </button>
            )}
            <button type="button" className="painel-btn" onClick={() => salvar("respondido")} disabled={estado === "salvando"}>
              Marcar como respondido
            </button>
            {!p.encerrado && (
              <button type="button" className="painel-btn ghost" onClick={() => salvar("recusado")} disabled={estado === "salvando"}>
                Encerrar sem atender
              </button>
            )}
            {p.encerrado && (
              <button type="button" className="painel-btn ghost" onClick={() => salvar()} disabled={estado === "salvando"}>
                Salvar anotação
              </button>
            )}
          </div>
          {estado && estado !== "salvando" && <p className="painel-error mt-3">{estado}</p>}
        </div>
      )}
    </li>
  );
}
