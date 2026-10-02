import { baixarHtml } from "@/lib/vigilancia";

export type ItemVerificacao = { ok: boolean | null; titulo: string; detalhe: string };

/**
 * Confere a instalação do aviso de cookies no HTML do site: o script está lá, vem antes das tags
 * e o pixel do Meta colado direto está segurado (type="text/plain"). Sites montados só no navegador
 * (SPA) podem não mostrar tudo no HTML; por isso alguns itens saem como "não deu para conferir".
 */
export async function verificarInstalacao(site: string, token: string): Promise<{ alcancou: boolean; itens: ItemVerificacao[] }> {
  const r = await baixarHtml(site);
  if (!r) return { alcancou: false, itens: [{ ok: false, titulo: "Não conseguimos abrir o site", detalhe: "Confira se o endereço está certo e se o site está no ar." }] };
  const html = r.html;
  const itens: ItemVerificacao[] = [];

  const pos = html.indexOf(`/c/${token}.js`);
  itens.push(
    pos >= 0
      ? { ok: true, titulo: "Aviso de cookies instalado", detalhe: "A linha da Dattis foi encontrada no código do site." }
      : { ok: false, titulo: "Aviso de cookies não encontrado", detalhe: "A linha da Dattis não está no HTML do site. Confira o passo 1 e se a alteração foi publicada (alguns sites têm cache de alguns minutos)." },
  );

  const tags = [
    { nome: "Google Tag Manager", padrao: "googletagmanager.com/gtm.js" },
    { nome: "Google Analytics / Google Ads (gtag.js)", padrao: "googletagmanager.com/gtag/js" },
    { nome: "Pixel do Meta", padrao: "connect.facebook.net" },
  ].filter((t) => html.includes(t.padrao));
  if (pos >= 0) {
    const antes = tags.filter((t) => html.indexOf(t.padrao) < pos);
    itens.push(
      antes.length
        ? { ok: false, titulo: "Tags carregando antes do aviso", detalhe: `${antes.map((t) => t.nome).join(", ")} aparece antes da linha da Dattis. Mova a linha da Dattis para o topo do <head>, acima delas.` }
        : { ok: true, titulo: "Ordem certa", detalhe: tags.length ? "O aviso carrega antes das tags de medição e anúncio." : "Nenhuma tag de medição ou anúncio no HTML (elas podem estar dentro do Gerenciador de Tags)." },
    );
  }

  // Pixel do Meta colado direto no código, sem type="text/plain"
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  const pixelSolto = scripts.some(([, attrs, corpo]) => /fbq\(\s*['"]init['"]|connect\.facebook\.net/.test(corpo + attrs) && !/type\s*=\s*["']text\/plain["']/i.test(attrs));
  const pixelSeguro = scripts.some(([, attrs, corpo]) => /fbq\(|connect\.facebook\.net/.test(corpo + attrs) && /data-dattis-categoria/i.test(attrs));
  if (pixelSolto) itens.push({ ok: false, titulo: "Pixel do Meta dispara sem consentimento", detalhe: 'O código do pixel está colado direto no site. Troque <script> por <script type="text/plain" data-dattis-categoria="marketing"> (passo 2).' });
  else if (pixelSeguro) itens.push({ ok: true, titulo: "Pixel do Meta aguardando o aceite", detalhe: "O pixel colado no site só roda depois que o visitante aceitar." });
  if (/facebook\.com\/tr\?id=/.test(html)) itens.push({ ok: false, titulo: "Imagem do pixel (noscript) ainda no código", detalhe: "Remova o bloco <noscript> com facebook.com/tr do pixel: ele registra a visita mesmo sem consentimento." });

  if (html.includes("googletagmanager.com/gtm.js")) {
    itens.push({ ok: null, titulo: "Confira dentro do Gerenciador de Tags", detalhe: "Não dá para ver de fora as tags do GTM. Siga o passo 2 (aba Google Tag Manager) para o Pixel do Meta e outras tags." });
  }
  itens.push(
    /data-dattis-cookies/.test(html)
      ? { ok: true, titulo: "Link de preferências no site", detalhe: "O visitante consegue mudar a escolha quando quiser." }
      : { ok: null, titulo: "Link de preferências (opcional)", detalhe: "Não encontramos o link “Preferências de cookies”. O botão redondo do aviso também cumpre esse papel." },
  );
  return { alcancou: true, itens };
}
