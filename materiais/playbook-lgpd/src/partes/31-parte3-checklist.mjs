// Capítulo 15 — Checklist mestre: 10 áreas × 12 controles.
// Cada item: [controle, problema que evita, referência, prioridade A/M/B]
const areas = [
  ["G", "Governança", [
    ["Encarregado (DPO) nomeado, interno ou externo, com contato público", "Ninguém responde por titulares, clientes e ANPD", "Art. 41; Res. 18/2024", "A"],
    ["Sócio patrocinador do programa definido formalmente", "Programa sem prioridade nem orçamento", "Art. 50", "M"],
    ["Política de privacidade e segurança interna aprovada", "Cada pessoa age do seu jeito", "Arts. 46 e 50", "A"],
    ["Política de uso de IA generativa publicada", "Dados colados em ferramentas não aprovadas", "Arts. 7º, 33, 46", "A"],
    ["Política de retenção e eliminação definida", "Bases guardadas para sempre", "Arts. 15 e 16", "A"],
    ["Aviso de privacidade da própria agência no site", "Falta de transparência como controladora", "Art. 9º", "M"],
    ["Enquadramento como agente de pequeno porte avaliado", "Usar benefícios sem ter direito (alto risco)", "Res. 2/2022", "M"],
    ["Calendário anual de revisões (acessos, RAT, riscos)", "Adequação que envelhece e se perde", "Art. 50", "M"],
    ["Indicadores do programa reportados à diretoria", "Programa invisível para a gestão", "Art. 50", "B"],
    ["Orçamento anual para privacidade e segurança", "Controles que dependem de boa vontade", "Art. 46", "B"],
    ["Seguro de responsabilidade cibernética avaliado", "Incidente grave sem cobertura financeira", "Boa prática", "B"],
    ["Certificado de privacidade de dados emitido e válido", "Sem prova de maturidade para clientes", "Art. 50", "M"],
  ]],
  ["M", "Mapeamento e registro", [
    ["Inventário de clientes ativos com nicho e nível de risco", "Não saber onde está o risco", "Art. 37", "A"],
    ["Mapa de fluxos de dados por cliente (6 fluxos-padrão)", "Dados circulando sem controle", "Art. 37", "A"],
    ["RAT da agência como operadora, por cliente", "Falta de prestação de contas", "Art. 37", "A"],
    ["RAT da agência como controladora (RH, prospecção, financeiro)", "Ignorar o próprio tratamento", "Art. 37", "A"],
    ["Base legal identificada para cada operação", "Tratamento sem hipótese legal", "Arts. 7º e 11", "A"],
    ["Nichos com dado sensível sinalizados (saúde, religião, política)", "Tratar sensível como comum", "Art. 11", "A"],
    ["Operações com crianças e adolescentes sinalizadas", "Segmentação de menores", "Art. 14", "A"],
    ["Lista de subprocessadores com país e mecanismo de transferência", "Transferência internacional não mapeada", "Arts. 33 a 36", "A"],
    ["LIA documentado para operações com legítimo interesse", "Legítimo interesse sem teste", "Art. 10", "M"],
    ["RIPD para clientes de saúde e perfilamento em larga escala", "Risco alto sem análise", "Art. 38", "M"],
    ["Histórico de subidas de listas (data, arquivo, responsável)", "Não provar origem em suspensão de BM", "Art. 37", "M"],
    ["Revisão do RAT a cada novo cliente e a cada 6 meses", "Registro desatualizado", "Art. 37", "M"],
  ]],
  ["C", "Contratos", [
    ["Cláusulas LGPD em todos os contratos de prestação de serviços", "Papéis e responsabilidades indefinidos", "Art. 39", "A"],
    ["DPA assinado com cada cliente ativo", "Responsabilidade solidária sem limites", "Arts. 39 e 42", "A"],
    ["Cláusula de recusa de instrução ilícita", "Executar ordem ilegal do cliente", "Art. 42, § 1º, I", "A"],
    ["Prazo de comunicação de incidente ao cliente (até 24 h)", "Cliente perder o prazo da ANPD", "Art. 48; Res. 15/2024", "A"],
    ["Autorização do cliente para aceitar termos das plataformas", "Aceite sem poderes", "Boa prática", "M"],
    ["Lista de subprocessadores aprovada pelo cliente", "Suboperador não autorizado", "Art. 39", "M"],
    ["Regras de retenção e eliminação no contrato", "Dados mantidos após o fim", "Arts. 15 e 16", "M"],
    ["Cláusula de auditoria razoável (aviso prévio, escopo)", "Auditorias abusivas ou nenhuma", "Art. 39", "B"],
    ["Contratos com freelancers com cláusula de dados", "Suboperador sem obrigações", "Arts. 39 e 46", "A"],
    ["Contratos de ferramentas revisados (termos de dados)", "Fornecedor que usa dados para si", "Art. 33", "M"],
    ["Limitação de responsabilidade proporcional ao contrato", "Exposição ilimitada", "Boa prática", "M"],
    ["Termo de encerramento padrão para fim de contrato", "Dados órfãos após saída do cliente", "Art. 15", "A"],
  ]],
  ["P", "Pessoas", [
    ["Termo de confidencialidade assinado por todos", "Vazamento por colaborador sem consequência", "Arts. 46 e 47", "A"],
    ["Treinamento de privacidade no onboarding", "Novos colaboradores sem orientação", "Art. 50", "A"],
    ["Treinamento anual de todo o time com registro", "Conhecimento que se perde", "Art. 50", "M"],
    ["Simulação de phishing ao menos semestral", "BM invadido por golpe", "Art. 46", "M"],
    ["Checklist de offboarding executado no último dia", "Ex-colaborador com acesso", "Art. 46", "A"],
    ["Canal interno para reportar incidentes em até 1 hora", "Incidente escondido ou tardio", "Art. 48", "A"],
    ["Proibição de uso de dispositivos pessoais para bases", "Dados fora de controle", "Art. 46", "M"],
    ["Proibição de WhatsApp pessoal no atendimento a leads", "Contatos levados por quem sai", "Art. 46", "M"],
    ["Responsável de privacidade em cada squad", "Encarregado sobrecarregado", "Art. 50", "B"],
    ["Política de mesa limpa e tela bloqueada", "Exposição em ambiente físico", "Art. 46", "B"],
    ["Dados de candidatos e colaboradores tratados com base legal", "Agência irregular como controladora", "Art. 7º", "M"],
    ["Avaliação de privacidade nas metas de liderança", "Cultura que não pega", "Art. 50", "B"],
  ]],
  ["S", "Acessos e segurança", [
    ["2FA ativo em BM, Google, CRM, e-mail e Drive", "Conta invadida por senha vazada", "Art. 46", "A"],
    ["Chave de segurança ou autenticador para administradores de BM", "Phishing de SMS e de código", "Art. 46", "A"],
    ["Acessos nominais, sem logins compartilhados", "Impossível rastrear quem fez o quê", "Art. 46", "A"],
    ["Menor privilégio: papéis mínimos nas plataformas", "Analista com poder de administrador", "Art. 46", "A"],
    ["Máximo de dois administradores por BM", "Superfície de ataque grande", "Art. 46", "M"],
    ["Revisão trimestral de acessos por cliente", "Acessos esquecidos", "Art. 46", "A"],
    ["Gerenciador de senhas corporativo", "Senhas em planilhas e grupos", "Art. 46", "A"],
    ["Pastas por cliente com permissão nominal", "Bases visíveis para todos", "Art. 46", "A"],
    ["Auditoria mensal de links públicos no Drive", "Planilhas abertas na internet", "Art. 46", "A"],
    ["Criptografia de disco nos notebooks", "Furto de equipamento com bases", "Art. 46", "M"],
    ["Backups dos documentos da agência com acesso restrito", "Perda de evidências e contratos", "Art. 46", "B"],
    ["Ativos de cada cliente no BM do próprio cliente", "Restrição em um cliente contamina outros", "Boa prática", "M"],
  ]],
  ["T", "Pixel, cookies e CAPI", [
    ["CMP (banner de consentimento) instalada nos sites dos clientes", "Coleta sem consentimento", "Guia de Cookies ANPD", "A"],
    ["Botão “Rejeitar” com o mesmo destaque de “Aceitar”", "Consentimento viciado", "Art. 8º", "A"],
    ["Tags de marketing disparando só após consentimento", "Pixel antes do aceite", "Arts. 7º e 8º", "A"],
    ["Google Consent Mode v2 configurado", "Sinais de consentimento ausentes", "Políticas Google", "A"],
    ["Estado de consentimento respeitado no server-side/CAPI", "Contornar a recusa pelo servidor", "Art. 6º", "A"],
    ["Parâmetros mínimos na CAPI, com hash", "Envio excessivo de dados", "Art. 6º, III", "M"],
    ["Eventos sem nomes de condição de saúde ou dado sensível", "Dado sensível nas plataformas", "Art. 11", "A"],
    ["URLs sem dados pessoais em parâmetros", "E-mail em logs e analytics", "Art. 46", "M"],
    ["Registro das escolhas de consentimento", "Não provar consentimento", "Art. 8º, § 2º", "M"],
    ["Teste mensal em aba anônima das requisições", "Configuração que quebra sem ninguém ver", "Art. 6º, VIII", "M"],
    ["Documentação da configuração no RAT do cliente", "Falta de prestação de contas", "Art. 37", "B"],
    ["Revisão de tags após cada nova integração ou LP", "Tags órfãs coletando dados", "Art. 6º", "M"],
  ]],
  ["L", "Públicos e listas", [
    ["Instrução documentada do cliente para cada subida", "Não provar que agiu por ordem", "Art. 39", "A"],
    ["Declaração de procedência e base legal da lista", "Lista comprada ou sem origem", "Art. 7º", "A"],
    ["Recusa formal de listas compradas ou raspadas", "Responsabilidade solidária", "Art. 42", "A"],
    ["Minimização das colunas antes da subida", "Dados excessivos nas plataformas", "Art. 6º, III", "A"],
    ["Cruzamento com lista de supressão antes da subida", "Recontatar quem pediu exclusão", "Art. 18", "A"],
    ["Eliminação do arquivo bruto em até 7 dias", "Cópias acumuladas", "Art. 15", "A"],
    ["Bases nunca compartilhadas entre clientes", "Desvio de finalidade", "Art. 6º, I", "A"],
    ["Públicos nomeados com prefixo do cliente", "Uso de público errado", "Boa prática", "B"],
    ["Janela temporal definida para bases de reativação", "Dados antigos e de baixa qualidade", "Art. 6º, V", "M"],
    ["Consentimento específico para listas com dado sensível", "Art. 11 violado", "Art. 11", "A"],
    ["Revisão trimestral de públicos salvos", "Públicos sem finalidade ativa", "Art. 15", "M"],
    ["Autorização registrada para aceite de termos de listas", "Aceite sem poderes", "Boa prática", "M"],
  ]],
  ["F", "Captação de leads", [
    ["Aviso de privacidade real em todas as LPs e formulários", "Falta de transparência", "Art. 9º", "A"],
    ["Identificação do controlador e canal do encarregado no rodapé", "Titular sem canal", "Arts. 9º e 41", "A"],
    ["Campos mínimos nos formulários (teste do uso)", "Coleta excessiva", "Art. 6º, III", "A"],
    ["Checkbox de marketing opcional e desmarcado", "Consentimento inválido", "Art. 8º", "A"],
    ["Consentimento separado para compartilhar com parceiros", "Compartilhamento sem base", "Art. 7º, § 5º", "A"],
    ["Material entregue sem condicionar a ofertas extras", "Consentimento não livre", "Art. 9º, § 3º", "M"],
    ["Perguntas sensíveis removidas ou com consentimento destacado", "Dado sensível sem base", "Art. 11", "A"],
    ["Lead Ads com link para o aviso real do cliente", "Política genérica", "Art. 9º", "A"],
    ["Leads baixados e apagados das plataformas periodicamente", "Dados retidos em plataforma", "Art. 15", "M"],
    ["Versão do texto de consentimento registrada", "Não provar o que foi aceito", "Art. 8º, § 2º", "M"],
    ["Regulamento com aviso de privacidade em sorteios", "Coleta sem informação", "Art. 9º", "M"],
    ["Checklist de publicação de LP com itens de privacidade", "Páginas fora do padrão", "Art. 6º, VIII", "M"],
  ]],
  ["W", "WhatsApp, CRM e automações", [
    ["WhatsApp somente via API oficial", "Banimento e exposição da sessão", "Políticas Meta", "A"],
    ["Disparos somente para contatos com opt-in", "Mensagem sem base legal", "Art. 7º", "A"],
    ["Opção de saída em toda mensagem de marketing", "Revogação dificultada", "Art. 8º, § 5º", "A"],
    ["Palavras de saída tratadas automaticamente", "Opt-out ignorado", "Art. 18, IX", "A"],
    ["Lista de supressão sincronizada entre canais", "Canal que continua enviando", "Art. 18", "A"],
    ["Usuários nominais no CRM com perfis de acesso", "Acesso indiscriminado", "Art. 46", "A"],
    ["Campo de origem e base legal em cada contato", "Não saber de onde veio o lead", "Art. 37", "M"],
    ["Automações nomeadas por cliente e testadas com lead fictício", "Leads para o cliente errado", "Art. 46", "A"],
    ["Retenção mínima de logs em Zapier, Make, n8n", "Dados acumulados em logs", "Art. 15", "M"],
    ["Monitoramento de volume das integrações", "Falha silenciosa", "Art. 6º, VIII", "M"],
    ["Rotina anual de eliminação de leads inativos", "Base inchada e arriscada", "Art. 15", "M"],
    ["Relatórios para o cliente preferencialmente agregados", "Dados nominais circulando", "Art. 6º, III", "B"],
  ]],
  ["I", "Titulares e incidentes", [
    ["Fluxo de atendimento a titulares documentado", "Pedido perdido ou ignorado", "Art. 18", "A"],
    ["Encaminhamento ao cliente em até 2 dias úteis", "Cliente estourar prazo", "Art. 19", "A"],
    ["Confirmação de identidade antes de entregar dados", "Entregar dados a terceiro", "Art. 46", "A"],
    ["Modelos de resposta a titulares aprovados", "Respostas improvisadas", "Art. 18", "M"],
    ["Registro de todos os pedidos de titulares", "Sem prova de atendimento", "Art. 37", "M"],
    ["Plano de resposta a incidentes com responsáveis", "Pânico e decisões erradas", "Arts. 46 e 48", "A"],
    ["Contatos de emergência por cliente atualizados", "Demora para comunicar", "Art. 48", "A"],
    ["Modelo de comunicação de incidente ao cliente", "Comunicação incompleta", "Res. 15/2024", "M"],
    ["Registro de incidentes mantido por 5 anos", "Descumprir a Res. 15/2024", "Res. 15/2024", "A"],
    ["Dossiê de recuperação de BM por cliente", "Campanhas paradas por semanas", "Boa prática", "M"],
    ["Simulação anual de incidente com o time", "Plano que só existe no papel", "Art. 50", "M"],
    ["Análise de causa raiz após cada incidente", "Repetição do mesmo erro", "Art. 6º, VIII", "M"],
  ]],
];

