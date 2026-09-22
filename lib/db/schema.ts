import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

export const agencias = pgTable("agencias", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  senhaHash: text("senha_hash").notNull(),
  cnpj: text("cnpj"),
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
  flowCapi: boolean("flow_capi").notNull().default(false),
  flowAds: boolean("flow_ads").notNull().default(false),
  flowWhatsapp: boolean("flow_whatsapp").notNull().default(false),
  flowCrm: boolean("flow_crm").notNull().default(false),
  crmNome: text("crm_nome"),
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
  status: text("status").notNull().default("rascunho"), // rascunho | assinado
  conteudoSnapshot: text("conteudo_snapshot").notNull(),
  versao: integer("versao").notNull().default(1),
  assinanteNome: text("assinante_nome"),
  assinanteCargo: text("assinante_cargo"),
  assinadoEm: timestamp("assinado_em"),
  assinadoIp: text("assinado_ip"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
