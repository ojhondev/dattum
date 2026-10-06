import dns from "node:dns/promises";
import net from "node:net";

// Bloqueio de endereço interno para tudo que a Dattis busca na internet a pedido de alguém
// (auditoria gratuita, vigilância, verificação de cookies): sem isso, um "site" digitado
// poderia fazer o servidor acessar a rede interna (SSRF).

function ipv4Privado(ip: string) {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 || a === 10 || a === 127 || a >= 224 || // rede "esta", privada, loopback, multicast e reservados
    (a === 100 && b >= 64 && b <= 127) || // CGNAT
    (a === 169 && b === 254) || // link-local (metadados de nuvem)
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19))
  );
}

export function ipPrivado(ip: string) {
  if (net.isIPv4(ip)) return ipv4Privado(ip);
  const v = ip.toLowerCase().replace(/^\[|\]$/g, "");
  const mapeado = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapeado) return ipv4Privado(mapeado[1]);
  return v === "::1" || v === "::" || v.startsWith("::ffff:") || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80") || v.startsWith("ff");
}

/** true se o host resolve só para IPs públicos. Na dúvida (DNS falhou), bloqueia. */
export async function hostPublico(hostname: string) {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (!h || h === "localhost" || h.endsWith(".localhost") || h.endsWith(".internal") || h.endsWith(".local")) return false;
  if (net.isIP(h)) return !ipPrivado(h);
  if (!h.includes(".")) return false;
  try {
    const ips = await dns.lookup(h, { all: true });
    return ips.length > 0 && ips.every((r) => !ipPrivado(r.address));
  } catch {
    return false;
  }
}

/** Versão com cache por host, para checar cada requisição de um navegador sem repetir DNS. */
export function verificadorDeHosts() {
  const cache = new Map<string, Promise<boolean>>();
  return (hostname: string) => {
    const h = hostname.toLowerCase();
    let p = cache.get(h);
    if (!p) {
      p = hostPublico(h);
      cache.set(h, p);
    }
    return p;
  };
}
