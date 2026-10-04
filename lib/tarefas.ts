import { and, count, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, atividadesTratamento, contaSubprocessadores, contasCliente, dpas, pedidosTitular } from "@/lib/db/schema";
import { situacaoDpa } from "@/lib/dpa";
import { ultimosResultados } from "@/lib/vigilancia";
import { acaoDoAchado } from "@/lib/vigilancia-acao";
import { diasAtePrazo, rotuloTipo } from "@/lib/titulares";
import { agoraMs } from "@/lib/utils";

// "O que eu tenho que fazer hoje?": tudo o que falta na carteira, dito como ação e já com o
// botão que resolve. É o centro do painel inicial; some sozinho quando a coisa é feita.

export type Tarefa = {
  id: string;
  urgencia: 1 | 2 | 3; // 1 = resolver hoje, 2 = importante, 3 = para completar
  titulo: string;
  detalhe: string;
  cliente?: string;
  acao: { rotulo: string; href: string };
};

export async function tarefasDaAgencia(agenciaId: string): Promise<Tarefa[]> {
  const [agencia, contas, contratos, pedidos, resultados] = await Promise.all([
    db.query.agencias.findFirst({ where: eq(agencias.id, agenciaId) }),
    db.query.contasCliente.findMany({ where: eq(contasCliente.agenciaId, agenciaId), orderBy: (t, { asc }) => asc(t.createdAt) }),
    db.query.dpas.findMany({ where: and(eq(dpas.agenciaId, agenciaId), isNull(dpas.substituidoEm)) }),
    db.query.pedidosTitular.findMany({ where: and(eq(pedidosTitular.agenciaId, agenciaId), inArray(pedidosTitular.status, ["aberto", "em_andamento"])) }),
    ultimosResultados(agenciaId),
  ]);
  if (!agencia) return [];
  const ids = contas.map((c) => c.id);
  const [nAtividades, nFerramentas] = ids.length
    ? await Promise.all([
        db.select({ c: atividadesTratamento.contaClienteId, n: count() }).from(atividadesTratamento).where(inArray(atividadesTratamento.contaClienteId, ids)).groupBy(atividadesTratamento.contaClienteId),
        db.select({ c: contaSubprocessadores.contaClienteId, n: count() }).from(contaSubprocessadores).where(inArray(contaSubprocessadores.contaClienteId, ids)).groupBy(contaSubprocessadores.contaClienteId),
      ])
    : [[], []];
  const atividades = new Map(nAtividades.map((r) => [r.c, Number(r.n)]));
  const ferramentas = new Map(nFerramentas.map((r) => [r.c, Number(r.n)]));
  const contratoDe = new Map(contratos.map((d) => [d.contaClienteId, d]));
  const vigDe = new Map(resultados.filter((r) => r.contaClienteId).map((r) => [r.contaClienteId!, r]));
  const growth = agencia.plano !== "start";
  const agora = agoraMs();
  const t: Tarefa[] = [];

  if (!contas.length) {
    t.push({
      id: "primeiro-cliente",
      urgencia: 1,
      titulo: "Cadastrar o primeiro cliente",
      detalhe: "Responda algumas perguntas e a Dattis monta o registro, o contrato e a lista de ferramentas dele.",
      acao: { rotulo: "Cadastrar", href: "/painel/contas/novo" },
    });
  }
  if (!agencia.cnpj || !agencia.responsavelNome) {
    t.push({
      id: "dados-agencia",
      urgencia: contas.length ? 2 : 3,
      titulo: "Completar os dados da agência",
      detalhe: "CNPJ e responsável entram em todos os contratos. Sem eles, o contrato sai com lacunas.",
      acao: { rotulo: "Completar", href: "/painel/configuracoes" },
    });
  }

  for (const p of pedidos) {
    const dias = diasAtePrazo(p.prazo, agora);
    const conta = contas.find((c) => c.id === p.contaClienteId);
    t.push({
      id: `pedido-${p.id}`,
      urgencia: dias <= 5 ? 1 : 2,
      titulo: `Responder o pedido de ${p.nome.split(" ")[0]}`,
      detalhe: `${rotuloTipo(p.tipo)}. ${dias < 0 ? `O prazo legal venceu há ${-dias} dia(s).` : `Faltam ${dias} dia(s) para o prazo legal de 15 dias.`}`,
      cliente: conta?.nome ?? agencia.nome,
      acao: { rotulo: "Responder", href: "/painel/titulares" },
    });
  }

  for (const c of contas) {
    const dpa = contratoDe.get(c.id);
    const sit = dpa ? situacaoDpa(dpa) : "rascunho";
    const base = `/painel/contas/${c.id}`;

    if (sit === "rascunho" || sit === "aguarda_agencia") {
      t.push({
        id: `assinar-${c.id}`,
        urgencia: 2,
        titulo: `Assinar o contrato da ${c.nome}`,
        detalhe: "Assine pela agência e mande o link para o cliente assinar pelo celular. Sem as duas assinaturas, o contrato não vale.",
        cliente: c.nome,
        acao: { rotulo: "Assinar", href: `${base}?aba=contrato` },
      });
    } else if (sit === "aguarda_cliente") {
      t.push({
        id: `cobrar-${c.id}`,
        urgencia: 2,
        titulo: `Cobrar a assinatura da ${c.nome}`,
        detalhe: c.contatoNome ? `${c.contatoNome} ainda não assinou. Reenvie o link pelo WhatsApp.` : "O cliente ainda não assinou. Reenvie o link pelo WhatsApp.",
        cliente: c.nome,
        acao: { rotulo: "Reenviar link", href: `${base}?aba=contrato` },
      });
    }

    if (!atividades.get(c.id)) {
      t.push({
        id: `operacoes-${c.id}`,
        urgencia: 2,
        titulo: `Dizer o que a agência faz pela ${c.nome}`,
        detalhe: "Sem isso, o registro de atividades fica vazio e o contrato não cobre a operação.",
        cliente: c.nome,
        acao: { rotulo: "Marcar", href: `${base}/editar` },
      });
    }
    if (!ferramentas.get(c.id)) {
      t.push({
        id: `ferramentas-${c.id}`,
        urgencia: 3,
        titulo: `Escolher as ferramentas da ${c.nome}`,
        detalhe: "Meta Ads, CRM, WhatsApp, planilhas: tudo o que recebe dados dele entra no contrato.",
        cliente: c.nome,
        acao: { rotulo: "Escolher", href: `${base}?aba=ferramentas` },
      });
    }

    // Alertas do site, já em linguagem de ação (os da documentação viram as tarefas acima)
    const vig = vigDe.get(c.id);
    for (const a of (vig?.achados ?? []).filter((x) => x.grupo === "site" && (x.severidade === "critico" || x.severidade === "alto"))) {
      const ac = acaoDoAchado(a);
      t.push({
        id: `site-${c.id}-${a.codigo}`,
        urgencia: a.severidade === "critico" ? 1 : 2,
        titulo: ac.acao,
        detalhe: ac.quem === "site" ? "Quem resolve é quem cuida do site. A Dattis já deixa a mensagem pronta para enviar." : a.detalhe,
        cliente: c.nome,
        acao: { rotulo: ac.quem === "site" ? "Enviar pedido" : "Resolver", href: `${base}?aba=vigilancia` },
      });
    }

    if (!c.site) {
      t.push({
        id: `site-${c.id}`,
        urgencia: 3,
        titulo: `Cadastrar o site da ${c.nome}`,
        detalhe: "Com o site, a Dattis confere segurança e privacidade dele todo dia às 6h.",
        cliente: c.nome,
        acao: { rotulo: "Cadastrar", href: `${base}?aba=site` },
      });
    } else if (growth) {
      const pixelSemAviso = vig?.achados.some((a) => a.codigo === "pixel-sem-consentimento" && a.severidade !== "ok");
      if (!c.cookiesDetectadoEm && !pixelSemAviso) {
        t.push({
          id: `cookies-${c.id}`,
          urgencia: 3,
          titulo: `Instalar o aviso de cookies no site da ${c.nome}`,
          detalhe: c.cookiesToken
            ? "Ainda não vimos o aviso no site. Instale pelo Gerenciador de Tags ou mande o passo a passo para quem cuida do site."
            : "Segura o pixel até o visitante aceitar. Ative e instale pelo Gerenciador de Tags, ou mande o passo a passo para quem cuida do site.",
          cliente: c.nome,
          acao: { rotulo: c.cookiesToken ? "Instalar" : "Ativar", href: `/painel/cookies?site=${c.id}` },
        });
      }
      if (!c.politicaPublicadaEm) {
        t.push({
          id: `politica-${c.id}`,
          urgencia: 3,
          titulo: `Publicar a política de privacidade da ${c.nome}`,
          detalhe: "A Dattis escreve e hospeda. É só publicar e colocar o link no rodapé do site.",
          cliente: c.nome,
          acao: { rotulo: "Publicar", href: `${base}?aba=site` },
        });
      }
    }
  }

  return t.sort((a, b) => a.urgencia - b.urgencia);
}
