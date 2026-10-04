import type { Achado } from "@/lib/vigilancia-tipos";

// Cada alerta da vigilância dito como ação, para quem não é técnico:
// o que fazer, quem resolve (a agência no painel, ou quem cuida do site) e, quando é com o
// desenvolvedor, a mensagem pronta para mandar no WhatsApp ou por e-mail.

export type AcaoAchado = {
  acao: string; // o que fazer, em português de dono de agência
  quem: "agencia" | "site";
  /** Pedido ao desenvolvedor (só quando quem = "site"). */
  pedido?: string;
};

const ACOES: Record<string, AcaoAchado> = {
  "site-invalido": { acao: "Corrigir o endereço do site no cadastro do cliente", quem: "agencia" },
  "site-fora": {
    acao: "Ver com quem cuida do site por que ele não abriu",
    quem: "site",
    pedido: "o site não abriu na verificação de hoje (fora do ar ou bloqueando acessos). Consegue conferir a hospedagem?",
  },
  "site-erro": {
    acao: "Ver com quem cuida do site o erro na página principal",
    quem: "site",
    pedido: "a página principal do site está respondendo com erro. Consegue conferir?",
  },
  "sem-https": {
    acao: "Pedir para ativar o cadeado de segurança (HTTPS) no site",
    quem: "site",
    pedido: "o site está sem o cadeado de segurança (HTTPS). Consegue ativar o certificado SSL na hospedagem? Normalmente é gratuito e leva poucos minutos.",
  },
  "ssl-invalido": {
    acao: "Pedir para corrigir o cadeado de segurança do site",
    quem: "site",
    pedido: "o certificado de segurança (SSL) do site está inválido ou vencido, e o navegador mostra alerta para quem visita. Consegue renovar na hospedagem?",
  },
  "ssl-vencendo": {
    acao: "Pedir para conferir a renovação do cadeado de segurança",
    quem: "site",
    pedido: "o certificado de segurança (SSL) do site vence em breve. Consegue confirmar que a renovação automática está ligada na hospedagem?",
  },
  "http-sem-redirect": {
    acao: "Pedir para mandar todo acesso para a versão segura do site",
    quem: "site",
    pedido: "quem digita o endereço sem https cai numa versão sem segurança. Consegue configurar o redirecionamento 301 de http para https?",
  },
  "conteudo-misto": {
    acao: "Pedir para trocar arquivos sem segurança no site",
    quem: "site",
    pedido: "a página carrega alguns scripts ou imagens por http:// (sem segurança). Consegue trocar esses endereços por https:// no tema ou no código?",
  },
  cabecalhos: {
    acao: "Pedir para ligar as proteções extras de segurança do site",
    quem: "site",
    pedido:
      "faltam cabeçalhos de segurança no site (como Strict-Transport-Security e X-Content-Type-Options). Consegue ativar na hospedagem ou no Cloudflare?",
  },
  "pixel-sem-consentimento": {
    acao: "Instalar o aviso de cookies: o pixel está rodando sem a permissão do visitante",
    quem: "site",
    pedido:
      "o Pixel do Meta e as tags do Google estão disparando antes de o visitante aceitar os cookies, o que a LGPD não permite. Preciso instalar o aviso de cookies da Dattis, que segura essas tags até o aceite.",
  },
  "sem-politica": {
    acao: "Colocar o link da política de privacidade no rodapé do site",
    quem: "site",
    pedido: "o site não tem link para a política de privacidade. Consegue colocar no rodapé de todas as páginas o link que vou te mandar?",
  },
  "selo-ausente": {
    acao: "Colocar o selo de privacidade no rodapé do site",
    quem: "site",
    pedido: "quero colocar o selo de privacidade da Dattis no rodapé do site. Vou te mandar o código: é só colar antes do fechamento do rodapé.",
  },
  "dpa-pendente": { acao: "Concluir as assinaturas do contrato com o cliente", quem: "agencia" },
  "rat-vazio": { acao: "Marcar o que a agência faz com os dados do cliente", quem: "agencia" },
  "sem-ferramentas": { acao: "Escolher as ferramentas que recebem os dados do cliente", quem: "agencia" },
  certificado: { acao: "Emitir de novo o certificado de privacidade", quem: "agencia" },
  "sem-site": { acao: "Cadastrar o site do cliente", quem: "agencia" },
};

export function acaoDoAchado(a: Pick<Achado, "codigo" | "titulo" | "correcao">): AcaoAchado {
  return ACOES[a.codigo] ?? { acao: a.correcao ?? a.titulo, quem: "agencia" };
}

/** Mensagem completa para quem cuida do site do cliente. */
export function mensagemParaDev(clienteNome: string, site: string | null, pedido: string) {
  const endereco = site ? ` (${site.replace(/^https?:\/\//, "")})` : "";
  return `Oi! Sou da agência que cuida do marketing da ${clienteNome}. A verificação diária de privacidade e segurança do site${endereco} mostrou que ${pedido} Obrigado!`;
}
