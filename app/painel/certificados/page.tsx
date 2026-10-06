import { desc, eq } from "drizzle-orm";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { agencias, certificados, contasCliente } from "@/lib/db/schema";
import { origemAtual, statusCertificado, requisitosConta } from "@/lib/certificados";
import { automatizarCertificados } from "@/lib/automacao";
import { EmitirCertificado, CertificadoCard } from "./CertificadosClient";
import { BarraModulo } from "@/components/app/Modulo";
import { planoPermite } from "@/lib/planos";
import { ConviteGrowth } from "@/components/app/ConviteGrowth";

export default async function CertificadosPage() {
  const sessao = await getSessao();
  if (!sessao) return null;
  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId), columns: { nome: true, plano: true } });
  if (agencia && !planoPermite(agencia.plano, "certificado")) {
    return (
      <ConviteGrowth
        titulo="Certificado e selo"
        texto="O certificado de privacidade de dados e o selo com QR Code para o site da agência e dos clientes fazem parte dos planos Growth e Scale. Eles saem sozinhos quando o cliente está com tudo em dia."
        agenciaNome={agencia.nome}
      />
    );
  }

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
      <BarraModulo
        esquerda={
          <p className="px-2 text-[13.5px] text-muted">
            <b className="font-medium text-ink">{comStatus.filter((c) => !c.cert.revogado).length}</b> emitido(s) ·{" "}
            <b className="font-medium text-ink">{aguardando.length}</b> aguardando requisitos
          </p>
        }
        direita={<span className="px-2 text-[13px] text-muted">Emissão e renovação automáticas, sem trocar o código do selo</span>}
      />

      {aguardando.length > 0 && (
        <section className="bloco p-5">
          <h2 className="text-[16px] font-medium text-ink">Aguardando requisitos</h2>
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

      <details className="bloco mt-4 px-5 py-3.5">
        <summary className="cursor-pointer text-[14px] text-ink">Emitir manualmente (outro domínio ou certificado extra)</summary>
        <EmitirCertificado contas={contas.map((c) => ({ id: c.id, nome: c.nome }))} />
      </details>

      <section data-tour="cert-emitidos" className="mt-8">
        <h2 className="text-[16px] font-medium text-ink">Emitidos</h2>
        {comStatus.length === 0 ? (
          <div className="bloco mt-3 p-12 text-center text-[14px] text-muted">
            Nenhum certificado emitido ainda. Emita o primeiro acima — ele só sai quando a documentação estiver em dia.
          </div>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
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
