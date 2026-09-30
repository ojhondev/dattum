import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowRight, FolderOpen } from "lucide-react";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { contasCliente } from "@/lib/db/schema";

const PASSOS = [
  "Escolha a conta de cliente que teve a Business Manager restringida.",
  "A Dattis monta o dossiê com os dados da empresa, o contrato de operação, o registro de atividades, as ferramentas que tratam dado e o certificado de privacidade.",
  "Anexe os documentos da lista de conferência e use o texto-base na contestação pela Qualidade da Conta do Meta.",
];

export default async function DossiePage() {
  const sessao = await getSessao();
  if (!sessao) return null;

  const contas = await db.query.contasCliente.findMany({
    where: eq(contasCliente.agenciaId, sessao.agenciaId),
    orderBy: (t, { asc }) => asc(t.nome),
  });

  return (
    <div className="max-w-6xl">
      <p className="t-eyebrow">Dattis · Dossiê para BM</p>
      <h1 className="t-display mt-3 max-w-3xl">BM suspensa? Monte o dossiê de contestação em um clique.</h1>
      <p className="mt-4 max-w-2xl text-body leading-relaxed text-body">
        A Dattis reúne, de forma organizada, a documentação de privacidade da conta pra você anexar na contestação da
        suspensão — em vez de caçar arquivo em pasta, WhatsApp e e-mail com a campanha parada.
      </p>

      <ol className="mt-10 grid gap-4 md:grid-cols-3">
        {PASSOS.map((p, i) => (
          <li key={p} className="rounded-[20px] border border-line bg-surface p-6">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand font-mono text-[14px] text-on-brand">{i + 1}</span>
            <p className="mt-4 text-[15px] leading-relaxed text-body">{p}</p>
          </li>
        ))}
      </ol>

      <section className="mt-14">
        <h2 className="t-heading-lg">Escolha a conta</h2>
        {contas.length === 0 ? (
          <div className="block-card mt-6 p-12 text-center text-body">
            Nenhuma conta ativada ainda. Ative uma conta de cliente pra gerar o dossiê dela.
          </div>
        ) : (
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {contas.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/painel/dossie/${c.id}`}
                  className="flex items-center gap-4 rounded-[20px] border border-line bg-surface px-5 py-4 transition-colors hover:border-brand-strong"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-2">
                    <FolderOpen size={18} strokeWidth={1.7} />
                  </span>
                  <span className="font-display flex-1 text-[19px]">{c.nome}</span>
                  <span className="arrow-circle h-9 w-9">
                    <ArrowRight size={16} strokeWidth={1.6} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
