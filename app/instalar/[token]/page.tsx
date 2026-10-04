import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, contasCliente } from "@/lib/db/schema";
import { donoDoToken } from "@/lib/cookies-sites";
import { SITE_URL } from "@/lib/site";
import { Logo } from "@/components/brand/Logo";
import { InstrucoesInstalacao } from "@/components/cookies/InstrucoesInstalacao";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Instalar o aviso de cookies", robots: { index: false, follow: false } };

/**
 * Passo a passo público de instalação do aviso de cookies, para a agência mandar a quem cuida do
 * site do cliente. O token já é público (está no script do site), então não expõe nada novo.
 */
export default async function InstalarPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const dono = await donoDoToken(token);
  if (!dono || dono.tipo === "dattis") notFound();
  const [conta, agencia] = await Promise.all([
    dono.contaId ? db.query.contasCliente.findFirst({ where: eq(contasCliente.id, dono.contaId), columns: { nome: true, site: true } }) : null,
    dono.agenciaId ? db.query.agencias.findFirst({ where: eq(agencias.id, dono.agenciaId), columns: { nome: true } }) : null,
  ]);
  const nome = conta?.nome ?? agencia?.nome ?? "seu site";
  const linha = `<script src="${SITE_URL}/c/${token}.js"></script>`;

  return (
    <div className="min-h-svh bg-canvas px-5 py-10 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <Logo />
        <p className="mt-10 font-mono text-[12px] uppercase tracking-[0.06em] text-brand-ink">Para quem cuida do site</p>
        <h1 className="mt-3 font-display text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.1] text-ink">Instalar o aviso de cookies no site da {nome}</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-body">
          {agencia?.nome ?? "A agência"} pediu a instalação do aviso de cookies da Dattis{conta?.site ? ` em ${conta.site.replace(/^https?:\/\//, "")}` : ""}. Ele pede o
          consentimento do visitante, segura o Pixel do Meta e as tags do Google até o “Aceitar” (Modo de consentimento v2) e guarda a prova de cada
          escolha, como a LGPD exige. Leva uns 5 minutos.
        </p>
        <section className="mt-8 rounded-[24px] border border-line bg-surface p-5 sm:p-7">
          <h2 className="text-[17px] font-medium text-ink">Onde o site foi feito?</h2>
          <p className="mt-1 text-[14px] text-muted">Escolha a plataforma e siga os passos. A linha abaixo é a mesma em todas.</p>
          <div className="mt-4">
            <InstrucoesInstalacao linha={linha} />
          </div>
        </section>
        <p className="mt-6 text-[14px] leading-relaxed text-muted">
          Depois de instalar, avise a agência: ela confere a instalação pelo painel da Dattis, e a verificação diária passa a acompanhar o site.
        </p>
      </div>
    </div>
  );
}
