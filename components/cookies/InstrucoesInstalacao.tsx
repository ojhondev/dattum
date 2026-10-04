"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

// Passo a passo de instalação do aviso de cookies da Dattis, por plataforma. Usado no painel
// (módulo Cookies) e na página pública /instalar/[token], que a agência manda para quem cuida do site.

export function Codigo({ texto }: { texto: string }) {
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

/** Abas por plataforma com os passos. A linha da Dattis é a mesma em todas. */
export function InstrucoesInstalacao({ linha }: { linha: string }) {
  const [plataforma, setPlataforma] = useState("html");
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
    <div>
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
  );
}
