import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  FileSignature,
  FileText,
  ListChecks,
  Plus,
  Radar,
  ShieldAlert,
  Users,
  Wand2,
} from "lucide-react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ehDono, getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { EMAIL_DEMO } from "@/lib/admin-dados";
import { agoraMs } from "@/lib/utils";
import { dadosDoPainel } from "@/lib/painel-dados";
import { faixaDaNota } from "@/lib/vigilancia-tipos";
import { TIPOS_DOCUMENTO } from "@/lib/documentos";
import { NotaVigilancia, SeveridadeChip } from "@/components/app/VigilanciaChips";
import { GraficoVigilancia } from "@/components/app/graficos/GraficoVigilancia";
import { Rosca } from "@/components/app/graficos/Rosca";
import { ListaTarefas } from "@/components/app/ListaTarefas";
import { tarefasDaAgencia } from "@/lib/tarefas";
import { BarraModulo, FiltroModulo } from "@/components/app/Modulo";

export const dynamic = "force-dynamic";

const CARD = "rounded-[24px] border border-line bg-surface";
const ROTULO = "font-mono text-[11px] uppercase tracking-[0.05em] text-muted";
const PERIODOS = [7, 30, 90];
const FILTROS_ATIVIDADE = [
  { id: "7", nome: "7 dias", dias: 7 },
  { id: "30", nome: "Este mês", dias: 30 },
  { id: "tudo", nome: "Tudo", dias: Infinity },
];

const dataCurta = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Sao_Paulo" });
const hora = (d: Date) => d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

function Filtro({ ativo, href, children }: { ativo: boolean; href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={"rounded-lg px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.04em] transition-colors " + (ativo ? "bg-surface text-ink shadow-[var(--shadow-chip)]" : "text-muted hover:text-ink")}
    >
      {children}
    </Link>
  );
}

