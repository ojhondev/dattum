import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { atividadesTratamento, contaSubprocessadores, contasCliente, dpas, certificados } from "@/lib/db/schema";
import { dataAssinaturaCompleta, dpaVigente, filtroVigente, situacaoDpa, ROTULO_SITUACAO } from "@/lib/dpa";

export type Certificado = typeof certificados.$inferSelect;

export type Requisito = { label: string; ok: boolean; detalhe: string };

export type StatusCertificado = {
  valido: boolean; // não revogado e dentro da validade
  emDia: boolean; // requisitos documentais cumpridos agora
  requisitos: Requisito[];
};

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function gerarCodigo(prefixo = "DTS") {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const s = Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join("");
  return `${prefixo}-${s.slice(0, 4)}-${s.slice(4)}`;
}

/** Requisitos de uma conta de cliente: RAT registrado, DPA assinado, subprocessadores mapeados. */
export async function requisitosConta(contaId: string): Promise<Requisito[]> {
  const [atividades, dpa, subs] = await Promise.all([
    db.query.atividadesTratamento.findMany({ where: eq(atividadesTratamento.contaClienteId, contaId) }),
    dpaVigente(contaId),
    db.query.contaSubprocessadores.findMany({
      where: and(eq(contaSubprocessadores.contaClienteId, contaId), eq(contaSubprocessadores.ativo, true)),
    }),
  ]);
  return [
    {
      label: "Registro de atividades (RAT)",
      ok: atividades.length > 0,
      detalhe: atividades.length > 0 ? `${atividades.length} atividade(s) registrada(s)` : "Nenhuma atividade registrada",
    },
    {
      label: "Contrato de operação de dados (DPA)",
      ok: !!dpa && situacaoDpa(dpa) === "assinado",
      detalhe: !dpa
        ? "Contrato não gerado"
        : situacaoDpa(dpa) === "assinado"
          ? `Assinado pela agência e pelo cliente em ${dataAssinaturaCompleta(dpa)!.toLocaleDateString("pt-BR")}`
          : ROTULO_SITUACAO[situacaoDpa(dpa)],
    },
    {
      label: "Registro de subprocessadores",
      ok: true,
      detalhe: `${subs.length} ferramenta(s) mapeada(s)`,
    },
  ];
}

/** Requisitos da própria agência: ter contas ativas e todas com RAT e DPA assinado. */
export async function requisitosAgencia(agenciaId: string): Promise<Requisito[]> {
  const contas = await db.query.contasCliente.findMany({ where: eq(contasCliente.agenciaId, agenciaId) });
  const ids = contas.map((c) => c.id);
  const [todosDpas, atividades] = ids.length
    ? await Promise.all([
        db.query.dpas.findMany({ where: and(inArray(dpas.contaClienteId, ids), filtroVigente) }),
        db.query.atividadesTratamento.findMany({ where: inArray(atividadesTratamento.contaClienteId, ids) }),
      ])
    : [[], []];
  const assinados = new Set(todosDpas.filter((d) => d.status === "assinado").map((d) => d.contaClienteId));
  const comRat = new Set(atividades.map((a) => a.contaClienteId));
  return [
    {
      label: "Contas de cliente documentadas",
      ok: contas.length > 0,
      detalhe: `${contas.length} conta(s) ativa(s) na Dattis`,
    },
    {
      label: "Registro de atividades (RAT) por conta",
      ok: contas.length > 0 && contas.every((c) => comRat.has(c.id)),
      detalhe: `${comRat.size} de ${contas.length} conta(s) com RAT`,
    },
    {
      label: "Contrato de operação (DPA) por conta",
      ok: contas.length > 0 && contas.every((c) => assinados.has(c.id)),
      detalhe: `${assinados.size} de ${contas.length} conta(s) com contrato assinado`,
    },
  ];
}

export async function statusCertificado(cert: Certificado): Promise<StatusCertificado> {
  const requisitos = cert.contaClienteId ? await requisitosConta(cert.contaClienteId) : await requisitosAgencia(cert.agenciaId);
  const valido = !cert.revogado && cert.validoAte.getTime() > Date.now();
  return { valido, emDia: valido && requisitos.every((r) => r.ok), requisitos };
}

export async function buscarPorCodigo(codigo: string) {
  return db.query.certificados.findFirst({ where: eq(certificados.codigo, codigo.toUpperCase()) });
}

/** Origem pública (https://dominio) a partir dos headers da requisição. */
export async function origemAtual() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3012";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
