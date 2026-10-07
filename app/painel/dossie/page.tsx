import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowRight, FolderOpen } from "lucide-react";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { agencias, contasCliente } from "@/lib/db/schema";
import { planoPermite } from "@/lib/planos";
import { RecursoTravado } from "@/components/app/RecursoTravado";
import { ConviteDossie } from "@/components/app/ConviteGrowth";
import { BarraModulo, BuscaModulo } from "@/components/app/Modulo";

const PASSOS = [
  "Escolha a conta de cliente que teve a Business Manager restringida.",
  "A Dattis monta o dossiê com os dados da empresa, o contrato de operação, o registro de atividades, as ferramentas que tratam dado e o certificado de privacidade.",
  "Anexe os documentos da lista de conferência e use o texto-base na contestação pela Qualidade da Conta do Meta.",
];

export default async function DossiePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const sessao = await getSessao();
  if (!sessao) return null;
  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId), columns: { nome: true, plano: true, ativadaEm: true } });
  if (agencia && !agencia.ativadaEm) return <RecursoTravado titulo="Dossiê para BM suspensa" texto="Em minutos, reúne os documentos que provam que a agência trata os dados do cliente dentro da lei, para contestar a restrição da Business Manager." exemplo="dossie" />;
  if (agencia && !planoPermite(agencia.plano, "dossie")) return <ConviteDossie agenciaNome={agencia.nome} />;

  const contas = await db.query.contasCliente.findMany({
    where: eq(contasCliente.agenciaId, sessao.agenciaId),
    orderBy: (t, { asc }) => asc(t.nome),
  });

  const termo = (q ?? "").trim().toLowerCase();
  const lista = termo ? contas.filter((c) => c.nome.toLowerCase().includes(termo)) : contas;

  return (
    <div className="max-w-6xl">
      <BarraModulo
        esquerda={<BuscaModulo placeholder="Buscar cliente" />}
        direita={<span className="hidden px-2 text-[13px] text-muted md:inline">Escolha o cliente da BM restringida</span>}
      />

      {lista.length === 0 ? (
        <div className="bloco p-12 text-center text-[14px] text-muted">
          {contas.length ? "Nenhum cliente com esse nome." : "Nenhum cliente cadastrado ainda. Cadastre um cliente para gerar o dossiê dele."}
        </div>
      ) : (
        <ul className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {lista.map((c) => (
            <li key={c.id}>
              <Link href={`/painel/dossie/${c.id}`} className="bloco flex items-center gap-3 px-4 py-3.5 transition-colors hover:border-brand-strong">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted">
                  <FolderOpen size={17} strokeWidth={1.7} />
                </span>
                <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-ink">{c.nome}</span>
                <ArrowRight size={16} className="shrink-0 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <details className="mt-8 text-[13.5px] text-muted">
        <summary className="cursor-pointer hover:text-ink">Como funciona o dossiê</summary>
        <ol className="mt-3 flex max-w-3xl flex-col gap-2 text-body">
          {PASSOS.map((p, i) => (
            <li key={p}>
              {i + 1}. {p}
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}