export default async function PainelDashboard({ searchParams }: { searchParams: Promise<{ periodo?: string; atividade?: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return null;
  const sp = await searchParams;
  const periodo = PERIODOS.includes(Number(sp.periodo)) ? Number(sp.periodo) : 30;
  const filtroAtividade = FILTROS_ATIVIDADE.find((f) => f.id === sp.atividade) ?? FILTROS_ATIVIDADE[1];
  const [d, tarefas, agencia] = await Promise.all([
    dadosDoPainel(sessao.agenciaId, { dias: periodo }),
    tarefasDaAgencia(sessao.agenciaId),
    db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId), columns: { onboardingConcluidoEm: true, email: true } }),
  ]);
  // Primeiro acesso, sem cliente: começa pelo preenchimento guiado.
  if (d.total === 0 && agencia && !agencia.onboardingConcluidoEm && agencia.email !== EMAIL_DEMO && ehDono(sessao)) redirect("/painel/comecar");

  const pct = d.total ? Math.round((d.emDia / d.total) * 100) : 0;
  const faixa = d.notaMedia != null ? faixaDaNota(d.notaMedia) : null;
  const q = (extra: Record<string, string | number>) => `/painel?${new URLSearchParams({ periodo: String(periodo), atividade: filtroAtividade.id, ...Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, String(v)])) })}`;
  const limiteData = agoraMs() - filtroAtividade.dias * 86_400_000;
  const eventos = d.eventos.filter((e) => filtroAtividade.dias === Infinity || e.quando.getTime() >= limiteData).slice(0, 7);
  const totalAprovadas = d.serie.reduce((s, p) => s + p.aprovadas, 0);
  const totalAlertas = d.serie.reduce((s, p) => s + p.alertas, 0);
  const primeiraConta = d.situacao[0]?.conta.id;

  const kpis = [
    { icon: Users, label: "Clientes ativos", valor: String(d.total), delta: d.novas30 ? `+${d.novas30} em 30 dias` : null },
    { icon: FileSignature, label: "Contratos assinados", valor: `${d.assinados}/${d.total}`, delta: d.assinados30 ? `+${d.assinados30} em 30 dias` : null },
    { icon: ListChecks, label: "Atividades no registro", valor: String(d.atividades), delta: d.ferramentas.length ? `${d.ferramentas.length} ferramentas` : null },
  ];

  return (
    <div className="mx-auto max-w-[1500px]">
      <BarraModulo
        esquerda={
          <>
            <span className="pl-2 text-[13px] text-muted">Período</span>
            <FiltroModulo nome="periodo" padrao="30" opcoes={PERIODOS.map((p) => ({ valor: String(p), rotulo: `${p} dias` }))} />
          </>
        }
        direita={
          <>
            <Link href="/painel/documentos" className="barra-btn">
              <FileText size={15} /> Gerar documento
            </Link>
            <Link href="/painel/contas/novo" className="barra-btn primario">
              <Plus size={15} /> Novo cliente
            </Link>
          </>
        }
      />
      <ListaTarefas tarefas={tarefas} />

      {/* Números e gráficos: para quem quer acompanhar, recolhidos por padrão */}
      <details className="group mt-6" open={tarefas.length === 0}>
        <summary className="flex cursor-pointer list-none items-center gap-2 py-2 text-[15px] font-medium text-ink">
          <span className="grid h-6 w-6 place-items-center rounded-md border border-line text-muted transition-transform group-open:rotate-90">›</span>
          Visão geral da carteira
          <span className="text-[13.5px] font-normal text-muted">
            · {d.total ? `${pct}% em dia` : "sem clientes ainda"}
          </span>
        </summary>
      <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Índice de conformidade (cartão verde de destaque) */}
        <section data-tour="indice" className="pixel-corners relative overflow-hidden bg-brand p-6 text-on-brand lg:col-span-6 xl:col-span-4">
          <div aria-hidden="true" className="absolute -right-10 -top-16 h-56 w-56 rounded-full border-[28px] border-white/25" />
          <div aria-hidden="true" className="absolute -bottom-20 right-16 h-40 w-40 rounded-full border-[20px] border-white/20" />
          <p className="relative font-mono text-[12px] uppercase tracking-[0.05em]">Índice de conformidade</p>
          <p className="relative mt-3 font-display text-[3.4rem] leading-none tabular-nums">{d.total ? `${pct}%` : "—"}</p>
          <p className="relative mt-1 font-mono text-[12px] uppercase tracking-[0.04em]">da carteira em dia</p>
          <p className="relative mt-3 max-w-xs text-[14px] leading-snug text-on-brand/80">
            {d.total ? `${d.emDia} de ${d.total} clientes com contrato, registro e sem alerta crítico.` : "Ative o primeiro cliente para começar a medir."}
          </p>
        </section>

        {/* Visão da carteira */}
        <section className={CARD + " p-5 lg:order-3 lg:col-span-12 xl:order-none xl:col-span-5"}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-medium text-ink">Visão da carteira</h2>
            <Link href="/painel/contas" className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-[13px] text-muted hover:text-ink">
              <Plus size={14} /> Ver contas
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-2xl border border-line p-4">
                <div className="flex flex-col items-start gap-2 text-muted">
                  <span className="pixel-corners pixel-corners-sm grid h-7 w-7 place-items-center bg-brand-tint text-brand-ink">
                    <k.icon size={14} />
                  </span>
                  <span className="text-[13px] leading-tight">{k.label}</span>
                </div>
                <p className="mt-3 font-display text-[1.9rem] leading-none tabular-nums text-ink">{k.valor}</p>
                {k.delta && <span className="mt-2 inline-block whitespace-nowrap rounded-full bg-brand-tint px-2 py-0.5 font-mono text-[10.5px] text-brand-ink">{k.delta}</span>}
              </div>
            ))}
          </div>
        </section>

        {/* Nota de privacidade */}
        <section className={CARD + " flex flex-col p-5 lg:order-2 lg:col-span-6 xl:order-none xl:col-span-3"}>
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-medium text-ink">Nota de privacidade</h2>
            <Link href="/painel/vigilancia" aria-label="Ver vigilância" className="rounded-lg p-1 text-muted hover:text-ink">
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <p className={ROTULO + " mt-4"}>Média da vigilância</p>
          <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3">
            <p className="font-display text-[1.6rem] leading-tight text-ink">{faixa ? faixa.label : "Aguardando"}</p>
            <p className="font-display text-[1.6rem] leading-tight tabular-nums text-ink">{d.notaMedia != null ? `${d.notaMedia}/100` : "—"}</p>
          </div>
          <div className="mt-auto flex h-9 gap-1.5 pt-5">
            <div className="h-full rounded-lg bg-rail" style={{ width: `${d.notaMedia ?? 0}%` }} />
            <div className="h-full flex-1 rounded-lg bg-brand" />
          </div>
        </section>

        {/* Gráfico da vigilância */}
        <section className={CARD + " p-5 lg:order-4 lg:col-span-12 xl:order-none xl:col-span-7"}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[16px] font-medium text-ink">Vigilância diária</h2>
              <p className={ROTULO + " mt-3"}>Checagens no período</p>
              <p className="mt-1 font-display text-[2rem] leading-none tabular-nums text-ink">{(totalAprovadas + totalAlertas).toLocaleString("pt-BR")}</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-muted">Últimos {periodo} dias</span>
              <div className="flex gap-4 text-[13px] text-body">
                <span className="flex items-center gap-1.5">
                  <i className="h-2.5 w-2.5 rounded-sm bg-grafico-ok" /> Aprovadas <b className="tabular-nums text-ink">{totalAprovadas}</b>
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="h-2.5 w-2.5 rounded-sm bg-grafico-alerta" /> Alertas <b className="tabular-nums text-ink">{totalAlertas}</b>
                </span>
              </div>
            </div>
          </div>
          <div className="relative mt-4">
            <GraficoVigilancia serie={d.serie} />
            {d.diasComDados < 3 && (
              <p className="mt-2 rounded-xl bg-canvas px-3 py-2 text-[12.5px] text-muted">
                Montando o histórico: a vigilância roda todo dia às 6h e o gráfico ganha uma barra por dia.
              </p>
            )}
          </div>
        </section>

        {/* Central de documentos */}
        <section className={CARD + " flex flex-col p-5 lg:order-5 lg:col-span-12 xl:order-none xl:col-span-5"}>
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-medium text-ink">Central de documentos</h2>
            <Link href="/painel/documentos" aria-label="Abrir documentos" className="rounded-lg p-1 text-muted hover:text-ink">
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="mt-5 flex flex-col items-center text-center">
            <span className="pixel-corners grid h-16 w-16 place-items-center bg-gradient-to-br from-brand to-brand-strong text-on-brand">
              <Wand2 size={26} />
            </span>
            <p className="mt-3 text-[16px] font-medium text-ink">O que você precisa gerar hoje?</p>
            <p className="mt-1 max-w-sm text-[13px] text-muted">Textos montados com os dados de cada cliente: CNPJ, site, operações de tráfego e ferramentas.</p>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {TIPOS_DOCUMENTO.map((t) => (
              <Link
                key={t.id}
                href={`/painel/documentos?tipo=${t.id}${primeiraConta ? `&conta=${primeiraConta}` : ""}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-3 py-1.5 text-[12.5px] text-body transition-colors hover:border-brand-strong hover:text-ink"
              >
                <FileText size={13} className="text-brand-ink" /> {t.titulo}
              </Link>
            ))}
            <Link href="/painel/dossie" className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-3 py-1.5 text-[12.5px] text-body transition-colors hover:border-brand-strong hover:text-ink">
              <ShieldAlert size={13} className="text-brand-ink" /> Contestação de BM
            </Link>
          </div>
        </section>

        {/* Atividade recente */}
        <section className={CARD + " p-5 lg:order-6 lg:col-span-12 xl:order-none xl:col-span-6"}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[16px] font-medium text-ink">Atividade recente</h2>
            <div className="flex gap-0.5 rounded-xl bg-canvas p-1">
              {FILTROS_ATIVIDADE.map((f) => (
                <Filtro key={f.id} ativo={f.id === filtroAtividade.id} href={q({ atividade: f.id })}>
                  {f.nome}
                </Filtro>
              ))}
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-[13.5px]">
              <thead>
                <tr className="bg-canvas text-left">
                  {["Evento", "Data", "Status"].map((h) => (
                    <th key={h} className="px-3 py-2.5 font-mono text-[11px] font-normal uppercase tracking-[0.04em] text-muted first:rounded-l-xl last:rounded-r-xl">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {eventos.map((e, i) => (
                  <tr key={i} className="border-b border-line last:border-b-0">
                    <td className="px-3 py-3">
                      <span className="block font-medium text-ink">{e.titulo}</span>
                      <span className="block max-w-[260px] truncate text-[12px] text-muted xl:max-w-[220px] 2xl:max-w-[320px]">
                        {e.contaId ? (
                          <Link href={`/painel/contas/${e.contaId}`} className="text-body hover:text-ink hover:underline">
                            {e.conta}
                          </Link>
                        ) : (
                          e.conta
                        )}{" "}
                        · {e.detalhe}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-body">
                      {dataCurta(e.quando)}
                      <span className="block text-[12px] text-muted">{hora(e.quando)}</span>
                    </td>
                    <td className="px-3 py-3">
                      {e.status === "ok" ? (
                        <SeveridadeChip severidade="ok">Concluído</SeveridadeChip>
                      ) : e.status === "pendente" ? (
                        <SeveridadeChip severidade="medio">Pendente</SeveridadeChip>
                      ) : (
                        <SeveridadeChip severidade="alto">Alerta</SeveridadeChip>
                      )}
                    </td>
                  </tr>
                ))}
                {eventos.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-8 text-center text-muted">
                      Nenhuma atividade no período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Distribuição */}
        <section className={CARD + " p-5 lg:order-7 lg:col-span-6 xl:order-none xl:col-span-3"}>
          <h2 className="mb-4 text-[16px] font-medium text-ink">Distribuição de risco</h2>
          <Rosca
            abas={[
              {
                id: "clientes",
                nome: "Clientes",
                centro: "Clientes",
                fatias: [
                  { rotulo: "Em dia", valor: d.emDia, cor: "var(--color-grafico-ok)" },
                  { rotulo: "Com pendência", valor: d.pendentes, cor: "var(--color-warn)" },
                  { rotulo: "Crítico", valor: d.criticos, cor: "var(--color-danger)" },
                ],
              },
              {
                id: "alertas",
                nome: "Alertas",
                centro: "Alertas",
                fatias: [
                  { rotulo: "Crítico", valor: d.alertas.criticos, cor: "var(--color-danger)" },
                  { rotulo: "Alto", valor: d.alertas.altos, cor: "var(--color-warn)" },
                  { rotulo: "Médio", valor: d.alertas.medios, cor: "var(--color-caution)" },
                ],
              },
            ]}
          />
        </section>

        {/* Certificados */}
        <section className={CARD + " flex flex-col p-5 lg:order-8 lg:col-span-6 xl:order-none xl:col-span-3"}>
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-medium text-ink">Certificados</h2>
            <span className="rounded-lg border border-line px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.04em] text-muted">Automático</span>
          </div>
          <div className="mt-5 rounded-2xl bg-canvas p-4 text-center">
            <BadgeCheck size={22} className="mx-auto text-brand-ink" />
            <p className="mt-2 font-display text-[2.4rem] leading-none tabular-nums text-ink">{d.certsAtivos}</p>
            <p className="mt-1 text-[13px] text-muted">selos ativos no ar</p>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
            <div className="rounded-xl border border-line p-3">
              <dt className="text-muted">Emitidos sozinhos</dt>
              <dd className="mt-1 font-display text-[1.3rem] tabular-nums text-ink">{d.certsAuto}</dd>
            </div>
            <div className="rounded-xl border border-line p-3">
              <dt className="text-muted">Próx. renovação</dt>
              <dd className="mt-1 font-display text-[1.3rem] text-ink">{d.proximoVencimento ? d.proximoVencimento.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }).replace(".", "").replace(" de ", "/") : "—"}</dd>
            </div>
          </dl>
          <Link href="/painel/certificados" className="mt-auto inline-flex justify-center rounded-full bg-brand px-4 py-3 font-mono text-[12px] uppercase tracking-[0.04em] text-on-brand transition-colors hover:bg-brand-strong">
            Ver certificados
          </Link>
          <p className="mt-2 text-center text-[11.5px] leading-snug text-faint">Emitidos quando o cliente fica em dia e renovados 30 dias antes de vencer.</p>
        </section>

        {/* Pendências */}

        {/* Operações de tráfego */}
        <section className={CARD + " p-5 lg:order-9 lg:col-span-6 xl:order-none"}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-medium text-ink">Como o dado circula na carteira</h2>
            <span className={ROTULO}>clientes</span>
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            {d.usoFluxo.map(({ fluxo, n }) => (
              <li key={fluxo.key} title={fluxo.comoChamam}>
                <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
                  <span className="text-body">{fluxo.titulo}</span>
                  <span className="font-mono tabular-nums text-ink">{n}</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-canvas">
                  <div className="h-full rounded-full bg-grafico-ok" style={{ width: `${d.total ? (n / d.total) * 100 : 0}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Conformidade por cliente */}
        <section className={CARD + " p-5 lg:order-10 lg:col-span-12 xl:order-none"}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-medium text-ink">Conformidade por cliente</h2>
            <Link href="/painel/contas" className="font-mono text-[11px] uppercase tracking-[0.04em] text-muted hover:text-ink">
              Todas →
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-[13.5px]">
              <thead>
                <tr className="bg-canvas text-left">
                  {["Cliente", "Operação", "Registro", "Contrato", "Vigilância", ""].map((h, i) => (
                    <th key={i} className="px-3 py-2.5 font-mono text-[11px] font-normal uppercase tracking-[0.04em] text-muted first:rounded-l-xl last:rounded-r-xl">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.situacao.slice(0, 10).map(({ conta, vig, assinado, rat, fluxos }) => (
                  <tr key={conta.id} className="border-b border-line last:border-b-0">
                    <td className="px-3 py-3">
                      <Link href={`/painel/contas/${conta.id}`} className="font-medium text-ink hover:underline">
                        {conta.nome}
                      </Link>
                      <span className="block text-[12px] text-muted">{conta.site ? conta.site.replace(/^https?:\/\//, "") : "sem site"}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="flex flex-wrap gap-1">
                        {fluxos.map((f) => (
                          <span key={f.key} title={f.titulo} className="pill pill-neutral">
                            {f.curto}
                          </span>
                        ))}
                      </span>
                    </td>
                    <td className="px-3 py-3 tabular-nums text-body">{rat ? `${rat} atividades` : <span className="pill pill-warn">Vazio</span>}</td>
                    <td className="px-3 py-3">{assinado ? <span className="pill pill-ok">Assinado</span> : <span className="pill pill-warn">Pendente</span>}</td>
                    <td className="px-3 py-3">
                      <NotaVigilancia nota={vig?.nota} />
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link href={`/painel/documentos?conta=${conta.id}`} className="inline-flex items-center gap-1 text-[12.5px] text-brand-ink hover:underline">
                        <Radar size={13} /> Documentos
                      </Link>
                    </td>
                  </tr>
                ))}
                {d.situacao.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-muted">
                      Nenhum cliente ainda.{" "}
                      <Link href="/painel/contas/novo" className="text-brand-ink underline">
                        Ative o primeiro
                      </Link>
                      .
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      </details>
    </div>
  );
}
