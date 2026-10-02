"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Dados = {
  nome: string;
  email: string;
  cnpj: string;
  whatsapp: string;
  endereco: string;
  responsavelNome: string;
  responsavelCargo: string;
};

const CAMPOS: { k: keyof Dados; rotulo: string; dica?: string; tipo?: string; auto?: string; largo?: boolean }[] = [
  { k: "nome", rotulo: "Nome da agência", auto: "organization" },
  { k: "cnpj", rotulo: "CNPJ", dica: "00.000.000/0001-00" },
  { k: "responsavelNome", rotulo: "Responsável legal", dica: "Quem assina os contratos pela agência", auto: "name" },
  { k: "responsavelCargo", rotulo: "Cargo do responsável", dica: "Ex.: Sócio-diretor" },
  { k: "whatsapp", rotulo: "WhatsApp da agência", tipo: "tel", dica: "(11) 99999-9999" },
  { k: "email", rotulo: "E-mail de acesso", tipo: "email", auto: "email" },
  { k: "endereco", rotulo: "Endereço", dica: "Rua, número, bairro, cidade/UF e CEP", auto: "street-address", largo: true },
];

function Aviso({ estado }: { estado: { tipo: "ok" | "erro"; texto: string } | null }) {
  if (!estado) return null;
  return <p className={estado.tipo === "ok" ? "text-[14px] text-brand-ink" : "painel-error"}>{estado.texto}</p>;
}

export function FormDadosAgencia({ inicial, pedeSenhaParaEmail, bloqueado }: { inicial: Dados; pedeSenhaParaEmail: boolean; bloqueado: boolean }) {
  const router = useRouter();
  const [d, setD] = useState(inicial);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [estado, setEstado] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const trocaEmail = d.email.trim().toLowerCase() !== inicial.email;

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setEstado(null);
    const r = await fetch("/api/agencia", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...d, senhaAtual }),
    })
      .then((x) => x.json())
      .catch(() => ({ ok: false, error: "Sem conexão. Tente de novo." }));
    setSalvando(false);
    setEstado(r.ok ? { tipo: "ok", texto: "Dados salvos. Os contratos ainda não assinados já usam os dados novos." } : { tipo: "erro", texto: r.error ?? "Não foi possível salvar." });
    if (r.ok) {
      setSenhaAtual("");
      router.refresh();
    }
  };

  return (
    <form onSubmit={salvar} className="mt-5 flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {CAMPOS.map((c) => (
          <label key={c.k} className={"block" + (c.largo ? " sm:col-span-2" : "")}>
            <span className="text-body-sm font-medium text-body">{c.rotulo}</span>
            <input
              id={`cfg-${c.k}`}
              type={c.tipo ?? "text"}
              value={d[c.k]}
              placeholder={c.dica}
              autoComplete={c.auto}
              disabled={bloqueado}
              required={c.k === "nome" || c.k === "email"}
              onChange={(e) => setD((x) => ({ ...x, [c.k]: e.target.value }))}
              className="field-input mt-1.5"
            />
          </label>
        ))}
      </div>
      {trocaEmail && pedeSenhaParaEmail && (
        <label className="block sm:max-w-sm">
          <span className="text-body-sm font-medium text-body">Senha atual (para trocar o e-mail de acesso)</span>
          <input id="cfg-senha-email" type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} autoComplete="current-password" className="field-input mt-1.5" />
        </label>
      )}
      <Aviso estado={estado} />
      <div>
        <button type="submit" className="painel-btn" disabled={salvando || bloqueado}>
          {salvando ? "Salvando..." : "Salvar dados"}
        </button>
      </div>
    </form>
  );
}

export function FormSenha({ temSenha, bloqueado }: { temSenha: boolean; bloqueado: boolean }) {
  const router = useRouter();
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirma, setConfirma] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [estado, setEstado] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    if (nova.length < 8) return setEstado({ tipo: "erro", texto: "A nova senha precisa ter pelo menos 8 caracteres." });
    if (nova !== confirma) return setEstado({ tipo: "erro", texto: "As duas senhas não são iguais." });
    setSalvando(true);
    setEstado(null);
    const r = await fetch("/api/agencia/senha", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ atual, nova }) })
      .then((x) => x.json())
      .catch(() => ({ ok: false, error: "Sem conexão. Tente de novo." }));
    setSalvando(false);
    setEstado(r.ok ? { tipo: "ok", texto: "Senha salva." } : { tipo: "erro", texto: r.error ?? "Não foi possível salvar." });
    if (r.ok) {
      setAtual("");
      setNova("");
      setConfirma("");
      router.refresh();
    }
  };

  return (
    <form onSubmit={salvar} className="mt-5 flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {temSenha && (
          <label className="block">
            <span className="text-body-sm font-medium text-body">Senha atual</span>
            <input id="senha-atual" type="password" value={atual} onChange={(e) => setAtual(e.target.value)} required autoComplete="current-password" disabled={bloqueado} className="field-input mt-1.5" />
          </label>
        )}
        <label className="block">
          <span className="text-body-sm font-medium text-body">Nova senha</span>
          <input id="senha-nova" type="password" value={nova} onChange={(e) => setNova(e.target.value)} required minLength={8} autoComplete="new-password" disabled={bloqueado} className="field-input mt-1.5" />
        </label>
        <label className="block">
          <span className="text-body-sm font-medium text-body">Repita a nova senha</span>
          <input id="senha-confirma" type="password" value={confirma} onChange={(e) => setConfirma(e.target.value)} required minLength={8} autoComplete="new-password" disabled={bloqueado} className="field-input mt-1.5" />
        </label>
      </div>
      <Aviso estado={estado} />
      <div>
        <button type="submit" className="painel-btn" disabled={salvando || bloqueado}>
          {salvando ? "Salvando..." : temSenha ? "Trocar senha" : "Criar senha"}
        </button>
      </div>
    </form>
  );
}
