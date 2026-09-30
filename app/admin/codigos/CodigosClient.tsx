"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, MessageCircle } from "lucide-react";
import { PLANOS, type PlanoId } from "@/lib/planos";

const nomePlano = (id: string) => PLANOS.find((p) => p.id === id)?.nome ?? id;

export function SairAdmin() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/sair", { method: "POST" });
        router.push("/admin/entrar");
        router.refresh();
      }}
      className="btn btn-ghost"
    >
      Sair
    </button>
  );
}

export function NovoCodigo() {
  const router = useRouter();
  const [clienteNome, setClienteNome] = useState("");
  const [clienteContato, setClienteContato] = useState("");
  const [plano, setPlano] = useState<PlanoId>("growth");
  const [usuarios, setUsuarios] = useState(1);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    const res = await fetch("/api/admin/codigos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clienteNome, clienteContato, plano, usuarios }),
    });
    const data = await res.json().catch(() => ({ ok: false }));
    if (!data.ok) {
      setErro(data.error ?? "Não foi possível gerar o código.");
    } else {
      setClienteNome("");
      setClienteContato("");
      setUsuarios(1);
      router.refresh();
    }
    setEnviando(false);
  };

  const total = (PLANOS.find((p) => p.id === plano)?.preco ?? 0) * usuarios;

  return (
    <form onSubmit={submit} className="block-card mt-10 grid gap-5 px-7 py-9 sm:px-10 md:grid-cols-2 xl:grid-cols-[1.3fr_1.1fr_1fr_120px_auto] xl:items-end">
      <label className="block">
        <span className="text-body-sm font-medium text-body">Cliente (agência)</span>
        <input id="cod-nome" type="text" value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} required className="field-input mt-1.5" />
      </label>
      <label className="block">
        <span className="text-body-sm font-medium text-body">WhatsApp ou e-mail (opcional)</span>
        <input
          id="cod-contato"
          type="text"
          value={clienteContato}
          onChange={(e) => setClienteContato(e.target.value)}
          placeholder="(11) 99999-9999"
          className="field-input mt-1.5"
        />
      </label>
      <label className="block">
        <span className="text-body-sm font-medium text-body">Plano</span>
        <select id="cod-plano" value={plano} onChange={(e) => setPlano(e.target.value as PlanoId)} className="field-input mt-1.5">
          {PLANOS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome} · R$ {p.preco}/usuário
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-body-sm font-medium text-body">Usuários</span>
        <input
          id="cod-usuarios"
          type="number"
          min={1}
          max={500}
          value={usuarios}
          onChange={(e) => setUsuarios(Math.max(1, Number(e.target.value) || 1))}
          className="field-input mt-1.5"
        />
      </label>
      <button type="submit" disabled={enviando} className="btn btn-dark btn-lg">
        {enviando ? "Gerando..." : "Gerar código"}
      </button>
      <p className="text-[14px] text-muted md:col-span-2 xl:col-span-5">
        Mensalidade deste cliente: <span className="font-display text-[17px] text-ink">R$ {total}</span> ({usuarios} ×{" "}
        {nomePlano(plano)})
      </p>
      {erro && <p className="rounded-xl bg-danger-tint px-4 py-3 text-body-sm text-danger md:col-span-2 xl:col-span-5">{erro}</p>}
    </form>
  );
}

type Linha = {
  id: string;
  codigo: string;
  clienteNome: string;
  clienteContato: string | null;
  plano: string;
  usuarios: number;
  criadoEm: string;
  status: "disponivel" | "usado" | "revogado";
  usadoPor: string | null;
  usadoEm: string | null;
};

function linkWhatsApp(contato: string | null, texto: string) {
  const d = (contato ?? "").replace(/\D/g, "");
  if (d.length < 10) return null;
  const num = d.length <= 11 ? `55${d}` : d;
  return `https://wa.me/${num}?text=${encodeURIComponent(texto)}`;
}

export function CodigoLinha({ c, origem }: { c: Linha; origem: string }) {
  const router = useRouter();
  const [copiado, setCopiado] = useState<"codigo" | "msg" | null>(null);
  const link = `${origem}/cadastro?codigo=${c.codigo}`;
  const mensagem = [
    `Olá, ${c.clienteNome}! Pagamento confirmado — bem-vindo à Dattis.`,
    "",
    `Seu código de ativação: ${c.codigo}`,
    `Crie o acesso da sua agência aqui: ${link}`,
    "",
    `Plano ${nomePlano(c.plano)} · ${c.usuarios} usuário(s). O código vale para um único cadastro.`,
  ].join("\n");
  const wa = linkWhatsApp(c.clienteContato, mensagem);

  const copiar = async (tipo: "codigo" | "msg") => {
    try {
      await navigator.clipboard.writeText(tipo === "codigo" ? c.codigo : mensagem);
      setCopiado(tipo);
      setTimeout(() => setCopiado(null), 1600);
    } catch {
      /* clipboard indisponível */
    }
  };

  const revogar = async () => {
    if (!confirm(`Revogar o código ${c.codigo}? Ele deixa de funcionar no cadastro.`)) return;
    await fetch(`/api/admin/codigos/${c.id}`, { method: "PATCH" });
    router.refresh();
  };

  return (
    <li className="grid gap-4 rounded-[20px] border border-line bg-surface p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[18px] tracking-[0.04em]">{c.codigo}</span>
          {c.status === "disponivel" && <span className="pill pill-ok">Disponível</span>}
          {c.status === "usado" && <span className="pill pill-neutral">Usado</span>}
          {c.status === "revogado" && <span className="pill pill-danger">Revogado</span>}
        </div>
        <p className="mt-1.5 text-[15px]">
          <span className="font-display text-[18px]">{c.clienteNome}</span>
          <span className="text-muted">
            {" "}
            · {nomePlano(c.plano)} · {c.usuarios} usuário(s) · gerado em {c.criadoEm}
            {c.clienteContato ? ` · ${c.clienteContato}` : ""}
          </span>
        </p>
        {c.status === "usado" && (
          <p className="mt-1 text-[14px] text-muted">
            Ativado em {c.usadoEm}
            {c.usadoPor ? ` por ${c.usadoPor}` : ""}
          </p>
        )}
      </div>

      {c.status === "disponivel" && (
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => copiar("codigo")} className="btn btn-ghost">
            {copiado === "codigo" ? <Check size={15} /> : <Copy size={15} />} Código
          </button>
          <button type="button" onClick={() => copiar("msg")} className="btn btn-ghost">
            {copiado === "msg" ? <Check size={15} /> : <Copy size={15} />} Mensagem
          </button>
          {wa && (
            <a href={wa} target="_blank" rel="noopener" className="btn btn-primary">
              <MessageCircle size={15} /> Enviar no WhatsApp
            </a>
          )}
          <button type="button" onClick={revogar} className="px-2 text-[13px] text-muted underline underline-offset-2 hover:text-danger">
            Revogar
          </button>
        </div>
      )}
    </li>
  );
}
