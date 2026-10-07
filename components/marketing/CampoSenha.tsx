"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/** Campo de senha com o "olhinho" para ver o que está sendo digitado e evitar erro de digitação. */
export function CampoSenha({ className = "field-input mt-1.5", ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visivel, setVisivel] = useState(false);
  return (
    <span className="relative block">
      <input {...props} type={visivel ? "text" : "password"} className={className + " pr-12"} />
      <button
        type="button"
        onClick={() => setVisivel((v) => !v)}
        aria-label={visivel ? "Esconder senha" : "Mostrar senha"}
        aria-pressed={visivel}
        className="absolute right-2 top-1/2 mt-[3px] grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"
      >
        {visivel ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </span>
  );
}
