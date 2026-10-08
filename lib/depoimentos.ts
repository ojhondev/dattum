// Depoimentos reais de agências clientes (enviados pelo dono em 2026-10-08), usados na home e na landing de anúncios.
export type Depoimento = { quote: string; name: string; agencia: string; foto: string };

export const DEPOIMENTOS: Depoimento[] = [
  {
    quote:
      "A Dattis identificou os principais riscos e nos mostrou exatamente o que precisava ser ajustado. Hoje temos muito mais segurança no tratamento dos dados.",
    name: "Rafael",
    agencia: "SPOT",
    foto: "/depoimentos/rafael-spot.jpg",
  },
  {
    quote:
      "A Dattis tornou a adequação à LGPD muito mais simples. Tivemos um diagnóstico claro e um plano objetivo para colocar tudo em ordem.",
    name: "Letícia",
    agencia: "Storica Media",
    foto: "/depoimentos/leticia-storica-media.jpg",
  },
];
