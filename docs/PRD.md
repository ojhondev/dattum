# Dattum — PRD v2.0

**Consultoria de compliance LGPD + DPO-as-a-Service para agências de marketing digital e de lançamento — que administram dado de milhares de leads em nome dos clientes que atendem.**

- **Versão:** 2.0 — pivô de ICP: de e-commerce direto (v1.0) para agências como cliente principal
- **Data:** Setembro de 2026
- **Status:** Proposta para discussão
- **Modelo de negócio:** diagnóstico de operador → sprint de higienização (10 dias) → assinatura recorrente de "obrigações acessórias" de LGPD, por faixa de contas de cliente geridas
- **Não é:** um serviço de advocacia genérico, nem um selo/certificação, nem uma ferramenta que vende direto pro dono de e-commerce como produto principal (isso agora é canal secundário — Modelo A, §02.2)

### Nota de versão — por que o pivô

A v1.0 mirava o e-commerce diretamente. A validação (§01.3) mostrou três problemas
estruturais nesse ICP: ticket baixo demais frente ao CAC de venda consultiva fria, a
conta "multa vs. assinatura" não fecha para a ponta mais pulverizada (uma microempresa
pode pagar mais por um ano de assinatura do que pagaria numa multa real), e mercado já
com concorrência estabelecida. Agências resolvem os três ao mesmo tempo: multiplicador
de receita por contrato (uma agência = dezenas de contas de cliente), comprador mais
sofisticado, e um gancho jurídico mais forte e menos disputado — responsabilidade
solidária de operador (art. 42), não a obrigação de DPO do controlador (art. 41).

---

## 00 — Resumo executivo

### A obrigação acessória que toda agência de performance tem e não sabe que tem

A **Dattum** vende para agências de marketing digital e de lançamento o que a LGPD já
expõe nelas e que praticamente nenhuma trata: a agência que gerencia CRM, WhatsApp,
tráfego e automação em nome dos clientes dela é **operadora de dados** (art. 5º, VII) —
e a LGPD prevê **responsabilidade solidária** entre operador e controlador (art. 42). Se
a agência reaproveita base entre contas ou mistura CRM/WhatsApp de clientes diferentes,
ela **se equipara ao controlador** e herda a exposição inteira.

O ponto de entrada é um **Diagnóstico de Operador**: uma auditoria técnica de como a
agência lida com dado de lead em nome dos clientes que atende — testando na prática uma
amostra de campanhas/funis públicos que ela roda (motor de diagnóstico, §06, e protocolo
de "mystery lead", `docs/METODOLOGIA-INVESTIGACAO.md`) — e traduz o que encontra em
**risco jurídico quantificado**: artigo da LGPD, natureza da exposição, e o que está em
jogo (multa de até 2% do faturamento do controlador, limitada a R$ 50 milhões por
infração, art. 52 — e responsabilidade solidária da própria agência, art. 42).

Esse diagnóstico tem **timbre e assinatura da própria Dattum** — nunca se apresenta como
comunicação da ANPD. A urgência vem do fato (a exposição existe, é observável na prática
do dia a dia da agência, a lei é real), não de uma falsificação. Decisão de produto e de
risco, registrada na íntegra em §03.

A partir do diagnóstico, a Dattum oferece um **sprint de higienização de 10 dias úteis**
(contrato de operador padrão, mapeamento inicial de sub-processadores, canal do titular
centralizado, protocolo básico de incidente) e propõe a **assinatura recorrente**: os
onze serviços de §09, operando como "obrigações acessórias" de LGPD — pensados para
parecerem, na prática da agência, tão fixos e não-negociáveis quanto a contabilidade.

### O que a plataforma é

- Um **motor de diagnóstico**: varredura de campanhas/funis públicos geridos pela
  agência (pixels, cookies, formulários, canal do titular) + protocolo de "mystery lead"
  para o que só se vê testando o funil na prática (`docs/METODOLOGIA-INVESTIGACAO.md`).
- Um **portal agência → N contas de cliente**: onde a agência e a equipe Dattum
  administram a conformidade de toda a carteira — inventário, contratos de operador,
  canal do titular, incidentes, fornecedores — em um único painel, não um por cliente.
- Uma **ferramenta de prova de conformidade e de venda**: histórico auditável que reduz
  a severidade de eventual sanção (boa-fé e mitigação prévia entram na dosimetria da
  pena, art. 52 §1º) e que a agência pode usar como argumento comercial com os próprios
  clientes dela (selo "Operador Auditado Dattum", §09).

### O que a plataforma NÃO é

| Não é | Por quê / o que faz no lugar |
|---|---|
| **Um escritório de advocacia** | Não representa a agência ou o cliente dela em processo administrativo sancionador. Opera compliance operacional; contencioso é encaminhado a parceiro jurídico externo. |
| **Uma notificação da ANPD** | O diagnóstico é um documento privado, assinado e identificado como Dattum. Nunca imita selo, timbre ou linguagem de comunicação oficial de órgão público — ver §03. |
| **A obrigação de DPO do controlador, transplantada sem ajuste** | A agência normalmente é operadora, não controladora (§01). Vender "você precisa de um DPO" pra agência do mesmo jeito que pra um e-commerce é impreciso — ver §10. |
| **Um produto pensado primeiro pro e-commerce** | O e-commerce/infoprodutor continua endereçável, mas como cliente final repassado pela agência (Modelo A, §02.2) — não é mais o comprador direto principal (era o desenho da v1.0). |

