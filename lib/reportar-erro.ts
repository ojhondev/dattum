/** Manda um erro do navegador para /api/erros (sem travar a tela se falhar). */
export function reportarErro(error: Error & { digest?: string }) {
  try {
    const corpo = JSON.stringify({ mensagem: error.message, digest: error.digest, pilha: error.stack?.slice(0, 3000), rota: location.pathname });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/erros", new Blob([corpo], { type: "application/json" }));
    else fetch("/api/erros", { method: "POST", body: corpo, headers: { "Content-Type": "application/json" }, keepalive: true });
  } catch {}
}
