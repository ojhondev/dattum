// Migração aditiva: ferramentas próprias de cada agência no mesmo catálogo de subprocessadores.
// agencia_id null = catálogo da Dattis (todas as agências veem); preenchido = só aquela agência.
// Uso: npx tsx scripts/ferramentas-da-agencia.mts
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
await sql.query(`alter table subprocessadores_catalogo add column if not exists agencia_id uuid references agencias(id) on delete cascade`);
await sql.query(`alter table subprocessadores_catalogo add column if not exists site text`);
await sql.query(`create index if not exists subprocessadores_catalogo_agencia_idx on subprocessadores_catalogo (agencia_id)`);
console.log("ok");
