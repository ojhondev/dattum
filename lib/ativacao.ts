import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, codigosAtivacao } from "@/lib/db/schema";
import { hashSenha } from "@/lib/auth";

export const CODIGO_INVALIDO =
  "Código de ativação inválido ou já usado. Ele é enviado pela equipe Dattis depois da confirmação do pagamento.";

/**
 * Cria a agência consumindo o código de ativação de forma atômica (só um cadastro marca o código como usado).
 * Se a criação falhar, o código volta a ficar disponível.
 */
export async function ativarAgencia(params: { codigo: string; nome: string; email: string; senha?: string; googleSub?: string }) {
  const codigo = params.codigo.trim().toUpperCase();
  if (!codigo) return { ok: false as const, erro: CODIGO_INVALIDO };

  const [reservado] = await db
    .update(codigosAtivacao)
    .set({ usadoEm: new Date() })
    .where(and(eq(codigosAtivacao.codigo, codigo), isNull(codigosAtivacao.usadoEm), eq(codigosAtivacao.revogado, false)))
    .returning();
  if (!reservado) return { ok: false as const, erro: CODIGO_INVALIDO };

  try {
    // Sem senha (login pelo Google): hash de um valor aleatório que ninguém conhece.
    const senhaHash = await hashSenha(params.senha ?? crypto.randomUUID());
    const [agencia] = await db
      .insert(agencias)
      .values({
        nome: params.nome.trim() || reservado.clienteNome,
        email: params.email.trim().toLowerCase(),
        senhaHash,
        googleSub: params.googleSub ?? null,
        plano: reservado.plano,
        clientesContratados: reservado.clientes,
      })
      .returning();
    await db.update(codigosAtivacao).set({ agenciaId: agencia.id }).where(eq(codigosAtivacao.id, reservado.id));
    return { ok: true as const, agencia };
  } catch {
    await db.update(codigosAtivacao).set({ usadoEm: null }).where(eq(codigosAtivacao.id, reservado.id));
    return { ok: false as const, erro: "Não foi possível criar a conta agora. Tenta de novo." };
  }
}
