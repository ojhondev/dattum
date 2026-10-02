import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { erros } from "@/lib/db/schema";

// Monitoramento de erros sem serviço externo: cada erro vira uma linha por "assinatura"
// (tipo + mensagem + rota sem ids), com contagem e última ocorrência. Erro resolvido que volta reabre.

const rotaSemIds = (r: string) =>
  r.split("?")[0].replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ":id").replace(/\/[A-Za-z0-9_-]{20,}(?=\/|$)/g, "/:token");

export async function registrarErro(e: { tipo: "servidor" | "navegador"; mensagem: string; rota?: string | null; metodo?: string | null; digest?: string | null; pilha?: string | null }) {
  try {
    const mensagem = (e.mensagem || "Erro sem mensagem").slice(0, 500);
    const rota = e.rota ? rotaSemIds(e.rota).slice(0, 200) : null;
    const assinatura = createHash("sha256").update(`${e.tipo}|${mensagem}|${rota ?? ""}`).digest("hex").slice(0, 32);
    await db
      .insert(erros)
      .values({ assinatura, tipo: e.tipo, mensagem, rota, metodo: e.metodo ?? null, digest: e.digest ?? null, pilha: e.pilha?.slice(0, 3000) ?? null })
      .onConflictDoUpdate({
        target: erros.assinatura,
        set: { ocorrencias: sql`${erros.ocorrencias} + 1`, ultimaVez: new Date(), resolvido: false, digest: e.digest ?? null },
      });
  } catch (x) {
    console.error("[erros] não foi possível registrar", x);
  }
}
