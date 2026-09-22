import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import { db } from "@/lib/db";
import { dpas, contasCliente } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { resolveExecutablePath } from "@/lib/browser";

export const runtime = "nodejs";
export const maxDuration = 60;

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const dpa = await db.query.dpas.findFirst({
    where: and(eq(dpas.id, id), eq(dpas.agenciaId, sessao.agenciaId)),
  });
  if (!dpa) return NextResponse.json({ ok: false, error: "DPA não encontrado." }, { status: 404 });

  const conta = await db.query.contasCliente.findFirst({ where: eq(contasCliente.id, dpa.contaClienteId) });

  const assinaturaHtml =
    dpa.status === "assinado"
      ? `<div class="assinatura">
           <p><strong>Assinado eletronicamente por:</strong> ${escapeHtml(dpa.assinanteNome ?? "")} — ${escapeHtml(dpa.assinanteCargo ?? "")}</p>
           <p><strong>Data/hora:</strong> ${dpa.assinadoEm ? new Date(dpa.assinadoEm).toLocaleString("pt-BR") : "-"}</p>
           <p><strong>IP:</strong> ${escapeHtml(dpa.assinadoIp ?? "-")}</p>
         </div>`
      : `<div class="assinatura pendente"><p>Documento ainda não assinado.</p></div>`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><style>
  body { font-family: Georgia, "Times New Roman", serif; color: #141031; padding: 48px 56px; font-size: 13px; line-height: 1.6; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .sub { color: #555; font-size: 11px; margin: 0 0 28px; }
  pre { white-space: pre-wrap; font-family: inherit; font-size: 13px; margin: 0; }
  .assinatura { margin-top: 32px; padding: 16px 20px; border: 1px solid #ccc; border-radius: 6px; background: #f7f6fe; }
  .assinatura.pendente { background: #fff3e0; }
  .assinatura p { margin: 4px 0; }
</style></head>
<body>
  <h1>Dattis — Contrato de Operador de Dados</h1>
  <p class="sub">Conta: ${escapeHtml(conta?.nome ?? "")} · Versão ${dpa.versao} · Gerado em ${new Date(dpa.createdAt).toLocaleDateString("pt-BR")}</p>
  <pre>${escapeHtml(dpa.conteudoSnapshot)}</pre>
  ${assinaturaHtml}
</body></html>`;

  let browser: import("puppeteer-core").Browser | null = null;
  try {
    const executablePath = await resolveExecutablePath();
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1240, height: 1754 },
      executablePath,
      headless: true,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "18mm", right: "18mm" },
    });
    await browser.close();

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="dpa-${conta?.nome ?? "dattis"}.pdf"`,
      },
    });
  } catch {
    if (browser) await browser.close().catch(() => {});
    return NextResponse.json(
      { ok: false, error: "Não foi possível gerar o PDF agora. Tenta de novo em alguns segundos." },
      { status: 500 }
    );
  }
}
