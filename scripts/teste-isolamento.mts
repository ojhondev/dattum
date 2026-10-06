// Teste de isolamento entre agências ("cada um só vê o seu").
// Cria duas agências de teste (A e B), dá dados à B e tenta, logada como A, ler e alterar tudo da B
// por todas as rotas da API e páginas do painel. No fim, confere que nada da B mudou e apaga as duas.
//
// Uso (com o site rodando localmente: npm run build && npm run start):
//   npm run teste:isolamento                       (padrão: http://localhost:3012)
//   ISOLAMENTO_URL=http://localhost:3012 npm run teste:isolamento
// Sai com código 1 se qualquer verificação falhar.
import { randomBytes } from "node:crypto";
import { SignJWT } from "jose";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, atividadesTratamento, certificados, contasCliente, contaSubprocessadores, dpas, pedidosTitular, subprocessadoresCatalogo, usuarios } from "@/lib/db/schema";
import { chaveDe } from "@/lib/segredo";

const BASE = (process.env.ISOLAMENTO_URL ?? "http://localhost:3012").replace(/\/$/, "");
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) {
  console.error("Rode só contra o servidor local (cria e apaga dados de teste).");
  process.exit(2);
}

const sufixo = randomBytes(4).toString("hex");
const MARCA_B = `ISOLAMENTO-B-${sufixo}`; // aparece nos dados da B: se surgir numa resposta para A, vazou
const falhas: string[] = [];
let total = 0;

function checar(ok: boolean, descricao: string) {
  total++;
  if (!ok) falhas.push(descricao);
  console.log(`${ok ? "ok  " : "FALHOU"} ${descricao}`);
}

