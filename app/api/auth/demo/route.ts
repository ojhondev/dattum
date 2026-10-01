import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { hashSenha, criarSessao } from "@/lib/auth";
import { ativarConta } from "@/lib/contas";
import type { FlowKey } from "@/lib/fluxos";

export const runtime = "nodejs";

const DEMO_EMAIL = "demo@dattis.com.br";
const DEMO_NOME = "Agência Demo Dattis";

const CONTAS_DEMO: { nome: string; cnpj: string; site?: string; flows: FlowKey[]; assinado: boolean }[] = [
  { nome: "Loja Aurora (demo)", cnpj: "12.345.678/0001-90", site: "https://dattum-rho.vercel.app", flows: ["publicos", "capi", "ads", "whatsapp"], assinado: true },
  { nome: "Studio Nova (demo)", cnpj: "98.765.432/0001-10", flows: ["ads", "formularios", "crm"], assinado: false },
];

export async function GET(req: Request) {
  let agencia = await db.query.agencias.findFirst({ where: eq(agencias.email, DEMO_EMAIL) });

  if (!agencia) {
    const senhaHash = await hashSenha(crypto.randomUUID());
    const [novaAgencia] = await db
      .insert(agencias)
      .values({ nome: DEMO_NOME, email: DEMO_EMAIL, senhaHash, cnpj: "11.222.333/0001-44", responsavelNome: "Rafael Lima", responsavelCargo: "Sócio-diretor" })
      .returning();
    agencia = novaAgencia;

    for (const def of CONTAS_DEMO) {
      await ativarConta({
        agenciaId: agencia.id,
        agenciaNome: agencia.nome,
        nome: def.nome,
        cnpj: def.cnpj,
        site: def.site,
        flows: def.flows,
        agenciaCnpj: "11.222.333/0001-44",
        assinatura: def.assinado
          ? { agencia: { nome: "Rafael Lima", cargo: "Sócio-diretor" }, cliente: { nome: "Ana Souza", cargo: "Sócia-diretora", email: "ana@lojaaurora.com.br" }, ip: "203.0.113.10" }
          : undefined,
      });
    }
  }

  await criarSessao(agencia.id);

  return NextResponse.redirect(new URL("/painel", req.url));
}
