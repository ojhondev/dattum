import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import { resolveExecutablePath } from "@/lib/browser";
import { situacaoDpa, ROTULO_SITUACAO, type Dpa } from "@/lib/dpa";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const quando = (d: Date | null) => (d ? d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "-");

function bloco(titulo: string, a: { nome: string | null; cargo: string | null; email?: string | null; em: Date | null; ip: string | null; ua: string | null }) {
  if (!a.em) return `<div class="ass pendente"><p class="t">${titulo}</p><p>Ainda não assinou.</p></div>`;
  return `<div class="ass"><p class="t">${titulo}</p>
    <p><b>${esc(a.nome ?? "")}</b> · ${esc(a.cargo ?? "")}${a.email ? ` · ${esc(a.email)}` : ""}</p>
    <p>Assinado eletronicamente em ${quando(a.em)} (horário de Brasília) · IP ${esc(a.ip ?? "-")}</p>
    ${a.ua ? `<p class="ua">Navegador: ${esc(a.ua)}</p>` : ""}</div>`;
}

/** HTML do contrato com as duas assinaturas e a trilha de evidências, pronto para virar PDF. */
export function htmlDoDpa(dpa: Dpa, contaNome: string) {
  const situacao = situacaoDpa(dpa);
  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><style>
  body { font-family: Georgia, "Times New Roman", serif; color: #141031; padding: 0; font-size: 12.5px; line-height: 1.6; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .sub { color: #555; font-size: 11px; margin: 0 0 24px; }
  pre { white-space: pre-wrap; font-family: inherit; font-size: 12.5px; margin: 0; }
  h2 { font-size: 13px; margin: 28px 0 10px; text-transform: uppercase; letter-spacing: .04em; }
  .ass { margin-top: 10px; padding: 12px 16px; border: 1px solid #ccc; border-radius: 6px; background: #f3faf6; page-break-inside: avoid; }
  .ass.pendente { background: #fff6e8; }
  .ass p { margin: 3px 0; }
  .ass .t { font-family: Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; color: #555; }
  .ua, .hash { font-family: "Courier New", monospace; font-size: 9.5px; color: #555; word-break: break-all; }
</style></head>
<body>
  <h1>Contrato de Operação de Dados Pessoais (DPA)</h1>
  <p class="sub">Conta: ${esc(contaNome)} · Versão ${dpa.versao} · Gerado em ${dpa.createdAt.toLocaleDateString("pt-BR")} · ${ROTULO_SITUACAO[situacao]}</p>
  <pre>${esc(dpa.conteudoSnapshot)}</pre>
  <h2>Assinaturas e evidências</h2>
  ${bloco("Agência (operadora)", { nome: dpa.assinanteNome, cargo: dpa.assinanteCargo, em: dpa.assinadoEm, ip: dpa.assinadoIp, ua: dpa.assinadoUserAgent })}
  ${bloco("Cliente (controlador)", { nome: dpa.clienteNome, cargo: dpa.clienteCargo, email: dpa.clienteEmail, em: dpa.clienteAssinadoEm, ip: dpa.clienteIp, ua: dpa.clienteUserAgent })}
  ${dpa.hashConteudo ? `<p class="hash" style="margin-top:14px">Resumo SHA-256 do texto assinado: ${dpa.hashConteudo}</p>` : ""}
  <p class="hash">Documento gerado pela plataforma Dattis. Id do documento: ${dpa.id}</p>
</body></html>`;
}

export async function htmlParaPdf(html: string) {
  let browser: import("puppeteer-core").Browser | null = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1240, height: 1754 },
      executablePath: await resolveExecutablePath(),
      headless: true,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({ format: "A4", printBackground: true, margin: { top: "20mm", bottom: "20mm", left: "18mm", right: "18mm" } });
    return Buffer.from(pdf);
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

export const nomeArquivo = (contaNome: string, versao: number) =>
  `contrato-dados-${contaNome.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}-v${versao}.pdf`;
