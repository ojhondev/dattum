"use client";

import { useState } from "react";
import { Copy, Mail, MessageCircle, Printer } from "lucide-react";
import { linkWhatsappPara } from "@/lib/contato";

export function AcoesDat({
  contaId,
  contaNome,
  temLink,
  contato,
}: {
  contaId: string;
  contaNome: string;
  temLink: boolean;
  contato: { nome: string | null; whatsapp: string | null; email: string | null };
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [estado, setEstado] = useState("");

  const gerar = async () => {
    setEstado("gerando");
    const r = await fetch(`/api/contas/${contaId}/dat-link`, { method: "POST" })
      .then((x) => x.json())
      .catch(() => ({ ok: false }));
    setEstado(r.ok ? "" : "erro");
    if (r.ok) setUrl(r.url);
  };

  const cancelar = async () => {
    if (!confirm("Desativar este link? Quem tiver o link antigo deixa de ver o resumo. Você pode gerar outro depois.")) return;
    await fetch(`/api/contas/${contaId}/dat-link`, { method: "DELETE" });
    setUrl(null);
  };

  const saudacao = contato.nome ? `Olá, ${contato.nome.split(" ")[0]}!` : "Olá!";
  const msg = url ? `${saudacao} Segue o resumo de conformidade LGPD da ${contaNome}, sempre atualizado: ${url}` : "";
  const wa = url ? (linkWhatsappPara(contato.whatsapp, msg) ?? `https://wa.me/?text=${encodeURIComponent(msg)}`) : null;

  return (
    <div className="flex flex-col gap-2 lg:items-end">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="painel-btn ghost" onClick={() => window.print()}>
          <Printer size={14} /> Baixar PDF
        </button>
        {!url && (
          <button type="button" className="painel-btn" onClick={gerar} disabled={estado === "gerando"}>
            {estado === "gerando" ? "Gerando..." : temLink ? "Ver link do cliente" : "Gerar link para o cliente"}
          </button>
        )}
        {url && wa && (
          <a href={wa} target="_blank" rel="noopener" className="painel-btn">
            <MessageCircle size={14} /> {contato.whatsapp ? "Enviar no WhatsApp" : "Abrir no WhatsApp"}
          </a>
        )}
        {url && contato.email && (
          <a
            href={`mailto:${contato.email}?subject=${encodeURIComponent(`Resumo de conformidade LGPD — ${contaNome}`)}&body=${encodeURIComponent(msg)}`}
            className="painel-btn ghost"
          >
            <Mail size={14} /> E-mail
          </a>
        )}
      </div>
      {url && (
        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-ink underline underline-offset-2"
            onClick={() => navigator.clipboard.writeText(url).then(() => setEstado("copiado"))}
          >
            <Copy size={13} /> {estado === "copiado" ? "Link copiado" : "Copiar link"}
          </button>
          <span className="text-faint">·</span>
          <button type="button" onClick={cancelar} className="text-muted underline underline-offset-2 hover:text-danger">
            Desativar link
          </button>
        </div>
      )}
      {estado === "erro" && <p className="painel-error">Não foi possível gerar o link.</p>}
    </div>
  );
}
