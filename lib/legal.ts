import type { DadosEmpresa } from "@/lib/empresa";

// Versão dos documentos legais da própria Dattis. Mudou o texto de forma relevante? Suba a versão:
// o aceite gravado no cadastro (agencias.termos_versao) mostra qual versão cada agência aceitou.
export const VERSAO_LEGAL = "2026.10.7";
export const VIGENCIA_LEGAL = "4 de outubro de 2026";

export type DocumentoLegal = "termos" | "privacidade" | "contrato-de-dados";

export const DOCUMENTOS_LEGAIS: { id: DocumentoLegal; href: string; titulo: string; curto: string; resumo: string }[] = [
  {
    id: "termos",
    href: "/termos",
    titulo: "Termos de Uso",
    curto: "Termos de Uso",
    resumo: "As regras da assinatura: o que a Dattis entrega, o que não entrega, pagamento, prazo e responsabilidades.",
  },
  {
    id: "privacidade",
    href: "/privacidade",
    titulo: "Política de Privacidade",
    curto: "Privacidade",
    resumo: "Quais dados a Dattis trata, por quê, com quem compartilha, por quanto tempo guarda e como você exerce seus direitos.",
  },
  {
    id: "contrato-de-dados",
    href: "/contrato-de-dados",
    titulo: "Contrato de Tratamento de Dados",
    curto: "Contrato de dados (DPA)",
    resumo: "O contrato de operador entre a Dattis e a agência: como tratamos os dados dos seus clientes que ficam na plataforma.",
  },
];

/** Fornecedores que tratam dados em nome da Dattis. Lista pública (Anexo I do contrato de dados). */
export function suboperadores() {
  const lista = [
    { nome: "Vercel Inc.", funcao: "Hospedagem da plataforma e do site, registros de acesso", local: "Estados Unidos" },
    { nome: "Neon (Databricks, Inc.)", funcao: "Banco de dados da plataforma (servidores AWS em us-east-1)", local: "Estados Unidos" },
    { nome: "Vercel Blob", funcao: "Armazenamento das imagens publicadas no blog", local: "Estados Unidos" },
    { nome: "Google LLC", funcao: "Login com Google, só quando a agência escolhe essa forma de acesso", local: "Estados Unidos" },
  ];
  if (process.env.RESEND_API_KEY) {
    lista.push({ nome: "Resend, Inc.", funcao: "Envio de e-mails da plataforma (redefinição de senha e avisos)", local: "Estados Unidos" });
  }
  return lista;
}

const qualificacao = (e: DadosEmpresa) =>
  `**${e.razaoSocial}**${e.cnpj ? `, inscrita no CNPJ sob o nº ${e.cnpj}` : ""}${e.endereco ? `, com sede em ${e.endereco}` : ""} ("Dattis")`;

const canal = (e: DadosEmpresa) =>
  e.encarregadoEmail
    ? `pelo e-mail [${e.encarregadoEmail}](mailto:${e.encarregadoEmail}) ou pelo WhatsApp [${e.whatsappExibicao}](${e.whatsappLink})`
    : `pelo WhatsApp [${e.whatsappExibicao}](${e.whatsappLink})`;

// ---------------------------------------------------------------------------------------------

