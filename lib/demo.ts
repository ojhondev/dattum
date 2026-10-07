import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, certificados, consentimentos, contasCliente, pedidosTitular, varreduraResultados } from "@/lib/db/schema";
import { novoProtocolo, PRAZO_DIAS } from "@/lib/titulares";
import { novoToken } from "@/lib/dpa";
import { ativarConta } from "@/lib/contas";
import { automatizarCertificados } from "@/lib/automacao";
import { hashSenha } from "@/lib/auth";
import { VERSAO_LEGAL } from "@/lib/legal";
import type { FlowKey } from "@/lib/fluxos";

// Conta de demonstração: pública e compartilhada por todos os visitantes do "Testar sem senha".
// Todo dia o cron apaga o que os visitantes fizeram e recria os dados de exemplo.

export const DEMO_EMAIL = "demo@dattis.com.br";
const DEMO = {
  nome: "Agência Demo Dattis",
  cnpj: "11.222.333/0001-44",
  responsavelNome: "Rafael Lima",
  responsavelCargo: "Sócio-diretor",
  endereco: "Av. Paulista, 1000, Bela Vista, São Paulo/SP, 01310-100",
  whatsapp: "11999990000",
};

const CONTAS_DEMO: { nome: string; cnpj: string; slug: string; site?: string; flows: FlowKey[]; ferramentas: string[]; assinado: boolean; contato: string; email: string }[] = [
  {
    nome: "Loja Aurora (demo)",
    cnpj: "12.345.678/0001-90",
    slug: "loja-aurora-demo",
    site: "https://www.dattis.com.br",
    flows: ["publicos", "capi", "ads", "whatsapp"],
    ferramentas: ["shopify", "google-tag-manager", "klaviyo", "microsoft-clarity", "mercado-pago"],
    assinado: true,
    contato: "Ana Souza",
    email: "ana@lojaaurora.com.br",
  },
  {
    nome: "Studio Nova (demo)",
    cnpj: "98.765.432/0001-10",
    slug: "studio-nova-demo",
    flows: ["ads", "formularios", "crm"],
    ferramentas: ["kommo", "typeform", "zapier", "google-workspace-planilhas-drive-gmail"],
    assinado: false,
    contato: "Bruno Melo",
    email: "bruno@studionova.com.br",
  },
];

/** Escolhas de exemplo no aviso de cookies (últimos 30 dias), para a demo mostrar números reais de uso. */
async function semearConsentimentos(agenciaId: string, contaId: string, token: string, site: string) {
  const paginas = ["/", "/produtos", "/promocao", "/blog/como-escolher", "/contato"];
  const linhas = Array.from({ length: 46 }, (_, i) => {
    const r = (i * 37) % 100;
    const acao = r < 62 ? "aceitar" : r < 86 ? "recusar" : "personalizar";
    const estat = acao === "aceitar" || (acao === "personalizar" && i % 2 === 0);
    return {
      token,
      agenciaId,
      contaClienteId: contaId,
      visitante: novoToken().slice(0, 24),
      acao,
      categorias: { estatisticas: estat, marketing: acao === "aceitar" },
      versao: "demo",
      url: site.replace(/\/$/, "") + paginas[i % paginas.length],
      criadoEm: new Date(Date.now() - ((i * 15.7) % 30) * 86_400_000 - (i % 7) * 3_600_000),
    };
  });
  await db.insert(consentimentos).values(linhas);
}

async function semearContas(agenciaId: string) {
  for (const def of CONTAS_DEMO) {
    const { conta } = await ativarConta({
      agenciaId,
      agenciaNome: DEMO.nome,
      agenciaCnpj: DEMO.cnpj,
      nome: def.nome,
      cnpj: def.cnpj,
      contatoNome: def.contato,
      contatoEmail: def.email,
      site: def.site,
      flows: def.flows,
      ferramentas: def.ferramentas,
      assinatura: def.assinado
        ? { agencia: { nome: DEMO.responsavelNome, cargo: DEMO.responsavelCargo }, cliente: { nome: def.contato, cargo: "Sócia-diretora", email: def.email }, ip: "203.0.113.10" }
        : undefined,
    });
    // Política pública da conta assinada já no ar, para o visitante ver o recurso funcionando.
    if (def.assinado) {
      const token = novoToken();
      await db
        .update(contasCliente)
        .set({ slug: def.slug, politicaPublicadaEm: new Date(), cookiesToken: token, cookiesConfig: { flutuante: true } })
        .where(eq(contasCliente.id, conta.id));
      await semearConsentimentos(agenciaId, conta.id, token, def.site ?? "https://lojaaurora.com.br");
      await db.insert(pedidosTitular).values({
        agenciaId,
        contaClienteId: conta.id,
        protocolo: novoProtocolo(),
        nome: "Carla Mendes (exemplo)",
        email: "carla.exemplo@email.com",
        tipo: "exclusao",
        mensagem: "Recebi anúncios da Loja Aurora no Instagram e não lembro de ter cadastrado meu e-mail. Quero que apaguem meus dados.",
        prazo: new Date(Date.now() + (PRAZO_DIAS - 4) * 86_400_000),
      });
    }
  }
}

/** Cria a agência demo na primeira vez (botão "Testar sem senha"). */
export async function garantirDemo() {
  const existente = await db.query.agencias.findFirst({ where: eq(agencias.email, DEMO_EMAIL) });
  if (existente) return existente;
  const [agencia] = await db
    .insert(agencias)
    .values({ ...DEMO, email: DEMO_EMAIL, senhaHash: await hashSenha(crypto.randomUUID()), termosVersao: VERSAO_LEGAL, termosAceitosEm: new Date(), ativadaEm: new Date() })
    .returning();
  await semearContas(agencia.id);
  await automatizarCertificados(agencia.id).catch(() => null);
  return agencia;
}

/** Volta a demo ao estado inicial: apaga clientes, contratos, certificados e escolhas feitas pelos visitantes. */
export async function resetarDemo() {
  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.email, DEMO_EMAIL) });
  if (!agencia) return { resetada: false };

  await db.delete(contasCliente).where(eq(contasCliente.agenciaId, agencia.id)); // em cascata: RAT, ferramentas, contratos, certificados e vigilância das contas
  await db.delete(certificados).where(and(eq(certificados.agenciaId, agencia.id), isNull(certificados.contaClienteId)));
  await db.delete(varreduraResultados).where(eq(varreduraResultados.agenciaId, agencia.id));
  await db.delete(consentimentos).where(eq(consentimentos.agenciaId, agencia.id));
  await db.delete(pedidosTitular).where(eq(pedidosTitular.agenciaId, agencia.id));
  await db
    .update(agencias)
    .set({
      ...DEMO,
      plano: "growth",
      clientesContratados: null,
      suspensa: false,
      emailPrivacidade: null,
      politicaPublicadaEm: new Date(),
      slug: agencia.slug ?? "agencia-demo-dattis",
      cookiesConfig: { flutuante: true },
      termosVersao: VERSAO_LEGAL,
      termosAceitosEm: new Date(),
    })
    .where(eq(agencias.id, agencia.id));

  await semearContas(agencia.id);
  await automatizarCertificados(agencia.id).catch(() => null);
  return { resetada: true };
}
