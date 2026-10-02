import { desc, eq } from "drizzle-orm";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { certificados, contasCliente } from "@/lib/db/schema";
import { origemAtual, statusCertificado, requisitosConta } from "@/lib/certificados";
import { automatizarCertificados } from "@/lib/automacao";
import { EmitirCertificado, CertificadoCard } from "./CertificadosClient";

export default async function CertificadosPage() {
  const sessao = await getSessao();
  if (!sessao) return null;

  // Antes de listar, deixa o automático em dia (emite o que ficou elegível, renova o que vence em 30 dias).
  await automatizarCertificados(sessao.agenciaId).catch(() => null);

  const [lista, contas, origem] = await Promise.all([
    db.query.certificados.findMany({ where: eq(certificados.agenciaId, sessao.agenciaId), orderBy: desc(certificados.emitidoEm) }),
    db.query.contasCliente.findMany({ where: eq(contasCliente.agenciaId, sessao.agenciaId), orderBy: (t, { asc }) => asc(t.nome) }),
    origemAtual(),
  ]);

  const comStatus = await Promise.all(lista.map(async (c) => ({ cert: c, status: await statusCertificado(c) })));
  const comCert = new Set(lista.filter((c) => !c.revogado).map((c) => c.contaClienteId));
  const aguardando = (
    await Promise.all(
      contas
        .filter((c) => !comCert.has(c.id))
        .map(async (c) => ({ conta: c, faltando: (await requisitosConta(c.id)).filter((r) => !r.ok).map((r) => r.label) })),
    )
  ).filter((a) => a.faltando.length);

  return (
    <div className="max-w-6xl">
      <p className="t-eyebrow">Dattis · Certificados</p>
      <h1 className="t-display mt-3 max-w-3xl">Certificado de privacidade com selo e QR Code</h1>
      <p className="mt-4 max-w-2xl text-body leading-relaxed text-body">
        No automático: assim que um cliente fica com registro e contrato em dia, a Dattis emite o certificado dele e renova
        antes de vencer, mantendo o mesmo código — o selo colado no site nunca quebra. Quem clicar no selo ou ler o QR Code
        vê, na hora, a documentação conferida.
      </p>

      {aguardando.length > 0 && (
        <section className="mt-8 rounded-[20px] border border-line bg-surface p-6">
          <h2 className="t-heading">Aguardando requisitos</h2>
          <p className="mt-1 text-[14px] text-muted">O certificado sai sozinho quando estes itens forem resolvidos.</p>
          <ul className="mt-4 flex flex-col divide-y divide-line">
            {aguardando.map((a) => (
              <li key={a.conta.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-[15px]">
                <a href={`/painel/contas/${a.conta.id}`} className="font-medium text-ink hover:underline">
                  {a.conta.nome}
                </a>
                <span className="flex flex-wrap gap-1.5">
                  {a.faltando.map((f) => (
                    <span key={f} className="pill pill-warn">
                      {f}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <details className="mt-6 rounded-[20px] border border-line bg-surface px-6 py-4">
        <summary className="cursor-pointer text-[15px] text-ink">Emitir manualmente (outro domínio ou certificado extra)</summary>
        <EmitirCertificado contas={contas.map((c) => ({ id: c.id, nome: c.nome }))} />
      </details>

      <section data-tour="cert-emitidos" className="mt-14">
        <h2 className="t-heading-lg">Emitidos</h2>
        {comStatus.length === 0 ? (
          <div className="block-card mt-6 p-12 text-center text-body">
            Nenhum certificado emitido ainda. Emita o primeiro acima — ele só sai quando a documentação estiver em dia.
          </div>
        ) : (
          <ul className="mt-6 flex flex-col gap-4">
            {comStatus.map(({ cert, status }) => (
              <CertificadoCard
                key={cert.id}
                origem={origem}
                cert={{
                  id: cert.id,
                  codigo: cert.codigo,
                  titular: cert.titular,
                  dominio: cert.dominio,
                  tipo: cert.contaClienteId ? "Cliente" : "Agência",
                  automatico: cert.automatico,
                  validoAte: cert.validoAte.toLocaleDateString("pt-BR"),
                  revogado: cert.revogado,
                  estado: !status.valido ? "invalido" : status.emDia ? "ok" : "pendente",
                }}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
