import Link from "next/link";
import { eq } from "drizzle-orm";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { agencias, contasCliente } from "@/lib/db/schema";
import { montarDat, type Dat } from "@/lib/dat";
import { ImprimirAoAbrir } from "@/components/app/ImprimirAoAbrir";
import { BarraModulo } from "@/components/app/Modulo";
import { BotaoImprimir } from "./BotaoImprimir";

export const dynamic = "force-dynamic";

const data = (d: Date) => d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

/** Coluna curta para a tabela: pega o item do DAT pelo começo do título. */
function item(dat: Dat, comeco: string) {
  return dat.itens.find((i) => i.titulo.startsWith(comeco)) ?? null;
}

function Marca({ ok, texto }: { ok: boolean | null; texto: string }) {
  if (ok === null) return <span className="text-faint">—</span>;
  return (
    <span className={"inline-flex items-start gap-1.5 " + (ok ? "text-brand-ink" : "text-warn")}>
      {ok ? <CheckCircle2 size={15} className="mt-px shrink-0" /> : <CircleAlert size={15} className="mt-px shrink-0" />}
      <span className="text-ink">{texto}</span>
    </span>
  );
}

/**
 * Relatório de conformidade em um clique: a carteira inteira (padrão) ou um cliente (?conta=).
 * Com ?imprimir=1 já abre a janela para salvar em PDF.
 */
export default async function RelatorioPage({ searchParams }: { searchParams: Promise<{ conta?: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return null;
  const { conta } = await searchParams;

  const [agencia, contas] = await Promise.all([
    db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) }),
    db.query.contasCliente.findMany({ where: eq(contasCliente.agenciaId, sessao.agenciaId), orderBy: (t, { asc }) => asc(t.nome) }),
  ]);
  if (!agencia) return null;
  const escolhidas = conta ? contas.filter((c) => c.id === conta) : contas;
  const dats = (await Promise.all(escolhidas.map((c) => montarDat(c.id)))).filter((d): d is Dat => !!d);
  const emDia = dats.filter((d) => d.emDia).length;
  const pendencias = dats.reduce((n, d) => n + d.pendencias.length, 0);
  const umCliente = !!conta && dats.length === 1;
  const hoje = new Date();

  return (
    <div>
      <ImprimirAoAbrir />
      <BarraModulo
        esquerda={
          <p className="px-2 text-[13.5px] text-muted">
            {umCliente ? (
              <>
                Relatório de <b className="font-medium text-ink">{dats[0].conta.nome}</b> ·{" "}
                <Link href="/painel/relatorio" className="underline underline-offset-2 hover:text-ink">
                  ver a carteira inteira
                </Link>
              </>
            ) : (
              <>Relatório da carteira · {dats.length} cliente(s)</>
            )}
          </p>
        }
        direita={<BotaoImprimir />}
      />

      <article className="mx-auto w-full max-w-[980px] rounded-[28px] border border-line bg-surface px-5 py-7 sm:px-10 sm:py-10 print:max-w-none print:rounded-none print:border-0 print:p-0">
        <header className="flex flex-col gap-5 border-b border-line pb-7 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.05em] text-muted">Relatório de conformidade LGPD · {data(hoje)}</p>
            <h1 className="mt-3 font-display text-[clamp(1.7rem,3.4vw,2.3rem)] leading-[1.12] text-ink">
              {umCliente ? dats[0].conta.nome : agencia.nome}
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-body">
              {umCliente
                ? `Situação da documentação de privacidade preparada por ${agencia.nome}.`
                : `Situação da documentação de privacidade de cada cliente atendido pela agência${agencia.cnpj ? ` (CNPJ ${agencia.cnpj})` : ""}.`}
            </p>
          </div>
          <dl className="grid shrink-0 grid-cols-3 gap-2 text-center sm:w-[320px]">
            {[
              ["Clientes", dats.length],
              ["Em dia", emDia],
              ["Pendências", pendencias],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-canvas px-2 py-3 print:border print:border-line">
                <dd className="font-display text-[26px] leading-none text-ink tabular-nums">{v}</dd>
                <dt className="mt-1 text-[11.5px] text-muted">{k}</dt>
              </div>
            ))}
          </dl>
        </header>

        {dats.length === 0 ? (
          <p className="py-12 text-center text-[15px] text-muted">
            Nenhum cliente cadastrado ainda.{" "}
            <Link href="/painel/contas/novo" className="underline underline-offset-2">
              Cadastrar o primeiro
            </Link>
          </p>
        ) : (
          <>
            <section className="mt-7 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-[13.5px]">
                <thead>
                  <tr className="font-mono text-[11px] uppercase tracking-[0.04em] text-muted">
                    {["Cliente", "Registro", "Contrato", "Ferramentas", "Site", "Certificado"].map((h) => (
                      <th key={h} className="border-b border-line py-2.5 pr-3 font-normal">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dats.map((d) => {
                    const reg = item(d, "Registro");
                    const con = item(d, "Contrato");
                    const fer = item(d, "Ferramentas");
                    const site = item(d, "Segurança");
                    const cert = item(d, "Certificado");
                    return (
                      <tr key={d.conta.id} className="align-top">
                        <td className="border-b border-line py-3 pr-3">
                          <span className="font-medium text-ink">{d.conta.nome}</span>
                          <span className={"mt-0.5 block text-[12px] " + (d.emDia ? "text-brand-ink" : "text-warn")}>
                            {d.emDia ? "Em dia" : `${d.pendencias.length} pendência(s)`}
                          </span>
                        </td>
                        <td className="border-b border-line py-3 pr-3">
                          <Marca ok={reg?.ok ?? null} texto={reg?.ok ? "Feito" : "Vazio"} />
                        </td>
                        <td className="border-b border-line py-3 pr-3">
                          <Marca ok={con?.ok ?? null} texto={con?.ok ? "Assinado" : (con?.resumo ?? "—")} />
                        </td>
                        <td className="border-b border-line py-3 pr-3 text-ink">{fer?.resumo.match(/^\d+/)?.[0] ?? "0"}</td>
                        <td className="border-b border-line py-3 pr-3">
                          <Marca ok={site ? site.ok : null} texto={site?.resumo.match(/Nota \d+/)?.[0] ?? (site ? "Aguardando" : "")} />
                        </td>
                        <td className="border-b border-line py-3">
                          <Marca ok={cert?.ok ?? null} texto={cert?.ok ? "Válido" : "Não emitido"} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>

            {pendencias > 0 && (
              <section className="mt-9 break-inside-avoid">
                <h2 className="font-display text-[20px] text-ink">O que falta fazer</h2>
                <ul className="mt-4 grid gap-3 md:grid-cols-2">
                  {dats
                    .filter((d) => d.pendencias.length)
                    .map((d) => (
                      <li key={d.conta.id} className="break-inside-avoid rounded-2xl bg-canvas px-4 py-3.5 print:border print:border-line">
                        <p className="text-[14px] font-semibold text-ink">{d.conta.nome}</p>
                        <ul className="mt-1.5 flex flex-col gap-1 text-[13.5px] leading-relaxed text-body">
                          {d.pendencias.map((p) => (
                            <li key={p}>• {p}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                </ul>
              </section>
            )}
          </>
        )}

        <footer className="mt-9 border-t border-line pt-5 text-[12.5px] leading-relaxed text-muted">
          Gerado pela Dattis em {hoje.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" })}, com os dados do
          momento. A situação de cada cliente se atualiza sozinha conforme contratos são assinados e os sites são verificados.
        </footer>
      </article>
    </div>
  );
}
