import { NextResponse } from "next/server";
import fs from "node:fs";
import chromium from "@sparticuz/chromium";
import puppeteer, { type Browser } from "puppeteer-core";

export const runtime = "nodejs";
export const maxDuration = 45;

type CheckKind = "tracker" | "capture" | "consent" | "policy" | "security";

type CheckResult = {
  id: string;
  label: string;
  kind: CheckKind;
  triggered: boolean;
  weight: number;
  detail: string;
  article?: string;
  fix: string[];
};

const NAV_TIMEOUT_MS = 20000;
const SETTLE_MS = 1800; // extra wait for tags that fire after load (GTM containers, delayed scripts)

function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h === "0.0.0.0" || h === "::1") return true;
  if (/^127\./.test(h)) return true;
  if (/^10\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true;
  if (!h.includes(".")) return true;
  return false;
}

function normalizeUrl(input: string): URL | null {
  let raw = input.trim();
  if (!raw) return null;
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u;
  } catch {
    return null;
  }
}

async function resolveExecutablePath(): Promise<string> {
  const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  if (!isServerless) {
    const candidates = [
      process.env.CHROME_PATH,
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium-browser",
      "/usr/bin/chromium",
    ].filter((c): c is string => !!c);
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  }
  return chromium.executablePath();
}

function hostEndsWith(hosts: Set<string>, suffixes: string[]): boolean {
  for (const h of hosts) {
    for (const s of suffixes) {
      if (h === s || h.endsWith(`.${s}`)) return true;
    }
  }
  return false;
}

function levelFor(pct: number) {
  if (pct <= 25) return { label: "Baixo", tone: "green" as const };
  if (pct <= 50) return { label: "Médio", tone: "orange" as const };
  if (pct <= 75) return { label: "Alto", tone: "orange-deep" as const };
  return { label: "Crítico", tone: "red" as const };
}

const CONSENT_FIX = [
  "Instale um gerenciador de consentimento (CMP) — Cookiebot e OneTrust têm plano de entrada gratuito/barato, ou construa um banner próprio com Google Consent Mode.",
  "Bloqueie TODOS os pixels/scripts de rastreamento até o aceite — mostrar o banner não basta, ele precisa impedir o disparo antes do clique.",
  "Deixe a opção de recusar tão visível e fácil quanto a de aceitar.",
];

