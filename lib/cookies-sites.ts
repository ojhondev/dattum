import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, certificados, contasCliente, type ConfigCookies } from "@/lib/db/schema";
import { statusCertificado } from "@/lib/certificados";
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
  selo: { texto: string; url: string | null };
};

const SELO_BASE = { texto: "Consentimento coletado conforme a LGPD", url: null };

/** Só afirma conformidade verificada quando o certificado da Dattis está válido e em dia. */
async function seloDe(agenciaId: string, contaId: string | null) {
  const cert = await db.query.certificados.findFirst({
    where: and(eq(certificados.agenciaId, agenciaId), eq(certificados.revogado, false), contaId ? eq(certificados.contaClienteId, contaId) : isNull(certificados.contaClienteId)),
    orderBy: desc(certificados.validoAte),
  });
  if (!cert) return SELO_BASE;
  const st = await statusCertificado(cert).catch(() => null);
  return st?.emDia ? { texto: "Site com conformidade LGPD verificada", url: `${SITE_URL}/verificar/${cert.codigo}` } : SELO_BASE;
}

export async function donoDoToken(token: string): Promise<DonoCookies | null> {
  if (token === TOKEN_DATTIS) {
    return {
      tipo: "dattis",
      agenciaId: null,
      contaId: null,
      config: { flutuante: false },
      politicaPadrao: `${SITE_URL}/privacidade`,
      ignorar: IGNORAR_DATTIS,
      selo: { texto: "Site em conformidade com a LGPD", url: `${SITE_URL}/privacidade` },
    };
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
      selo: await seloDe(ag.id, null),
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
    selo: await seloDe(conta.agenciaId, conta.id),
  };
}
