"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CircleAlert, CircleHelp, Copy, Loader2, ShieldCheck } from "lucide-react";
import type { EstatisticaCookies } from "@/lib/cookies-stats";

type Config = { cor?: string; politicaUrl?: string; flutuante?: boolean };
type ItemVerificacao = { ok: boolean | null; titulo: string; detalhe: string };
export type EscolhaRecente = { quando: string; acao: string; estatisticas: boolean; marketing: boolean; url: string | null };

const ROTULO = "font-mono text-[11px] uppercase tracking-[0.05em] text-muted";
const CARD = "rounded-[20px] border border-line bg-surface p-5 sm:p-6";

function Codigo({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="my-2 flex items-start gap-2 rounded-xl bg-rail px-3 py-2.5">
      <code className="min-w-0 flex-1 whitespace-pre-wrap break-all font-mono text-[12px] leading-relaxed text-[#cff5e1]">{texto}</code>
      <button
        type="button"
        aria-label="Copiar"
        onClick={() => navigator.clipboard.writeText(texto).then(() => (setCopiado(true), setTimeout(() => setCopiado(false), 2000)))}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-white hover:bg-white/20"
      >
        {copiado ? <Check size={15} /> : <Copy size={15} />}
      </button>
    </div>
  );
}

function Passos({ children }: { children: React.ReactNode }) {
  return <ol className="flex list-decimal flex-col gap-3 pl-5 text-[14.5px] leading-relaxed text-body marker:font-mono marker:text-muted [&_b]:text-ink">{children}</ol>;
}

const PIXEL_ANTES = `<script>
  !function(f,b,e,v,n,t,s){...}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'SEU_PIXEL');
  fbq('track', 'PageView');
</script>`;
const PIXEL_DEPOIS = `<script type="text/plain" data-dattis-categoria="marketing">
  !function(f,b,e,v,n,t,s){...}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'SEU_PIXEL');
  fbq('track', 'PageView');
</script>`;

