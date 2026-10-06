// Segredo que assina as sessões (agência e admin) e os hashes de IP.
// Em produção na Vercel, sem SESSION_SECRET o site recusa logins em vez de cair num valor conhecido:
// com o valor de desenvolvimento, qualquer pessoa conseguiria forjar uma sessão.
const DEV = "dattis-dev-secret-troque-em-producao";

export function segredoBase(): string {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  if (process.env.VERCEL_ENV === "production") throw new Error("SESSION_SECRET não configurado na Vercel.");
  return DEV;
}

/** Chave de assinatura por uso: o admin tem chave própria, então um token de agência nunca vale como admin. */
export function chaveDe(uso: "sessao" | "admin") {
  const base = segredoBase();
  return new TextEncoder().encode(uso === "sessao" ? base : `${base}:${uso}`);
}
