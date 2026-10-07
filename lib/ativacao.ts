import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, codigosAtivacao } from "@/lib/db/schema";
import { hashSenha } from "@/lib/auth";
import { VERSAO_LEGAL } from "@/lib/legal";

export const TERMOS_NAO_ACEITOS = "Para criar a conta, aceite os Termos de Uso, a Política de Privacidade e o Contrato de dados.";

export const CODIGO_INVALIDO =
  "Código de ativação inválido ou já usado. A equipe Dattis manda o código pelo WhatsApp depois da confirmação do pagamento.";

/** Clientes que uma conta em exploração (criada pelo site, plano ainda não ativado) pode cadastrar. */
export const CLIENTES_EXPLORACAO = 2;

/** Conta criada pelo site que a Dattis ainda não ativou: usa a plataforma, mas não emite nada. */
export const emExploracao = (a: { ativadaEm: Date | null }) => !a.ativadaEm;

/** Só dígitos, com DDD (10 ou 11) e DDI opcional. Nulo quando não parece um celular/telefone. */
export function normalizarWhatsapp(v: unknown) {
  const d = typeof v === "string" ? v.replace(/\D/g, "") : "";
  return d.length >= 10 && d.length <= 13 ? d : null;
}

/** Reserva o código de forma atômica: só um cadastro consegue marcá-lo como usado. */
async function reservarCodigo(codigoBruto: string) {
  const codigo = codigoBruto.trim().toUpperCase();
  if (!codigo) return null;
  const [reservado] = await db
    .update(codigosAtivacao)
    .set({ usadoEm: new Date() })
    .where(and(eq(codigosAtivacao.codigo, codigo), isNull(codigosAtivacao.usadoEm), eq(codigosAtivacao.revogado, false)))
    .returning();
  return reservado ?? null;
}

const liberarCodigo = (id: string) => db.update(codigosAtivacao).set({ usadoEm: null }).where(eq(codigosAtivacao.id, id));

/**
 * Cria a agência. Com código de ativação, já nasce com o plano contratado; sem código, nasce em
 * exploração (plano Growth para conhecer tudo, limite de CLIENTES_EXPLORACAO clientes e nada emitido)
 * e aparece em /admin/agencias para a Dattis ativar. Se a criação falhar, o código volta a ficar disponível.
 */
export async function criarAgencia(params: {
  codigo?: string;
  nome: string;
  email: string;
  senha?: string;
  googleSub?: string;
  whatsapp?: string | null;
  aceitouTermos: boolean;
}) {
  if (!params.aceitouTermos) return { ok: false as const, erro: TERMOS_NAO_ACEITOS };
  const reservado = params.codigo?.trim() ? await reservarCodigo(params.codigo) : null;
  if (params.codigo?.trim() && !reservado) return { ok: false as const, erro: CODIGO_INVALIDO };

  try {
    // Sem senha (login pelo Google): hash de um valor aleatório que ninguém conhece.
    const senhaHash = await hashSenha(params.senha ?? crypto.randomUUID());
    const [agencia] = await db
      .insert(agencias)
      .values({
        nome: params.nome.trim() || reservado?.clienteNome || params.email.split("@")[0],
        email: params.email.trim().toLowerCase(),
        senhaHash,
        googleSub: params.googleSub ?? null,
        senhaDefinida: !!params.senha,
        whatsapp: params.whatsapp ?? null,
        termosVersao: VERSAO_LEGAL,
        termosAceitosEm: new Date(),
        plano: reservado?.plano ?? "growth",
        clientesContratados: reservado?.clientes ?? CLIENTES_EXPLORACAO,
        ativadaEm: reservado ? new Date() : null,
      })
      .returning();
    if (reservado) await db.update(codigosAtivacao).set({ agenciaId: agencia.id }).where(eq(codigosAtivacao.id, reservado.id));
    return { ok: true as const, agencia };
  } catch {
    if (reservado) await liberarCodigo(reservado.id);
    return { ok: false as const, erro: "Não foi possível criar a conta agora. Tenta de novo." };
  }
}

/** Conta em exploração que recebeu o código depois de pagar: aplica o plano do código e libera a emissão. */
export async function aplicarCodigo(agenciaId: string, codigo: string) {
  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, agenciaId), columns: { ativadaEm: true } });
  if (!agencia) return { ok: false as const, erro: "Agência não encontrada." };
  if (!emExploracao(agencia)) return { ok: false as const, erro: "Esta conta já está ativada. Para mudar de plano, fale com a Dattis." };
  const reservado = await reservarCodigo(codigo);
  if (!reservado) return { ok: false as const, erro: CODIGO_INVALIDO };
  try {
    await db
      .update(agencias)
      .set({ plano: reservado.plano, clientesContratados: reservado.clientes, ativadaEm: new Date() })
      .where(eq(agencias.id, agenciaId));
    await db.update(codigosAtivacao).set({ agenciaId }).where(eq(codigosAtivacao.id, reservado.id));
    return { ok: true as const };
  } catch {
    await liberarCodigo(reservado.id);
    return { ok: false as const, erro: "Não foi possível ativar agora. Tenta de novo." };
  }
}
