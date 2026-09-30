import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { Check, Circle } from "lucide-react";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  agencias,
  atividadesTratamento,
  certificados,
  contaSubprocessadores,
  contasCliente,
  dpas,
  subprocessadoresCatalogo,
} from "@/lib/db/schema";
import { origemAtual, statusCertificado } from "@/lib/certificados";
import { DossieActions } from "./DossieActions";

const ANEXAR = [
  "Cartão CNPJ da empresa",
  "Contrato social ou documento equivalente",
  "Documento de identidade do administrador da Business Manager",
  "Comprovação de domínio do site verificada no Gerenciador de Negócios",
  "Link da política de privacidade publicada no site",
  "Link dos termos de uso do site",
];

function Secao({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid rounded-[20px] border border-line bg-surface p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand font-mono text-[13px] text-on-brand">{n}</span>
        <h2 className="t-heading">{titulo}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Linha({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-line py-2.5 last:border-b-0 sm:grid-cols-[200px_1fr]">
      <dt className="text-[14px] text-muted">{k}</dt>
      <dd className="text-[15px]">{v}</dd>
    </div>
  );
}

export default async function DossieContaPage({ params }: { params: Promise<{ contaId: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return null;
  const { contaId } = await params;

  const conta = await db.query.contasCliente.findFirst({
    where: and(eq(contasCliente.id, contaId), eq(contasCliente.agenciaId, sessao.agenciaId)),
  });
  if (!conta) notFound();

  const [agencia, atividades, dpa, subs, cert, origem] = await Promise.all([
    db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) }),
    db.query.atividadesTratamento.findMany({ where: eq(atividadesTratamento.contaClienteId, conta.id) }),
    db.query.dpas.findFirst({ where: eq(dpas.contaClienteId, conta.id) }),
    db
      .select({
        nomeCustomizado: contaSubprocessadores.nomeCustomizado,
        finalidade: contaSubprocessadores.finalidade,
        nome: subprocessadoresCatalogo.nome,
        pais: subprocessadoresCatalogo.pais,
      })
      .from(contaSubprocessadores)
      .leftJoin(subprocessadoresCatalogo, eq(contaSubprocessadores.subprocessadorCatalogoId, subprocessadoresCatalogo.id))
      .where(and(eq(contaSubprocessadores.contaClienteId, conta.id), eq(contaSubprocessadores.ativo, true))),
    db.query.certificados.findFirst({
      where: and(eq(certificados.contaClienteId, conta.id), eq(certificados.revogado, false)),
      orderBy: desc(certificados.emitidoEm),
    }),
    origemAtual(),
  ]);

  const certStatus = cert ? await statusCertificado(cert) : null;
  const certOk = !!cert && !!certStatus?.emDia;
  const assinado = dpa?.status === "assinado";
  const hoje = new Date().toLocaleDateString("pt-BR");
  const nomesSubs = subs.map((s) => s.nomeCustomizado ?? s.nome ?? "—");
  const agenciaNome = agencia?.nome ?? "[agência]";

  const texto = [
    "Olá, equipe de suporte do Meta.",
    "",
    `Solicitamos a revisão da restrição aplicada à Business Manager / conta de anúncios da empresa ${conta.nome}${conta.cnpj ? ` (CNPJ ${conta.cnpj})` : ""}, operada pela agência ${agenciaNome}.`,
    "",
    "A empresa trata os dados pessoais dos seus clientes de acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) e mantém documentados:",
    `- o registro das atividades de tratamento de dados (${atividades.length} atividade(s));`,
    assinado && dpa?.assinadoEm
      ? `- o contrato de operação de dados entre a agência e o anunciante, assinado em ${dpa.assinadoEm.toLocaleDateString("pt-BR")};`
      : "- o contrato de operação de dados entre a agência e o anunciante;",
    `- a relação das ferramentas que tratam esses dados (${nomesSubs.join(", ") || "nenhuma registrada"}).`,
    ...(certOk && cert ? ["", `Essa documentação pode ser verificada publicamente em ${origem}/verificar/${cert.codigo}.`] : []),
    "",
    "Anexamos os documentos da empresa e a documentação acima. Ficamos à disposição para qualquer informação adicional.",
    "",
    "Atenciosamente,",
    agenciaNome,
  ].join("\n");

  return (
    <div className="max-w-5xl">
      <div className="no-print">
        <Link href="/painel/dossie" className="text-[14px] text-muted hover:text-ink">
          ← Todas as contas
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="t-eyebrow">Dossiê para contestação de BM · gerado em {hoje}</p>
          <h1 className="t-display mt-3">{conta.nome}</h1>
        </div>
        <DossieActions texto={texto} />
      </div>

      <div className="mt-10 flex flex-col gap-5">
        <Secao n={1} titulo="Dados da empresa anunciante">
          <dl>
            <Linha k="Razão social / nome" v={conta.nome} />
            <Linha k="CNPJ" v={conta.cnpj ?? <span className="text-warn">Não informado — complete no cadastro da conta</span>} />
            <Linha k="Responsável" v={conta.contatoNome ?? "—"} />
            <Linha k="E-mail" v={conta.contatoEmail ?? "—"} />
            <Linha k="Agência operadora" v={agenciaNome} />
          </dl>
        </Secao>

        <Secao n={2} titulo="Contrato de operação de dados (DPA)">
          <dl>
            <Linha k="Status" v={assinado ? <span className="pill pill-ok">Assinado</span> : <span className="pill pill-warn">Pendente de assinatura</span>} />
            {assinado && dpa && (
              <>
                <Linha k="Assinado por" v={`${dpa.assinanteNome ?? "—"}${dpa.assinanteCargo ? ` · ${dpa.assinanteCargo}` : ""}`} />
                <Linha k="Data" v={dpa.assinadoEm?.toLocaleString("pt-BR") ?? "—"} />
                <Linha k="IP registrado" v={<span className="font-mono text-[13px]">{dpa.assinadoIp ?? "—"}</span>} />
              </>
            )}
          </dl>
          {dpa && (
            <a href={`/api/dpa/${dpa.id}/pdf`} className="btn btn-ghost no-print mt-5">
              Baixar contrato em PDF
            </a>
          )}
        </Secao>

        <Secao n={3} titulo="Registro de atividades de tratamento (RAT)">
          {atividades.length === 0 ? (
            <p className="text-[15px] text-warn">Nenhuma atividade registrada.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {atividades.map((a) => (
                <li key={a.id} className="rounded-2xl bg-surface-2 p-4">
                  <p className="font-display text-[18px]">{a.nomeAtividade}</p>
                  <dl className="mt-2 text-[14px]">
                    <Linha k="Dados tratados" v={a.categoriasDado} />
                    <Linha k="Finalidade" v={a.finalidade} />
                    <Linha k="Base legal" v={a.baseLegal} />
                    <Linha k="Retenção" v={a.prazoRetencao} />
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </Secao>

        <Secao n={4} titulo="Ferramentas que tratam os dados (subprocessadores)">
          {subs.length === 0 ? (
            <p className="text-[15px] text-muted">Nenhuma ferramenta registrada.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {subs.map((s, i) => (
                <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 rounded-2xl bg-surface-2 px-4 py-3">
                  <span className="font-medium">{s.nomeCustomizado ?? s.nome}</span>
                  <span className="text-[14px] text-muted">{s.finalidade}</span>
                </li>
              ))}
            </ul>
          )}
        </Secao>

        <Secao n={5} titulo="Certificado de privacidade verificável">
          {cert && certOk ? (
            <div className="flex flex-wrap items-center gap-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/qr/${cert.codigo}`} alt={`QR Code ${cert.codigo}`} width={120} height={120} className="rounded-lg border border-line" />
              <dl className="min-w-[240px] flex-1">
                <Linha k="Código" v={<span className="font-mono">{cert.codigo}</span>} />
                <Linha k="Verificação pública" v={<span className="break-all font-mono text-[13px]">{`${origem}/verificar/${cert.codigo}`}</span>} />
                <Linha k="Válido até" v={cert.validoAte.toLocaleDateString("pt-BR")} />
              </dl>
            </div>
          ) : (
            <p className="text-[15px] text-body">
              Esta conta ainda não tem certificado válido.{" "}
              <Link href="/painel/certificados" className="underline underline-offset-2">
                Emitir certificado
              </Link>{" "}
              reforça a contestação com uma prova verificável por QR Code.
            </p>
          )}
        </Secao>

        <Secao n={6} titulo="Documentos pra anexar (você envia)">
          <ul className="grid gap-2 sm:grid-cols-2">
            {ANEXAR.map((a) => (
              <li key={a} className="flex items-start gap-2.5 text-[15px]">
                <Circle size={16} className="mt-0.5 shrink-0 text-faint" />
                {a}
              </li>
            ))}
            <li className="flex items-start gap-2.5 text-[15px]">
              <Check size={16} className="mt-0.5 shrink-0 text-brand-ink" />
              Contrato, RAT e subprocessadores: já reunidos neste dossiê
            </li>
          </ul>
        </Secao>

        <Secao n={7} titulo="Texto-base da contestação">
          <pre className="whitespace-pre-wrap rounded-2xl bg-surface-2 p-5 font-mono text-[13px] leading-relaxed text-ink">{texto}</pre>
          <p className="mt-4 text-[13px] text-muted">
            Revise antes de enviar. A análise da suspensão é feita pelo Meta; o dossiê organiza a documentação, mas não garante
            a liberação da conta.
          </p>
        </Secao>
      </div>
    </div>
  );
}
