import { notFound } from "next/navigation";
import Link from "next/link";
import { getSessao } from "@/lib/auth";
import { contaDaAgencia } from "@/lib/contas";
import { dpaVigente } from "@/lib/dpa";
import { FormConta } from "@/components/app/FormConta";

export default async function EditarContaPage({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return null;
  const { id } = await params;
  const conta = await contaDaAgencia(id, sessao.agenciaId);
  if (!conta) notFound();
  const dpa = await dpaVigente(id);

  return (
    <div>
      <p className="painel-eyebrow">
        <Link href={`/painel/contas/${id}`} className="hover:underline">
          {conta.nome}
        </Link>{" "}
        · Editar
      </p>
      <h1 className="painel-title">Editar dados do cliente</h1>
      <p className="painel-lede">
        Mudou o responsável, o site ou o que a agência faz com o dado? Atualize aqui: o registro de atividades, as ferramentas e o contrato
        acompanham a mudança.
      </p>
      <FormConta
        contaId={id}
        contratoAssinado={!!(dpa?.assinadoEm || dpa?.clienteAssinadoEm)}
        inicial={{
          nome: conta.nome,
          cnpj: conta.cnpj ?? "",
          contatoNome: conta.contatoNome ?? "",
          contatoEmail: conta.contatoEmail ?? "",
          contatoWhatsapp: conta.contatoWhatsapp ?? "",
          crmNome: conta.crmNome ?? "",
          site: conta.site ?? "",
          flows: {
            publicos: conta.flowPublicos,
            capi: conta.flowCapi,
            ads: conta.flowAds,
            formularios: conta.flowFormularios,
            whatsapp: conta.flowWhatsapp,
            crm: conta.flowCrm,
          },
        }}
      />
    </div>
  );
}
