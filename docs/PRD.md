# Dattum — PRD v1.0

**Consultoria de compliance LGPD + DPO-as-a-Service, exclusiva para e-commerces, operada por uma plataforma própria.**

- **Versão:** 1.0 — modelo de aquisição por diagnóstico técnico-jurídico + serviço recorrente de Encarregado (DPO)
- **Data:** Setembro de 2026
- **Status:** Proposta para discussão
- **Modelo de negócio:** diagnóstico → sprint de regularização (10 dias) → assinatura recorrente de DPO terceirizado
- **Não é:** um serviço de advocacia genérico nem um selo/certificação. É **compliance operacional contínuo** com uma plataforma que sustenta a operação.

---

## 00 — Resumo executivo

### A consultoria que vira assinatura

A **Dattum** vende para e-commerces brasileiros o que a LGPD já exige deles e que quase
nenhum tem: um **Encarregado de Proteção de Dados (DPO)** de verdade, operando, com
processo documentado — não um nome num rodapé de site.

O ponto de entrada é um **Diagnóstico de Risco LGPD**: uma auditoria técnica externa da
loja (sem precisar de acesso interno) que levanta exposições reais e verificáveis —
pixels e cookies sem consentimento, ausência de política de privacidade adequada,
inexistência de canal para o titular exercer seus direitos, encarregado não publicado —
e as traduz em **risco jurídico quantificado**: artigo da LGPD violado, natureza da
infração, e a multa administrativa que a ANPD pode aplicar (até 2% do faturamento da
empresa no Brasil, limitada a R$ 50 milhões **por infração**, art. 52 da Lei 13.709/2018).

Esse diagnóstico tem **timbre e assinatura da própria Dattum** — nunca se apresenta como
comunicação da ANPD. A urgência vem do fato (a exposição existe, é auditável, a lei é
real, o histórico de fiscalização é público), não de uma falsificação. Isso é decisão de
produto e de risco, registrada na íntegra na seção 03.

A partir do diagnóstico, a Dattum oferece um **sprint de regularização de 10 dias úteis**
para as pendências mais críticas e visíveis, e propõe o **serviço recorrente de DPO**:
Dattum atua como encarregado formal da loja perante a ANPD e os titulares, com uma
plataforma que sustenta essa operação (inventário de dados, canal do titular, gestão de
incidentes, contratos com operadores, auditoria contínua).

### O que a plataforma é

- Um **motor de diagnóstico**: varredura externa automatizada de um e-commerce (site
  público) que gera o relatório técnico-jurídico usado na prospecção.
- Um **portal de operação de DPO**: onde o cliente assinante e a equipe da Dattum
  conduzem a conformidade no dia a dia (inventário, políticas, canal do titular,
  incidentes, fornecedores, auditoria).
- Uma **ferramenta de prova de conformidade**: histórico auditável de que a empresa tem
  um encarregado ativo e processos documentados — o que reduz a severidade de eventual
  sanção em caso de fiscalização (a LGPD e a ANPD consideram boa-fé e mitigação prévia
  na dosimetria da pena, art. 52 §1º).

### O que a plataforma NÃO é

| Não é | Por quê / o que faz no lugar |
|---|---|
| **Um escritório de advocacia** | Não representa o cliente em processo administrativo sancionador nem faz consultoria jurídica geral. Opera compliance operacional; contencioso é encaminhado a parceiro jurídico externo. |
| **Uma notificação da ANPD** | O diagnóstico é um documento privado, assinado e identificado como Dattum. Nunca imita selo, timbre ou linguagem de comunicação oficial de órgão público — ver §03. |
| **Uma certificação/selo** | Não existe "certificado de conformidade LGPD" reconhecido oficialmente no Brasil. A Dattum não vende selo; vende processo e encarregado ativos. |
| **Um scanner de segurança (pentest)** | Não faz teste de invasão nem análise de vulnerabilidade de infraestrutura. O diagnóstico é de **conformidade com a LGPD** (dados, consentimento, direitos do titular), não de segurança ofensiva. |

---

## 01 — Tese: e-commerce brasileiro empurra LGPD com a barriga, mas o risco é real e crescente

### O cenário