export function ConfigurarCookies({
  contaId,
  nome,
  siteInicial,
  token,
  config,
  politicaPadrao,
  estatistica,
  recentes,
  origem,
}: {
  contaId?: string;
  nome: string;
  siteInicial: string;
  token: string | null;
  config: Config | null;
  politicaPadrao: string | null;
  estatistica: EstatisticaCookies | null;
  recentes: EscolhaRecente[];
  origem: string;
}) {
  const router = useRouter();
  const [plataforma, setPlataforma] = useState("html");
  const [cor, setCor] = useState(config?.cor ?? "#002820");
  const [politica, setPolitica] = useState(config?.politicaUrl ?? "");
  const [flutuante, setFlutuante] = useState(config?.flutuante ?? true);
  const [estado, setEstado] = useState("");
  const [site, setSite] = useState(siteInicial);
  const [verificando, setVerificando] = useState(false);
  const [resultado, setResultado] = useState<{ itens: ItemVerificacao[]; site: string } | null>(null);
  const [erroVerificar, setErroVerificar] = useState("");

  const salvar = async () => {
    setEstado("salvando");
    const r = await fetch("/api/cookies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contaId, cor, politicaUrl: politica, flutuante }),
    })
      .then((x) => x.json())
      .catch(() => ({ ok: false }));
    setEstado(r.ok ? "salvo" : (r.error ?? "Não foi possível salvar."));
    if (!r.ok) return;
    // Fica no site que acabou de ser ativado/ajustado (a seleção padrão pularia para outro).
    router.replace(`/painel/cookies?site=${contaId ?? "agencia"}`, { scroll: false });
    router.refresh();
  };

  const verificar = async () => {
    setVerificando(true);
    setErroVerificar("");
    setResultado(null);
    const r = await fetch("/api/cookies/verificar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contaId, site }) })
      .then((x) => x.json())
      .catch(() => ({ ok: false }));
    setVerificando(false);
    if (!r.ok) return setErroVerificar(r.error ?? "Não foi possível verificar agora.");
    setResultado({ itens: r.itens, site: r.site });
  };

  if (!token) {
    return (
      <div className={CARD}>
        <p className={ROTULO}>Aviso de cookies · {nome}</p>
        <h2 className="mt-2 font-display text-[24px] leading-tight text-ink">Ative o aviso de cookies deste site</h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-body">
          O banner pede o consentimento do visitante, segura o Pixel do Meta e as tags do Google até ele aceitar (Modo de consentimento
          v2 do Google) e guarda a prova de cada escolha. Depois de ativar, você recebe uma linha de código e o passo a passo para a
          plataforma do site.
        </p>
        <button type="button" className="painel-btn mt-5" onClick={salvar} disabled={estado === "salvando"}>
          {estado === "salvando" ? "Ativando..." : "Ativar aviso de cookies"}
        </button>
      </div>
    );
  }

  const linha = `<script src="${origem}/c/${token}.js"></script>`;
  const pct = (n: number) => (estatistica?.total ? `${Math.round((n / estatistica.total) * 100)}%` : "—");

  const PLATAFORMAS: { id: string; nome: string; conteudo: React.ReactNode }[] = [
    {
      id: "html",
      nome: "Código do site (HTML)",
      conteudo: (
        <Passos>
          <li>
            Abra o arquivo do site que tem a tag <code className="font-mono">&lt;head&gt;</code> (normalmente o modelo usado em todas as páginas).
          </li>
          <li>
            Cole a linha da Dattis <b>logo depois de &lt;head&gt;</b>, acima de qualquer outro script:
            <Codigo texto={`<head>\n  ${linha}\n  <!-- depois vêm GTM, Analytics, pixels... -->`} />
          </li>
          <li>
            <b>Segure o Pixel do Meta:</b> no código do pixel, troque só a primeira linha. Antes:
            <Codigo texto={PIXEL_ANTES} />
            Depois:
            <Codigo texto={PIXEL_DEPOIS} />
          </li>
          <li>
            Apague o bloco <code className="font-mono">&lt;noscript&gt;</code> com <code className="font-mono">facebook.com/tr</code> que vem junto do pixel: ele
            registra a visita sem pedir consentimento.
          </li>
          <li>
            Ferramentas de medição (Hotjar, Microsoft Clarity): use <code className="font-mono">data-dattis-categoria=&quot;estatisticas&quot;</code>. Pixel do TikTok e
            LinkedIn: <code className="font-mono">&quot;marketing&quot;</code>.
          </li>
          <li>Google Analytics e Google Ads (gtag.js): não precisa mudar nada. Eles obedecem ao aviso sozinhos.</li>
        </Passos>
      ),
    },
    {
      id: "gtm",
      nome: "Google Tag Manager",
      conteudo: (
        <Passos>
          <li>
            No código do site, cole a linha da Dattis no <code className="font-mono">&lt;head&gt;</code>, <b>acima</b> do código do Gerenciador de Tags (o que tem{" "}
            <code className="font-mono">GTM-</code>):
            <Codigo texto={`<head>\n  ${linha}\n  <!-- Google Tag Manager -->\n  <script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXX');</script>`} />
          </li>
          <li>
            No GTM, vá em <b>Administrador → Configurações do contêiner</b>, marque <b>“Ativar visão geral de consentimento”</b> e salve.
          </li>
          <li>
            <b>Tags do Google</b> (Tag do Google / GA4, Google Ads, Floodlight): não precisa mexer. Elas já respeitam o aviso.
          </li>
          <li>
            <b>Pixel do Meta, TikTok, LinkedIn</b> e outras tags de anúncio: abra a tag → <b>Configurações avançadas → Configurações de consentimento</b> →{" "}
            <b>“Exigir consentimento adicional para o disparo da tag”</b> → adicione <code className="font-mono">ad_storage</code>.
          </li>
          <li>
            <b>Hotjar, Clarity</b> e ferramentas de medição: mesmo caminho, com <code className="font-mono">analytics_storage</code>.
          </li>
          <li>
            Clique em <b>Enviar → Publicar</b>. Opcional: o evento <code className="font-mono">dattis_consentimento</code> chega no GTM a cada escolha, se quiser criar
            acionadores com ele.
          </li>
        </Passos>
      ),
    },
    {
      id: "wordpress",
      nome: "WordPress",
      conteudo: (
        <Passos>
          <li>
            Em <b>Plugins → Adicionar novo</b>, instale e ative o <b>WPCode</b> (“Insert Headers and Footers”).
          </li>
          <li>
            Vá em <b>Code Snippets → Header &amp; Footer</b> e cole a linha da Dattis no campo <b>Header</b>, como primeira linha:
            <Codigo texto={linha} />
          </li>
          <li>Salve e desative outro plugin de banner de cookies que exista (CookieYes, Complianz, GDPR Cookie Consent), para não aparecerem dois.</li>
          <li>
            Pixel instalado por plugin (PixelYourSite, Official Facebook Pixel): ative no plugin a opção de aguardar consentimento ou passe o pixel para o
            Google Tag Manager e siga a aba GTM. Pixel colado em código: siga a aba “Código do site”.
          </li>
          <li>Se o site usa plugin de cache (WP Rocket, LiteSpeed), limpe o cache depois de salvar.</li>
        </Passos>
      ),
    },
    {
      id: "shopify",
      nome: "Shopify",
      conteudo: (
        <Passos>
          <li>
            No admin da Shopify: <b>Loja virtual → Temas</b> → no tema publicado, clique em <b>⋯ → Editar código</b>.
          </li>
          <li>
            Abra <b>layout/theme.liquid</b> e cole a linha da Dattis logo depois de <code className="font-mono">&lt;head&gt;</code>:
            <Codigo texto={linha} />
          </li>
          <li>Clique em Salvar.</li>
          <li>
            Pixels colados no tema (theme.liquid ou snippets): siga a aba “Código do site”. Pixels instalados pelos apps oficiais (Facebook &amp; Instagram,
            Google &amp; YouTube) são gerenciados pela própria Shopify. Se tiver dúvida sobre qual usar, fale com o especialista da Dattis.
          </li>
        </Passos>
      ),
    },
    {
      id: "outros",
      nome: "Wix, Nuvemshop e outros",
      conteudo: (
        <Passos>
          <li>
            Procure nas configurações do site a área de <b>código personalizado</b> (pode se chamar “Custom Code”, “Códigos externos”, “Scripts” ou
            “Head”).
          </li>
          <li>
            Adicione a linha da Dattis, escolha <b>todas as páginas</b> e a posição <b>Head</b>, carregando primeiro, antes de outros códigos:
            <Codigo texto={linha} />
          </li>
          <li>Se a plataforma já mostra um banner de cookies próprio, desligue para não aparecerem dois.</li>
          <li>Pixels colados como código: siga a aba “Código do site”. Pixels pelo Gerenciador de Tags: siga a aba GTM.</li>
        </Passos>
      ),
    },
  ];
  const atual = PLATAFORMAS.find((p) => p.id === plataforma)!;

  return (
    <div className="flex flex-col gap-5">
      {/* Números */}
      <div className={CARD}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className={ROTULO}>Aviso de cookies · {nome}</p>
            <h2 className="mt-1 font-display text-[24px] leading-tight text-ink">Escolhas dos visitantes</h2>
          </div>
          <span className="painel-pill ok">Ativo</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ["Escolhas (30 dias)", String(estatistica?.total ?? 0)],
            ["Aceitaram tudo", pct(estatistica?.aceitar ?? 0)],
            ["Recusaram", pct(estatistica?.recusar ?? 0)],
            ["Personalizaram", pct(estatistica?.personalizar ?? 0)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-canvas px-3 py-2.5">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.04em] text-muted">{k}</p>
              <p className="mt-1 font-display text-[24px] tabular-nums text-ink">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Passo 1 e 2 */}
      <div className={CARD} data-tour="cookies-instalar">
        <p className={ROTULO}>Passo 1 · Instalar e segurar os pixels</p>
        <h2 className="mt-1 font-display text-[22px] leading-tight text-ink">Onde o site foi feito?</h2>
        <p className="mt-1 text-[14px] text-muted">Escolha a plataforma e siga os passos. A linha da Dattis é a mesma em todas.</p>
        <Codigo texto={linha} />
        <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Plataforma do site">
          {PLATAFORMAS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={plataforma === p.id}
              onClick={() => setPlataforma(p.id)}
              className={"rounded-full px-3.5 py-2 text-[13.5px] " + (plataforma === p.id ? "bg-rail text-white" : "border border-line text-body hover:bg-surface-2")}
            >
              {p.nome}
            </button>
          ))}
        </div>
        <div className="mt-5">{atual.conteudo}</div>
      </div>

      {/* Passo 3: verificar */}
      <div className={CARD} data-tour="cookies-verificar">
        <p className={ROTULO}>Passo 2 · Conferir</p>
        <h2 className="mt-1 font-display text-[22px] leading-tight text-ink">Verifique se ficou certo</h2>
        <p className="mt-1 text-[14px] text-muted">A Dattis abre o site e confere se o aviso está lá, se vem antes das tags e se o pixel está segurado.</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            id={`ck-site-${contaId ?? "ag"}`}
            value={site}
            onChange={(e) => setSite(e.target.value)}
            placeholder="https://site-do-cliente.com.br"
            className="field-input min-w-0 flex-1"
            aria-label="Endereço do site"
          />
          <button type="button" className="painel-btn shrink-0" onClick={verificar} disabled={verificando || !site.trim()}>
            {verificando ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />} Verificar instalação
          </button>
        </div>
        {erroVerificar && <p className="painel-error mt-3">{erroVerificar}</p>}
        {resultado && (
          <ul className="mt-4 flex flex-col gap-2">
            {resultado.itens.map((it) => (
              <li key={it.titulo} className="flex items-start gap-3 rounded-xl bg-canvas px-4 py-3">
                {it.ok === true ? (
                  <Check size={18} className="mt-0.5 shrink-0 text-brand-ink" />
                ) : it.ok === false ? (
                  <CircleAlert size={18} className="mt-0.5 shrink-0 text-danger" />
                ) : (
                  <CircleHelp size={18} className="mt-0.5 shrink-0 text-muted" />
                )}
                <span className="text-[14px] leading-relaxed">
                  <b className="font-semibold text-ink">{it.titulo}.</b> <span className="text-body">{it.detalhe}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        <details className="mt-4 text-[14px]">
          <summary className="cursor-pointer text-muted hover:text-ink">Teste manual em 1 minuto</summary>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-body">
            <li>Abra o site numa janela anônima: o aviso tem que aparecer embaixo.</li>
            <li>Clique em “Recusar” e recarregue: o aviso não volta, e o pixel não dispara (confira com a extensão Meta Pixel Helper).</li>
            <li>Clique no link “Preferências de cookies” ou no botão redondo, aceite tudo: agora o pixel dispara.</li>
            <li>A escolha aparece em “Prova de consentimento”, abaixo, em poucos segundos.</li>
          </ol>
        </details>
      </div>

      {/* Passo opcional: link + aparência */}
      <div className={CARD}>
        <p className={ROTULO}>Passo 3 · Ajustes (opcional)</p>
        <h2 className="mt-1 font-display text-[22px] leading-tight text-ink">Link de preferências e aparência</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-body">
          Coloque no rodapé do site, ao lado da política de privacidade, para o visitante mudar a escolha quando quiser:
        </p>
        <Codigo texto={`<a href="#" data-dattis-cookies>Preferências de cookies</a>`} />
        <div className="mt-4 flex flex-col gap-4">
          <label className="flex items-center gap-3">
            <input id={`ck-cor-${contaId ?? "ag"}`} type="color" value={cor} onChange={(e) => setCor(e.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border border-line bg-transparent" />
            <span className="text-[14px] text-body">Cor do botão “Aceitar todos” (use a cor da marca do site)</span>
          </label>
          <label className="block">
            <span className="text-body-sm font-medium text-body">Link da política de privacidade</span>
            <input
              id={`ck-pol-${contaId ?? "ag"}`}
              value={politica}
              onChange={(e) => setPolitica(e.target.value)}
              placeholder={politicaPadrao ?? "https://site.com.br/politica-de-privacidade"}
              className="field-input mt-1.5"
            />
            <span className="mt-1 block text-[12.5px] text-muted">
              {politicaPadrao ? "Em branco, usa a política pública publicada pela Dattis." : "Publique a política pública na página do cliente ou informe o link da política do site."}
            </span>
          </label>
          <label className="flex items-center gap-3 text-[14px] text-body">
            <input id={`ck-flut-${contaId ?? "ag"}`} type="checkbox" checked={flutuante} onChange={(e) => setFlutuante(e.target.checked)} className="h-4 w-4" />
            Mostrar botão redondo para mudar a escolha (canto inferior esquerdo do site)
          </label>
          <div className="flex items-center gap-3">
            <button type="button" className="painel-btn" onClick={salvar} disabled={estado === "salvando"}>
              Salvar ajustes
            </button>
            {estado && estado !== "salvando" && (
              <span className={"text-[13px] " + (estado === "salvo" ? "text-brand-ink" : "text-danger")}>
                {estado === "salvo" ? "Salvo. O site recebe a mudança em até 5 minutos." : estado}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Prova */}
      <div className={CARD}>
        <p className={ROTULO}>Prova de consentimento</p>
        <h2 className="mt-1 font-display text-[22px] leading-tight text-ink">Últimas escolhas registradas</h2>
        <p className="mt-1 text-[14px] text-muted">
          Cada escolha fica guardada com data, página e versão do aviso. O IP é guardado só em forma criptografada. Todas entram na exportação de
          dados.
        </p>
        {recentes.length === 0 ? (
          <p className="mt-4 rounded-xl bg-canvas px-4 py-6 text-center text-[14px] text-muted">Nenhuma escolha ainda. Assim que o aviso estiver no site, elas aparecem aqui.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-[13.5px]">
              <thead>
                <tr className="text-left font-mono text-[11px] uppercase tracking-[0.04em] text-muted">
                  <th className="border-b border-line py-2 pr-3 font-normal">Quando</th>
                  <th className="border-b border-line py-2 pr-3 font-normal">Escolha</th>
                  <th className="border-b border-line py-2 pr-3 font-normal">Estatísticas</th>
                  <th className="border-b border-line py-2 pr-3 font-normal">Marketing</th>
                  <th className="border-b border-line py-2 font-normal">Página</th>
                </tr>
              </thead>
              <tbody>
                {recentes.map((r, i) => (
                  <tr key={i} className="text-body">
                    <td className="border-b border-line py-2 pr-3 tabular-nums">{new Date(r.quando).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</td>
                    <td className="border-b border-line py-2 pr-3">{r.acao === "aceitar" ? "Aceitou tudo" : r.acao === "recusar" ? "Recusou" : "Personalizou"}</td>
                    <td className="border-b border-line py-2 pr-3">{r.estatisticas ? "Sim" : "Não"}</td>
                    <td className="border-b border-line py-2 pr-3">{r.marketing ? "Sim" : "Não"}</td>
                    <td className="max-w-[240px] truncate border-b border-line py-2 text-muted">{r.url?.replace(/^https?:\/\//, "") ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
