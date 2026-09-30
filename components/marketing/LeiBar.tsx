"use client";

import { useEffect, useState } from "react";
import { X, Calculator } from "lucide-react";
import { abrirCalculadora } from "@/components/marketing/CalculadoraPopup";

const CHAVE = "dattis:lei-bar-fechada";

const ARTIGOS = [
  { art: "Art. 37", t: "Registro das operações de tratamento" },
  { art: "Art. 39", t: "Operador segue as instruções do controlador" },
  { art: "Art. 42", t: "Responsabilidade solidária do operador" },
  { art: "Art. 46", t: "Medidas de segurança" },
];

/** Faixa fixa no rodapé da tela com a base legal. Fechável; lembra a escolha neste navegador. */
export function LeiBar() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    let fechada = false;
    try {
      fechada = localStorage.getItem(CHAVE) === "1";
    } catch {
      /* armazenamento indisponível: mostra a faixa */
    }
    const t = setTimeout(() => setVisivel(!fechada), 0);
    return () => clearTimeout(t);
  }, []);

  const fechar = () => {
    setVisivel(false);
    try {
      localStorage.setItem(CHAVE, "1");
    } catch {
      /* ignora */
    }
  };

  if (!visivel) return null;

  return (
    <div role="region" aria-label="Base legal" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-rail text-white">
      <div className="flex items-center gap-4 py-3 pl-4 pr-2 sm:pl-10 sm:pr-4">
        <p className="hidden shrink-0 font-mono text-[12px] uppercase tracking-[0.05em] text-brand xl:block">
          Baseado na Lei Geral de Proteção de Dados:
        </p>
        <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_4%,#000_96%,transparent)]">
          <ul className="letreiro flex w-max items-center">
            {[0, 1].map((copia) =>
              [{ art: "LGPD", t: "Lei nº 13.709/2018" }, ...ARTIGOS].map((a) => (
                <li key={copia + a.art} aria-hidden={copia === 1} data-extra={a.art === "LGPD" ? "" : undefined} className="flex shrink-0 items-baseline gap-2 whitespace-nowrap px-6 text-[13px]">
                  <span className="font-display text-[16px] text-brand">{a.art}</span>
                  <span className="text-white/80">{a.t}</span>
                </li>
              )),
            )}
          </ul>
        </div>
        <button type="button" onClick={abrirCalculadora} className="btn btn-primary hidden shrink-0 !py-2 md:inline-flex">
          <Calculator size={15} /> Calcular meu risco
        </button>
        <button type="button" onClick={fechar} aria-label="Fechar faixa" className="shrink-0 rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