- A maioria dos e-commerces de pequeno/médio porte no Brasil (Shopify, Nuvemshop, VTEX,
  WooCommerce) **não tem encarregado nomeado**, política de privacidade genuína (em geral
  copiada de outra loja, sem refletir o tratamento real de dados) ou processo para
  responder a uma solicitação de titular.
- Ao mesmo tempo, todo e-commerce **trata dados pessoais em volume real**: cadastro,
  CPF, endereço, histórico de compra, e frequentemente dados de pagamento e comportamento
  via pixels (Meta Ads, TikTok Ads, Google Ads) — muitos sem base legal clara nem
  consentimento specific-purpose.
- A ANPD já saiu da fase "só orienta" para a fase "fiscaliza e multa" — processos
  administrativos sancionadores abertos, e o valor das multas por infração é
  proporcional ao porte do faturamento da empresa, o que torna o risco concreto mesmo
  para lojas médias.
- O empresário de e-commerce, no geral, sabe que "tem uma lei aí" mas trata como
  problema de TI ou como algo que "só acontece com empresa grande" — **empurra com a
  barriga** até um evento forçar a decisão (vazamento, denúncia de cliente, notificação
  real da ANPD, exigência de um parceiro/marketplace/adquirente de pagamento).

### A aposta da Dattum

Criar a urgência **antes** do evento, com prova técnica e jurídica real — não com medo
fabricado — e capturar a loja num contrato de conformidade contínua, porque LGPD não é
projeto de uma vez: é **operação recorrente** (novo fornecedor, nova campanha, nova
integração de dados = novo ponto de risco). Isso é o que sustenta a recorrência de
receita e o que justifica uma plataforma, não apenas uma consultoria pontual.

**Paralelo de modelo:** o mesmo movimento que fez seguros e certificações digitais
virarem linha de receita recorrente para prestadores B2B — descoberta de uma obrigação
legal pouco cumprida no mercado-alvo, seguida de um serviço que a empresa não consegue
manter internamente em pé de igualdade com um especialista dedicado.

---

## 02 — Modelo de negócio: as três fases

| Fase | O que é | Duração | Objetivo comercial |
|---|---|---|---|
| **1. Diagnóstico** | Auditoria técnica externa do e-commerce + relatório técnico-jurídico assinado pela Dattum | Automatizado, minutos a horas | Gerar o lead qualificado e a reunião comercial |
| **2. Sprint de Regularização** | Correção das pendências mais críticas e visíveis (as que reduzem exposição imediata) | 10 dias úteis | Entregar valor rápido, provar execução, criar confiança para a recorrência |
| **3. DPO Recorrente** | Dattum atua como encarregado formal, com operação contínua sustentada pela plataforma | Assinatura mensal, contrato mínimo sugerido de 12 meses | Receita recorrente (MRR) |

A fase 2 **não fecha o caso** — ela resolve o que é rápido e visível (política de
privacidade, canal do titular, aviso de cookies, nomeação formal de encarregado) para
provar execução. O que exige processo contínuo (inventário completo de dados/ROPA,
revisão de contratos com todos os operadores, treinamento de equipe, resposta a
incidentes) só é sustentável dentro da assinatura — isso é o que justifica a fase 3 para
o próprio cliente, não apenas para a Dattum.

---

## 03 — Posicionamento, tom e a decisão sobre o mecanismo de urgência

### Tom de voz

Técnico-jurídico, sóbrio, sem "marketing de agência". Referências diretas a artigos de
lei, prazos legais, valores de multa e histórico de fiscalização real da ANPD. O
diferencial de posicionamento é **soar como um escritório de compliance sério**, não
como uma agência vendendo medo — porque o comprador (dono de e-commerce que já
recebeu boletos de "SEO garantido" e "growth hacking") desconfia de tom agressivo, mas
reage a **fato jurídico concreto e verificável**.

### Decisão registrada: o diagnóstico NUNCA imita a ANPD

A ideia original de produto usava um "modelo de notificação da ANPD" para criar
urgência artificial. Essa abordagem foi **descartada deliberadamente** pelos seguintes
motivos, e a decisão abaixo é vinculante para qualquer implementação futura da Dattum:

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
4. **Risco de modelo de negócio.** DPO é uma relação de confiança de longo prazo. Um
   primeiro contato baseado em engano tende a gerar rescisão (ou processo) assim que o
   cliente perceber — o oposto do que sustenta MRR.

