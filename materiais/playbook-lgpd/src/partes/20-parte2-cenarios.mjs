// Capítulo 10 — 30 cenários do dia a dia da agência (gerados a partir de dados).
const R = { alto: '<b class="b-alto">Alto</b>', medio: '<b class="b-medio">Médio</b>', baixo: '<b class="b-baixo">Baixo</b>' };

const grupos = [
  {
    titulo: "Públicos e plataformas de anúncio",
    intro: "Onde a agência mais manipula dados pessoais: listas, pixel, API de Conversões e públicos semelhantes.",
    itens: [
      {
        t: "O cliente manda a planilha de clientes pelo WhatsApp para “subir um público”",
        risco: "alto", papel: "Operadora", arts: "Arts. 6º, 7º, 33 e 46",
        prob: "O dono da loja exporta 18 mil clientes do sistema — com nome, CPF, telefone, endereço e histórico de compras — e manda o arquivo no WhatsApp do gestor. O arquivo fica no celular pessoal, no WhatsApp Web do computador do escritório e depois no Drive da agência.",
        risk: "Dados excessivos (CPF e endereço não são necessários para o público), cópias espalhadas em canais sem controle, base sem procedência conhecida e sem registro da instrução. Se o celular for perdido ou o arquivo for repassado, é incidente.",
        evitar: ["Canal oficial de recebimento: pasta restrita por cliente ou upload na plataforma de gestão", "Pedir só as colunas usadas no match: e-mail, telefone, nome, cidade/UF", "Declaração de procedência e base legal assinada pelo cliente", "Registrar a instrução (o quê, para quê, quando apagar)", "Apagar o arquivo bruto após a subida (até 7 dias)", "Orientar o cliente a nunca mandar base por mensageiro"],
      },
      {
        t: "“Comprei uma base de 50 mil leads do segmento, sobe aí”",
        risco: "alto", papel: "Operadora (com instrução ilícita)", arts: "Arts. 6º, I, 7º e 42",
        prob: "O cliente comprou uma lista de “empresários da região” ou “mães com filhos pequenos” de um fornecedor de dados e quer usar em Custom Audiences, disparo de e-mail e WhatsApp.",
        risk: "Não há base legal: os titulares nunca tiveram relação com o anunciante nem foram informados. A instrução é ilícita, então a agência que executa responde solidariamente (art. 42, § 1º, I). Os termos das plataformas proíbem listas sem permissão; a taxa de denúncia derruba números e contas.",
        evitar: ["Recusar por escrito, citando a cláusula de instrução ilícita do DPA", "Explicar o risco de suspensão da conta de anúncio — é o argumento que convence", "Oferecer alternativa: público por interesse, lookalike de base própria e captação com lead ads", "Registrar a recusa no histórico do cliente"],
      },
      {
        t: "Público semelhante criado com a base de outro cliente",
        risco: "alto", papel: "Controladora (sem base)", arts: "Arts. 6º, I e II, e 7º",
        prob: "Para acelerar o novo cliente de estética, o gestor usa como semente a lista de compradores de outra clínica que a agência atende. “É só para o algoritmo aprender, ninguém vê os dados.”",
        risk: "Desvio de finalidade e compartilhamento entre controladores sem base legal, possivelmente com dado de saúde. A agência passa a ser controladora da operação e viola o sigilo do contrato com o primeiro cliente.",
        evitar: ["Regra absoluta: bases nunca cruzam clientes, nem para teste", "Contas de anúncio e BMs separados por cliente", "Públicos salvos com prefixo do cliente e revisão trimestral", "Cláusula de confidencialidade e de não reutilização no contrato e no termo da equipe"],
      },
      {
        t: "Pixel e tags disparando antes do consentimento",
        risco: "medio", papel: "Operadora", arts: "Arts. 7º, I, 8º e 9º · Guia de Cookies ANPD",
        prob: "O site do cliente tem um banner de cookies “decorativo”: o pixel do Meta, a tag do Google Ads e o TikTok carregam no primeiro acesso, antes de o visitante clicar em qualquer coisa — e continuam carregando se ele clicar em “Rejeitar”.",
        risk: "O Guia da ANPD sobre cookies indica consentimento para cookies não necessários, como os de publicidade, e considera inadequados banners sem opção real de recusa. Coleta irregular de dado de navegação usado para perfil comportamental (art. 12, § 2º).",
        evitar: ["CMP (plataforma de consentimento) integrada ao Google Tag Manager", "Tags de publicidade disparando só com consentimento de marketing", "Google Consent Mode v2 e equivalente no Meta configurados", "Botão “Rejeitar” com o mesmo destaque de “Aceitar”", "Teste mensal: abrir o site em aba anônima e conferir as requisições"],
      },
      {
        t: "API de Conversões enviando e-mail e telefone de todo mundo",
        risco: "medio", papel: "Operadora", arts: "Arts. 6º, III e VI, 9º e 10",
        prob: "Para melhorar a qualidade de correspondência dos eventos, a agência configura a CAPI enviando e-mail, telefone, nome, CEP e data de nascimento de todos os compradores e leads — inclusive dos que recusaram cookies no banner.",
        risk: "Enviar dados de identificação para contornar a recusa do titular viola transparência e boa-fé. Dados como data de nascimento podem ser excessivos. Se o aviso de privacidade não menciona o envio para plataformas de anúncio, falta informação ao titular.",
        evitar: ["Respeitar o sinal de consentimento também no servidor (server-side)", "Enviar só os parâmetros necessários, com hash", "Aviso de privacidade citando o compartilhamento com plataformas de publicidade", "LIA documentado quando a base for legítimo interesse", "Revisar os parâmetros a cada nova integração"],
      },
      {
        t: "Remarketing da clínica com evento “agendou tratamento de ansiedade”",
        risco: "alto", papel: "Operadora", arts: "Arts. 5º, II, 11 e 12, § 2º",
        prob: "A clínica de saúde mental quer otimizar campanhas e o gestor cria eventos personalizados com o nome do tratamento (“Agendou_TDAH”, “Lead_Depressao”) e públicos de remarketing por página de tratamento.",
        risk: "Dado sensível de saúde inferido e enviado a plataformas estrangeiras, sem consentimento específico e destacado. As plataformas restringem o uso de informações de saúde em eventos e públicos e podem bloquear o pixel ou a conta. Risco reputacional alto se o titular perceber anúncios ligados à condição.",
        evitar: ["Eventos genéricos (“Lead”, “Agendamento”), nunca com nome de condição", "Sem remarketing por página de tratamento específico", "Otimizar por eventos de funil, não por diagnóstico", "Consentimento específico se houver qualquer uso de dado sensível", "RIPD para clientes de saúde"],
      },
      {
        t: "Raspagem de seguidores do concorrente para público e direct",
        risco: "alto", papel: "Controladora/Operadora", arts: "Arts. 6º, 7º e 10",
        prob: "Uma ferramenta extrai os seguidores e os perfis que comentaram no Instagram do concorrente. A lista vira público personalizado e base para mensagens diretas automatizadas.",
        risk: "Dado “público” não é dado livre: o art. 7º, § 3º e § 4º exigem considerar a finalidade, a boa-fé e o interesse público que justificaram a disponibilização. Viola também os termos da plataforma (coleta automatizada), com risco de bloqueio de perfis e contas.",
        evitar: ["Não usar raspagem para montar bases de contato", "Usar segmentação nativa por interesses e públicos de engajamento da própria marca", "Conteúdo e anúncios para atrair seguidores, não listas extraídas"],
      },
      {
        t: "Customer Match com base de ex-clientes de cinco anos atrás",
        risco: "medio", papel: "Operadora", arts: "Arts. 6º, V, 10 e 15",
        prob: "Para uma campanha de reativação, o cliente envia a base histórica completa desde 2019, incluindo pessoas que pediram descadastro e clientes de uma marca que foi vendida.",
        risk: "Qualidade dos dados (números reciclados), expectativa do titular enfraquecida pelo tempo, contatos que exerceram oposição e dados de uma empresa que não é mais do cliente. O legítimo interesse fica frágil.",
        evitar: ["Definir janela de reativação (por exemplo, compras nos últimos 24 meses)", "Cruzar com a lista de supressão antes da subida", "Excluir bases de outras empresas ou marcas", "Mensagem com opção clara de opt-out"],
      },
    ],
  },
  {
    titulo: "Captação de leads",
    intro: "Formulários, landing pages e iscas digitais: o ponto em que o dado entra — e em que a base legal nasce ou morre.",
    itens: [
      {
        t: "Lead Ads sem política de privacidade do anunciante",
        risco: "medio", papel: "Operadora", arts: "Arts. 6º, VI, e 9º",
        prob: "O formulário instantâneo do Meta exige o link de uma política de privacidade. O gestor coloca o link da home do cliente ou um link genérico de “política de privacidade modelo”.",
        risk: "O titular não recebe as informações do art. 9º (finalidade, controlador, compartilhamento, direitos). Política genérica que não corresponde à prática é pior do que nenhuma: prova de descuido.",
        evitar: ["Aviso de privacidade real do cliente (Modelo D)", "Texto personalizado no formulário com finalidade e canal de contato", "Checkbox opcional e desmarcado para comunicações de marketing", "Baixar leads e apagar da plataforma conforme retenção definida"],
      },
      {
        t: "Formulário pedindo CPF, data de nascimento e renda “para qualificar”",
        risco: "medio", papel: "Operadora", arts: "Art. 6º, III",
        prob: "O comercial quer “leads mais qualificados”. O formulário passa a pedir CPF, data de nascimento, renda familiar e endereço completo para uma simples solicitação de contato.",
        risk: "Dados excessivos para a finalidade violam o princípio da necessidade. Em vazamento, CPF + data de nascimento facilitam fraudes, o que torna o incidente de risco relevante. A conversão também cai.",
        evitar: ["Teste do uso: cada campo deve ter uso real e imediato", "Qualificar com perguntas de faixa (“investimento mensal”), não com dados pessoais", "Coletar CPF somente no momento da contratação, quando houver obrigação legal ou contrato"],
      },
      {
        t: "E-book grátis condicionado a “receber ofertas de parceiros”",
        risco: "medio", papel: "Operadora", arts: "Arts. 8º, § 4º, e 9º, § 3º",
        prob: "A isca digital só é liberada se o visitante aceitar “receber comunicações da empresa e de parceiros selecionados”. A base depois é compartilhada com outras empresas do grupo.",
        risk: "Consentimento condicionado e genérico não é livre nem específico. Quando o consentimento é exigido como condição para o serviço, o titular deve ser informado com destaque (art. 9º, § 3º). Compartilhar com parceiros exige consentimento específico (art. 7º, § 5º).",
        evitar: ["Entregar o material independentemente da opção de marketing", "Opções separadas: comunicações da empresa × de parceiros", "Nomear os parceiros ou categorias no aviso", "Registrar a versão do texto aceito"],
      },
      {
        t: "Landing page sem aviso de privacidade e sem canal do titular",
        risco: "medio", papel: "Operadora", arts: "Arts. 9º, 18 e 41",
        prob: "A agência publica dezenas de landing pages por mês em ferramentas de LP. Nenhuma tem aviso de privacidade, identificação do controlador ou canal para pedidos de titulares.",
        risk: "Falta de transparência e de livre acesso. Em fiscalização ou ação, a página é a prova da coleta irregular. As plataformas de anúncio também exigem páginas de destino com política de privacidade em vários formatos.",
        evitar: ["Rodapé padrão em todas as LPs com link para o aviso do cliente", "Identificação do controlador (razão social e CNPJ) e canal do encarregado", "Checklist de publicação de LP com item de privacidade", "Vigilância automática das páginas ativas"],
      },
      {
        t: "Quiz que pergunta sobre saúde, religião ou orientação",
        risco: "alto", papel: "Operadora", arts: "Arts. 5º, II, e 11",
        prob: "Um quiz de “descubra o plano ideal” pergunta sobre doenças preexistentes; outro, de uma marca de moda íntima, sobre orientação sexual. As respostas vão para o CRM e alimentam segmentações.",
        risk: "Coleta de dado sensível sem consentimento específico e destacado, armazenado em ferramentas sem controle. Se vazar, risco relevante com comunicação obrigatória à ANPD.",
        evitar: ["Remover perguntas sensíveis que não sejam indispensáveis", "Quando indispensáveis, consentimento específico e destacado antes da pergunta", "Não sincronizar respostas sensíveis com plataformas de anúncio", "Retenção curta e acesso restrito"],
      },
    ],
  },
  {
    titulo: "WhatsApp, CRM e automações",
    intro: "O dado depois da captação: atendimento, integrações e disparos. É onde nascem os incidentes silenciosos.",
    itens: [
      {
        t: "Disparo em massa no WhatsApp para base fria",
        risco: "alto", papel: "Operadora", arts: "Arts. 7º e 8º",
        prob: "O cliente pede um disparo de promoção para 20 mil contatos “que estavam no celular do antigo vendedor”, usando uma ferramenta não oficial de envio.",
        risk: "Sem base legal e sem opt-in, contrariando as políticas do WhatsApp Business, que exigem permissão prévia. Banimento do número, perda do histórico de atendimento e denúncias. Ferramentas não oficiais ainda expõem a sessão do WhatsApp a terceiros.",
        evitar: ["Somente API oficial do WhatsApp Business", "Somente contatos com opt-in registrado", "Opção “SAIR” em toda mensagem de marketing", "Aquecer a base com campanhas de captação de opt-in"],
      },
      {
        t: "Integração enviando leads para o cliente errado",
        risco: "medio", papel: "Operadora", arts: "Arts. 46 e 48",
        prob: "Ao duplicar um cenário no Zapier ou Make para um novo cliente, o gestor esquece de trocar o webhook. Durante duas semanas, leads de uma clínica são entregues no CRM de uma imobiliária.",
        risk: "Incidente de confidencialidade: dados entregues a terceiro não autorizado. Possível dado sensível. Exige comunicação ao controlador e avaliação de risco relevante.",
        evitar: ["Nunca duplicar automações entre clientes sem checklist", "Teste com lead fictício antes de ativar", "Nome do cliente em toda automação e webhook", "Monitoramento de volume: alerta quando um fluxo para ou dispara fora do padrão", "Retenção mínima de logs nas ferramentas de integração"],
      },
      {
        t: "Planilha de leads aberta “para o comercial acompanhar”",
        risco: "alto", papel: "Operadora", arts: "Arts. 46 e 47",
        prob: "A planilha que recebe os leads de todas as campanhas está configurada como “qualquer pessoa com o link pode ver” para facilitar a vida do time do cliente. O link circula em grupos e e-mails.",
        risk: "Exposição de dados a qualquer pessoa que tenha o link, sem log de acesso. Links assim já foram indexados por buscadores e encontrados por terceiros. É incidente em potencial permanente.",
        evitar: ["Compartilhamento sempre nominal (e-mails específicos)", "Preferir CRM com usuários individuais à planilha", "Auditoria mensal de links públicos no Drive", "Expirar acessos de quem não está mais no projeto"],
      },
      {
        t: "SDR terceirizado atendendo leads no celular pessoal",
        risco: "medio", papel: "Operadora", arts: "Arts. 46, 47 e 39",
        prob: "A agência oferece pré-vendas e os SDRs usam WhatsApp pessoal para falar com os leads do cliente. Quando um SDR sai, leva as conversas e os contatos.",
        risk: "Perda de controle sobre os dados, impossibilidade de atender pedidos de exclusão e risco de uso posterior indevido. Quebra da instrução do controlador.",
        evitar: ["Números corporativos em plataforma multiatendente", "Proibição de contato por número pessoal", "Termo de confidencialidade com obrigação de apagar dados na saída", "Offboarding com remoção de acesso em 24 horas"],
      },
      {
        t: "O lead pede para parar e a automação continua",
        risco: "medio", papel: "Operadora", arts: "Arts. 8º, § 5º, e 18, IX",
        prob: "O lead responde “não quero mais receber” no WhatsApp. O atendente lê, mas a cadência automatizada no CRM continua enviando e-mails e mensagens por mais duas semanas.",
        risk: "Descumprimento da revogação do consentimento ou do direito de oposição. Gera reclamação no Procon, na ANPD e nas próprias plataformas.",
        evitar: ["Palavras-chave de saída (SAIR, PARAR, CANCELAR) tratadas automaticamente", "Lista de supressão única por cliente, sincronizada com todos os canais", "Treinar atendentes para registrar o pedido", "Auditoria mensal de opt-outs"],
      },
    ],
  },
  {
    titulo: "Pessoas, acessos e ferramentas",
    intro: "O elo mais frágil da segurança. Quase todo incidente grave em agência começa por um acesso que não deveria existir.",
    itens: [
      {
        t: "Ex-colaborador continua com acesso ao BM do cliente",
        risco: "alto", papel: "Operadora", arts: "Arts. 46 e 47",
        prob: "O analista saiu há três meses. Ninguém removeu o acesso dele ao Gerenciador de Negócios de seis clientes, ao Google Ads e à pasta de bases no Drive.",
        risk: "Acesso não autorizado a públicos, leads de formulários e contas com cartão. Se o perfil dele for invadido, o BM do cliente vai junto.",
        evitar: ["Checklist de offboarding executado no último dia", "Planilha de acessos por pessoa e por cliente", "Revisão trimestral cruzando acessos com a folha", "Acessos sempre pela estrutura da agência (parceiro no BM), não pelo perfil pessoal"],
      },
      {
        t: "Freelancer sem contrato acessando bases",
        risco: "medio", papel: "Suboperador", arts: "Arts. 39 e 46",
        prob: "Um designer e um editor de vídeo freelancers recebem acesso à pasta do cliente “para pegar os criativos” — a mesma pasta onde estão as bases de leads.",
        risk: "Suboperador sem contrato, sem obrigação de sigilo e sem aprovação do controlador. Acesso a dados desnecessários para a função.",
        evitar: ["Contrato com cláusula de proteção de dados e termo de confidencialidade", "Pastas separadas: criativos × dados pessoais", "Freelancers na lista de subprocessadores aprovada pelo cliente", "Acesso com prazo de validade"],
      },
      {
        t: "Base de leads colada no ChatGPT para segmentar",
        risco: "alto", papel: "Operadora", arts: "Arts. 7º, 33 e 46",
        prob: "Para ganhar tempo, o analista cola 3 mil linhas com nome, telefone e respostas do formulário em uma IA generativa, usando conta pessoal gratuita, pedindo para classificar os leads por temperatura.",
        risk: "Compartilhamento com terceiro não aprovado, transferência internacional não mapeada e possível uso do conteúdo para treinamento do modelo. Para o cliente, é vazamento.",
        evitar: ["Política de IA: proibido inserir dados pessoais em ferramentas não aprovadas", "Plano corporativo com dados excluídos do treinamento, na lista de subprocessadores", "Pseudonimizar ou agregar antes de analisar", "Treinar o time com exemplos do que pode e do que não pode"],
      },
      {
        t: "BM invadido por phishing",
        risco: "alto", papel: "Operadora", arts: "Arts. 46 e 48 · Res. 15/2024",
        prob: "O gestor recebe um e-mail “da Meta” avisando que a página do cliente viola direitos autorais e será removida. Clica, faz login e confirma o código. Em minutos, os invasores tomam o BM e sobem anúncios fraudulentos com o cartão do cliente.",
        risk: "Incidente de segurança com acesso a leads, públicos e dados de pagamento. Prejuízo financeiro, suspensão do BM e dano reputacional.",
        evitar: ["Chave de segurança ou autenticador para todos os administradores", "No máximo dois administradores por BM", "Treinamento de phishing com exemplos reais do mercado", "Plano de resposta com contatos e dossiê de recuperação prontos", "Comunicar o cliente no mesmo dia"],
      },
      {
        t: "Senhas dos clientes em planilha e grupo de WhatsApp",
        risco: "alto", papel: "Operadora", arts: "Art. 46",
        prob: "A agência mantém uma planilha “ACESSOS CLIENTES” com logins e senhas de e-mails, hospedagens, CRMs e plataformas — e as senhas também circulam no grupo do time.",
        risk: "Um único vazamento abre todos os clientes. Dados de autenticação são critério de risco relevante na Resolução 15/2024.",
        evitar: ["Gerenciador de senhas corporativo com cofres por cliente", "Preferir acessos delegados (parceiro, usuário próprio) a senhas compartilhadas", "Trocar todas as senhas que já circularam em grupo", "Proibição formal na política interna"],
      },
    ],
  },
  {
    titulo: "Nichos sensíveis",
    intro: "Política, crianças e saúde: os segmentos em que um erro de segmentação vira manchete.",
    itens: [
      {
        t: "Campanha política com lista de eleitores",
        risco: "alto", papel: "Operadora", arts: "Arts. 5º, II, 7º e 11 · Res. TSE 23.610/2019",
        prob: "A pré-campanha de um vereador entrega à agência uma lista de “apoiadores” montada com contatos de associações, igrejas e de um banco de dados comprado, e pede disparos e públicos personalizados.",
        risk: "Opinião política e convicção religiosa são dados sensíveis. A legislação eleitoral veda o uso de cadastros cedidos ou vendidos e exige consentimento para envio de mensagens. O primeiro caso sancionado pela ANPD envolveu justamente oferta de contatos para campanha eleitoral (Cap. 11).",
        evitar: ["Usar apenas contatos captados pela própria campanha, com consentimento", "Nunca usar listas de entidades, igrejas ou bases compradas", "Descadastro em todas as mensagens", "Contrato específico com cláusulas eleitorais e de proteção de dados"],
      },
      {
        t: "Escola e curso livre segmentando adolescentes",
        risco: "alto", papel: "Operadora", arts: "Art. 14 · CDC · Lei 15.211/2025",
        prob: "Um curso de inglês quer anunciar para adolescentes de 13 a 17 anos, com quiz no Instagram e remarketing de quem respondeu.",
        risk: "Dados de adolescentes exigem o melhor interesse. Perfilamento de menores para publicidade é tema de restrição crescente no Brasil e nas próprias plataformas, que limitam a segmentação para menores de idade.",
        evitar: ["Comunicar com os responsáveis, não com o menor", "Não montar públicos de remarketing de menores", "Formulários que identificam o responsável e evitam coletar dados do adolescente", "Revisão jurídica das campanhas para público jovem"],
      },
      {
        t: "Antes e depois com fotos de pacientes",
        risco: "alto", papel: "Operadora", arts: "Arts. 5º, II, 7º e 11",
        prob: "A clínica envia fotos de procedimentos com o rosto dos pacientes para anúncios e pede que a agência use os prints de conversas com elogios nos criativos.",
        risk: "Imagem associada a procedimento revela dado de saúde. Sem autorização específica do paciente, há violação da LGPD e do direito de imagem. Conselhos profissionais da saúde também regulam a publicidade com imagens de pacientes.",
        evitar: ["Termo de autorização de uso de imagem e de dados de saúde, específico por peça", "Verificar as regras do conselho profissional do cliente", "Anonimizar depoimentos e borrar dados em prints", "Arquivar as autorizações junto dos criativos"],
      },
    ],
  },
  {
    titulo: "Contrato, portfólio e encerramento",
    intro: "O ciclo de vida do cliente na agência — do pedido de due diligence até o fim do contrato.",
    itens: [
      {
        t: "Case de sucesso com prints de leads e conversas",
        risco: "medio", papel: "Controladora (sem base)", arts: "Arts. 6º, I, e 7º",
        prob: "Para o post de resultados no LinkedIn e a apresentação comercial, a agência usa prints do CRM com nomes e telefones de leads e de conversas de WhatsApp do cliente.",
        risk: "Uso de dados do cliente para finalidade própria da agência — que vira controladora sem base legal — e quebra de confidencialidade.",
        evitar: ["Cases só com dados agregados (CPL, ROAS, volume)", "Borrar qualquer dado pessoal em prints", "Autorização do cliente para citar a marca", "Revisão de privacidade antes de publicar"],
      },
      {
        t: "Fim do contrato: a agência fica com tudo “por garantia”",
        risco: "medio", papel: "Operadora", arts: "Arts. 15, 16 e 47",
        prob: "O cliente encerra o contrato. A agência mantém as bases no Drive, os públicos na conta da agência, os acessos ao BM e as automações rodando, “caso ele volte”.",
        risk: "Tratamento sem base legal após o término. Se houver incidente com esses dados, a agência responde sozinha. Automações ativas podem continuar coletando leads.",
        evitar: ["Termo de encerramento com devolução e eliminação (Modelo I)", "Checklist de offboarding do cliente", "Transferir ativos (pixel, públicos, contas) para o BM do cliente", "Certificado de eliminação assinado"],
      },
      {
        t: "Cliente grande manda questionário de due diligence",
        risco: "medio", papel: "Operadora", arts: "Arts. 37, 39, 46 e 50",
        prob: "Uma rede varejista, em concorrência com outras três agências, envia um questionário de 60 perguntas sobre privacidade e segurança e pede a minuta de DPA da agência. A agência não tem nada documentado.",
        risk: "Perda da concorrência — ou assinatura de um DPA leonino redigido pelo cliente, com multas e responsabilidades desproporcionais.",
        evitar: ["Ter um kit de privacidade pronto: política interna, RAT, DPA, lista de subprocessadores e plano de incidentes", "Responder com evidências, não com promessas", "Negociar o DPA a partir do seu modelo", "Certificado de privacidade de dados como prova de maturidade"],
      },
      {
        t: "BM suspensa e o cliente pede explicações",
        risco: "alto", papel: "Operadora", arts: "Arts. 6º, X, e 37",
        prob: "O BM do cliente é restringido por “violação das políticas de dados” após uma subida de público. A plataforma pede documentação e o cliente quer saber de quem é a culpa.",
        risk: "Campanhas paradas, faturamento do cliente afetado e disputa sobre responsabilidade. Sem documentação, a agência não consegue provar a origem da base nem a instrução recebida.",
        evitar: ["Dossiê pronto por cliente: procedência das bases, instruções, avisos e consentimentos", "Histórico de subidas de público com data, arquivo e responsável", "Revisão de conformidade antes de cada subida", "Plano de contingência: BM e contas de reserva legítimas"],
      },
    ],
  },
];

