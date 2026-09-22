import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const CATALOGO = [
  {
    chave: "meta-ads",
    nome: "Meta Ads (Facebook/Instagram)",
    categoria: "Publicidade",
    pais: "Estados Unidos",
    finalidadePadrao:
      "Veiculação de anúncios, Custom Audiences e Conversions API (CAPI) com dado de conversão hasheado.",
  },
  {
    chave: "google-ads",
    nome: "Google Ads / Google Analytics",
    categoria: "Publicidade",
    pais: "Estados Unidos",
    finalidadePadrao:
      "Veiculação de anúncios, Enhanced Conversions e mensuração de audiência do site.",
  },
  {
    chave: "tiktok-ads",
    nome: "TikTok Ads",
    categoria: "Publicidade",
    pais: "Singapura",
    finalidadePadrao: "Veiculação de anúncios e eventos de conversão via TikTok Events API.",
  },
  {
    chave: "whatsapp-business",
    nome: "WhatsApp Business API",
    categoria: "Atendimento",
    pais: "Estados Unidos",
    finalidadePadrao: "Atendimento e qualificação de lead recebido por campanha.",
  },
  {
    chave: "rd-station",
    nome: "RD Station",
    categoria: "CRM/Automação",
    pais: "Brasil",
    finalidadePadrao: "Armazenamento e automação de lead capturado em formulário/landing page.",
  },
  {
    chave: "zapier",
    nome: "Zapier",
    categoria: "Automação",
    pais: "Estados Unidos",
    finalidadePadrao: "Integração automática entre ferramentas para roteamento de lead.",
  },
] as const;

async function main() {
  for (const item of CATALOGO) {
    await db
      .insert(schema.subprocessadoresCatalogo)
      .values(item)
      .onConflictDoNothing({ target: schema.subprocessadoresCatalogo.chave });
  }
  console.log(`Catálogo semeado: ${CATALOGO.length} subprocessadores.`);
}

main().then(() => process.exit(0));
