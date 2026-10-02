import { redirect } from "next/navigation";
import { count, eq } from "drizzle-orm";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { agencias, contasCliente, usuarios } from "@/lib/db/schema";
import { PLANOS } from "@/lib/planos";
import { Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";
import SairButton from "./SairButton";
import { AvisoTermos } from "./AvisoTermos";
import { TourProvider } from "@/components/app/Tour";
import { VERSAO_LEGAL } from "@/lib/legal";
import { EMAIL_DEMO } from "@/lib/admin-dados";
import { linkContato } from "@/lib/contato";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const sessao = await getSessao();
  if (!sessao) redirect("/entrar");

  const [agencia, [{ n }]] = await Promise.all([
    db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) }),
    db.select({ n: count() }).from(contasCliente).where(eq(contasCliente.agenciaId, sessao.agenciaId)),
  ]);
  if (!agencia) redirect("/entrar");
  const pessoa = sessao.usuarioId ? await db.query.usuarios.findFirst({ where: eq(usuarios.id, sessao.usuarioId), columns: { nome: true } }) : null;
  const plano = PLANOS.find((p) => p.id === agencia.plano);

  return (
    <TourProvider vistosIniciais={agencia.toursVistos ?? []} salvarNoServidor={agencia.email !== EMAIL_DEMO}>
    <div className="flex min-h-svh bg-canvas">
      <Sidebar
        agenciaNome={agencia.nome}
        sairSlot={<SairButton />}
        plano={plano ? { nome: plano.nome, usados: Number(n), limite: agencia.clientesContratados } : undefined}
        pessoa={pessoa?.nome ?? null}
      />
      <div className="min-w-0 flex-1">
        <Topbar agenciaNome={agencia.nome} />
        <main className="px-4 pb-16 pt-6 sm:px-10 lg:pt-8">
          {agencia.termosVersao !== VERSAO_LEGAL && agencia.email !== EMAIL_DEMO && (
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
