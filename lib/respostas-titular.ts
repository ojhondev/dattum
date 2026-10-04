// Resposta pronta para cada pedido de titular (art. 18 da LGPD), escrita a partir do que a Dattis já
// sabe do cliente: o que é coletado, pra quê, por quanto tempo e quais ferramentas recebem os dados.
// Gera duas coisas: o passo a passo do que fazer (por ferramenta) e o e-mail de resposta, editável.
// Trechos entre colchetes são o único ponto que a pessoa precisa completar.

export type ContextoPedido = {
  empresa: string; // quem responde: o cliente (controlador) ou a própria agência
  agencia: string;
  atividades: { dados: string; finalidade: string; prazo: string }[];
  ferramentas: { nome: string; categoria: string; pais: string | null }[];
};

const lista = (itens: string[]) => (itens.length <= 1 ? (itens[0] ?? "") : `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`);

const de = (ctx: ContextoPedido, ...categorias: string[]) => ctx.ferramentas.filter((f) => categorias.some((c) => f.categoria.startsWith(c))).map((f) => f.nome);

export function gerarResposta(tipo: string, titular: { nome: string; protocolo: string; criadoEm: string }, ctx: ContextoPedido) {
  const primeiro = titular.nome.trim().split(" ")[0] || "tudo bem";
  const crm = de(ctx, "CRM", "E-mail", "Integrações", "Planilhas", "Informada", "Ferramenta própria");
  const anuncios = de(ctx, "Anúncios"); // onde existem públicos personalizados (listas de clientes)
  const conversa = de(ctx, "WhatsApp", "SMS");
  const loja = de(ctx, "E-commerce", "Pagamentos", "Infoprodutos");
  const todas = ctx.ferramentas.map((f) => f.nome);
  const finalidades = [...new Set(ctx.atividades.map((a) => a.finalidade.replace(/\.$/, "").toLowerCase()))];
  const prazo = ctx.atividades[0]?.prazo?.replace(/\.$/, "").toLowerCase();
  const data = new Date(titular.criadoEm).toLocaleDateString("pt-BR");

  const passos: string[] = ["Responda só para o e-mail que a pessoa informou no pedido: é assim que você confirma que é ela mesma."];
  let corpo = "";

  switch (tipo) {
    case "acesso":
      if (todas.length) passos.push(`Procure o nome, o e-mail e o telefone dela em: ${lista(todas)}.`);
      passos.push("Complete na resposta o trecho entre colchetes com o que encontrou.");
      corpo =
        `Confirmamos que tratamos dados seus. Encontramos: [complete com os dados encontrados, por exemplo nome, e-mail, telefone e data do cadastro].` +
        (finalidades.length ? `\n\nUsamos esses dados para ${lista(finalidades)}.` : "") +
        (prazo ? ` Eles ficam guardados ${prazo}.` : "") +
        (todas.length ? `\n\nFerramentas que recebem esses dados: ${lista(todas)}.` : "");
      break;
    case "correcao":
      if (todas.length) passos.push(`Corrija o dado em todas as ferramentas onde ele aparece: ${lista(todas)}.`);
      passos.push("Escreva na resposta o que foi corrigido.");
      corpo = "Corrigimos seus dados conforme você pediu: [complete com o que foi corrigido]. A alteração já vale em todos os nossos sistemas.";
      break;
    case "exclusao":
      if (crm.length) passos.push(`Apague o contato de: ${lista(crm)}.`);
      if (anuncios.length) passos.push(`Remova das listas de clientes usadas em públicos personalizados (${lista(anuncios)}) e envie a lista atualizada.`);
      if (conversa.length) passos.push(`Apague as conversas e o contato em: ${lista(conversa)}.`);
      if (loja.length) passos.push(`Na loja e nos pagamentos (${lista(loja)}), mantenha só o que a lei obriga a guardar, como notas fiscais.`);
      if (!todas.length) passos.push("Apague o contato de todas as planilhas, CRMs e listas onde ele aparece.");
      corpo =
        `Apagamos seus dados dos nossos sistemas${todas.length ? ` e das ferramentas que usamos (${lista(todas)})` : ""}, e você não receberá mais nossas comunicações.` +
        (loja.length ? "\n\nMantivemos apenas o que a lei nos obriga a guardar, como os registros fiscais de compras." : "");
      break;
    case "marketing":
      if (crm.length) passos.push(`Descadastre o contato das listas de e-mail e automação: ${lista(crm)}.`);
      if (conversa.length) passos.push(`Marque para não receber mais mensagens em: ${lista(conversa)}.`);
      if (anuncios.length) passos.push(`Inclua o contato numa lista de exclusão dos públicos de anúncio (${lista(anuncios)}).`);
      if (!todas.length) passos.push("Descadastre o contato de e-mails, WhatsApp e listas de anúncio.");
      corpo =
        "Você não receberá mais mensagens nem anúncios direcionados com base nos seus dados: retiramos seu contato das nossas listas de comunicação e de anúncios." +
        (anuncios.length ? " As plataformas de anúncio podem levar até 48 horas para processar a remoção." : "");
      break;
    case "portabilidade":
      passos.push(`Exporte os dados dela${crm.length ? ` de ${lista(crm)}` : ""} em planilha (CSV) e anexe ao e-mail de resposta.`);
      corpo = "Segue em anexo uma cópia dos seus dados em formato aberto (planilha CSV), que pode ser usada em outro serviço se você quiser.";
      break;
    case "compartilhamento":
      passos.push("Confira se a lista de ferramentas abaixo está completa antes de enviar.");
      corpo =
        (ctx.ferramentas.length
          ? `Seus dados são compartilhados apenas com as ferramentas necessárias para ${lista(finalidades) || "o nosso atendimento e marketing"}:\n${ctx.ferramentas
              .map((f) => `• ${f.nome}${f.pais && f.pais !== "Não informado" ? ` (${f.pais})` : ""}`)
              .join("\n")}`
          : "Seus dados não são compartilhados com outras empresas além das necessárias para o nosso atendimento: [complete com as ferramentas].") +
        (ctx.agencia && ctx.agencia !== ctx.empresa ? `\n\nTambém trabalhamos com a agência ${ctx.agencia}, que cuida do nosso marketing e trata os dados seguindo as nossas instruções, com contrato.` : "");
      break;
    default:
      passos.push("Leia a mensagem da pessoa e complete a resposta.");
      corpo = "[Complete com a resposta à sua dúvida.]";
  }

  const resposta = `Olá, ${primeiro}.

Recebemos seu pedido sobre seus dados pessoais (protocolo ${titular.protocolo}), feito em ${data}.

${corpo}

Se precisar de mais alguma coisa, é só responder este e-mail informando o protocolo.

Atenciosamente,
Equipe de privacidade · ${ctx.empresa}`;

  return { passos, resposta };
}
