// Captura prints REAIS da plataforma (conta demo, em produção) para a seção Funcionalidades da home.
// Uso: npx tsx scripts/capturar-telas.mts   → salva em public/marketing/app/*.webp
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import fs from "node:fs";
import path from "node:path";
import puppeteer, { type Page } from "puppeteer-core";
import { resolveExecutablePath } from "../lib/browser";

const B = process.env.CAPTURA_URL ?? "https://dattum-rho.vercel.app";
const SAIDA = path.join(process.cwd(), "public/marketing/app");
fs.mkdirSync(SAIDA, { recursive: true });
const TOURS = ["boas-vindas", "contas", "nova-conta", "conta", "documentos", "ferramentas", "vigilancia", "certificados", "dossie", "configuracoes", "titulares", "cookies"];
const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: await resolveExecutablePath(), headless: true, args: ["--no-sandbox", "--hide-scrollbars"] });

async function nova(largura = 1440, altura = 900, escala = 2) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: largura, height: altura, deviceScaleFactor: escala });
  return page;
}

async function preparar(page: Page, comConsentimento = true) {
  // Sem tours abrindo por cima e (se pedido) sem o aviso de cookies na frente.
  await page.evaluateOnNewDocument((tours: string[], consent: boolean) => {
    localStorage.setItem("dattis:tours", JSON.stringify(tours));
    if (consent) document.cookie = `dattis_consent=${encodeURIComponent(JSON.stringify({ v: "x", c: { estatisticas: false, marketing: false }, id: "captura" }))}; path=/`;
  }, TOURS, comConsentimento);
}

async function ir(page: Page, url: string) {
  await page.goto(B + url, { waitUntil: "networkidle2", timeout: 90_000 });
  await espera(800);
}

async function salvar(page: Page, nome: string, alvo?: string | { x: number; y: number; width: number; height: number }) {
  const arquivo = path.join(SAIDA, `${nome}.webp`);
  if (typeof alvo === "string") {
    const el = await page.$(alvo);
    if (!el) throw new Error(`elemento não encontrado: ${alvo}`);
    await el.screenshot({ path: arquivo, type: "webp", quality: 90 });
  } else {
    await page.screenshot({ path: arquivo, type: "webp", quality: 90, clip: alvo });
  }
  console.log("ok", nome);
}

// ---------- logado na demo ----------
const p = await nova();
await preparar(p);
await ir(p, "/api/auth/demo");
await ir(p, "/painel");
await salvar(p, "painel");

const contas: { id: string; nome: string }[] = (await p.evaluate(() => fetch("/api/contas").then((r) => r.json()))).contas;
const loja = contas.find((c) => c.nome.startsWith("Loja Aurora"))!;
const studio = contas.find((c) => c.nome.startsWith("Studio Nova"))!;

await ir(p, `/painel/cookies?site=${loja.id}`);
await salvar(p, "cookies-numeros", { x: 0, y: 0, width: 1440, height: 900 });
await p.evaluate(() => [...document.querySelectorAll("[role=tab]")].find((b) => b.textContent?.includes("Google Tag Manager"))?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
await espera(500);
await salvar(p, "cookies-gtm", "[data-tour=cookies-instalar]");

await ir(p, "/painel/vigilancia");
await salvar(p, "vigilancia", { x: 0, y: 0, width: 1440, height: 900 });

// Selos (claro e escuro) do certificado da demo, em PNG
const certHtml = await p.evaluate(() => fetch("/painel/certificados").then((r) => r.text()));
const codigo = certHtml.match(/DTS-[A-Z0-9]{4}-[A-Z0-9]{4}/)?.[0];
for (const tema of ["claro", "escuro"]) {
  const buf = await fetch(`${B}/selo/${codigo}/png?tema=${tema}`).then((r) => r.arrayBuffer());
  fs.writeFileSync(path.join(SAIDA, `selo-${tema}.png`), Buffer.from(buf));
  console.log("ok selo", tema);
}

await ir(p, "/painel/certificados");
await p.evaluate(() => document.querySelector("[data-tour=cert-emitidos]")?.scrollIntoView({ block: "start" }));
await espera(400);
await salvar(p, "certificados", "[data-tour=cert-emitidos] li");

await ir(p, "/painel/titulares");
await salvar(p, "titulares", { x: 0, y: 0, width: 1440, height: 900 });

await ir(p, `/painel/contas/${loja.id}/dat`);
await salvar(p, "dat", { x: 0, y: 0, width: 1440, height: 900 });

// Link de assinatura do contrato pendente (Studio Nova), para o print no celular
const html = await p.evaluate((id: string) => fetch(`/painel/contas/${id}?aba=dpa`).then((r) => r.text()), studio.id);
const dpaId = html.match(/\/api\/dpa\/([0-9a-f-]{36})\/pdf/)?.[1];
const link: { url: string } = await p.evaluate((id: string) => fetch(`/api/dpa/${id}/link`, { method: "POST" }).then((r) => r.json()), dpaId!);

// ---------- celular: o cliente assinando ----------
const cel = await nova(390, 844, 3);
await preparar(cel);
await cel.goto(link.url.replace(/^https?:\/\/[^/]+/, B), { waitUntil: "networkidle2", timeout: 90_000 });
await espera(800);
await salvar(cel, "assinatura-celular", { x: 0, y: 0, width: 390, height: 844 });

// ---------- públicos ----------
const pub = await nova();
await preparar(pub);
await ir(pub, "/p/loja-aurora-demo/privacidade");
await salvar(pub, "politica", { x: 0, y: 0, width: 1440, height: 900 });
await pub.evaluate(() => document.getElementById("exercer-meus-direitos")?.closest("form")?.scrollIntoView({ block: "center" }));
await espera(400);
await salvar(pub, "canal-titular", "form");

// Aviso de cookies como o visitante vê (sem consentimento salvo)
const vis = await nova();
await preparar(vis, false);
await ir(vis, "/planos");
await espera(1500);
await salvar(vis, "banner-cookies", { x: 0, y: 900 - 300, width: 1440, height: 300 });

await browser.close();
console.log("prints em", SAIDA);
