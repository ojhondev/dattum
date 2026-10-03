import Link from "next/link";
import { and, count, desc, eq, gte, inArray } from "drizzle-orm";
import { Cookie, Globe } from "lucide-react";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { agencias, consentimentos, contasCliente } from "@/lib/db/schema";
import { estatisticaCookies } from "@/lib/cookies-stats";
import { linkContato } from "@/lib/contato";
import { agoraMs } from "@/lib/utils";
import { SITE_URL, urlAbsoluta } from "@/lib/site";
import { ConfigurarCookies } from "./ConfigurarCookies";
import { BarraModulo } from "@/components/app/Modulo";

export const dynamic = "force-dynamic";

const CARD = "rounded-[20px] border border-line bg-surface p-5 sm:p-6";

export default async function CookiesPage({ searchParams }: { searchParams: Promise<{ site?: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return null;
  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) });
  if (!agencia) return null;

  if (agencia.plano === "start") {
    return (
      <div className="max-w-2xl">
        <p className="t-eyebrow">Dattis · Cookies</p>
        <h1 className="t-display mt-3">Aviso de cookies com prova de consentimento</h1>
        <p className="mt-4 text-body leading-relaxed text-body">
          O aviso de cookies da Dattis segura o pixel até o visitante aceitar, liga o Modo de consentimento do Google e guarda a prova de cada
          escolha. Ele faz parte dos planos Growth e Scale.
        </p>
        <a href={linkContato("Olá! Quero o aviso de cookies da Dattis (plano Growth).")} target="_blank" rel="noopener" className="painel-btn mt-6">
          Falar sobre o Growth
        </a>
      </div>
    );
  }

  const contas = await db.query.contasCliente.findMany({ where: eq(contasCliente.agenciaId, agencia.id), orderBy: (t, { asc }) => asc(t.nome) });
  const tokens = [agencia.cookiesToken, ...contas.map((c) => c.cookiesToken)].filter((t): t is string => !!t);
  const desde = new Date(agoraMs() - 30 * 86_400_000);
  const porToken = tokens.length
    ? await db
        .select({ token: consentimentos.token, acao: consentimentos.acao, n: count() })
        .from(consentimentos)
        .where(and(inArray(consentimentos.token, tokens), gte(consentimentos.criadoEm, desde)))
        .groupBy(consentimentos.token, consentimentos.acao)
    : [];
  const resumo = (token: string | null) => {
    const rows = porToken.filter((r) => r.token === token);
    const total = rows.reduce((s, r) => s + Number(r.n), 0);
    const aceitar = Number(rows.find((r) => r.acao === "aceitar")?.n ?? 0);
    return { total, aceitaram: total ? Math.round((aceitar / total) * 100) : null };
  };

  const sites = [
    {
      id: "agencia",
      nome: agencia.nome,
      sub: "Site da agência",
      site: "",
      token: agencia.cookiesToken,
      config: agencia.cookiesConfig ?? null,
      politica: agencia.politicaPublicadaEm && agencia.slug ? urlAbsoluta(`/p/${agencia.slug}/privacidade`) : null,
    },
    ...contas.map((c) => ({
      id: c.id,
      nome: c.nome,
      sub: c.site ? c.site.replace(/^https?:\/\//, "") : "Sem site cadastrado",
      site: c.site ?? "",
      token: c.cookiesToken,
      config: c.cookiesConfig ?? null,
      politica: c.politicaPublicadaEm && c.slug ? urlAbsoluta(`/p/${c.slug}/privacidade`) : null,
    })),
  ];
  const { site: sel } = await searchParams;
  const atual = sites.find((s) => s.id === sel) ?? sites.find((s) => s.id !== "agencia" && !s.token) ?? sites[0];
  const [estatistica, recentes] = await Promise.all([
    estatisticaCookies(atual.token),
    atual.token
      ? db.query.consentimentos.findMany({ where: eq(consentimentos.token, atual.token), orderBy: desc(consentimentos.criadoEm), limit: 20 })
      : [],
  ]);

  return (
    <div className="mx-auto max-w-[1400px]">
      <BarraModulo
        esquerda={
          <p className="px-2 text-[13.5px] text-muted">
            Aviso ativo em <b className="font-medium text-ink">{sites.filter((s) => s.token).length}</b> de {sites.length} site(s)
          </p>
        }
        direita={<span className="hidden px-2 text-[13px] text-muted md:inline">Segura o pixel até o visitante aceitar e guarda a prova</span>}
      />

      <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <nav aria-label="Sites" data-tour="cookies-sites" className="flex flex-col gap-2 xl:sticky xl:top-[96px] xl:self-start">
          <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-muted">Sites</p>
          {sites.map((s) => {
            const r = resumo(s.token);
            const ativo = s.id === atual.id;
            return (
              <Link
                key={s.id}
                href={`/painel/cookies?site=${s.id}`}
                scroll={false}
                aria-current={ativo ? "page" : undefined}
                className={"flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors " + (ativo ? "border-brand-strong bg-brand-tint" : "border-line bg-surface hover:bg-surface-2")}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-canvas text-muted">{s.id === "agencia" ? <Globe size={17} /> : <Cookie size={17} />}</span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-[14.5px] font-medium text-ink">{s.nome}</span>
                  <span className="block truncate text-[12.5px] text-muted">{s.sub}</span>
                </span>
                {s.token ? (
                  <span className="shrink-0 text-right">
                    <span className="painel-pill ok">Ativo</span>
                    {r.total > 0 && <span className="mt-1 block font-mono text-[10.5px] text-muted">{r.aceitaram}% aceitam</span>}
                  </span>
                ) : (
                  <span className="painel-pill pendente shrink-0">Desligado</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="min-w-0">
          <ConfigurarCookies
            key={atual.id}
            contaId={atual.id === "agencia" ? undefined : atual.id}
            nome={atual.nome}
            siteInicial={atual.site}
            token={atual.token}
            config={atual.config}
            politicaPadrao={atual.politica}
            estatistica={estatistica}
            origem={SITE_URL}
            recentes={recentes.map((r) => ({ quando: r.criadoEm.toISOString(), acao: r.acao, estatisticas: r.categorias.estatisticas, marketing: r.categorias.marketing, url: r.url }))}
          />

          <details className={CARD + " mt-5"} data-tour="cookies-gtm">
            <summary className="cursor-pointer list-none">
              <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-muted">Google Analytics e Gerenciador de Tags</p>
              <p className="mt-1 font-display text-[22px] leading-tight text-ink">O cliente ainda não tem? Crie do zero em 10 minutos</p>
              <p className="mt-1 text-[14px] text-muted">Clique para abrir o passo a passo.</p>
            </summary>
            <div className="mt-5 grid gap-6 lg:grid-cols-2">
              <div>
                <p className="text-[15px] font-semibold text-ink">1. Google Analytics (onde as visitas ficam anotadas)</p>
                <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[14px] leading-relaxed text-body">
                  <li>Acesse analytics.google.com com a conta Google do cliente (ou dê acesso à agência).</li>
                  <li>Engrenagem <b>Administrador</b> → <b>+ Criar → Conta</b>. Nome: o do cliente.</li>
                  <li>Propriedade: fuso <b>Brasil (São Paulo)</b>, moeda <b>Real</b> → Avançar.</li>
                  <li>Categoria e tamanho da empresa → objetivos <b>Gerar leads</b> e <b>Analisar o tráfego da Web</b> → Criar.</li>
                  <li>Plataforma <b>Web</b>: informe o site, deixe a Medição otimizada ligada → Criar e continuar.</li>
                  <li>
                    Feche as instruções de instalação e copie o <b>ID da métrica</b> (<code className="font-mono">G-...</code>).
                  </li>
                </ol>
              </div>
              <div>
                <p className="text-[15px] font-semibold text-ink">2. Gerenciador de Tags (quem leva as visitas até o Analytics)</p>
                <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[14px] leading-relaxed text-body">
                  <li>Acesse tagmanager.google.com → <b>Criar conta</b>: nome do cliente, país Brasil, contêiner com o domínio do site, plataforma <b>Web</b>.</li>
                  <li>
                    Copie os dois códigos de instalação que ele mostra e cole no site <b>depois</b> da linha da Dattis (passo 1, aba Google Tag Manager).
                  </li>
                  <li>
                    <b>Administrador → Configurações do contêiner</b> → marque <b>“Ativar visão geral de consentimento”</b>.
                  </li>
                  <li>
                    <b>Tags → Nova → Tag do Google</b>, cole o <code className="font-mono">G-...</code>, acionamento <b>Initialization – All Pages</b> → Salvar.
                  </li>
                  <li>
                    <b>Enviar → Publicar</b>. Pronto: o Analytics só passa a identificar o visitante depois do “Aceitar”.
                  </li>
                </ol>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
