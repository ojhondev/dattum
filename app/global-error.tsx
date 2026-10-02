"use client";

import { useEffect } from "react";
import { reportarErro } from "@/lib/reportar-erro";

// Último recurso: renderiza o próprio documento (sem o CSS do site), por isso os estilos ficam aqui.
export default function ErroGlobal({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => reportarErro(error), [error]);

  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif", background: "#f4f4f2", color: "#141f1b" }}>
        <title>Dattis · Algo deu errado</title>
        <main style={{ maxWidth: 520, margin: "0 auto", padding: "18vh 20px", textAlign: "center" }}>
          <p style={{ fontSize: 22, fontWeight: 700, color: "#002820" }}>dattis</p>
          <h1 style={{ fontSize: 28, lineHeight: 1.2, margin: "24px 0 12px" }}>Algo deu errado</h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#3d4a45" }}>
            A equipe da Dattis já foi avisada automaticamente.{error.digest ? ` Código: ${error.digest}.` : ""}
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{ marginTop: 20, padding: "12px 22px", borderRadius: 999, border: 0, background: "#002820", color: "#fff", fontSize: 15, cursor: "pointer" }}
          >
            Tentar de novo
          </button>
        </main>
      </body>
    </html>
  );
}
