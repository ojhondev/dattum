import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { dpas, contasCliente } from "@/lib/db/schema";
import { htmlDoDpa, htmlParaPdf, nomeArquivo } from "@/lib/dpa-pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

// Cópia do contrato para quem tem o link de assinatura (o cliente guarda o PDF depois de assinar).
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const dpa = token.length >= 20 ? await db.query.dpas.findFirst({ where: eq(dpas.tokenAssinatura, token) }) : null;
  if (!dpa) return NextResponse.json({ ok: false, error: "Link inválido." }, { status: 404 });
  const conta = await db.query.contasCliente.findFirst({ where: eq(contasCliente.id, dpa.contaClienteId) });
  try {
    const pdf = await htmlParaPdf(htmlDoDpa(dpa, conta?.nome ?? ""));
    return new NextResponse(new Uint8Array(pdf), {
      headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${nomeArquivo(conta?.nome ?? "dattis", dpa.versao)}"`, "X-Robots-Tag": "noindex" },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Não foi possível gerar o PDF agora. Tente de novo em alguns segundos." }, { status: 500 });
  }
}
