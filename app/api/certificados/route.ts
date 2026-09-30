import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, certificados, contasCliente } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { gerarCodigo, requisitosAgencia, requisitosConta } from "@/lib/certificados";

export const runtime = "nodejs";

function normalizarDominio(v: unknown) {
  if (typeof v !== "string") return null;
  const d = v.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(d) ? d : null;
}

export async function POST(req: Request) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const contaId = typeof body?.contaId === "string" && body.contaId ? body.contaId : null;
  const dominioBruto = typeof body?.dominio === "string" ? body.dominio.trim() : "";
  const dominio = dominioBruto ? normalizarDominio(dominioBruto) : null;
  if (dominioBruto && !dominio) {
    return NextResponse.json({ ok: false, error: "Informe um domínio válido, ex.: lojaaurora.com.br" }, { status: 400 });
  }

  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) });
  if (!agencia) return NextResponse.json({ ok: false, error: "Agência não encontrada." }, { status: 404 });

  let titular = agencia.nome;
  if (contaId) {
    const conta = await db.query.contasCliente.findFirst({
      where: and(eq(contasCliente.id, contaId), eq(contasCliente.agenciaId, sessao.agenciaId)),
    });
    if (!conta) return NextResponse.json({ ok: false, error: "Conta não encontrada." }, { status: 404 });
    titular = conta.nome;
  }

  const requisitos = contaId ? await requisitosConta(contaId) : await requisitosAgencia(sessao.agenciaId);
  const pendentes = requisitos.filter((r) => !r.ok);
  if (pendentes.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: `Ainda não dá pra emitir: ${pendentes.map((p) => `${p.label} (${p.detalhe.toLowerCase()})`).join("; ")}.`,
      },
      { status: 422 },
    );
  }

  const validoAte = new Date();
  validoAte.setFullYear(validoAte.getFullYear() + 1);

  const [cert] = await db
    .insert(certificados)
    .values({ agenciaId: sessao.agenciaId, contaClienteId: contaId, codigo: gerarCodigo(), titular, dominio, validoAte })
    .returning();

  return NextResponse.json({ ok: true, certificado: cert });
}
