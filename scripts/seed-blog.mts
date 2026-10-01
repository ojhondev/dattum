// Semeia o autor e os 3 primeiros artigos do blog como RASCUNHO (revisar e publicar no /admin/blog).
// Uso: npx tsx scripts/seed-blog.mts
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const LEI = "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm";
const ANPD = "https://www.gov.br/anpd/pt-br";

const ARTIGOS = [
  {
    slug: "lgpd-para-agencias-de-trafego-pago",
    titulo: "LGPD para agências de tráfego pago: o guia prático",
    resumo: "O que a lei exige de quem sobe lista de clientes, instala pixel e atende lead no WhatsApp — e como provar que a sua agência está em dia.",
    categoria: "LGPD",
    tags: ["lgpd", "agência de tráfego", "operador de dados"],
    palavraChave: "lgpd para agências",
    seoTitulo: "LGPD para agências de tráfego pago: guia prático 2026",
    seoDescricao: "LGPD para agências de tráfego pago: o que a lei exige de quem sobe lista de clientes, instala pixel e atende lead, e como provar conformidade.",
    faq: [
      { pergunta: "A LGPD vale para agência pequena?", resposta: "Vale. A ANPD simplifica algumas obrigações para agentes de pequeno porte, mas a agência continua precisando de base legal, segurança e registro do que faz com os dados." },
      { pergunta: "Quem responde se um lead vazar: a agência ou o cliente?", resposta: "Os dois podem responder. O cliente é o controlador e a agência é a operadora, que responde junto quando descumpre a lei ou as instruções do cliente (art. 42)." },
      { pergunta: "Preciso de advogado para cada cliente?", resposta: "Não necessariamente. O que a lei pede é documentação coerente com a operação real: registro de tratamento, contrato de operador e controles de segurança. Plataformas como a Dattis geram isso por cliente." },
    ],
    conteudo: `A **LGPD para agências** de tráfego pago deixou de ser assunto de departamento jurídico. Toda vez que a sua agência sobe uma planilha de clientes no Gerenciador de Anúncios, instala um pixel ou recebe um lead no WhatsApp, ela está tratando dado pessoal — e a [Lei Geral de Proteção de Dados (Lei nº 13.709/2018)](${LEI}) passa a valer para ela.

Este guia mostra, sem juridiquês, o que muda na rotina da agência e o que você precisa ter em mãos se um cliente, a ANPD ou a Meta perguntarem.

## Agência é controladora ou operadora?

Na maioria dos casos, **o cliente é o controlador** (ele decide para que os dados servem) e **a agência é a operadora** (ela executa o tratamento em nome do cliente). A lei define os dois papéis no art. 5º.

Isso parece detalhe, mas define a sua responsabilidade:

- O operador deve seguir as **instruções do controlador** (art. 39).
- O operador **responde junto** com o cliente quando descumpre a lei ou as instruções lícitas dele (art. 42).
- Os dois precisam manter o **registro das operações** de tratamento (art. 37).

Se a agência usa a base de leads de um cliente para outro, ou guarda dados depois do fim do contrato, ela deixa de agir como simples operadora — e o risco aumenta.

## Onde a agência trata dado pessoal sem perceber

A operação de tráfego pago tem pelo menos seis pontos de contato com dado pessoal:

1. **Lista de clientes para criar público** (Público personalizado, lookalike, Customer Match).
2. **API de Conversões** do Meta e **Conversões otimizadas** do Google, que enviam e-mail e telefone de quem comprou.
3. **Pixel e tags** no site e nas landing pages.
4. **Formulários de lead**, inclusive o Formulário instantâneo do Meta.
5. **Atendimento no WhatsApp**, com nome, telefone e histórico da conversa.
6. **CRM, planilhas e automações** (Zapier, Make, n8n).

Cada um desses fluxos precisa de uma **base legal** (art. 7º), de **segurança** (art. 46) e de **registro**.

## O que a LGPD exige da agência na prática

### 1. Registro das operações de tratamento (RAT)

O RAT é a lista do que a agência faz com o dado de cada cliente: quais dados, para quê, com qual base legal, por quanto tempo e quem mais tem acesso. É o primeiro documento pedido numa fiscalização.

### 2. Contrato de operador com cada cliente (DPA)

O contrato deixa claro quem é controlador, quem é operador, quais instruções a agência segue, quais ferramentas pode usar e o que acontece em caso de incidente. Sem ele, a divisão de responsabilidade simplesmente não existe no papel.

### 3. Registro das ferramentas (subprocessadores)

Meta, Google, TikTok, CRM, plataforma de WhatsApp: toda ferramenta que toca o dado precisa estar listada. A agência herda o risco de cada uma que coloca no caminho do lead.

### 4. Segurança e controle de acesso

Planilha compartilhada por link aberto e ex-funcionário com acesso à BM são as causas mais comuns de vazamento em agência. A lei pede medidas de segurança proporcionais ao risco.

## Quanto custa ficar fora da lei

O art. 52 prevê advertência, **multa de até 2% do faturamento** da empresa no Brasil (limitada a R$ 50 milhões por infração), multa diária, publicização da infração, bloqueio e eliminação dos dados e até proibição do tratamento. A [ANPD](${ANPD}) já publicou a regra de dosimetria que define como essas sanções são calculadas.

> Para uma agência, a proibição de tratar dados é tão grave quanto a multa: sem dado, não existe campanha.

Além da multa, existe o risco comercial. Grandes clientes já pedem comprovação de LGPD em contrato e concorrência — e quem não tem documento perde a conta.

## Como colocar a agência em conformidade

Um caminho realista para agências de 5 a 100 clientes:

- **Mapeie** os fluxos de dado de cada cliente (os seis pontos acima).
- **Gere o RAT e o contrato** de cada conta e colete a assinatura do cliente.
- **Revise os sites**: banner de cookies que segura o pixel, política de privacidade linkada nos formulários e HTTPS.
- **Controle os acessos** à BM, contas de anúncio, CRM e planilhas.
- **Mantenha vivo**: a documentação precisa acompanhar cada cliente novo e cada ferramenta nova.

Para saber por onde começar, faça a [Auditoria da sua agência](/diagnostico): são 19 perguntas e o resultado sai na hora. Se quiser automatizar a documentação por cliente, veja os [planos da Dattis](/planos).

## Conformidade como argumento de venda

Agência que mostra registro, contrato e certificado de privacidade verificável no rodapé do site do cliente transmite seriedade. Em vez de custo, a LGPD vira diferencial na hora de fechar contrato — especialmente com clientes de saúde, educação e finanças.`,
  },
  {
    slug: "bm-suspensa-o-que-fazer",
    titulo: "BM suspensa: o que fazer para recuperar a conta e não perder clientes",
    resumo: "Passo a passo para agir nas primeiras horas, o que a Meta costuma pedir e como documentação organizada acelera a contestação.",
    categoria: "BM e Meta Ads",
    tags: ["bm suspensa", "meta ads", "gerenciador de negócios"],
    palavraChave: "bm suspensa",
    seoTitulo: "BM suspensa: o que fazer para recuperar a conta",
    seoDescricao: "BM suspensa? Veja o que fazer nas primeiras horas, o que a Meta costuma pedir na análise e como documentação organizada acelera a contestação.",
    faq: [
      { pergunta: "Quanto tempo a Meta leva para analisar uma BM suspensa?", resposta: "Não há prazo fixo. Há casos resolvidos em horas e outros que levam semanas. Contestações completas e coerentes tendem a ter menos idas e vindas." },
      { pergunta: "Documentação de LGPD garante a liberação da BM?", resposta: "Não. A decisão é da Meta. Mas política de privacidade, dados da empresa e registro de como os dados são tratados ajudam a provar que o negócio é legítimo e respondem dúvidas comuns da análise." },
      { pergunta: "Posso criar outra BM enquanto a suspensa está em análise?", resposta: "Criar contas para contornar uma restrição pode violar as regras da Meta e piorar a situação. O caminho mais seguro é contestar pela via oficial." },
    ],
    conteudo: `Uma **BM suspensa** para a operação inteira: campanhas param, clientes ligam e cada dia sem anúncio vira faturamento perdido — da agência e do cliente. Este artigo mostra o que fazer nas primeiras horas e como chegar na contestação com tudo organizado.

> Importante: nenhuma documentação garante a liberação. A decisão é sempre da Meta. O que dá para controlar é a qualidade e a velocidade da sua resposta.

## Por que a BM costuma ser suspensa

A Meta não explica tudo, mas os motivos mais comuns são conhecidos:

- **Violação das políticas de publicidade** (promessas de resultado, saúde, finanças, antes e depois).
- **Atividade incomum**: muitos logins de lugares diferentes, novas contas de anúncio em sequência.
- **Conta invadida** ou administrador com perfil restrito.
- **Problemas de pagamento** e estornos.
- **Dúvidas sobre a legitimidade do negócio**: site sem política de privacidade, dados inconsistentes, domínio não verificado.

Esse último ponto é onde a organização da agência faz diferença.

## O que fazer nas primeiras 24 horas

### 1. Não crie contas para contornar o bloqueio

Abrir BM nova ou usar perfis de terceiros para continuar anunciando pode ser tratado como evasão de restrição e piorar o caso.

### 2. Descubra o que exatamente foi restringido

Veja no **Account Quality** (Qualidade da conta) se a restrição é da BM, de uma conta de anúncio, de uma página ou de um perfil. A contestação é diferente para cada um.

### 3. Proteja os acessos

Troque senhas, ative a autenticação em dois fatores para todos os administradores e **remova pessoas que não trabalham mais com você**. Ex-colaborador com acesso é uma das causas mais comuns de problema.

### 4. Avise o cliente com um plano

Cliente informado tolera melhor a pausa. Explique o que aconteceu, o que já foi feito e o próximo passo.

## O que a análise da Meta costuma pedir

Dependendo do caso, a Meta pode solicitar:

- **Documentos da empresa** (CNPJ, comprovante de endereço, conta de serviço).
- **Domínio verificado** e site no ar com informações claras sobre o negócio.
- **Política de privacidade** publicada — obrigatória, por exemplo, para anúncios com formulário de cadastro.
- Esclarecimentos sobre **como os dados dos clientes são coletados e usados**, especialmente quando há upload de lista de clientes.

## Como a documentação de LGPD ajuda na contestação

Quando os dados estão organizados, você responde em minutos o que outras agências levam dias para juntar:

| O que a análise questiona | O que você já tem pronto |
|---|---|
| A empresa é legítima? | Dados do cliente, CNPJ e contrato assinado |
| De onde vêm os dados das listas? | Registro de tratamento com origem e base legal |
| O site informa o uso dos dados? | Política de privacidade e certificado verificável |
| Quem tem acesso aos dados? | Lista de ferramentas e responsáveis |

Na Dattis, o **Dossiê para BM** junta isso em um documento por cliente, pronto para anexar ou copiar na contestação. Você pode conhecer o recurso nos [planos](/planos).

## Como evitar a próxima suspensão

- Revise anúncios com promessas exageradas antes de subir.
- Mantenha poucos administradores, todos com dois fatores.
- Verifique o domínio de cada cliente no Gerenciador de Negócios.
- Garanta que os sites têm política de privacidade e banner de cookies — dá para checar em segundos na [auditoria de site](/auditoria).
- Documente a origem das listas de clientes antes de subir qualquer público.

Quer saber quanto a sua agência está exposta? Faça a [Auditoria da sua agência](/diagnostico) e leia também o nosso [guia de LGPD para agências](/blog/lgpd-para-agencias-de-trafego-pago).`,
  },
  {
    slug: "pixel-do-meta-e-lgpd",
    titulo: "Pixel do Meta e LGPD: precisa de consentimento para rastrear?",
    resumo: "Quando o pixel e a tag do Google podem disparar, o que o banner de cookies precisa fazer e o erro que mais aparece nos sites de clientes.",
    categoria: "Tráfego pago",
    tags: ["pixel do meta", "cookies", "consentimento"],
    palavraChave: "pixel do meta lgpd",
    seoTitulo: "Pixel do Meta e LGPD: precisa de consentimento?",
    seoDescricao: "Pixel do Meta e LGPD: quando o pixel e a tag do Google podem disparar, o que o banner de cookies precisa fazer e o erro mais comum nos sites.",
    faq: [
      { pergunta: "Só mostrar o banner de cookies já resolve?", resposta: "Não. O banner precisa impedir que o pixel e as tags de marketing disparem antes da escolha da pessoa. Banner que só avisa não muda nada." },
      { pergunta: "A API de Conversões dispensa o consentimento?", resposta: "Não. Enviar dados pelo servidor continua sendo tratamento de dado pessoal e precisa de base legal, transparência e segurança, como o envio com criptografia (hash)." },
    ],
    conteudo: `A dúvida sobre **pixel do Meta LGPD** aparece em toda agência: o pixel pode disparar assim que a página abre? Na maioria dos sites de clientes, ele dispara — e esse é justamente o problema mais encontrado em auditorias de privacidade.

## O pixel trata dado pessoal?

Sim. O Pixel do Meta, a tag do Google (GA4 e Google Ads) e o Pixel do TikTok coletam identificadores de navegador, páginas visitadas e eventos de conversão. Combinados, esses dados permitem identificar e segmentar pessoas — é exatamente para isso que eles existem. Pela [LGPD](${LEI}), isso é tratamento de dado pessoal.

## Precisa de consentimento?

A base legal mais segura para cookies e pixels de **publicidade** é o **consentimento** (art. 7º, I). O [guia de cookies da ANPD](${ANPD}) orienta que cookies não necessários ao funcionamento do site não devem ser ativados por padrão e que a pessoa precisa ter uma escolha real, inclusive a de recusar.

Na prática, para uma agência:

- **Cookies estritamente necessários** (carrinho, login) podem funcionar sem consentimento.
- **Pixel e tags de marketing** devem esperar o aceite.
- A opção de **recusar** precisa ser tão fácil quanto a de aceitar.

Os próprios termos das ferramentas de negócio do Meta colocam no anunciante a responsabilidade de informar e obter o consentimento quando a lei exigir.

## O erro mais comum: banner que só avisa

O cenário que mais aparece nos sites de clientes:

1. A página carrega.
2. O pixel dispara na hora.
3. Só depois aparece um banner dizendo “usamos cookies”.

Esse banner não protege ninguém: o dado já foi enviado. Para estar de acordo, o banner precisa **bloquear o pixel até o clique em aceitar**.

## Como configurar do jeito certo

### Com uma ferramenta de consentimento (CMP)

Ferramentas como Cookiebot, OneTrust, CookieYes ou soluções brasileiras bloqueiam os scripts por categoria até a escolha da pessoa.

### Com o Modo de Consentimento do Google

No Google Tag Manager, ative o **Consent Mode** e configure as tags de marketing para dependerem do consentimento de publicidade. Para o pixel do Meta, use a mesma regra de disparo no Tag Manager.

### Teste depois de instalar

Abra o site em uma janela anônima, não clique no banner e verifique se nenhuma requisição para \`facebook.com\` ou \`googletagmanager.com\` saiu. A [auditoria de site da Dattis](/auditoria) faz esse teste com um navegador real.

## E a API de Conversões?

A API de Conversões do Meta e as Conversões otimizadas do Google enviam dados pelo servidor, longe dos olhos do visitante. Isso **não dispensa** a LGPD: continua sendo tratamento de dado pessoal. O mínimo é:

- Enviar e-mail e telefone **criptografados (hash SHA-256)**.
- Ter **base legal** e informar o uso na política de privacidade.
- Registrar o fluxo no **registro de tratamento** e no **contrato** com o cliente.

## Checklist rápido para a agência

- Banner de cookies que **bloqueia** pixel e tags até o aceite.
- Opção de recusar visível.
- **Política de privacidade** linkada no rodapé e nos formulários.
- API de Conversões com dados em hash.
- Tudo isso registrado por cliente.

Não sabe como estão os sites da sua carteira? Comece pela [Auditoria da sua agência](/diagnostico) e veja o [guia de LGPD para agências](/blog/lgpd-para-agencias-de-trafego-pago) para o quadro completo.`,
  },
];

