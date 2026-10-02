import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, certificados, contasCliente, dpas } from "@/lib/db/schema";

export type Passo = { titulo: string; detalhe: string; feito: boolean; href: string };

/** Checklist do primeiro acesso, marcado sozinho a partir do que a agência já fez. */
export async function primeirosPassos(agenciaId: string): Promise<Passo[]> {
  const [agencia, contas, contratos, certs] = await Promise.all([
    db.query.agencias.findFirst({ where: eq(agencias.id, agenciaId) }),
    db.select({ id: contasCliente.id, politica: contasCliente.politicaPublicadaEm }).from(contasCliente).where(eq(contasCliente.agenciaId, agenciaId)),
    db
      .select({ agencia: dpas.assinadoEm, cliente: dpas.clienteAssinadoEm })
      .from(dpas)
      .where(and(eq(dpas.agenciaId, agenciaId), isNull(dpas.substituidoEm))),
    db.select({ id: certificados.id }).from(certificados).where(and(eq(certificados.agenciaId, agenciaId), eq(certificados.revogado, false), isNotNull(certificados.contaClienteId))),
  ]);
  if (!agencia) return [];
  const primeira = contas[0]?.id;
  const growth = agencia.plano !== "start";

  const passos: Passo[] = [
    {
      titulo: "Preencher os dados da agência",
      detalhe: "CNPJ, endereço e responsável entram em todos os contratos.",
      feito: !!(agencia.cnpj && agencia.responsavelNome),
      href: "/painel/configuracoes",
    },
    {
      titulo: "Cadastrar o primeiro cliente",
      detalhe: "Marque o que a agência faz com os dados dele; a documentação sai na hora.",
      feito: contas.length > 0,
      href: "/painel/contas/novo",
    },
    {
      titulo: "Assinar o contrato pela agência",
      detalhe: "Na aba “Contrato com o cliente” de cada conta.",
      feito: contratos.some((c) => c.agencia),
      href: primeira ? `/painel/contas/${primeira}?aba=dpa` : "/painel/contas",
    },
    {
      titulo: "Mandar o link para o cliente assinar",
      detalhe: "Ele assina pelo celular, sem criar conta.",
      feito: contratos.some((c) => c.cliente),
      href: primeira ? `/painel/contas/${primeira}?aba=dpa` : "/painel/contas",
    },
  ];
  if (growth) {
    passos.push(
      {
        titulo: "Publicar a política de privacidade",
        detalhe: "Cole o link no rodapé do site e no formulário de anúncio.",
        feito: !!agencia.politicaPublicadaEm || contas.some((c) => c.politica),
        href: primeira ? `/painel/contas/${primeira}` : "/painel/configuracoes",
      },
      {
        titulo: "Colocar o selo no site",
        detalhe: "O certificado sai sozinho quando o contrato tem as duas assinaturas.",
        feito: certs.length > 0,
        href: "/painel/certificados",
      },
    );
  }
  return passos;
}
