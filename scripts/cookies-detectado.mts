// Migração aditiva: quando e onde o aviso de cookies foi visto funcionando de verdade num site.
// Preenchido sozinho quando o site carrega /c/{token}.js ou quando um visitante faz uma escolha.
// Uso: npx tsx scripts/cookies-detectado.mts
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
for (const t of ["agencias", "contas_cliente"]) {
  await sql.query(`alter table ${t} add column if not exists cookies_detectado_em timestamp`);
  await sql.query(`alter table ${t} add column if not exists cookies_detectado_url text`);
}
// Quem já tem escolhas registradas está instalado: marca pela última escolha.
await sql.query(`update contas_cliente c set cookies_detectado_em = x.quando, cookies_detectado_url = x.url
  from (select token, max(criado_em) as quando, (array_agg(url order by criado_em desc))[1] as url from consentimentos group by token) x
  where c.cookies_token = x.token and c.cookies_detectado_em is null`);
await sql.query(`update agencias a set cookies_detectado_em = x.quando, cookies_detectado_url = x.url
  from (select token, max(criado_em) as quando, (array_agg(url order by criado_em desc))[1] as url from consentimentos group by token) x
  where a.cookies_token = x.token and a.cookies_detectado_em is null`);
console.log("ok");
