import { desc, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, cobrancas } from "@/lib/db/schema";
import { EMAIL_DEMO } from "@/lib/admin-dados";
import { DIAS_PARA_SUSPENDER, brlCheio, competenciaDe, nomeCompetencia, situacaoCobranca } from "@/lib/cobranca";
import { PLANOS } from "@/lib/planos";
import { agoraMs } from "@/lib/utils";
import { AcoesCobranca, ConfigCobranca, GerarCobrancas } from "./AcoesCobranca";

export const dynamic = "force-dynamic";

const TH = "border-b border-line px-4 py-3 text-left font-mono text-[12px] font-normal uppercase tracking-[0.04em] text-muted";
const TD = "border-b border-line px-4 py-3.5 align-top";

const PILULA: Record<string, [string, string]> = {
  paga: ["pill-ok", "Paga"],
  a_vencer: ["pill-neutral", "A vencer"],
  atrasada: ["pill-danger", "Atrasada"],
  cancelada: ["pill-neutral", "Cancelada"],
};

export default async function AdminCobranca() {
  const agora = agoraMs();
  const mes = competenciaDe(new Date(agora));
  const [ags, todas] = await Promise.all([
    db.query.agencias.findMany({ where: ne(agencias.email, EMAIL_DEMO) }),
    db.query.cobrancas.findMany({ orderBy: desc(cobrancas.vencimento), limit: 2000 }),
  ]);
  const doMes = todas.filter((c) => c.competencia === mes);
  const previsto = doMes.filter((c) => c.status !== "cancelada").reduce((s, c) => s + c.valor, 0);
  const recebido = doMes.filter((c) => c.status === "paga").reduce((s, c) => s + c.valor, 0);
  const atrasadas = todas.filter((c) => situacaoCobranca(c, agora).situacao === "atrasada");
  const emAtraso = atrasadas.reduce((s, c) => s + c.valor, 0);

  // Uma linha por agência: a mensalidade em atraso mais antiga ou, sem atraso, a do mês.
  const linhas = ags.map((a) => {
    const minhas = todas.filter((c) => c.agenciaId === a.id);
    const atrasada = minhas.filter((c) => situacaoCobranca(c, agora).situacao === "atrasada").sort((x, y) => x.vencimento.getTime() - y.vencimento.getTime())[0];
    const foco = atrasada ?? minhas.find((c) => c.competencia === mes) ?? null;
    return { a, foco, atrasadasN: minhas.filter((c) => situacaoCobranca(c, agora).situacao === "atrasada").length };
  });
  linhas.sort((x, y) => (y.foco ? situacaoCobranca(y.foco, agora).diasAtraso : -1) - (x.foco ? situacaoCobranca(x.foco, agora).diasAtraso : -1));

  return (
    <div className="max-w-7xl">
      <p className="t-eyebrow">WebMaster · Cobrança</p>
      <h1 className="t-display mt-3 max-w-3xl">Mensalidades das agências</h1>
      <p className="mt-4 max-w-2xl text-body leading-relaxed text-body">
        A cobrança é feita por link de pagamento. Aqui você controla o que venceu e o que foi pago, avisa no WhatsApp e suspende depois de{" "}
        {DIAS_PARA_SUSPENDER} dias do aviso, como dizem os Termos. As mensalidades do mês são criadas sozinhas todo dia 1º.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          [`Previsto em ${nomeCompetencia(mes)}`, brlCheio(previsto)],
          ["Recebido no mês", brlCheio(recebido)],
          [`Em atraso (${atrasadas.length})`, brlCheio(emAtraso)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-[20px] border border-line bg-surface p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-muted">{k}</p>
            <p className="mt-2 font-display text-[30px] tabular-nums text-ink">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <GerarCobrancas />
      </div>

      <div className="mt-4 overflow-x-auto rounded-[20px] border border-line bg-surface">
        <table className="w-full min-w-[980px] border-collapse text-[14px]">
          <thead>
            <tr>
              <th className={TH}>Agência</th>
              <th className={TH}>Mensalidade</th>
              <th className={TH}>Vencimento</th>
              <th className={TH}>Situação</th>
              <th className={TH}>Vencimento e link</th>
              <th className={TH}></th>
            </tr>
          </thead>
          <tbody>
            {linhas.map(({ a, foco, atrasadasN }) => {
              const sit = foco ? situacaoCobranca(foco, agora) : null;
              const plano = PLANOS.find((p) => p.id === a.plano)?.nome ?? a.plano;
              const msg = foco
                ? `Olá! Aqui é da Dattis. A mensalidade de ${nomeCompetencia(foco.competencia)} da ${a.nome} (${brlCheio(foco.valor)}) ${sit?.situacao === "atrasada" ? `venceu em ${foco.vencimento.toLocaleDateString("pt-BR")}` : `vence em ${foco.vencimento.toLocaleDateString("pt-BR")}`}.${a.linkPagamento ? ` Link para pagamento: ${a.linkPagamento}` : ""} Qualquer dúvida, é só responder por aqui.`
                : "";
              return (
                <tr key={a.id}>
                  <td className={TD}>
                    <span className="block text-ink">
                      {a.nome} {a.suspensa && <span className="pill pill-warn ml-1">suspensa</span>}
                    </span>
                    <span className="text-[12.5px] text-muted">
                      {plano} · {a.clientesContratados ?? "—"} cliente(s)
                    </span>
                  </td>
                  <td className={TD + " tabular-nums"}>
                    {foco ? (
                      <>
                        {brlCheio(foco.valor)}
                        <span className="block text-[12.5px] capitalize text-muted">{nomeCompetencia(foco.competencia)}</span>
                      </>
                    ) : (
                      <span className="text-muted">Ainda não gerada</span>
                    )}
                  </td>
                  <td className={TD + " whitespace-nowrap"}>{foco ? foco.vencimento.toLocaleDateString("pt-BR") : "—"}</td>
                  <td className={TD}>
                    {sit && <span className={`pill ${PILULA[sit.situacao][0]}`}>{PILULA[sit.situacao][1]}</span>}
                    {sit?.situacao === "atrasada" && (
                      <span className={"mt-1 block text-[12.5px] " + (sit.diasAtraso >= DIAS_PARA_SUSPENDER ? "text-danger" : "text-muted")}>
                        {sit.diasAtraso} dia(s){atrasadasN > 1 ? ` · ${atrasadasN} meses em aberto` : ""}
                      </span>
                    )}
                  </td>
                  <td className={TD}>
                    <ConfigCobranca agenciaId={a.id} dia={a.diaVencimento} link={a.linkPagamento} />
                  </td>
                  <td className={TD}>
                    {foco && (
                      <AcoesCobranca
                        cobrancaId={foco.id}
                        status={foco.status}
                        diasAtraso={sit?.diasAtraso ?? 0}
                        agencia={{ id: a.id, nome: a.nome, whatsapp: a.whatsapp, suspensa: a.suspensa }}
                        mensagem={msg}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
