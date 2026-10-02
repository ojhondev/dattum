// Tours guiados do painel. Cada passo aponta para um elemento marcado com data-tour="..." na tela;
// sem alvo (ou com o alvo escondido, como o menu no celular), o passo aparece centralizado.
// Linguagem de dono de agência, não de advogado: o que é, por que importa, o que clicar.

export type PassoTour = { alvo?: string; titulo: string; texto: string; lado?: "top" | "right" | "bottom" | "left" };
export type Tour = { id: string; nome: string; rota: (p: string) => boolean; passos: PassoTour[] };

const nav = (href: string) => `nav:${href}`;

export const TOURS: Tour[] = [
  {
    id: "boas-vindas",
    nome: "Tour completo do painel",
    rota: (p) => p === "/painel",
    passos: [
      {
        titulo: "Bem-vindo à Dattis",
        texto:
          "Em 2 minutos você vai saber onde fica cada coisa. A ideia é simples: <b>você conta o que a agência faz com os dados de cada cliente, e a Dattis monta toda a papelada da LGPD</b>, colhe as assinaturas e vigia os sites. Você não precisa entender de lei.",
      },
      {
        alvo: nav("/painel/contas"),
        titulo: "1. Contas de cliente: tudo começa aqui",
        texto:
          "Cada cliente da agência vira uma conta. Ao cadastrar, você marca o que faz com os dados dele (pixel, lista de clientes, WhatsApp...) e a Dattis gera na hora o <b>registro</b>, o <b>contrato</b> e a <b>lista de ferramentas</b>.",
        lado: "right",
      },
      {
        alvo: nav("/painel/documentos"),
        titulo: "2. Documentos prontos",
        texto: "Cláusula de LGPD para o contrato comercial, política de privacidade do site, aviso para formulários e mais. Tudo preenchido com os dados do cliente, pronto para copiar ou baixar.",
        lado: "right",
      },
      {
        alvo: nav("/painel/subprocessadores"),
        titulo: "3. Ferramentas",
        texto: "Quem mais mexe nos dados dos seus clientes: Meta, Google, WhatsApp, CRM. A lista se monta sozinha a partir do que você marcou em cada conta.",
        lado: "right",
      },
      {
        alvo: nav("/painel/vigilancia"),
        titulo: "4. Vigilância diária",
        texto: "Todo dia às 6h a Dattis confere os sites dos clientes: cadeado de segurança, pixel disparando antes do aviso de cookies, política de privacidade. Se algo der errado, aparece aqui.",
        lado: "right",
      },
      {
        alvo: nav("/painel/certificados"),
        titulo: "5. Certificado e selo",
        texto: "Quando a documentação de um cliente fica completa, o certificado sai <b>sozinho</b>. Você cola o selo no rodapé do site e qualquer pessoa confere pelo QR Code.",
        lado: "right",
      },
      {
        alvo: nav("/painel/dossie"),
        titulo: "6. Dossiê para BM suspensa",
        texto: "Se a conta de anúncio de um cliente for bloqueada, aqui você gera em um clique o dossiê com toda a documentação e um texto pronto para a contestação.",
        lado: "right",
      },
      {
        alvo: "indice",
        titulo: "Seu índice de conformidade",
        texto: "A porcentagem da carteira que está em dia. A meta é chegar a 100%: cada cliente com contrato assinado pelas duas partes e sem alerta grave no site.",
        lado: "bottom",
      },
      {
        alvo: "resolver",
        titulo: "O que resolver primeiro",
        texto: "A Dattis organiza as pendências por urgência. Na dúvida sobre o que fazer hoje, comece por esta lista.",
        lado: "top",
      },
      {
        alvo: "primeiros-passos",
        titulo: "Seus primeiros passos",
        texto: "Este card marca sozinho o que você já fez. Siga na ordem e em poucos dias a agência está protegida.",
        lado: "bottom",
      },
      {
        alvo: "ajuda",
        titulo: "Ficou alguma dúvida? Use a Ajuda",
        texto: "Neste botão você revê qualquer tour, consulta o glossário (o que é RAT, DPA, operador...) e fala com um especialista. Cada tela também tem o seu tour curto.",
        lado: "bottom",
      },
      {
        alvo: nav("/painel/configuracoes"),
        titulo: "Comece por aqui",
        texto: "Primeiro passo: preencha em <b>Configurações</b> o CNPJ, o endereço e o responsável da agência. Esses dados entram em todos os contratos.",
        lado: "right",
      },
    ],
  },
  {
    id: "contas",
    nome: "Contas de cliente",
    rota: (p) => p === "/painel/contas",
    passos: [
      {
        alvo: "contas-nova",
        titulo: "Cadastre cada cliente da agência",
        texto: "Clique aqui para ativar um cliente. Leva uns 3 minutos e a documentação dele é gerada na hora.",
        lado: "bottom",
      },
      {
        alvo: "contas-tabela",
        titulo: "A situação de cada cliente",
        texto:
          "Aqui você vê, por cliente, o que a agência faz com os dados, se o contrato já foi assinado pelas duas partes e a nota do site na vigilância. Clique no nome para abrir tudo do cliente.",
        lado: "top",
      },
    ],
  },
  {
    id: "nova-conta",
    nome: "Cadastrar cliente",
    rota: (p) => p === "/painel/contas/novo",
    passos: [
      {
        alvo: "conta-responsavel",
        titulo: "Quem responde pelo cliente",
        texto: "Informe o responsável do lado do cliente, com WhatsApp e e-mail. É para ele que vai o link de assinatura do contrato.",
        lado: "right",
      },
      {
        alvo: "conta-site",
        titulo: "O site do cliente",
        texto: "Com o site, a vigilância diária passa a conferir segurança e privacidade dele todo dia.",
        lado: "right",
      },
      {
        alvo: "conta-operacoes",
        titulo: "A parte mais importante",
        texto:
          "Marque tudo o que a agência faz com os dados desse cliente. Não sabe o nome técnico? Cada opção mostra como aparece no Gerenciador de Anúncios. <b>Cada item marcado vira uma linha no registro e uma cláusula no contrato.</b> Dá para mudar depois.",
        lado: "top",
      },
    ],
  },
  {
    id: "conta",
    nome: "Página do cliente",
    rota: (p) => /^\/painel\/contas\/[^/]+$/.test(p) && p !== "/painel/contas/novo",
    passos: [
      {
        alvo: "conta-abas",
        titulo: "Tudo do cliente em quatro abas",
        texto:
          "<b>O que fazemos com o dado</b> é o registro (RAT). <b>Contrato com o cliente</b> é o DPA, que precisa de duas assinaturas. <b>Quem mais mexe nesse dado</b> são as ferramentas. <b>Vigilância</b> mostra a verificação do site.",
        lado: "bottom",
      },
      {
        alvo: "aba-contrato",
        titulo: "Passo mais importante: o contrato",
        texto:
          "Abra esta aba, assine pela agência e clique em <b>Gerar link para o cliente assinar</b>. O cliente assina pelo celular, sem criar conta. Com as duas assinaturas, o certificado sai sozinho.",
        lado: "bottom",
      },
      {
        alvo: "conta-politica",
        titulo: "Política de privacidade pronta",
        texto: "Publique a política de privacidade do cliente e cole o link no rodapé do site e no formulário de anúncio do Meta ou Google. Ela se atualiza sozinha.",
        lado: "top",
      },
      {
        alvo: "conta-atalhos",
        titulo: "Atalhos do cliente",
        texto: "Daqui você gera a cláusula para o contrato comercial, a política, o dossiê para BM e o <b>resumo para o cliente (DAT)</b>, que você manda todo mês para mostrar que está tudo em dia.",
        lado: "bottom",
      },
      {
        alvo: "conta-editar",
        titulo: "Mudou algo? Edite aqui",
        texto: "Cliente começou a usar WhatsApp ou trocou de responsável? Edite os dados: registro, ferramentas e contrato acompanham a mudança.",
        lado: "bottom",
      },
    ],
  },
  {
    id: "documentos",
    nome: "Documentos",
    rota: (p) => p === "/painel/documentos",
    passos: [
      {
        alvo: "doc-conta",
        titulo: "Escolha o cliente",
        texto: "Os documentos saem preenchidos com os dados do cliente escolhido: nome, CNPJ, ferramentas e o que a agência faz com os dados.",
        lado: "right",
      },
      {
        alvo: "doc-tipos",
        titulo: "Escolha o documento",
        texto: "Comece pela <b>cláusula de LGPD</b> (vai no contrato comercial com o cliente) e pela <b>política de privacidade</b> do site.",
        lado: "right",
      },
      {
        alvo: "doc-acoes",
        titulo: "Copie ou baixe",
        texto: "Campos que a Dattis não sabe aparecem como [preencher]. Complete, depois copie, baixe em Word ou gere o PDF.",
        lado: "bottom",
      },
    ],
  },
  {
    id: "ferramentas",
    nome: "Ferramentas",
    rota: (p) => p === "/painel/subprocessadores",
    passos: [
      {
        titulo: "Quem mais mexe nos dados",
        texto:
          "A LGPD chama de <b>subprocessadores</b> as empresas que tocam nos dados em nome da agência: Meta, Google, WhatsApp, CRM. Esta lista se monta sozinha e entra nos contratos. Você não precisa preencher nada aqui.",
      },
    ],
  },
  {
    id: "vigilancia",
    nome: "Vigilância",
    rota: (p) => p === "/painel/vigilancia",
    passos: [
      {
        titulo: "A Dattis vigia os sites por você",
        texto:
          "Todo dia às 6h verificamos o site de cada cliente: se tem cadeado (HTTPS), se o pixel dispara antes do aviso de cookies, se existe política de privacidade e se os formulários avisam o uso dos dados. Os alertas <b>críticos</b> são os primeiros a resolver.",
      },
      {
        alvo: "vig-checagens",
        titulo: "O que é verificado",
        texto: "Estas são as checagens de cada site. Corrigiu algo e quer ver o resultado na hora? Abra o cliente, vá na aba <b>Vigilância</b> e clique para verificar agora.",
        lado: "bottom",
      },
    ],
  },
  {
    id: "certificados",
    nome: "Certificados e selo",
    rota: (p) => p === "/painel/certificados",
    passos: [
      {
        titulo: "O certificado sai sozinho",
        texto:
          "Quando um cliente tem registro, contrato assinado pelas duas partes e ferramentas mapeadas, a Dattis emite o certificado automaticamente e renova todo ano. Ele <b>não</b> é certificado digital ICP-Brasil: é a prova de que a documentação de privacidade está em dia.",
      },
      {
        alvo: "cert-emitidos",
        titulo: "Cole o selo no site",
        texto: "Em cada certificado tem o código do selo. Cole no rodapé do site do cliente: quem clicar vê a página de verificação com o nome da agência.",
        lado: "top",
      },
    ],
  },
  {
    id: "dossie",
    nome: "Dossiê para BM",
    rota: (p) => p.startsWith("/painel/dossie"),
    passos: [
      {
        titulo: "Para quando a BM de um cliente cair",
        texto:
          "Escolha o cliente e o motivo do bloqueio. A Dattis junta contrato, registro, ferramentas, certificado e verificação do site num documento, com um texto pronto para colar na contestação do Meta.",
      },
    ],
  },
  {
    id: "configuracoes",
    nome: "Configurações",
    rota: (p) => p === "/painel/configuracoes",
    passos: [
      {
        alvo: "cfg-dados",
        titulo: "Dados que vão nos contratos",
        texto: "CNPJ, endereço e responsável legal aparecem na qualificação de todos os contratos. Preencha antes de mandar os contratos para assinar.",
        lado: "right",
      },
      {
        alvo: "conta-politica",
        titulo: "A política da sua agência",
        texto: "Publique a política de privacidade da própria agência e cole o link no rodapé do seu site.",
        lado: "top",
      },
    ],
  },
];

