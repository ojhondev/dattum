// CNPJ: dígitos verificadores, consulta à Receita (BrasilAPI, com a Minha Receita de reserva)
// e conferência de que o CNPJ é mesmo da agência (nome bate com a razão social ou o nome fantasia).

export const digitosCnpj = (v: string) => v.replace(/\D/g, "").slice(0, 14);

export function mascaraCnpj(v: string) {
  const d = digitosCnpj(v);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function cnpjValido(v: string) {
  const d = digitosCnpj(v);
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const dv = (base: string) => {
    const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const r = base.split("").reduce((s, n, i) => s + Number(n) * pesos[i], 0) % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return dv(d.slice(0, 12)) === Number(d[12]) && dv(d.slice(0, 13)) === Number(d[13]);
}

export type DadosReceita = { razaoSocial: string; nomeFantasia: string | null; situacao: string; endereco: string | null };

async function buscar(url: string) {
  const r = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "Dattis/1.0 (+https://www.dattis.com.br)" }, signal: AbortSignal.timeout(8000), cache: "no-store" });
  if (r.status === 404 || r.status === 400) return "inexistente" as const;
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()) as Record<string, unknown>;
}

/** Dados da Receita, "inexistente" se o CNPJ não existe, ou null se as consultas estão fora do ar. */
export async function consultarCnpj(cnpj: string): Promise<DadosReceita | "inexistente" | null> {
  const d = digitosCnpj(cnpj);
  for (const url of [`https://brasilapi.com.br/api/cnpj/v1/${d}`, `https://minhareceita.org/${d}`]) {
    try {
      const j = await buscar(url);
      if (j === "inexistente") return j;
      const s = (k: string) => (typeof j[k] === "string" && (j[k] as string).trim() ? (j[k] as string).trim() : null);
      const endereco = [s("descricao_tipo_de_logradouro"), s("logradouro")].filter(Boolean).join(" ");
      return {
        razaoSocial: s("razao_social") ?? "",
        nomeFantasia: s("nome_fantasia"),
        situacao: (s("descricao_situacao_cadastral") ?? "").toUpperCase(),
        endereco: endereco
          ? `${endereco}, ${s("numero") ?? "s/n"}${s("complemento") ? ` ${s("complemento")}` : ""} - ${s("bairro") ?? ""}, ${s("municipio") ?? ""}/${s("uf") ?? ""}`.replace(/\s+-\s+,/, ",")
          : null,
      };
    } catch (err) {
      console.error("[cnpj]", url.split("/")[2], (err as Error).message);
    }
  }
  return null;
}

// Palavras que não identificam a empresa: tipo societário e termos genéricos do setor.
const GENERICAS = new Set(
  "ltda me epp eireli sa s a ss slu mei cia companhia agencia de da do das dos e em the and marketing digital publicidade propaganda comunicacao comunicacoes midia midias solucoes servicos servico consultoria assessoria grupo studio estudio performance trafego pago online web social media".split(" "),
);
const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, " ");
const palavras = (s: string) => normalizar(s).split(/\s+/).filter((p) => p.length >= 2 && !GENERICAS.has(p));

/** O nome informado pela agência bate com a razão social ou o nome fantasia? */
export function nomeConfere(nome: string, r: DadosReceita) {
  const alvo = [r.razaoSocial, r.nomeFantasia ?? ""].join(" ");
  const nossas = palavras(nome);
  const deles = new Set(palavras(alvo));
  if (nossas.some((p) => p.length >= 3 && deles.has(p))) return true;
  // Nomes colados ou abreviados: "PulseAds" x "PULSE ADS LTDA".
  const junto = (s: string) => normalizar(s).replace(/\s+/g, "");
  const a = palavras(nome).join("");
  return a.length >= 4 && [r.razaoSocial, r.nomeFantasia ?? ""].some((x) => junto(x).includes(a));
}

/**
 * Valida o CNPJ da agência. Erro (mensagem) quando é inválido, não existe, não está ativo ou é de outra empresa.
 * Se a Receita estiver fora do ar, aceita só pelos dígitos verificadores (não trava o cadastro por instabilidade).
 */
export async function verificarCnpjAgencia(cnpj: string, nomeAgencia: string) {
  if (!cnpjValido(cnpj)) return { ok: false as const, erro: "Esse CNPJ não é válido. Confira os números." };
  const r = await consultarCnpj(cnpj);
  if (r === "inexistente") return { ok: false as const, erro: "Esse CNPJ não foi encontrado na Receita Federal. Confira os números." };
  if (!r) return { ok: true as const, receita: null };
  if (r.situacao && r.situacao !== "ATIVA") return { ok: false as const, erro: `Esse CNPJ está com situação "${r.situacao.toLowerCase()}" na Receita Federal. Use o CNPJ ativo da agência.` };
  if (!nomeConfere(nomeAgencia, r)) {
    const nomeReceita = r.nomeFantasia ? `${r.razaoSocial} (${r.nomeFantasia})` : r.razaoSocial;
    return { ok: false as const, erro: `Esse CNPJ é da ${nomeReceita}. Confira o número ou ajuste o nome da agência.` };
  }
  return { ok: true as const, receita: r };
}
