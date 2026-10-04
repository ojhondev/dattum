import Link from "next/link";
import { ne } from "drizzle-orm";
import { ArrowRight, LogIn, MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { temServicoDpo } from "@/lib/auth";
import { tarefasDaAgencia, type Tarefa } from "@/lib/tarefas";
import { nomeDoDpo } from "@/lib/dpo";
import { EMAIL_DEMO } from "@/lib/admin-dados";
import { PLANOS } from "@/lib/planos";
import { linkWhatsappPara } from "@/lib/contato";

export const dynamic = "force-dynamic";

const TH = "border-b border-line px-4 py-3 text-left font-mono text-[11.5px] font-normal uppercase tracking-[0.04em] text-muted";
const TD = "border-b border-line px-4 py-3.5 align-middle";
const MARCA: Record<Tarefa["urgencia"], { rotulo: string; classe: string }> = {
  1: { rotulo: "Hoje", classe: "bg-danger-tint text-danger" },
  2: { rotulo: "Importante", classe: "bg-warn-tint text-warn" },
  3: { rotulo: "Para completar", classe: "bg-surface-2 text-muted" },
};
const entrar = (agenciaId: string, destino?: string) => `/api/admin/operar/${agenciaId}${destino ? `?destino=${encodeURIComponent(destino)}` : ""}`;

/**
 * Portal do DPO: as agências que contrataram o serviço (Scale ou adicional), as pendências de todas
 * elas numa lista só e o botão para entrar na conta e resolver. Entrar exige a autorização da agência.
 */
export default async function PortalDpo({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const [nome, todas] = await Promise.all([nomeDoDpo(), db.query.agencias.findMany({ where: ne(agencias.email, EMAIL_DEMO), orderBy: (t, { asc }) => asc(t.nome) })]);
  const atendidas = todas.filter((a) => temServicoDpo(a) && !a.suspensa);
  const autorizadas = atendidas.filter((a) => a.acessoDattis);
  const tarefasPor = new Map(await Promise.all(autorizadas.map(async (a) => [a.id, await tarefasDaAgencia(a.id)] as const)));
  const fila = autorizadas.flatMap((a) => (tarefasPor.get(a.id) ?? []).map((t) => ({ ...t, agencia: a }))).sort((x, y) => x.urgencia - y.urgencia);
  const hoje = fila.filter((t) => t.urgencia === 1).length;

  return (
    <div className="max-w-7xl">
      <p className="t-eyebrow">WebMaster · Portal do DPO</p>
      <h1 className="t-display mt-3 max-w-3xl">Portal do DPO</h1>
      <p className="mt-4 max-w-3xl text-body leading-relaxed text-body">
        As agências que contrataram o serviço de DPO, com tudo o que falta em todas elas. Você entra na conta como <b className="text-ink">{nome}</b> (o
        encarregado definido em{" "}
        <Link href="/admin/seo" className="underline underline-offset-2">
          SEO → Dados da empresa
        </Link>
        ), e cada ação fica no registro de atividades da agência.
      </p>
      {erro === "sem-acesso" && (
        <p className="mt-5 rounded-2xl bg-warn-tint px-4 py-3 text-[14px] text-warn">
          Essa agência não autorizou o acesso ou não tem o serviço de DPO. Peça para ela ligar em Configurações → Acesso da Dattis.
        </p>
      )}

      <div className="mt-7 flex flex-wrap gap-2">
        <span className="tag">{atendidas.length} agência(s) atendida(s)</span>
        <span className="tag tag-white border border-line">{autorizadas.length} com acesso autorizado</span>
        <span className="tag tag-white border border-line">{fila.length} pendência(s)</span>
        {hoje > 0 && <span className="pill pill-danger">{hoje} para hoje</span>}
      </div>

      <section className="mt-8 overflow-hidden rounded-[20px] border border-line bg-surface">
        <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-5 py-4">
          <h2 className="font-display text-[22px] text-ink">O que fazer agora, em todas as agências</h2>
          <span className="text-[13px] text-muted">&ldquo;Resolver&rdquo; entra na conta já na tela certa</span>
        </header>
        {fila.length === 0 ? (
          <p className="px-5 py-8 text-center text-[14px] text-muted">
            {autorizadas.length ? "Nenhuma pendência nas agências atendidas. Tudo em dia." : "Nenhuma agência autorizou o acesso ainda."}
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {fila.slice(0, 40).map((t) => (
              <li key={`${t.agencia.id}-${t.id}`} className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={"rounded-full px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.04em] " + MARCA[t.urgencia].classe}>{MARCA[t.urgencia].rotulo}</span>
                    <span className="text-[12.5px] font-medium text-ink">{t.agencia.nome}</span>
                    {t.cliente && <span className="text-[12.5px] text-muted">· {t.cliente}</span>}
                  </div>
                  <p className="mt-1 text-[15px] font-medium leading-snug text-ink">{t.titulo}</p>
                  <p className="mt-0.5 text-[13px] leading-snug text-muted">{t.detalhe}</p>
                </div>
                <a href={entrar(t.agencia.id, t.acao.href)} className={"barra-btn shrink-0 self-start sm:self-auto " + (t.urgencia === 1 ? "primario" : "")}>
                  Resolver <ArrowRight size={14} />
                </a>
              </li>
            ))}
          </ul>
        )}
        {fila.length > 40 && <p className="border-t border-line px-5 py-3 text-[13px] text-muted">E mais {fila.length - 40}. Entre nas agências para ver todas.</p>}
      </section>

      <section className="mt-8">
        <h2 className="text-[17px] font-medium text-ink">Agências atendidas</h2>
        <p className="mt-1 text-[13.5px] text-muted">
          Growth e Scale já incluem a Dattis como DPO. No Start, a agência opera sozinha; para uma exceção, ligue o serviço adicional em{" "}
          <Link href="/admin/agencias" className="underline underline-offset-2">
            Agências
          </Link>
          .
        </p>
        <div className="mt-3 overflow-x-auto rounded-[20px] border border-line bg-surface">
          {atendidas.length === 0 ? (
            <p className="px-5 py-8 text-center text-[14px] text-muted">Nenhuma agência com o serviço de DPO ainda.</p>
          ) : (
            <table className="w-full min-w-[860px] border-collapse text-[14px]">
              <thead>
                <tr className="bg-surface-2">
                  {["Agência", "Plano", "Serviço", "Acesso", "Pendências", "Último acesso", "Ação"].map((h) => (
                    <th key={h} className={TH}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {atendidas.map((a) => {
                  const n = tarefasPor.get(a.id)?.length;
                  const pedir = linkWhatsappPara(
                    a.whatsapp,
                    `Olá! Aqui é ${nome}, DPO da Dattis. Para eu cuidar da conta da ${a.nome} por vocês, preciso que liguem a autorização em Configurações → Acesso da Dattis no painel. Leva 10 segundos.`,
                  );
                  return (
                    <tr key={a.id} className="last:[&>td]:border-b-0">
                      <td className={TD}>
                        <span className="font-medium text-ink">{a.nome}</span>
                        <span className="block text-[12.5px] text-muted">{a.email}</span>
                      </td>
                      <td className={TD}>{PLANOS.find((p) => p.id === a.plano)?.nome ?? a.plano}</td>
                      <td className={TD + " text-muted"}>{a.plano === "start" ? "Adicional" : "Incluso no plano"}</td>
                      <td className={TD}>{a.acessoDattis ? <span className="pill pill-ok">Autorizado</span> : <span className="pill pill-warn">Aguardando autorização</span>}</td>
                      <td className={TD + " tabular-nums"}>{n ?? "—"}</td>
                      <td className={TD + " text-muted"}>
                        {a.dattisUltimoAcesso ? a.dattisUltimoAcesso.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }) : "Nunca"}
                      </td>
                      <td className={TD}>
                        {a.acessoDattis ? (
                          <a href={entrar(a.id)} className="barra-btn primario">
                            <LogIn size={14} /> Entrar na conta
                          </a>
                        ) : pedir ? (
                          <a href={pedir} target="_blank" rel="noopener" className="barra-btn">
                            <MessageCircle size={14} /> Pedir autorização
                          </a>
                        ) : (
                          <span className="text-[12.5px] text-muted">Sem WhatsApp cadastrado</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
