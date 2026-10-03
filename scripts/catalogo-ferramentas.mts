// Migração aditiva + catálogo de ferramentas.
// 1) conta_subprocessadores.origem: "fluxo" (veio das operações marcadas) ou "manual" (a agência escolheu).
//    Editar as operações só remove as de origem "fluxo"; as escolhidas pela agência ficam.
// 2) agencias.onboarding_concluido_em: quando a agência terminou o primeiro preenchimento guiado.
//    Agências que já têm cliente contam como concluídas.
// 3) Upsert do catálogo de lib/ferramentas.ts em subprocessadores_catalogo (pela chave).
// Uso: npx tsx scripts/catalogo-ferramentas.mts
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { neon } from "@neondatabase/serverless";
import { CATALOGO_FERRAMENTAS } from "../lib/ferramentas";

const sql = neon(process.env.DATABASE_URL!);

const repetidas = CATALOGO_FERRAMENTAS.map((f) => f.chave).filter((k, i, a) => a.indexOf(k) !== i);
if (repetidas.length) throw new Error("Chaves repetidas no catálogo: " + repetidas.join(", "));

await sql.query(`alter table conta_subprocessadores add column if not exists origem text not null default 'fluxo'`);
await sql.query(`alter table agencias add column if not exists onboarding_concluido_em timestamp`);
await sql.query(
  `update agencias set onboarding_concluido_em = now()
   where onboarding_concluido_em is null and exists (select 1 from contas_cliente c where c.agencia_id = agencias.id)`,
);

for (const f of CATALOGO_FERRAMENTAS) {
  await sql.query(
    `insert into subprocessadores_catalogo (chave, nome, categoria, pais, finalidade_padrao)
     values ($1, $2, $3, $4, $5)
     on conflict (chave) do update set nome = excluded.nome, categoria = excluded.categoria, pais = excluded.pais, finalidade_padrao = excluded.finalidade_padrao`,
    [f.chave, f.nome, f.categoria, f.pais, f.finalidadePadrao],
  );
}
const [{ n }] = (await sql.query(`select count(*)::int as n from subprocessadores_catalogo`)) as { n: number }[];
console.log(`Catálogo: ${CATALOGO_FERRAMENTAS.length} ferramentas gravadas, ${n} no banco.`);
