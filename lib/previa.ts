/**
 * Prévia de conteúdo pago para contas em exploração: o começo fica legível e o resto vai embaralhado
 * (mesmo formato de linhas e pontuação, letras trocadas), para ser exibido borrado. Como o texto real
 * nem chega ao navegador, não dá para copiar pelo código-fonte da página.
 */
const MIN = "abcdefghijklmnopqrstuvwxyz";
const MAI = MIN.toUpperCase();

export function embaralhar(texto: string) {
  let semente = 7;
  return texto.replace(/[A-Za-zÀ-ÿ0-9]/g, (c) => {
    semente = (semente * 31 + 17) % 9973;
    if (/[0-9]/.test(c)) return String(semente % 10);
    const alfabeto = c === c.toUpperCase() && c !== c.toLowerCase() ? MAI : MIN;
    return alfabeto[semente % 26];
  });
}

/** Divide o texto no primeiro marcador encontrado (ex.: a cláusula 2). Sem marcador, mostra ~25% das linhas. */
export function dividirPrevia(texto: string, marcadores: RegExp[] = []) {
  for (const m of marcadores) {
    const i = texto.search(m);
    if (i > 0) return { visivel: texto.slice(0, i).trimEnd(), oculto: embaralhar(texto.slice(i)) };
  }
  const linhas = texto.split("\n");
  const corte = Math.max(3, Math.ceil(linhas.length * 0.25));
  return { visivel: linhas.slice(0, corte).join("\n"), oculto: embaralhar(linhas.slice(corte).join("\n")) };
}