export function termosDeUso(e: DadosEmpresa) {
  return `Estes Termos de Uso regulam a assinatura e o uso da plataforma Dattis, oferecida por ${qualificacao(e)}, por agências de marketing, tráfego pago e atendimento ("Agência"). Ao criar a conta na plataforma, a Agência declara que leu e aceita estes Termos, a [Política de Privacidade](/privacidade) e o [Contrato de Tratamento de Dados](/contrato-de-dados), que fazem parte deste acordo.

Quem aceita em nome da Agência declara ter poderes para isso.

## O que a Dattis faz

A Dattis é uma plataforma de conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados, "LGPD") pensada para a operação de agências. Conforme o plano contratado, ela permite:

- registrar o que a Agência faz com os dados de cada cliente (Registro de Atividades de Tratamento, "RAT");
- gerar o contrato de operação de dados entre a Agência e cada cliente e colher a assinatura eletrônica das duas partes;
- manter o registro das ferramentas que tocam esses dados (subprocessadores);
- gerar documentos de apoio, como cláusulas contratuais, políticas de privacidade e avisos;
- emitir o certificado de privacidade de dados e o selo verificável por QR Code;
- montar o dossiê de documentação para contestar bloqueios de contas de anúncio;
- fazer a vigilância automática dos sites cadastrados;
- gerar o resumo de conformidade (DAT) que a Agência envia ao cliente.

O plano Scale inclui o serviço de encarregado de dados (DPO) prestado pela Dattis à Agência, nos limites descritos na proposta comercial.

## O que a Dattis não faz

Para não haver dúvida sobre o alcance do serviço:

- **Não é assessoria jurídica individual.** Os documentos são modelos elaborados com base na LGPD e preenchidos com as informações que a Agência fornece. A Agência deve conferir se eles refletem a sua realidade e, em casos específicos ou litígios, consultar um advogado.
- **O certificado de privacidade de dados não é certificado digital ICP-Brasil** nem selo ou aprovação da Autoridade Nacional de Proteção de Dados (ANPD). Ele atesta que a documentação registrada na Dattis está em dia na data da consulta.
- **Não garantimos decisões de terceiros.** A análise de contestações cabe ao Meta, ao Google, à ANPD ou a quem for. O dossiê organiza a documentação, mas não garante reativação de conta nem afasta sanções.
- **A vigilância não é teste de invasão.** Ela verifica, de forma automatizada, sinais públicos dos sites, como HTTPS, cabeçalhos de segurança, aviso de cookies e política de privacidade. Ela não substitui uma auditoria técnica completa.
- **A Dattis não executa o tratamento dos dados dos clientes da Agência.** Listas de clientes, leads e eventos de conversão não passam pela plataforma: a Dattis documenta o tratamento, não o realiza.

## Contratação, ativação e acesso

A Agência pode criar a conta pelo site e usar a plataforma em modo de exploração, sem custo e com número limitado de clientes. Nesse modo não são emitidos contratos, documentos, selo, certificado nem publicações.

A contratação é feita com a equipe comercial da Dattis. Depois da confirmação do pagamento, a Dattis ativa o plano na conta da Agência ou envia um código de ativação individual e de uso único, vinculado ao plano e à quantidade de clientes contratados.

A Agência acessa a plataforma com e-mail e senha ou com uma conta Google. Ela é responsável:

- por manter as credenciais em sigilo;
- por tudo o que for feito com o seu acesso;
- por avisar a Dattis imediatamente se suspeitar de uso indevido.

O número de contas de cliente ativas fica limitado ao contratado. Para incluir mais clientes, basta falar com a Dattis.

## Planos, preço e pagamento

O preço é cobrado por cliente da Agência, por mês, conforme o plano e a proposta comercial aceita. A cobrança é feita por link de pagamento enviado pela Dattis. A Dattis não recebe nem armazena dados de cartão.

Os valores podem ser reajustados uma vez a cada 12 meses pelo IPCA (ou pelo índice que o substituir), com aviso prévio de 30 dias.

Se houver atraso de pagamento, a Dattis avisa a Agência. Se o débito continuar depois de 10 dias do aviso, o acesso pode ser suspenso até a regularização. Durante a suspensão, os dados ficam preservados e o selo dos sites pode mostrar o certificado como suspenso.

## Operação da conta pela Dattis (serviço de DPO)

Nos planos Growth e Scale, ou quando contratado como serviço adicional no Start, o encarregado (DPO) da Dattis pode operar a conta da Agência para prestar o serviço: manter registros e ferramentas em dia, preparar documentos, enviar e cobrar os links de assinatura, responder pedidos de titulares e acompanhar a vigilância dos sites.

Esse acesso só acontece enquanto a Agência mantiver a autorização ligada em Configurações → Acesso da Dattis, e pode ser retirado a qualquer momento, com efeito imediato. Cada ação feita pela Dattis fica no registro de atividades da Agência, identificada com o nome do DPO.

A Dattis não assina contratos em nome da Agência, não altera o login, a senha ou a equipe e não aceita estes Termos por ela. Nessa operação, a Dattis trata os dados como suboperadora, nos limites do [Contrato de Tratamento de Dados](/contrato-de-dados).

## Prazo, renovação e encerramento

A assinatura é mensal, começa na ativação e vale por prazo indeterminado. Não há prazo mínimo nem fidelidade.

A Agência pode encerrar a assinatura a qualquer momento, sem multa, com aviso de 30 dias.

A Sprint de Higienização, quando contratada, é um serviço de implantação com escopo e prazo definidos na proposta.

Ao fim da assinatura, a Agência tem 30 dias para exportar os documentos, os contratos assinados e as evidências de assinatura. Depois disso, a Dattis exclui os dados conforme a [Política de Privacidade](/privacidade) e o [Contrato de Tratamento de Dados](/contrato-de-dados). Os certificados emitidos são revogados e os selos passam a mostrar que o certificado não está mais válido.

## Obrigações da Agência

A Agência se compromete a:

1. fornecer informações verdadeiras e atualizadas sobre si, sobre seus clientes e sobre como trata os dados de cada um, já que os documentos são gerados a partir delas;
2. usar a plataforma de acordo com a lei e com estes Termos;
3. cadastrar na vigilância apenas sites dos clientes que atende ou sites próprios;
4. enviar o link de assinatura apenas a quem tem poderes para assinar pelo cliente;
5. compartilhar o acesso apenas com a própria equipe e manter as credenciais em sigilo;
6. não copiar, revender, fazer engenharia reversa nem tentar contornar os limites técnicos ou de plano da plataforma;
7. não usar o selo, o certificado ou a marca Dattis de forma enganosa, por exemplo exibindo o selo depois que o certificado deixou de ser válido.

A Agência continua responsável, perante seus clientes e perante a lei, pelo tratamento de dados que realiza. A Dattis é uma ferramenta de apoio a essa conformidade.

## Certificado e selo

O certificado é emitido quando a conta cumpre os requisitos mostrados na plataforma: registro de atividades, contrato assinado pelas duas partes e ferramentas mapeadas. Ele vale por 12 meses e é renovado automaticamente enquanto os requisitos continuarem cumpridos e a assinatura estiver ativa.

A página pública de verificação mostra a situação real na hora da consulta. O certificado pode ser revogado se:

- os requisitos deixarem de ser cumpridos;
- as informações fornecidas forem falsas;
- a assinatura for suspensa ou encerrada.

## Propriedade intelectual

A plataforma, os modelos de documento, a marca, o selo e o conteúdo do site são da Dattis. A Agência recebe uma licença de uso não exclusiva e intransferível, válida enquanto durar a assinatura.

Os documentos gerados para a Agência e seus clientes podem ser usados livremente por eles na própria operação, inclusive depois do fim da assinatura. Isso não inclui revender os modelos como produto.

## Disponibilidade e suporte

A Dattis se esforça para manter a plataforma disponível e segura, mas não garante funcionamento ininterrupto. Pode haver manutenções e falhas de fornecedores.

Manutenções programadas são feitas, sempre que possível, fora do horário comercial. O suporte segue o nível do plano contratado.

## Responsabilidade

A responsabilidade total da Dattis em razão destes Termos fica limitada ao valor pago pela Agência nos 12 meses anteriores ao fato.

A Dattis não responde por:

- lucros cessantes;
- perda de receita ou de contas de anúncio;
- decisões de plataformas de terceiros;
- sanções decorrentes de atos ou omissões da própria Agência.

Essas limitações não se aplicam a casos de dolo ou às hipóteses em que a lei não permite limitação. A responsabilidade relacionada a dados pessoais segue também o [Contrato de Tratamento de Dados](/contrato-de-dados).

## Suspensão e encerramento pela Dattis

A Dattis pode suspender ou encerrar o acesso se a Agência:

- violar estes Termos ou a lei;
- usar a plataforma de forma que coloque em risco terceiros ou a própria plataforma;
- deixar o pagamento em atraso, nos termos acima.

Sempre que possível, a Dattis avisa antes e dá prazo para correção.

## Mudanças nestes Termos

Se houver mudança relevante, a Dattis avisa a Agência com pelo menos 15 dias de antecedência pela plataforma ou pelos contatos cadastrados. Continuar usando a plataforma depois da data de vigência significa aceitar a nova versão. A versão aceita no cadastro fica registrada.

## Disposições gerais

Estes Termos são regidos pelas leis brasileiras. A relação entre a Dattis e a Agência é empresarial: não há vínculo de emprego, sociedade ou representação entre as partes.

Se alguma cláusula for considerada inválida, as demais continuam valendo. A tolerância com um descumprimento não significa renúncia ao direito.

Fica eleito o foro da comarca da sede da Dattis para resolver qualquer controvérsia, com renúncia a qualquer outro.

## Contato

Dúvidas sobre estes Termos: ${canal(e)}.`;
}

