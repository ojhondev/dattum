import tls from "node:tls";
import dns from "node:dns/promises";
import net from "node:net";
import { and, count, eq, lt, desc, isNull, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  agencias,
  contasCliente,
  atividadesTratamento,
  contaSubprocessadores,
  dpas,
  certificados,
  varreduras,
  varreduraResultados,
} from "@/lib/db/schema";
import { contarSeveridades, notaDosAchados, type Achado } from "@/lib/vigilancia-tipos";

const UA = "Mozilla/5.0 (compatible; DattisVigilancia/1.0; +https://dattum-rho.vercel.app)";
const TIMEOUT_MS = 12_000;
const LIMITE_HTML = 1_500_000;
const PARALELO = 6;
const RETENCAO_DIAS = 90;

// ---------- Rede (com bloqueio de endereço interno) ----------

function ipPrivado(ip: string) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
  }
  const v = ip.toLowerCase();
  return v === "::1" || v === "::" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80") || v.startsWith("::ffff:127.") || v.startsWith("::ffff:10.") || v.startsWith("::ffff:192.168.");
}

async function hostPublico(hostname: string) {
  const h = hostname.toLowerCase();
  if (h === "localhost" || !h.includes(".")) return false;
  if (net.isIP(h)) return !ipPrivado(h);
  try {
    const ips = await dns.lookup(h, { all: true });
    return ips.length > 0 && ips.every((r) => !ipPrivado(r.address));
  } catch {
    return false;
  }
}

