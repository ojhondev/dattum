import Link from "next/link";
import { ArrowRight, Cookie } from "lucide-react";

/** Atalho para o módulo Cookies, com a situação do aviso deste site. */
export function CookiesAtalho({ href, ativo, escolhas }: { href: string; ativo: boolean; escolhas: number | null }) {
  return (
    <Link href={href} data-tour="conta-cookies" className="flex items-center gap-3 rounded-[20px] border border-line bg-surface p-5 transition-colors hover:bg-surface-2">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-canvas text-muted">
        <Cookie size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[12px] uppercase tracking-[0.04em] text-muted">Aviso de cookies</span>
          {ativo ? <span className="painel-pill ok">Ativo</span> : <span className="painel-pill pendente">Desligado</span>}
        </span>
        <span className="mt-1 block text-[14px] leading-snug text-body">
          {ativo ? `${escolhas ?? 0} escolha(s) de visitantes nos últimos 30 dias. Instalação, verificação e prova no módulo Cookies.` : "Ative e instale o aviso de cookies no módulo Cookies."}
        </span>
      </span>
      <ArrowRight size={17} className="shrink-0 text-muted" />
    </Link>
  );
}