---

## 01 — Tese: agência é operadora em escala, e quase nenhuma trata isso como obrigação

### 01.1 O que a agência realmente faz com dado de terceiro

Agência de performance/lançamento roda CRM, WhatsApp Business API, automação (RD
Station, ActiveCampaign) e tráfego pago (Meta, Google, TikTok) **em nome de vários
clientes ao mesmo tempo**. Na maioria dos casos, o cliente final é o **controlador**
(decide a finalidade do tratamento) e a agência é a **operadora** (executa o
tratamento) — art. 5º, VII. Isso é regra, não exceção, do setor.

### 01.2 O gancho jurídico: responsabilidade solidária, não obrigação de DPO

A LGPD (art. 42) prevê que controlador e operador respondem **solidariamente** pelo
dano — o titular pode acionar qualquer um dos dois. E, mais grave para a agência: **se
ela agir fora das instruções do cliente** (reaproveitar lista de leads entre contas,
misturar CRM/WhatsApp de clientes diferentes, usar dado pra remarketing próprio), ela
**se equipara ao controlador** e herda a exposição inteira — inclusive a obrigação do
art. 41, que originalmente seria do cliente dela.

Esse gancho já tem sinal de mercado: existe tese acadêmica específica sobre violação da
LGPD por agências de marketing digital (PUC Goiás) e conteúdo já publicado tratando
exatamente do cruzamento "LGPD + agência de marketing + agência de lançamento".

### 01.3 Por que não foi o e-commerce direto (aprendizado da v1.0)

Validação de mercado (dados de setembro de 2026) mostrou três problemas no ICP
original:

- **A conta não fecha na ponta pequena.** Um caso real documentado: multa de R$7.200 +
  advertência por falta de encarregado numa microempresa, R$14.400 no total — **menos**
  do que um ano do plano Essencial da v1.0 (R$690/mês) somado ao setup. Um lojista
  cético faz essa conta.
- **Fiscalização de pequena empresa ainda é rara em termos absolutos.** 19 processos
  abertos num mês (recorde histórico da ANPD, junho de 2026) é pouco diante de
  600 mil a 2,2 milhões de lojas virtuais ativas no Brasil — a probabilidade individual
  de uma loja específica ser fiscalizada no curto prazo é baixa, o que enfraquece a
  urgência ponto a ponto.
- **CAC alto para ticket baixo.** Venda consultiva fria pra um lojista solo, com
  contrato de poucas centenas de reais/mês, tem economia de unidade apertada.

Agências resolvem os três: multiplicador de receita real (uma venda = dezenas de contas
de cliente sob o mesmo contrato), comprador profissional que entende risco e contrato
(CAC mais eficiente), e um gancho jurídico (art. 42) que não depende da probabilidade de
fiscalização de uma loja específica — a exposição da agência existe assim que ela erra
a prática, fiscalizada ou não.

### 01.4 O tamanho do mercado de agências

- **180 mil+ agências de marketing e comunicação no Brasil**, 91,3% com atuação digital.
- Distribuição por porte: 78,3% microempresa, 14,8% pequena, 1,2% média, 5,7% grande —
  as **50 maiores respondem por ~40% do faturamento total** do setor. O segmento
  endereçável real (pequena/média/grande) é da ordem de **35–40 mil agências**.
- Investimento em publicidade digital no Brasil: **R$42,7 bilhões em 2025** (+12,7%
  a/a) — mercado em crescimento, ao contrário do e-commerce (que teve a primeira queda
  em número de lojas ativas em mais de uma década no mesmo período).

### 01.5 A aposta da Dattum

Fazer a Dattum parecer, para a agência, o que a contabilidade já é: uma obrigação
acessória fixa, recorrente, de baixo custo relativo e alto custo de ausência — sem
depender de a agência acreditar que "vai ser fiscalizada amanhã". O argumento de venda é
estrutural (responsabilidade solidária existe assim que ela opera dado de terceiro), não
probabilístico (chance de fiscalização).

---

## 02 — Modelo de negócio: as três fases (adaptadas à agência)

| Fase | O que é | Duração | Objetivo comercial |
|---|---|---|---|
| **1. Diagnóstico de Operador** | Auditoria de como a agência trata dado de lead em nome dos clientes — motor de varredura sobre campanhas/funis públicos + protocolo de "mystery lead" quando aplicável | Diagnóstico automatizado, minutos a horas; mystery lead, semanas quando usado (§06, `docs/METODOLOGIA-INVESTIGACAO.md`) | Gerar o lead qualificado e a reunião comercial |
| **2. Sprint de Higienização** | Contrato de operador padrão, mapeamento inicial de sub-processadores, canal do titular centralizado, protocolo básico de incidente (serviços 1, 2, 3, 4 de §09) | 10 dias úteis | Entregar valor rápido, provar execução, criar confiança para a recorrência |
| **3. Assinatura de Obrigações Acessórias** | Os onze serviços de §09 operando continuamente, por faixa de contas de cliente geridas | Assinatura mensal, contrato mínimo sugerido de 12 meses | Receita recorrente (MRR) |

