import Link from "next/link";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { agencias, atividadesTratamento, contaSubprocessadores, contasCliente, pedidosTitular, subprocessadoresCatalogo } from "@/lib/db/schema";
import type { ContextoPedido } from "@/lib/respostas-titular";
import { TIPOS_PEDIDO, diasAtePrazo, rotuloTipo } from "@/lib/titulares";
import { agoraMs } from "@/lib/utils";
import { PedidoItem } from "./PedidoItem";
import { BarraModulo, BuscaModulo, FiltroModulo } from "@/components/app/Modulo";

export const dynamic = "force-dynamic";

const FILTROS = [
  { id: "abertos", nome: "Em aberto", status: ["aberto", "em_andamento"] },
  { id: "encerrados", nome: "Encerrados", status: ["respondido", "recusado"] },
  { id: "todos", nome: "Todos", status: ["aberto", "em_andamento", "respondido", "recusado"] },
];

export default async function TitularesPage({ searchParams }: { searchParams: Promise<{ filtro?: string; q?: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return null;
  const { filtro, q } = await searchParams;
  const termo = (q ?? "").trim().toLowerCase();
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
  const visiveis = termo ? pedidos.filter((p) => [p.protocolo, p.nome, p.email].some((v) => v.toLowerCase().includes(termo))) : pedidos;

  // O que a Dattis sabe de cada cliente (registro e ferramentas) para escrever a resposta pronta.
  const ids = [...new Set(visiveis.map((p) => p.contaClienteId).filter((x): x is string => !!x))];
  const [ativs, ferrs] = ids.length
    ? await Promise.all([
        db
          .select({ conta: atividadesTratamento.contaClienteId, dados: atividadesTratamento.categoriasDado, finalidade: atividadesTratamento.finalidade, prazo: atividadesTratamento.prazoRetencao })
          .from(atividadesTratamento)
          .where(inArray(atividadesTratamento.contaClienteId, ids)),
        db
          .select({ conta: contaSubprocessadores.contaClienteId, custom: contaSubprocessadores.nomeCustomizado, nome: subprocessadoresCatalogo.nome, categoria: subprocessadoresCatalogo.categoria, pais: subprocessadoresCatalogo.pais })
          .from(contaSubprocessadores)
          .leftJoin(subprocessadoresCatalogo, eq(contaSubprocessadores.subprocessadorCatalogoId, subprocessadoresCatalogo.id))
          .where(inArray(contaSubprocessadores.contaClienteId, ids)),
      ])
    : [[], []];
  const contexto = (contaId: string | null): ContextoPedido => ({
    empresa: contaId ? (nomeConta.get(contaId) ?? "") : (agencia?.nome ?? ""),
    agencia: agencia?.nome ?? "",
    atividades: ativs.filter((a) => a.conta === contaId).map((a) => ({ dados: a.dados, finalidade: a.finalidade, prazo: a.prazo })),
    ferramentas: ferrs.filter((x) => x.conta === contaId).map((x) => ({ nome: x.custom ?? x.nome ?? "—", categoria: x.custom ? "Informada pela agência" : (x.categoria ?? ""), pais: x.custom ? null : x.pais })),
  });

  return (
    <div className="max-w-5xl">
      <BarraModulo
        esquerda={
          <>
            <BuscaModulo placeholder="Protocolo, nome ou e-mail" />
            <FiltroModulo nome="filtro" opcoes={FILTROS.map((x) => ({ valor: x.id, rotulo: x.nome }))} />
          </>
        }
        direita={
          <span className="px-2 text-[13px] text-muted">
            Prazo legal de 15 dias{agencia && agencia.plano !== "start" ? " · o DPO da Dattis responde por você" : ""}
          </span>
        }
      />

      {visiveis.length === 0 ? (
        <div className="bloco px-6 py-10 text-center">
          <p className="text-[16px] font-medium text-ink">{termo ? "Nenhum pedido com essa busca" : f.id === "abertos" ? "Nenhum pedido em aberto" : "Nenhum pedido aqui"}</p>
          <p className="mx-auto mt-2 max-w-xl text-[14.5px] leading-relaxed text-body">
            Os pedidos chegam pelo formulário “Exercer meus direitos” das políticas de privacidade publicadas pela Dattis. Publique a política de
            cada cliente na página dele e cole o link no site e nos formulários de anúncio.
          </p>
          <Link href="/painel/contas" className="painel-btn ghost mt-5">
            Ver clientes
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {visiveis.map((p) => (
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
                contexto: contexto(p.contaClienteId),
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
