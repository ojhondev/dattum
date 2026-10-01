// Migração aditiva (sem apagar dado): aceite dos termos, configurações da agência, assinatura do cliente
// no contrato, versões do contrato, redefinição de senha e link público do DAT.
// Uso: npx tsx scripts/migrar-2026-10-bloqueadores.mts
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { neon } from "@neondatabase/serverless";
import { FLOW_TEMPLATES } from "../lib/rat-templates";

const sql = neon(process.env.DATABASE_URL!);

const passos: string[] = [
  `alter table agencias add column if not exists senha_definida boolean not null default true`,
  `alter table agencias add column if not exists whatsapp text`,
  `alter table agencias add column if not exists endereco text`,
  `alter table agencias add column if not exists responsavel_nome text`,
  `alter table agencias add column if not exists responsavel_cargo text`,
  `alter table agencias add column if not exists termos_versao text`,
  `alter table agencias add column if not exists termos_aceitos_em timestamp`,
  `alter table agencias add column if not exists suspensa boolean not null default false`,

  `alter table contas_cliente add column if not exists contato_whatsapp text`,
  `alter table contas_cliente add column if not exists token_publico text`,
  `do $$ begin
     if not exists (select 1 from pg_constraint where conname = 'contas_cliente_token_publico_unique') then
       alter table contas_cliente add constraint contas_cliente_token_publico_unique unique (token_publico);
     end if;
   end $$`,

  `alter table atividades_tratamento add column if not exists fluxo text`,

  `alter table dpas add column if not exists hash_conteudo text`,
  `alter table dpas add column if not exists assinado_user_agent text`,
  `alter table dpas add column if not exists cliente_nome text`,
  `alter table dpas add column if not exists cliente_cargo text`,
  `alter table dpas add column if not exists cliente_email text`,
  `alter table dpas add column if not exists cliente_assinado_em timestamp`,
  `alter table dpas add column if not exists cliente_ip text`,
  `alter table dpas add column if not exists cliente_user_agent text`,
  `alter table dpas add column if not exists token_assinatura text`,
  `alter table dpas add column if not exists substituido_em timestamp`,
  `do $$ begin
     if not exists (select 1 from pg_constraint where conname = 'dpas_token_assinatura_unique') then
       alter table dpas add constraint dpas_token_assinatura_unique unique (token_assinatura);
     end if;
   end $$`,

  `create table if not exists redefinicoes_senha (
     id uuid primary key default gen_random_uuid(),
     agencia_id uuid not null references agencias(id) on delete cascade,
     token_hash text not null unique,
     origem text not null,
     expira_em timestamp not null,
     usado_em timestamp,
     criado_em timestamp not null default now()
   )`,
];

for (const p of passos) await sql.query(p);
console.log(`${passos.length} passos de schema aplicados.`);

// Atividades geradas antes da coluna "fluxo": identifica o fluxo pelo nome do modelo.
for (const [fluxo, t] of Object.entries(FLOW_TEMPLATES)) {
  const r = await sql.query(`update atividades_tratamento set fluxo = $1 where fluxo is null and nome_atividade = $2 returning id`, [fluxo, t.nomeAtividade]);
  if (r.length) console.log(`fluxo ${fluxo}: ${r.length} atividade(s)`);
}

// Contratos assinados antes da assinatura do cliente existir: a única assinatura vale pelas duas partes.
const legados = await sql.query(
  `update dpas set cliente_nome = assinante_nome, cliente_cargo = assinante_cargo, cliente_assinado_em = assinado_em, cliente_ip = assinado_ip
   where status = 'assinado' and cliente_assinado_em is null returning id`,
);
console.log(`${legados.length} contrato(s) legado(s) marcados como assinados pelas duas partes.`);
