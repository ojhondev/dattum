import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, contasCliente } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { ativarConta, normalizarSite, CHAVES_FLUXO } from "@/lib/contas";
import { registrar } from "@/lib/registro";

export const runtime = "nodejs";

export async function GET() {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });

  const contas = await db.query.contasCliente.findMany({
    where: eq(contasCliente.agenciaId, sessao.agenciaId),
    orderBy: (t, { desc }) => desc(t.createdAt),
  });

  return NextResponse.json({ ok: true, contas });
}

export async function POST(req: Request) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const texto = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  const nome = texto(body?.nome) ?? "";
  const flows = CHAVES_FLUXO.filter((f) => body?.flows?.[f] === true);
  const site = body?.site ? normalizarSite(body.site) : null;

  if (!nome) {
    return NextResponse.json({ ok: false, error: "Informe o nome do cliente." }, { status: 400 });
  }
  if (body?.site && texto(body.site) && !site) {
    return NextResponse.json({ ok: false, error: "O site informado não parece um endereço válido (ex.: lojaaurora.com.br)." }, { status: 400 });
  }

  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) });
  if (!agencia) return NextResponse.json({ ok: false, error: "Agência não encontrada." }, { status: 404 });

  if (agencia.clientesContratados != null) {
    const ativas = await db.query.contasCliente.findMany({ where: eq(contasCliente.agenciaId, sessao.agenciaId), columns: { id: true } });
    if (ativas.length >= agencia.clientesContratados) {
      return NextResponse.json(
        {
          ok: false,
          error: `Seu plano cobre ${agencia.clientesContratados} cliente(s) e todos já estão ativos. Fale com a Dattis pra incluir mais clientes.`,
        },
        { status: 403 },
      );
    }
  }

  const { conta, dpa } = await ativarConta({
    agenciaId: sessao.agenciaId,
    agenciaNome: agencia.nome,
    agenciaCnpj: agencia.cnpj,
    nome,
    cnpj: texto(body?.cnpj),
    contatoNome: texto(body?.contatoNome),
    contatoEmail: texto(body?.contatoEmail),
    contatoWhatsapp: texto(body?.contatoWhatsapp),
    crmNome: texto(body?.crmNome),
    site,
    flows,
  });

  await registrar(sessao, "Ativou um cliente", conta.nome);
  return NextResponse.json({ ok: true, conta, dpaId: dpa.id });
}