export const tourDaRota = (pathname: string) => TOURS.find((t) => t.rota(pathname)) ?? null;

/** Glossário da Ajuda: o termo da lei e o que ele quer dizer no dia a dia da agência. */
export const GLOSSARIO: { termo: string; significado: string }[] = [
  { termo: "LGPD", significado: "Lei Geral de Proteção de Dados (Lei 13.709/2018). Diz como empresas podem usar dados de pessoas. A multa chega a 2% do faturamento." },
  { termo: "Titular", significado: "A pessoa dona dos dados: o lead, o comprador, quem visita o site." },
  { termo: "Controlador", significado: "Quem decide o que fazer com os dados. Normalmente é o seu cliente (a loja, a clínica)." },
  { termo: "Operador", significado: "Quem trata os dados em nome do controlador. É a sua agência, quando roda campanha, atende lead ou sobe lista." },
  { termo: "RAT (registro de atividades)", significado: "A lista do que a agência faz com os dados de cada cliente, com finalidade e base legal. A Dattis monta sozinha." },
  { termo: "DPA (contrato de dados)", significado: "O contrato entre agência e cliente que formaliza o uso dos dados. Precisa da assinatura das duas partes." },
  { termo: "Subprocessador", significado: "Ferramenta de terceiros que toca nos dados: Meta, Google, WhatsApp, CRM." },
  { termo: "Base legal", significado: "O motivo que a lei aceita para usar o dado: consentimento, contrato, legítimo interesse, entre outros." },
  { termo: "Consentimento", significado: "Quando a pessoa autoriza, por exemplo, clicando em Aceitar no aviso de cookies." },
  { termo: "DAT", significado: "O resumo de conformidade que você manda ao cliente mostrando que está tudo em dia." },
  { termo: "ANPD", significado: "Autoridade Nacional de Proteção de Dados: o órgão que fiscaliza e multa." },
  { termo: "Encarregado (DPO)", significado: "A pessoa que responde pela privacidade da empresa. No plano Scale, a Dattis faz esse papel pela agência." },
];