async function main() {
  let [autor] = await sql`SELECT id FROM autores ORDER BY criado_em LIMIT 1`;
  if (!autor) {
    [autor] = await sql`INSERT INTO autores (nome, slug, cargo, bio, foto_url)
      VALUES ('Jhonatan Ribeiro', 'jhonatan-ribeiro', 'Fundador da Dattis',
        'Ajuda agências de tráfego pago a operar em conformidade com a LGPD e a transformar privacidade em argumento de venda.',
        '/marketing/especialista.png') RETURNING id`;
  }
  for (const a of ARTIGOS) {
    const existe = await sql`SELECT id FROM posts WHERE slug = ${a.slug}`;
    if (existe.length) continue;
    await sql`INSERT INTO posts (slug, titulo, resumo, conteudo, categoria, tags, autor_id, status, seo_titulo, seo_descricao, palavra_chave, faq)
      VALUES (${a.slug}, ${a.titulo}, ${a.resumo}, ${a.conteudo}, ${a.categoria}, ${JSON.stringify(a.tags)}::jsonb, ${autor.id}, 'rascunho',
        ${a.seoTitulo}, ${a.seoDescricao}, ${a.palavraChave}, ${JSON.stringify(a.faq)}::jsonb)`;
    console.log("criado:", a.slug);
  }
}

main();
