import { Check, X, PenLine, Sparkles, Send, AlertTriangle } from "lucide-react";
import { MetaChips } from "@/components/marketing/MetaChips";

/* Telas de exemplo dos módulos, montadas com o próprio sistema visual. Decorativas. */

const SCREEN = "relative rounded-t-[24px] border border-b-0 border-black/5 bg-white p-6 text-[#0a120f] shadow-[0_-8px_40px_rgba(0,40,32,0.08)]";

export function RatVisual() {
  const rows = [
    ["Categoria de dado", "Contato hasheado (e-mail, telefone)"],
    ["Finalidade", "Otimizar e mensurar campanhas"],
    ["Base legal", "Legítimo interesse · art. 7º, IX"],
    ["Titulares", "Leads e clientes do cliente final"],
    ["Retenção", "Campanha ativa + 6 meses"],
  ];
  return (
    <div aria-hidden="true" className="relative">
      <div className={SCREEN}>
        <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#59645f]">RAT · Loja Aurora</p>
        <p className="font-display mt-2 text-[20px] leading-tight">Conversion API (CAPI) e Custom Audiences</p>
        <dl className="mt-5 divide-y divide-[#e3e3e1] text-[13px]">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[120px_1fr] gap-3 py-2.5">
              <dt className="text-[#59645f]">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <MetaChips className="absolute -top-5 right-4" items={[{ icon: Sparkles, label: "Gerado ao ativar a conta", status: "sim" }]} />
    </div>
  );
}

export function DpaVisual() {
  return (
    <div aria-hidden="true" className="relative">
      <div className={SCREEN}>
        <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#59645f]">Contrato de operação de dados</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
          <div className="rounded-2xl bg-[#f4f4f2] p-3">
            <p className="text-[11px] text-[#59645f]">Operadora</p>
            <p className="mt-0.5 font-medium">Sua agência</p>
          </div>
          <div className="rounded-2xl bg-[#f4f4f2] p-3">
            <p className="text-[11px] text-[#59645f]">Controladora</p>
            <p className="mt-0.5 font-medium">Loja Aurora</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {[100, 94, 88, 97, 72].map((w, i) => (
            <span key={i} className="block h-[5px] rounded-full bg-[#e3e3e1]" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-dashed border-[#d0d3cf] p-3 text-[12px]">
          <p className="font-medium">Ana Souza · Sócia-diretora</p>
          <p className="text-[#59645f]">Assinado em 12/09/2026, 14:32 · IP registrado</p>
        </div>
      </div>
      <MetaChips
        className="absolute -top-5 right-4"
        items={[{ icon: PenLine, label: "Assinatura eletrônica", status: "sim" }]}
      />
    </div>
  );
}

export function SubsVisual() {
  const rows = [
    { t: "Meta Ads", n: 24, ok: true },
    { t: "WhatsApp Business API", n: 22, ok: true },
    { t: "Google Ads", n: 17, ok: true },
    { t: "RD Station", n: 11, ok: true },
    { t: "Zapier", n: 3, ok: false },
  ];
  return (
    <div aria-hidden="true" className="relative">
      <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-6 text-white backdrop-blur">
        <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-white/60">Registro de subprocessadores · 24 contas</p>
        <ul className="mt-5 space-y-3.5">
          {rows.map((r) => (
            <li key={r.t}>
              <div className="mb-1.5 flex justify-between text-[13px]">
                <span>{r.t}</span>
                <span className="text-white/60">{r.n} contas</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className={"h-full rounded-full " + (r.ok ? "bg-[#6ceead]" : "bg-[#f38536]")} style={{ width: `${(r.n / 24) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <MetaChips
        className="absolute -bottom-6 left-4"
        items={[{ icon: AlertTriangle, label: "Zapier entrou sem contrato", status: "nao" }]}
      />
    </div>
  );
}

export function AuditVisual() {
  const findings = [
    { t: "Pixel da Meta carrega antes do aviso de cookies", ok: false },
    { t: "Política de privacidade publicada", ok: true },
    { t: "Formulário sem registro de consentimento", ok: false },
  ];
  return (
    <div aria-hidden="true" className={SCREEN}>
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full" style={{ background: "conic-gradient(#f38536 62%, #e3e3e1 0)" }}>
          <div className="grid h-12 w-12 place-items-center rounded-full bg-white font-display text-[17px]">62</div>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#59645f]">Risco · lojaaurora.com.br</p>
          <p className="font-display text-[18px] leading-tight">3 pontos de atenção</p>
        </div>
      </div>
      <ul className="mt-5 space-y-2.5 text-[13px]">
        {findings.map((f) => (
          <li key={f.t} className="flex items-start gap-2.5">
            <span className={"mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full " + (f.ok ? "bg-[#cff5e1] text-[#05563a]" : "bg-[#fdebdc] text-[#c8641b]")}>
              {f.ok ? <Check size={12} strokeWidth={2.5} /> : <X size={12} strokeWidth={2.5} />}
            </span>
            {f.t}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DatVisual() {
  const rows = [
    { t: "RAT", v: "4 atividades registradas" },
    { t: "DPA", v: "Assinado em 12/09/2026" },
    { t: "Subprocessadores", v: "4 mapeados, todos com contrato" },
  ];
  return (
    <div aria-hidden="true" className={SCREEN}>
      <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#59645f]">DAT · resumo de conformidade</p>
      <p className="font-display mt-2 text-[20px] leading-tight">Loja Aurora está em dia</p>
      <ul className="mt-4 space-y-2 text-[13px]">
        {rows.map((r) => (
          <li key={r.t} className="flex items-center gap-3 rounded-2xl bg-[#f4f4f2] px-3 py-2.5">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#45d190] text-[#002820]">
              <Check size={12} strokeWidth={2.5} />
            </span>
            <span className="font-medium">{r.t}</span>
            <span className="ml-auto text-right text-[#59645f]">{r.v}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#002820] px-4 py-2 font-mono text-[11px] uppercase text-white">
        <Send size={12} /> Enviar pro cliente
      </div>
    </div>
  );
}
