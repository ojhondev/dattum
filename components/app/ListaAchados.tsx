import { Mail, MessageCircle, ArrowRight } from "lucide-react";
import { ordenarAchados, type Achado } from "@/lib/vigilancia-tipos";
import { acaoDoAchado, mensagemParaDev } from "@/lib/vigilancia-acao";
import { SeveridadeChip } from "./VigilanciaChips";

/** Onde a agência resolve, no painel, cada alerta que é com ela. */
function ondeResolver(codigo: string, contaId: string) {
  const base = `/painel/contas/${contaId}`;
  return (
    {
      "dpa-pendente": `${base}?aba=contrato`,
      "rat-vazio": `${base}/editar`,
      "sem-ferramentas": `${base}?aba=ferramentas`,
      certificado: "/painel/certificados",
      "sem-site": `${base}?aba=site`,
      "site-invalido": `${base}?aba=site`,
    } as Record<string, string>
  )[codigo];
}

/**
 * Lista de achados da vigilância: alertas primeiro, itens OK resumidos no fim.
 * Com `cliente`, cada alerta vira ação em português simples: o que é com a agência leva ao lugar
 * de resolver; o que é com quem cuida do site já traz a mensagem pronta para mandar.
 */
export function ListaAchados({
  achados,
  mostrarOk = true,
  cliente,
}: {
  achados: Achado[];
  mostrarOk?: boolean;
  cliente?: { id: string; nome: string; site: string | null };
}) {
  const ordenados = ordenarAchados(achados);
  const alertas = ordenados.filter((a) => a.severidade !== "ok");
  const oks = ordenados.filter((a) => a.severidade === "ok");

  return (
    <div className="flex flex-col gap-2.5">
      {alertas.length === 0 && <p className="rounded-2xl bg-brand-tint px-4 py-3 text-body-sm text-brand-ink">Nenhum alerta nesta verificação.</p>}
      {alertas.map((a) => {
        const ac = cliente ? acaoDoAchado(a) : null;
        const msg = ac?.pedido && cliente ? mensagemParaDev(cliente.nome, cliente.site, ac.pedido) : null;
        const href = ac?.quem === "agencia" && cliente ? ondeResolver(a.codigo, cliente.id) : undefined;
        return (
          <div key={a.codigo + a.titulo} className="rounded-2xl border border-line bg-surface px-4 py-3.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="font-medium text-ink">{ac ? ac.acao : a.titulo}</p>
              <span className="flex items-center gap-1.5">
                {a.artigo && <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-faint">LGPD {a.artigo}</span>}
                <SeveridadeChip severidade={a.severidade} />
              </span>
            </div>
            <p className="mt-1 text-body-sm leading-relaxed text-body">{a.detalhe}</p>
            {ac ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {msg && (
                  <>
                    <span className="text-[13px] text-muted">Quem resolve é quem cuida do site:</span>
                    <a href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener" className="barra-btn primario">
                      <MessageCircle size={14} /> Pedir pelo WhatsApp
                    </a>
                    <a href={`mailto:?subject=${encodeURIComponent(`Ajuste no site da ${cliente!.nome}`)}&body=${encodeURIComponent(msg)}`} className="barra-btn">
                      <Mail size={14} /> Por e-mail
                    </a>
                  </>
                )}
                {href && (
                  <a href={href} className="barra-btn primario">
                    Resolver agora <ArrowRight size={14} />
                  </a>
                )}
                <details className="w-full text-[12.5px] text-muted">
                  <summary className="cursor-pointer hover:text-ink">Detalhe técnico</summary>
                  <p className="mt-1">
                    {a.titulo}
                    {a.correcao ? ` · ${a.correcao}` : ""}
                  </p>
                </details>
              </div>
            ) : (
              a.correcao && (
                <p className="mt-1.5 text-body-sm leading-relaxed text-muted">
                  <b className="font-semibold text-ink">Como corrigir:</b> {a.correcao}
                </p>
              )
            )}
          </div>
        );
      })}
      {mostrarOk && oks.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {oks.map((a) => (
            <span key={a.codigo + a.titulo} title={a.detalhe}>
              <SeveridadeChip severidade="ok">{a.titulo}</SeveridadeChip>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
