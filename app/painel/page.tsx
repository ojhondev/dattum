import Link from "next/link";
import { and, count, eq, inArray } from "drizzle-orm";
import { ArrowRight, AlertTriangle, FileSignature, Globe, ListChecks, Radar, BadgeCheck } from "lucide-react";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  agencias,
  contasCliente,
  dpas,
  atividadesTratamento,
  contaSubprocessadores,
  subprocessadoresCatalogo,
  certificados,
} from "@/lib/db/schema";
import { PLANOS } from "@/lib/planos";
import { agoraMs } from "@/lib/utils";
import { FLUXOS, fluxosDaConta } from "@/lib/fluxos";
import { ultimosResultados } from "@/lib/vigilancia";
import { ordenarAchados, faixaDaNota, type Severidade } from "@/lib/vigilancia-tipos";
import { NotaVigilancia, SeveridadeChip, ContagemSeveridades } from "@/components/app/VigilanciaChips";

export const dynamic = "force-dynamic";

const TH = "border-b border-line px-5 py-3 text-left font-mono text-[12px] font-normal uppercase tracking-[0.04em] text-muted";
const TD = "border-b border-line px-5 py-3.5 align-middle";

type Pendencia = { severidade: Severidade; conta: string; contaId: string; texto: string };

export default async function PainelDashboard() {
  const sessao = await getSessao();
  if (!sessao) return null;
  const agenciaId = sessao.agenciaId;

  const [agencia, contas, todosDpas, resultados, certs] = await Promise.all([
    db.query.agencias.findFirst({ where: eq(agencias.id, agenciaId) }),
    db.query.contasCliente.findMany({ where: eq(contasCliente.agenciaId, agenciaId), orderBy: (t, { desc }) => desc(t.createdAt) }),
    db.query.dpas.findMany({ where: eq(dpas.agenciaId, agenciaId) }),
    ultimosResultados(agenciaId),
    db.query.certificados.findMany({ where: eq(certificados.agenciaId, agenciaId) }),
  ]);
  const ids = contas.map((c) => c.id);

  const [ratRows, ferramentasRows] = ids.length
    ? await Promise.all([
        db
          .select({ conta: atividadesTratamento.contaClienteId, n: count() })
          .from(atividadesTratamento)
          .where(inArray(atividadesTratamento.contaClienteId, ids))
          .groupBy(atividadesTratamento.contaClienteId),
        db
          .select({ conta: contaSubprocessadores.contaClienteId, custom: contaSubprocessadores.nomeCustomizado, catalogo: subprocessadoresCatalogo.nome })
          .from(contaSubprocessadores)
          .leftJoin(subprocessadoresCatalogo, eq(contaSubprocessadores.subprocessadorCatalogoId, subprocessadoresCatalogo.id))
          .where(and(inArray(contaSubprocessadores.contaClienteId, ids), eq(contaSubprocessadores.ativo, true))),
      ])
    : [[], []];

  // ---------- números da carteira ----------
  const total = contas.length;
  const dpaPor = new Map(todosDpas.map((d) => [d.contaClienteId, d]));
  const ratPor = new Map(ratRows.map((r) => [r.conta, Number(r.n)]));
  const vigPor = new Map(resultados.filter((r) => r.contaClienteId).map((r) => [r.contaClienteId as string, r]));
  const assinados = contas.filter((c) => dpaPor.get(c.id)?.status === "assinado").length;
  const atividades = ratRows.reduce((s, r) => s + Number(r.n), 0);

  const usoFerramenta = new Map<string, Set<string>>();
  for (const f of ferramentasRows) {
    const nome = f.custom ?? f.catalogo ?? "—";
    if (!usoFerramenta.has(nome)) usoFerramenta.set(nome, new Set());
    usoFerramenta.get(nome)!.add(f.conta);
  }
  const ferramentas = [...usoFerramenta.entries()].map(([nome, s]) => ({ nome, contas: s.size })).sort((a, b) => b.contas - a.contas);

  const agora = agoraMs();
  const certsAtivos = certs.filter((c) => !c.revogado && c.validoAte.getTime() > agora);
  const certsVencendo = certsAtivos.filter((c) => c.validoAte.getTime() - agora < 30 * 86_400_000).length;

  const notas = contas.map((c) => vigPor.get(c.id)?.nota).filter((n): n is number => n != null);
  const notaMedia = notas.length ? Math.round(notas.reduce((s, n) => s + n, 0) / notas.length) : null;
  const alertas = resultados.reduce(
    (s, r) => ({ criticos: s.criticos + r.criticos, altos: s.altos + r.altos, medios: s.medios + r.medios }),
    { criticos: 0, altos: 0, medios: 0 },
  );
  const ultimaVerificacao = resultados.reduce<Date | null>((m, r) => (!m || r.verificadoEm > m ? r.verificadoEm : m), null);

  const situacao = contas.map((c) => {
    const vig = vigPor.get(c.id);
    const assinado = dpaPor.get(c.id)?.status === "assinado";
    const temRat = (ratPor.get(c.id) ?? 0) > 0;
    const critico = (vig?.criticos ?? 0) > 0;
    const estado = critico ? "critico" : assinado && temRat ? "em-dia" : "pendente";
    return { conta: c, vig, assinado, rat: ratPor.get(c.id) ?? 0, estado };
  });
  const emDia = situacao.filter((s) => s.estado === "em-dia").length;
  const criticos = situacao.filter((s) => s.estado === "critico").length;
  const pendentes = total - emDia - criticos;
  const pctEmDia = total ? Math.round((emDia / total) * 100) : 0;

  // ---------- pendências acionáveis ----------
  const pendencias: Pendencia[] = [];
  for (const s of situacao) {
    const base = { conta: s.conta.nome, contaId: s.conta.id };
    for (const a of ordenarAchados(s.vig?.achados ?? []).filter((a) => a.severidade === "critico" && a.grupo === "site")) {
      pendencias.push({ ...base, severidade: "critico", texto: a.titulo });
    }
    if (!s.assinado) pendencias.push({ ...base, severidade: "alto", texto: "Contrato com o cliente aguardando assinatura" });
    if (s.rat === 0) pendencias.push({ ...base, severidade: "alto", texto: "Registro do que a agência faz com o dado está vazio" });
    if (!s.conta.site) pendencias.push({ ...base, severidade: "medio", texto: "Site não cadastrado — fora da vigilância diária" });
  }
  const ordemSev: Severidade[] = ["critico", "alto", "medio", "ok"];
  pendencias.sort((a, b) => ordemSev.indexOf(a.severidade) - ordemSev.indexOf(b.severidade));

  const topAlertas = resultados
    .flatMap((r) => r.achados.filter((a) => a.severidade === "critico" || a.severidade === "alto").map((a) => ({ a, titular: r.titular, contaId: r.contaClienteId })))
    .sort((x, y) => ordemSev.indexOf(x.a.severidade) - ordemSev.indexOf(y.a.severidade))
    .slice(0, 4);

  const usoFluxo = FLUXOS.map((f) => ({ f, n: contas.filter((c) => fluxosDaConta(c).some((x) => x.key === f.key)).length }));
  const maxFluxo = Math.max(1, ...usoFluxo.map((u) => u.n));

  const plano = PLANOS.find((p) => p.id === agencia?.plano);
  const limite = agencia?.clientesContratados ?? null;

  const kpis = [
    { icon: ListChecks, label: "Clientes ativos", valor: String(total), sub: limite != null ? `de ${limite} contratados` : "sem limite no plano" },
    { icon: FileSignature, label: "Contratos assinados", valor: `${assinados}/${total}`, sub: total - assinados > 0 ? `${total - assinados} aguardando assinatura` : "todos assinados", alerta: total - assinados > 0 },
    { icon: ListChecks, label: "Atividades registradas", valor: String(atividades), sub: "no registro de tratamento (RAT)" },
    { icon: Globe, label: "Ferramentas mapeadas", valor: String(ferramentas.length), sub: "que tocam o dado dos clientes" },
    { icon: BadgeCheck, label: "Certificados ativos", valor: String(certsAtivos.length), sub: certsVencendo ? `${certsVencendo} vencendo em 30 dias` : "selo verificável no site", alerta: certsVencendo > 0 },
    { icon: Radar, label: "Nota da vigilância", valor: notaMedia != null ? String(notaMedia) : "—", sub: notaMedia != null ? `média da carteira · ${faixaDaNota(notaMedia).label}` : "aguardando a primeira varredura", alerta: notaMedia != null && notaMedia < 65 },
  ];

  return (
    <div className="max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="t-eyebrow">Painel · {agencia?.nome}</p>
          <h1 className="t-display mt-3 max-w-3xl">Sua operação de compliance</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {plano && (
            <span className="tag tag-white border border-line">
              Plano {plano.nome}
              {limite != null && ` · ${total} de ${limite} clientes`}
            </span>
          )}
          <Link href="/painel/contas/novo" className="btn btn-primary">
            Ativar conta nova <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Conformidade da carteira + KPIs */}
      <div className="mt-10 grid gap-4 xl:grid-cols-[minmax(320px,0.9fr)_2fr]">
        <div className="flex flex-col justify-between rounded-[28px] bg-rail p-7 text-white">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.05em] text-white/55">Carteira em conformidade</p>
            <p className="font-display mt-4 text-[4.2rem] leading-none tabular-nums text-brand">{total ? `${pctEmDia}%` : "—"}</p>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/75">
              {total
                ? `${emDia} de ${total} cliente${total > 1 ? "s" : ""} com contrato assinado, registro preenchido e sem alerta crítico na vigilância.`
                : "Ative o primeiro cliente pra começar a medir a conformidade da carteira."}
            </p>
          </div>
          {total > 0 && (
            <div className="mt-7">
              <div className="flex h-2.5 overflow-hidden rounded-full bg-white/10">
                <span className="bg-brand" style={{ width: `${(emDia / total) * 100}%` }} />
                <span className="bg-orange" style={{ width: `${(pendentes / total) * 100}%` }} />
                <span className="bg-danger" style={{ width: `${(criticos / total) * 100}%` }} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] uppercase tracking-[0.04em] text-white/60">
                <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-brand" />{emDia} em dia</span>
                <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-orange" />{pendentes} com pendência</span>
                <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-danger" />{criticos} crítico{criticos === 1 ? "" : "s"}</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {kpis.map((k) => (
            <div key={k.label} className={"rounded-[20px] border p-5 " + (k.alerta ? "border-orange/40 bg-warn-tint" : "border-line bg-surface")}>
              <div className="flex items-center gap-2 text-muted">
                <k.icon size={15} strokeWidth={1.8} />
                <p className="font-mono text-[11.5px] uppercase tracking-[0.04em]">{k.label}</p>
              </div>
              <p className={"font-display mt-3 text-[2.4rem] leading-none tabular-nums " + (k.alerta ? "text-warn" : "text-ink")}>{k.valor}</p>
              <p className="mt-2 text-[13px] text-muted">{k.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {total === 0 ? (
        <div className="block-card mt-10 p-10">
          <h2 className="t-heading">Comece pelo primeiro cliente</h2>
          <p className="mt-3 max-w-2xl text-body leading-relaxed text-body">
            Ao ativar uma conta, a Dattis gera o registro do que a agência faz com o dado, o contrato com o cliente e a lista
            de ferramentas — e o site dele entra na vigilância diária.
          </p>
          <Link href="/painel/contas/novo" className="btn btn-primary btn-lg mt-6">
            Ativar conta nova <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          {/* Pendências + Vigilância */}
          <div className="mt-6 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
            <section className="rounded-[28px] border border-line bg-surface p-6 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <h2 className="t-heading">O que resolver primeiro</h2>
                <span className="pill pill-neutral">{pendencias.length} pendência{pendencias.length === 1 ? "" : "s"}</span>
              </div>
              {pendencias.length === 0 ? (
                <p className="mt-5 rounded-2xl bg-brand-tint px-4 py-3 text-body-sm text-brand-ink">Nada pendente. Carteira em dia.</p>
              ) : (
                <ul className="mt-5 flex flex-col divide-y divide-line">
                  {pendencias.slice(0, 7).map((p, i) => (
                    <li key={i}>
                      <Link href={`/painel/contas/${p.contaId}`} className="group flex items-center gap-3 py-3">
                        <SeveridadeChip severidade={p.severidade} />
                        <span className="min-w-0 flex-1 text-body-sm">
                          <b className="font-semibold text-ink">{p.conta}</b> <span className="text-body">· {p.texto}</span>
                        </span>
                        <ArrowRight size={15} className="shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {pendencias.length > 7 && <p className="mt-2 text-[13px] text-muted">+ {pendencias.length - 7} outras nas contas de cliente.</p>}
            </section>

            <section className="rounded-[28px] border border-line bg-surface p-6 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <h2 className="t-heading">Vigilância</h2>
                <Link href="/painel/vigilancia" className="font-mono text-[12px] uppercase tracking-[0.04em] text-muted hover:text-ink">
                  Ver tudo →
                </Link>
              </div>
              <p className="mt-2 text-[13px] text-muted">
                {ultimaVerificacao ? `Última varredura: ${ultimaVerificacao.toLocaleString("pt-BR")} · roda todo dia às 6h` : "A varredura diária roda às 6h."}
              </p>
              <div className="mt-4">
                <ContagemSeveridades {...alertas} />
              </div>
              {topAlertas.length > 0 ? (
                <ul className="mt-5 flex flex-col gap-2.5">
                  {topAlertas.map(({ a, titular, contaId }, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-body-sm">
                      <AlertTriangle size={15} className={"mt-0.5 shrink-0 " + (a.severidade === "critico" ? "text-danger" : "text-warn")} />
                      <span>
                        {contaId ? (
                          <Link href={`/painel/contas/${contaId}`} className="font-semibold text-ink hover:underline">
                            {titular}
                          </Link>
                        ) : (
                          <b className="font-semibold text-ink">{titular}</b>
                        )}{" "}
                        <span className="text-body">· {a.titulo}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 text-body-sm text-muted">{resultados.length ? "Nenhum alerta crítico ou alto." : "Os resultados aparecem aqui depois da primeira varredura."}</p>
              )}
            </section>
          </div>

          {/* Fluxos + ferramentas */}
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <section className="rounded-[28px] border border-line bg-surface p-6 sm:p-7">
              <h2 className="t-heading">Como o dado circula na carteira</h2>
              <p className="mt-2 text-[13px] text-muted">Quantos clientes usam cada tipo de operação de tráfego.</p>
              <ul className="mt-5 flex flex-col gap-3.5">
                {usoFluxo.map(({ f, n }) => (
                  <li key={f.key} title={f.comoChamam}>
                    <div className="flex items-baseline justify-between gap-3 text-body-sm">
                      <span className="text-ink">{f.titulo}</span>
                      <span className="font-mono tabular-nums text-muted">{n}</span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-brand-strong" style={{ width: `${(n / maxFluxo) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-[28px] border border-line bg-surface p-6 sm:p-7">
              <h2 className="t-heading">Ferramentas que tocam o dado</h2>
              <p className="mt-2 text-[13px] text-muted">Plataformas e sistemas registrados nos contratos, por número de clientes.</p>
              {ferramentas.length === 0 ? (
                <p className="mt-5 text-body-sm text-muted">Nenhuma ferramenta registrada ainda.</p>
              ) : (
                <ul className="mt-5 flex flex-col divide-y divide-line">
                  {ferramentas.slice(0, 7).map((f) => (
                    <li key={f.nome} className="flex items-center justify-between gap-3 py-2.5 text-body-sm">
                      <span className="text-ink">{f.nome}</span>
                      <span className="pill pill-neutral tabular-nums">
                        {f.contas} cliente{f.contas === 1 ? "" : "s"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Conformidade por cliente */}
          <section className="mt-10">
            <div className="flex items-end justify-between gap-4">
              <h2 className="t-heading-lg">Conformidade por cliente</h2>
              <Link href="/painel/contas" className="font-mono text-[12px] uppercase tracking-[0.04em] text-muted hover:text-ink">
                Todas as contas →
              </Link>
            </div>
            <div className="card-flush mt-5 overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-body-sm">
                <thead>
                  <tr className="bg-surface-2">
                    <th className={TH}>Cliente</th>
                    <th className={TH}>Operação</th>
                    <th className={TH}>Registro</th>
                    <th className={TH}>Contrato</th>
                    <th className={TH}>Vigilância</th>
                  </tr>
                </thead>
                <tbody>
                  {situacao.slice(0, 12).map(({ conta, vig, assinado, rat }) => (
                    <tr key={conta.id} className="transition-colors last:[&>td]:border-b-0 hover:bg-surface-2">
                      <td className={TD}>
                        <Link href={`/painel/contas/${conta.id}`} className="font-display text-[17px] text-ink hover:underline">
                          {conta.nome}
                        </Link>
                        <span className="block text-[12.5px] text-muted">{conta.site ? conta.site.replace(/^https?:\/\//, "") : "sem site cadastrado"}</span>
                      </td>
                      <td className={TD}>
                        <span className="flex flex-wrap gap-1.5">
                          {fluxosDaConta(conta).map((f) => (
                            <span key={f.key} title={f.titulo} className="pill pill-neutral">
                              {f.curto}
                            </span>
                          ))}
                        </span>
                      </td>
                      <td className={TD}>{rat > 0 ? <span className="tabular-nums">{rat} atividade{rat === 1 ? "" : "s"}</span> : <span className="pill pill-warn">Vazio</span>}</td>
                      <td className={TD}>{assinado ? <span className="pill pill-ok">Assinado</span> : <span className="pill pill-warn">Pendente</span>}</td>
                      <td className={TD}>
                        <NotaVigilancia nota={vig?.nota} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/painel/certificados" className="btn btn-ghost">
              Emitir certificado
            </Link>
            <Link href="/painel/dossie" className="btn btn-ghost">
              Dossiê para BM
            </Link>
            <Link href="/auditoria" className="btn btn-ghost">
              Auditar um site
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
