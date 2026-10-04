"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CircleAlert, CircleHelp, Loader2, ShieldCheck } from "lucide-react";
import type { EstatisticaCookies } from "@/lib/cookies-stats";
import { Codigo, InstrucoesInstalacao } from "@/components/cookies/InstrucoesInstalacao";
import { EnviarInstrucoes } from "@/components/cookies/EnviarInstrucoes";
import { InstalarPeloGtm } from "@/components/cookies/InstalarPeloGtm";

type Config = { cor?: string; politicaUrl?: string; flutuante?: boolean };
type ItemVerificacao = { ok: boolean | null; titulo: string; detalhe: string };
export type EscolhaRecente = { quando: string; acao: string; estatisticas: boolean; marketing: boolean; url: string | null };

const ROTULO = "font-mono text-[11px] uppercase tracking-[0.05em] text-muted";
const CARD = "rounded-[20px] border border-line bg-surface p-5 sm:p-6";

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
  detectado,
}: {
  /** Quando e onde o aviso foi visto funcionando no site (detectado sozinho). */
  detectado: { em: string; url: string | null } | null;
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
        <div
          className={
            "mt-4 flex items-start gap-3 rounded-2xl px-4 py-3 text-[14px] leading-relaxed " + (detectado ? "bg-ok-tint text-brand-ink" : "bg-caution-tint text-ink")
          }
        >
          {detectado ? <ShieldCheck size={18} className="mt-0.5 shrink-0" /> : <Loader2 size={18} className="mt-0.5 shrink-0 animate-spin" />}
          <span>
            {detectado ? (
              <>
                <b className="font-semibold">Instalado e funcionando.</b> Visto em{" "}
                {detectado.url ? detectado.url.replace(/^https?:\/\//, "") : "um site"} no dia {new Date(detectado.em).toLocaleDateString("pt-BR")}.
              </>
            ) : (
              <>
                <b className="font-semibold">Aguardando a instalação.</b> Assim que o site carregar o aviso, a Dattis percebe sozinha e marca como instalado aqui.
              </>
            )}
          </span>
        </div>
        {!detectado && (
          <div className="mt-4 flex flex-col gap-4">
            <InstalarPeloGtm token={token} origem={origem} />
            <EnviarInstrucoes token={token} nome={nome} origem={origem} />
          </div>
        )}
        <div className="mt-5">
          <InstrucoesInstalacao linha={linha} />
        </div>
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
