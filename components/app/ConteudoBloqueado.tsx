import { Lock } from "lucide-react";
import { linkContato } from "@/lib/contato";

/**
 * Bloco borrado com cadeado para conta em exploração. `children` deve ser conteúdo de exemplo ou
 * embaralhado (ver lib/previa.ts): o borrão é visual, a proteção real é o texto nunca chegar inteiro.
 */
export function ConteudoBloqueado({
  children,
  titulo = "Disponível com o plano ativo",
  texto = "Ative o plano para ver o documento completo, copiar, baixar e mandar para assinatura.",
  className = "",
}: {
  children: React.ReactNode;
  titulo?: string;
  texto?: string;
  className?: string;
}) {
  return (
    <div className={"relative overflow-hidden " + className}>
      <div aria-hidden="true" className="pointer-events-none select-none blur-[5px] [user-select:none]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-start justify-center bg-gradient-to-b from-transparent via-canvas/60 to-canvas px-4 pt-10">
        <div className="sticky top-24 flex max-w-sm flex-col items-center gap-3 rounded-[20px] border border-line-strong bg-surface px-6 py-5 text-center shadow-lg">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-tint text-brand-ink">
            <Lock size={18} />
          </span>
          <p className="font-medium text-ink">{titulo}</p>
          <p className="text-[13.5px] leading-relaxed text-muted">{texto}</p>
          <a
            href={linkContato("Olá! Criei minha conta na Dattis e quero ativar o plano.")}
            target="_blank"
            rel="noopener"
            className="painel-btn"
          >
            Ativar plano no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
