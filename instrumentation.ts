import type { Instrumentation } from "next";

// Erros do servidor (páginas, APIs, ações) vão para a tabela de erros, visível no admin em "Sistema".
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { registrarErro } = await import("@/lib/erros");
  const e = err as Error & { digest?: string };
  await registrarErro({
    tipo: "servidor",
    mensagem: e?.message ?? String(err),
    rota: request.path,
    metodo: `${request.method} · ${context.routeType}`,
    digest: e?.digest ?? null,
    pilha: e?.stack ?? null,
  });
};
