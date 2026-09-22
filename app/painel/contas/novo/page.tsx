"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Flows = { capi: boolean; ads: boolean; whatsapp: boolean; crm: boolean };

export default function NovaContaPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [contatoNome, setContatoNome] = useState("");
  const [contatoEmail, setContatoEmail] = useState("");
  const [crmNome, setCrmNome] = useState("");
  const [flows, setFlows] = useState<Flows>({ capi: false, ads: false, whatsapp: false, crm: false });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const toggle = (key: keyof Flows) => setFlows((f) => ({ ...f, [key]: !f[key] }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErro("Informe o nome do cliente.");
      return;
    }
    setEnviando(true);
    setErro("");
    try {
      const res = await fetch("/api/contas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, cnpj, contatoNome, contatoEmail, crmNome, flows }),
      });
      const data = await res.json();
      if (!data.ok) {
        setErro(data.error ?? "Não foi possível ativar a conta.");
        setEnviando(false);
        return;
      }
      router.push(`/painel/contas/${data.conta.id}`);
      router.refresh();
    } catch {
      setErro("Não foi possível ativar a conta agora. Tenta de novo.");
      setEnviando(false);
    }
  };

  return (
    <div>
      <p className="painel-eyebrow">Dattis · Nova conta</p>
      <h1 className="painel-title">Ativar conta nova</h1>
      <p className="painel-lede">
        Preenche os dados do cliente e marca o que ele usa. A Dattis já gera, na hora, o registro
        do que vocês fazem com o dado dele, o contrato entre vocês e a lista de ferramentas que
        tocam esse dado.
      </p>

      <form className="painel-form" onSubmit={submit}>
        <div className="painel-field">
          <label htmlFor="nome">Nome do cliente</label>
          <input id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Loja Aurora" />
        </div>
        <div className="painel-field">
          <label htmlFor="cnpj">CNPJ (opcional)</label>
          <input id="cnpj" type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" />
        </div>
        <div className="painel-field">
          <label htmlFor="contatoNome">Responsável do lado do cliente (opcional)</label>
          <input id="contatoNome" type="text" value={contatoNome} onChange={(e) => setContatoNome(e.target.value)} />
        </div>
        <div className="painel-field">
          <label htmlFor="contatoEmail">E-mail do responsável (opcional)</label>
          <input id="contatoEmail" type="email" value={contatoEmail} onChange={(e) => setContatoEmail(e.target.value)} />
        </div>

        <div className="painel-field">
          <label>O que vocês fazem com o dado desse cliente?</label>
          <span className="hint">Marca tudo que se aplica — isso define o que entra no registro e no contrato.</span>
          <div className="painel-checkbox-group">
            <label className="painel-checkbox">
              <input type="checkbox" checked={flows.capi} onChange={() => toggle("capi")} />
              <span>
                <span className="painel-checkbox-label" style={{ display: "block" }}>Custom Audiences / Conversion API (Meta)</span>
                <span className="painel-checkbox-sub">Upload de lista de cliente ou envio de evento de conversão hasheado.</span>
              </span>
            </label>
            <label className="painel-checkbox">
              <input type="checkbox" checked={flows.ads} onChange={() => toggle("ads")} />
              <span>
                <span className="painel-checkbox-label" style={{ display: "block" }}>Google Ads / TikTok Ads</span>
                <span className="painel-checkbox-sub">Veiculação e mensuração de campanha fora do Meta.</span>
              </span>
            </label>
            <label className="painel-checkbox">
              <input type="checkbox" checked={flows.whatsapp} onChange={() => toggle("whatsapp")} />
              <span>
                <span className="painel-checkbox-label" style={{ display: "block" }}>Atendimento via WhatsApp</span>
                <span className="painel-checkbox-sub">Lead entra em contato ou é abordado por WhatsApp.</span>
              </span>
            </label>
            <label className="painel-checkbox">
              <input type="checkbox" checked={flows.crm} onChange={() => toggle("crm")} />
              <span>
                <span className="painel-checkbox-label" style={{ display: "block" }}>CRM / automação de lead</span>
                <span className="painel-checkbox-sub">Lead fica armazenado numa ferramenta de CRM ou automação.</span>
              </span>
            </label>
          </div>
        </div>

        {flows.crm && (
          <div className="painel-field">
            <label htmlFor="crmNome">Qual CRM/ferramenta de automação?</label>
            <span className="hint">Deixa em branco pra usarmos RD Station como padrão do catálogo.</span>
            <input id="crmNome" type="text" value={crmNome} onChange={(e) => setCrmNome(e.target.value)} placeholder="Ex: HubSpot, ActiveCampaign..." />
          </div>
        )}

        {erro && <div className="painel-error">{erro}</div>}

        <div>
          <button className="painel-btn" type="submit" disabled={enviando}>
            {enviando ? "Ativando..." : "Ativar conta →"}
          </button>
        </div>
      </form>
    </div>
  );
}