const PR = { A: ['b-alto', 'Alta'], M: ['b-medio', 'Média'], B: ['b-baixo', 'Baixa'] };
let total = 0;
const tabelas = areas.map(([sig, nome, itens]) => {
  const linhas = itens.map((it, i) => {
    total++;
    const [cls, txt] = PR[it[3]];
    return `<tr><td><span class="box-ck"></span></td><td class="id">${sig}${String(i + 1).padStart(2, "0")}</td><td><strong>${it[0]}</strong><br><span style="color:var(--muted);font-size:7.8pt">Evita: ${it[1]}</span></td><td style="font-size:7.6pt;color:var(--muted)">${it[2]}</td><td class="c"><span class="pr ${cls}">${txt}</span></td></tr>`;
  }).join("");
  return `<h3 class="keep">${sig} · ${nome}</h3><table class="tbl check"><thead><tr><th></th><th style="width:9%">ID</th><th>Controle</th><th style="width:19%">Referência</th><th style="width:11%" class="c">Prior.</th></tr></thead><tbody>${linhas}</tbody></table>`;
}).join("\n");

const resumo = areas.map(([sig, nome, itens]) => {
  const c = { A: 0, M: 0, B: 0 };
  itens.forEach((i) => c[i[3]]++);
  return `<tr><td class="id">${sig}</td><td><strong>${nome}</strong></td><td class="c">${itens.length}</td><td class="c">${c.A}</td><td class="c">${c.M}</td><td class="c">${c.B}</td><td class="c">____ / ${itens.length}</td></tr>`;
}).join("");

