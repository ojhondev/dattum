"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FLUXOS, type FlowKey } from "@/lib/fluxos";

type Flows = Record<FlowKey, boolean>;

export type DadosFormConta = {
  nome: string;
  cnpj: string;
  contatoNome: string;
  contatoEmail: string;
  contatoWhatsapp: string;
  crmNome: string;
  site: string;
  flows: Flows;
};

export const CONTA_VAZIA: DadosFormConta = {
  nome: "",
  cnpj: "",
  contatoNome: "",
  contatoEmail: "",
  contatoWhatsapp: "",
  crmNome: "",
  site: "",
  flows: { publicos: false, capi: false, ads: false, formularios: false, whatsapp: false, crm: false },
};

/** Formulário de conta de cliente: ativação (POST) e edição (PATCH, com aviso de nova versão do contrato). */
export function FormConta({ inicial, contaId, contratoAssinado = false }: { inicial: DadosFormConta; contaId?: string; contratoAssinado?: boolean }) {
  const router = useRouter();
  const [d, setD] = useState(inicial);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const editando = !!contaId;

  const campo = (k: Exclude<keyof DadosFormConta, "flows">) => ({
    id: k,
    value: d[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setD((x) => ({ ...x, [k]: e.target.value })),
  });
  const toggle = (key: FlowKey) => setD((x) => ({ ...x, flows: { ...x.flows, [key]: !x.flows[key] } }));

  const mudaContrato =
    editando &&
    (d.nome.trim() !== inicial.nome ||
      d.cnpj.trim() !== inicial.cnpj ||
      d.crmNome.trim() !== inicial.crmNome ||
      FLUXOS.some((f) => d.flows[f.key] !== inicial.flows[f.key]));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!d.nome.trim()) return setErro("Informe o nome do cliente.");
    if (mudaContrato && contratoAssinado && !confirm("Essas mudanças geram uma nova versão do contrato, que precisa ser assinada de novo pela agência e pelo cliente. Continuar?")) return;
    setEnviando(true);
    setErro("");
    const r = await fetch(editando ? `/api/contas/${contaId}` : "/api/contas", {
      method: editando ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    })
      .then((x) => x.json())
      .catch(() => ({ ok: false, error: "Sem conexão. Tenta de novo." }));
    if (!r.ok) {
      setErro(r.error ?? "Não foi possível salvar.");
      setEnviando(false);
      return;
    }
    router.push(`/painel/contas/${editando ? contaId : r.conta.id}${editando && r.contrato === "nova_versao" ? "?aba=dpa" : ""}`);
    router.refresh();
  };

  return (
    <form className="painel-form" onSubmit={submit}>
      <div className="painel-field">
        <label htmlFor="nome">Nome do cliente</label>
        <input type="text" placeholder="Ex: Loja Aurora" {...campo("nome")} />
      </div>
      <div className="painel-field">
        <label htmlFor="cnpj">CNPJ (opcional)</label>
        <input type="text" placeholder="00.000.000/0001-00" {...campo("cnpj")} />
      </div>
      <div className="painel-field">
        <label htmlFor="contatoNome">Responsável do lado do cliente</label>
        <span className="hint">É quem recebe o link para assinar o contrato.</span>
        <input type="text" autoComplete="off" {...campo("contatoNome")} />
      </div>
      <div className="painel-field">
        <label htmlFor="contatoWhatsapp">WhatsApp do responsável</label>
        <input type="tel" inputMode="tel" placeholder="(11) 99999-9999" {...campo("contatoWhatsapp")} />
      </div>
      <div className="painel-field">
        <label htmlFor="contatoEmail">E-mail do responsável</label>
        <input type="email" {...campo("contatoEmail")} />
      </div>

      <div className="painel-field">
        <label htmlFor="site">Site ou loja do cliente</label>
        <span className="hint">A vigilância diária confere HTTPS, pixel x banner de cookies e política de privacidade nesse endereço.</span>
        <input type="text" inputMode="url" placeholder="lojaaurora.com.br" {...campo("site")} />
      </div>

      <div className="painel-field">
        <label>O que a agência faz com o dado desse cliente?</label>
        <span className="hint">Marque tudo que se aplica: cada item vira uma linha no registro e uma cláusula no contrato.</span>
        <div className="painel-checkbox-group">
          {FLUXOS.map((f) => (
            <label key={f.key} className="painel-checkbox">
              <input type="checkbox" checked={d.flows[f.key]} onChange={() => toggle(f.key)} />
              <span className="flex flex-col gap-1">
                <span className="painel-checkbox-label">{f.titulo}</span>
                <span className="painel-checkbox-sub">{f.comoChamam}</span>
                <span className="text-[12.5px] leading-snug text-warn">
                  <b className="font-semibold">Por que importa:</b> {f.risco}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {d.flows.crm && (
        <div className="painel-field">
          <label htmlFor="crmNome">Qual CRM/ferramenta de automação?</label>
          <span className="hint">Deixe em branco para usarmos RD Station como padrão do catálogo.</span>
          <input type="text" placeholder="Ex: HubSpot, ActiveCampaign..." {...campo("crmNome")} />
        </div>
      )}

      {mudaContrato && contratoAssinado && (
        <div className="rounded-2xl bg-warn-tint px-4 py-3 text-[14px] leading-relaxed text-warn">
          Essas mudanças alteram o contrato. Ao salvar, a versão assinada fica guardada no histórico e uma nova versão precisa ser assinada
          pela agência e pelo cliente.
        </div>
      )}

      {erro && <div className="painel-error">{erro}</div>}

      <div className="flex flex-wrap gap-3">
        <button className="painel-btn" type="submit" disabled={enviando}>
          {enviando ? "Salvando..." : editando ? "Salvar alterações" : "Ativar conta →"}
        </button>
        {editando && (
          <button className="painel-btn ghost" type="button" onClick={() => router.back()}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
