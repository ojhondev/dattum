"use client";

import { BarraModulo } from "@/components/app/Modulo";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, FileDown, Printer, FileText, Lock } from "lucide-react";
import { TIPOS_DOCUMENTO, gerarDocumento, VERSAO_MODELOS, type DadosDocumento } from "@/lib/documentos";
import { dividirPrevia } from "@/lib/previa";
import { ConteudoBloqueado } from "@/components/app/ConteudoBloqueado";

export type ContaDoc = { id: string; dados: DadosDocumento };

const escapar = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** `bloqueado` = conta em exploração: só o começo do documento fica legível, sem copiar, Word ou PDF. */
export function GeradorDocumentos({ contas, contaInicial, tipoInicial, bloqueado = false }: { contas: ContaDoc[]; contaInicial: string; tipoInicial: string; bloqueado?: boolean }) {
  const router = useRouter();
  const [contaId, setContaId] = useState(contaInicial);
  const [tipo, setTipo] = useState(tipoInicial);
  const [lacunas, setLacunas] = useState<Record<string, string>>({});
  const [copiado, setCopiado] = useState(false);

  const conta = contas.find((c) => c.id === contaId) ?? contas[0];
  const doc = TIPOS_DOCUMENTO.find((t) => t.id === tipo) ?? TIPOS_DOCUMENTO[0];
  const base = useMemo(() => (conta ? gerarDocumento(doc.id, conta.dados) : ""), [conta, doc.id]);
  const campos = useMemo(() => [...new Set([...base.matchAll(/\[preencher: ([^\]]+)\]/g)].map((m) => m[1]))], [base]);
  const texto = useMemo(() => base.replace(/\[preencher: ([^\]]+)\]/g, (m, campo: string) => lacunas[campo]?.trim() || m), [base, lacunas]);
  const faltam = campos.filter((c) => !lacunas[c]?.trim()).length;
  const previa = useMemo(() => (bloqueado ? dividirPrevia(texto) : null), [bloqueado, texto]);

  const escolher = (c: string, t: string) => {
    setContaId(c);
    setTipo(t);
    router.replace(`/painel/documentos?conta=${c}&tipo=${t}`, { scroll: false });
  };

  const nomeArquivo = `${doc.titulo} - ${conta?.dados.conta.nome ?? ""}`.replace(/[\\/:*?"<>|]/g, "");

  const baixarWord = () => {
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${escapar(doc.titulo)}</title></head><body style="font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.5">${texto
      .split(/\n{2,}/)
      .map((bloco) => {
        if (bloco.startsWith("# ")) return `<h1>${escapar(bloco.slice(2))}</h1>`;
        if (bloco.startsWith("## ")) return `<h2>${escapar(bloco.slice(3))}</h2>`;
        return `<p>${escapar(bloco).replace(/\n/g, "<br>")}</p>`;
      })
      .join("")}</body></html>`;
    const url = URL.createObjectURL(new Blob(["﻿" + html], { type: "application/msword" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${nomeArquivo}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const imprimir = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(
      `<html><head><title>${escapar(nomeArquivo)}</title><style>body{font-family:Georgia,serif;max-width:720px;margin:48px auto;padding:0 24px;font-size:15px;line-height:1.65;color:#111}pre{white-space:pre-wrap;font-family:inherit}</style></head><body><pre>${escapar(texto)}</pre></body></html>`,
    );
    w.document.close();
    w.focus();
    w.print();
  };

  if (!conta) {
    return (
      <div className="block-card p-10 text-body">
        Ative a primeira conta de cliente para gerar documentos com os dados dela.
      </div>
    );
  }

  return (
    <>
    <BarraModulo
      esquerda={
        <label data-tour="doc-conta" className="flex min-w-0 items-center gap-2 pl-2">
          <span className="text-[13px] text-muted">Cliente</span>
          <select id="doc-conta" value={conta.id} onChange={(e) => escolher(e.target.value, doc.id)} className="h-9 min-w-0 max-w-[280px] rounded-lg border border-line bg-canvas px-2.5 text-[13.5px] text-ink">
            {contas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.dados.conta.nome}
              </option>
            ))}
          </select>
        </label>
      }
      direita={<span className="hidden px-2 text-[13px] text-muted md:inline">O texto usa o CNPJ, o site, as operações e as ferramentas do cliente</span>}
    />
    <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
      <div className="flex flex-col gap-4">
        <section data-tour="doc-tipos" className="rounded-[20px] border border-line bg-surface p-2">
          <p className="px-3 pb-1 pt-3 font-mono text-[11px] uppercase tracking-[0.05em] text-muted">Documento</p>
          <ul className="flex flex-col">
            {TIPOS_DOCUMENTO.map((t) => {
              const ativo = t.id === doc.id;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => escolher(conta.id, t.id)}
                    className={"flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors " + (ativo ? "bg-brand-tint" : "hover:bg-canvas")}
                  >
                    <span className={"pixel-corners pixel-corners-sm mt-0.5 grid h-8 w-8 shrink-0 place-items-center " + (ativo ? "bg-rail text-brand" : "bg-surface-2 text-muted")}>
                      <FileText size={15} />
                    </span>
                    <span>
                      <span className="block text-[14.5px] font-medium text-ink">{t.titulo}</span>
                      <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">{t.resumo}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {campos.length > 0 && (
          <section className="rounded-[20px] border border-line bg-surface p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-muted">Lacunas</p>
              <span className={"pill " + (faltam ? "pill-warn" : "pill-ok")}>{faltam ? `${faltam} a preencher` : "Completo"}</span>
            </div>
            <div className="mt-3 flex flex-col gap-2.5">
              {campos.map((c) => (
                <label key={c} className="block">
                  <span className="text-[12.5px] text-muted">{c}</span>
                  <input value={lacunas[c] ?? ""} onChange={(e) => setLacunas((l) => ({ ...l, [c]: e.target.value }))} className="field-input mt-1 py-2 text-[14px]" />
                </label>
              ))}
            </div>
          </section>
        )}
      </div>

      <section className="min-w-0 rounded-[20px] border border-line bg-surface">
        <div data-tour="doc-acoes" className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="text-[16px] font-medium text-ink">{doc.titulo}</p>
            <p className="text-[12.5px] text-muted">Onde usar: {doc.ondeUsar}</p>
          </div>
          {previa ? (
            <span className="pill pill-neutral inline-flex items-center gap-1.5">
              <Lock size={13} /> Copiar, Word e PDF no plano ativo
            </span>
          ) : (
          <>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(texto);
                setCopiado(true);
                setTimeout(() => setCopiado(false), 1800);
              } catch {
                /* sem permissão */
              }
            }}
            className="btn btn-ghost"
          >
            {copiado ? <Check size={15} /> : <Copy size={15} />} {copiado ? "Copiado" : "Copiar"}
          </button>
          <button type="button" onClick={baixarWord} className="btn btn-ghost">
            <FileDown size={15} /> Word
          </button>
          <button type="button" onClick={imprimir} className="btn btn-dark">
            <Printer size={15} /> PDF
          </button>
          </>
          )}
        </div>
        <pre className="max-h-[78vh] overflow-auto whitespace-pre-wrap break-words px-6 py-6 font-ui text-[15px] leading-[1.75] text-body sm:px-10">
          {(previa ? previa.visivel : texto).split(/(\[preencher: [^\]]+\])/g).map((parte, i) =>
            parte.startsWith("[preencher:") ? (
              <mark key={i} className="rounded bg-caution-tint px-1 text-caution">
                {parte}
              </mark>
            ) : (
              <span key={i}>{parte}</span>
            ),
          )}
        </pre>
        {previa && (
          <ConteudoBloqueado className="-mt-4 px-6 pb-6 sm:px-10">
            <pre className="whitespace-pre-wrap break-words font-ui text-[15px] leading-[1.75] text-body">{previa.oculto}</pre>
          </ConteudoBloqueado>
        )}
        <p className="border-t border-line px-6 py-3 text-[12px] leading-snug text-faint">
          Modelo Dattis v{VERSAO_MODELOS}, gerado a partir dos dados cadastrados. Revise com o jurídico do cliente antes de
          assinar ou publicar. A Dattis não presta assessoria jurídica.
        </p>
      </section>
    </div>
    </>
  );
}
