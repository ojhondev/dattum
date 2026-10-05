// Endereço canônico do site (domínio próprio). NEXT_PUBLIC_SITE_URL sobrescreve, ex. para testes.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.dattis.com.br").replace(/\/$/, "");
export const SITE_NOME = "Dattis";
export const SITE_DESCRICAO =
  "A Dattis é o DPO das agências de tráfego pago: cuidamos da LGPD de cada cliente que você atende, com contratos, registros, cookies, pedidos de titulares e vigilância diária.";

export const urlAbsoluta = (caminho = "/") => (/^https?:\/\//.test(caminho) ? caminho : `${SITE_URL}${caminho.startsWith("/") ? "" : "/"}${caminho}`);
