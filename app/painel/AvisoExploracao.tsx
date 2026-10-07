"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Compass } from "lucide-react";

/**
 * Faixa no topo do painel das contas criadas pelo site e ainda não ativadas: explica o que está liberado,
 * leva ao WhatsApp para ativar e deixa o dono aplicar o código de ativação. Na impressão, troca o conteúdo
 * da página por um aviso (documento só sai de conta ativada).
 */
export function AvisoExploracao({ limite, linkAtivar, podeAplicar }: { limite: number | null; linkAtivar: string; podeAplicar: boolean }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [estado, setEstado] = useState<"" | "salvando" | string>("");

  const aplicar = async (e: FormEvent) => {
    e.preventDefault();
    setEstado("salvando");
    const r = await fetch("/api/agencia/ativar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ codigo }) })
      .then((x) => x.json())
      .catch(() => ({ ok: false, error: "Não foi possível ativar agora. Tenta de novo." }));
    if (!r.ok) return setEstado(r.error ?? "Não foi possível ativar.");
    setEstado("");
    router.refresh();
  };

  return (
    <>
      <style>{`@media print { main > *:not(.aviso-impressao) { display: none !important; } .aviso-impressao { display: block !important; } }`}</style>
      <p className="aviso-impressao hidden text-[16px]">
        Documento indisponível: esta conta da Dattis ainda está em exploração. Os documentos são liberados quando o plano for ativado.
      </p>
      <div className="no-print mb-6 rounded-[20px] border border-line-strong bg-brand-tint px-5 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Compass size={22} className="hidden shrink-0 text-brand-ink sm:block" />
          <p className="flex-1 text-[14.5px] leading-relaxed text-ink">
            <b>Sua conta está em exploração.</b> Cadastre a agência e {limite ? `até ${limite} clientes` : "seus clientes"} à vontade para conhecer a
            plataforma. Contratos, documentos, selo, certificado e publicações são liberados quando o plano for ativado.
          </p>
          <span className="flex shrink-0 flex-wrap gap-2 self-start sm:self-auto">
            <a href={linkAtivar} target="_blank" rel="noopener" className="painel-btn">
              Ativar plano no WhatsApp
            </a>
            {podeAplicar && !aberto && (
              <button type="button" className="btn btn-ghost" onClick={() => setAberto(true)}>
                Tenho um código
              </button>
            )}
          </span>
        </div>
        {aberto && (
          <form onSubmit={aplicar} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              aria-label="Código de ativação"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="ATV-XXXX-XXXX"
              required
              className="field-input font-mono uppercase sm:max-w-[240px]"
            />
            <button type="submit" disabled={estado === "salvando"} className="painel-btn">
              {estado === "salvando" ? "Ativando..." : "Ativar"}
            </button>
            {estado && estado !== "salvando" && <span className="text-[13px] text-danger">{estado}</span>}
          </form>
        )}
      </div>
    </>
  );
}