A fase 2 **não fecha o caso** — resolve o que é rápido e visível para provar execução.
Mapeamento completo de sub-processadores por conta, treinamento anual, auditoria
contínua e due diligence de onboarding (serviços 5–9, 11) só são sustentáveis dentro da
assinatura — o que justifica a fase 3 para a própria agência, não só para a Dattum.

### 02.1 O que muda de verdade em relação à v1.0

A agência não "precisa de um DPO" no mesmo sentido do art. 41 (essa é obrigação do
cliente final, controlador). O discurso correto é **higiene de operador em escala +
risco de equiparação ao controlador** — nunca a obrigação de DPO transplantada sem
ajuste. Exagerar isso é o mesmo erro, em espírito, da notificação falsa (§03) — mina a
credibilidade técnica que é o diferencial da Dattum (ver §10).

### 02.2 Modelo A — E-commerce/infoprodutor como canal secundário

O produto original da v1.0 (Diagnóstico → Sprint de Regularização → DPO Recorrente,
vendido direto ao e-commerce ou infoprodutor) não foi descartado — foi **rebaixado a
canal de distribuição**. A agência apresenta seus clientes finais (e-commerces,
infoprodutores, operações de lançamento) para a Dattum; a Dattum fecha direto com o
cliente final, a agência recebe comissão (serviço 10, §09). Isso resolve o CAC do
produto direto ao consumidor sem exigir que ele seja o produto principal: a agência já
tem a confiança e o relacionamento comercial que o outbound frio da v1.0 tinha que
construir do zero.

Os detalhes desse produto (preço por faixa de faturamento, sprint de 10 dias,
onze faixas de assinatura) estão preservados no **Anexo A** (§19) para referência —
continuam válidos operacionalmente, só que como produto do cliente final repassado, não
como o principal motor de aquisição da empresa.

---

## 03 — Posicionamento, tom e a decisão sobre o mecanismo de urgência

### Tom de voz

Técnico-jurídico, sóbrio, sem "marketing de agência" — irônico dado que agora o próprio
comprador é uma agência, o que exige ainda mais precisão: esse comprador reconhece
discurso vazio de venda mais rápido que um lojista solo. Referências diretas a artigos
de lei, ao art. 42 especificamente, e a casos reais e publicados sobre LGPD e marketing
digital.

### Decisão registrada: o diagnóstico NUNCA imita a ANPD

A ideia original de produto usava um "modelo de notificação da ANPD" para criar
urgência artificial. Essa abordagem foi **descartada deliberadamente** pelos seguintes
motivos, e a decisão abaixo é vinculante para qualquer implementação futura da Dattum,
independente do ICP:

1. **Risco penal.** Documento formatado para parecer comunicação oficial de órgão
   público pode configurar uso indevido de identidade/falsa identidade (arts. 296 e 307
   do Código Penal) e, se o destinatário fechar contrato por acreditar que a notificação
   é real, estelionato (art. 171 CP).
2. **Risco cível/concorrencial.** Prática comercial enganosa (CDC art. 37, aplicável por
   analogia/precedente mesmo em relação B2B) e concorrência desleal (Lei 9.279/96, art.
   195).
3. **Risco para a própria Dattum perante a ANPD.** A autarquia real pode abrir processo
   contra a Dattum por uso indevido do seu nome — inaceitável para uma empresa que vende
   exatamente compliance regulatório.
4. **Risco de modelo de negócio.** A assinatura é uma relação de confiança de longo
   prazo. Um primeiro contato baseado em engano tende a gerar rescisão (ou processo)
   assim que o cliente perceber — o oposto do que sustenta MRR.

### O que substitui a notificação falsa

O **Diagnóstico de Operador**, sempre:

- Assinado e identificado como documento da **Dattum** (razão social, CNPJ, contato),
  nunca com símbolos, brasão ou papel timbrado que remetam a órgão público.
- Estruturado como **relatório técnico**: o que foi encontrado (fato verificável — na
  campanha pública ou no teste de mystery lead), o artigo da LGPD correspondente, a
  classificação de risco, e a ação recomendada.
- Contém, de forma explícita, uma linha de identificação — ver citação abaixo — que dá
  credibilidade ao relatório como trabalho sério, não só proteção jurídica.
- Cita, quando relevante, **casos públicos reais** de fiscalização/sanção da ANPD e a
  tese acadêmica/conteúdo já existente sobre LGPD e agências de marketing — prova de que
  o risco é setorial e ativo, fato, não ameaça fabricada.

> *"Este é um relatório técnico independente elaborado pela Dattum Consultoria em
> Proteção de Dados. Não constitui notificação, autuação ou comunicação oficial da
> Autoridade Nacional de Proteção de Dados (ANPD)."*

---

## 04 — Personas / ICP

