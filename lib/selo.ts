import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { buscarPorCodigo, statusCertificado } from "@/lib/certificados";

// Selo do certificado de privacidade (rodapé dos sites). SVG para colar no site, sempre com o status do dia;
// PNG para baixar (materiais, apresentações, e-mail). Duas versões: clara e escura.

export type TemaSelo = "claro" | "escuro";
export type EstadoSelo = "ok" | "pendente" | "invalido";

export const SELO_LARGURA = 570;
export const SELO_ALTURA = 100;

const TEXTOS: Record<EstadoSelo, [string, string]> = {
  ok: ["Este site passa por verificações diárias de", "privacidade e segurança de dados, conforme a LGPD"],
  pendente: ["Documentação de privacidade em atualização.", "A verificação diária será retomada em breve."],
  invalido: ["Este certificado de privacidade", "não está mais válido."],
};

export const CORES: Record<TemaSelo, { fundo: string; borda: string; texto: string; codigo: Record<EstadoSelo, string>; raio: number }> = {
  claro: { fundo: "#ffffff", borda: "#dfe5e2", texto: "#1c2422", codigo: { ok: "#1f8a5b", pendente: "#b45309", invalido: "#c0392b" }, raio: 16 },
  escuro: { fundo: "#002820", borda: "#002820", texto: "#ffffff", codigo: { ok: "#6ceead", pendente: "#f5a35c", invalido: "#ff8a7a" }, raio: 50 },
};

export const temaDe = (v: string | null): TemaSelo => (v === "escuro" ? "escuro" : "claro");

export async function dadosSelo(codigo: string) {
  const cert = await buscarPorCodigo(codigo);
  const status = cert ? await statusCertificado(cert) : null;
  const estado: EstadoSelo = !cert || !status?.valido ? "invalido" : status.emDia ? "ok" : "pendente";
  return { estado, codigo: cert?.codigo ?? codigo.toUpperCase(), linhas: TEXTOS[estado] };
}

let logos: Record<TemaSelo, string> | null = null;
/** Logo em base64: o SVG usado dentro de <img> não carrega imagens externas. */
export async function logoBase64(tema: TemaSelo) {
  if (!logos) {
    const [claro, escuro] = await Promise.all([
      readFile(join(process.cwd(), "public/brand/logo-fundo-claro.png"), "base64"),
      readFile(join(process.cwd(), "public/brand/logo-fundo-dark.png"), "base64"),
    ]);
    logos = { claro, escuro };
  }
  return logos[tema];
}
