"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { linkContato } from "@/lib/contato";
import foto from "../../public/marketing/especialista.png";

// Áreas logadas e o fluxo da auditoria (tela cheia) ficam sem os botões.
const OCULTAR = ["/painel", "/admin", "/diagnostico"];

/** Especialista no WhatsApp (canto inferior esquerdo) e voltar ao topo (canto inferior direito). */
export function BotoesFlutuantes() {
  const pathname = usePathname();
  const [rolou, setRolou] = useState(false);

  useEffect(() => {
    const ver = () => setRolou(window.scrollY > 500);
    ver();
    window.addEventListener("scroll", ver, { passive: true });
    return () => window.removeEventListener("scroll", ver);
  }, []);

  if (OCULTAR.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;

  const base = "sai-no-foco fixed z-[45] bottom-[calc(var(--lei-bar-h,0px)+14px)] sm:bottom-[calc(var(--lei-bar-h,0px)+22px)]";

  return (
    <>
      <a
        href={linkContato("Olá! Vim pelo site da Dattis e quero falar com um especialista em LGPD pra agências.")}
        target="_blank"
        rel="noopener"
        aria-label="Fale com um especialista no WhatsApp"
        className={base + " group left-3.5 flex items-center sm:left-6"}
      >
        <span className="relative block h-[54px] w-[54px] shrink-0 rounded-full bg-brand p-[3px] shadow-[0_6px_20px_rgba(0,40,32,0.28)] transition-transform group-hover:scale-105 sm:h-[62px] sm:w-[62px]">
          <Image src={foto} alt="" sizes="62px" className="h-full w-full rounded-full object-cover" />
          <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#25d366]" />
        </span>
        <span className="relative -ml-1.5 flex items-center">
          <span aria-hidden="true" className="flutuante-escuro pixel-corners pixel-corners-sm h-1.5 w-1.5 bg-rail" />
          <span className="flutuante-escuro pixel-corners pixel-corners-sm bg-rail px-2 py-1 font-mono text-[9.5px] uppercase leading-none tracking-[0.06em] text-brand sm:px-2.5 sm:py-1.5 sm:text-[10.5px]">
            Fale com Especialista
          </span>
        </span>
      </a>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Voltar ao topo"
        tabIndex={rolou ? 0 : -1}
        className={
          base +
          " flutuante-escuro right-3.5 flex h-12 w-12 items-center justify-center rounded-full bg-rail text-brand shadow-[0_6px_20px_rgba(0,40,32,0.28)] transition-all duration-300 hover:-translate-y-0.5 sm:right-6 sm:h-[52px] sm:w-[52px] " +
          (rolou ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0")
        }
      >
        <ArrowUp size={20} strokeWidth={2} />
      </button>
    </>
  );
}
