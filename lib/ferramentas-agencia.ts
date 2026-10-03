import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { contaSubprocessadores, subprocessadoresCatalogo } from "@/lib/db/schema";
import { CATEGORIAS_FERRAMENTA, slugFerramenta, type FerramentaCatalogo } from "@/lib/ferramentas";
import { normalizarSite } from "@/lib/contas";

// Ferramentas que a própria agência cadastra (nome, link e categoria). Ficam no mesmo catálogo
// dos subprocessadores, com agencia_id: só essa agência vê, e elas entram no seletor de cada cliente.

export type FerramentaDaAgencia = FerramentaCatalogo & { id: string; site: string | null; daAgencia: true };

const PAIS_NAO_INFORMADO = "Não informado";

export async function ferramentasDaAgencia(agenciaId: string): Promise<FerramentaDaAgencia[]> {
  const rows = await db.query.subprocessadoresCatalogo.findMany({
    where: eq(subprocessadoresCatalogo.agenciaId, agenciaId),
    orderBy: (t, { asc }) => asc(t.nome),
  });
  return rows.map((r) => ({
    id: r.id,
    chave: r.chave,
    nome: r.nome,
    categoria: r.categoria,
    categoriaId: CATEGORIAS_FERRAMENTA.find((c) => c.nome === r.categoria)?.id ?? "",
    pais: r.pais,
    finalidadePadrao: r.finalidadePadrao,
    site: r.site,
    daAgencia: true,
  }));
}

export async function cadastrarFerramenta(agenciaId: string, dados: { nome: string; site: string | null; categoriaId: string }) {
  const nome = dados.nome.trim().slice(0, 80);
  if (!nome) return { erro: "Informe o nome da ferramenta." };
  const categoria = CATEGORIAS_FERRAMENTA.find((c) => c.id === dados.categoriaId);
  if (!categoria) return { erro: "Escolha a categoria." };
  const site = dados.site?.trim() ? normalizarSite(dados.site) : null;
  if (dados.site?.trim() && !site) return { erro: "O link não parece um endereço válido (ex.: ferramenta.com.br)." };

  const chave = `ag-${agenciaId.slice(0, 8)}-${slugFerramenta(nome)}`;
  const existe = await db.query.subprocessadoresCatalogo.findFirst({ where: eq(subprocessadoresCatalogo.chave, chave) });
  if (existe) return { erro: "Essa ferramenta já está cadastrada." };

  const [f] = await db
    .insert(subprocessadoresCatalogo)
    .values({ chave, nome, categoria: categoria.nome, pais: PAIS_NAO_INFORMADO, finalidadePadrao: categoria.finalidade, agenciaId, site })
    .returning();
  return { ferramenta: f };
}

/**
 * Exclui a ferramenta da agência. Clientes que já usam continuam com ela pelo nome
 * (vira ferramenta informada), para o contrato e o histórico não perderem a referência.
 */
export async function excluirFerramenta(agenciaId: string, id: string) {
  const f = await db.query.subprocessadoresCatalogo.findFirst({ where: and(eq(subprocessadoresCatalogo.id, id), eq(subprocessadoresCatalogo.agenciaId, agenciaId)) });
  if (!f) return null;
  await db.update(contaSubprocessadores).set({ subprocessadorCatalogoId: null, nomeCustomizado: f.nome }).where(eq(contaSubprocessadores.subprocessadorCatalogoId, f.id));
  await db.delete(subprocessadoresCatalogo).where(eq(subprocessadoresCatalogo.id, f.id));
  return f;
}
