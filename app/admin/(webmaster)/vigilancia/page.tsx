import { desc, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, codigosAtivacao, varreduras } from "@/lib/db/schema";
import { ultimosResultados } from "@/lib/vigilancia";
import { linkWhatsappPara } from "@/lib/contato";
import { NotaVigilancia, ContagemSeveridades } from "@/components/app/VigilanciaChips";
import { ListaAchados } from "@/components/app/ListaAchados";
import { RodarVarredura } from "../AcoesAdmin";

export const dynamic = "force-dynamic";

const TH = "border-b border-line px-4 py-3 text-left font-mono text-[12px] font-normal uppercase tracking-[0.04em] text-muted";
const TD = "border-b border-line px-4 py-3";

export default async function AdminVigilancia({ searchParams }: { searchParams: Promise<{ filtro?: string }> }) {
  const { filtro } = await searchParams;
  const [historico, resultados] = await Promise.all([
    db.query.varreduras.findMany({ orderBy: desc(varreduras.iniciadaEm), limit: 15 }),
    ultimosResultados(),
  ]);
  const agIds = [...new Set(resultados.map((r) => r.agenciaId))];
  const [ags, codigos] = agIds.length
    ? await Promise.all([
        db.select({ id: agencias.id, nome: agencias.nome }).from(agencias).where(inArray(agencias.id, agIds)),
        db.select({ ag: codigosAtivacao.agenciaId, contato: codigosAtivacao.clienteContato }).from(codigosAtivacao).where(inArray(codigosAtivacao.agenciaId, agIds)),
      ])
    : [[], []];
  const nomeAg = new Map(ags.map((a) => [a.id, a.nome]));
  const contatoAg = new Map(codigos.filter((c) => c.contato).map((c) => [c.ag, c.contato]));

  const lista = [...resultados]
    .filter((r) => (filtro === "alertas" ? r.criticos + r.altos > 0 : true))
    .sort((a, b) => a.nota - b.nota);
  const totais = resultados.reduce(
    (s, r) => ({ criticos: s.criticos + r.criticos, altos: s.altos + r.altos, medios: s.medios + r.medios }),
    { criticos: 0, altos: 0, medios: 0 },
  );

  return (
    <div className="max-w-7xl">
      <p className="t-eyebrow">WebMaster · Vigilância</p>
      <h1 className="t-display mt-3 max-w-3xl">Varredura de segurança diária</h1>
      <p className="mt-4 max-w-2xl text-body leading-relaxed text-body">
        Todo dia às 6h a Dattis visita o site de cada cliente de cada agência e confere HTTPS, certificado SSL, pixel sem banner
        de cookies, formulário sem política de privacidade, cabeçalhos de segurança, selo e documentação (contrato, registro,
        ferramentas). Plano Start: só documentação.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <RodarVarredura />
        <ContagemSeveridades {...totais} />
      </div>

      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="t-heading-lg">Situação atual</h2>
          <div className="flex gap-2">
            <a href="/admin/vigilancia" className={"tag " + (filtro === "alertas" ? "tag-white border border-line" : "")}>
              Todos ({resultados.length})
            </a>
            <a href="/admin/vigilancia?filtro=alertas" className={"tag " + (filtro === "alertas" ? "" : "tag-white border border-line")}>
              Com alerta
            </a>
          </div>
        </div>

        {lista.length === 0 ? (
          <div className="block-card mt-6 p-10 text-body text-body">Nenhum resultado ainda. Rode a primeira varredura.</div>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            {lista.map((r) => {
              const agencia = nomeAg.get(r.agenciaId) ?? "—";
              const alertas = r.achados.filter((a) => a.severidade === "critico" || a.severidade === "alto");
              const msg =
                `Olá! Aqui é da Dattis. A vigilância diária encontrou ${alertas.length} alerta(s) em ${r.titular}` +
                (r.alvo ? ` (${r.alvo.replace(/^https?:\/\//, "")})` : "") +
                ":\n" +
                alertas.map((a) => `• ${a.titulo}`).join("\n") +
                "\n\nOs detalhes e como corrigir estão no painel, na aba Vigilância.";
              const wa = alertas.length ? linkWhatsappPara(contatoAg.get(r.agenciaId), msg) : null;
              return (
                <details key={r.id} className="rounded-[24px] border border-line bg-surface">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
                    <NotaVigilancia nota={r.nota} compacto />
                    <span className="min-w-[200px] flex-1">
                      <span className="block font-medium text-ink">
                        {r.titular} <span className="font-normal text-muted">· {agencia}</span>
                      </span>
                      <span className="block text-[13px] text-muted">
                        {r.alvo ? r.alvo.replace(/^https?:\/\//, "") : "sem site"} · {r.verificadoEm.toLocaleString("pt-BR")}
                      </span>
                    </span>
                    <ContagemSeveridades criticos={r.criticos} altos={r.altos} medios={r.medios} />
                  </summary>
                  <div className="border-t border-line px-5 py-5">
                    <ListaAchados achados={r.achados} />
                    <div className="mt-5 flex flex-wrap gap-3">
                      {r.contaClienteId && <RodarVarredura contaId={r.contaClienteId} rotulo="Verificar de novo" className="btn btn-ghost" />}
                      {wa && (
                        <a href={wa} target="_blank" rel="noopener" className="btn btn-dark">
                          Avisar a agência no WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-14">
        <h2 className="t-heading-lg">Histórico de varreduras</h2>
        <div className="card-flush mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-body-sm">
            <thead>
              <tr className="bg-surface-2">
                <th className={TH}>Início</th>
                <th className={TH}>Origem</th>
                <th className={TH}>Alvos</th>
                <th className={TH}>Alertas</th>
                <th className={TH}>Duração</th>
                <th className={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {historico.map((v) => (
                <tr key={v.id} className="last:[&>td]:border-b-0">
                  <td className={TD}>{v.iniciadaEm.toLocaleString("pt-BR")}</td>
                  <td className={TD}>{{ cron: "Automática", manual: "Manual (admin)", agencia: "Pedida pela agência" }[v.origem] ?? v.origem}</td>
                  <td className={TD + " tabular-nums"}>{v.alvos}</td>
                  <td className={TD}>
                    <ContagemSeveridades criticos={v.criticos} altos={v.altos} medios={v.medios} />
                  </td>
                  <td className={TD + " tabular-nums"}>
                    {v.finalizadaEm ? `${Math.max(1, Math.round((v.finalizadaEm.getTime() - v.iniciadaEm.getTime()) / 1000))}s` : "—"}
                  </td>
                  <td className={TD}>
                    {v.status === "concluida" ? (
                      <span className="pill pill-ok">Concluída</span>
                    ) : v.status === "falhou" ? (
                      <span className="pill pill-danger" title={v.erro ?? ""}>
                        Falhou
                      </span>
                    ) : (
                      <span className="pill pill-info">Rodando</span>
                    )}
                  </td>
                </tr>
              ))}
              {historico.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted">
                    Nenhuma varredura ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
