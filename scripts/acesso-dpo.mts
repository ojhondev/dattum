// Migração aditiva do multiacesso do DPO da Dattis.
// acesso_dattis: a agência autorizou a equipe Dattis a operar a conta (ela liga e desliga).
// servico_dpo: serviço de DPO contratado como adicional (no Scale já vem incluso).
// dattis_ultimo_acesso: última vez que o DPO entrou na conta.
// Uso: npx tsx scripts/acesso-dpo.mts
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
await sql.query(`alter table agencias add column if not exists acesso_dattis boolean not null default false`);
await sql.query(`alter table agencias add column if not exists acesso_dattis_em timestamp`);
await sql.query(`alter table agencias add column if not exists servico_dpo boolean not null default false`);
await sql.query(`alter table agencias add column if not exists dattis_ultimo_acesso timestamp`);
console.log("ok");
