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
          "Em 1 minuto você sabe tudo. A ideia é simples: <b>você conta quais ferramentas usa em cada cliente, e a Dattis monta a papelada da LGPD</b>, colhe as assinaturas e vigia os sites. Você não precisa entender de lei.",
      },
      {
        alvo: "tarefas",
        titulo: "Comece sempre por aqui",
        texto:
          "Esta lista diz <b>o que fazer agora</b>, por ordem de urgência, e cada item tem o botão que resolve: assinar um contrato, cobrar o cliente, pedir um ajuste no site. Quando fica vazia, a carteira está em dia.",
        lado: "bottom",
      },
      {
        alvo: nav("/painel/contas"),
        titulo: "Clientes",
        texto:
          "Cada cliente da agência fica aqui, com tudo dele num lugar só: registro, contrato, ferramentas, site, cookies e vigilância. Para cadastrar um novo, use <b>Novo cliente</b>: são poucas perguntas.",
        lado: "right",
      },
      {
        alvo: "gerar-relatorio",
        titulo: "Relatório em um clique",
        texto: "De qualquer tela, gere o relatório da carteira inteira ou o relatório para o cliente, pronto para mandar.",
        lado: "bottom",
      },
      {
        alvo: "ajuda",
        titulo: "Ficou alguma dúvida? Use a Ajuda",
        texto: "Aqui você revê qualquer tour, consulta o glossário (o que é RAT, DPA, operador...) e fala com um especialista.",
        lado: "bottom",
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
        titulo: "Uma pergunta por vez",
        texto:
          "Responda quem é o cliente, quem responde por ele e quais ferramentas a agência usa. A Dattis deduz o resto para você só confirmar. <b>Enter</b> avança. No fim, você assina o contrato e já manda o link para o cliente pelo WhatsApp.",
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
        titulo: "Tudo do cliente nesta barra",
        texto:
          "<b>Registro</b> é o RAT. <b>Contrato</b> é o DPA, que precisa das duas assinaturas: assine pela agência e mande o link ao cliente. <b>Ferramentas</b> abre o catálogo para escolher o que recebe dados dele. <b>Site e privacidade</b> tem a política pública e o aviso de cookies.",
        lado: "bottom",
      },
      {
        alvo: "conta-relatorio",
        titulo: "Relatório do cliente",
        texto: "Gera, em um clique, o resumo da situação do cliente pronto para salvar em PDF e mandar para ele.",
        lado: "bottom",
      },
      {
        alvo: "conta-atalhos",
        titulo: "Mais ações",
        texto: "Cláusula de LGPD para o contrato comercial, texto da política de privacidade e o dossiê para BM suspensa, quando precisar.",
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
          "A LGPD chama de <b>subprocessadores</b> as empresas que tocam nos dados em nome da agência: Meta, Google, WhatsApp, CRM. Você escolhe as de cada cliente na página dele, aba <b>Ferramentas</b>, e elas entram no contrato. Aqui você vê em quais clientes cada uma está.",
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
    id: "titulares",
    nome: "Pedidos de titulares",
    rota: (p) => p === "/painel/titulares",
    passos: [
      {
        titulo: "Quando alguém pede os próprios dados",
        texto:
          "Pela LGPD, qualquer pessoa pode pedir para ver, corrigir ou apagar os dados dela. As políticas públicas da Dattis têm um formulário para isso, e os pedidos chegam aqui com protocolo. O prazo é de <b>15 dias</b>: o Painel avisa quando estiver perto de vencer.",
      },
    ],
  },
  {
    id: "cookies",
    nome: "Cookies",
    rota: (p) => p === "/painel/cookies",
    passos: [
      {
        alvo: "cookies-sites",
        titulo: "Um aviso por site",
        texto: "Aqui ficam o site da agência e o de cada cliente. Escolha um para ativar o aviso, ver a instalação e a prova de consentimento.",
        lado: "right",
      },
      {
        alvo: "cookies-instalar",
        titulo: "Instalação guiada",
        texto: "Copie a linha da Dattis e siga os passos da plataforma do site: código, Google Tag Manager, WordPress, Shopify ou outras. Inclui como segurar o Pixel do Meta até o aceite.",
        lado: "top",
      },
      {
        alvo: "cookies-verificar",
        titulo: "Confira se ficou certo",
        texto: "Depois de instalar, clique em <b>Verificar instalação</b>: a Dattis abre o site e aponta o que falta ajustar.",
        lado: "top",
      },
      {
        alvo: "cookies-gtm",
        titulo: "Sem Google Analytics ainda?",
        texto: "Este passo a passo cria o Analytics e o Gerenciador de Tags do cliente do zero, já respeitando o consentimento.",
        lado: "top",
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
        alvo: "cfg-abas",
        titulo: "Tudo da conta em abas",
        texto:
          "<b>Agência e acesso</b>: dados que vão nos contratos e a senha. <b>Equipe</b>: um login por pessoa. <b>Privacidade e cookies</b>: a política e o aviso de cookies do site da agência. <b>Plano e documentos</b>: plano, termos e exportação. <b>Registro de atividades</b>: quem fez o quê.",
        lado: "bottom",
      },
      {
        alvo: "cfg-dados",
        titulo: "Dados que vão nos contratos",
        texto: "CNPJ, endereço e responsável legal aparecem na qualificação de todos os contratos. Preencha antes de mandar os contratos para assinar.",
        lado: "right",
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
  { termo: "DAT / Relatório para o cliente", significado: "O relatório de conformidade que você manda ao cliente mostrando que está tudo em dia." },
  { termo: "ANPD", significado: "Autoridade Nacional de Proteção de Dados: o órgão que fiscaliza e multa." },
  { termo: "Encarregado (DPO)", significado: "A pessoa que responde pela privacidade da empresa. No plano Scale, a Dattis faz esse papel pela agência." },
];