async function token(agenciaId: string, uso: "sessao" | "admin" = "sessao", extra: Record<string, unknown> = {}) {
  return new SignJWT({ agenciaId, ...extra }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("1h").sign(chaveDe(uso));
}

async function chamar(cookie: string | null, metodo: string, caminho: string, corpo?: unknown) {
  const r = await fetch(BASE + caminho, {
    method: metodo,
    redirect: "manual",
    headers: { ...(cookie ? { Cookie: cookie } : {}), ...(corpo !== undefined ? { "Content-Type": "application/json" } : {}) },
    body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
  });
  const texto = await r.text().catch(() => "");
  let json: { ok?: boolean } | null = null;
  try {
    json = JSON.parse(texto);
  } catch {
    // resposta não é JSON (página, PDF, zip)
  }
  return { status: r.status, texto, json, local: r.headers.get("location") ?? "" };
}

/** Bloqueado = erro HTTP, redirecionamento para fora, ou { ok: false }; e a resposta não pode conter dados da B. */
const negado = (r: Awaited<ReturnType<typeof chamar>>) =>
  (r.status >= 400 || (r.status >= 300 && r.status < 400) || r.json?.ok === false) && !r.texto.includes(MARCA_B);

async function criarAgencia(letra: "A" | "B") {
  const [a] = await db
    .insert(agencias)
    .values({
      nome: letra === "B" ? `Agência ${MARCA_B}` : `Agência ISOLAMENTO-A-${sufixo}`,
      email: `isolamento-${letra.toLowerCase()}-${sufixo}@teste.invalid`,
      senhaHash: randomBytes(16).toString("hex"),
      plano: "growth",
      termosVersao: "teste",
      termosAceitosEm: new Date(),
      onboardingConcluidoEm: new Date(),
    })
    .returning();
  return a;
}

const ids: string[] = [];
try {
  const A = await criarAgencia("A");
  const B = await criarAgencia("B");
  ids.push(A.id, B.id);
  const cookieA = `dattis_session=${await token(A.id)}`;
  const cookieB = `dattis_session=${await token(B.id)}`;

  // ---------- Dados da B (criados pela própria B, pelo caminho normal) ----------
  const conta = await chamar(cookieB, "POST", "/api/contas", {
    nome: `Cliente ${MARCA_B}`,
    contatoNome: `Contato ${MARCA_B}`,
    contatoEmail: `contato-${sufixo}@teste.invalid`,
    ferramentas: ["meta-ads", "whatsapp-business"],
  });
  const contaB = (conta.json as { conta?: { id: string } } | null)?.conta?.id ?? "";
  const dpaB = (conta.json as { dpaId?: string } | null)?.dpaId ?? "";
  checar(!!contaB && !!dpaB, "a agência B consegue criar o próprio cliente (pré-condição)");
  const contaA = ((await chamar(cookieA, "POST", "/api/contas", { nome: `Cliente ISOLAMENTO-A-${sufixo}` })).json as { conta?: { id: string } } | null)?.conta?.id ?? "";
  checar(!!contaA, "a agência A consegue criar o próprio cliente (pré-condição)");

  await chamar(cookieB, "POST", "/api/ferramentas", { nome: `Ferramenta ${MARCA_B}`, categoriaId: "crm", site: "https://exemplo.invalid" });
  const ferramentaB = await db.query.subprocessadoresCatalogo.findFirst({ where: eq(subprocessadoresCatalogo.agenciaId, B.id) });
  checar(!!ferramentaB, "a agência B consegue cadastrar ferramenta própria (pré-condição)");

  const novaAtividade = await chamar(cookieB, "POST", `/api/rat/${contaB}`, {
    nomeAtividade: `Atividade ${MARCA_B}`,
    categoriasDado: "Nome e e-mail",
    finalidade: "Teste de isolamento",
    baseLegal: "Execução de contrato",
    titulares: "Clientes",
    prazoRetencao: "1 ano",
  });
  const atividadeB = (novaAtividade.json as { atividade?: typeof atividadesTratamento.$inferSelect } | null)?.atividade;
  checar(!!atividadeB, "a agência B consegue registrar uma atividade (pré-condição)");
  const [pedidoB] = await db
    .insert(pedidosTitular)
    .values({ agenciaId: B.id, contaClienteId: contaB, protocolo: `ISO-${sufixo}`, nome: `Titular ${MARCA_B}`, email: `titular-${sufixo}@teste.invalid`, tipo: "acesso", prazo: new Date(Date.now() + 15 * 86_400_000) })
    .returning();
  const [usuarioB] = await db.insert(usuarios).values({ agenciaId: B.id, nome: `Pessoa ${MARCA_B}`, email: `equipe-${sufixo}@teste.invalid` }).returning();
  const [certB] = await db
    .insert(certificados)
    .values({ agenciaId: B.id, contaClienteId: contaB, codigo: `ISO${sufixo}`.toUpperCase(), titular: `Cliente ${MARCA_B}`, validoAte: new Date(Date.now() + 365 * 86_400_000) })
    .returning();

  const antes = {
    conta: await db.query.contasCliente.findFirst({ where: eq(contasCliente.id, contaB) }),
    atividade: atividadeB,
    dpa: await db.query.dpas.findFirst({ where: eq(dpas.id, dpaB) }),
    pedido: pedidoB,
    usuario: usuarioB,
    cert: certB,
    ferramentas: await db.query.contaSubprocessadores.findMany({ where: eq(contaSubprocessadores.contaClienteId, contaB) }),
  };

  // ---------- Sem login ----------
  checar((await chamar(null, "GET", "/api/contas")).status === 401, "sem login: a API de clientes recusa");
  checar((await chamar(null, "GET", `/painel/contas/${contaB}`)).local.includes("/entrar"), "sem login: o painel manda para /entrar");

  // ---------- Tokens falsos ----------
  const falso = await new SignJWT({ agenciaId: B.id }).setProtectedHeader({ alg: "HS256" }).sign(new TextEncoder().encode("chave-errada"));
  checar(negado(await chamar(`dattis_session=${falso}`, "GET", "/api/contas")), "token assinado com outra chave é recusado");
  checar(negado(await chamar(`dattis_admin=${await token(A.id)}`, "GET", "/api/admin/sistema")), "token de agência não vale como admin");
  checar(negado(await chamar(`dattis_session=${await token(B.id, "sessao", { operador: "Intruso" })}`, "GET", "/api/contas")), "sessão de operador (DPO) sem login de admin é recusada");

  // ---------- A tentando acessar/alterar dados da B pela API ----------
  const ataques: [string, string, unknown?][] = [
    ["GET", `/api/rat/${contaB}`],
    ["POST", `/api/rat/${contaB}`, { nome: "invasão" }],
    ["PATCH", `/api/rat/${contaB}`, { id: atividadeB?.id, finalidade: "invasão" }],
    ["PATCH", `/api/rat/${contaA}`, { id: atividadeB?.id, finalidade: "invasão" }], // conta da A, atividade da B
    ["PATCH", `/api/contas/${contaB}`, { nome: "invasão" }],
    ["DELETE", `/api/contas/${contaB}`],
    ["PUT", `/api/contas/${contaB}/ferramentas`, { chaves: [], personalizadas: [] }],
    ["POST", `/api/contas/${contaB}/dat-link`],
    ["DELETE", `/api/contas/${contaB}/dat-link`],
    ["GET", `/api/dpa/${dpaB}`],
    ["GET", `/api/dpa/${dpaB}/pdf`],
    ["POST", `/api/dpa/${dpaB}/assinar`, { nome: "invasão", cargo: "x", aceite: true }],
    ["POST", `/api/dpa/${dpaB}/link`],
    ["DELETE", `/api/dpa/${dpaB}/link`],
    ["PATCH", `/api/titulares/${pedidoB.id}`, { status: "respondido", resposta: "invasão" }],
    ["PATCH", `/api/equipe/${usuarioB.id}`, { nome: "invasão" }],
    ["DELETE", `/api/equipe/${usuarioB.id}`],
    ["DELETE", `/api/ferramentas/${ferramentaB?.id}`],
    ["PATCH", `/api/certificados/${certB.id}`],
    ["POST", "/api/cookies", { contaId: contaB, cor: "#ff0000" }],
    ["POST", "/api/cookies/verificar", { contaId: contaB }],
    ["POST", "/api/vigilancia", { contaId: contaB }],
    ["POST", "/api/politica", { contaId: contaB }],
    ["DELETE", `/api/politica?contaId=${contaB}`],
    ["POST", "/api/certificados", { contaId: contaB, dominio: "invasao.invalid" }],
  ];
  for (const [metodo, caminho, corpo] of ataques) {
    checar(negado(await chamar(cookieA, metodo, caminho, corpo)), `A não consegue ${metodo} ${caminho.replace(/[0-9a-f-]{36}/g, "{id-da-B}")}`);
  }

  // Ferramenta própria da B não pode ser usada num cliente da A.
  await chamar(cookieA, "PUT", `/api/contas/${contaA}/ferramentas`, { chaves: [ferramentaB?.chave], personalizadas: [] });
  const ligadas = await db.query.contaSubprocessadores.findMany({ where: eq(contaSubprocessadores.contaClienteId, contaA) });
  checar(!ligadas.some((l) => l.subprocessadorCatalogoId === ferramentaB?.id), "A não consegue usar a ferramenta própria da B");

  // ---------- Listagens e páginas da A não mostram nada da B ----------
  for (const caminho of ["/api/contas", "/api/ferramentas"]) {
    const r = await chamar(cookieA, "GET", caminho);
    checar(r.status === 200 && !r.texto.includes(MARCA_B), `GET ${caminho} da A não lista nada da B`);
  }
  const paginasDaB = [`/painel/contas/${contaB}`, `/painel/contas/${contaB}/editar`, `/painel/contas/${contaB}/dat`, `/painel/dossie/${contaB}`];
  for (const caminho of paginasDaB) {
    const r = await chamar(cookieA, "GET", caminho);
    checar(!r.texto.includes(MARCA_B), `página ${caminho.replace(contaB, "{id-da-B}")} não mostra dados da B para A`);
  }
  const paginasDaA = ["/painel", "/painel/contas", "/painel/titulares", "/painel/documentos", "/painel/certificados", "/painel/subprocessadores", "/painel/relatorio", "/painel/vigilancia", "/painel/cookies", "/painel/configuracoes", "/painel/dossie"];
  for (const caminho of paginasDaA) {
    const r = await chamar(cookieA, "GET", caminho);
    checar(!r.texto.includes(MARCA_B), `página ${caminho} da A não mostra nada da B`);
  }

  // ---------- Nada da B mudou ----------
  const depois = {
    conta: await db.query.contasCliente.findFirst({ where: eq(contasCliente.id, contaB) }),
    atividade: await db.query.atividadesTratamento.findFirst({ where: eq(atividadesTratamento.id, atividadeB?.id ?? "") }),
    dpa: await db.query.dpas.findFirst({ where: eq(dpas.id, dpaB) }),
    pedido: await db.query.pedidosTitular.findFirst({ where: eq(pedidosTitular.id, pedidoB.id) }),
    usuario: await db.query.usuarios.findFirst({ where: eq(usuarios.id, usuarioB.id) }),
    cert: await db.query.certificados.findFirst({ where: eq(certificados.id, certB.id) }),
    ferramenta: ferramentaB ? await db.query.subprocessadoresCatalogo.findFirst({ where: eq(subprocessadoresCatalogo.id, ferramentaB.id) }) : null,
    ferramentas: await db.query.contaSubprocessadores.findMany({ where: eq(contaSubprocessadores.contaClienteId, contaB) }),
  };
  const igual = (x: unknown, y: unknown) => JSON.stringify(x) === JSON.stringify(y);
  checar(igual(antes.conta, depois.conta), "o cliente da B continua intacto");
  checar(igual(antes.atividade, depois.atividade), "o registro (RAT) da B continua intacto");
  checar(igual(antes.dpa, depois.dpa), "o contrato (DPA) da B continua intacto");
  checar(igual(antes.pedido, depois.pedido), "o pedido de titular da B continua intacto");
  checar(igual(antes.usuario, depois.usuario), "a equipe da B continua intacta");
  checar(igual(antes.cert, depois.cert), "o certificado da B continua intacto");
  checar(!!depois.ferramenta, "a ferramenta própria da B continua existindo");
  checar(igual(antes.ferramentas, depois.ferramentas), "as ferramentas do cliente da B continuam intactas");
} catch (e) {
  falhas.push(`erro inesperado: ${e instanceof Error ? e.message : String(e)}`);
  console.error(e);
} finally {
  if (ids.length) await db.delete(agencias).where(inArray(agencias.id, ids)); // apaga tudo das duas (cascata)
}

console.log(`\n${total - falhas.length}/${total} verificações passaram.`);
if (falhas.length) {
  console.log("Falhas:\n- " + falhas.join("\n- "));
  process.exit(1);
}
process.exit(0);
