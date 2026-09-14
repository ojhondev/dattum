# Metodologia de Investigação Dattum — v1.0

> Playbook **standalone** (mesmo espírito do `dev.md`/`CRO.md`): usar sempre que for
> investigar a conformidade LGPD de uma empresa-alvo, seja para gerar um Diagnóstico de
> Risco (PRD §06/§07) de um e-commerce, seja para uma investigação mais profunda de uma
> operação de geração de leads em massa (infoprodutos, educação, lançamentos — o caso
> G4 Educação é o exemplo de referência para esse segundo perfil).
>
> Este documento é o processo operacional por trás do motor de diagnóstico. A decisão de
> produto que ele herda e nunca pode violar é a do PRD §03: **a investigação nunca se
> apresenta como comunicação oficial da ANPD, e nenhum achado é inflado além do que é
> verificável.**

---

## 0 — Quando usar cada camada

Nem toda empresa-alvo exige o mesmo nível de investigação. A regra de bolso:

| Perfil da empresa | Camadas aplicáveis | Por quê |
|---|---|---|
| E-commerce padrão (prospecção em massa) | 1 | Motor automatizado basta — escala é o que importa aqui |
| Conta de alto valor / prioridade comercial | 1 + 3 | Reconhecimento público + evidência documental já aumentam a materialidade do diagnóstico |
| Operação de geração de leads em massa (ex.: G4, infoprodutores, lançamentos) | 1 + 2 + 3 | O funil de nutrição é onde a exposição real mora — só a Camada 1 subestima o risco |
| Cliente já contratado | 4 | Auditoria interna de verdade, com acesso |

---

## 1 — Camada 1: Reconhecimento público (motor automatizado)

Já especificado no PRD §06. Roda sem acesso interno, sobre o que é publicamente
observável: pixels/cookies sem consentimento, política de privacidade ausente ou
genérica, encarregado não publicado, canal do titular inexistente, TLS. Escalável,
gera o Diagnóstico de Risco padrão (PRD §07).

---

## 2 — Camada 2: Simulação ativa do funil ("mystery lead")

A camada que diferencia uma auditoria de e-commerce de uma auditoria de operação de
geração de leads. Em vez de só olhar o site de fora, a Dattum **entra no funil** como um
lead de teste e observa o que a empresa faz com aquele dado depois.

### 2.1 A persona de teste — o limite ético que sustenta tudo

Duas formas de testar, com trade-off:

- **Teste transparente** (a Dattum se identifica como tal): juridicamente mais simples,
  mas a empresa pode se comportar diferente sabendo que está sendo auditada — invalida o
  teste.
- **Teste com persona fictícia**: nome não associado a nenhuma pessoa real específica,
  e-mail e telefone que a própria Dattum cria e controla. É a prática padrão de auditoria
  de privacidade e "cliente oculto" — **não é falsidade ideológica**, porque não há
  atribuição de identidade a uma pessoa real determinada nem intenção de obter vantagem
  ilícita às custas de terceiro.

> **Regra vinculante** (mesmo espírito do PRD §03): a persona pode ser fictícia, mas o
> e-mail e o telefone usados **precisam ser reais e pertencer à Dattum**. Nunca usar CPF
> ou nome de uma pessoa real e identificável. Nunca avançar até inserir dado de
> pagamento — o teste para na captura do lead, nunca simula uma compra. Um lead de teste
> por alvo é suficiente; submissões repetidas viram abuso do formulário, não auditoria.

### 2.2 Infraestrutura do teste

- **E-mail dedicado por alvo**, com alias rastreável (ex.:
  `diagnostico+nomedaempresa@dattum.com.br`) — permite detectar, meses depois, se
  *outras* empresas não relacionadas passam a contatar o mesmo endereço (evidência
  direta de venda/compartilhamento de base).
- **Número de WhatsApp/telefone dedicado** (linha virtual controlada pela Dattum),
  isolado de qualquer número comercial real da empresa.
- **Log estruturado por alvo**: data/hora da submissão, URL exata, screenshot do
  formulário no momento do envio — captura o texto do checkbox de consentimento e se ele
  já vem marcado (dark pattern clássico, torna o consentimento inválido por si só).

### 2.3 Protocolo de execução

1. **Antes de enviar**: print da página inteira (prova do que foi coletado e de como o
   consentimento foi apresentado).
2. **Envio** do formulário, timestamp registrado no log.
3. **Janela de observação**, documentada cronologicamente:
   - T+1h: houve e-mail de confirmação/boas-vindas?
   - T+24h: quantos canais já ativaram (e-mail, WhatsApp, SMS, ligação)?
   - T+7 dias: qual a frequência de disparo por canal?
4. **Dia 3–5**: exercer o direito de exclusão pelo canal oferecido (link de
   descadastro, "SAIR" no WhatsApp, etc.) e **cronometrar** o tempo até parar de fato.
5. **+15 dias após a solicitação**: continuar monitorando. Se as mensagens
   persistirem, é violação direta e documentada do art. 18, VI — não uma suposição.
6. Durante todo o período: checar se o e-mail/telefone de teste passa a receber contato
   de terceiros não relacionados (sinal de compartilhamento de base com afiliados ou
   parceiros de lançamento).

### 2.4 Evidência a coletar

- Prints com timestamp de cada mensagem recebida.
- **Cabeçalhos de e-mail** (`Received:`) — às vezes revelam qual ferramenta de disparo
  foi usada e, em operações white-label, até o remetente real por trás.
- Gravação de tela do fluxo de descadastro (prova de que funciona ou não).
- Linha do tempo consolidada: canal, conteúdo, ação do titular, resposta da empresa.

### 2.5 Por que isso não gera um novo risco de LGPD para a Dattum

