"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FLUXO_POR_CHAVE, type FlowKey } from "@/lib/fluxos";
import { SiteDaConta, VigilanciaDaConta, type ResultadoVigilancia } from "./VigilanciaConta";

type Atividade = {
  id: string;
  nomeAtividade: string;
  categoriasDado: string;
  finalidade: string;
  baseLegal: string;
  titulares: string;
  prazoRetencao: string;
};

type Subprocessador = {
  id: string;
  nome: string;
  categoria: string;
  pais: string;
  finalidade: string;
  ativo: boolean;
};

type Dpa = {
  id: string;
  status: string;
  conteudoSnapshot: string;
  versao: number;
  assinanteNome: string | null;
  assinanteCargo: string | null;
  assinadoEm: string | null;
  assinadoIp: string | null;
};

type Conta = {
  id: string;
  nome: string;
  cnpj: string | null;
  contatoNome: string | null;
  contatoEmail: string | null;
  site: string | null;
  fluxos: FlowKey[];
};

const CAMPOS: { chave: keyof Atividade; label: string; full?: boolean }[] = [
  { chave: "nomeAtividade", label: "Atividade", full: true },
  { chave: "categoriasDado", label: "Categorias de dado", full: true },
  { chave: "finalidade", label: "Finalidade" },
  { chave: "baseLegal", label: "Base legal" },
  { chave: "titulares", label: "Titulares" },
  { chave: "prazoRetencao", label: "Prazo de retenção" },
];