let n = 0;
const card = (c) => {
  n++;
  const num = String(n).padStart(2, "0");
  return `<div class="cen"><div class="cen-h"><div class="cen-n">${num}</div><div><h3>${c.t}</h3><div class="chips"><span class="chip l">${R[c.risco]} Risco</span><span class="chip l">Papel: ${c.papel}</span><span class="chip l">${c.arts}</span></div></div></div>
<div class="cen-b"><div><span class="lbl">O problema</span><p>${c.prob}</p></div><div><span class="lbl">O risco</span><p>${c.risk}</p></div>
<div class="full"><span class="lbl">Como evitar</span><ul>${c.evitar.map((e) => `<li>${e}</li>`).join("")}</ul></div></div></div>`;
};

const resumo = grupos.flatMap((g) => g.itens).map((c, i) =>
  `<tr><td class="id">${String(i + 1).padStart(2, "0")}</td><td>${c.t}</td><td class="c"><span class="pr ${c.risco === "alto" ? "b-alto" : c.risco === "medio" ? "b-medio" : "b-baixo"}">${c.risco === "medio" ? "Médio" : c.risco === "alto" ? "Alto" : "Baixo"}</span></td><td>${c.papel}</td></tr>`).join("");

export default `
<div class="page part p2" id="p2">
  <span class="pn">Parte II · Capítulos 10 e 11</span>
  <div class="big">II</div>
  <h1>O dia a dia: cenários e casos reais</h1>
  <p class="desc">Trinta situações que acontecem toda semana em agências de tráfego, com o problema, o risco, o fundamento legal e o passo a passo para evitar — e os casos julgados e sancionados que mostram o que acontece quando dá errado.</p>
  <div class="caps"><span>Públicos</span><span>Pixel e CAPI</span><span>Leads</span><span>WhatsApp</span><span>CRM</span><span>Acessos</span><span>IA</span><span>Nichos sensíveis</span><span>Casos reais</span></div>
</div>
<section data-label="Cap. 10 · Cenários">
  <div class="chap-head" id="c10">
    <span class="num">Capítulo 10</span><span class="big">10</span>
    <h1>30 cenários da agência: problema, risco e como evitar</h1>
    <p>Cada cenário traz o nível de risco, o papel da agência naquela operação e os artigos envolvidos. Use como material de treinamento e como checklist de revisão de processos.</p>
  </div>
  <h2>Panorama dos cenários</h2>
  <table class="tbl"><thead><tr><th style="width:8%">Nº</th><th>Cenário</th><th style="width:12%">Risco</th><th style="width:26%">Papel da agência</th></tr></thead><tbody>${resumo}</tbody></table>
  <div class="box dica"><span class="lbl">Boa prática</span><p>Faça uma reunião mensal de 30 minutos com o time de mídia para revisar dois ou três cenários. Pergunte: “isso acontece aqui?”. As respostas alimentam a matriz de riscos (Cap. 14) e o checklist mestre (Cap. 15).</p></div>
  ${grupos.map((g) => `<h2 class="keep">${g.titulo}</h2><p class="keep" style="color:var(--muted)">${g.intro}</p>${g.itens.map(card).join("\n")}`).join("\n")}
</section>`;
