import { and, count, desc, eq, gt, isNull, isNotNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, certificados, contasCliente, varreduraResultados } from "@/lib/db/schema";
import { statusCertificado } from "@/lib/certificados";
import { cnpjValido, digitosCnpj, mascaraCnpj } from "@/lib/cnpj";
import { urlAbsoluta } from "@/lib/site";

/**
 * Consulta pública por CNPJ (/consulta): diz se uma agência acompanhada pela Dattis está em conformidade com a LGPD.
 * Só aparece quem tem certificado de agência válido, que já é público em /verificar/{codigo}. Quem não tem
 * (cliente sem certificado, conta em exploração, suspensa ou CNPJ fora da base) recebe a mesma resposta neutra,
 * para a consulta não expor quem é cliente da Dattis.
 */
export type ResultadoConsulta =
  | { tipo: "invalido"; cnpj: string }
  | { tipo: "nao_encontrado"; cnpj: string }
  | {
      tipo: "encontrado";
      cnpj: string;
      nome: string;
      desde: Date;
      emDia: boolean;
      certificado: { codigo: string; emitidoEm: Date; validoAte: Date; dominio: string | null };
      requisitos: { label: string; ok: boolean; detalhe: string }[];
      clientesAcompanhados: number;
      ultimaVarredura: Date | null;
      politicaUrl: string | null;
    };

export async function consultarAgencia(cnpjBruto: string): Promise<ResultadoConsulta> {
  const cnpj = digitosCnpj(cnpjBruto);
  if (!cnpjValido(cnpj)) return { tipo: "invalido", cnpj: mascaraCnpj(cnpj) };
  const naoEncontrado = { tipo: "nao_encontrado" as const, cnpj: mascaraCnpj(cnpj) };

  const [agencia] = await db
    .select()
    .from(agencias)
    .where(and(sql`regexp_replace(coalesce(${agencias.cnpj}, ''), '[^0-9]', '', 'g') = ${cnpj}`, isNotNull(agencias.ativadaEm), eq(agencias.suspensa, false)))
    .limit(1);
  if (!agencia?.ativadaEm) return naoEncontrado;

  const [cert] = await db
    .select()
    .from(certificados)
    .where(and(eq(certificados.agenciaId, agencia.id), isNull(certificados.contaClienteId), eq(certificados.revogado, false), gt(certificados.validoAte, new Date())))
    .orderBy(desc(certificados.emitidoEm))
    .limit(1);
  if (!cert) return naoEncontrado;

  const [status, [{ n }], [varredura]] = await Promise.all([
    statusCertificado(cert),
    db.select({ n: count() }).from(contasCliente).where(eq(contasCliente.agenciaId, agencia.id)),
    db.select({ em: varreduraResultados.verificadoEm }).from(varreduraResultados).where(eq(varreduraResultados.agenciaId, agencia.id)).orderBy(desc(varreduraResultados.verificadoEm)).limit(1),
  ]);
  if (!status.valido) return naoEncontrado;

  return {
    tipo: "encontrado",
    cnpj: mascaraCnpj(cnpj),
    nome: agencia.nome,
    desde: agencia.ativadaEm,
    emDia: status.emDia,
    certificado: { codigo: cert.codigo, emitidoEm: cert.emitidoEm, validoAte: cert.validoAte, dominio: cert.dominio },
    requisitos: status.requisitos,
    clientesAcompanhados: Number(n),
    ultimaVarredura: varredura?.em ?? null,
    politicaUrl: agencia.slug && agencia.politicaPublicadaEm ? urlAbsoluta(`/p/${agencia.slug}/privacidade`) : null,
  };
}
