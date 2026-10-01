"use client";

import { useState } from "react";
import { Check, Link2, MessageCircle } from "lucide-react";

function IconeLinkedin() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1v5.45h-4v-4.83c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.55v4.91h-4v-11Z" />
    </svg>
  );
}

export function Compartilhar({ url, titulo }: { url: string; titulo: string }) {
  const [copiado, setCopiado] = useState(false);
  const item = "flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-brand-strong hover:bg-brand-tint";
  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.05em] text-muted">Compartilhar</span>
      <a className={item} aria-label="Compartilhar no WhatsApp" target="_blank" rel="noopener" href={`https://wa.me/?text=${encodeURIComponent(`${titulo} ${url}`)}`}>
        <MessageCircle size={17} />
      </a>
      <a className={item} aria-label="Compartilhar no LinkedIn" target="_blank" rel="noopener" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}>
        <IconeLinkedin />
      </a>
      <button
        type="button"
        className={item}
        aria-label="Copiar link"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 1800);
          } catch {
            /* sem permissão de área de transferência */
          }
        }}
      >
        {copiado ? <Check size={17} /> : <Link2 size={17} />}
      </button>
    </div>
  );
}
