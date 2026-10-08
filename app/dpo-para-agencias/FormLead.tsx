"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { linkContato } from "@/lib/contato";
import { digitosCelular, mascaraCelular, problemaNoCelular } from "@/lib/telefone";

const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
const CAMPO =
  "h-12 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 text-[15px] text-white outline-none transition-colors placeholder:text-white/35 focus:border-brand";

/**
 * Formulário da landing de anúncios: grava o lead (com as UTMs da campanha) em /admin/leads e abre a conversa
 * no WhatsApp comercial já com o nome da agência.
 */
export function FormLead({ id }: { id?: string }) {
  const [nome, setNome] = useState("");
  const [agencia, setAgencia] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const mensagem = () => `Olá! Sou ${nome.trim()} da ${agencia.trim()} e quero blindar a agência com a Dattis.`;

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    const p = problemaNoCelular(whatsapp);
    if (nome.trim().length < 2 || agencia.trim().length < 2) return setErro("Preencha seu nome e o nome da agência.");
    if (p) return setErro(p);
    setErro("");
    setEnviando(true);
    const params = new URLSearchParams(location.search);
    const utm: Record<string, string> = { ref: "lp-dpo-para-agencias" };
    for (const k of UTM) if (params.get(k)) utm[k] = params.get(k)!;
    // Abre a aba já no clique (antes do await) para o navegador não bloquear como pop-up.
    const aba = window.open("", "_blank");
    const r = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, agencia, whatsapp: digitosCelular(whatsapp), utm }),
    })
      .then((x) => x.json())
      .catch(() => ({ ok: false }));
    setEnviando(false);
    if (!r.ok) {
      aba?.close();
      return setErro(r.error ?? "Não foi possível enviar agora. Tente de novo.");
    }
    setEnviado(true);
    if (aba) aba.location.href = linkContato(mensagem());
  };

  if (enviado) {
    return (
      <div id={id} className="rounded-[28px] border border-brand/40 bg-white/[0.04] p-7 text-center">
        <CheckCircle2 size={36} className="mx-auto text-brand" />
        <p className="mt-4 font-display text-[24px] leading-tight text-white">Recebemos, {nome.trim().split(" ")[0]}!</p>
        <p className="mt-2 text-[15px] leading-relaxed text-white/70">Abrimos a conversa no WhatsApp. Se a aba não abriu, toque no botão abaixo.</p>
        <a href={linkContato(mensagem())} target="_blank" rel="noopener" className="btn btn-primary btn-lg mt-6 w-full">
          Abrir o WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form id={id} onSubmit={enviar} className="scroll-mt-24 rounded-[28px] border border-white/12 bg-white/[0.04] p-6 backdrop-blur sm:p-7">
      <p className="font-display text-[24px] leading-tight text-white">Descubra em 15 minutos quanto sua agência está exposta</p>
      <p className="mt-2 text-[14.5px] leading-relaxed text-white/65">
        Um especialista chama você no WhatsApp, olha a operação com você e mostra o plano que fecha os buracos.
      </p>
      <div className="mt-5 space-y-3">
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome*" autoComplete="name" required className={CAMPO} />
        <input value={agencia} onChange={(e) => setAgencia(e.target.value)} placeholder="Nome da agência*" autoComplete="organization" required className={CAMPO} />
        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(mascaraCelular(e.target.value))}
          placeholder="WhatsApp com DDD*"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          className={CAMPO}
        />
      </div>
      {erro && <p className="mt-3 text-[13.5px] text-[#ff8a7a]">{erro}</p>}
      <button type="submit" disabled={enviando} className="btn btn-primary btn-lg mt-5 w-full">
        {enviando ? "Enviando..." : "Quero blindar minha agência"} <ArrowRight size={17} />
      </button>
      <p className="mt-3 text-center text-[12.5px] text-white/50">Leva 20 segundos · Sem fidelidade · Sem compromisso</p>
      <p className="mt-4 border-t border-white/10 pt-4 text-center text-[13.5px] text-white/65">
        Prefere começar sozinho?{" "}
        <Link href="/cadastro" className="text-brand underline-offset-4 hover:underline">
          Crie a conta da agência
        </Link>
      </p>
    </form>
  );
}
