// Celular brasileiro (WhatsApp): máscara enquanto digita e validação contra números falsos.
// Vale no navegador e no servidor.

const DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49,
  51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89,
  91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

/** Só os dígitos com DDD, sem o 55 do Brasil. */
export function digitosCelular(v: string) {
  const d = v.replace(/\D/g, "");
  return (d.length > 11 && d.startsWith("55") ? d.slice(2) : d).slice(0, 11);
}

/** (11) 99999-9999, formatando aos poucos enquanto a pessoa digita. */
export function mascaraCelular(v: string) {
  const d = digitosCelular(v);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Mensagem do problema, ou null se o celular parece real. */
export function problemaNoCelular(v: string) {
  const d = digitosCelular(v);
  if (d.length !== 11) return "Informe o celular com DDD: (11) 99999-9999.";
  if (!DDDS.has(Number(d.slice(0, 2)))) return "Esse DDD não existe. Confira o número.";
  if (d[2] !== "9") return "Celular começa com 9 depois do DDD. Confira o número.";
  const assinante = d.slice(3);
  // Repetido ("99999-9999"), quase só dois algarismos ("99990-0000") ou sequência ("91234-5678").
  if (new Set(assinante).size <= 2 || "0123456789".includes(assinante) || "9876543210".includes(assinante)) {
    return "Esse número não parece real. Informe o seu WhatsApp.";
  }
  return null;
}

/** Celular válido em 11 dígitos (DDD + número), ou null. */
export const celularValido = (v: unknown) => (typeof v === "string" && !problemaNoCelular(v) ? digitosCelular(v) : null);
