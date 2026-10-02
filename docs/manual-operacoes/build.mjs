// Gera o PDF do Manual de Operações.
// Uso: node build.mjs <pasta-com-node_modules> [saida.pdf]
// Precisa de puppeteer-core e pdfjs-dist instalados na pasta indicada (fora do repo, para não pesar o projeto).
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { pathToFileURL, fileURLToPath } from "url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const MODS = process.argv[2];
const SAIDA = process.argv[3] || path.join(AQUI, "Manual-de-Operacoes-Dattis.pdf");
const req = createRequire(path.join(MODS, "package.json"));
const puppeteer = (await import(pathToFileURL(req.resolve("puppeteer-core")).href)).default;
const pdfjs = await import(pathToFileURL(path.join(MODS, "node_modules/pdfjs-dist/legacy/build/pdf.mjs")).href);

const partes = fs.readdirSync(AQUI).filter((f) => /^\d\d-.*\.html$/.test(f)).sort();
const corpo = partes.map((f) => fs.readFileSync(path.join(AQUI, f), "utf8")).join("\n");
const css = fs.readFileSync(path.join(AQUI, "style.css"), "utf8");
const montar = (b) => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Manual de Operações Dattis</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montagu+Slab:opsz,wght@16..144,400&family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Geist+Mono:wght@500;600&display=block" rel="stylesheet">
<style>${css}</style></head><body>${b}</body></html>`;

const browser = await puppeteer.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: true, userDataDir: path.join(MODS, "edgeprof") });
async function render(html, destino) {
  const arq = path.join(AQUI, "manual.html");
  fs.writeFileSync(arq, html);
  const pg = await browser.newPage();
  await pg.goto(pathToFileURL(arq).href, { waitUntil: "networkidle0" });
  await pg.evaluate(() => document.fonts.ready);
  await pg.pdf({ path: destino, format: "A4", printBackground: true, preferCSSPageSize: true, displayHeaderFooter: false });
  await pg.close();
}
async function paginas(arquivo) {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(arquivo)) }).promise;
  const out = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const t = await (await doc.getPage(i)).getTextContent();
    out.push(t.items.map((x) => x.str).join(" "));
  }
  return out;
}

// 1ª passada: descobre em que página cai cada abertura
const tmp = SAIDA.replace(/\.pdf$/, ".tmp.pdf");
await render(montar(corpo), tmp);
const txt = await paginas(tmp);
const achar = (marca) => {
  // letter-spacing quebra o texto extraído em letras soltas: compara sem espaços
  const m = marca.replace(/\s/g, "");
  const i = txt.findIndex((t) => t.replace(/\s/g, "").includes(m));
  return i < 0 ? "—" : String(i + 1);
};
const mapa = { uso: achar("ANTES DE COMEÇAR · COMO USAR"), P1: achar("PARTE I · CAPÍTULOS"), P2: achar("PARTE II · CAPÍTULOS"), P3: achar("PARTE III · CAPÍTULOS"), P4: achar("PARTE IV · CAPÍTULOS"), AX: achar("ANEXO A ·"), AXA: achar("ANEXO A ·"), AXB: achar("ANEXO B ·"), AXC: achar("ANEXO C ·") };
for (let c = 1; c <= 24; c++) { const n = String(c).padStart(2, "0"); mapa["C" + n] = achar("CAPÍTULO " + n + " "); }
console.log(JSON.stringify(mapa));

// 2ª passada: sumário com as páginas certas
await render(montar(corpo.replace(/\{\{(\w+)\}\}/g, (_, k) => mapa[k] ?? "—")), SAIDA);
fs.unlinkSync(tmp);
console.log("páginas:", txt.length, "→", SAIDA);
await browser.close();