// ---------------------------------------------------------------------------------------------

export function politicaDePrivacidade(e: DadosEmpresa) {
  return `Esta Política explica como ${qualificacao(e)} trata dados pessoais no site, nas ferramentas gratuitas e na plataforma. A Dattis vende conformidade com a LGPD, então procura fazer em casa exatamente o que recomenda: coletar só o necessário, dizer para que serve e apagar quando não precisa mais.

## Papéis: quando a Dattis é controladora e quando é operadora

A **Dattis é controladora** dos dados das pessoas que visitam o site, usam a Auditoria da sua agência, falam com a equipe comercial ou acessam a plataforma em nome de uma agência. As decisões sobre esses dados são da Dattis.

A **Dattis é operadora** quando trata, em nome da agência, os dados que a agência cadastra sobre os próprios clientes. Exemplos: o nome do responsável de um cliente, o e-mail de contato, os dados da assinatura do contrato. Nesse caso, quem decide é a agência, e as regras estão no [Contrato de Tratamento de Dados](/contrato-de-dados).

## Quais dados tratamos e por quê

| Situação | Dados | Para quê | Base legal (LGPD) |
| --- | --- | --- | --- |
| Visita ao site | Endereço IP, navegador, páginas acessadas, data e hora (registros do servidor) | Segurança, prevenção de abuso e funcionamento do site | Legítimo interesse (art. 7º, IX) |
| Auditoria da sua agência | Nome do responsável, nome da agência, WhatsApp, respostas do questionário e origem da visita (parâmetros UTM) | Mostrar o resultado, enviar ao especialista quando você pede e oferecer os serviços da Dattis | Procedimentos preliminares a um contrato, a seu pedido (art. 7º, V), e legítimo interesse para contato comercial (art. 7º, IX) |
| Auditoria de site | Endereço do site informado | Fazer a análise pedida. O resultado aparece na tela e não fica guardado | Legítimo interesse (art. 7º, IX) |
| Conversa pelo WhatsApp | Nome, número e mensagens | Atendimento comercial e suporte | Procedimentos preliminares e execução de contrato (art. 7º, V) |
| Acesso à plataforma | Nome e CNPJ da agência, e-mail, senha (guardada só como hash, nunca em texto), WhatsApp, endereço, nome e cargo do responsável e, se usar o login com Google, o identificador, o nome e o e-mail da conta Google | Criar e proteger o acesso, executar a assinatura, gerar os documentos e falar com a agência | Execução de contrato (art. 7º, V) |
| Registros de acesso à plataforma | IP, data e hora | Segurança e cumprimento do Marco Civil da Internet (Lei nº 12.965/2014, art. 15) | Cumprimento de obrigação legal (art. 7º, II) |
| Cobrança e nota fiscal | Razão social, CNPJ, endereço e contato financeiro | Emitir cobrança e documentos fiscais | Obrigação legal e execução de contrato (art. 7º, II e V) |

A Dattis **não coleta dados de cartão**. O pagamento é feito por link de um provedor de pagamento, que trata esses dados segundo a própria política.

## O que a Dattis não recebe

A plataforma documenta o tratamento de dados das agências, mas não o executa. Por isso, **não recebemos** as listas de clientes, os leads, as conversas de WhatsApp nem os eventos de conversão dos clientes das agências.

A vigilância acessa apenas páginas públicas dos sites cadastrados, com um robô identificado como Dattis, para checar sinais de segurança e privacidade.

## Cookies e armazenamento no navegador

${process.env.NEXT_PUBLIC_GTM_ID ? "Os cookies essenciais funcionam sempre. Cookies de **estatística** (Google Analytics, pelo Google Tag Manager) e de **marketing** só são ativados se você permitir no aviso de cookies, e você muda essa escolha a qualquer momento no link “Preferências de cookies” do rodapé." : "Usamos apenas o necessário para o site e a plataforma funcionarem. **Não usamos cookies de publicidade nem ferramentas de analytics de terceiros.**"}

| Nome | Tipo | Para quê | Duração |
| --- | --- | --- | --- |
| dattis_session | Cookie essencial | Manter a agência logada na plataforma | 30 dias |
| dattis_g_* | Cookies essenciais | Proteger o login com Google contra fraudes | 10 minutos |
| dattis_admin | Cookie essencial | Acesso da equipe Dattis ao painel interno | 12 horas |
| dattis_consent | Cookie essencial | Guardar a sua escolha no aviso de cookies | 12 meses |
${process.env.NEXT_PUBLIC_GTM_ID ? "| `_ga`, `_ga_*` | Estatística (Google Analytics) | Medir visitas e uso do site, só com o seu consentimento | Até 2 anos |\n" : ""}| Preferências | Armazenamento local do navegador | Lembrar o tema claro ou escuro e o andamento das ferramentas gratuitas | Até você limpar o navegador |

## Com quem compartilhamos

A Dattis **não vende dados pessoais**. Compartilhamos dados apenas:

- com fornecedores que operam a plataforma em nosso nome, listados no [Contrato de Tratamento de Dados](/contrato-de-dados#anexo-i-suboperadores), sob contrato e com dever de sigilo;
- com o Google, quando você escolhe entrar com a conta Google;
- com o Meta (WhatsApp), quando você escolhe falar conosco por lá;
- com autoridades, quando houver obrigação legal ou ordem judicial;
- com o cliente da agência, no caso dos dados que aparecem no contrato que ele assina e no resumo de conformidade (DAT) que a agência envia a ele.

**Login com Google.** Quando você escolhe entrar com o Google, recebemos do Google apenas o nome, o e-mail e o identificador da sua conta, e só para identificar o seu acesso à plataforma. Não acessamos e-mails, arquivos, contatos nem qualquer outro dado da sua conta Google, não usamos esses dados para publicidade e não os repassamos a terceiros. O uso segue a Política de Dados do Usuário dos Serviços de API do Google, inclusive os requisitos de Uso Limitado. Você pode desconectar o Google a qualquer momento em Configurações.

## Transferência internacional

Nossos fornecedores de hospedagem e banco de dados mantêm servidores nos Estados Unidos. A transferência segue o art. 33 da LGPD e a regulamentação da ANPD, com cláusulas contratuais e garantias de proteção oferecidas por esses fornecedores.

## Por quanto tempo guardamos

| Dados | Prazo |
| --- | --- |
| Registros de acesso à plataforma | 6 meses (Marco Civil da Internet) |
| Leads da Auditoria da sua agência | Até 24 meses sem nova interação, ou até você pedir a exclusão |
| Resultados da vigilância | 90 dias |
| Conta da agência e documentos | Enquanto durar a assinatura. Depois do fim, ficam 30 dias disponíveis para exportação e são excluídos em até 90 dias |
| Dados fiscais e contratuais da agência com a Dattis | Pelo prazo exigido pela legislação fiscal e para a defesa em processos, em regra 5 anos |

## Segurança

Algumas das medidas que adotamos:

- tráfego sempre criptografado (HTTPS) e cabeçalhos de segurança;
- senhas guardadas com hash bcrypt;
- isolamento lógico, em que cada agência só acessa os próprios dados;
- acesso administrativo restrito e com senha própria;
- cópias de segurança mantidas pelo provedor do banco de dados.

Se houver um incidente de segurança que possa causar risco ou dano relevante, comunicamos a ANPD e as pessoas afetadas, como manda o art. 48 da LGPD.

## Seus direitos

Pelo art. 18 da LGPD, você pode pedir:

- a confirmação de que tratamos seus dados e o acesso a eles;
- a correção de dados incompletos ou desatualizados;
- a anonimização, o bloqueio ou a eliminação do que for desnecessário ou excessivo;
- a portabilidade;
- a informação sobre com quem compartilhamos;
- a revogação do consentimento, quando ele for a base legal;
- que não seja mais contatado para fins comerciais.

Para exercer esses direitos, fale conosco ${canal(e)}. Respondemos em até 15 dias. Se o pedido envolver dados que a Dattis trata em nome de uma agência, nós o encaminhamos a ela, que é quem decide sobre esses dados.

Você também pode apresentar reclamação à [Autoridade Nacional de Proteção de Dados (ANPD)](https://www.gov.br/anpd/pt-br).

## Encarregado pelo tratamento de dados (DPO)

${e.encarregadoNome ? `O encarregado da Dattis é **${e.encarregadoNome}**, que atende` : "O encarregado da Dattis atende"} ${canal(e)}.

## Crianças e adolescentes

O site e a plataforma são destinados a empresas e profissionais. Não coletamos intencionalmente dados de menores de 18 anos.

## Mudanças nesta Política

Quando esta Política mudar de forma relevante, atualizamos a versão e a data no topo da página e avisamos as agências pela plataforma ou pelos contatos cadastrados.`;
}