Como a persona é fictícia, os dados que ela gera podem nem se enquadrar como "dado
pessoal" sob a LGPD (art. 5º exige vínculo com pessoa natural identificada ou
identificável). O e-mail e o telefone usados são da própria Dattum, que consente com o
próprio uso. O teste, bem executado, tem exposição jurídica mínima para quem o conduz.

---

## 3 — Camada 3: Evidência documental pública

Reforça a materialidade do diagnóstico antes mesmo de abordar a empresa:

- **CNPJ e sócios** (dados abertos da Receita Federal).
- **Reclamações públicas** (Reclame Aqui, Procon) citando "não param de mandar
  mensagem" ou "pedi pra sair da lista e continuam" — evidência de **padrão**, não caso
  isolado, o que pesa na dosimetria de eventual sanção (art. 52 §1º).
- **Biblioteca de Anúncios do Meta** (pública) — estima o volume de campanhas ativas
  simultâneas, e portanto uma proxy razoável de volume de leads/mês.
- **Processos e notas técnicas públicas da ANPD** contra o setor (quando existirem) —
  usados como prova de que o risco é setorial e ativo, nunca como alegação de que a
  empresa específica já está sob investigação, a menos que isso seja verdade.

---

## 4 — Camada 4: Auditoria interna (pós-contratação)

Fora do escopo deste documento — é a operação descrita no PRD §08 (inventário/ROPA,
canal do titular, gestão de incidentes, fornecedores, auditoria contínua), só que agora
com acesso real ao CRM e aos contratos da empresa.

---

## 5 — Checklist específico: operação de geração de leads em massa

Diferente do checklist de e-commerce (PRD §06), porque o ponto de risco não é a
transação — é o funil de captura e nutrição.

| Ponto de risco | O que verificar | Artigo |
|---|---|---|
| Formulário de captura (nome, e-mail, WhatsApp, às vezes CPF) | Base legal declarada é consentimento? Checkbox pré-marcado invalida o consentimento | art. 7º, 8º |
| Pixels de conversão (Meta CAPI, Google Ads, TikTok) | Disparam antes do opt-in? Enviam dado pessoal (e-mail hasheado) sem base legal clara | art. 7º |
| Automação (RD Station, ActiveCampaign, Zenvia/WhatsApp API) | Existe DPA/cláusula LGPD com cada operador? | art. 39 |
| Compartilhamento em lançamentos (afiliados, co-produtores, Hotmart/Eduzz) | A política avisa que a lista é compartilhada com parceiros? Base legal para isso? | art. 7º, 9º |
| Retenção | Lead antigo sem interação ainda recebe disparo? Sinal de ausência de política de expurgo | art. 6º, III |
| Descadastro | Funciona de verdade no WhatsApp e no e-mail? Em quanto tempo? | art. 18 |
| Scoring/perfilamento (ex.: oferta de alto ticket só para quem assistiu X% do webinar) | Decisão automatizada que afeta oferta/preço — direito a explicação | art. 20 |

---

## 6 — Estimativa de materialidade (priorização comercial)

Empresas grandes de geração de leads em massa concentram dois fatores que aumentam o
valor do diagnóstico, sem precisar inflar nada:

1. **A multa é proporcional ao faturamento** (art. 52) — quanto maior a empresa, maior o
   teto absoluto de exposição.
2. **Volume alto de leads correlaciona com volume alto de reclamações represadas** —
   maior chance de já existir denúncia no Procon/ANPD esperando para virar processo.

Esse é o argumento de urgência mais forte disponível, e é inteiramente factual.

---

## 7 — Da evidência ao relatório

Cada achado, de qualquer camada, segue o mesmo formato do Diagnóstico de Risco (PRD
§07): **fato verificável → artigo da LGPD → risco**. A Camada 2 só muda a natureza da
prova — de inferência (Camada 1) para prova de primeira mão, com timestamp:

> *"Em 03/09, um lead de teste foi cadastrado via [URL]. Em 10 dias, recebeu 14
> mensagens de WhatsApp sem nenhuma nova interação. Em 08/09, a exclusão foi solicitada
> pelo canal oferecido. As mensagens continuaram por mais 22 dias."* → viola art. 18, VI
> e indica ausência de processo de atendimento ao titular (art. 41).

---

## 8 — Implicações de operação e precificação

A Camada 2 **não escala** como o motor de diagnóstico automatizado — é manual, exige uma
janela de observação de semanas, e um analista precisa acompanhar o funil. Não faz
sentido rodar em todo prospect do diagnóstico gratuito em massa (PRD §02, fase 1).

Encaixe recomendado: **serviço reservado para contas de prioridade comercial alta**
(operações de geração de leads em massa, como o perfil G4), cobrado à parte do
diagnóstico padrão ou incluído apenas na proposta para contas grandes — decisão de
precificação ainda em aberto, a formalizar quando esse segmento entrar oficialmente no
escopo comercial da Dattum (ver PRD §04, ICP, hoje restrito a e-commerces).

---

## 9 — Checklist de execução (resumo operacional)

- [ ] Persona fictícia definida (nome não associado a pessoa real, e-mail + telefone
      próprios da Dattum)
- [ ] Print da página do formulário antes do envio
- [ ] Envio registrado com timestamp
- [ ] Observação em T+1h, T+24h, T+7 dias
- [ ] Exclusão solicitada em D+3 a D+5, com cronômetro
- [ ] Observação de +15 dias pós-exclusão
- [ ] Checagem de contato por terceiros não relacionados
- [ ] Cabeçalhos de e-mail e gravações de tela arquivados
- [ ] Achados convertidos em `fato → artigo → risco` para o relatório

---

*Documento vivo. Atualizar conforme novos aprendizados de investigações reais e mudanças
no entendimento da ANPD sobre práticas de marketing e geração de leads.*
