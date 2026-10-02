import { equipeDaAgencia } from "@/lib/equipe";
import { ultimosRegistros } from "@/lib/registro";
import { dataBr, paraCsv, type Anexo } from "@/lib/exportacao";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pedidosTitular } from "@/lib/db/schema";
import { rotuloTipo, STATUS_PEDIDO } from "@/lib/titulares";

/** Equipe e registro de atividades para o pacote de exportação. */
export async function anexosDaEquipe(agenciaId: string): Promise<Anexo[]> {
  const [equipe, regs, pedidos] = await Promise.all([
    equipeDaAgencia(agenciaId),
    ultimosRegistros(agenciaId, 5000),
    db.query.pedidosTitular.findMany({ where: eq(pedidosTitular.agenciaId, agenciaId), orderBy: desc(pedidosTitular.criadoEm) }),
  ]);
  return [
    {
      caminho: "pedidos-de-titulares.csv",
      conteudo: paraCsv([
        ["Protocolo", "Recebido em", "Nome", "E-mail", "Pedido", "Mensagem", "Situação", "Prazo", "Encerrado em", "O que foi feito"],
        ...pedidos.map((p) => [p.protocolo, dataBr(p.criadoEm), p.nome, p.email, rotuloTipo(p.tipo), p.mensagem, STATUS_PEDIDO[p.status]?.rotulo ?? p.status, dataBr(p.prazo), dataBr(p.respondidoEm), p.resposta]),
      ]),
    },
    {
      caminho: "equipe.csv",
      conteudo: paraCsv([["Nome", "E-mail", "Situação", "Último acesso", "Desde"], ...equipe.map((u) => [u.nome, u.email, !u.ativo ? "desativado" : u.senhaHash ? "ativo" : "convite pendente", dataBr(u.ultimoAcesso), dataBr(u.criadoEm)])]),
    },
    {
      caminho: "registro-de-atividades-da-conta.csv",
      conteudo: paraCsv([["Data", "Quem", "E-mail", "Ação", "Detalhe"], ...regs.map((r) => [dataBr(r.criadoEm), r.autorNome, r.autorEmail, r.acao, r.detalhe])]),
    },
  ];
}
