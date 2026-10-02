"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, ExternalLink, Globe } from "lucide-react";
import { linkContato } from "@/lib/contato";

/**
 * Política de privacidade pública hospedada pela Dattis (/p/{slug}/privacidade),
 * para a agência colar no rodapé do site e no formulário de anúncio.
 */
export function PoliticaPublicaCard({
  contaId,
  titular,
  url,
  emailInicial,
  emailSugerido,
  bloqueadoPlano,
}: {
  contaId?: string;
  titular: string;
  url: string | null; // null = não publicada
  emailInicial: string;
  emailSugerido: string;
  bloqueadoPlano: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(emailInicial || emailSugerido);
  const [estado, setEstado] = useState("");
  const [erro, setErro] = useState("");

  if (bloqueadoPlano) {
    return (
      <div className="rounded-[20px] border border-line bg-surface p-5">
        <p className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.04em] text-muted">
          <Globe size={15} /> Política de privacidade pública
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-body">
          Nos planos Growth e Scale, a Dattis hospeda a política de privacidade pronta, sempre atualizada, para colar no site e nos formulários
          de anúncio. No Start, gere o texto em Documentos.
        </p>
        <a href={linkContato("Olá! Quero a política de privacidade pública da Dattis (plano Growth).")} target="_blank" rel="noopener" className="painel-btn ghost mt-3">
          Falar sobre o Growth
        </a>
      </div>
    );
  }

  const publicar = async () => {
    setEstado("salvando");
    setErro("");
    const r = await fetch("/api/politica", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contaId, email }) })
      .then((x) => x.json())
      .catch(() => ({ ok: false }));
    setEstado("");
    if (!r.ok) return setErro(r.error ?? "Não foi possível publicar.");
    router.refresh();
  };

  const despublicar = async () => {
    if (!confirm("Tirar a política do ar? Sites e formulários que usam o link vão mostrar página não encontrada até você publicar de novo.")) return;
    await fetch(`/api/politica${contaId ? `?contaId=${contaId}` : ""}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div data-tour="conta-politica" className="rounded-[20px] border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.04em] text-muted">
          <Globe size={15} /> Política de privacidade pública
        </p>
        {url ? <span className="painel-pill ok">No ar</span> : <span className="painel-pill pendente">Não publicada</span>}
      </div>

      {url ? (
        <>
          <p className="mt-2 text-[14px] leading-relaxed text-body">
            Cole o link no rodapé do site{contaId ? " e no campo de política de privacidade do formulário instantâneo do Meta e do Google Ads" : ""}. Ela se
            atualiza sozinha quando você muda as operações{contaId ? " deste cliente" : " dos seus clientes"}.
          </p>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2">
            <input readOnly value={url} aria-label="Link da política" className="min-w-0 flex-1 bg-transparent font-mono text-[12px] text-ink outline-none" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="painel-btn" onClick={() => navigator.clipboard.writeText(url).then(() => setEstado("copiado"))}>
              <Copy size={14} /> {estado === "copiado" ? "Copiado" : "Copiar link"}
            </button>
            <a href={url} target="_blank" rel="noopener" className="painel-btn ghost">
              <ExternalLink size={14} /> Ver página
            </a>
          </div>
          <details className="mt-4 text-[14px]">
            <summary className="cursor-pointer text-muted">Canal de privacidade e opções</summary>
            <div className="mt-3 flex flex-col gap-3">
              <label className="block">
                <span className="text-body-sm font-medium text-body">E-mail para pedidos sobre dados pessoais</span>
                <input id={`pol-email-${contaId ?? "agencia"}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field-input mt-1.5" />
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="painel-btn ghost" onClick={publicar} disabled={estado === "salvando"}>
                  Salvar canal
                </button>
                <button type="button" className="text-[13px] text-muted underline hover:text-danger" onClick={despublicar}>
                  Tirar do ar
                </button>
              </div>
            </div>
          </details>
        </>
      ) : (
        <>
          <p className="mt-2 text-[14px] leading-relaxed text-body">
            A Dattis gera e hospeda a política de privacidade {contaId ? `da ${titular}` : "da sua agência"}, montada com{" "}
            {contaId ? "o registro de atividades, as ferramentas e o contrato deste cliente" : "as operações e ferramentas da sua carteira"}. Você
            recebe um link para colar no site{contaId ? " e no formulário de anúncio" : ""}.
          </p>
          <label className="mt-3 block">
            <span className="text-body-sm font-medium text-body">E-mail para pedidos sobre dados pessoais</span>
            <span className="mt-0.5 block text-[12.5px] text-muted">
              Aparece na política como o canal do titular{contaId ? " (de preferência um e-mail do cliente)" : ""}.
            </span>
            <input id={`pol-email-${contaId ?? "agencia"}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="privacidade@empresa.com.br" className="field-input mt-1.5" />
          </label>
          <button type="button" className="painel-btn mt-3" onClick={publicar} disabled={estado === "salvando"}>
            {estado === "salvando" ? "Publicando..." : "Publicar política"}
          </button>
        </>
      )}
      {erro && <p className="painel-error mt-3">{erro}</p>}
    </div>
  );
}
