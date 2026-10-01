import Link from "next/link";
import { eq } from "drizzle-orm";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { contasCliente } from "@/lib/db/schema";
import { ultimosResultados } from "@/lib/vigilancia";
import { NotaVigilancia, ContagemSeveridades } from "@/components/app/VigilanciaChips";
import { ListaAchados } from "@/components/app/ListaAchados";

export const dynamic = "force-dynamic";

const CHECAGENS = [
  "HTTPS ativo e certificado SSL válido",
  "Pixel do Meta, tag do Google e Pixel do TikTok x banner de cookies",
  "Formulário captando e-mail ou telefone sem política de privacidade",
  "Cabeçalhos de segurança e recursos carregados sem HTTPS",
  "Contrato assinado, registro preenchido e ferramentas mapeadas",
  "Selo Dattis no rodapé e validade do certificado",
];

export default async function VigilanciaPage() {
  const sessao = await getSessao();
  if (!sessao) return null;

  const [resultados, contas] = await Promise.all([
    ultimosResultados(sessao.agenciaId),
    db.query.contasCliente.findMany({ where: eq(contasCliente.agenciaId, sessao.agenciaId), columns: { id: true, nome: true, site: true } }),
  ]);
  const verificadas = new Set(resultados.map((r) => r.contaClienteId));
  const semResultado = contas.filter((c) => !verificadas.has(c.id));
  const ordenados = [...resultados].sort((a, b) => a.nota - b.nota);

  return (
    <div className="max-w-6xl">
      <p className="t-eyebrow">Dattis · Vigilância</p>
      <h1 className="t-display mt-3 max-w-3xl">Varredura de segurança diária nos seus clientes</h1>
      <p className="mt-4 max-w-2xl text-body leading-relaxed text-body">
        Todo dia às 6h a Dattis visita o site de cada cliente e confere a documentação dele. Quando algo quebra — um pixel novo
        sem banner, um SSL vencendo, um contrato sem assinatura — o alerta aparece aqui antes de virar denúncia.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {CHECAGENS.map((c) => (
          <span key={c} className="tag tag-white border border-line">
            {c}
          </span>
        ))}
      </div>

      {ordenados.length === 0 ? (
        <div className="block-card mt-10 p-10 text-body text-body">
          A primeira varredura ainda não rodou para as suas contas. Abra uma conta e clique em <b>Verificar agora</b> na aba
          Vigilância, ou aguarde a próxima varredura automática.
        </div>
      ) : (
        <div className="mt-10 flex flex-col gap-4">
          {ordenados.map((r) => (
            <details key={r.id} className="group rounded-[24px] border border-line bg-surface open:shadow-[var(--shadow-chip)]" open={r.criticos > 0}>
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-2 px-6 py-5">
                <NotaVigilancia nota={r.nota} compacto />
                <span className="min-w-[180px] flex-1">
                  <span className="font-display block text-[19px] text-ink">
                    {r.titular}
                    {!r.contaClienteId && <span className="ml-2 align-middle font-mono text-[11px] uppercase tracking-[0.04em] text-muted">site da agência</span>}
                  </span>
                  <span className="block text-[13px] text-muted">
                    {r.alvo ? r.alvo.replace(/^https?:\/\//, "") : "sem site cadastrado"} · {r.verificadoEm.toLocaleString("pt-BR")}
                  </span>
                </span>
                <ContagemSeveridades criticos={r.criticos} altos={r.altos} medios={r.medios} />
              </summary>
              <div className="border-t border-line px-6 py-5">
                <ListaAchados achados={r.achados} />
                {r.contaClienteId && (
                  <Link href={`/painel/contas/${r.contaClienteId}`} className="mt-4 inline-block font-mono text-[12px] uppercase tracking-[0.04em] text-muted hover:text-ink">
                    Abrir conta →
                  </Link>
                )}
              </div>
            </details>
          ))}
        </div>
      )}

      {semResultado.length > 0 && (
        <p className="mt-6 text-body-sm text-muted">
          Aguardando a primeira verificação: {semResultado.map((c) => c.nome).join(", ")}.
        </p>
      )}
    </div>
  );
}
