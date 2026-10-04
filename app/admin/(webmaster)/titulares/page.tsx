import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, contasCliente, pedidosTitular } from "@/lib/db/schema";
import { STATUS_PEDIDO, diasAtePrazo, rotuloTipo } from "@/lib/titulares";
import { agoraMs } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TH = "border-b border-line px-4 py-3 text-left font-mono text-[12px] font-normal uppercase tracking-[0.04em] text-muted";
const TD = "border-b border-line px-4 py-3.5 align-top";

/** Visão da Dattis sobre todos os pedidos de titulares. Nos planos Growth e Scale, o DPO da Dattis responde estes pedidos. */
export default async function AdminTitulares() {
  const [pedidos, ags, contas] = await Promise.all([
    db.query.pedidosTitular.findMany({ orderBy: desc(pedidosTitular.criadoEm), limit: 500 }),
    db.select({ id: agencias.id, nome: agencias.nome, plano: agencias.plano }).from(agencias),
    db.select({ id: contasCliente.id, nome: contasCliente.nome }).from(contasCliente),
  ]);
  const ag = new Map(ags.map((a) => [a.id, a]));
  const conta = new Map(contas.map((c) => [c.id, c.nome]));
  const agora = agoraMs();
  const abertos = pedidos.filter((p) => p.status === "aberto" || p.status === "em_andamento");
  const atrasados = abertos.filter((p) => diasAtePrazo(p.prazo, agora) < 0).length;

  return (
    <div className="max-w-7xl">
      <p className="t-eyebrow">WebMaster · Titulares</p>
      <h1 className="t-display mt-3 max-w-3xl">Pedidos de titulares de todas as agências</h1>
      <p className="mt-4 max-w-2xl text-body leading-relaxed text-body">
        Pedidos feitos pelo formulário das políticas públicas. Nas agências do plano Scale, o DPO da Dattis acompanha e ajuda a responder dentro do prazo
        de 15 dias.
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        <span className="tag">{pedidos.length} pedido(s)</span>
        <span className="tag tag-white border border-line">{abertos.length} em aberto</span>
        {atrasados > 0 && <span className="pill pill-danger">{atrasados} atrasado(s)</span>}
      </div>
      <div className="mt-6 overflow-x-auto rounded-[20px] border border-line bg-surface">
        <table className="w-full min-w-[900px] border-collapse text-[14px]">
          <thead>
            <tr>
              <th className={TH}>Recebido</th>
              <th className={TH}>Agência</th>
              <th className={TH}>Origem</th>
              <th className={TH}>Pedido</th>
              <th className={TH}>Situação</th>
              <th className={TH}>Prazo</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  Nenhum pedido ainda.
                </td>
              </tr>
            ) : (
              pedidos.map((p) => {
                const a = ag.get(p.agenciaId);
                const dias = diasAtePrazo(p.prazo, agora);
                const fechado = p.status === "respondido" || p.status === "recusado";
                return (
                  <tr key={p.id}>
                    <td className={TD + " whitespace-nowrap text-muted"}>{p.criadoEm.toLocaleDateString("pt-BR")}</td>
                    <td className={TD}>
                      <span className="text-ink">{a?.nome ?? "—"}</span> {a?.plano === "scale" && <span className="pill pill-brand ml-1">Scale · DPO</span>}
                    </td>
                    <td className={TD}>{p.contaClienteId ? conta.get(p.contaClienteId) : "Site da agência"}</td>
                    <td className={TD}>
                      {rotuloTipo(p.tipo)}
                      <span className="block font-mono text-[12px] text-muted">{p.protocolo}</span>
                    </td>
                    <td className={TD}>{STATUS_PEDIDO[p.status]?.rotulo ?? p.status}</td>
                    <td className={TD + " whitespace-nowrap"}>
                      {fechado ? "—" : dias < 0 ? <span className="pill pill-danger">{Math.abs(dias)} dia(s) atrasado</span> : `${dias} dia(s)`}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
