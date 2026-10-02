import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, contasCliente, type ConfigCookies } from "@/lib/db/schema";
import { SITE_URL } from "@/lib/site";

// Quem é o dono de um token de aviso de cookies: a própria Dattis, uma agência ou uma conta de cliente.

export const TOKEN_DATTIS = "dattis";

// No site da Dattis o aviso não aparece na área logada nem nas páginas que a Dattis hospeda para clientes.
export const IGNORAR_DATTIS = ["/painel", "/admin", "/assinar", "/dat", "/p"];

export type DonoCookies = {
  tipo: "dattis" | "agencia" | "conta";
  agenciaId: string | null;
  contaId: string | null;
  config: ConfigCookies | null;
  politicaPadrao: string | null;
  ignorar: string[];
};

export async function donoDoToken(token: string): Promise<DonoCookies | null> {
  if (token === TOKEN_DATTIS) {
    return { tipo: "dattis", agenciaId: null, contaId: null, config: { flutuante: false }, politicaPadrao: `${SITE_URL}/privacidade`, ignorar: IGNORAR_DATTIS };
  }
  if (token.length < 20) return null;

  const ag = await db.query.agencias.findFirst({ where: eq(agencias.cookiesToken, token) });
  if (ag) {
    if (ag.suspensa || ag.plano === "start") return null;
    return {
      tipo: "agencia",
      agenciaId: ag.id,
      contaId: null,
      config: ag.cookiesConfig ?? null,
      politicaPadrao: ag.politicaPublicadaEm && ag.slug ? `${SITE_URL}/p/${ag.slug}/privacidade` : null,
      ignorar: [],
    };
  }
  const conta = await db.query.contasCliente.findFirst({ where: eq(contasCliente.cookiesToken, token) });
  if (!conta) return null;
  const dona = await db.query.agencias.findFirst({ where: eq(agencias.id, conta.agenciaId), columns: { suspensa: true, plano: true } });
  if (!dona || dona.suspensa || dona.plano === "start") return null;
  return {
    tipo: "conta",
    agenciaId: conta.agenciaId,
    contaId: conta.id,
    config: conta.cookiesConfig ?? null,
    politicaPadrao: conta.politicaPublicadaEm && conta.slug ? `${SITE_URL}/p/${conta.slug}/privacidade` : null,
    ignorar: [],
  };
}
