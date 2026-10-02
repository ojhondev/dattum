"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Cookie, Copy } from "lucide-react";
import { linkContato } from "@/lib/contato";
import type { EstatisticaCookies } from "@/lib/cookies-stats";

type Config = { cor?: string; politicaUrl?: string; flutuante?: boolean };

function Codigo({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="mt-2 flex items-start gap-2 rounded-xl bg-rail px-3 py-2.5">
      <code className="min-w-0 flex-1 break-all font-mono text-[12px] leading-relaxed text-[#cff5e1]">{texto}</code>
      <button
        type="button"
        aria-label="Copiar código"
        onClick={() => navigator.clipboard.writeText(texto).then(() => (setCopiado(true), setTimeout(() => setCopiado(false), 2000)))}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-white hover:bg-white/20"
      >
        {copiado ? <Check size={15} /> : <Copy size={15} />}
      </button>
    </div>
  );
}

const COMO: { id: string; nome: string; passos: React.ReactNode }[] = [
  {
    id: "gtm",
    nome: "Uso Google Tag Manager",
    passos: (
      <ol className="list-decimal space-y-1.5 pl-5">
        <li>Cole a linha acima no &lt;head&gt;, <b>antes</b> do código do Gerenciador de Tags.</li>
        <li>No GTM: Administrador → Configurações do contêiner → marque “Ativar visão geral de consentimento”.</li>
        <li>Tags do Google (GA4, Google Ads) já respeitam a escolha sozinhas.</li>
        <li>
          Na tag do Pixel do Meta (e TikTok, Hotjar...): Configurações avançadas → Configurações de consentimento → “Exigir consentimento adicional” →{" "}
          <code className="font-mono">ad_storage</code>.
        </li>
      </ol>
    ),
  },
  {
    id: "codigo",
    nome: "Pixel colado direto no site",
    passos: (
      <ol className="list-decimal space-y-1.5 pl-5">
        <li>Cole a linha acima no &lt;head&gt;, antes de qualquer outro script.</li>
        <li>
          No código do Pixel do Meta (ou outro pixel de anúncio), troque <code className="font-mono">&lt;script&gt;</code> por{" "}
          <code className="font-mono">&lt;script type=&quot;text/plain&quot; data-dattis-categoria=&quot;marketing&quot;&gt;</code>. Ele só roda depois do aceite.
        </li>
        <li>
          Para ferramentas de medição (Hotjar, Clarity), use <code className="font-mono">data-dattis-categoria=&quot;estatisticas&quot;</code>. O Google Analytics (gtag.js) não precisa de mudança.
        </li>
      </ol>
    ),
  },
  {
    id: "plataforma",
    nome: "WordPress ou Shopify",
    passos: (
      <ol className="list-decimal space-y-1.5 pl-5">
        <li>WordPress: instale um plugin de “inserir código no cabeçalho” (ex.: WPCode) e cole a linha em Header, com prioridade máxima.</li>
        <li>Shopify: Loja virtual → Temas → Editar código → theme.liquid. Cole logo depois de &lt;head&gt;.</li>
        <li>Desative outro banner de cookies que já exista, para não aparecerem dois.</li>
      </ol>
    ),
  },
];

