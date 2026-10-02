import Link from "next/link";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { agencias, contasCliente, pedidosTitular } from "@/lib/db/schema";
import { TIPOS_PEDIDO, diasAtePrazo, rotuloTipo } from "@/lib/titulares";
import { agoraMs } from "@/lib/utils";
import { PedidoItem } from "./PedidoItem";

export const dynamic = "force-dynamic";

const FILTROS = [
  { id: "abertos", nome: "Em aberto", status: ["aberto", "em_andamento"] },
  { id: "encerrados", nome: "Encerrados", status: ["respondido", "recusado"] },
  { id: "todos", nome: "Todos", status: ["aberto", "em_andamento", "respondido", "recusado"] },
];

export default async function TitularesPage({ searchParams }: { searchParams: Promise<{ filtro?: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return null;
  const { filtro } = await searchParams;
  const f = FILTROS.find((x) => x.id === filtro) ?? FILTROS[0];
  const [agencia, pedidos, contas] = await Promise.all([
    db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId), columns: { nome: true, plano: true } }),
    db.query.pedidosTitular.findMany({
      where: and(eq(pedidosTitular.agenciaId, sessao.agenciaId), inArray(pedidosTitular.status, f.status)),
      orderBy: desc(pedidosTitular.criadoEm),
      limit: 200,
    }),
    db.query.contasCliente.findMany({ where: eq(contasCliente.agenciaId, sessao.agenciaId), columns: { id: true, nome: true } }),
  ]);
  const nomeConta = new Map(contas.map((c) => [c.id, c.nome]));
  const agora = agoraMs();

  return (
    <div className="max-w-5xl">
      <p className="t-eyebrow">Dattis · Pedidos de titulares</p>
      <h1 className="t-display mt-3 max-w-3xl">Pedidos das pessoas sobre os próprios dados</h1>
      <p className="mt-4 max-w-3xl text-body leading-relaxed text-body">
        Quem tem dados nas campanhas dos seus clientes pode pedir para ver, corrigir ou apagar esses dados (art. 18 da LGPD). Os pedidos feitos no
        formulário das políticas públicas chegam aqui, com protocolo e o prazo legal de 15 dias.
        {agencia?.plano === "scale" ? " No plano Scale, o DPO da Dattis acompanha estes pedidos com você." : ""}
      </p>

      <nav className="mt-8 flex flex-wrap gap-1.5" aria-label="Filtrar pedidos">
        {FILTROS.map((x) => (
          <Link key={x.id} href={`/painel/titulares?filtro=${x.id}`} className={"tag " + (x.id === f.id ? "" : "tag-white border border-line")}>
            {x.nome}
          </Link>
        ))}
      </nav>

      {pedidos.length === 0 ? (
        <div className="mt-6 rounded-[20px] border border-line bg-surface px-6 py-10 text-center">
          <p className="font-display text-[22px] text-ink">{f.id === "abertos" ? "Nenhum pedido em aberto" : "Nenhum pedido aqui"}</p>
          <p className="mx-auto mt-2 max-w-xl text-[14.5px] leading-relaxed text-body">
            Os pedidos chegam pelo formulário “Exercer meus direitos” das políticas de privacidade publicadas pela Dattis. Publique a política de
            cada cliente na página dele e cole o link no site e nos formulários de anúncio.
          </p>
          <Link href="/painel/contas" className="painel-btn ghost mt-5">
            Ver clientes
          </Link>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {pedidos.map((p) => (
            <PedidoItem
              key={p.id}
              p={{
                id: p.id,
                protocolo: p.protocolo,
                nome: p.nome,
                email: p.email,
                tipo: p.tipo,
                tipoRotulo: rotuloTipo(p.tipo),
                tipoArtigo: TIPOS_PEDIDO.find((t) => t.id === p.tipo)?.descricao ?? "",
                mensagem: p.mensagem,
                status: p.status,
                resposta: p.resposta,
                origem: p.contaClienteId ? (nomeConta.get(p.contaClienteId) ?? "Cliente") : `${agencia?.nome ?? "Agência"} (site da agência)`,
                criadoEm: p.criadoEm.toISOString(),
                diasRestantes: diasAtePrazo(p.prazo, agora),
                encerrado: p.status === "respondido" || p.status === "recusado",
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
