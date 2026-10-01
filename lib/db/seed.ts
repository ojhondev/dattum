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
      "Veiculação de anúncios no Facebook e Instagram, públicos criados com lista de clientes, formulários de cadastro e envio de vendas pela API de Conversões (dado criptografado).",
  },
  {
    chave: "google-ads",
    nome: "Google Ads / Google Analytics",
    categoria: "Publicidade",
    pais: "Estados Unidos",
    finalidadePadrao:
      "Veiculação de anúncios, tag do Google no site, públicos com lista de clientes (Customer Match) e conversões otimizadas.",
  },
  {
    chave: "tiktok-ads",
    nome: "TikTok Ads",
    categoria: "Publicidade",
    pais: "Singapura",
    finalidadePadrao: "Veiculação de anúncios, Pixel do TikTok e envio de conversões pelo servidor (Events API).",
  },
  {
    chave: "whatsapp-business",
    nome: "WhatsApp Business API",
    categoria: "Atendimento",
    pais: "Estados Unidos",
    finalidadePadrao: "Conversas com leads que chegam pelos anúncios de clique pro WhatsApp e pelo atendimento.",
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
      .onConflictDoUpdate({
        target: schema.subprocessadoresCatalogo.chave,
        set: { nome: item.nome, categoria: item.categoria, pais: item.pais, finalidadePadrao: item.finalidadePadrao },
      });
  }
  console.log(`Catálogo semeado: ${CATALOGO.length} subprocessadores.`);
}

main().then(() => process.exit(0));
