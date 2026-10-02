import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { erros } from "@/lib/db/schema";
import { backupConfigurado, ultimoBackup } from "@/lib/backup";
import { agoraMs } from "@/lib/utils";
import { BackupAgora, ResolverErro } from "./AcoesSistema";

export const dynamic = "force-dynamic";

const CARD = "rounded-[20px] border border-line bg-surface p-5 sm:p-6";
const dataHora = (d: Date) => d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

/** Saúde da plataforma: erros capturados (servidor e navegador) e backups externos. */
export default async function AdminSistema() {
  const [lista, backup] = await Promise.all([db.query.erros.findMany({ orderBy: desc(erros.ultimaVez), limit: 100 }), ultimoBackup()]);
  const agora = agoraMs();
  const abertos = lista.filter((e) => !e.resolvido);
  const ultimas24 = abertos.filter((e) => agora - e.ultimaVez.getTime() < 86_400_000).length;
  const configurado = backupConfigurado();
  const backupVelho = backup ? agora - new Date(backup.em).getTime() > 8 * 86_400_000 : true;

  return (
    <div className="max-w-6xl">
      <p className="t-eyebrow">WebMaster · Sistema</p>
      <h1 className="t-display mt-3 max-w-3xl">Saúde da plataforma</h1>
      <p className="mt-4 max-w-2xl text-body leading-relaxed text-body">
        Erros de qualquer tela ou rota são registrados aqui automaticamente, agrupados e com contagem. O backup externo copia o banco inteiro toda
        semana para um armazenamento privado, separado do banco.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className={CARD}>
          <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-muted">Erros em aberto</p>
          <p className="mt-2 font-display text-[34px] tabular-nums text-ink">{abertos.length}</p>
          <p className="text-[14px] text-muted">{ultimas24} com ocorrência nas últimas 24 horas</p>
        </section>
        <section className={CARD}>
          <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-muted">Backup externo</p>
          {!configurado ? (
            <>
              <p className="mt-2 font-display text-[22px] text-ink">Não configurado</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-[13.5px] leading-relaxed text-body">
                <li>Na Vercel, abra o projeto dattum → Storage → Create Database → Blob.</li>
                <li>
                  Nome <b>dattis-backups</b>, acesso <b>Private</b>.
                </li>
                <li>
                  Ao conectar ao projeto, use o prefixo de variável <b>BACKUP</b> (cria <code className="font-mono">BACKUP_READ_WRITE_TOKEN</code>).
                </li>
                <li>Republique o site: o backup semanal liga sozinho.</li>
              </ol>
            </>
          ) : (
            <>
              <p className="mt-2 font-display text-[22px] text-ink">{backup ? dataHora(new Date(backup.em)) : "Nenhum backup ainda"}</p>
              {backup && (
                <p className="text-[14px] text-muted">
                  {backup.linhas.toLocaleString("pt-BR")} registros · {backup.tabelas} tabelas · {(backup.bytes / 1024).toFixed(0)} KB
                </p>
              )}
              {backupVelho && <p className="mt-1 text-[13px] text-danger">O último backup tem mais de 8 dias.</p>}
              <p className="mt-1 text-[13px] text-muted">Automático todo domingo às 4h · guarda as últimas 12 semanas.</p>
            </>
          )}
          <div className="mt-4">
            <BackupAgora ativo={configurado} />
          </div>
        </section>
      </div>

      <section className={CARD + " mt-6"}>
        <h2 className="font-display text-[22px] text-ink">Erros registrados</h2>
        {lista.length === 0 ? (
          <p className="mt-4 rounded-xl bg-canvas px-4 py-6 text-center text-[14px] text-muted">Nenhum erro registrado. Tudo funcionando.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {lista.map((e) => (
              <li key={e.assinatura} className={"rounded-xl bg-canvas px-4 py-3 " + (e.resolvido ? "opacity-60" : "")}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-[14px] font-medium text-ink">{e.mensagem}</span>
                    <span className="block font-mono text-[12px] text-muted">
                      {e.tipo} · {e.rota ?? "—"}
                      {e.metodo ? ` · ${e.metodo}` : ""}
                      {e.digest ? ` · digest ${e.digest}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-[12.5px] text-muted">
                    {e.ocorrencias}× · última {dataHora(e.ultimaVez)}
                    {!e.resolvido && (
                      <span className="mt-1 block">
                        <ResolverErro assinatura={e.assinatura} />
                      </span>
                    )}
                  </span>
                </div>
                {e.pilha && (
                  <details className="mt-2 text-[12px]">
                    <summary className="cursor-pointer text-muted">Detalhes técnicos</summary>
                    <pre className="mt-2 max-h-60 overflow-auto whitespace-pre-wrap rounded-lg bg-rail p-3 font-mono text-[11px] text-[#cff5e1]">{e.pilha}</pre>
                  </details>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