| Persona | Quem | O que precisa da Dattum |
|---|---|---|
| **Dono/sócio da agência (comprador principal)** | Agência pequena/média/grande (§01.4), 11+ contas de cliente ativas, sem time jurídico interno dedicado a dados | Entender a exposição em termos de responsabilidade solidária e risco de equiparação ao controlador; resolver sem virar especialista em LGPD |
| **Gestor de tráfego / mídia** | Quem configura pixel, formulário, automação por conta | Saber o que pode/não pode fazer entre contas sem gerar risco cruzado; modelo de contrato próprio (serviço 11, §09) |
| **CS / atendimento** | Quem recebe pedido de exclusão de lead no WhatsApp/e-mail da campanha | Canal centralizado pra resolver sem virar bagunça ou vergonha com o cliente final |
| **Cliente final da agência (e-commerce, infoprodutor, lançamento)** | Controlador dos dados dos próprios leads | Atendido via Modelo A (§02.2) — repassado pela agência, não abordado direto como prioridade |
| **Analista de compliance Dattum** | Time interno, opera o portal para múltiplas agências | Ver todas as agências da carteira, prazos, pendências, riscos por conta dentro de cada agência |
| **DPO responsável Dattum** | Encarregado formalmente designado (quando aplicável — agência ou cliente final via Modelo A) | Assinar respostas a titulares e à ANPD, supervisionar o time, decidir escalonamento de incidentes |
| **Comercial Dattum** | Time que prospecta e fecha agências | Gerar e enviar diagnósticos de operador em escala, conduzir a conversa de descoberta (`docs/METODOLOGIA-INVESTIGACAO.md`) |

---

## 05 — Jornada do cliente / funil comercial

```
Prospecção (lista de agências-alvo, segmentadas por nº de contas geridas)
        │
        ▼
Diagnóstico de Operador (motor de varredura sobre campanhas públicas da agência +
mystery lead quando aplicável)
        │
        ▼
Relatório técnico-jurídico gerado (achados + artigo da LGPD + exposição de operador)
        │
        ▼
Mensagem de descoberta (perguntas abertas sobre prática atual, sem pitch —
`docs/METODOLOGIA-INVESTIGACAO.md`)
        │
        ▼
Reunião de apresentação do diagnóstico (comercial + apoio técnico)
        │
        ├─── Não converte → nutrição periódica (reenvio de diagnóstico atualizado)
        │
        ▼
Proposta: Sprint de Higienização (10 dias) + assinatura por faixa de contas (§13)
        │
        ▼
Onboarding: mapeamento das contas de cliente ativas + inventário inicial
        │
        ▼
Sprint de 10 dias (contrato de operador padrão, mapeamento inicial, canal do titular)
        │
        ▼
Ativação da assinatura: portal agência → N contas liberado
        │
        ▼
Operação recorrente (os onze serviços de §09 + Modelo A ativo para clientes finais
repassados)
```

---

## 06 — Motor de diagnóstico (varredura automatizada + mystery lead)

### 06.1 Camada 1 — reconhecimento público

O que roda **sem acesso interno à agência** — sobre uma amostra de campanhas/funis
públicos que a agência gerencia (landing pages, formulários de captura visíveis):

- **Rastreadores e consentimento:** cookies e pixels de terceiros (Meta, TikTok, Google)
  disparando antes de consentimento; ausência de banner; banner sem opção real de
  recusa (dark pattern).
- **Canal do titular:** existência de meio funcional para exercer os direitos do art.
  18 nas campanhas observadas.
- **Formulários:** dado sensível ou excessivo coletado sem finalidade aparente.
- **Terceiros embutidos:** apps de automação/chat que tipicamente retransmitem dado sem
  cláusula contratual visível — sinal de ausência de contrato de operador.

### 06.2 Camada 2 — "mystery lead" (protocolo completo)

Ver `docs/METODOLOGIA-INVESTIGACAO.md` para o protocolo integral (persona de teste,
infraestrutura, janela de observação, limites éticos vinculantes). Resumo: a Dattum
entra no funil de uma campanha pública da agência como lead de teste, observa o que
acontece com esse dado (frequência de disparo, funcionamento real do descadastro,
sinais de compartilhamento de base entre clientes) e documenta com timestamp. Regra
vinculante: persona pode ser fictícia, mas e-mail/telefone são sempre da própria Dattum
— nunca CPF ou identidade de pessoa real de terceiro.

Saída (ambas as camadas): **score de risco** (0–100) + lista de achados classificados
por severidade + artigo da LGPD correspondente + exposição estimada (multa possível do
cliente final via art. 52, e exposição de operador da agência via art. 42).

---

## 07 — Relatório técnico-jurídico (geração)

- Gerado a partir da saída do motor de diagnóstico (ambas as camadas) + template
  jurídico mantido/revisado por profissional habilitado.
- Estrutura: capa (identificação Dattum, CNPJ, data), resumo executivo do risco de
  operador, achados detalhados (fato → artigo → risco), linha de esclarecimento (§03), e
  proposta clara de próximo passo (agendar o sprint de 10 dias).
