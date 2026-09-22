import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 15;

type CheckKind = "tracker" | "capture" | "consent" | "policy" | "security";

type CheckResult = {
  id: string;
  label: string;
  kind: CheckKind;
  triggered: boolean;
  weight: number;
  detail: string;
  article?: string;
};

const MAX_BYTES = 3_000_000; // 3MB cap on the fetched HTML
const FETCH_TIMEOUT_MS = 9000;

function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h === "0.0.0.0" || h === "::1") return true;
  if (/^127\./.test(h)) return true;
  if (/^10\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true;
  if (!h.includes(".")) return true; // no bare hostnames (internal service names)
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

function hasMatch(html: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(html));
}

function runChecks(html: string, usedHttps: boolean): CheckResult[] {
  const results: CheckResult[] = [];

  const metaPixel = hasMatch(html, [/fbq\s*\(/i, /connect\.facebook\.net\/[^"']+\/fbevents\.js/i]);
  results.push({
    id: "meta-pixel",
    label: "Pixel do Meta (Facebook/Instagram)",
    kind: "tracker",
    triggered: metaPixel,
    weight: 2,
    detail: metaPixel
      ? "Encontrado no código-fonte. Cada visita ao site é enviada ao Meta como evento de rastreamento."
      : "Não encontrado no HTML público da página.",
    article: "art. 5º VII, art. 7º",
  });

  const gAnalytics = hasMatch(html, [/gtag\s*\(/i, /googletagmanager\.com/i, /google-analytics\.com/i]);
  results.push({
    id: "google-analytics",
    label: "Google Analytics / Google Tag Manager",
    kind: "tracker",
    triggered: gAnalytics,
    weight: 2,
    detail: gAnalytics
      ? "Encontrado no código-fonte. Coleta comportamento de navegação de cada visitante."
      : "Não encontrado no HTML público da página.",
    article: "art. 5º VII, art. 7º",
  });

  const tiktokPixel = hasMatch(html, [/ttq\.load/i, /analytics\.tiktok\.com/i]);
  results.push({
    id: "tiktok-pixel",
    label: "Pixel do TikTok",
    kind: "tracker",
    triggered: tiktokPixel,
    weight: 2,
    detail: tiktokPixel
      ? "Encontrado no código-fonte. Envia eventos de navegação ao TikTok Ads."
      : "Não encontrado no HTML público da página.",
    article: "art. 5º VII, art. 7º",
  });

  const otherAds = hasMatch(html, [/snap\.licdn\.com/i, /googleadservices\.com/i, /px\.ads\.linkedin\.com/i]);
  results.push({
    id: "other-ads",
    label: "Outras tags de anúncio (LinkedIn Insight, Google Ads)",
    kind: "tracker",
    triggered: otherAds,
    weight: 1,
    detail: otherAds
      ? "Encontrada pelo menos uma tag adicional de rastreamento publicitário."
      : "Nenhuma tag adicional encontrada.",
    article: "art. 5º VII, art. 7º",
  });

  const formCapture = hasMatch(html, [
    /<input[^>]+type=["']?email["']?/i,
    /<input[^>]+type=["']?tel["']?/i,
    /<input[^>]+name=["']?(email|telefone|phone|whatsapp)["']?/i,
  ]);
  results.push({
    id: "form-capture",
    label: "Formulário capturando dado pessoal (e-mail/telefone)",
    kind: "capture",
    triggered: formCapture,
    weight: 2,
    detail: formCapture
      ? "Encontrado campo de e-mail ou telefone em formulário — cada envio é tratamento de dado pessoal."
      : "Nenhum campo de e-mail/telefone encontrado nos formulários visíveis.",
    article: "art. 5º X, art. 6º",
  });

  const whatsapp = hasMatch(html, [/wa\.me\//i, /api\.whatsapp\.com/i]);
  results.push({
    id: "whatsapp",
    label: "Link ou widget de WhatsApp",
    kind: "capture",
    triggered: whatsapp,
    weight: 1,
    detail: whatsapp
      ? "Encontrado link direto de WhatsApp — canal comum de captura de lead sem registro formal de consentimento."
      : "Nenhum link de WhatsApp encontrado.",
    article: "art. 5º X",
  });

  const chatWidget = hasMatch(html, [
    /widget\.intercom\.io/i,
    /embed\.tawk\.to/i,
    /client\.crisp\.chat/i,
    /static\.zdassets\.com/i,
  ]);
  results.push({
    id: "chat-widget",
    label: "Chat/widget de atendimento",
    kind: "capture",
    triggered: chatWidget,
    weight: 1,
    detail: chatWidget
      ? "Encontrado widget de chat — normalmente registra nome, e-mail e histórico da conversa."
      : "Nenhum widget de chat conhecido encontrado.",
    article: "art. 5º X",
  });

  const hasConsent = hasMatch(html, [
    /cookiebot/i,
    /onetrust/i,
    /cookieyes/i,
    /usercentrics/i,
    /termly\.io/i,
    /cookie[-_ ]?consent/i,
    /aceitar\s+(os\s+)?cookies/i,
    /pol[ií]tica\s+de\s+cookies/i,
  ]);
  results.push({
    id: "cookie-consent",
    label: "Banner de consentimento de cookies",
    kind: "consent",
    triggered: !hasConsent,
    weight: 3,
    detail: hasConsent
      ? "Foi encontrado algum mecanismo de consentimento de cookies no HTML."
      : "Nenhum banner ou gerenciador de consentimento encontrado — os rastreadores acima, se existirem, provavelmente disparam antes de qualquer aceite.",
    article: "art. 7º, art. 8º",
  });

  const hasPrivacyPolicy = hasMatch(html, [
    /href=["'][^"']*(privacidade|privacy-?policy)[^"']*["']/i,
    /pol[ií]tica\s+de\s+privacidade/i,
  ]);
  results.push({
    id: "privacy-policy",
    label: "Link para política de privacidade",
    kind: "policy",
    triggered: !hasPrivacyPolicy,
    weight: 2,
    detail: hasPrivacyPolicy
      ? "Foi encontrado um link ou menção a política de privacidade."
      : "Nenhum link ou menção a política de privacidade encontrado na página.",
    article: "art. 9º",
  });

  results.push({
    id: "https",
    label: "Conexão segura (HTTPS)",
    kind: "security",
    triggered: !usedHttps,
    weight: 1,
    detail: usedHttps
      ? "O site responde via HTTPS."
      : "O site não usa HTTPS — dado trafega sem criptografia de transporte.",
    article: "art. 46",
  });

  return results;
}

function levelFor(pct: number) {
  if (pct <= 25) return { label: "Baixo", tone: "green" as const };
  if (pct <= 50) return { label: "Médio", tone: "orange" as const };
  if (pct <= 75) return { label: "Alto", tone: "orange-deep" as const };
  return { label: "Crítico", tone: "red" as const };
}

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

  let html = "";
  let finalUrl = target.toString();
  let usedHttps = target.protocol === "https:";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(target.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "DattisAuditBot/1.0 (+https://dattum-rho.vercel.app/auditoria)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `O site respondeu com erro (status ${res.status}). Não foi possível concluir a análise.` },
        { status: 200 }
      );
    }

    finalUrl = res.url || finalUrl;
    usedHttps = finalUrl.startsWith("https:");

    const reader = res.body?.getReader();
    if (reader) {
      const chunks: Uint8Array[] = [];
      let received = 0;
      while (received < MAX_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          received += value.length;
        }
      }
      html = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf-8");
    } else {
      html = await res.text();
    }
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Não foi possível acessar esse site agora (fora do ar, bloqueando o acesso, ou demorou demais pra responder).",
      },
      { status: 200 }
    );
  }

  const findings = runChecks(html, usedHttps);
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
        "Foram encontrados pontos de coleta de dado pessoal sem nenhum mecanismo de consentimento visível — o dado do visitante pode estar sendo enviado a terceiros (Meta, Google, TikTok) antes de qualquer aceite.",
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
        "A varredura automática não encontrou rastreadores nem formulários de captura sem consentimento. Isso não é uma auditoria jurídica completa — não avalia backend, contratos nem retenção real de dado.",
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
