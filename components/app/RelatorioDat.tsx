import { CheckCircle2, CircleAlert } from "lucide-react";
import type { Dat } from "@/lib/dat";

const mesAno = (d: Date) => d.toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });
const dataHora = (d: Date) => d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

/** O relatório para o cliente (antes chamado DAT): uma folha que a agência manda pro cliente (painel, link público e PDF). */
export function RelatorioDat({ dat, urlVerificacao }: { dat: Dat; urlVerificacao: string | null }) {
  return (
    <article className="mx-auto w-full max-w-[860px] rounded-[28px] border border-line bg-surface px-5 py-7 sm:px-10 sm:py-10 print:max-w-none print:rounded-none print:border-0 print:p-0">
      <header className="flex flex-col gap-5 border-b border-line pb-7 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[12px] uppercase tracking-[0.05em] text-muted">Relatório de conformidade LGPD · {mesAno(dat.geradoEm)}</p>
          <h1 className="mt-3 font-display text-[clamp(1.7rem,3.6vw,2.4rem)] leading-[1.12] text-ink">
            {dat.emDia ? `${dat.conta.nome} está em dia com a LGPD` : `${dat.conta.nome}: adequação em andamento`}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-body">
            Preparado por <b className="font-semibold text-ink">{dat.agencia.nome}</b>
            {dat.agencia.cnpj ? ` (CNPJ ${dat.agencia.cnpj})` : ""}, que opera dados da {dat.conta.nome}
            {dat.conta.cnpj ? ` (CNPJ ${dat.conta.cnpj})` : ""} em campanhas, atendimento e automações.
          </p>
        </div>
        <span
          className={
            "inline-flex shrink-0 items-center gap-2 self-start rounded-full px-4 py-2 font-mono text-[12px] uppercase tracking-[0.04em] " +
            (dat.emDia ? "bg-ok-tint text-brand-ink" : "bg-caution-tint text-ink")
          }
        >
          {dat.emDia ? <CheckCircle2 size={15} /> : <CircleAlert size={15} />}
          {dat.emDia ? "Em dia" : `${dat.pendencias.length} pendência(s)`}
        </span>
      </header>

      <section className="mt-7">
        <h2 className="font-display text-[20px] text-ink">Situação da documentação</h2>
        <ul className="mt-4 flex flex-col gap-2.5">
          {dat.itens.map((it) => (
            <li key={it.titulo} className="rounded-2xl bg-canvas px-4 py-3.5 print:border print:border-line">
              <div className="flex items-start gap-3">
                <span
                  className={
                    "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full " + (it.ok ? "bg-brand-strong text-rail" : "bg-caution-tint text-ink")
                  }
                  aria-label={it.ok ? "Em dia" : "Pendente"}
                >
                  {it.ok ? <CheckCircle2 size={15} /> : <CircleAlert size={15} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-ink">{it.titulo}</p>
                  <p className="mt-0.5 text-[14.5px] leading-relaxed text-body">{it.resumo}</p>
                  {it.detalhes.length > 0 && (
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {it.detalhes.map((d) => (
                        <li key={d} className="rounded-full border border-line bg-surface px-2.5 py-1 text-[12.5px] leading-snug text-body">
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {dat.operacoes.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-[20px] text-ink">O que a agência faz com os dados</h2>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {dat.operacoes.map((o) => (
              <li key={o.titulo} className="rounded-2xl border border-line px-4 py-3">
                <p className="text-[14.5px] font-medium text-ink">{o.titulo}</p>
                <p className="mt-1 text-[12.5px] leading-snug text-muted">{o.comoChamam}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {dat.pendencias.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-[20px] text-ink">Próximos passos</h2>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[15px] leading-relaxed text-body">
            {dat.pendencias.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
        </section>
      )}

      <footer className="mt-9 flex flex-col gap-2 border-t border-line pt-5 text-[12.5px] leading-relaxed text-muted">
        {urlVerificacao && (
          <p>
            Confira o certificado a qualquer momento:{" "}
            <a href={urlVerificacao} className="break-all text-brand-ink underline underline-offset-2">
              {urlVerificacao}
            </a>
          </p>
        )}
        <p>
          Gerado em {dataHora(dat.geradoEm)} pela plataforma Dattis com a documentação registrada nessa data. É um resumo de conformidade, não
          um parecer jurídico.
        </p>
      </footer>
    </article>
  );
}