// ---------------------------------------------------------------------------------------------

export function contratoDeDados(e: DadosEmpresa) {
  const subs = suboperadores();
  return `Este Contrato de Tratamento de Dados ("Contrato de Dados") faz parte dos [Termos de Uso](/termos). Ele regula como ${qualificacao(e)} trata dados pessoais em nome da agência que assina a plataforma ("Agência"), nos termos dos arts. 37 a 40 da LGPD. A Agência aceita este Contrato de Dados ao ativar o acesso. Em assuntos de dados pessoais, ele prevalece sobre os Termos de Uso.

## Papéis das partes

Na relação com os próprios clientes, a Agência normalmente é **operadora** e trata dados em nome deles, que são os **controladores**.

Quando a Agência cadastra esses clientes na plataforma, a **Dattis atua como suboperadora**: trata os dados apenas para prestar o serviço contratado pela Agência e segundo as instruções dela.

Quanto aos dados da própria equipe da Agência, a Agência é controladora e a Dattis é operadora.

## Quais dados e para quê

- **Titulares:** representantes e contatos dos clientes da Agência, as pessoas da equipe da Agência que usam a plataforma e, quando a Agência usa o aviso de cookies, os visitantes dos sites onde ele está instalado.
- **Dados:** nome, cargo, e-mail e WhatsApp de contato; CNPJ e endereço do site do cliente; dados de assinatura eletrônica (nome, cargo, e-mail, IP, navegador, data e hora); registros de acesso; e, quando a Agência usa o aviso de cookies da Dattis, a escolha de cada visitante do site (identificador aleatório, categorias aceitas, versão do aviso, página e um resumo criptográfico do IP, nunca o IP em si).
- **Finalidades:** gerar e manter o registro de atividades, os contratos e os demais documentos de conformidade; colher assinaturas eletrônicas; monitorar os sites cadastrados; exibir o aviso de cookies e guardar a prova do consentimento dos visitantes; emitir certificados; gerar o dossiê e o resumo de conformidade (DAT).
- **Duração:** enquanto durar a assinatura, mais o prazo de saída previsto abaixo.

A plataforma **não recebe** listas de compradores, leads, conversas nem eventos de conversão dos clientes finais. Do visitante dos sites, recebe apenas a escolha feita no aviso de cookies, ligada a um identificador aleatório.

## Instruções da Agência

A Dattis trata os dados apenas segundo as instruções da Agência, que são as previstas neste Contrato de Dados e as que ela dá ao usar a plataforma. Se uma instrução parecer contrária à LGPD, a Dattis avisa a Agência e pode deixar de cumpri-la até que a questão seja esclarecida.

## Confidencialidade

Só têm acesso aos dados as pessoas da Dattis que precisam dele para prestar o serviço ou dar suporte, e todas têm dever de sigilo.

## Segurança

A Dattis mantém as medidas técnicas e administrativas descritas no [Anexo II](#anexo-ii-medidas-de-seguranca). Elas são adequadas ao tipo de dado tratado, como exige o art. 46 da LGPD, e são revisadas conforme a plataforma evolui.

## Suboperadores

A Agência autoriza a Dattis a contratar os suboperadores do [Anexo I](#anexo-i-suboperadores). A Dattis exige deles obrigações de proteção de dados compatíveis com este Contrato de Dados e responde por eles perante a Agência.

Para incluir ou trocar um suboperador, a Dattis atualiza o Anexo I e avisa a Agência com 15 dias de antecedência. A Agência pode se opor com justificativa. Se não houver solução, pode encerrar a assinatura sem multa pelo período restante.

## Transferência internacional

Parte dos suboperadores mantém servidores fora do Brasil, como indica o Anexo I. A transferência segue o art. 33 da LGPD e a regulamentação da ANPD, com cláusulas contratuais e garantias de proteção dos fornecedores.

## Incidentes de segurança

Se a Dattis confirmar um incidente com dados tratados em nome da Agência, ela avisa a Agência sem demora indevida, em até 48 horas da confirmação. O aviso traz o que se sabe naquele momento:

- a natureza do incidente;
- os dados e titulares afetados;
- as medidas tomadas;
- um ponto de contato.

O aviso permite que a Agência e seus clientes cumpram o art. 48 da LGPD e a regulamentação da ANPD. A Dattis colabora com as informações adicionais que surgirem.

## Pedidos de titulares

Se a Dattis receber diretamente um pedido de titular sobre dados que trata em nome da Agência, ela o encaminha à Agência em até 2 dias úteis e não responde sozinha, salvo instrução. A plataforma permite à Agência consultar, corrigir e excluir esses dados para atender aos pedidos.

## Comprovação e auditoria

A Dattis fornece à Agência as informações razoavelmente necessárias para demonstrar o cumprimento deste Contrato de Dados. Auditorias presenciais ou por terceiros podem ser combinadas uma vez por ano, com 30 dias de aviso, em data acordada e às custas da Agência, desde que respeitem o sigilo de outros clientes da Dattis.

## Fim do tratamento

No fim da assinatura, a Agência tem 30 dias para exportar documentos, contratos assinados e evidências de assinatura. Depois disso, a Dattis exclui os dados tratados em nome da Agência em até 90 dias, inclusive das cópias de segurança no ciclo normal de rotação. A exceção é a guarda exigida por lei, que fica bloqueada para qualquer outro uso.

## Responsabilidade

Cada parte responde pelos danos que causar ao descumprir a LGPD ou este Contrato de Dados, nos termos dos arts. 42 a 45 da LGPD. Os limites de responsabilidade dos Termos de Uso se aplicam no que a lei permitir.

## Anexo I: Suboperadores

| Suboperador | O que faz | Onde |
| --- | --- | --- |
${subs.map((s) => `| ${s.nome} | ${s.funcao} | ${s.local} |`).join("\n")}

## Anexo II: Medidas de segurança

- Criptografia em trânsito (HTTPS/TLS) em todo o site e a plataforma, com cabeçalhos de segurança (HSTS, proteção contra clickjacking e contra detecção indevida de conteúdo).
- Senhas guardadas apenas como hash bcrypt. Sessões em cookie protegido (httpOnly, secure, SameSite).
- Login com Google pelo padrão OAuth 2.0 com PKCE, quando escolhido.
- Isolamento lógico: toda consulta a dados de conta é filtrada pela agência autenticada.
- Links públicos de assinatura e de resumo de conformidade com identificadores aleatórios de alta entropia, que não podem ser adivinhados.
- Evidência de assinatura com nome, cargo, e-mail, IP, navegador, data e hora, além do resumo criptográfico (SHA-256) do texto assinado. Assim, é possível provar que o contrato não mudou depois da assinatura.
- Acesso administrativo restrito, com credencial própria e sessão curta.
- Cópias de segurança e recuperação pontual do banco de dados mantidas pelo provedor.
- Vigilância automatizada com proteção contra acesso a redes internas (SSRF) e robô identificado.`;
}
