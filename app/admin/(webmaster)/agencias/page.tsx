import { carregarAgencias, brl } from "@/lib/admin-dados";
import { formatarTelefone, linkWhatsappPara } from "@/lib/contato";
import { NotaVigilancia, ContagemSeveridades } from "@/components/app/VigilanciaChips";
import { RodarVarredura, ExportarCsv, LinkSenha, GerenciarAgencia } from "../AcoesAdmin";

export const dynamic = "force-dynamic";

const TH = "border-b border-line px-4 py-3 text-left font-mono text-[12px] font-normal uppercase tracking-[0.04em] text-muted";
const TD = "border-b border-line px-4 py-3.5 align-middle";

export default async function AdminAgencias() {
  const ags = await carregarAgencias();
  const reais = ags.filter((a) => !a.demo);

  return (
    <div className="max-w-7xl">
      <p className="t-eyebrow">WebMaster · Agências</p>
      <h1 className="t-display mt-3">Agências clientes</h1>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <span className="tag">{reais.length} agência(s)</span>
        <span className="tag tag-white border border-line">{brl(reais.reduce((s, a) => s + a.mrr, 0))}/mês</span>
        <span className="tag tag-white border border-line">{reais.reduce((s, a) => s + a.contas, 0)} clientes ativos</span>
        <span className="ml-auto">
          <ExportarCsv
            nome="dattis-agencias.csv"
            linhas={[
              ["Agência", "E-mail", "Plano", "Clientes ativos", "Contratados", "Contratos assinados", "Certificados", "Nota vigilância", "Críticos", "MRR", "WhatsApp", "Criada em"],
              ...ags.map((a) => [
                a.nome,
                a.email,
                a.planoNome,
                a.contas,
                a.contratados ?? "sem limite",
                a.assinados,
                a.certificados,
                a.notaMedia,
                a.criticos,
                a.mrr,
                formatarTelefone(a.contato),
                a.criadaEm.toLocaleDateString("pt-BR"),
              ]),
            ]}
          />
        </span>
      </div>

      <div className="card-flush mt-6 overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-body-sm">
          <thead>
            <tr className="bg-surface-2">
              <th className={TH}>Agência</th>
              <th className={TH}>Plano</th>
              <th className={TH}>Clientes</th>
              <th className={TH}>Contratos</th>
              <th className={TH}>Certificados</th>
              <th className={TH}>Vigilância</th>
              <th className={TH}>MRR</th>
              <th className={TH}>Contato</th>
              <th className={TH}></th>
            </tr>
          </thead>
          <tbody>
            {ags.map((a) => {
              const wa = linkWhatsappPara(a.contato, `Olá! Aqui é da Dattis, sobre a conta da ${a.nome}.`);
              return (
                <tr key={a.id} className="transition-colors last:[&>td]:border-b-0 hover:bg-surface-2">
                  <td className={TD}>
                    <span className="block font-medium text-ink">
                      {a.nome} {a.demo && <span className="pill pill-neutral ml-1">demo</span>}
                      {a.suspensa && <span className="pill pill-warn ml-1">suspensa</span>}
                    </span>
                    <span className="text-[13px] text-muted">
                      {a.email} · desde {a.criadaEm.toLocaleDateString("pt-BR")}
                    </span>
                  </td>
                  <td className={TD}>{a.planoNome}</td>
                  <td className={TD + " tabular-nums"}>
                    {a.contas}
                    {a.contratados != null && <span className="text-muted"> / {a.contratados}</span>}
                  </td>
                  <td className={TD + " tabular-nums"}>
                    {a.assinados}/{a.contas}
                  </td>
                  <td className={TD + " tabular-nums"}>{a.certificados}</td>
                  <td className={TD}>
                    <span className="flex flex-wrap items-center gap-1.5">
                      <NotaVigilancia nota={a.notaMedia} compacto />
                      {a.notaMedia != null && <ContagemSeveridades criticos={a.criticos} altos={a.altos} medios={0} />}
                    </span>
                  </td>
                  <td className={TD + " tabular-nums"}>{a.demo ? "—" : brl(a.mrr)}</td>
                  <td className={TD}>
                    {wa ? (
                      <a href={wa} target="_blank" rel="noopener" className="text-brand-ink hover:underline">
                        {formatarTelefone(a.contato)}
                      </a>
                    ) : (
                      <span className="text-muted">{a.contato ?? "—"}</span>
                    )}
                  </td>
                  <td className={TD}>
                    <span className="flex flex-col gap-1.5">
                      <RodarVarredura agenciaId={a.id} rotulo="Varrer" className="btn btn-ghost" />
                      {!a.demo && <LinkSenha agenciaId={a.id} agenciaNome={a.nome} contato={a.contato} />}
                      {!a.demo && <GerenciarAgencia agenciaId={a.id} agenciaNome={a.nome} plano={a.plano} clientes={a.contratados} suspensa={a.suspensa} servicoDpo={a.servicoDpo} />}
                    </span>
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