### O que substitui a notificação falsa

O **Diagnóstico de Risco LGPD**, sempre:

- Assinado e identificado como documento da **Dattum** (razão social, CNPJ, contato),
  nunca com símbolos, brasão ou papel timbrado que remetam a órgão público.
- Estruturado como **relatório técnico**: o que foi encontrado (fato verificável no
  site), o artigo da LGPD correspondente, a classificação de risco, e a ação
  recomendada — sem alegar que a ANPD já está ciente do caso específico da loja, a
  menos que isso seja verdade.
- Contém, de forma explícita, uma linha como: *"Este é um relatório técnico
  independente elaborado pela Dattum Consultoria em Proteção de Dados. Não constitui
  notificação, autuação ou comunicação oficial da Autoridade Nacional de Proteção de
  Dados (ANPD)."* — isso não é só proteção jurídica, é o que dá credibilidade ao
  relatório como trabalho sério.
- Cita, quando relevante, **casos públicos reais** de fiscalização/sanção da ANPD contra
  empresas do setor (processos administrativos, notas técnicas, relatórios de
  fiscalização já publicados) como prova de que o risco é setorial e ativo — fato, não
  ameaça fabricada.

---

## 04 — Personas / ICP

| Persona | Quem | O que precisa da Dattum |
|---|---|---|
| **Dono/sócio do e-commerce (comprador)** | PME, faturamento tipicamente entre ~R$500k e ~R$50mi/ano, sem time jurídico interno | Entender o risco em termos de dinheiro e prazo, não de "boas práticas"; resolver sem precisar entender a lei a fundo |
| **Gestor de operações/marketing da loja** | Quem mexe em pixels, apps, integrações no dia a dia | Saber o que pode/não pode instalar sem gerar novo risco; canal rápido para tirar dúvida |
| **Encarregado interno (quando existe)** | Raramente existe nessas empresas; às vezes é o próprio dono "no papel" | Delegar a função de fato para quem sabe operar, mantendo responsabilidade formal clara |
| **Analista de compliance Dattum** | Time interno da Dattum, opera o portal para múltiplos clientes | Ver todos os clientes sob sua carteira, prazos de resposta a titulares, pendências, riscos por cliente |
| **DPO responsável Dattum** | Encarregado formalmente designado para os clientes assinantes | Assinar respostas a titulares e à ANPD, supervisionar o time, decidir escalonamento de incidentes |
| **Comercial Dattum** | Time que prospecta e fecha | Gerar e enviar diagnósticos em escala, acompanhar funil do diagnóstico ao contrato assinado |

---

## 05 — Jornada do cliente / funil comercial

```
Prospecção (lista de e-commerces-alvo)
        │
        ▼
Diagnóstico automatizado (motor de varredura roda sobre o domínio público da loja)
        │
        ▼
Relatório técnico-jurídico gerado (achados + artigo da LGPD + risco estimado em R$)
        │
        ▼
Envio ao decisor (e-mail/LinkedIn/WhatsApp comercial, nunca canal que simule oficialidade)
        │
        ▼
Reunião de apresentação do diagnóstico (comercial + apoio técnico)
        │
        ├─── Não converte → nutrição periódica (reenvio de diagnóstico atualizado a cada N meses)
        │
        ▼
Proposta: Sprint de Regularização (10 dias) + assinatura de DPO recorrente
        │
        ▼
Onboarding: coleta de dados do tratamento real da loja (formulário guiado + integração,
quando possível, com a plataforma de e-commerce)
        │
        ▼
Sprint de 10 dias (execução das pendências críticas, checklist público para o cliente)
        │
        ▼
Ativação da assinatura: Dattum nomeada encarregado formal, portal liberado para o cliente
        │
        ▼
Operação recorrente (inventário, canal do titular, incidentes, fornecedores, auditoria
contínua, relatório mensal de conformidade)
```

---

## 06 — Motor de diagnóstico (varredura automatizada)

O que roda **sem acesso interno ao e-commerce** — só o que é publicamente observável:

- **Rastreadores e consentimento:** cookies e pixels de terceiros (Meta, TikTok, Google,
  outros) disparando antes de consentimento; ausência de banner de cookies; banner
  presente mas sem opção real de recusa (dark pattern — agrava o risco, não mitiga).
- **Documentos legais:** presença/ausência de Política de Privacidade; Política de
  Privacidade genérica/copiada (sem menção ao tratamento real: quais dados, finalidade,
  base legal, prazo de retenção, transferência internacional); ausência de Termos de Uso.
- **Encarregado (DPO):** nome/canal de contato do encarregado publicado ou não (exigido
  pelo art. 41 da LGPD — com tratamento simplificado para pequenas empresas conforme
  Resolução CD/ANPD nº 2/2022, mas a existência do canal continua obrigatória).
- **Canal do titular:** existência de meio funcional para o titular exercer os direitos
  do art. 18 (acesso, correção, eliminação, portabilidade, revogação de consentimento).
- **Formulários:** campos coletando dado sensível ou excessivo (CPF, data de nascimento
  completa) sem justificativa de finalidade aparente; checkout exigindo mais dado do que
  o necessário para a compra.
- **Selos e certificados de segurança:** TLS/HTTPS válido (proxy simples de postura de
  segurança, não é análise de vulnerabilidade).
- **Terceiros embutidos:** apps de terceiros (reviews, chat, recuperação de carrinho)
  que tipicamente coletam e retransmitem dado pessoal sem cláusula contratual visível.

Saída: **score de risco** (0–100) + lista de achados classificados por severidade +
artigo da LGPD correspondente + estimativa de exposição financeira (faixa de multa
possível, nunca valor "prometido" como certo — é estimativa, diagnóstico não é sentença).

---

## 07 — Relatório técnico-jurídico (geração)

- Gerado a partir da saída do motor de diagnóstico + template jurídico mantido/revisado
  por profissional habilitado (o conteúdo jurídico não é gerado sem revisão humana
  periódica do template-base).
- Estrutura: capa (identificação Dattum, CNPJ, data), resumo executivo do risco, achados
  detalhados (fato → artigo → risco), linha de esclarecimento (ver §03), e proposta
  clara de próximo passo (agendar o sprint de 10 dias).
- Exportável em PDF, com identidade visual própria da Dattum (ver §10).
- Toda geração fica registrada no portal interno (histórico de diagnósticos enviados,
  por prospect, com data e versão do relatório) — auditável e reenviável.

---

## 08 — Portal de operação de DPO (produto para o cliente assinante)

### 8.1 Inventário de dados (ROPA / Registro de Operações de Tratamento)

- Cadastro guiado dos tratamentos de dados da loja: finalidade, dados coletados, base
  legal, prazo de retenção, compartilhamento com terceiros, transferência internacional.
- Template pré-preenchido por segmento (e-commerce típico: cadastro, checkout,
  marketing, atendimento, logística) para acelerar o preenchimento inicial.
- Atualização assistida quando a loja reporta novo fornecedor/integração.

### 8.2 Políticas geradas e versionadas

- Política de Privacidade e Termos de Uso gerados a partir do inventário real (não
  template genérico) — muda automaticamente quando o inventário muda.
- Versionamento com histórico (data de publicação, o que mudou) — prova de que a loja
  mantém o documento atualizado, relevante em caso de fiscalização.
- Gerenciador de banner de cookies (categorias, opt-in real, registro de consentimento
  por sessão).

### 8.3 Canal do titular (atendimento a direitos do art. 18)

- Formulário público embutível na loja do cliente para o titular solicitar acesso,
  correção, eliminação, portabilidade ou revogação de consentimento.
- Fila de solicitações no portal, com **prazo legal de resposta rastreado** (a LGPD não
  fixa prazo único para todos os direitos, mas o portal aplica prazo interno
  conservador e alerta antes do vencimento).
- Modelo de resposta por tipo de solicitação, revisado pela Dattum antes do envio.

### 8.4 Gestão de incidentes de segurança

- Registro de incidente (o que aconteceu, dados afetados, titulares impactados).
- Fluxo de avaliação de gravidade e **checklist de notificação à ANPD e aos titulares**
  quando o incidente representar risco relevante (art. 48 da LGPD).