- Exportável em PDF, com identidade visual própria da Dattum (§11).
- Toda geração fica registrada no portal interno — histórico de diagnósticos enviados
  por agência-alvo, auditável e reenviável.

---

## 08 — Portal de operação (agência → N contas de cliente)

O desenho central da plataforma. Diferente da v1.0 (portal por cliente único), a
unidade de trabalho aqui é **uma agência administrando conformidade através de todas as
contas de cliente que gerencia**, em um único painel.

### 8.1 Mapa de contas

- Lista de contas de cliente ativas da agência, cada uma com seu próprio mini-inventário
  (finalidade do tratamento, ferramentas usadas, status de contrato de operador).
- Onboarding de conta nova aciona automaticamente o checklist de due diligence
  (serviço 8, §09).

### 8.2 Contratos de operador (DPA) por conta

- Template único, preenchido automaticamente por conta nova — serviço 1, §09.
- Versionamento e histórico, mesma lógica de política de privacidade da v1.0 (§19.2).

### 8.3 Canal do titular centralizado

- Uma única caixa de entrada que roteia pedido de exclusão/acesso para a conta
  (cliente final) correta — serviço 4, §09.
- Prazo de resposta rastreado por solicitação, alerta antes do vencimento.

### 8.4 Gestão de incidentes multicliente

- Playbook único da agência (não um por cliente) — serviço 3, §09.
- Quando um incidente afeta múltiplas contas ao mesmo tempo (ex.: vazamento de CRM
  compartilhado), o portal já mostra o raio de impacto entre clientes.

### 8.5 Mapeamento de sub-processadores por conta

- Inventário de SaaS (Meta, RD Station, WhatsApp API, Zapier) que toca o dado de cada
  conta — serviço 2, §09.
- Alerta quando ferramenta nova é conectada sem cláusula contratual mapeada.

### 8.6 Auditoria contínua

- Reexecução periódica do motor de diagnóstico (§06.1) sobre as campanhas ativas da
  agência — serviço 5, §09.
- Score de conformidade histórico por conta e agregado da agência.

### 8.7 Treinamento e modelo de contrato de colaborador

- Trilha curta para a equipe da agência (gestor de tráfego, CS) — serviço 7, §09.
- Modelo de contrato de trabalho/PJ com cláusula de confidencialidade e uso de dado
  pessoal para quem acessa CRM/WhatsApp/base de leads — serviço 11, §09.

### 8.8 Relatório mensal — "Painel de Risco por Conta"

- Score atual por conta e agregado, o que mudou no mês, pendências abertas — serviço 6,
  §09. Equivalente ao fechamento contábil mensal: justifica a fatura recorrente mesmo
  sem incidente.

### 8.9 Selo "Operador Auditado Dattum"

- Selo/badge que a agência usa em pitch comercial com os próprios clientes — serviço 9,
  §09. Custo de entrega zero; transforma compliance em argumento de venda da agência.

---

## 09 — Os onze serviços: pensados como "obrigações acessórias" de LGPD

O modelo mental é contabilidade por assinatura: pouco trabalho sob medida por cliente,
entrega mecânica e recorrente, fatura mensal com motivo concreto de existir — nunca um
projeto de consultoria sob encomenda.

| # | Serviço | Por que é enxuto e replicável | Onde vive no portal |
|---|---|---|---|
| 1 | **Contrato de Operador (DPA) padronizado, por cliente novo** | Template único, preenchido automaticamente a cada conta nova | §8.2 |
| 2 | **Mapeamento de sub-processadores por conta** | Questionário estruturado + auditoria automatizada da stack; atualiza sozinho | §8.5 |
| 3 | **Protocolo de resposta a incidente multicliente** | Um playbook único da agência — "se vazar, faça X, avise Y, em Z horas" | §8.4 |
| 4 | **Canal do titular centralizado** | Infra única, reaproveitada por toda a carteira da agência | §8.3 |
| 5 | **Auditoria trimestral (ou mais frequente) de pixel/consentimento por conta** | O motor de diagnóstico (§06.1) já existente, rodando sobre as contas da agência | §8.6 |
| 6 | **Relatório mensal consolidado — "Painel de Risco por Conta"** | Equivalente ao fechamento contábil mensal | §8.8 |
| 7 | **Treinamento anual da equipe** | Trilha gravada, não consultoria ao vivo — replicável sem custo marginal | §8.7 |
| 8 | **Due diligence de onboarding de cliente novo** | Checklist fixo aplicado a cada fechamento de cliente da agência | §8.1 |
| 9 | **Selo "Operador Auditado Dattum"** | Custo de entrega zero — a agência usa como argumento comercial dela própria | §8.9 |
| 10 | **Repasse/indicação do produto para o cliente final (Modelo A)** | A agência indica, a Dattum fecha direto com o cliente final — comissão, sem trabalho extra | §02.2 |
| 11 | **Modelo de contrato para colaborador da agência** (gestor de tráfego, mídia, CS) | Cláusulas padrão de confidencialidade e uso de dado no contrato de trabalho/PJ — reduz risco de vazamento por ex-funcionário | §8.7 |

---

