import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import type { Achado } from "@/lib/vigilancia-tipos";

export const agencias = pgTable("agencias", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  senhaHash: text("senha_hash").notNull(), // no login só com Google, guarda um hash aleatório (senha desconhecida)
  googleSub: text("google_sub").unique(), // id da conta Google vinculada
  cnpj: text("cnpj"),
  plano: text("plano").notNull().default("growth"), // start | growth | scale
  clientesContratados: integer("clientes_contratados"), // nulo = sem limite (ex.: demo)
  senhaDefinida: boolean("senha_definida").notNull().default(true), // false = criada pelo Google, ainda sem senha própria
  whatsapp: text("whatsapp"),
  endereco: text("endereco"), // qualificação nos contratos
  responsavelNome: text("responsavel_nome"), // quem assina pela agência
  responsavelCargo: text("responsavel_cargo"),
  termosVersao: text("termos_versao"), // versão dos Termos/Privacidade/DPA da Dattis aceita no cadastro
  termosAceitosEm: timestamp("termos_aceitos_em"),
  suspensa: boolean("suspensa").notNull().default(false), // bloqueio pelo admin (ex.: inadimplência)
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const contasCliente = pgTable("contas_cliente", {
  id: uuid("id").primaryKey().defaultRandom(),
  agenciaId: uuid("agencia_id")
    .notNull()
    .references(() => agencias.id, { onDelete: "cascade" }),
  nome: text("nome").notNull(),
  cnpj: text("cnpj"),
  contatoNome: text("contato_nome"),
  contatoEmail: text("contato_email"),
  site: text("site"), // usado pela vigilância diária
  flowPublicos: boolean("flow_publicos").notNull().default(false),
  flowFormularios: boolean("flow_formularios").notNull().default(false),
  flowCapi: boolean("flow_capi").notNull().default(false),
  flowAds: boolean("flow_ads").notNull().default(false),
  flowWhatsapp: boolean("flow_whatsapp").notNull().default(false),
  flowCrm: boolean("flow_crm").notNull().default(false),
  crmNome: text("crm_nome"),
  contatoWhatsapp: text("contato_whatsapp"),
  tokenPublico: text("token_publico").unique(), // link do DAT que a agência manda pro cliente
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const subprocessadoresCatalogo = pgTable("subprocessadores_catalogo", {
  id: uuid("id").primaryKey().defaultRandom(),
  chave: text("chave").notNull().unique(), // slug estável usado pelo seed/wizard, ex: "meta-ads"
  nome: text("nome").notNull(),
  categoria: text("categoria").notNull(),
  pais: text("pais").notNull(),
  finalidadePadrao: text("finalidade_padrao").notNull(),
});

export const contaSubprocessadores = pgTable("conta_subprocessadores", {
  id: uuid("id").primaryKey().defaultRandom(),
  contaClienteId: uuid("conta_cliente_id")
    .notNull()
    .references(() => contasCliente.id, { onDelete: "cascade" }),
  subprocessadorCatalogoId: uuid("subprocessador_catalogo_id").references(
    () => subprocessadoresCatalogo.id,
    { onDelete: "set null" }
  ),
  nomeCustomizado: text("nome_customizado"),
  finalidade: text("finalidade").notNull(),
  ativo: boolean("ativo").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const atividadesTratamento = pgTable("atividades_tratamento", {
  id: uuid("id").primaryKey().defaultRandom(),
  agenciaId: uuid("agencia_id")
    .notNull()
    .references(() => agencias.id, { onDelete: "cascade" }),
  contaClienteId: uuid("conta_cliente_id")
    .notNull()
    .references(() => contasCliente.id, { onDelete: "cascade" }),
  nomeAtividade: text("nome_atividade").notNull(),
  categoriasDado: text("categorias_dado").notNull(),
  finalidade: text("finalidade").notNull(),
  baseLegal: text("base_legal").notNull(),
  titulares: text("titulares").notNull(),
  prazoRetencao: text("prazo_retencao").notNull(),
  fluxo: text("fluxo"), // FlowKey que gerou a atividade; nulo = atividade manual
  status: text("status").notNull().default("ativo"), // rascunho | ativo
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const dpas = pgTable("dpas", {
  id: uuid("id").primaryKey().defaultRandom(),
  agenciaId: uuid("agencia_id")
    .notNull()
    .references(() => agencias.id, { onDelete: "cascade" }),
  contaClienteId: uuid("conta_cliente_id")
    .notNull()
    .references(() => contasCliente.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("rascunho"), // rascunho | assinado (assinado = agência E cliente assinaram)
  conteudoSnapshot: text("conteudo_snapshot").notNull(),
  versao: integer("versao").notNull().default(1),
  hashConteudo: text("hash_conteudo"), // SHA-256 do texto, gravado na primeira assinatura
  // Assinatura da agência (operadora)
  assinanteNome: text("assinante_nome"),
  assinanteCargo: text("assinante_cargo"),
  assinadoEm: timestamp("assinado_em"),
  assinadoIp: text("assinado_ip"),
  assinadoUserAgent: text("assinado_user_agent"),
  // Assinatura do cliente (controlador), pelo link público
  clienteNome: text("cliente_nome"),
  clienteCargo: text("cliente_cargo"),
  clienteEmail: text("cliente_email"),
  clienteAssinadoEm: timestamp("cliente_assinado_em"),
  clienteIp: text("cliente_ip"),
  clienteUserAgent: text("cliente_user_agent"),
  tokenAssinatura: text("token_assinatura").unique(),
  substituidoEm: timestamp("substituido_em"), // nova versão gerada depois de mudar a conta; nulo = vigente
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Certificado de privacidade verificável (selo + QR Code). contaClienteId nulo = certificado da própria agência.
export const certificados = pgTable("certificados", {
  id: uuid("id").primaryKey().defaultRandom(),
  agenciaId: uuid("agencia_id")
    .notNull()
    .references(() => agencias.id, { onDelete: "cascade" }),
  contaClienteId: uuid("conta_cliente_id").references(() => contasCliente.id, { onDelete: "cascade" }),
  codigo: text("codigo").notNull().unique(),
  titular: text("titular").notNull(),
  dominio: text("dominio"),
  emitidoEm: timestamp("emitido_em").notNull().defaultNow(),
  validoAte: timestamp("valido_ate").notNull(),
  revogado: boolean("revogado").notNull().default(false),
  automatico: boolean("automatico").notNull().default(false), // emitido/renovado pela Dattis sem ação da agência
});

// Código de ativação individual, gerado pela equipe Dattis depois do pagamento. Uso único.
export const codigosAtivacao = pgTable("codigos_ativacao", {
  id: uuid("id").primaryKey().defaultRandom(),
  codigo: text("codigo").notNull().unique(),
  clienteNome: text("cliente_nome").notNull(),
  clienteContato: text("cliente_contato"),
  plano: text("plano").notNull(), // start | growth | scale
  clientes: integer("clientes").notNull().default(1), // quantidade de contas de cliente contratadas
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  usadoEm: timestamp("usado_em"),
  agenciaId: uuid("agencia_id").references(() => agencias.id, { onDelete: "set null" }),
  revogado: boolean("revogado").notNull().default(false),
});

// Link de redefinição de senha (por e-mail quando houver provedor; senão gerado no admin e enviado por WhatsApp).
export const redefinicoesSenha = pgTable("redefinicoes_senha", {
  id: uuid("id").primaryKey().defaultRandom(),
  agenciaId: uuid("agencia_id")
    .notNull()
    .references(() => agencias.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(), // SHA-256 do token; o token em si só existe no link
  origem: text("origem").notNull(), // email | admin
  expiraEm: timestamp("expira_em").notNull(),
  usadoEm: timestamp("usado_em"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

// Lead captado na "Auditoria da sua agência" (diagnóstico público). Guardado pra marketing/comercial.
export const leadsAuditoria = pgTable("leads_auditoria", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  agencia: text("agencia").notNull(),
  whatsapp: text("whatsapp").notNull(),
  utm: jsonb("utm").$type<Record<string, string>>(),
  respostas: jsonb("respostas").$type<Record<string, string>>(),
  score: integer("score"),
  nivel: text("nivel"),
  sinalComercial: text("sinal_comercial"),
  concluidoEm: timestamp("concluido_em"),
  enviadoEspecialistaEm: timestamp("enviado_especialista_em"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Vigilância: uma varredura (diária via cron, manual pelo admin ou pedida pela agência) e o resultado por alvo.
export const varreduras = pgTable("varreduras", {
  id: uuid("id").primaryKey().defaultRandom(),
  origem: text("origem").notNull(), // cron | manual | agencia
  status: text("status").notNull().default("rodando"), // rodando | concluida | falhou
  alvos: integer("alvos").notNull().default(0),
  criticos: integer("criticos").notNull().default(0),
  altos: integer("altos").notNull().default(0),
  medios: integer("medios").notNull().default(0),
  erro: text("erro"),
  iniciadaEm: timestamp("iniciada_em").notNull().defaultNow(),
  finalizadaEm: timestamp("finalizada_em"),
});

export const varreduraResultados = pgTable("varredura_resultados", {
  id: uuid("id").primaryKey().defaultRandom(),
  varreduraId: uuid("varredura_id")
    .notNull()
    .references(() => varreduras.id, { onDelete: "cascade" }),
  agenciaId: uuid("agencia_id")
    .notNull()
    .references(() => agencias.id, { onDelete: "cascade" }),
  contaClienteId: uuid("conta_cliente_id").references(() => contasCliente.id, { onDelete: "cascade" }), // nulo = site da própria agência
  titular: text("titular").notNull(),
  alvo: text("alvo"), // URL verificada (nulo quando só a documentação foi checada)
  nota: integer("nota").notNull(),
  criticos: integer("criticos").notNull().default(0),
  altos: integer("altos").notNull().default(0),
  medios: integer("medios").notNull().default(0),
  achados: jsonb("achados").$type<Achado[]>().notNull(),
  verificadoEm: timestamp("verificado_em").notNull().defaultNow(),
});

// ---------- Blog (CMS no /admin) ----------

export const autores = pgTable("autores", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  slug: text("slug").notNull().unique(),
  cargo: text("cargo"),
  bio: text("bio"),
  fotoUrl: text("foto_url"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export type PerguntaFaq = { pergunta: string; resposta: string };

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  titulo: text("titulo").notNull(),
  resumo: text("resumo").notNull().default(""), // subtítulo na página e fallback da meta description
  conteudo: text("conteudo").notNull().default(""), // Markdown
  capaUrl: text("capa_url"),
  capaAlt: text("capa_alt"),
  categoria: text("categoria").notNull().default("LGPD"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  autorId: uuid("autor_id").references(() => autores.id, { onDelete: "set null" }),
  status: text("status").notNull().default("rascunho"), // rascunho | publicado (publicadoEm no futuro = agendado)
  publicadoEm: timestamp("publicado_em"),
  // SEO
  seoTitulo: text("seo_titulo"),
  seoDescricao: text("seo_descricao"),
  palavraChave: text("palavra_chave"),
  canonical: text("canonical"),
  ogImagem: text("og_imagem"),
  noindex: boolean("noindex").notNull().default(false),
  faq: jsonb("faq").$type<PerguntaFaq[]>().notNull().default([]),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow(),
});

// Configurações globais editáveis no admin (SEO, verificação do Google/Bing etc.).
export const configuracoes = pgTable("configuracoes", {
  chave: text("chave").primaryKey(),
  valor: text("valor").notNull(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow(),
});

// Limite de tentativas (login, códigos, formulários públicos). Ver lib/limite.ts; o cron diário limpa o que venceu.
export const limites = pgTable("limites", {
  chave: text("chave").primaryKey(),
  contagem: integer("contagem").notNull().default(0),
  inicio: timestamp("inicio").notNull().defaultNow(),
});