- Trilha de decisão documentada — essencial para demonstrar boa-fé e mitigação em caso
  de fiscalização posterior.

### 8.5 Gestão de operadores/fornecedores

- Lista de fornecedores que tratam dado em nome da loja (gateway de pagamento, ERP,
  ferramenta de marketing, apps da plataforma de e-commerce).
- Checklist de cláusula contratual LGPD por fornecedor (existe contrato/DPA? cobre
  finalidade, segurança, sub-tratamento?).
- Alertas quando um fornecedor crítico não tem contrato adequado.

### 8.6 Auditoria contínua

- Reexecução periódica do motor de diagnóstico (§06) sobre o site do cliente já
  assinante — verifica se novo pixel/app introduziu risco, se o consentimento continua
  válido, se a política segue coerente com o tratamento real.
- Score de conformidade histórico (gráfico de evolução) — material do relatório mensal
  entregue ao cliente.

### 8.7 Treinamento e conscientização

- Trilha curta de treinamento para a equipe do cliente (o que é dado pessoal, o que não
  pode ser feito sem base legal, como reconhecer uma solicitação de titular).
- Registro de conclusão por colaborador — evidência de programa de conscientização
  ativo (fator considerado na dosimetria de eventual sanção).

### 8.8 Relatório mensal de conformidade

- PDF/e-mail automático ao cliente: score atual, o que mudou no mês, pendências abertas,
  solicitações de titular atendidas, incidentes registrados.
- Reforça o valor percebido da assinatura mês a mês — combate ao maior risco de uma
  assinatura de compliance: o cliente esquecer que está pagando por algo "que nunca dá
  problema".

---

## 09 — Papel da Dattum como Encarregado (base legal)

- O art. 41 da LGPD permite que o encarregado seja **pessoa natural ou jurídica** —
  terceirização é expressamente permitida, não é zona cinzenta.
- A Resolução CD/ANPD nº 2/2022 (Regulamento para Agentes de Tratamento de Pequeno
  Porte) **simplifica** algumas obrigações para micro, pequenas e médias empresas e
  startups (ex.: permite canal de comunicação simplificado em vez de encarregado
  formalmente nomeado em certos casos) — **não elimina** a exigência de um canal e
  processo de atendimento ao titular. O diagnóstico e o material comercial da Dattum
  devem refletir essa nuance com precisão, nunca afirmar que toda loja é obrigada a ter
  um DPO nomeado nos mesmos termos de uma empresa grande — **exagerar a obrigação legal
  é o mesmo erro, em espírito, da notificação falsa (§03), e mina a credibilidade
  técnica que é o diferencial da Dattum.**
- O contrato de prestação de serviço formaliza a nomeação da Dattum (ou de um
  profissional identificado dentro da Dattum) como encarregado perante a ANPD e os
  titulares, com escopo, responsabilidades e SLA de resposta definidos.

---

## 10 — Design system e identidade visual

- Identidade **própria, sóbria, jurídico-corporativa** — o oposto visual de qualquer
  coisa que lembre um órgão público ou um documento oficial. Paleta e tipografia devem
  comunicar "escritório de compliance sério", não "agência de growth".
- Paleta sugerida: base neutra escura (grafite/azul-marinho profundo) + um tom de
  destaque sóbrio (dourado envelhecido ou verde-escuro — evitar vermelho/laranja
  associados a alerta agressivo de venda) + branco para documentos.
- Tipografia: serifada ou semi-serifada para títulos (remete a documento jurídico),
  sans-serif neutra para corpo de texto (legibilidade em relatório longo).
- Todo relatório PDF e toda tela do portal carregam o CNPJ da Dattum, contato direto e
  a linha de identificação de §03 — nunca ambíguo sobre quem está falando.
- Consultar a skill `dataviz` antes de montar o gráfico de score de conformidade e
  qualquer visualização de risco.

---

## 11 — Stack e arquitetura técnica (proposta)

Alinhada ao `dev.md` (ajustar conforme necessidade):

