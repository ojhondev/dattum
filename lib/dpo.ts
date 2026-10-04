import { lerConfiguracoes } from "@/lib/blog";

/** Nome do DPO da Dattis que aparece nos registros das agências (Configurações do site → encarregado). */
export async function nomeDoDpo() {
  const cfg = await lerConfiguracoes().catch(() => ({}) as Record<string, string>);
  return (cfg as Record<string, string | undefined>).encarregado_nome?.trim() || "Equipe Dattis";
}
