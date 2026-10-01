// Endereço canônico do site. Troque NEXT_PUBLIC_SITE_URL quando o domínio próprio (ex.: dattis.com.br) estiver no ar.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://dattum-rho.vercel.app").replace(/\/$/, "");
export const SITE_NOME = "Dattis";
export const SITE_DESCRICAO =
  "Compliance LGPD para agências de tráfego pago: registro de tratamento, contrato com o cliente, certificado de privacidade, vigilância diária e dossiê para BM suspensa.";

export const urlAbsoluta = (caminho = "/") => (/^https?:\/\//.test(caminho) ? caminho : `${SITE_URL}${caminho.startsWith("/") ? "" : "/"}${caminho}`);