## 10 — Papel da Dattum: higiene de operador, não DPO transplantado

- A agência normalmente **não** precisa de um encarregado no sentido do art. 41 — essa
  obrigação, quando existe, é do cliente final (controlador). O papel da Dattum junto à
  agência é de **higiene de operador**: contrato correto, mapeamento de
  sub-processadores, protocolo de incidente, canal do titular — não a nomeação formal de
  um DPO da agência (que só se aplica se a agência for, ela mesma, controladora de uma
  base própria relevante — ex.: sua própria captação de leads institucionais).
- Para o **cliente final** repassado via Modelo A (e-commerce/infoprodutor), a base
  legal e o papel de encarregado formal seguem exatamente o desenho da v1.0 (art. 41,
  Resolução CD/ANPD nº 2/2022) — ver Anexo A, §19.
- **Regra de precisão** (vinculante, mesmo espírito do §03): o material comercial nunca
  afirma que "toda agência precisa de um DPO" — isso seria o mesmo exagero legal que a
  notificação falsa, na direção oposta. O argumento correto é responsabilidade solidária
  e risco de equiparação ao controlador (§01.2), não a obrigação de DPO em si.
- O contrato de prestação de serviço formaliza o escopo de higiene de operador com a
  agência, e — separadamente, quando aplicável via Modelo A — a nomeação da Dattum como
  encarregado do cliente final.

---

## 11 — Design system e identidade visual

- Identidade **própria, sóbria, jurídico-corporativa** — o oposto visual de qualquer
  coisa que lembre um órgão público ou um documento oficial. Paleta e tipografia devem
  comunicar "escritório de compliance sério", não "agência de growth" — irônico dado que
  o comprador agora é uma agência, mas o objetivo é exatamente diferenciar-se
  visualmente do próprio mercado do comprador.
- Paleta: base neutra escura (grafite/azul-marinho profundo) + destaque sóbrio (dourado
  envelhecido ou verde-escuro) + branco para documentos.
- Tipografia: serifada/semi-serifada para títulos, sans-serif neutra para corpo.
- Todo relatório e tela do portal carregam o CNPJ da Dattum e a linha de identificação
  de §03 — nunca ambíguo sobre quem está falando.
- Consultar a skill `dataviz` antes de montar o gráfico de score por conta/agregado.

---

## 12 — Stack e arquitetura técnica (proposta)

Alinhada ao `dev.md` (ajustar conforme necessidade):

| Camada | Escolha |
|---|---|
| Framework | Next.js (App Router, Server Actions) + TypeScript |
| UI | Tailwind + Lucide + Recharts (score por conta e agregado, gráficos de risco) |
| Dados | Postgres (Neon) + Drizzle ORM |
| Motor de diagnóstico | Worker que analisa HTML/rede pública de campanhas-alvo: pixels/cookies, canal do titular, TLS — sem autenticação nem acesso interno |
| Geração de documento | Template engine → PDF (relatório de diagnóstico, contratos de operador) |
| Auth | Cookie de sessão própria + scrypt; RBAC: admin Dattum, analista, DPO responsável, agência admin, agência operador |
| Multi-tenant | Isolamento lógico por `agencia_id` **e** por `conta_cliente_id` dentro da agência — hierarquia de dois níveis, diferente da v1.0 (só `cliente_id`) |
| Fila/jobs | Reexecução periódica do diagnóstico por conta, relatório mensal consolidado, alertas de prazo de resposta |
| Deploy | Vercel + GitHub, pipeline padrão do `dev.md` (`vercel git connect` explícito) |
| LGPD interna | Criptografia de PII em repouso, retenção configurável — a Dattum aplica a si mesma o padrão que vende |

**Regras de arquitetura:**

1. Nenhuma tabela sem `agencia_id`. Dado de conta de cliente sempre também com
   `conta_cliente_id`, isolado logicamente dos dados de outras contas da mesma agência.
2. O motor de diagnóstico nunca acessa sistemas internos do prospect — só o
   publicamente observável (campanhas, funis). Mystery lead segue protocolo separado
   (`docs/METODOLOGIA-INVESTIGACAO.md`), nunca automatizado sem revisão humana.
3. Toda integração mockada primeiro no formato da API real (metodologia `dev.md`).

---

## 13 — Precificação por faixa de contas geridas

Faturamento da agência **não é** o eixo de precificação — o que determina complexidade
e exposição é o **número de contas de clientes ativas geridas pela agência**, do mesmo
jeito que a contabilidade cobra por volume de notas/funcionários, não por "quão
importante" é o cliente.

### 13.1 Faixas de assinatura

| Plano | Contas de clientes ativas | Mensalidade | Auditoria (§8.6) | SLA canal do titular | Suporte |
|---|---|---|---|---|---|
| **Start** | até 10 contas | A definir (§17) | Trimestral | 15 dias úteis | E-mail + chat |
| **Growth** | 11–30 contas | A definir (§17) | Mensal | 10 dias úteis | Prioritário |
| **Scale** | 31–100 contas | A definir (§17) | Semanal | 5 dias úteis | Gestor de conta dedicado |
| **Enterprise** | 100+ contas | Sob consulta | Contínua + alertas | Definido em contrato | DPO dedicado + integração customizada |