| Camada | Escolha |
|---|---|
| Framework | Next.js (App Router, Server Actions) + TypeScript |
| UI | Tailwind + Lucide + Recharts (score de conformidade, gráficos de risco) |
| Dados | Postgres (Neon) + Drizzle ORM |
| Motor de diagnóstico | Serviço de varredura (worker) que baixa e analisa HTML/rede pública do domínio-alvo: detecção de pixels/cookies, presença de páginas legais, TLS — sem autenticação nem acesso interno à loja |
| Geração de documento | Template engine → PDF (relatório de diagnóstico e políticas geradas) |
| Auth | Cookie de sessão própria + scrypt; papéis (RBAC): admin Dattum, analista Dattum, DPO responsável, cliente admin, cliente operador |
| Multi-cliente | Isolamento lógico por `cliente_id` em toda tabela sensível (inventário, solicitações de titular, incidentes) |
| Fila/jobs | Reexecução periódica do diagnóstico (auditoria contínua), envio de relatório mensal, alertas de prazo de resposta a titular |
| Deploy | Vercel + GitHub, seguindo pipeline padrão do `dev.md` (`vercel git connect` explícito, deploy obrigatório após push) |
| LGPD (a própria Dattum como controladora/operadora dos dados que processa) | Criptografia de PII em repouso, retenção configurável, trilha de consentimento e de acesso — a Dattum aplica a si mesma o padrão que vende |

**Regras de arquitetura:**

1. Nenhuma tabela de dado de cliente sem `cliente_id`. Nenhuma query sem filtro.
2. O motor de diagnóstico nunca acessa sistemas internos do prospect — só o que é
   publicamente observável no domínio. Isso mantém o diagnóstico legalmente limpo (sem
   necessidade de autorização prévia para rodar) e escalável (nenhum onboarding técnico
   necessário para gerar o primeiro relatório).
3. Toda integração (plataforma de e-commerce do cliente, gateway, etc.) mockada primeiro
   no formato da API real (metodologia `dev.md`).

---

## 12 — Modelo de precificação por faixa

Segmentação pelo mesmo critério que já organiza o risco jurídico do cliente: faturamento
anual do e-commerce — é o que a própria Resolução CD/ANPD nº 2/2022 usa para diferenciar
agente de tratamento de pequeno porte, e é o que correlaciona com o teto de multa do
art. 52 (proporcional ao faturamento). Os valores abaixo são **proposta inicial para
validação nos pilotos** (§13.1), não preço fechado — mas resolvem a decisão em aberto
anterior o suficiente para orçar o MVP e a primeira rodada comercial.

### 12.1 Faixas de assinatura (DPO recorrente)

| Plano | Faturamento anual do e-commerce | Mensalidade | Fornecedores/operadores monitorados | Auditoria contínua (§8.6) | SLA — canal do titular | Suporte |
|---|---|---|---|---|---|---|
| **Essencial** | até R$ 1,2 milhão *(agente de pequeno porte, Resolução CD/ANPD nº 2/2022)* | **R$ 690/mês** | até 3 | Trimestral | 15 dias úteis | E-mail + chat, horário comercial |
| **Crescimento** | R$ 1,2 mi – R$ 10 mi | **R$ 1.490/mês** | até 10 | Mensal | 10 dias úteis | Prioritário + 1 reunião trimestral com o DPO responsável |
| **Escala** | R$ 10 mi – R$ 50 mi | **R$ 2.990/mês** | Ilimitado | Semanal | 5 dias úteis | Gestor de conta dedicado + relatório executivo trimestral para a diretoria |
| **Enterprise / Multi-marca** | acima de R$ 50 mi, ou múltiplos CNPJs/lojas sob o mesmo grupo | Sob consulta | Ilimitado, multi-tenant | Contínua + alertas em tempo real | Definido em contrato | DPO dedicado nomeado + integração customizada |

- **Desconto de 15%** no plano anual (pagamento à vista ou 12x sem o desconto mês a mês).
- **Contrato mínimo sugerido de 12 meses** (§02) — coerente com o fato de que desligar um
  encarregado de uma hora para outra deixa o cliente sem cobertura formal perante a ANPD.
- **Offboarding com aviso de 30 dias:** cancelamento não é imediato — há um período de
  transição em que a Dattum mantém a função de encarregado ativa até o cliente nomear um
  substituto (interno ou outro prestador). Isso é tratado no contrato, não deixado em
  aberto — encerrar a função de DPO sem handoff expõe o cliente, e a Dattum não constrói
  a recorrência em cima disso.

