import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { configuracoes } from "@/lib/db/schema";
import { isAdmin } from "@/lib/admin";
import { CHAVES_CONFIG } from "@/lib/blog";

export const runtime = "nodejs";

/** Aceita o código puro ou a tag <meta ... content="..."> inteira colada do Search Console. */
const extrairConteudo = (v: string) => v.match(/content=["']([^"']+)["']/)?.[1] ?? v;

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  const b = await req.json().catch(() => null);
  for (const chave of CHAVES_CONFIG) {
    if (typeof b?.[chave] !== "string") continue;
    let valor = (b[chave] as string).trim().slice(0, 600);
    if (chave.endsWith("_verificacao")) valor = extrairConteudo(valor).trim();
    await db
      .insert(configuracoes)
      .values({ chave, valor })
      .onConflictDoUpdate({ target: configuracoes.chave, set: { valor, atualizadoEm: new Date() } });
  }
  revalidateTag("configuracoes", { expire: 0 });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
