import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/marketing/AuthShell";
import { conviteValido } from "@/lib/equipe";
import { FormConvite } from "./FormConvite";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Convite para a equipe", robots: { index: false, follow: false } };

export default async function ConvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const v = await conviteValido(token);

  return (
    <AuthShell panelHeadline="Sua operação de compliance, em um lugar só.">
      {!v ? (
        <>
          <h1 className="t-display">Convite expirado</h1>
          <p className="mt-3 text-body-sm leading-relaxed text-muted">
            Este link de convite não vale mais: ele expira em 7 dias e só pode ser usado uma vez. Peça um novo link a quem convidou você.
          </p>
          <p className="font-ui mt-8 text-body-sm">
            Já tem acesso?{" "}
            <Link href="/entrar" className="nav-link">
              Entrar
            </Link>
          </p>
        </>
      ) : (
        <>
          <h1 className="t-display">Entrar na equipe</h1>
          <p className="mt-3 text-body-sm leading-relaxed text-muted">
            Você foi convidado para o painel da <b className="text-ink">{v.agenciaNome}</b> na Dattis. Crie sua senha para acessar com o
            e-mail <b className="text-ink">{v.usuario.email}</b>.
          </p>
          <FormConvite token={token} nomeInicial={v.usuario.nome} />
        </>
      )}
    </AuthShell>
  );
}
