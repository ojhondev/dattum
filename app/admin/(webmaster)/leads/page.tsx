import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { leadsAuditoria } from "@/lib/db/schema";
import { formatarTelefone, linkWhatsappPara } from "@/lib/contato";
import { ExportarCsv } from "../AcoesAdmin";

export const dynamic = "force-dynamic";

const TH = "border-b border-line px-4 py-3 text-left font-mono text-[12px] font-normal uppercase tracking-[0.04em] text-muted";
const TD = "border-b border-line px-4 py-3.5 align-middle";

const NIVEL_PILL: Record<string, string> = { Baixo: "pill-ok", Médio: "pill-info", Alto: "pill-warn", Crítico: "pill-danger" };

export default async function AdminLeads() {
  const leads = await db.query.leadsAuditoria.findMany({ orderBy: desc(leadsAuditoria.createdAt), limit: 1000 });
  const concluidos = leads.filter((l) => l.concluidoEm);
  const enviados = leads.filter((l) => l.enviadoEspecialistaEm).length;
  const scoreMedio = concluidos.length ? Math.round(concluidos.reduce((s, l) => s + (l.score ?? 0), 0) / concluidos.length) : null;

  return (
    <div className="max-w-7xl">
      <p className="t-eyebrow">WebMaster · Leads</p>
      <h1 className="t-display mt-3 max-w-3xl">Leads da Auditoria da sua agência</h1>
      <p className="mt-4 max-w-2xl text-body leading-relaxed text-body">
        Quem começou a auditoria no site: responsável, agência e WhatsApp, com o resultado quando concluída. Use pra
        remarketing e abordagem comercial.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <span className="tag">{leads.length} lead(s)</span>
        <span className="tag tag-white border border-line">{concluidos.length} concluíram</span>
        <span className="tag tag-white border border-line">{enviados} enviaram ao especialista</span>
        {scoreMedio != null && <span className="tag tag-white border border-line">Exposição média {scoreMedio}%</span>}
        <span className="ml-auto">
          <ExportarCsv
            nome="dattis-leads-auditoria.csv"
            linhas={[
              ["Data", "Responsável", "Agência", "WhatsApp", "Score", "Nível", "Pressão dos clientes", "Enviou ao especialista", "Origem (utm_source)", "Campanha (utm_campaign)"],
              ...leads.map((l) => [
                l.createdAt.toLocaleString("pt-BR"),
                l.nome,
                l.agencia,
                formatarTelefone(l.whatsapp),
                l.score,
                l.nivel,
                l.sinalComercial,
                l.enviadoEspecialistaEm ? "sim" : "não",
                l.utm?.utm_source ?? "",
                l.utm?.utm_campaign ?? "",
              ]),
            ]}
          />
        </span>
      </div>

      <div className="card-flush mt-6 overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-body-sm">
          <thead>
            <tr className="bg-surface-2">
              <th className={TH}>Data</th>
              <th className={TH}>Responsável</th>
              <th className={TH}>Agência</th>
              <th className={TH}>WhatsApp</th>
              <th className={TH}>Resultado</th>
              <th className={TH}>Pressão</th>
              <th className={TH}>Status</th>
              <th className={TH}>Origem</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => {
              const wa = linkWhatsappPara(
                l.whatsapp,
                `Olá, ${l.nome.split(" ")[0]}! Aqui é da Dattis. Vi que você fez a Auditoria da sua agência${l.score != null ? ` e a ${l.agencia} ficou com ${l.score}% de exposição` : ""}. Posso te mostrar o que corrigir primeiro?`,
              );
              return (
                <tr key={l.id} className="transition-colors last:[&>td]:border-b-0 hover:bg-surface-2">
                  <td className={TD + " whitespace-nowrap text-muted"}>{l.createdAt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className={TD + " font-medium text-ink"}>{l.nome}</td>
                  <td className={TD}>{l.agencia}</td>
                  <td className={TD + " whitespace-nowrap"}>
                    {wa ? (
                      <a href={wa} target="_blank" rel="noopener" className="text-brand-ink hover:underline">
                        {formatarTelefone(l.whatsapp)}
                      </a>
                    ) : (
                      l.whatsapp
                    )}
                  </td>
                  <td className={TD}>
                    {l.score != null ? (
                      <span className={"pill tabular-nums " + (NIVEL_PILL[l.nivel ?? ""] ?? "pill-neutral")}>
                        {l.score}% · {l.nivel}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className={TD}>{l.sinalComercial ?? "—"}</td>
                  <td className={TD}>
                    {l.enviadoEspecialistaEm ? (
                      <span className="pill pill-ok">Enviou ao especialista</span>
                    ) : l.concluidoEm ? (
                      <span className="pill pill-info">Concluiu</span>
                    ) : (
                      <span className="pill pill-warn">Parou no meio</span>
                    )}
                  </td>
                  <td className={TD + " text-muted"}>{l.utm?.utm_source ?? "direto"}</td>
                </tr>
              );
            })}
            {leads.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted">
                  Nenhum lead ainda. Eles aparecem aqui assim que alguém começa a auditoria em /diagnostico.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
