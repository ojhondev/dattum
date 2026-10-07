import Link from "next/link";
import { eq } from "drizzle-orm";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { agencias, contasCliente } from "@/lib/db/schema";
import { RecursoTravado } from "@/components/app/RecursoTravado";
import { ultimosResultados } from "@/lib/vigilancia";
import { NotaVigilancia, ContagemSeveridades } from "@/components/app/VigilanciaChips";
import { ListaAchados } from "@/components/app/ListaAchados";
import { BarraModulo, BuscaModulo, FiltroModulo } from "@/components/app/Modulo";

export const dynamic = "force-dynamic";

const CHECAGENS = [
  "HTTPS ativo e certificado SSL válido",
  "Pixel do Meta, tag do Google e Pixel do TikTok x banner de cookies",
  "Formulário captando e-mail ou telefone sem política de privacidade",
  "Cabeçalhos de segurança e recursos carregados sem HTTPS",
  "Contrato assinado, registro preenchido e ferramentas mapeadas",
  "Selo Dattis no rodapé e validade do certificado",
];

export default async function VigilanciaPage({ searchParams }: { searchParams: Promise<{ q?: string; nivel?: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return null;
  const ag = await db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId), columns: { ativadaEm: true } });
  if (ag && !ag.ativadaEm) return <RecursoTravado titulo="Vigilância diária" texto="Todo dia às 6h a Dattis confere o site e a documentação de cada cliente e avisa o que precisa de atenção antes que vire multa ou BM restrita." exemplo="vigilancia" />;
  const { q, nivel } = await searchParams;
  const termo = (q ?? "").trim().toLowerCase();

  const [resultados, contas] = await Promise.all([
    ultimosResultados(sessao.agenciaId),
    db.query.contasCliente.findMany({ where: eq(contasCliente.agenciaId, sessao.agenciaId), columns: { id: true, nome: true, site: true } }),
  ]);
  const verificadas = new Set(resultados.map((r) => r.contaClienteId));
  const semResultado = contas.filter((c) => !verificadas.has(c.id));
  const nivelDe = (r: (typeof resultados)[number]) => (r.criticos > 0 ? "critico" : r.nota < 85 ? "atencao" : "protegido");
  const contagem = { critico: 0, atencao: 0, protegido: 0 };
  for (const r of resultados) contagem[nivelDe(r)]++;
  const ordenados = [...resultados]
    .filter((r) => !termo || [r.titular, r.alvo].some((v) => v?.toLowerCase().includes(termo)))
    .filter((r) => !nivel || nivelDe(r) === nivel)
    .sort((a, b) => a.nota - b.nota);

  return (
    <div className="max-w-[1400px]">
      <BarraModulo
        esquerda={
          <>
            <BuscaModulo placeholder="Buscar cliente ou site" />
            <FiltroModulo
              nome="nivel"
              opcoes={[
                { valor: "todos", rotulo: "Todos", n: resultados.length },
                { valor: "critico", rotulo: "Com alerta crítico", n: contagem.critico },
                { valor: "atencao", rotulo: "Atenção", n: contagem.atencao },
                { valor: "protegido", rotulo: "Protegidos", n: contagem.protegido },
              ]}
            />
          </>
        }
        direita={<span className="px-2 text-[13px] text-muted">Verificação automática todo dia às 6h</span>}
      />

      {ordenados.length === 0 ? (
        <div className="bloco p-10 text-center text-[14px] text-muted">
          {resultados.length
            ? "Nenhum cliente com esse filtro."
            : "A primeira verificação ainda não rodou. Abra um cliente e clique em Verificar agora, na aba Vigilância, ou aguarde a verificação das 6h."}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {ordenados.map((r) => (
            <details key={r.id} className="group bloco open:shadow-[var(--shadow-chip)]" open={r.criticos > 0}>
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
                <NotaVigilancia nota={r.nota} compacto />
                <span className="min-w-[180px] flex-1">
                  <span className="block text-[15.5px] font-medium text-ink">
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
                <ListaAchados achados={r.achados} cliente={r.contaClienteId ? { id: r.contaClienteId, nome: r.titular, site: r.alvo } : undefined} />
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

      <details data-tour="vig-checagens" className="mt-6 text-[13.5px] text-muted">
        <summary className="cursor-pointer hover:text-ink">O que a vigilância confere</summary>
        <ul className="mt-3 flex flex-wrap gap-2">
          {CHECAGENS.map((c) => (
            <li key={c} className="rounded-lg border border-line bg-surface px-3 py-1.5 text-body">
              {c}
            </li>
          ))}
        </ul>
      </details>

      {semResultado.length > 0 && (
        <p className="mt-6 text-body-sm text-muted">
          Aguardando a primeira verificação: {semResultado.map((c) => c.nome).join(", ")}.
        </p>
      )}
    </div>
  );
}