export default `
<section data-label="Cap. 15 · Checklist mestre">
  <div class="chap-head" id="c15">
    <span class="num">Capítulo 15</span><span class="big">15</span>
    <h1>Checklist mestre: ${total} controles</h1>
    <p>O mapa completo de problemas e soluções. Cada controle diz o que fazer, qual problema evita, qual a referência legal e a prioridade.</p>
  </div>
  <h2>Como aplicar</h2>
  <ol>
    <li>Marque cada item como <strong>implementado</strong>, <strong>parcial</strong> ou <strong>ausente</strong>. Só marque implementado se houver evidência (documento, print, registro).</li>
    <li>Comece pelos itens de prioridade <strong>Alta</strong> — eles cobrem a maioria das sanções, incidentes e suspensões de conta.</li>
    <li>Calcule a aderência por área (implementados ÷ total) e repita a cada trimestre.</li>
    <li>Para cada item ausente de prioridade alta, crie uma tarefa com responsável e prazo de até 30 dias.</li>
  </ol>
  <h2>Painel de aderência</h2>
  <table class="tbl"><thead><tr><th style="width:7%">Área</th><th>Tema</th><th class="c">Itens</th><th class="c">Alta</th><th class="c">Média</th><th class="c">Baixa</th><th class="c">Implementados</th></tr></thead><tbody>${resumo}<tr><td></td><td><strong>Total</strong></td><td class="c"><strong>${total}</strong></td><td class="c" colspan="3"></td><td class="c">____ / ${total}</td></tr></tbody></table>
  <div class="box agencia"><span class="lbl">Na agência</span><p>A plataforma Dattis aplica este checklist automaticamente por cliente, com vigilância diária das páginas e documentos e alertas quando um controle deixa de ser cumprido. No papel, reserve uma tarde por trimestre para a revisão completa.</p></div>
  ${tabelas}
</section>`;