Valores por faixa: **decisão em aberto (§17)** — a definir com as conversas de
descoberta em andamento (`docs/METODOLOGIA-INVESTIGACAO.md`), antes de fechar preço.

- **Desconto de 15%** no plano anual.
- **Contrato mínimo sugerido de 12 meses** — coerente com o fato de que a higiene de
  operador não é algo que se ativa e desativa sem deixar a agência exposta no meio do
  caminho.
- **Offboarding com aviso de 30 dias.**

### 13.2 Sprint de Higienização (setup)

Taxa única, valor a definir por faixa (mesma lógica de crédito da v1.0: 50% abatido na
primeira mensalidade se a agência fechar o plano anual junto — ver Anexo A, §19.3, para
os valores de referência praticados no produto de e-commerce direto, usados como
âncora inicial até validação própria).

---

## 14 — MVP e roadmap

### 14.1 MVP (valida: "o diagnóstico de operador gera reunião com agência, e a reunião fecha assinatura?")

**Dentro:**

- Motor de diagnóstico Camada 1 (§06.1) rodando sobre uma amostra de campanhas públicas
  de agências-alvo.
- Protocolo de mystery lead (§06.2) aplicado manualmente a um número pequeno de contas
  prioritárias — não automatizado no MVP.
- Geração de relatório em PDF com identidade Dattum (§07/§11).
- CRM simples de prospecção de agências (lista de agências-alvo, status do diagnóstico,
  status comercial).
- Portal agência → N contas, versão inicial: mapa de contas (§8.1), contrato de
  operador padrão (§8.2), canal do titular básico (§8.3).
- Relatório mensal consolidado, mesmo que simplificado (§8.8).

**Fora do MVP:** auditoria contínua automatizada (§8.6), gestão completa de incidentes
multicliente (§8.4), trilha de treinamento (§8.7), mapeamento automatizado de
sub-processadores (§8.5), Modelo A operando em escala (§02.2 — validar primeiro a venda
para agência antes de escalar o canal de repasse).

### 14.2 Roadmap

**Fase 1 — MVP:** o que está acima. Piloto com 3–5 agências (as conversas de descoberta
já em andamento via `docs/METODOLOGIA-INVESTIGACAO.md` alimentam essa fase).

**Fase 2 — Portal completo:** auditoria contínua automatizada, gestão de incidentes
multicliente, mapeamento de sub-processadores, treinamento.

**Fase 3 — Modelo A em escala:** repasse de clientes finais das agências assinantes
para o produto de e-commerce/infoprodutor direto (Anexo A, §19), com comissão
estruturada.

**Fase 4 — Inteligência:** benchmarking de risco por segmento de agência, alertas
preditivos de mudança regulatória aplicados a toda a carteira de contas de uma vez.

---

## 15 — Métricas de sucesso

| Dimensão | KPIs |
|---|---|
| **Aquisição** | Diagnósticos de operador enviados/mês; taxa diagnóstico → reunião; taxa reunião → contrato fechado |
| **Execução do Sprint** | % de sprints entregues dentro dos 10 dias úteis; NPS pós-sprint |
| **Recorrência** | MRR; ARPU por faixa de agência; churn mensal; tempo médio de contrato ativo |
| **Multiplicador** | Nº médio de contas de cliente por agência assinante; nº de clientes finais repassados via Modelo A |
| **Operação de compliance** | Tempo médio de resposta a solicitação vs. prazo interno; incidentes tratados; % de contas com contrato de operador válido |
| **Prova de valor** | Score de conformidade médio por agência ao longo do tempo |
| **Risco/reputação Dattum** | Zero notificações por prática comercial enganosa; zero uso de linguagem que imite órgão público em qualquer material |

---

## 16 — Riscos e mitigações

| Risco | Por quê | Mitigação |
|---|---|---|
| **Diagnóstico percebido como spam/ameaça** | Outbound frio com conteúdo de risco pode ser mal recebido mesmo sendo factual | Tom técnico, sem apelo emocional; sempre identificado; mensagem de descoberta antes de pitch (`docs/METODOLOGIA-INVESTIGACAO.md`) |
| **Reincidência do mecanismo de notificação falsa** | Pressão comercial por conversão mais rápida pode reintroduzir a tática descartada em §03 | Regra de produto vinculante (§03); revisão de todo material de outbound antes de uso em escala |
| **Exagero do gancho jurídico (toda agência "precisa de DPO")** | Simplifica a venda, mas é factualmente impreciso — a obrigação de DPO normalmente é do cliente final, não da agência | Precisão jurídica obrigatória no relatório e no discurso comercial (§10) |
| **Mystery lead mal executado** | Se a persona de teste usar dado de pessoa real ou avançar até pagamento, cria risco jurídico novo | Protocolo vinculante em `docs/METODOLOGIA-INVESTIGACAO.md`, revisão antes de qualquer execução em escala |
| **Complexidade de multi-tenant de dois níveis** | Isolamento agência → conta de cliente é mais complexo que o `cliente_id` único da v1.0 | Regra de arquitetura não-negociável (§12); testes automatizados de isolamento antes de qualquer feature nova |
| **Modelo A não escala como esperado** | O repasse de clientes finais depende de agências assinantes ativamente indicarem | Não é a fonte principal de receita — MRR da assinatura (§13) já se sustenta sem o Modelo A funcionar |
| **A própria Dattum como alvo de fiscalização** | Trata dado pessoal de agências, contas de clientes das agências, e de prospects (nos diagnósticos) | Aplicar internamente o mesmo padrão vendido (§12); minimizar dado coletado na prospecção |