export async function POST(req: Request) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const target = normalizeUrl(body.url ?? "");
  if (!target) {
    return NextResponse.json({ ok: false, error: "URL inválida. Confira o endereço e tente de novo." }, { status: 400 });
  }
  if (isBlockedHost(target.hostname)) {
    return NextResponse.json({ ok: false, error: "Esse endereço não pode ser analisado." }, { status: 400 });
  }

  let browser: Browser | null = null;
  const requestHosts = new Set<string>();
  let finalUrl = target.toString();
  let usedHttps = target.protocol === "https:";
  let cookieNames: string[] = [];
  let hasConsentDom = false;
  let hasPrivacyLinkDom = false;
  let hasFormCaptureDom = false;

  try {
    const executablePath = await resolveExecutablePath();
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1280, height: 900 },
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (compatible; DattisAuditBot/2.0; +https://dattum-rho.vercel.app/auditoria)"
    );

    page.on("request", (r) => {
      try {
        requestHosts.add(new URL(r.url()).hostname.toLowerCase());
      } catch {
        // ignore malformed request URLs
      }
    });

    await page.goto(target.toString(), { waitUntil: "networkidle2", timeout: NAV_TIMEOUT_MS });
    await new Promise((resolve) => setTimeout(resolve, SETTLE_MS));

    finalUrl = page.url();
    usedHttps = finalUrl.startsWith("https:");

    const client = await page.createCDPSession();
    try {
      const { cookies } = (await client.send("Network.getAllCookies")) as { cookies: { name: string }[] };
      cookieNames = cookies.map((c) => c.name);
    } catch {
      cookieNames = [];
    }

    hasConsentDom = await page.evaluate(() => {
      const text = document.body?.innerText?.toLowerCase() ?? "";
      if (/aceitar\s+(os\s+)?cookies|política\s+de\s+cookies|gerenciar\s+cookies/.test(text)) return true;
      const selectors = [
        "#cookiebot",
        "#onetrust-banner-sdk",
        "#CybotCookiebotDialog",
        "[class*='cookie-consent' i]",
        "[id*='cookie-consent' i]",
        "[class*='cookie-banner' i]",
        "[id*='cookie-banner' i]",
      ];
      return selectors.some((s) => !!document.querySelector(s));
    });

    hasPrivacyLinkDom = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a"));
      return links.some((a) => {
        const href = (a.getAttribute("href") || "").toLowerCase();
        const text = (a.textContent || "").toLowerCase();
        return /privacidade|privacy-?policy/.test(href) || /pol[ií]tica\s+de\s+privacidade/.test(text);
      });
    });

    hasFormCaptureDom = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll("input"));
      return inputs.some((i) => {
        const type = (i.getAttribute("type") || "").toLowerCase();
        const name = (i.getAttribute("name") || "").toLowerCase();
        return type === "email" || type === "tel" || /email|telefone|phone|whatsapp/.test(name);
      });
    });

    await browser.close();
    browser = null;
  } catch (err) {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // ignore
      }
    }
    const message = err instanceof Error ? err.message : String(err);
    const timedOut = /timeout/i.test(message);
    return NextResponse.json(
      {
        ok: false,
        error: timedOut
          ? "O site demorou demais pra carregar num navegador real. Tenta de novo — sites muito pesados podem passar do limite."
          : "Não foi possível abrir esse site num navegador real agora (fora do ar, bloqueando o acesso, ou um erro no motor de varredura).",
      },
      { status: 200 }
    );
  }

  const metaPixel = hostEndsWith(requestHosts, ["facebook.com", "facebook.net"]);
  const gAnalytics = hostEndsWith(requestHosts, ["google-analytics.com", "googletagmanager.com", "analytics.google.com"]);
  const tiktokPixel = hostEndsWith(requestHosts, ["tiktok.com", "ibyteimg.com"]);
  const otherAds = hostEndsWith(requestHosts, ["licdn.com", "linkedin.com", "googleadservices.com", "googlesyndication.com", "doubleclick.net"]);
  const cmpRequest = hostEndsWith(requestHosts, ["cookiebot.com", "onetrust.com", "cookielaw.org", "usercentrics.eu", "termly.io"]);
  const chatWidget = hostEndsWith(requestHosts, ["intercom.io", "tawk.to", "crisp.chat", "zdassets.com", "zendesk.com"]);

  const trackerCookieHit = cookieNames.some((n) => /^_fbp$|^_fbc$|^_ga|^_gid$|^_gac_|^_ttp$|^bcookie$|^li_sugr$/i.test(n));

  const findings: CheckResult[] = [
    {
      id: "meta-pixel",
      label: "Pixel do Meta (Facebook/Instagram)",
      kind: "tracker",
      triggered: metaPixel,
      weight: 2,
      detail: metaPixel
        ? `Confirmado por requisição de rede real ao carregar a página${trackerCookieHit ? ", e cookie de rastreamento (_fbp/_fbc) foi definido no navegador" : ""}.`
        : "Nenhuma requisição pro Meta encontrada durante o carregamento real da página.",
      article: "art. 5º VII, art. 7º",
      fix: [
        "Instale um CMP e configure o Pixel do Meta pra só carregar depois que o visitante aceitar cookies de marketing (Consent Mode ou gate manual no Gerenciador de Tags).",
        "Documente a base legal desse tratamento na política de privacidade (normalmente consentimento, art. 7º, I).",
      ],
    },
    {
      id: "google-analytics",
      label: "Google Analytics / Google Tag Manager",
      kind: "tracker",
      triggered: gAnalytics,
      weight: 2,
      detail: gAnalytics
        ? "Confirmado por requisição de rede real ao carregar a página."
        : "Nenhuma requisição pro Google Analytics/GTM encontrada durante o carregamento real da página.",
      article: "art. 5º VII, art. 7º",
      fix: [
        "Ative o Google Consent Mode v2 no Tag Manager — ele já segura os tags de analytics até haver consentimento.",
        "Configure o banner pra atualizar o estado de consentimento (gtag('consent','update',...)) assim que o visitante aceitar.",
      ],
    },
    {
      id: "tiktok-pixel",
      label: "Pixel do TikTok",
      kind: "tracker",
      triggered: tiktokPixel,
      weight: 2,
      detail: tiktokPixel
        ? "Confirmado por requisição de rede real ao carregar a página."
        : "Nenhuma requisição pro TikTok encontrada durante o carregamento real da página.",
      article: "art. 5º VII, art. 7º",
      fix: [
        "Segure o carregamento do TikTok Pixel até haver consentimento de marketing, igual aos outros pixels.",
        "Se usar a TikTok Events API (server-side), documente a base legal e o hashing do dado enviado.",
      ],
    },
    {
      id: "other-ads",
      label: "Outras tags de anúncio (LinkedIn Insight, Google Ads)",
      kind: "tracker",
      triggered: otherAds,
      weight: 1,
      detail: otherAds
        ? "Encontrada pelo menos uma requisição real a uma dessas plataformas de anúncio."
        : "Nenhuma requisição adicional de anúncio encontrada.",
      article: "art. 5º VII, art. 7º",
      fix: [
        "Liste todas as tags ativas no Gerenciador de Tags e submeta cada uma ao mesmo gate de consentimento.",
        "Remova tags de plataformas que não são mais usadas — cada uma é um subprocessador a mais pra documentar.",
      ],
    },
    {
      id: "form-capture",
      label: "Formulário capturando dado pessoal (e-mail/telefone)",
      kind: "capture",
      triggered: hasFormCaptureDom,
      weight: 2,
      detail: hasFormCaptureDom
        ? "Encontrado campo de e-mail ou telefone renderizado na página — cada envio é tratamento de dado pessoal."
        : "Nenhum campo de e-mail/telefone encontrado nos formulários renderizados.",
      article: "art. 5º X, art. 6º",
      fix: [
        "Adicione uma caixa de consentimento explícita perto do campo, com link pra política de privacidade.",
        "Deixe clara a finalidade da coleta no próprio formulário (art. 6º) e garanta um canal real pra pedido de exclusão depois.",
      ],
    },
    {
      id: "chat-widget",
      label: "Chat/widget de atendimento",
      kind: "capture",
      triggered: chatWidget,
      weight: 1,
      detail: chatWidget
        ? "Confirmado por requisição de rede real a um widget de chat conhecido — normalmente registra nome, e-mail e histórico."
        : "Nenhum widget de chat conhecido encontrado.",
      article: "art. 5º X",
      fix: [
        "Confira se o widget (Intercom, Crisp etc.) tem a opção de aviso/consentimento — geralmente existe mas vem desligada.",
        "Inclua o widget na lista de subprocessadores da política de privacidade.",
      ],
    },
    {
      id: "cookie-consent",
      label: "Banner de consentimento de cookies",
      kind: "consent",
      triggered: !(cmpRequest || hasConsentDom),
      weight: 3,
      detail:
        cmpRequest || hasConsentDom
          ? "Foi encontrado um gerenciador de consentimento (CMP) ou banner de cookies na página renderizada."
          : "Nenhum CMP nem banner de cookies encontrado na página renderizada — os rastreadores acima, se existirem, disparam antes de qualquer aceite.",
      article: "art. 7º, art. 8º",
      fix: CONSENT_FIX,
    },
    {
      id: "privacy-policy",
      label: "Link para política de privacidade",
      kind: "policy",
      triggered: !hasPrivacyLinkDom,
      weight: 2,
      detail: hasPrivacyLinkDom
        ? "Foi encontrado um link pra política de privacidade na página renderizada."
        : "Nenhum link pra política de privacidade encontrado na página renderizada.",
      article: "art. 9º",
      fix: [
        "Publique uma política cobrindo: que dado é coletado, pra quê, quem mais acessa, por quanto tempo fica guardado, e como exercer os direitos do art. 18.",
        "Linke a política no rodapé de todas as páginas, e inclua o contato do encarregado (DPO) — obrigatório pelo art. 41.",
      ],
    },
    {
      id: "https",
      label: "Conexão segura (HTTPS)",
      kind: "security",
      triggered: !usedHttps,
      weight: 1,
      detail: usedHttps ? "O site responde via HTTPS." : "O site carregou via HTTP — dado trafega sem criptografia de transporte.",
      article: "art. 46",
      fix: [
        "Instale um certificado SSL (Let's Encrypt gratuito na maioria dos hosts, ou use um CDN como Cloudflare).",
        "Force o redirecionamento de HTTP pra HTTPS em todas as páginas.",
      ],
    },
  ];

  const maxWeight = findings.reduce((sum, f) => sum + f.weight, 0);
  const points = findings.reduce((sum, f) => sum + (f.triggered ? f.weight : 0), 0);
  const pct = maxWeight > 0 ? Math.round((points / maxWeight) * 100) : 0;
  const level = levelFor(pct);

  const trackersFound = findings.filter((f) => f.kind === "tracker" && f.triggered);
  const captureFound = findings.filter((f) => f.kind === "capture" && f.triggered);
  const noConsent = findings.find((f) => f.id === "cookie-consent")?.triggered ?? false;
  const noPolicy = findings.find((f) => f.id === "privacy-policy")?.triggered ?? false;

  const risks: { title: string; detail: string }[] = [];
  if ((trackersFound.length > 0 || captureFound.length > 0) && noConsent) {
    risks.push({
      title: "Risco de vazamento de dados por rastreamento sem base legal",
      detail:
        "A varredura com navegador real confirmou pontos de coleta de dado pessoal disparando sem nenhum mecanismo de consentimento — o dado do visitante pode estar sendo enviado a terceiros (Meta, Google, TikTok) antes de qualquer aceite.",
    });
  }
  if (trackersFound.length > 0 || captureFound.length > 0) {
    risks.push({
      title: "Risco de multa da ANPD",
      detail:
        "A LGPD (art. 52) prevê multa de até 2% do faturamento, limitada a R$50 milhões por infração. Tratamento de dado sem base legal documentada é uma das causas mais comuns de autuação.",
    });
  }
  if (noPolicy) {
    risks.push({
      title: "Risco por falta de transparência",
      detail:
        "Sem política de privacidade visível, o site não informa ao titular o que é feito com o dado dele — quebra direta do direito à informação (art. 9º).",
    });
  }
  if (risks.length === 0) {
    risks.push({
      title: "Nenhum risco crítico encontrado nesta varredura",
      detail:
        "A varredura com navegador real não encontrou rastreador nem formulário de captura disparando sem consentimento. Isso não é uma auditoria jurídica completa — não avalia backend, contratos nem retenção real de dado.",
    });
  }

  return NextResponse.json({
    ok: true,
    url: finalUrl,
    https: usedHttps,
    findings,
    score: pct,
    level,
    risks,
  });
}
