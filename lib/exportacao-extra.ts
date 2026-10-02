import { equipeDaAgencia } from "@/lib/equipe";
import { ultimosRegistros } from "@/lib/registro";
import { dataBr, paraCsv, type Anexo } from "@/lib/exportacao";

/** Equipe e registro de atividades para o pacote de exportação. */
export async function anexosDaEquipe(agenciaId: string): Promise<Anexo[]> {
  const [equipe, regs] = await Promise.all([equipeDaAgencia(agenciaId), ultimosRegistros(agenciaId, 5000)]);
  return [
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
