import { gzipSync } from "node:zlib";
import { eq } from "drizzle-orm";
import { put, list, del } from "@vercel/blob";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";

// Backup externo: cópia completa do banco (JSON compactado) num armazenamento PRIVADO da Vercel,
// independente do Neon. Liga quando existir BACKUP_READ_WRITE_TOKEN (store Blob privado com prefixo BACKUP).

const MANTER = 12; // semanas
const CHAVE = "ultimo_backup";

const TABELAS = {
  agencias: s.agencias,
  usuarios: s.usuarios,
  contas_cliente: s.contasCliente,
  atividades_tratamento: s.atividadesTratamento,
  subprocessadores_catalogo: s.subprocessadoresCatalogo,
  conta_subprocessadores: s.contaSubprocessadores,
  dpas: s.dpas,
  certificados: s.certificados,
  codigos_ativacao: s.codigosAtivacao,
  cobrancas: s.cobrancas,
  pedidos_titular: s.pedidosTitular,
  consentimentos: s.consentimentos,
  registros: s.registros,
  leads_auditoria: s.leadsAuditoria,
  autores: s.autores,
  posts: s.posts,
  configuracoes: s.configuracoes,
  redefinicoes_senha: s.redefinicoesSenha,
  varreduras: s.varreduras,
  varredura_resultados: s.varreduraResultados,
} as const;

export const backupConfigurado = () => !!process.env.BACKUP_READ_WRITE_TOKEN;

export type InfoBackup = { em: string; arquivo: string; bytes: number; linhas: number; tabelas: number };

export async function ultimoBackup(): Promise<InfoBackup | null> {
  const r = await db.query.configuracoes.findFirst({ where: eq(s.configuracoes.chave, CHAVE) });
  try {
    return r ? (JSON.parse(r.valor) as InfoBackup) : null;
  } catch {
    return null;
  }
}

export async function fazerBackup(): Promise<{ ok: true; info: InfoBackup } | { ok: false; erro: string }> {
  const token = process.env.BACKUP_READ_WRITE_TOKEN;
  if (!token) return { ok: false, erro: "Backup externo não configurado (falta BACKUP_READ_WRITE_TOKEN)." };

  const dados: Record<string, unknown[]> = {};
  let linhas = 0;
  for (const [nome, tabela] of Object.entries(TABELAS)) {
    const rows = await db.select().from(tabela);
    dados[nome] = rows;
    linhas += rows.length;
  }
  const corpo = gzipSync(Buffer.from(JSON.stringify({ geradoEm: new Date().toISOString(), versao: 1, dados })));
  const arquivo = `backups/dattis-${new Date().toISOString().replace(/[:.]/g, "-")}.json.gz`;
  await put(arquivo, corpo, { access: "private", token, contentType: "application/gzip", addRandomSuffix: false });

  // Retenção: mantém as últimas 12 cópias.
  const { blobs } = await list({ prefix: "backups/", token });
  const antigos = blobs.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()).slice(MANTER);
  if (antigos.length) await del(antigos.map((b) => b.url), { token });

  const info: InfoBackup = { em: new Date().toISOString(), arquivo, bytes: corpo.length, linhas, tabelas: Object.keys(TABELAS).length };
  await db
    .insert(s.configuracoes)
    .values({ chave: CHAVE, valor: JSON.stringify(info) })
    .onConflictDoUpdate({ target: s.configuracoes.chave, set: { valor: JSON.stringify(info), atualizadoEm: new Date() } });
  return { ok: true, info };
}
