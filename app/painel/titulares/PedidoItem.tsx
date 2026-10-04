"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Mail } from "lucide-react";
import { STATUS_PEDIDO } from "@/lib/titulares";
import { gerarResposta, type ContextoPedido } from "@/lib/respostas-titular";

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
  contexto: ContextoPedido;
};

function Prazo({ dias, encerrado }: { dias: number; encerrado: boolean }) {
  if (encerrado) return null;
  if (dias < 0) return <span className="painel-pill pendente !bg-danger-tint !text-danger">Atrasado {Math.abs(dias)} dia(s)</span>;
  if (dias <= 3) return <span className="painel-pill pendente !bg-warn-tint !text-warn">Vence em {dias} dia(s)</span>;
  return <span className="painel-pill pendente">{dias} dias para responder</span>;
}

/**
 * Um pedido de titular, para quem não é do jurídico: 1) o que fazer, ferramenta por ferramenta,
 * 2) o e-mail de resposta já escrito com os dados do cliente, 3) um clique para registrar que foi feito.
 */
export function PedidoItem({ p }: { p: PedidoView }) {
  const router = useRouter();
  const pronto = useMemo(() => gerarResposta(p.tipo, { nome: p.nome, protocolo: p.protocolo, criadoEm: p.criadoEm }, p.contexto), [p]);
  const [aberto, setAberto] = useState(!p.encerrado && p.status === "aberto");
  const [feitos, setFeitos] = useState<number[]>([]);
  const [texto, setTexto] = useState(pronto.resposta);
  const [copiado, setCopiado] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [estado, setEstado] = useState("");

  const salvar = async (status: string, resposta: string) => {
    setEstado("salvando");
    const r = await fetch(`/api/titulares/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, resposta }) })
      .then((x) => x.json())
      .catch(() => ({ ok: false }));
    setEstado(r.ok ? "" : (r.error ?? "Não foi possível salvar."));
    if (r.ok) router.refresh();
  };

  const faltaCompletar = /\[[^\]]+\]/.test(texto);
  const respondido = () => {
    if (faltaCompletar && !confirm("A resposta ainda tem trechos entre colchetes para completar. Marcar como respondido assim mesmo?")) return;
    const fez = pronto.passos.filter((_, i) => feitos.includes(i));
    const registro = `Resposta enviada em ${new Date().toLocaleDateString("pt-BR")} para ${p.email}:\n\n${texto}${fez.length ? `\n\nO que foi feito:\n${fez.map((x) => `- ${x}`).join("\n")}` : ""}`;
    salvar("respondido", registro);
  };

  const assunto = `Seu pedido sobre dados pessoais (protocolo ${p.protocolo})`;

  return (
    <li className="bloco">
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
        <div className="border-t border-line px-5 py-5">
          <dl className="grid gap-2 text-[14px] sm:grid-cols-[140px_1fr]">
            <dt className="text-muted">Quem pediu</dt>
            <dd className="text-ink">
              {p.nome} · {p.email}
            </dd>
            <dt className="text-muted">Mensagem</dt>
            <dd className="whitespace-pre-wrap text-body">{p.mensagem || "—"}</dd>
          </dl>

          {p.encerrado ? (
            <div className="mt-4 rounded-xl bg-canvas px-4 py-3">
              <p className="text-[12px] text-muted">O que foi registrado</p>
              <p className="mt-1 whitespace-pre-wrap text-[13.5px] leading-relaxed text-body">{p.resposta || "—"}</p>
            </div>
          ) : (
            <>
              <section className="mt-5">
                <h3 className="text-[15px] font-medium text-ink">1. O que fazer</h3>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {pronto.passos.map((passo, i) => {
                    const on = feitos.includes(i);
                    return (
                      <li key={passo}>
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => setFeitos((f) => (on ? f.filter((x) => x !== i) : [...f, i]))}
                          className="flex w-full items-start gap-3 rounded-xl px-2 py-1.5 text-left text-[14px] leading-snug text-body hover:bg-canvas"
                        >
                          <span className={"mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border " + (on ? "border-brand-strong bg-brand-strong text-rail" : "border-line-strong")}>
                            {on && <Check size={13} strokeWidth={3} />}
                          </span>
                          <span className={on ? "text-muted line-through" : ""}>{passo}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section className="mt-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-[15px] font-medium text-ink">2. Resposta pronta</h3>
                  <span className={"text-[12.5px] " + (faltaCompletar ? "text-warn" : "text-muted")}>
                    {faltaCompletar ? "Complete os trechos entre colchetes" : "Pode editar antes de enviar"}
                  </span>
                </div>
                <label htmlFor={`resp-${p.id}`} className="sr-only">
                  Resposta para {p.nome}
                </label>
                <textarea id={`resp-${p.id}`} value={texto} onChange={(e) => setTexto(e.target.value)} rows={11} className="field-input mt-2 resize-y text-[14px] leading-relaxed" />
                <div className="mt-2 flex flex-wrap gap-2">
                  <a href={`mailto:${p.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(texto)}`} className="barra-btn primario">
                    <Mail size={14} /> Enviar por e-mail
                  </a>
                  <button
                    type="button"
                    className="barra-btn"
                    onClick={async () => {
                      await navigator.clipboard.writeText(texto).catch(() => null);
                      setCopiado(true);
                    }}
                  >
                    <Copy size={14} /> {copiado ? "Copiado" : "Copiar texto"}
                  </button>
                </div>
              </section>

              <section className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4">
                <h3 className="text-[15px] font-medium text-ink">3. Enviou?</h3>
                <button type="button" className="barra-btn primario" onClick={respondido} disabled={estado === "salvando"}>
                  <Check size={15} /> Marcar como respondido
                </button>
                <span className="text-[12.5px] text-muted">A resposta e o que foi feito ficam guardados como prova.</span>
              </section>

              <details className="mt-4 text-[13.5px]">
                <summary className="cursor-pointer text-muted hover:text-ink">Não dá para atender este pedido?</summary>
                <p className="mt-2 leading-relaxed text-body">
                  Acontece quando não é possível confirmar que é a própria pessoa, ou quando a lei obriga a guardar o dado. Explique o motivo; ele fica
                  registrado.
                </p>
                <label htmlFor={`motivo-${p.id}`} className="sr-only">
                  Motivo
                </label>
                <textarea id={`motivo-${p.id}`} value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={2} className="field-input mt-2" placeholder="Motivo" />
                <button type="button" className="barra-btn mt-2" disabled={!motivo.trim() || estado === "salvando"} onClick={() => salvar("recusado", `Encerrado sem atender: ${motivo.trim()}`)}>
                  Encerrar sem atender
                </button>
              </details>
            </>
          )}
          {estado && estado !== "salvando" && <p className="painel-error mt-3">{estado}</p>}
        </div>
      )}
    </li>
  );
}
