import Link from "next/link";
import { desc, gte, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { agoraMs } from "@/lib/utils";
import { leadsAuditoria, codigosAtivacao, varreduras } from "@/lib/db/schema";
import { carregarAgencias, brl } from "@/lib/admin-dados";
import { formatarTelefone, linkWhatsappPara } from "@/lib/contato";
import { ContagemSeveridades, NotaVigilancia } from "@/components/app/VigilanciaChips";
import { RodarVarredura } from "./AcoesAdmin";

export const dynamic = "force-dynamic";

const Card = ({ label, valor, sub, destaque = false }: { label: string; valor: string; sub: string; destaque?: boolean }) => (
  <div className={"rounded-[20px] border p-5 " + (destaque ? "border-orange/40 bg-warn-tint" : "border-line bg-surface")}>
    <p className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-muted">{label}</p>
    <p className={"font-display mt-3 text-[2.3rem] leading-none tabular-nums " + (destaque ? "text-warn" : "text-ink")}>{valor}</p>
    <p className="mt-2 text-[13px] text-muted">{sub}</p>
  </div>
);

export default async function AdminVisaoGeral() {
  const seteDias = new Date(agoraMs() - 7 * 86_400_000);
  const [ags, leads, [{ n: leads7 }], codigos, ultimas] = await Promise.all([
    carregarAgencias(),
    db.query.leadsAuditoria.findMany({ orderBy: desc(leadsAuditoria.createdAt), limit: 200 }),
    db.select({ n: count() }).from(leadsAuditoria).where(gte(leadsAuditoria.createdAt, seteDias)),
    db.query.codigosAtivacao.findMany({ orderBy: desc(codigosAtivacao.criadoEm) }),
    db.query.varreduras.findMany({ orderBy: desc(varreduras.iniciadaEm), limit: 1 }),
  ]);

  const reais = ags.filter((a) => !a.demo && !a.pendente);
  const pendentes = ags.filter((a) => a.pendente);
  const mrr = reais.reduce((s, a) => s + a.mrr, 0);
  const clientes = reais.reduce((s, a) => s + a.contas, 0);
  const contratados = reais.reduce((s, a) => s + (a.contratados ?? a.contas), 0);
  const assinados = reais.reduce((s, a) => s + a.assinados, 0);
  const criticos = ags.reduce((s, a) => s + a.criticos, 0);
  const altos = ags.reduce((s, a) => s + a.altos, 0);
  const concluidos = leads.filter((l) => l.concluidoEm).length;
  const enviados = leads.filter((l) => l.enviadoEspecialistaEm).length;
  const disponiveis = codigos.filter((c) => !c.usadoEm && !c.revogado).length;
  const ultima = ultimas[0];
  const emRisco = [...ags].filter((a) => a.criticos + a.altos > 0).sort((a, b) => b.criticos - a.criticos || b.altos - a.altos).slice(0, 5);

  return (
    <div className="max-w-7xl">
      <p className="t-eyebrow">Área Dattis · WebMaster</p>
      <h1 className="t-display mt-3">Visão geral da operação</h1>

      {pendentes.length > 0 && (
        <section className="mt-8 rounded-[20px] border border-orange/40 bg-warn-tint p-5">
          <div className="flex flex-wrap items-center gap-3">
            <p className="flex-1 text-[15px] text-ink">
              <b>{pendentes.length} cadastro(s) novo(s)</b> aguardando ativação. Chame no WhatsApp, feche o plano e ative em Agências.
            </p>
            <Link href="/admin/agencias" className="btn btn-primary">
              Ver e ativar
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-line text-body-sm">
            {pendentes.slice(0, 5).map((a) => {
              const wa = linkWhatsappPara(a.contato, `Olá! Aqui é da Dattis. Vi que você criou a conta da ${a.nome} e quero te ajudar a ativar o plano.`);
              return (
                <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
                  <span className="min-w-0 flex-1">
                    <b className="text-ink">{a.nome}</b> <span className="text-muted">· {a.email} · {a.criadaEm.toLocaleDateString("pt-BR")}</span>
                  </span>
                  <span className="text-muted">{a.contas} cliente(s) cadastrado(s)</span>
                  {wa && (
                    <a href={wa} target="_blank" rel="noopener" className="text-brand-ink hover:underline">
                      {formatarTelefone(a.contato)}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card label="Receita mensal (MRR)" valor={brl(mrr)} sub={`${reais.length} agência(s) pagante(s)`} />
        <Card label="Clientes protegidos" valor={String(clientes)} sub={`${contratados} contratados · ${assinados} contratos assinados`} />
        <Card label="Leads da auditoria" valor={String(leads.length)} sub={`${leads7} nos últimos 7 dias · ${enviados} enviaram ao especialista`} />
        <Card label="Alertas da vigilância" valor={String(criticos + altos)} sub={`${criticos} crítico(s) · ${altos} alto(s)`} destaque={criticos > 0} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-[28px] bg-rail p-7 text-white">
          <p className="font-mono text-[12px] uppercase tracking-[0.05em] text-white/55">Vigilância diária</p>
          <p className="font-display mt-3 text-[1.7rem] leading-tight">
            {ultima ? `Última varredura: ${ultima.iniciadaEm.toLocaleString("pt-BR")}` : "Nenhuma varredura ainda"}
          </p>
          {ultima && (
            <p className="mt-2 text-[14px] text-white/70">
              {ultima.alvos} alvo(s) · {{ cron: "automática", manual: "manual", agencia: "pedida pela agência" }[ultima.origem] ?? ultima.origem} · {{ concluida: "concluída", falhou: "falhou", rodando: "rodando" }[ultima.status] ?? ultima.status}
              {ultima.finalizadaEm && ` em ${Math.max(1, Math.round((ultima.finalizadaEm.getTime() - ultima.iniciadaEm.getTime()) / 1000))}s`}
            </p>
          )}
          <p className="mt-4 text-[14px] leading-relaxed text-white/70">
            Roda sozinha todo dia às 6h (horário de Brasília) em todas as contas de todas as agências.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <RodarVarredura />
            <Link href="/admin/vigilancia" className="btn border-white/25 text-white hover:border-white/60">
              Ver resultados
            </Link>
          </div>
        </section>

        <section className="rounded-[28px] border border-line bg-surface p-6 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="t-heading">Agências com alerta</h2>
            <Link href="/admin/agencias" className="font-mono text-[12px] uppercase tracking-[0.04em] text-muted hover:text-ink">
              Todas →
            </Link>
          </div>
          {emRisco.length === 0 ? (
            <p className="mt-5 text-body-sm text-muted">Nenhuma agência com alerta crítico ou alto.</p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-line">
              {emRisco.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="min-w-[150px] flex-1">
                    <span className="block font-medium text-ink">{a.nome}</span>
                    <span className="text-[13px] text-muted">
                      {a.contas} cliente(s) · Plano {a.planoNome}
                    </span>
                  </span>
                  <NotaVigilancia nota={a.notaMedia} compacto />
                  <ContagemSeveridades criticos={a.criticos} altos={a.altos} medios={0} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-[28px] border border-line bg-surface p-6 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="t-heading">Últimos leads da auditoria</h2>
            <Link href="/admin/leads" className="font-mono text-[12px] uppercase tracking-[0.04em] text-muted hover:text-ink">
              Todos →
            </Link>
          </div>
          {leads.length === 0 ? (
            <p className="mt-5 text-body-sm text-muted">Nenhum lead ainda.</p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-line">
              {leads.slice(0, 6).map((l) => {
                const wa = linkWhatsappPara(l.whatsapp, `Olá, ${l.nome.split(" ")[0]}! Aqui é da Dattis, sobre a auditoria da ${l.agencia}.`);
                return (
                  <li key={l.id} className="flex flex-wrap items-center gap-3 py-3 text-body-sm">
                    <span className="min-w-[160px] flex-1">
                      <span className="block font-medium text-ink">
                        {l.nome} · {l.agencia}
                      </span>
                      <span className="text-[13px] text-muted">{l.createdAt.toLocaleString("pt-BR")}</span>
                    </span>
                    {l.score != null ? (
                      <span className="pill pill-neutral tabular-nums">
                        {l.score}% · {l.nivel}
                      </span>
                    ) : (
                      <span className="pill pill-warn">Não concluiu</span>
                    )}
                    {wa && (
                      <a href={wa} target="_blank" rel="noopener" className="font-mono text-[12px] uppercase tracking-[0.04em] text-brand-ink hover:underline">
                        {formatarTelefone(l.whatsapp)}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-[28px] border border-line bg-surface p-6 sm:p-7">
          <h2 className="t-heading">Funil comercial</h2>
          <ul className="mt-5 flex flex-col gap-4">
            {[
              { label: "Começaram a auditoria", n: leads.length },
              { label: "Concluíram", n: concluidos },
              { label: "Enviaram ao especialista", n: enviados },
              { label: "Viraram agência (códigos usados)", n: codigos.filter((c) => c.usadoEm).length },
            ].map((e) => (
              <li key={e.label}>
                <div className="flex justify-between text-body-sm">
                  <span className="text-ink">{e.label}</span>
                  <span className="font-mono tabular-nums text-muted">{e.n}</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-brand-strong" style={{ width: `${leads.length ? Math.min(100, (e.n / leads.length) * 100) : 0}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[13px] text-muted">
            {disponiveis} código(s) de ativação disponível(is).{" "}
            <Link href="/admin/codigos" className="text-ink underline-offset-2 hover:underline">
              Gerar código
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
