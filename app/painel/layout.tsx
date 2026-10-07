import { redirect } from "next/navigation";
import { and, count, eq, inArray } from "drizzle-orm";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { agencias, contasCliente, pedidosTitular, usuarios } from "@/lib/db/schema";
import { PLANOS } from "@/lib/planos";
import { Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";
import SairButton from "./SairButton";
import { AvisoTermos } from "./AvisoTermos";
import { AvisoExploracao } from "./AvisoExploracao";
import { TourProvider } from "@/components/app/Tour";
import { VERSAO_LEGAL } from "@/lib/legal";
import { EMAIL_DEMO } from "@/lib/admin-dados";
import { linkContato } from "@/lib/contato";
import { brlCheio, cobrancaAtrasada, nomeCompetencia } from "@/lib/cobranca";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const sessao = await getSessao();
  if (!sessao) redirect("/entrar");

  const [agencia, [{ n }], [{ pedidos }]] = await Promise.all([
    db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) }),
    db.select({ n: count() }).from(contasCliente).where(eq(contasCliente.agenciaId, sessao.agenciaId)),
    db
      .select({ pedidos: count() })
      .from(pedidosTitular)
      .where(and(eq(pedidosTitular.agenciaId, sessao.agenciaId), inArray(pedidosTitular.status, ["aberto", "em_andamento"]))),
  ]);
  if (!agencia) redirect("/entrar");
  const atrasada = !sessao.usuarioId && !agencia.suspensa ? await cobrancaAtrasada(agencia.id) : null;
  const pessoa = sessao.usuarioId ? await db.query.usuarios.findFirst({ where: eq(usuarios.id, sessao.usuarioId), columns: { nome: true } }) : null;
  const exploracao = !agencia.ativadaEm;
  const plano = exploracao ? { nome: "Exploração" } : PLANOS.find((p) => p.id === agencia.plano);

  return (
    <TourProvider vistosIniciais={agencia.toursVistos ?? []} salvarNoServidor={agencia.email !== EMAIL_DEMO}>
    <div className="flex min-h-svh bg-canvas">
      <Sidebar
        agenciaNome={agencia.nome}
        sairSlot={<SairButton />}
        plano={plano ? { nome: plano.nome, usados: Number(n), limite: agencia.clientesContratados } : undefined}
        pessoa={sessao.operador ? `DPO Dattis (${sessao.operador})` : (pessoa?.nome ?? null)}
        pedidosAbertos={Number(pedidos)}
      />
      <div className="min-w-0 flex-1">
        {sessao.operador && (
          <div className="no-print flex flex-wrap items-center gap-x-4 gap-y-1 bg-orange px-4 py-2 text-[13.5px] text-[#2b1606] sm:px-10">
            <span className="flex-1">
              Você está operando a conta da <b>{agencia.nome}</b> como DPO da Dattis ({sessao.operador}). Tudo o que fizer fica no registro de atividades dela.
            </span>
            {/* Rota de API que encerra a sessão: precisa ser link comum (o Link do Next poderia pré-carregar e deslogar). */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/api/admin/operar/sair" className="rounded-full bg-[#2b1606] px-3 py-1 font-mono text-[11.5px] uppercase tracking-[0.04em] text-white hover:bg-black">
              Sair e voltar ao portal
            </a>
          </div>
        )}
        <Topbar agenciaNome={agencia.nome} />
        <main className="px-4 pb-16 pt-6 sm:px-10 lg:pt-8">
          {atrasada && (
            <div className="mb-6 flex flex-col gap-3 rounded-[20px] border border-warn bg-warn-tint px-5 py-4 sm:flex-row sm:items-center">
              <p className="flex-1 text-[14.5px] leading-relaxed text-ink">
                A mensalidade de <b>{nomeCompetencia(atrasada.competencia)}</b> ({brlCheio(atrasada.valor)}) venceu em{" "}
                {atrasada.vencimento.toLocaleDateString("pt-BR")}. Regularize para evitar a suspensão do acesso e dos certificados.
              </p>
              <a
                href={agencia.linkPagamento ?? linkContato(`Olá! Quero regularizar a mensalidade de ${nomeCompetencia(atrasada.competencia)} da ${agencia.nome}.`)}
                target="_blank"
                rel="noopener"
                className="painel-btn shrink-0 self-start sm:self-auto"
              >
                {agencia.linkPagamento ? "Pagar agora" : "Falar com a Dattis"}
              </a>
            </div>
          )}
          {exploracao && !agencia.suspensa && (
            <AvisoExploracao
              limite={agencia.clientesContratados}
              linkAtivar={linkContato(`Olá! Criei a conta da ${agencia.nome} na Dattis e quero ativar o plano.`)}
              podeAplicar={!sessao.usuarioId && !sessao.operador}
            />
          )}
          {agencia.termosVersao !== VERSAO_LEGAL && agencia.email !== EMAIL_DEMO && !sessao.operador && (
            <AvisoTermos versao={VERSAO_LEGAL} atualizacao={!!agencia.termosVersao} />
          )}
          {agencia.suspensa ? (
            <div className="mx-auto max-w-xl py-16 text-center">
              <h1 className="font-display text-[30px] leading-tight text-ink">Acesso suspenso</h1>
              <p className="mt-4 text-[16px] leading-relaxed text-body">
                O acesso da {agencia.nome} está suspenso, normalmente por uma pendência de pagamento. Seus dados, contratos e documentos estão
                preservados e voltam a aparecer assim que a situação for regularizada.
              </p>
              <a
                href={linkContato(`Olá! O acesso da ${agencia.nome} à Dattis está suspenso. Como regularizo?`)}
                target="_blank"
                rel="noopener"
                className="painel-btn mt-7"
              >
                Falar com a Dattis
              </a>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
    </TourProvider>
  );
}