### 12.2 Sprint de Regularização (setup)

| Plano | Taxa única | Crédito se fechar o plano anual no mesmo momento |
|---|---|---|
| Essencial | R$ 1.900 | 50% abatido na primeira mensalidade |
| Crescimento | R$ 3.900 | 50% abatido na primeira mensalidade |
| Escala | R$ 7.900 | 50% abatido na primeira mensalidade |
| Enterprise | Sob consulta | Negociado em contrato |

Resolve a segunda decisão em aberto: o Sprint **continua cobrado à parte** (sinaliza
valor e filtra lead que não está disposto a investir em resolver o problema agora), mas
com **crédito de 50%** na primeira mensalidade quando o cliente já fecha a assinatura
anual na mesma proposta — reduz o atrito de decisão sem transformar o sprint em "brinde"
que desvaloriza o trabalho de 10 dias.

### 12.3 Diagnóstico e add-ons

| Item | Modelo | Observação |
|---|---|---|
| **Diagnóstico** | Gratuito na prospecção outbound; pago (taxa simbólica) se solicitado avulso por inbound | Ferramenta de geração de lead, não linha de receita |
| **Add-ons** | Gestão de incidente fora do padrão, revisão de contrato adicional com operador, treinamento presencial | Sob demanda, cobrado por hora ou por entrega |

---

## 13 — MVP e roadmap

### 13.1 MVP (valida: "o diagnóstico gera reunião, e a reunião fecha assinatura?")

**Dentro:**

- Motor de diagnóstico com os achados essenciais (§06): cookies/pixels sem
  consentimento, política de privacidade ausente/genérica, encarregado não publicado,
  canal do titular ausente.
- Geração de relatório em PDF com identidade Dattum (§07/§10), sem automação total —
  pode ter revisão manual leve no MVP.
- CRM simples de prospecção (lista de domínios-alvo, status do diagnóstico, status
  comercial) — não precisa ser o portal completo do cliente ainda.
- Portal do cliente assinante, versão inicial: inventário de dados (formulário guiado),
  política/termos gerados, canal do titular básico (formulário + fila).
- Relatório mensal de conformidade (mesmo que simplificado no MVP).

**Fora do MVP:** auditoria contínua automatizada (reexecução periódica), gestão completa
de incidentes com fluxo de notificação à ANPD, trilha de treinamento de equipe, gestão
de contratos com operadores, multi-usuário fino por papel no lado do cliente.

### 13.2 Roadmap

**Fase 1 — MVP:** o que está acima. Piloto com 5–10 e-commerces (mix de diagnóstico
outbound e conversão).

**Fase 2 — Operação DPO completa:** gestão de incidentes com fluxo de notificação,
gestão de contratos com operadores, auditoria contínua automatizada, score de
conformidade histórico.

**Fase 3 — Escala do diagnóstico:** motor de varredura rodando em lote sobre listas
grandes de domínios (prospecção em massa), priorização automática de leads por score de
risco (quem tem mais exposição vira prioridade comercial).

**Fase 4 — Inteligência:** alertas preditivos (nova exigência da ANPD, mudança de
entendimento regulatório aplicada automaticamente ao inventário dos clientes),
benchmarking de risco por segmento de e-commerce.

---

## 14 — Métricas de sucesso

| Dimensão | KPIs |
|---|---|
| **Aquisição** | Diagnósticos enviados/mês; taxa diagnóstico → reunião; taxa reunião → contrato fechado |
| **Execução do Sprint** | % de sprints entregues dentro dos 10 dias úteis; NPS pós-sprint |
| **Recorrência** | MRR; ARPU por faixa de cliente; churn mensal; tempo médio de contrato ativo |
| **Operação de compliance** | Tempo médio de resposta a solicitação de titular vs. prazo interno; incidentes registrados e tratados; % de fornecedores do cliente com contrato LGPD adequado |
| **Prova de valor** | Score de conformidade médio por cliente ao longo do tempo (evolução, não estático) |
| **Risco/reputação Dattum** | Zero notificações/reclamações por prática comercial enganosa; zero uso de linguagem que imite órgão público em qualquer material (auditoria interna periódica de compliance da própria Dattum) |

