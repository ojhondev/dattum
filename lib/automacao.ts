import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, certificados, contasCliente } from "@/lib/db/schema";
import { gerarCodigo, requisitosAgencia, requisitosConta } from "@/lib/certificados";
import { planoPermite } from "@/lib/planos";

const DIA = 86_400_000;
const RENOVAR_COM_DIAS = 30;

const dominioDe = (site: string | null) => {
  if (!site) return null;
  try {
    return new URL(site).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
};

const umAno = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d;
};

/**
 * Certificados no automático: emite quando a conta (ou a agência) cumpre os requisitos
 * e renova perto do vencimento mantendo o MESMO código — o selo já colado no site continua valendo.
 * Roda depois de assinar contrato, ao abrir Certificados e na varredura diária.
 */
export async function automatizarCertificados(agenciaId: string) {
  const [agencia, contas, certs] = await Promise.all([
    db.query.agencias.findFirst({ where: eq(agencias.id, agenciaId) }),
    db.query.contasCliente.findMany({ where: eq(contasCliente.agenciaId, agenciaId) }),
    db.query.certificados.findMany({ where: and(eq(certificados.agenciaId, agenciaId), eq(certificados.revogado, false)) }),
  ]);
  // Certificado é do Growth em diante e só para conta ativada (em exploração nada é emitido).
  if (!agencia || !agencia.ativadaEm || !planoPermite(agencia.plano, "certificado")) return { emitidos: 0, renovados: 0 };

  let emitidos = 0;
  let renovados = 0;
  const agora = Date.now();

  const garantir = async (contaId: string | null, titular: string, dominio: string | null) => {
    const reqs = contaId ? await requisitosConta(contaId) : await requisitosAgencia(agenciaId);
    if (!reqs.every((r) => r.ok)) return;
    const atual = certs
      .filter((c) => (c.contaClienteId ?? null) === contaId)
      .sort((a, b) => b.validoAte.getTime() - a.validoAte.getTime())[0];

    if (!atual) {
      await db.insert(certificados).values({ agenciaId, contaClienteId: contaId, codigo: gerarCodigo(), titular, dominio, validoAte: umAno(), automatico: true });
      emitidos++;
      return;
    }
    const restante = atual.validoAte.getTime() - agora;
    if (restante < RENOVAR_COM_DIAS * DIA) {
      await db
        .update(certificados)
        .set({ validoAte: umAno(), titular, dominio: atual.dominio ?? dominio, automatico: true })
        .where(eq(certificados.id, atual.id));
      renovados++;
    } else if (!atual.dominio && dominio) {
      await db.update(certificados).set({ dominio }).where(eq(certificados.id, atual.id));
    }
  };

  for (const c of contas) await garantir(c.id, c.nome, dominioDe(c.site));
  if (contas.length) await garantir(null, agencia.nome, null);
  return { emitidos, renovados };
}

export async function automatizarTodas() {
  const lista = await db.select({ id: agencias.id }).from(agencias);
  let emitidos = 0;
  let renovados = 0;
  for (const a of lista) {
    const r = await automatizarCertificados(a.id);
    emitidos += r.emitidos;
    renovados += r.renovados;
  }
  return { emitidos, renovados };
}
