"use client";

import { useState } from "react";
import { Copy, Mail, MessageCircle, Send } from "lucide-react";

/**
 * Quem instala o aviso de cookies normalmente não é o dono da agência, e sim quem cuida do site
 * do cliente. Este cartão gera a mensagem pronta com o link do passo a passo público.
 */
export function EnviarInstrucoes({ token, nome, origem }: { token: string; nome: string; origem: string }) {
  const [copiado, setCopiado] = useState(false);
  const url = `${origem}/instalar/${token}`;
  const msg = `Oi! Preciso instalar no site da ${nome} o aviso de cookies da Dattis, exigido pela LGPD. Ele segura o pixel até o visitante aceitar. O passo a passo para cada plataforma (WordPress, Shopify, Gerenciador de Tags, código) está aqui e leva uns 5 minutos: ${url}`;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-brand-strong bg-brand-tint p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-rail text-brand">
          <Send size={16} />
        </span>
        <div>
          <p className="text-[15px] font-medium text-ink">Não é você quem mexe no site?</p>
          <p className="mt-0.5 text-[13.5px] leading-snug text-body">Mande o passo a passo para quem cuida dele. A mensagem já vai pronta.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <a href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener" className="barra-btn primario">
          <MessageCircle size={15} /> WhatsApp
        </a>
        <a href={`mailto:?subject=${encodeURIComponent(`Aviso de cookies no site da ${nome}`)}&body=${encodeURIComponent(msg)}`} className="barra-btn">
          <Mail size={15} /> E-mail
        </a>
        <button
          type="button"
          className="barra-btn"
          onClick={async () => {
            await navigator.clipboard.writeText(url).catch(() => null);
            setCopiado(true);
          }}
        >
          <Copy size={14} /> {copiado ? "Link copiado" : "Copiar link"}
        </button>
      </div>
    </div>
  );
}
