import { redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import "./painel.css";
import SairButton from "./SairButton";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const sessao = await getSessao();
  if (!sessao) redirect("/entrar");

  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) });
  if (!agencia) redirect("/entrar");

  return (
    <div className="painel-page">
      <div className="painel-shell">
        <nav className="painel-nav">
          <Link href="/painel" className="painel-nav-brand">
            dattis.
          </Link>
          <Link href="/painel" className="painel-nav-link">
            Painel
          </Link>
          <Link href="/painel/contas" className="painel-nav-link">
            Contas de cliente
          </Link>
          <Link href="/painel/subprocessadores" className="painel-nav-link">
            <span>Quem mais mexe nesse dado</span>
            <small>Registro de subprocessadores</small>
          </Link>
          <div className="painel-nav-footer">
            <div className="painel-nav-agencia">{agencia.nome}</div>
            <SairButton />
          </div>
        </nav>
        <main className="painel-main">{children}</main>
      </div>
    </div>
  );
}
