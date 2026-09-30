import { desc, eq } from "drizzle-orm";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { certificados, contasCliente } from "@/lib/db/schema";
import { origemAtual, statusCertificado } from "@/lib/certificados";
import { EmitirCertificado, CertificadoCard } from "./CertificadosClient";

export default async function CertificadosPage() {
  const sessao = await getSessao();
  if (!sessao) return null;

  const [lista, contas, origem] = await Promise.all([
    db.query.certificados.findMany({ where: eq(certificados.agenciaId, sessao.agenciaId), orderBy: desc(certificados.emitidoEm) }),
    db.query.contasCliente.findMany({ where: eq(contasCliente.agenciaId, sessao.agenciaId), orderBy: (t, { asc }) => asc(t.nome) }),
    origemAtual(),
  ]);

  const comStatus = await Promise.all(lista.map(async (c) => ({ cert: c, status: await statusCertificado(c) })));

  return (
    <div className="max-w-6xl">
      <p className="t-eyebrow">Dattis · Certificados</p>
      <h1 className="t-display mt-3 max-w-3xl">Certificado de privacidade com selo e QR Code</h1>
      <p className="mt-4 max-w-2xl text-body leading-relaxed text-body">
        Emita um certificado pra sua agência ou pra cada cliente e coloque o selo no rodapé do site. Quem clicar no selo ou
        ler o QR Code vê, na hora, a documentação de privacidade conferida pela Dattis.
      </p>

      <EmitirCertificado contas={contas.map((c) => ({ id: c.id, nome: c.nome }))} />

      <section className="mt-14">
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
