import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { getSessao, verificarSenha } from "@/lib/auth";
import { EMAIL_DEMO } from "@/lib/admin-dados";
import { atualizarRascunhosDaAgencia } from "@/lib/dpa";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Dados da agência (configurações). Trocar o e-mail de acesso pede a senha atual, se a conta tiver senha. */
export async function PATCH(req: Request) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) });
  if (!agencia) return NextResponse.json({ ok: false, error: "Agência não encontrada." }, { status: 404 });
  if (agencia.email === EMAIL_DEMO) {
    return NextResponse.json({ ok: false, error: "A conta de demonstração é compartilhada e não pode ser alterada." }, { status: 403 });
  }

  const b = await req.json().catch(() => null);
  const texto = (v: unknown, max = 200) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

  const nome = texto(b?.nome, 120);
  if (!nome) return NextResponse.json({ ok: false, error: "Informe o nome da agência." }, { status: 400 });

  const email = (texto(b?.email, 160) ?? "").toLowerCase();
  if (!EMAIL.test(email)) return NextResponse.json({ ok: false, error: "Informe um e-mail válido." }, { status: 400 });
  if (email !== agencia.email) {
    if (agencia.senhaDefinida) {
      const senha = typeof b?.senhaAtual === "string" ? b.senhaAtual : "";
      if (!(await verificarSenha(senha, agencia.senhaHash))) {
        return NextResponse.json({ ok: false, error: "Para trocar o e-mail de acesso, confirme a senha atual." }, { status: 403 });
      }
    }
    const outro = await db.query.agencias.findFirst({ where: and(eq(agencias.email, email), ne(agencias.id, agencia.id)) });
    if (outro) return NextResponse.json({ ok: false, error: "Esse e-mail já é usado por outra conta." }, { status: 409 });
  }

  const [atual] = await db
    .update(agencias)
    .set({
      nome,
      email,
      cnpj: texto(b?.cnpj, 30),
      whatsapp: texto(b?.whatsapp, 30),
      endereco: texto(b?.endereco, 300),
      responsavelNome: texto(b?.responsavelNome, 120),
      responsavelCargo: texto(b?.responsavelCargo, 120),
    })
    .where(eq(agencias.id, agencia.id))
    .returning();

  // Nome e CNPJ entram na qualificação dos contratos ainda não assinados.
  if (atual.nome !== agencia.nome || atual.cnpj !== agencia.cnpj) await atualizarRascunhosDaAgencia(agencia.id);

  return NextResponse.json({ ok: true });
}
