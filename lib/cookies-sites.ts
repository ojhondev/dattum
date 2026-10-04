import { and, desc, eq, isNull, lt, or } from "drizzle-orm";
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

const HOSTS_DATTIS = new Set([new URL(SITE_URL).host, "dattis.com.br", "www.dattis.com.br", "dattum-rho.vercel.app", "localhost:3012"]);
const SEIS_HORAS = 6 * 3_600_000;

/**
 * Marca que o aviso de cookies foi visto funcionando num site de verdade (o site carregou o script
 * ou um visitante fez uma escolha). Ignora páginas da própria Dattis (prévias e instruções).
 * Grava no máximo a cada 6 horas por token, para não escrever a cada visita.
 */
export async function registrarDeteccao(token: string, url: string | null | undefined) {
  if (!url || token === TOKEN_DATTIS || token.length < 20) return;
  let pagina: URL;
  try {
    pagina = new URL(url);
  } catch {
    return;
  }
  if (!/^https?:$/.test(pagina.protocol) || HOSTS_DATTIS.has(pagina.host)) return;
  const valor = { cookiesDetectadoEm: new Date(), cookiesDetectadoUrl: `${pagina.origin}${pagina.pathname}`.slice(0, 300) };
  const antigo = new Date(Date.now() - SEIS_HORAS);
  const quando = (col: typeof contasCliente.cookiesDetectadoEm | typeof agencias.cookiesDetectadoEm) => or(isNull(col), lt(col, antigo));
  await Promise.all([
    db.update(contasCliente).set(valor).where(and(eq(contasCliente.cookiesToken, token), quando(contasCliente.cookiesDetectadoEm))),
    db.update(agencias).set(valor).where(and(eq(agencias.cookiesToken, token), quando(agencias.cookiesDetectadoEm))),
  ]).catch((e) => console.error("[cookies-deteccao]", e));
}
