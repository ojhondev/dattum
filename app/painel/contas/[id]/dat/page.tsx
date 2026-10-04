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
import { BarraModulo } from "@/components/app/Modulo";
import { ArrowLeft } from "lucide-react";

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
        <h1 className="painel-title">Relatório para o cliente</h1>
        <p className="painel-lede">
          O relatório para o cliente, com link sempre atualizado para mandar sempre que ele perguntar se está tudo certo, faz parte dos planos
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
      <BarraModulo
        esquerda={
          <Link href={`/painel/contas/${id}`} className="flex items-center gap-1.5 px-2 text-[13.5px] text-muted hover:text-ink">
            <ArrowLeft size={14} /> {conta.nome} · <b className="font-medium text-ink">Relatório para o cliente</b>
          </Link>
        }
        direita={<AcoesDat contaId={id} contaNome={conta.nome} temLink={!!conta.tokenPublico} contato={{ nome: conta.contatoNome, whatsapp: conta.contatoWhatsapp, email: conta.contatoEmail }} />}
      />
      <RelatorioDat dat={dat} urlVerificacao={dat.certificado ? `${origem}/verificar/${dat.certificado.codigo}` : null} />
    </div>
  );
}
