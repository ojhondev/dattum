import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { agencias, contasCliente } from "@/lib/db/schema";
import { PLANOS } from "@/lib/planos";
import { DOCUMENTOS_LEGAIS, VERSAO_LEGAL } from "@/lib/legal";
import { EMAIL_DEMO } from "@/lib/admin-dados";
import { linkContato } from "@/lib/contato";
import { FormDadosAgencia, FormSenha } from "./ConfiguracoesClient";
import { PoliticaPublicaCard } from "@/components/app/PoliticaPublicaCard";
import { SITE_URL, urlAbsoluta } from "@/lib/site";
import { CookiesCard } from "@/components/app/CookiesCard";
import { estatisticaCookies } from "@/lib/cookies-stats";

const CARD = "rounded-[20px] border border-line bg-surface p-5 sm:p-6";
const ROTULO = "font-mono text-[12px] uppercase tracking-[0.04em] text-muted";

export default async function ConfiguracoesPage() {
  const sessao = await getSessao();
  if (!sessao) return null;
  const [agencia, [{ n }]] = await Promise.all([
    db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) }),
    db.select({ n: count() }).from(contasCliente).where(eq(contasCliente.agenciaId, sessao.agenciaId)),
  ]);
  if (!agencia) return null;
  const plano = PLANOS.find((p) => p.id === agencia.plano);
  const demo = agencia.email === EMAIL_DEMO;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex flex-col gap-6">
        {demo && (
          <div className="rounded-2xl bg-caution-tint px-5 py-4 text-[14px] leading-relaxed text-ink">
            Esta é a conta de demonstração, compartilhada com outros visitantes. Os dados aparecem aqui, mas não podem ser alterados.
          </div>
        )}
        <section className={CARD} data-tour="cfg-dados">
          <h2 className="font-display text-[22px] text-ink">Dados da agência</h2>
          <p className="mt-1 text-[14px] leading-relaxed text-muted">
            Nome, CNPJ, endereço e responsável entram na qualificação dos contratos e documentos gerados para os seus clientes.
          </p>
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

        <section className={CARD}>
          <h2 className="font-display text-[22px] text-ink">{agencia.senhaDefinida ? "Trocar senha" : "Criar senha"}</h2>
          <p className="mt-1 text-[14px] leading-relaxed text-muted">
            {agencia.senhaDefinida
              ? "Use pelo menos 8 caracteres. Quem tem a senha acessa todos os clientes e contratos da agência."
              : "Sua conta foi criada com o Google. Crie uma senha se quiser entrar também com e-mail e senha."}
          </p>
          <FormSenha temSenha={agencia.senhaDefinida} bloqueado={demo} />
        </section>

        <PoliticaPublicaCard
          titular={agencia.nome}
          url={agencia.politicaPublicadaEm && agencia.slug ? urlAbsoluta(`/p/${agencia.slug}/privacidade`) : null}
          emailInicial={agencia.emailPrivacidade ?? ""}
          emailSugerido={agencia.email}
          bloqueadoPlano={agencia.plano === "start"}
        />

        <CookiesCard
          token={agencia.cookiesToken}
          config={agencia.cookiesConfig ?? null}
          politicaPadrao={agencia.politicaPublicadaEm && agencia.slug ? urlAbsoluta(`/p/${agencia.slug}/privacidade`) : null}
          estatistica={await estatisticaCookies(agencia.cookiesToken)}
          origem={SITE_URL}
          bloqueadoPlano={agencia.plano === "start"}
        />
      </div>

      <aside className="flex flex-col gap-6">
        <section className={CARD}>
          <p className={ROTULO}>Plano</p>
          <p className="mt-2 font-display text-[26px] text-ink">{plano?.nome ?? agencia.plano}</p>
          {plano && <p className="text-[14px] text-muted">R$ {plano.preco}/cliente/mês</p>}
          <p className="mt-4 text-[15px] text-body">
            <b className="font-semibold text-ink tabular-nums">{Number(n)}</b>
            {agencia.clientesContratados != null ? ` de ${agencia.clientesContratados}` : ""} cliente(s) ativo(s)
          </p>
          <a
            href={linkContato(`Olá! Quero mudar o plano ou incluir clientes na conta da ${agencia.nome} na Dattis.`)}
            target="_blank"
            rel="noopener"
            className="painel-btn ghost mt-4"
          >
            Mudar plano ou incluir clientes
          </a>
        </section>

        <section className={CARD}>
          <p className={ROTULO}>Login com Google</p>
          <p className="mt-2 text-[15px] leading-relaxed text-body">
            {agencia.googleSub
              ? "Vinculado. Você pode entrar com o botão “Continuar com Google”."
              : `Não vinculado. Para vincular, entre uma vez com “Continuar com Google” usando a conta Google do e-mail ${agencia.email}.`}
          </p>
        </section>

        <section className={CARD}>
          <p className={ROTULO}>Seus dados</p>
          <p className="mt-2 text-[15px] leading-relaxed text-body">
            Baixe tudo num arquivo .zip: registro de atividades, ferramentas, contratos de todas as versões com as assinaturas e evidências,
            documentos, certificados e consentimentos de cookies. Os dados são seus, inclusive se um dia sair da Dattis.
          </p>
          <a href="/api/agencia/exportar" className="painel-btn ghost mt-4">
            Exportar todos os dados (.zip)
          </a>
        </section>

        <section className={CARD}>
          <p className={ROTULO}>Documentos legais da Dattis</p>
          <p className="mt-2 text-[15px] leading-relaxed text-body">
            {agencia.termosAceitosEm
              ? `Versão ${agencia.termosVersao} aceita em ${agencia.termosAceitosEm.toLocaleDateString("pt-BR")}.`
              : "Ainda não aceitos."}
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
      </aside>
    </div>
  );
}
