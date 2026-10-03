import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { contaDaAgencia } from "@/lib/contas";
import { montarDat } from "@/lib/dat";
import { origemAtual } from "@/lib/certificados";
import { linkContato } from "@/lib/contato";
import { RelatorioDat } from "@/components/app/RelatorioDat";
import { AcoesDat } from "./AcoesDat";
import { ImprimirAoAbrir } from "@/components/app/ImprimirAoAbrir";

export default async function DatPage({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return null;
  const { id } = await params;
  const conta = await contaDaAgencia(id, sessao.agenciaId);
  if (!conta) notFound();
  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) });

  if (agencia?.plano === "start") {
    return (
      <div className="max-w-2xl">
        <h1 className="painel-title">Resumo para o cliente (DAT)</h1>
        <p className="painel-lede">
          O DAT é o resumo de conformidade que você manda para o cliente sempre que ele perguntar se está tudo certo. Ele faz parte dos planos
          Growth e Scale.
        </p>
        <a href={linkContato(`Olá! Quero passar a ${agencia.nome} para o plano Growth da Dattis.`)} target="_blank" rel="noopener" className="painel-btn">
          Falar sobre o Growth
        </a>
      </div>
    );
  }

  const dat = await montarDat(id);
  if (!dat) notFound();
  const origem = await origemAtual();

  return (
    <div>
      <ImprimirAoAbrir />
      <div className="no-print mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="painel-eyebrow">
            <Link href={`/painel/contas/${id}`} className="hover:underline">
              {conta.nome}
            </Link>{" "}
            · DAT
          </p>
          <h1 className="painel-title">Resumo para o cliente</h1>
          <p className="painel-lede !mb-0">
            Mande o link para o cliente acompanhar a situação sempre atualizada, ou baixe em PDF para anexar no relatório do mês.
          </p>
        </div>
        <AcoesDat contaId={id} contaNome={conta.nome} temLink={!!conta.tokenPublico} contato={{ nome: conta.contatoNome, whatsapp: conta.contatoWhatsapp, email: conta.contatoEmail }} />
      </div>
      <RelatorioDat dat={dat} urlVerificacao={dat.certificado ? `${origem}/verificar/${dat.certificado.codigo}` : null} />
    </div>
  );
}