async function buscar(url: URL, saltos = 0): Promise<{ res: Response; url: URL; cadeia: URL[] }> {
  if (!(await hostPublico(url.hostname))) throw new Error("host-bloqueado");
  const res = await fetch(url, {
    redirect: "manual",
    headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  const loc = res.headers.get("location");
  if (res.status >= 300 && res.status < 400 && loc && saltos < 5) {
    await res.body?.cancel();
    const prox = await buscar(new URL(loc, url), saltos + 1);
    return { ...prox, cadeia: [url, ...prox.cadeia] };
  }
  return { res, url, cadeia: [url] };
}

async function lerHtml(res: Response) {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const partes: Uint8Array[] = [];
  let total = 0;
  while (total < LIMITE_HTML) {
    const { done, value } = await reader.read();
    if (done) break;
    partes.push(value);
    total += value.length;
  }
  await reader.cancel().catch(() => {});
  return new TextDecoder().decode(Buffer.concat(partes));
}

function certificadoTls(host: string): Promise<{ validoAte: Date | null; confiavel: boolean } | null> {
  return new Promise((resolve) => {
    const s = tls.connect({ host, port: 443, servername: host, timeout: 8000, rejectUnauthorized: false }, () => {
      const c = s.getPeerCertificate();
      resolve({ validoAte: c?.valid_to ? new Date(c.valid_to) : null, confiavel: s.authorized });
      s.end();
    });
    s.on("error", () => resolve(null));
    s.on("timeout", () => {
      s.destroy();
      resolve(null);
    });
  });
}

// ---------- Checagens do site ----------

const RASTREADORES: { nome: string; re: RegExp }[] = [
  { nome: "Pixel do Meta", re: /connect\.facebook\.net|fbq\(\s*['"]init/i },
  { nome: "Tag do Google", re: /googletagmanager\.com|gtag\(\s*['"]config|google-analytics\.com/i },
  { nome: "Pixel do TikTok", re: /analytics\.tiktok\.com|ttq\.load/i },
  { nome: "Insight Tag do LinkedIn", re: /snap\.licdn\.com/i },
  { nome: "Hotjar / Clarity", re: /static\.hotjar\.com|clarity\.ms/i },
];

const CONSENTIMENTO =
  /cookiebot|onetrust|cookielaw\.org|usercentrics|termly|cookieyes|goadopt|adopt\.app|privacytools\.com\.br|lgpd-cookie|cookie-?consent|cookie-?banner|consentmanager|iubenda|complianz|klaro|gtag\(\s*['"]consent['"]\s*,\s*['"]default/i;

const POLITICA = /href=["'][^"']*(privacidade|privacy|politica-de-dados|lgpd)[^"']*["']|pol[ií]tica\s+de\s+privacidade/i;
const FORMULARIO = /<input[^>]+type=["']?(email|tel)|<input[^>]+name=["'][^"']*(email|telefone|phone|whatsapp|celular)/i;

const CABECALHOS: { nome: string; ok: (h: Headers) => boolean }[] = [
  { nome: "HSTS (força HTTPS)", ok: (h) => h.has("strict-transport-security") },
  { nome: "X-Content-Type-Options", ok: (h) => h.has("x-content-type-options") },
  { nome: "Proteção contra clickjacking", ok: (h) => h.has("x-frame-options") || /frame-ancestors/i.test(h.get("content-security-policy") ?? "") },
  { nome: "Referrer-Policy", ok: (h) => h.has("referrer-policy") },
];

export async function verificarSite(site: string, opts: { temCertificado: boolean }): Promise<Achado[]> {
  const achados: Achado[] = [];
  let alvo: URL;
  try {
    alvo = new URL(/^https?:\/\//i.test(site) ? site : `https://${site}`);
  } catch {
    return [{ codigo: "site-invalido", grupo: "site", severidade: "medio", titulo: "Endereço do site inválido", detalhe: `“${site}” não é um endereço válido.`, correcao: "Corrija o site no cadastro do cliente." }];
  }

  let res: Response, final: URL;
  try {
    ({ res, url: final } = await buscar(alvo));
  } catch (e) {
    const bloqueado = e instanceof Error && e.message === "host-bloqueado";
    return [
      {
        codigo: "site-fora",
        grupo: "site",
        severidade: "alto",
        titulo: bloqueado ? "Endereço não verificável" : "Site não respondeu",
        detalhe: bloqueado
          ? "O domínio não resolve pra um endereço público."
          : "O site não respondeu em 12 segundos ou recusou a conexão. Cliente sem site no ar perde venda e a verificação fica pendente.",
        correcao: "Confira se o domínio está certo e se o site está no ar.",
      },
    ];
  }

  if (res.status >= 400) {
    await res.body?.cancel();
    achados.push({
      codigo: "site-erro",
      grupo: "site",
      severidade: "alto",
      titulo: `Site respondeu com erro ${res.status}`,
      detalhe: "A página principal não carregou corretamente — as demais checagens ficaram incompletas.",
      correcao: "Verifique a hospedagem e o domínio do cliente.",
    });
    return achados;
  }

  const html = await lerHtml(res);
  const https = final.protocol === "https:";

  // HTTPS e certificado
  if (!https) {
    achados.push({
      codigo: "sem-https",
      grupo: "site",
      severidade: "critico",
      titulo: "Site sem HTTPS",
      detalhe: "Os dados digitados nos formulários trafegam sem criptografia e podem ser interceptados.",
      correcao: "Ative o certificado SSL (gratuito na maioria das hospedagens) e redirecione todo o tráfego pra https://.",
      artigo: "Art. 46",
    });
  } else {
    achados.push({ codigo: "https", grupo: "site", severidade: "ok", titulo: "HTTPS ativo", detalhe: "Conexão criptografada entre o visitante e o site." });
    const cert = await certificadoTls(final.hostname);
    if (cert?.validoAte) {
      const dias = Math.floor((cert.validoAte.getTime() - Date.now()) / 86_400_000);
      if (!cert.confiavel || dias < 0) {
        achados.push({
          codigo: "ssl-invalido",
          grupo: "site",
          severidade: "critico",
          titulo: dias < 0 ? "Certificado SSL vencido" : "Certificado SSL não confiável",
          detalhe: "O navegador mostra alerta de site inseguro pro visitante — e o anúncio perde conversão.",
          correcao: "Renove ou reemita o certificado na hospedagem.",
          artigo: "Art. 46",
        });
      } else if (dias <= 14) {
        achados.push({ codigo: "ssl-vencendo", grupo: "site", severidade: "alto", titulo: `Certificado SSL vence em ${dias} dia(s)`, detalhe: `Vence em ${cert.validoAte.toLocaleDateString("pt-BR")}.`, correcao: "Confirme a renovação automática na hospedagem." });
      } else if (dias <= 30) {
        achados.push({ codigo: "ssl-vencendo", grupo: "site", severidade: "medio", titulo: `Certificado SSL vence em ${dias} dias`, detalhe: `Vence em ${cert.validoAte.toLocaleDateString("pt-BR")}.`, correcao: "Confirme a renovação automática na hospedagem." });
      }
    }
    // http:// redireciona pra https://?
    try {
      const http = new URL(final.toString());
      http.protocol = "http:";
      http.pathname = "/";
      const { url: destino } = await buscar(http);
      if (destino.protocol !== "https:") {
        achados.push({ codigo: "http-sem-redirect", grupo: "site", severidade: "medio", titulo: "Versão http:// não redireciona pra https://", detalhe: "Quem digita o endereço sem https cai numa página sem criptografia.", correcao: "Configure o redirecionamento 301 de http pra https." });
      }
    } catch {
      /* porta 80 fechada: ok */
    }
    if (/<(script|img|iframe|link)[^>]+(src|href)=["']http:\/\//i.test(html)) {
      achados.push({ codigo: "conteudo-misto", grupo: "site", severidade: "medio", titulo: "Recursos carregados sem HTTPS", detalhe: "A página puxa scripts ou imagens por http://, o que quebra a criptografia.", correcao: "Troque os endereços http:// por https:// no tema/código do site." });
    }
  }

  // Cabeçalhos de segurança
  const faltando = CABECALHOS.filter((c) => !c.ok(res.headers)).map((c) => c.nome);
  if (faltando.length >= 2) {
    achados.push({
      codigo: "cabecalhos",
      grupo: "site",
      severidade: "medio",
      titulo: "Cabeçalhos de segurança ausentes",
      detalhe: `Faltando: ${faltando.join(", ")}.`,
      correcao: "Adicione os cabeçalhos na hospedagem ou CDN (Cloudflare resolve em poucos cliques).",
      artigo: "Art. 46",
    });
  } else {
    achados.push({ codigo: "cabecalhos", grupo: "site", severidade: "ok", titulo: "Cabeçalhos de segurança configurados", detalhe: faltando.length ? `Só falta: ${faltando[0]}.` : "Todos os principais presentes." });
  }

  // Pixel x consentimento
  const rastreadores = RASTREADORES.filter((r) => r.re.test(html)).map((r) => r.nome);
  const temConsentimento = CONSENTIMENTO.test(html);
  if (rastreadores.length > 0 && !temConsentimento) {
    achados.push({
      codigo: "pixel-sem-consentimento",
      grupo: "site",
      severidade: "critico",
      titulo: "Pixel sem banner de consentimento",
      detalhe: `Encontramos ${rastreadores.join(", ")} no código da página e nenhuma ferramenta de consentimento de cookies.`,
      correcao: "Instale um banner de cookies que bloqueie o pixel até o aceite (ou ative o Modo de Consentimento do Google).",
      artigo: "Art. 7º, I e 8º",
    });
  } else if (rastreadores.length > 0) {
    achados.push({ codigo: "pixel-sem-consentimento", grupo: "site", severidade: "ok", titulo: "Banner de consentimento encontrado", detalhe: `Rastreadores na página: ${rastreadores.join(", ")}.` });
  }

  // Política de privacidade e formulários
  const temPolitica = POLITICA.test(html);
  const temFormulario = FORMULARIO.test(html);
  if (!temPolitica) {
    achados.push({
      codigo: "sem-politica",
      grupo: "site",
      severidade: temFormulario ? "critico" : "alto",
      titulo: temFormulario ? "Formulário captando dado sem política de privacidade" : "Sem link pra política de privacidade",
      detalhe: temFormulario
        ? "A página pede e-mail ou telefone e não linka a política de privacidade. O lead não sabe pra que o dado vai ser usado."
        : "Não encontramos link pra política de privacidade na página principal.",
      correcao: "Publique a política de privacidade e coloque o link no rodapé e ao lado de cada formulário.",
      artigo: "Art. 9º",
    });
  } else {
    achados.push({ codigo: "sem-politica", grupo: "site", severidade: "ok", titulo: "Política de privacidade linkada", detalhe: "Link encontrado na página principal." });
  }

  if (opts.temCertificado && !/\/selo\/DTS-/i.test(html)) {
    achados.push({ codigo: "selo-ausente", grupo: "site", severidade: "medio", titulo: "Selo Dattis não está no site", detalhe: "O certificado foi emitido, mas o selo não aparece na página principal.", correcao: "Cole o código do selo no rodapé (Certificados e selo → Copiar código)." });
  }

  return achados;
}

// ---------- Checagens de documentação ----------

export function verificarDocumentacao(d: {
  site: string | null;
  dpaStatus: string | null;
  atividades: number;
  ferramentas: number;
  certificado: { validoAte: Date; revogado: boolean } | null;
}): Achado[] {
  const achados: Achado[] = [];
  if (d.dpaStatus !== "assinado") {
    achados.push({
      codigo: "dpa-pendente",
      grupo: "documentacao",
      severidade: "alto",
      titulo: "Contrato com o cliente não assinado",
      detalhe: "Sem o contrato de operador (DPA) assinado, não há prova de que a agência seguia as instruções do cliente.",
      correcao: "Abra a conta e colete a assinatura do responsável.",
      artigo: "Art. 39",
    });
  } else {
    achados.push({ codigo: "dpa-pendente", grupo: "documentacao", severidade: "ok", titulo: "Contrato assinado", detalhe: "Contrato de operador vigente." });
  }
  if (d.atividades === 0) {
    achados.push({ codigo: "rat-vazio", grupo: "documentacao", severidade: "alto", titulo: "Nenhuma atividade registrada", detalhe: "O registro do que vocês fazem com o dado do cliente está vazio.", correcao: "Adicione as atividades (lista de clientes, pixel, formulário, WhatsApp...).", artigo: "Art. 37" });
  } else {
    achados.push({ codigo: "rat-vazio", grupo: "documentacao", severidade: "ok", titulo: `${d.atividades} atividade(s) registrada(s)`, detalhe: "Registro de tratamento em dia." });
  }
  if (d.ferramentas === 0) {
    achados.push({ codigo: "sem-ferramentas", grupo: "documentacao", severidade: "medio", titulo: "Nenhuma ferramenta mapeada", detalhe: "Não há registro de quem mais mexe no dado (Meta, Google, CRM...).", correcao: "Vincule as ferramentas usadas na conta." });
  }
  if (d.certificado) {
    const dias = Math.floor((d.certificado.validoAte.getTime() - Date.now()) / 86_400_000);
    if (d.certificado.revogado || dias < 0) {
      achados.push({ codigo: "certificado", grupo: "documentacao", severidade: "alto", titulo: "Certificado de privacidade inválido", detalhe: "O selo no site do cliente mostra “certificado inválido” pra quem verifica.", correcao: "Emita um novo certificado em Certificados e selo." });
    } else if (dias <= 30) {
      achados.push({ codigo: "certificado", grupo: "documentacao", severidade: "medio", titulo: `Certificado vence em ${dias} dia(s)`, detalhe: "Renove antes que o selo passe a mostrar pendência.", correcao: "Emita a renovação em Certificados e selo." });
    }
  }
  if (!d.site) {
    achados.push({ codigo: "sem-site", grupo: "documentacao", severidade: "medio", titulo: "Site do cliente não cadastrado", detalhe: "Sem o site, a vigilância diária não consegue checar pixel, HTTPS e política de privacidade.", correcao: "Informe o site na página da conta." });
  }
  return achados;
}

// ---------- Execução ----------

async function emParalelo<T>(itens: T[], limite: number, fn: (item: T) => Promise<void>) {
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limite, itens.length) }, async () => {
      while (i < itens.length) await fn(itens[i++]);
    }),
  );
}

type Alvo = {
  agenciaId: string;
  contaClienteId: string | null;
  titular: string;
  site: string | null;
  doc: Parameters<typeof verificarDocumentacao>[0] | null;
  temCertificado: boolean;
  checarSite: boolean; // plano Start: só documentação
};

/** Roda a vigilância. Sem filtro = todas as agências (cron diário e botão do admin). */
export async function executarVarredura(params: { origem: "cron" | "manual" | "agencia"; agenciaId?: string; contaId?: string }) {
  const [varredura] = await db.insert(varreduras).values({ origem: params.origem }).returning();

  try {
    const filtroConta = params.contaId
      ? eq(contasCliente.id, params.contaId)
      : params.agenciaId
        ? eq(contasCliente.agenciaId, params.agenciaId)
        : undefined;

    const contas = await db.select().from(contasCliente).where(filtroConta);
    const ids = contas.map((c) => c.id);

    const [dpasRows, ratRows, subRows, certRows] = await Promise.all([
      ids.length ? db.select({ conta: dpas.contaClienteId, status: dpas.status }).from(dpas).where(inArray(dpas.contaClienteId, ids)) : [],
      ids.length
        ? db.select({ conta: atividadesTratamento.contaClienteId, n: count() }).from(atividadesTratamento).where(inArray(atividadesTratamento.contaClienteId, ids)).groupBy(atividadesTratamento.contaClienteId)
        : [],
      ids.length
        ? db.select({ conta: contaSubprocessadores.contaClienteId, n: count() }).from(contaSubprocessadores).where(and(inArray(contaSubprocessadores.contaClienteId, ids), eq(contaSubprocessadores.ativo, true))).groupBy(contaSubprocessadores.contaClienteId)
        : [],
      db
        .select()
        .from(certificados)
        .where(params.contaId ? eq(certificados.contaClienteId, params.contaId) : params.agenciaId ? eq(certificados.agenciaId, params.agenciaId) : undefined)
        .orderBy(desc(certificados.emitidoEm)),
    ]);

    const agIdsContas = [...new Set(contas.map((c) => c.agenciaId))];
    const planoPor = new Map(
      (agIdsContas.length ? await db.select({ id: agencias.id, plano: agencias.plano }).from(agencias).where(inArray(agencias.id, agIdsContas)) : []).map((a) => [a.id, a.plano]),
    );
    const dpaPor = new Map(dpasRows.map((d) => [d.conta, d.status]));
    const ratPor = new Map(ratRows.map((r) => [r.conta, Number(r.n)]));
    const subPor = new Map(subRows.map((r) => [r.conta, Number(r.n)]));
    const certPor = new Map<string, (typeof certRows)[number]>();
    for (const c of certRows) if (c.contaClienteId && !certPor.has(c.contaClienteId)) certPor.set(c.contaClienteId, c);

    const alvos: Alvo[] = contas.map((c) => {
      const cert = certPor.get(c.id) ?? null;
      const site = c.site ?? (cert?.dominio ? `https://${cert.dominio}` : null);
      return {
        agenciaId: c.agenciaId,
        contaClienteId: c.id,
        titular: c.nome,
        site,
        temCertificado: !!cert && !cert.revogado,
        checarSite: planoPor.get(c.agenciaId) !== "start",
        doc: {
          site,
          dpaStatus: dpaPor.get(c.id) ?? null,
          atividades: ratPor.get(c.id) ?? 0,
          ferramentas: subPor.get(c.id) ?? 0,
          certificado: cert ? { validoAte: cert.validoAte, revogado: cert.revogado } : null,
        },
      };
    });

    // Site da própria agência (certificado de agência com domínio)
    if (!params.contaId) {
      const vistos = new Set<string>();
      const certsAgencia = certRows.filter((c) => !c.contaClienteId && c.dominio && !c.revogado);
      const agIds = [...new Set(certsAgencia.map((c) => c.agenciaId))];
      const nomes = new Map(
        (agIds.length ? await db.select({ id: agencias.id, nome: agencias.nome }).from(agencias).where(inArray(agencias.id, agIds)) : []).map((a) => [a.id, a.nome]),
      );
      for (const c of certsAgencia) {
        if (c.contaClienteId || !c.dominio || c.revogado || vistos.has(c.agenciaId + c.dominio)) continue;
        vistos.add(c.agenciaId + c.dominio);
        alvos.push({ agenciaId: c.agenciaId, contaClienteId: null, titular: nomes.get(c.agenciaId) ?? c.titular, site: `https://${c.dominio}`, doc: null, temCertificado: true, checarSite: true });
      }
    }

    let totais = { criticos: 0, altos: 0, medios: 0 };
    await emParalelo(alvos, PARALELO, async (a) => {
      const achados: Achado[] = [];
      if (a.doc) achados.push(...verificarDocumentacao(a.doc));
      if (a.site && a.checarSite) {
        try {
          achados.push(...(await verificarSite(a.site, { temCertificado: a.temCertificado })));
        } catch {
          achados.push({ codigo: "site-fora", grupo: "site", severidade: "alto", titulo: "Falha ao verificar o site", detalhe: "A verificação foi interrompida. Será repetida na próxima varredura." });
        }
      }
      const c = contarSeveridades(achados);
      totais = { criticos: totais.criticos + c.criticos, altos: totais.altos + c.altos, medios: totais.medios + c.medios };
      await db.insert(varreduraResultados).values({
        varreduraId: varredura.id,
        agenciaId: a.agenciaId,
        contaClienteId: a.contaClienteId,
        titular: a.titular,
        alvo: a.site,
        nota: notaDosAchados(achados),
        ...c,
        achados,
      });
    });

    const [fim] = await db
      .update(varreduras)
      .set({ status: "concluida", alvos: alvos.length, ...totais, finalizadaEm: new Date() })
      .where(eq(varreduras.id, varredura.id))
      .returning();

    if (params.origem === "cron") {
      await db.delete(varreduras).where(lt(varreduras.iniciadaEm, new Date(Date.now() - RETENCAO_DIAS * 86_400_000)));
    }
    return fim;
  } catch (e) {
    await db
      .update(varreduras)
      .set({ status: "falhou", erro: e instanceof Error ? e.message.slice(0, 500) : "erro", finalizadaEm: new Date() })
      .where(eq(varreduras.id, varredura.id));
    throw e;
  }
}

/** Último resultado de cada alvo (conta ou site da agência). */
export async function ultimosResultados(agenciaId?: string) {
  const rows = await db
    .selectDistinctOn([varreduraResultados.agenciaId, varreduraResultados.contaClienteId, varreduraResultados.alvo])
    .from(varreduraResultados)
    .where(agenciaId ? eq(varreduraResultados.agenciaId, agenciaId) : undefined)
    .orderBy(varreduraResultados.agenciaId, varreduraResultados.contaClienteId, varreduraResultados.alvo, desc(varreduraResultados.verificadoEm));
  // Uma conta pode ter mudado de site: fica só o resultado mais recente por conta.
  const porConta = new Map<string, (typeof rows)[number]>();
  for (const r of rows) {
    const k = r.contaClienteId ?? `agencia:${r.agenciaId}:${r.alvo}`;
    const atual = porConta.get(k);
    if (!atual || atual.verificadoEm < r.verificadoEm) porConta.set(k, r);
  }
  return [...porConta.values()];
}

export async function ultimaVarredura() {
  return db.query.varreduras.findFirst({ where: isNull(varreduras.erro), orderBy: desc(varreduras.iniciadaEm) });
}
