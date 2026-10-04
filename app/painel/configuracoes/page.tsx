import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { ArrowRight, BadgeCheck, Download, Network } from "lucide-react";
import { AdicionarFerramenta } from "@/components/app/AdicionarFerramenta";
import { ehDono, getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { agencias, contasCliente, usuarios } from "@/lib/db/schema";
import { PLANOS } from "@/lib/planos";
import { DOCUMENTOS_LEGAIS, VERSAO_LEGAL } from "@/lib/legal";
import { EMAIL_DEMO } from "@/lib/admin-dados";
import { linkContato } from "@/lib/contato";
import { FormDadosAgencia, FormSenha } from "./ConfiguracoesClient";
import { EquipeCard } from "./EquipeCard";
import { PoliticaPublicaCard } from "@/components/app/PoliticaPublicaCard";
import { urlAbsoluta } from "@/lib/site";
import { CookiesAtalho } from "@/components/app/CookiesAtalho";
import { estatisticaCookies } from "@/lib/cookies-stats";
import { equipeDaAgencia } from "@/lib/equipe";
import { ultimosRegistros } from "@/lib/registro";
import { BarraModulo, FiltroModulo } from "@/components/app/Modulo";

const CARD = "bloco p-5 sm:p-6";
const ROTULO = "font-mono text-[12px] uppercase tracking-[0.04em] text-muted";
const TITULO = "text-[17px] font-medium text-ink";
const DESC = "mt-1 text-[14px] leading-relaxed text-muted";

type Aba = "agencia" | "conta" | "equipe" | "privacidade" | "ferramentas" | "plano" | "registro";

export default async function ConfiguracoesPage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return null;
  const dono = ehDono(sessao);
  const [agencia, [{ n }], equipe, regs, eu] = await Promise.all([
    db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) }),
    db.select({ n: count() }).from(contasCliente).where(eq(contasCliente.agenciaId, sessao.agenciaId)),
    equipeDaAgencia(sessao.agenciaId),
    ultimosRegistros(sessao.agenciaId, 40),
    sessao.usuarioId ? db.query.usuarios.findFirst({ where: eq(usuarios.id, sessao.usuarioId) }) : null,
  ]);
  if (!agencia) return null;
  const plano = PLANOS.find((p) => p.id === agencia.plano);
  const demo = agencia.email === EMAIL_DEMO;

  const abas: { valor: Aba; rotulo: string }[] = dono
    ? [
        { valor: "agencia", rotulo: "Agência e acesso" },
        { valor: "equipe", rotulo: "Equipe" },
        { valor: "privacidade", rotulo: "Privacidade e cookies" },
        { valor: "ferramentas", rotulo: "Ferramentas" },
        { valor: "plano", rotulo: "Plano e documentos" },
        { valor: "registro", rotulo: "Registro de atividades" },
      ]
    : [
        { valor: "conta", rotulo: "Sua conta" },
        { valor: "equipe", rotulo: "Equipe" },
        { valor: "plano", rotulo: "Plano e documentos" },
        { valor: "registro", rotulo: "Registro de atividades" },
      ];
  const { aba: pedida } = await searchParams;
  const aba = abas.find((a) => a.valor === pedida)?.valor ?? abas[0].valor;

  return (
    <div className="max-w-[1100px]">
      <BarraModulo
        esquerda={
          <div data-tour="cfg-abas" className="min-w-0 max-w-full">
            <FiltroModulo nome="aba" opcoes={abas} />
          </div>
        }
        direita={
          dono ? (
            <a href="/api/agencia/exportar" className="barra-btn">
              <Download size={15} /> Exportar dados (.zip)
            </a>
          ) : null
        }
      />

      {demo && (
        <div className="mb-5 rounded-2xl bg-caution-tint px-5 py-4 text-[14px] leading-relaxed text-ink">
          Esta é a conta de demonstração, compartilhada com outros visitantes. Os dados aparecem aqui, mas não podem ser alterados.
        </div>
      )}

      {aba === "agencia" && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className={CARD} data-tour="cfg-dados">
            <h2 className={TITULO}>Dados da agência</h2>
            <p className={DESC}>Nome, CNPJ, endereço e responsável entram na qualificação dos contratos e documentos gerados para os seus clientes.</p>
            <FormDadosAgencia
              inicial={{
                nome: agencia.nome,
                email: agencia.email,
                cnpj: agencia.cnpj ?? "",
                whatsapp: agencia.whatsapp ?? "",
                endereco: agencia.endereco ?? "",
                responsavelNome: agencia.responsavelNome ?? "",
                responsavelCargo: agencia.responsavelCargo ?? "",
              }}
              pedeSenhaParaEmail={agencia.senhaDefinida}
              bloqueado={demo}
            />
          </section>
          <div className="flex flex-col gap-4">
            <section className={CARD}>
              <h2 className={TITULO}>{agencia.senhaDefinida ? "Trocar senha" : "Criar senha"}</h2>
              <p className={DESC}>
                {agencia.senhaDefinida
                  ? "Senha do login principal da agência. Para o resto da equipe, convide cada pessoa na aba Equipe."
                  : "Sua conta foi criada com o Google. Crie uma senha se quiser entrar também com e-mail e senha."}
              </p>
              <FormSenha temSenha={agencia.senhaDefinida} bloqueado={demo} />
            </section>
            <section className={CARD}>
              <p className={ROTULO}>Login com Google</p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-body">
                {agencia.googleSub
                  ? "Vinculado. Você pode entrar com o botão “Continuar com Google”."
                  : `Não vinculado. Para vincular, entre uma vez com “Continuar com Google” usando a conta Google do e-mail ${agencia.email}.`}
              </p>
            </section>
          </div>
        </div>
      )}

      {aba === "conta" && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className={CARD} data-tour="cfg-dados">
            <h2 className={TITULO}>Sua conta</h2>
            <p className={DESC}>
              Você entra como <b className="text-ink">{eu?.nome}</b> ({eu?.email}) na equipe da {agencia.nome}. Dados da agência, equipe e exportação ficam
              com o dono da conta.
            </p>
            <FormSenha temSenha bloqueado={false} endpoint="/api/equipe/minha-senha" />
          </section>
          <section className={CARD}>
            <p className={ROTULO}>Login com Google</p>
            <p className="mt-2 text-[14.5px] leading-relaxed text-body">
              {eu?.googleSub ? "Vinculado à sua conta Google." : `Você também pode entrar com “Continuar com Google”, usando a conta Google do e-mail ${eu?.email}.`}
            </p>
          </section>
        </div>
      )}

      {aba === "equipe" && (
        <EquipeCard
          podeGerenciar={dono}
          bloqueado={demo}
          pessoas={equipe.map((u) => ({
            id: u.id,
            nome: u.nome,
            email: u.email,
            situacao: !u.ativo ? "desativado" : u.senhaHash ? "ativo" : "convite",
            ultimoAcesso: u.ultimoAcesso?.toISOString() ?? null,
          }))}
        />
      )}

      {aba === "privacidade" && dono && (
        <div className="grid gap-4 lg:grid-cols-2">
          <PoliticaPublicaCard
            titular={agencia.nome}
            url={agencia.politicaPublicadaEm && agencia.slug ? urlAbsoluta(`/p/${agencia.slug}/privacidade`) : null}
            emailInicial={agencia.emailPrivacidade ?? ""}
            emailSugerido={agencia.email}
            bloqueadoPlano={agencia.plano === "start"}
          />
          {agencia.plano !== "start" && (
            <CookiesAtalho href="/painel/cookies?site=agencia" ativo={!!agencia.cookiesToken} escolhas={(await estatisticaCookies(agencia.cookiesToken))?.total ?? null} />
          )}
          <a href="/painel/certificados" className="bloco flex items-center gap-3 p-5 transition-colors hover:bg-surface-2">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-canvas text-muted">
              <BadgeCheck size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium text-ink">Selo de privacidade da agência</span>
              <span className="mt-0.5 block text-[13.5px] leading-snug text-muted">O certificado e o selo para o rodapé do site da agência e de cada cliente.</span>
            </span>
            <ArrowRight size={17} className="shrink-0 text-muted" />
          </a>
        </div>
      )}

      {aba === "ferramentas" && dono && (
        <section className={CARD}>
          <h2 className={TITULO}>Ferramentas da agência</h2>
          <p className={DESC}>
            O catálogo da Dattis tem centenas de ferramentas. Se a agência usa alguma que não está lá, cadastre com nome, link e categoria: ela fica disponível
            para escolher em todos os clientes.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <AdicionarFerramenta />
            <a href="/painel/subprocessadores" className="barra-btn">
              <Network size={14} /> Ver todas e em quais clientes estão <ArrowRight size={14} />
            </a>
          </div>
        </section>
      )}

      {aba === "plano" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className={CARD}>
            <p className={ROTULO}>Plano</p>
            <p className="mt-2 font-display text-[26px] text-ink">{plano?.nome ?? agencia.plano}</p>
            {plano && <p className="text-[14px] text-muted">R$ {plano.preco}/cliente/mês</p>}
            <p className="mt-4 text-[15px] text-body">
              <b className="font-semibold tabular-nums text-ink">{Number(n)}</b>
              {agencia.clientesContratados != null ? ` de ${agencia.clientesContratados}` : ""} cliente(s) ativo(s)
            </p>
            {dono && (
              <a
                href={linkContato(`Olá! Quero mudar o plano ou incluir clientes na conta da ${agencia.nome} na Dattis.`)}
                target="_blank"
                rel="noopener"
                className="barra-btn mt-4"
              >
                Mudar plano ou incluir clientes
              </a>
            )}
          </section>
          <section className={CARD}>
            <p className={ROTULO}>Documentos legais da Dattis</p>
            <p className="mt-2 text-[14.5px] leading-relaxed text-body">
              {agencia.termosAceitosEm ? `Versão ${agencia.termosVersao} aceita em ${agencia.termosAceitosEm.toLocaleDateString("pt-BR")}.` : "Ainda não aceitos."}
              {agencia.termosVersao !== VERSAO_LEGAL && agencia.termosAceitosEm ? ` A versão atual é ${VERSAO_LEGAL}.` : ""}
            </p>
            <ul className="mt-3 flex flex-col gap-1.5 text-[14px]">
              {DOCUMENTOS_LEGAIS.map((d) => (
                <li key={d.id}>
                  <Link href={d.href} target="_blank" className="nav-link">
                    {d.titulo}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          {dono && (
            <section className={CARD + " lg:col-span-2"}>
              <p className={ROTULO}>Seus dados</p>
              <p className="mt-2 max-w-3xl text-[14.5px] leading-relaxed text-body">
                Baixe tudo num arquivo .zip: clientes, registros, contratos de todas as versões com assinaturas e evidências, documentos, certificados,
                consentimentos de cookies, equipe e registro de atividades. Os dados são seus, inclusive se um dia sair da Dattis.
              </p>
              <a href="/api/agencia/exportar" className="barra-btn mt-4">
                <Download size={15} /> Exportar todos os dados (.zip)
              </a>
            </section>
          )}
        </div>
      )}

      {aba === "registro" && (
        <section className={CARD} data-tour="cfg-registro">
          <h2 className={TITULO}>Registro de atividades</h2>
          <p className={DESC}>Quem fez o quê na conta da agência: entradas, clientes, contratos, políticas e equipe. É a prestação de contas que a LGPD pede (art. 37).</p>
          {regs.length === 0 ? (
            <p className="mt-4 rounded-xl bg-canvas px-4 py-6 text-center text-[14px] text-muted">Nada registrado ainda.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line text-[13.5px]">
              {regs.map((r) => (
                <li key={r.id} className="grid gap-1 py-2.5 sm:grid-cols-[150px_180px_minmax(0,1fr)] sm:gap-3">
                  <span className="tabular-nums text-muted">
                    {r.criadoEm.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" })}
                  </span>
                  <span className="text-ink">{r.autorNome}</span>
                  <span className="text-body">
                    {r.acao}
                    {r.detalhe && <span className="block text-[12.5px] text-muted">{r.detalhe}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
