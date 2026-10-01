import { imagemOg, OG_SIZE } from "@/lib/og";

export const alt = "Dattis — LGPD para agências de tráfego pago";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return imagemOg({
    eyebrow: "LGPD · Tráfego pago",
    titulo: "Agência de Tráfego: descumprir a LGPD gera multas.",
    rodape: "Registro, contrato, certificado e vigilância diária",
  });
}