---

## 15 — Riscos e mitigações

| Risco | Por quê | Mitigação |
|---|---|---|
| **Diagnóstico percebido como spam/ameaça** | Outbound frio com conteúdo de risco pode ser mal recebido mesmo sendo factual | Tom técnico, sem apelo emocional; sempre identificado; oferta clara de retirada de contato |
| **Reincidência do mecanismo de notificação falsa** | Pressão comercial por conversão mais rápida pode reintroduzir a tática descartada em §03 | Regra de produto vinculante (§03); revisão de todo material de outbound antes de uso em escala |
| **Exagero da obrigação legal (todo mundo precisa de DPO nomeado)** | Simplifica a venda, mas é factualmente impreciso para micro/pequenas empresas (Resolução CD/ANPD nº 2/2022) | Precisão jurídica obrigatória no relatório e no discurso comercial (§09); credibilidade técnica é o diferencial, não pode ser sacrificada |
| **Motor de diagnóstico gerando falso positivo** | Score de risco errado mina a credibilidade do relatório inteiro | Revisão humana periódica das regras de detecção; canal de contestação no próprio relatório |
| **Dependência de poucos analistas/DPO responsável** | Serviço com componente humano real (assinatura de respostas, decisão de incidente) não escala só com software | Plataforma reduz trabalho manual repetitivo (geração de documento, prazo, triagem), mas contratação de time de compliance acompanha crescimento de carteira |
| **Concorrência de escritórios de advocacia tradicionais** | Escritórios já oferecem DPO terceirizado, com menos produto e mais serviço manual | Diferencial: plataforma reduz custo operacional e dá visibilidade contínua (score, relatório mensal) que consultoria tradicional não entrega |
| **A própria Dattum como alvo de fiscalização** | Trata dado pessoal de clientes e de prospects (nos diagnósticos) | Aplicar internamente o mesmo padrão vendido (§11); minimizar dado coletado na prospecção ao estritamente público |

---

## 16 — Decisões em aberto

1. ~~Preço exato por faixa de assinatura.~~ **Resolvido em §12** — 4 faixas por
   faturamento anual (Essencial/Crescimento/Escala/Enterprise). Valores são proposta
   inicial; ajustar com os primeiros pilotos.
2. ~~Sprint embutido ou cobrado à parte?~~ **Resolvido em §12.2** — cobrado à parte, com
   crédito de 50% na primeira mensalidade se o cliente fechar o plano anual junto.
3. **Volume e forma da prospecção outbound** — lista comprada/raspada de e-commerces
   (checar legalidade da fonte e minimização de dado) vs. inbound via conteúdo
   técnico-jurídico (blog, LinkedIn) como canal primário, com outbound como reforço.
4. **Quem assina como encarregado perante a ANPD** — profissional identificado
   nominalmente por cliente, ou a pessoa jurídica Dattum como um todo (impacto na
   responsabilização e na percepção de "quem eu realmente contrato").
5. **Escopo do motor de diagnóstico v1** — quantos e quais achados entram na primeira
   versão automatizada vs. checagem manual no MVP.
6. **Parceria jurídica externa** para eventual contencioso/processo administrativo
   sancionador — parceiro fixo ou indicação caso a caso.

---

## 17 — Princípios de produto

- **Urgência real, nunca fabricada.** Todo achado do diagnóstico é verificável; toda
  citação legal é precisa; a Dattum nunca se apresenta como órgão público.
- **Compliance é operação contínua, não projeto de uma vez.** O produto existe para
  sustentar recorrência, não para vender um relatório e sumir.
- **Precisão jurídica é o diferencial.** Exagerar a lei para vender mais é o mesmo erro,
  em espírito, do documento falso — mina a credibilidade que sustenta o preço premium.
- **O portal reduz trabalho manual repetitivo**, para que o tempo humano do time Dattum
  vá para decisão (incidente, resposta a titular sensível), não para preenchimento de
  formulário.
- **A Dattum aplica a si mesma o padrão que vende.**
- **Mockado primeiro** — toda integração no formato da API real, trocável depois.
