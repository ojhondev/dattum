import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ipDe } from "@/lib/dpa";

// Limite de tentativas por janela, guardado no banco (funciona entre as instâncias serverless).
// Uma única consulta atômica: abre a janela, soma a tentativa ou reinicia a contagem se a janela venceu.

export async function excedeuLimite(chave: string, maximo: number, janelaSegundos: number) {
  try {
    const r = await db.execute(sql`
      insert into limites (chave, contagem, inicio) values (${chave}, 1, now())
      on conflict (chave) do update set
        contagem = case when limites.inicio < now() - make_interval(secs => ${janelaSegundos}) then 1 else limites.contagem + 1 end,
        inicio = case when limites.inicio < now() - make_interval(secs => ${janelaSegundos}) then now() else limites.inicio end
      returning contagem`);
    const contagem = Number((r.rows?.[0] as { contagem?: number } | undefined)?.contagem ?? 0);
    return contagem > maximo;
  } catch (err) {
    // Se o limitador falhar, não derruba o login: só registra.
    console.error("[limite]", err);
    return false;
  }
}

export const respostaLimite = (minutos: number) =>
  NextResponse.json({ ok: false, error: `Muitas tentativas. Espere ${minutos} minutos e tente de novo.` }, { status: 429 });

/** Atalho por IP. Ex.: `if (await limitarIp(req, "entrar", 20, 900)) return respostaLimite(15)`. */
export const limitarIp = (req: Request, rota: string, maximo: number, janelaSegundos: number) => excedeuLimite(`${rota}:ip:${ipDe(req)}`, maximo, janelaSegundos);