---

## 17 — Decisões em aberto

1. **Preço por faixa da assinatura (§13.1)** — valores Start/Growth/Scale ainda não
   definidos; depende de validação por conversas de descoberta com agências reais antes
   de formalizar (`docs/METODOLOGIA-INVESTIGACAO.md`).
2. **Valor do Sprint de Higienização (§13.2)** — se ancora nos valores do produto de
   e-commerce direto (Anexo A) ou é recalculado do zero para o escopo de operador.
3. **Volume e forma da prospecção outbound** — lista de agências (checar legalidade da
   fonte) vs. inbound via conteúdo técnico-jurídico como canal primário.
4. **Automação do mystery lead** — permanece manual/semi-manual por quanto tempo antes
   de justificar investimento em automação parcial.
5. **Parceria jurídica externa** para eventual contencioso/processo administrativo
   sancionador — parceiro fixo ou indicação caso a caso.
6. **Ritmo de escala do Modelo A (§02.2/§14.2, Fase 3)** — quando começar a empurrar
   repasse de clientes finais versus focar 100% em fechar mais agências primeiro.

---

## 18 — Princípios de produto

- **Urgência real, nunca fabricada.** Todo achado do diagnóstico é verificável; toda
  citação legal é precisa; a Dattum nunca se apresenta como órgão público.
- **O gancho é estrutural, não probabilístico.** Responsabilidade solidária existe assim
  que a agência opera dado de terceiro — não depende de "vai ser fiscalizada ou não".
- **Compliance é operação contínua, não projeto de uma vez.** O produto existe para
  sustentar recorrência, não para vender um relatório e sumir.
- **Precisão jurídica é o diferencial.** Vender "DPO obrigatório" pra quem é operador,
  não controlador, é o mesmo erro, em espírito, do documento falso.
- **O portal reduz trabalho manual repetitivo**, para que o tempo humano do time Dattum
  vá para decisão (incidente, resposta a titular sensível), não para preenchimento de
  formulário.
- **A Dattum aplica a si mesma o padrão que vende.**
- **Mockado primeiro** — toda integração no formato da API real, trocável depois.

---

## 19 — Anexo A: produto de e-commerce direto (v1.0, preservado como Modelo A)

Conteúdo original da v1.0, mantido como referência operacional para o Modelo A (§02.2)
— venda direta ao cliente final (e-commerce/infoprodutor) repassado por uma agência
assinante, não mais o motor de aquisição principal da empresa.

### 19.1 As três fases (produto ao cliente final)

| Fase | O que é | Duração |
|---|---|---|
| Diagnóstico | Auditoria técnica externa do e-commerce/infoprodutor + relatório assinado pela Dattum | Automatizado |
| Sprint de Regularização | Política de privacidade real, canal do titular, aviso de cookies, nomeação formal de encarregado | 10 dias úteis |
| DPO Recorrente | Dattum atua como encarregado formal do cliente final | Assinatura mensal, mínimo 12 meses |

### 19.2 O motor de diagnóstico (checklist original)

Pixels/cookies sem consentimento, política de privacidade ausente/genérica, encarregado
não publicado (art. 41, com tratamento simplificado via Resolução CD/ANPD nº 2/2022),
canal do titular ausente (art. 18), formulário coletando dado excessivo, TLS/HTTPS,
apps de terceiros sem cláusula contratual.

### 19.3 Precificação de referência (por faturamento anual do cliente final)

| Plano | Faturamento anual | Mensalidade | Sprint (setup) |
|---|---|---|---|
| Essencial | até R$ 1,2 mi/ano | R$ 690/mês | R$ 1.900 |
| Crescimento | R$ 1,2 mi – R$ 10 mi | R$ 1.490/mês | R$ 3.900 |
| Escala | R$ 10 mi – R$ 50 mi | R$ 2.990/mês | R$ 7.900 |
| Enterprise | acima de R$ 50 mi | Sob consulta | Sob consulta |

Desconto de 15% no plano anual; crédito de 50% do sprint na primeira mensalidade se
fechar o plano anual junto; contrato mínimo 12 meses; offboarding com aviso de 30 dias.

### 19.4 Papel da Dattum como Encarregado do cliente final

Art. 41 permite pessoa jurídica como encarregado — terceirização expressamente
permitida. Resolução CD/ANPD nº 2/2022 simplifica, não elimina, a obrigação para
pequeno porte. O contrato de prestação de serviço formaliza a nomeação da Dattum (ou de
profissional identificado dentro dela) como encarregado perante a ANPD e os titulares.
