// Gera o Playbook LGPD (PDF A4) a partir de src/shell.html + src/partes/*.html.
// Uso: node materiais/playbook-lgpd/build.mjs
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";

const dir = dirname(fileURLToPath(import.meta.url));
const assets = pathToFileURL(join(dir, "..", "..", "public")).href;
const partes = join(dir, "src", "partes");
// Partes .html entram como estão; partes .mjs exportam (default) o HTML gerado a partir de dados.
const blocos = [];
for (const f of readdirSync(partes).sort()) {
  if (f.endsWith(".html")) blocos.push(readFileSync(join(partes, f), "utf8"));
  else if (f.endsWith(".mjs")) blocos.push((await import(pathToFileURL(join(partes, f)).href)).default);
}
const conteudo = blocos.join("\n");

const html = readFileSync(join(dir, "src", "shell.html"), "utf8")
  .replace("<!--CONTENT-->", conteudo)
  .replaceAll("{{ASSETS}}", assets);

const out = join(dir, "dist");
mkdirSync(out, { recursive: true });
const htmlPath = join(out, "playbook-lgpd-dattis.html");
writeFileSync(htmlPath, html);

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--allow-file-access-from-files"],
});
const page = await browser.newPage();
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0", timeout: 120000 });
await page.waitForFunction("window.__BOOK", { timeout: 120000 });
const info = await page.evaluate(() => window.__BOOK);
// SHOTS=1,4,10 gera PNGs dessas páginas em dist/shots para revisão visual.
if (process.env.SHOTS) {
  mkdirSync(join(out, "shots"), { recursive: true });
  for (const num of process.env.SHOTS.split(",")) {
    const el = await page.$(`.page[data-num="${num.trim()}"]`);
    if (el) await el.screenshot({ path: join(out, "shots", `p${num.trim()}.png`) });
  }
}
await page.pdf({ path: join(out, "Playbook-LGPD-Agencias-de-Trafego-Dattis.pdf"), printBackground: true, preferCSSPageSize: true });
await browser.close();

console.log(`Páginas: ${info.pages}`);
for (const w of info.warnings) console.warn("AVISO:", w);