function AtividadeCard({ atividade, contaId }: { atividade: Atividade; contaId: string }) {
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState(atividade);
  const [salvando, setSalvando] = useState(false);

  const salvar = async () => {
    setSalvando(true);
    await fetch(`/api/rat/${contaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSalvando(false);
    setEditando(false);
  };

  return (
    <div className="rat-card">
      <h3>{form.nomeAtividade}</h3>
      <div className="rat-grid">
        {CAMPOS.map((campo) => (
          <div key={campo.chave} className={`painel-field ${campo.full ? "full" : ""}`}>
            <label>{campo.label}</label>
            {editando ? (
              <textarea
                rows={2}
                value={form[campo.chave]}
                onChange={(e) => setForm((f) => ({ ...f, [campo.chave]: e.target.value }))}
              />
            ) : (
              <span style={{ fontSize: ".88rem", color: "var(--color-body)" }}>{form[campo.chave]}</span>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
        {editando ? (
          <>
            <button className="painel-btn" type="button" onClick={salvar} disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </button>
            <button className="painel-btn ghost" type="button" onClick={() => { setForm(atividade); setEditando(false); }}>
              Cancelar
            </button>
          </>
        ) : (
          <button className="painel-btn ghost" type="button" onClick={() => setEditando(true)}>
            Editar
          </button>
        )}
      </div>
    </div>
  );
}

export default function ContaDetalhe({
  conta,
  atividadesIniciais,
  subprocessadores,
  dpaInicial,
  vigilancia,
}: {
  conta: Conta;
  atividadesIniciais: Atividade[];
  subprocessadores: Subprocessador[];
  dpaInicial: Dpa | null;
  vigilancia: ResultadoVigilancia;
}) {
  const router = useRouter();
  const [aba, setAba] = useState<"rat" | "dpa" | "sub" | "vig">("rat");
  const [dpa, setDpa] = useState(dpaInicial);
  const [assNome, setAssNome] = useState("");
  const [assCargo, setAssCargo] = useState("");
  const [aceite, setAceite] = useState(false);
  const [assinando, setAssinando] = useState(false);
  const [erroAssinatura, setErroAssinatura] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  const assinar = async () => {
    if (!dpa) return;
    if (!assNome.trim() || !assCargo.trim() || !aceite) {
      setErroAssinatura("Preenche nome, cargo e confirma que leu e concorda.");
      return;
    }
    setAssinando(true);
    setErroAssinatura("");
    const res = await fetch(`/api/dpa/${dpa.id}/assinar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: assNome, cargo: assCargo, aceite }),
    });
    const data = await res.json();
    setAssinando(false);
    if (!data.ok) {
      setErroAssinatura(data.error ?? "Não foi possível assinar agora.");
      return;
    }
    setDpa(data.dpa);
  };

  const excluirConta = async () => {
    if (!confirm(`Excluir a conta "${conta.nome}"? Isso remove o RAT, o contrato e os subprocessadores dela.`)) return;
    setExcluindo(true);
    await fetch(`/api/contas/${conta.id}`, { method: "DELETE" });
    router.push("/painel/contas");
    router.refresh();
  };

  return (
    <div>
      <p className="painel-eyebrow">Dattis · Conta de cliente</p>
      <h1 className="painel-title">{conta.nome}</h1>
      <p className="painel-lede">
        {conta.cnpj ? `CNPJ ${conta.cnpj} · ` : ""}
        {conta.contatoNome ? `Responsável: ${conta.contatoNome}` : "Sem responsável informado"}
      </p>
      <div className="mb-8 -mt-2">
        <SiteDaConta contaId={conta.id} siteInicial={conta.site} />
      </div>

      <div className="painel-tabs">
        <button className={`painel-tab ${aba === "rat" ? "active" : ""}`} onClick={() => setAba("rat")} type="button">
          O que fazemos com o dado
        </button>
        <button className={`painel-tab ${aba === "dpa" ? "active" : ""}`} onClick={() => setAba("dpa")} type="button">
          Contrato com o cliente
        </button>
        <button className={`painel-tab ${aba === "sub" ? "active" : ""}`} onClick={() => setAba("sub")} type="button">
          Quem mais mexe nesse dado
        </button>
        <button className={`painel-tab ${aba === "vig" ? "active" : ""}`} onClick={() => setAba("vig")} type="button">
          Vigilância
        </button>
      </div>

      {aba === "vig" && <VigilanciaDaConta contaId={conta.id} resultado={vigilancia} temSite={!!conta.site} />}

      {aba === "rat" && (
        <div>
          <p className="painel-lede" style={{ marginBottom: 20 }}>
            Registro de Atividades de Tratamento (RAT) desta conta — gerado a partir do que a agência faz com o dado do
            cliente, editável a qualquer momento.
          </p>
          {conta.fluxos.length > 0 && (
            <div className="mb-8 grid gap-3 md:grid-cols-2">
              {conta.fluxos.map((k) => {
                const f = FLUXO_POR_CHAVE[k];
                return (
                  <div key={k} className="rounded-[20px] border border-line bg-surface p-5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-display text-[18px] leading-snug text-ink">{f.titulo}</p>
                      <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.04em] text-faint">LGPD {f.artigo}</span>
                    </div>
                    <p className="mt-2 text-body-sm leading-relaxed text-muted">{f.comoChamam}</p>
                    <p className="mt-2 text-body-sm leading-relaxed text-warn">
                      <b className="font-semibold">Por que importa:</b> {f.risco}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
          {atividadesIniciais.length === 0 ? (
            <div className="painel-table-wrap">
              <div className="painel-empty">Nenhuma atividade registrada — nenhum fluxo padrão foi marcado na ativação.</div>
            </div>
          ) : (
            atividadesIniciais.map((a) => <AtividadeCard key={a.id} atividade={a} contaId={conta.id} />)
          )}
        </div>
      )}

      {aba === "dpa" && (
        <div>
          <p className="painel-lede" style={{ marginBottom: 20 }}>
            Contrato de Operador de Dados (DPA) — gerado a partir do RAT e da lista de
            subprocessadores desta conta.
          </p>
          {!dpa ? (
            <div className="painel-table-wrap">
              <div className="painel-empty">Nenhum contrato gerado para esta conta.</div>
            </div>
          ) : (
            <div className="dpa-doc">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                {dpa.status === "assinado" ? (
                  <span className="painel-pill ok">Assinado</span>
                ) : (
                  <span className="painel-pill pendente">Pendente de assinatura</span>
                )}
                <a className="painel-btn ghost" href={`/api/dpa/${dpa.id}/pdf`} target="_blank" rel="noopener noreferrer">
                  Baixar PDF
                </a>
              </div>
              <pre>{dpa.conteudoSnapshot}</pre>

              {dpa.status === "assinado" ? (
                <div className="dpa-signed-box">
                  Assinado eletronicamente por <b>{dpa.assinanteNome}</b> ({dpa.assinanteCargo}) em{" "}
                  {dpa.assinadoEm ? new Date(dpa.assinadoEm).toLocaleString("pt-BR") : "-"} · IP {dpa.assinadoIp}
                </div>
              ) : (
                <div className="dpa-signbox">
                  <p style={{ margin: "0 0 12px", fontWeight: 600 }}>Assinar este contrato</p>
                  <div className="painel-form" style={{ maxWidth: "100%" }}>
                    <div className="painel-field">
                      <label>Nome do responsável pela agência</label>
                      <input type="text" value={assNome} onChange={(e) => setAssNome(e.target.value)} />
                    </div>
                    <div className="painel-field">
                      <label>Cargo</label>
                      <input type="text" value={assCargo} onChange={(e) => setAssCargo(e.target.value)} />
                    </div>
                    <label className="painel-checkbox" style={{ maxWidth: 480 }}>
                      <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} />
                      <span className="painel-checkbox-label">Li e concordo com os termos deste contrato.</span>
                    </label>
                    {erroAssinatura && <div className="painel-error">{erroAssinatura}</div>}
                    <div>
                      <button className="painel-btn" type="button" onClick={assinar} disabled={assinando}>
                        {assinando ? "Assinando..." : "Assinar contrato"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {aba === "sub" && (
        <div>
          <p className="painel-lede" style={{ marginBottom: 20 }}>
            Ferramentas que tocam o dado desta conta, herdadas do catálogo central da Dattis ou
            adicionadas na ativação.
          </p>
          <div className="painel-table-wrap">
            {subprocessadores.length === 0 ? (
              <div className="painel-empty">Nenhum subprocessador vinculado a esta conta.</div>
            ) : (
              <table className="painel-table">
                <thead>
                  <tr>
                    <th>Ferramenta</th>
                    <th>Categoria</th>
                    <th>País</th>
                    <th>Finalidade</th>
                  </tr>
                </thead>
                <tbody>
                  {subprocessadores.map((s) => (
                    <tr key={s.id}>
                      <td>{s.nome}</td>
                      <td>{s.categoria}</td>
                      <td>{s.pais}</td>
                      <td style={{ fontSize: ".82rem", color: "var(--color-muted)" }}>{s.finalidade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--color-line)" }}>
        <button className="painel-btn danger" type="button" onClick={excluirConta} disabled={excluindo}>
          {excluindo ? "Excluindo..." : "Excluir esta conta"}
        </button>
      </div>
    </div>
  );
}