/** Aviso de cookies da Dattis para o site da agência (sem contaId) ou de um cliente. */
export function CookiesCard({
  contaId,
  token,
  config,
  politicaPadrao,
  estatistica,
  origem,
  bloqueadoPlano,
}: {
  contaId?: string;
  token: string | null;
  config: Config | null;
  politicaPadrao: string | null;
  estatistica: EstatisticaCookies | null;
  origem: string;
  bloqueadoPlano: boolean;
}) {
  const router = useRouter();
  const [cor, setCor] = useState(config?.cor ?? "#002820");
  const [politica, setPolitica] = useState(config?.politicaUrl ?? "");
  const [flutuante, setFlutuante] = useState(config?.flutuante ?? true);
  const [como, setComo] = useState("gtm");
  const [estado, setEstado] = useState("");

  if (bloqueadoPlano) {
    return (
      <div className="rounded-[20px] border border-line bg-surface p-5">
        <p className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.04em] text-muted">
          <Cookie size={15} /> Aviso de cookies
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-body">
          Nos planos Growth e Scale, o aviso de cookies da Dattis segura o pixel até o visitante aceitar e guarda a prova de cada escolha.
        </p>
        <a href={linkContato("Olá! Quero o aviso de cookies da Dattis (plano Growth).")} target="_blank" rel="noopener" className="painel-btn ghost mt-3">
          Falar sobre o Growth
        </a>
      </div>
    );
  }

  const salvar = async (extra: Record<string, unknown> = {}) => {
    setEstado("salvando");
    const r = await fetch("/api/cookies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contaId, cor, politicaUrl: politica, flutuante, ...extra }),
    })
      .then((x) => x.json())
      .catch(() => ({ ok: false }));
    setEstado(r.ok ? "salvo" : (r.error ?? "Não foi possível salvar."));
    if (r.ok) router.refresh();
  };

  const linha = token ? `<script src="${origem}/c/${token}.js"></script>` : "";
  const pct = (n: number) => (estatistica?.total ? `${Math.round((n / estatistica.total) * 100)}%` : "—");
  const passo = COMO.find((c) => c.id === como)!;

  return (
    <div data-tour="conta-cookies" className="rounded-[20px] border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.04em] text-muted">
          <Cookie size={15} /> Aviso de cookies
        </p>
        {token ? <span className="painel-pill ok">Ativo</span> : <span className="painel-pill pendente">Desligado</span>}
      </div>

      {!token ? (
        <>
          <p className="mt-2 text-[14px] leading-relaxed text-body">
            O banner da Dattis pede o consentimento do visitante, segura o pixel do Meta e as tags do Google até ele aceitar (Modo de
            consentimento v2) e guarda a prova de cada escolha. Instala com uma linha de código.
          </p>
          <button type="button" className="painel-btn mt-3" onClick={() => salvar()} disabled={estado === "salvando"}>
            {estado === "salvando" ? "Ativando..." : "Ativar aviso de cookies"}
          </button>
        </>
      ) : (
        <>
          {estatistica && (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ["Escolhas (30 dias)", String(estatistica.total)],
                ["Aceitaram tudo", pct(estatistica.aceitar)],
                ["Recusaram", pct(estatistica.recusar)],
                ["Personalizaram", pct(estatistica.personalizar)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-canvas px-3 py-2.5">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.04em] text-muted">{k}</p>
                  <p className="mt-1 font-display text-[22px] tabular-nums text-ink">{v}</p>
                </div>
              ))}
            </div>
          )}

          <p className="mt-4 text-[14px] font-medium text-ink">1. Cole no topo do &lt;head&gt; do site</p>
          <Codigo texto={linha} />

          <p className="mt-4 text-[14px] font-medium text-ink">2. Segure os pixels até o aceite</p>
          <div className="mt-2 flex flex-wrap gap-1.5" role="tablist" aria-label="Como o site carrega as tags">
            {COMO.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={como === c.id}
                onClick={() => setComo(c.id)}
                className={"rounded-full px-3 py-1.5 text-[13px] " + (como === c.id ? "bg-rail text-white" : "border border-line text-body hover:bg-surface-2")}
              >
                {c.nome}
              </button>
            ))}
          </div>
          <div className="mt-3 text-[13.5px] leading-relaxed text-body [&_b]:text-ink">{passo.passos}</div>

          <p className="mt-4 text-[14px] font-medium text-ink">3. Link para mudar a escolha (opcional)</p>
          <p className="text-[13px] text-muted">Coloque no rodapé, ao lado da política de privacidade.</p>
          <Codigo texto={`<a href="#" data-dattis-cookies>Preferências de cookies</a>`} />

          <details className="mt-4 text-[14px]">
            <summary className="cursor-pointer text-muted hover:text-ink">Aparência e política</summary>
            <div className="mt-3 flex flex-col gap-3">
              <label className="flex items-center gap-3">
                <input id={`ck-cor-${contaId ?? "ag"}`} type="color" value={cor} onChange={(e) => setCor(e.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border border-line bg-transparent" />
                <span className="text-body">Cor do botão “Aceitar” (use a cor da marca do site)</span>
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
                  {politicaPadrao ? "Em branco, usa a política pública publicada pela Dattis." : "Publique a política pública da Dattis ou informe o link da política do site."}
                </span>
              </label>
              <label className="flex items-center gap-3 text-body">
                <input id={`ck-flut-${contaId ?? "ag"}`} type="checkbox" checked={flutuante} onChange={(e) => setFlutuante(e.target.checked)} className="h-4 w-4" />
                Mostrar botão redondo para mudar a escolha (canto inferior esquerdo)
              </label>
              <div>
                <button type="button" className="painel-btn" onClick={() => salvar()} disabled={estado === "salvando"}>
                  Salvar
                </button>
              </div>
            </div>
          </details>
          {estado && estado !== "salvando" && (
            <p className={"mt-3 text-[13px] " + (estado === "salvo" ? "text-brand-ink" : "text-danger")}>
              {estado === "salvo" ? "Salvo. O site recebe a mudança em até 5 minutos." : estado}
            </p>
          )}
        </>
      )}
    </div>
  );
}
