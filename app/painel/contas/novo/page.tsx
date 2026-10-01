"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FLUXOS, type FlowKey } from "@/lib/fluxos";

type Flows = Record<FlowKey, boolean>;

export default function NovaContaPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [contatoNome, setContatoNome] = useState("");
  const [contatoEmail, setContatoEmail] = useState("");
  const [crmNome, setCrmNome] = useState("");
  const [site, setSite] = useState("");
  const [flows, setFlows] = useState<Flows>({ publicos: false, capi: false, ads: false, formularios: false, whatsapp: false, crm: false });
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
        body: JSON.stringify({ nome, cnpj, contatoNome, contatoEmail, crmNome, site, flows }),
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
          <label htmlFor="site">Site ou loja do cliente</label>
          <span className="hint">A vigilância diária confere HTTPS, pixel x banner de cookies e política de privacidade nesse endereço.</span>
          <input id="site" type="text" inputMode="url" value={site} onChange={(e) => setSite(e.target.value)} placeholder="lojaaurora.com.br" />
        </div>

        <div className="painel-field">
          <label>O que a agência faz com o dado desse cliente?</label>
          <span className="hint">Marque tudo que se aplica — cada item vira uma linha no registro e uma cláusula no contrato.</span>
          <div className="painel-checkbox-group">
            {FLUXOS.map((f) => (
              <label key={f.key} className="painel-checkbox">
                <input type="checkbox" checked={flows[f.key]} onChange={() => toggle(f.key)} />
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
