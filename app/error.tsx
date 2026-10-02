"use client";

import { useEffect } from "react";
import { reportarErro } from "@/lib/reportar-erro";
import { linkContato } from "@/lib/contato";

export default function Erro({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => reportarErro(error), [error]);

  return (
    <div className="mx-auto flex min-h-[60svh] max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
      <p className="t-eyebrow">Algo deu errado</p>
      <h1 className="mt-4 font-display text-[32px] leading-tight text-ink">Esta tela não carregou direito</h1>
      <p className="mt-4 text-[16px] leading-relaxed text-body">
        A equipe da Dattis já foi avisada automaticamente. Tente de novo; se continuar, fale com a gente
        {error.digest ? (
          <>
            {" "}
            e informe o código <span className="font-mono text-ink">{error.digest}</span>
          </>
        ) : null}
        .
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => retry()} className="btn btn-dark">
          Tentar de novo
        </button>
        <a href={linkContato(`Olá! Uma tela da Dattis deu erro${error.digest ? ` (código ${error.digest})` : ""}.`)} target="_blank" rel="noopener" className="btn btn-ghost">
          Falar com a Dattis
        </a>
      </div>
    </div>
  );
}
