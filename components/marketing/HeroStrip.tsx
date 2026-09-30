import {
  MessageCircle,
  Scale,
  FileSignature,
  Megaphone,
  Clock,
  FileText,
  ListChecks,
  ShieldCheck,
  Database,
  Network,
} from "lucide-react";
import { MetaChips } from "@/components/marketing/MetaChips";

/**
 * Faixa do hero: cartões que ecoam as ferramentas que uma agência opera
 * (WhatsApp, Meta Ads, contrato, CRM, formulário), com os chips de
 * conformidade por cima — o equivalente Dattis das fotos com metadados do
 * proofmode.org. Decorativo.
 */

function WhatsAppTile() {
  return (
    <div className="flex h-full flex-col gap-2.5 bg-[#0b3a2f] p-4 pt-10">
      <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white/95 px-3 py-2 text-[12px] leading-snug text-[#0a120f]">
        Oi! Vi o anúncio, ainda tem o tênis no 42?
      </div>
      <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-[#6ceead] px-3 py-2 text-[12px] leading-snug text-[#002820]">
        Tem sim! Te mando o link com o cupom.
      </div>
      <div className="max-w-[70%] rounded-2xl rounded-tl-sm bg-white/95 px-3 py-2 text-[12px] leading-snug text-[#0a120f]">
        Pode mandar, obrigado!
      </div>
      <div className="mt-auto h-8 rounded-full bg-white/10" />
    </div>
  );
}

function MetaAdsTile() {
  const bars = [38, 52, 44, 66, 58, 81, 74, 92];
  return (
    <div className="flex h-full flex-col bg-white p-4 text-[#0a120f]">
      <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-[#59645f]">Conversões · CAPI</p>
      <p className="font-display mt-1 text-[30px] leading-none">1.284</p>
      <p className="mt-1 text-[11px] text-[#59645f]">eventos nos últimos 7 dias</p>
      <div className="mt-auto flex h-28 items-end gap-1.5">
        {bars.map((h, i) => (
          <span key={i} className="flex-1 rounded-t-md bg-[#45d190]" style={{ height: `${h}%`, opacity: 0.45 + i * 0.07 }} />
        ))}
      </div>
    </div>
  );
}

function ContractTile() {
  return (
    <div className="flex h-full flex-col bg-[#fbfbf8] p-5 text-[#0a120f]">
      <p className="font-mono text-[9.5px] uppercase leading-snug tracking-[0.05em]">Contrato de operação de dados pessoais</p>
      <div className="mt-4 space-y-2">
        {[92, 100, 84, 96, 70, 100, 88, 60].map((w, i) => (
          <span key={i} className="block h-[5px] rounded-full bg-[#e3e3e1]" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="mt-auto">
        <svg viewBox="0 0 120 34" className="h-9 w-28 text-[#002820]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M3 24c8-14 14-18 16-12s-6 14-2 12 10-16 14-14-4 12 0 11 8-9 12-9 2 7 6 6 10-8 16-8 6 6 12 5 12-5 20-5" />
        </svg>
        <div className="mt-1 h-px bg-[#0a120f]/30" />
        <p className="mt-2 text-[10px] text-[#59645f]">Assinado eletronicamente</p>
      </div>
    </div>
  );
}

function CrmTile() {
  const cols = [
    { t: "Novo lead", n: 3 },
    { t: "Qualificado", n: 2 },
    { t: "Venda", n: 1 },
  ];
  return (
    <div className="grid h-full grid-cols-3 gap-2 bg-[#cff5e1] p-3 pt-4 text-[#002820]">
      {cols.map((c) => (
        <div key={c.t} className="flex flex-col gap-1.5">
          <p className="font-mono text-[8.5px] uppercase tracking-[0.04em]">{c.t}</p>
          {Array.from({ length: c.n }).map((_, i) => (
            <div key={i} className="rounded-lg bg-white p-1.5">
              <span className="block h-1.5 w-4/5 rounded-full bg-[#002820]/70" />
              <span className="mt-1 block h-1 w-3/5 rounded-full bg-[#002820]/25" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function FormTile() {
  return (
    <div className="flex h-full flex-col gap-2 bg-[#ee9ef3] p-4 pt-6 text-[#0a120f]">
      <p className="font-display text-[19px] leading-tight">Garanta seu cupom de 15%</p>
      {["Nome", "WhatsApp", "E-mail"].map((f) => (
        <div key={f} className="rounded-lg bg-white/90 px-2.5 py-2 text-[11px] text-[#59645f]">
          {f}
        </div>
      ))}
      <div className="flex items-center gap-1.5 text-[10px]">
        <span className="h-3 w-3 rounded-[3px] border border-[#0a120f]/50 bg-white/70" />
        Aceito receber ofertas
      </div>
      <div className="mt-auto rounded-full bg-[#0a120f] py-2 text-center font-mono text-[10px] uppercase text-white">Quero o cupom</div>
    </div>
  );
}

function SubsTile() {
  const rows = ["Meta Ads", "Google Ads", "WhatsApp Business", "RD Station", "Zapier"];
  return (
    <div className="flex h-full flex-col bg-[#002820] p-4 text-white">
      <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-white/60">Subprocessadores</p>
      <ul className="mt-3 space-y-2">
        {rows.map((r, i) => (
          <li key={r} className="flex items-center justify-between rounded-full bg-white/[0.07] px-3 py-1.5 text-[11px]">
            {r}
            <span className={"h-2 w-2 rounded-full " + (i === 3 ? "bg-[#f38536]" : "bg-[#6ceead]")} />
          </li>
        ))}
      </ul>
    </div>
  );
}

const TILE = "relative w-[210px] shrink-0 overflow-hidden rounded-[6px] sm:w-[240px]";

export function HeroStrip() {
  return (
    <div aria-hidden="true" className="pointer-events-none relative flex w-full select-none justify-center overflow-hidden pb-6 pt-10">
      <div className="flex w-max shrink-0 items-start gap-5 px-5">
        <div className={TILE + " mt-16 h-[230px]"}>
          <CrmTile />
        </div>

        <div className="relative mt-4 shrink-0">
          <div className={TILE + " h-[300px]"}>
            <WhatsAppTile />
          </div>
          <MetaChips
            className="absolute -left-8 bottom-4 z-10"
            items={[
              { icon: MessageCircle, label: "WhatsApp Business API" },
              { icon: Scale, label: "Base legal: art. 7º, V" },
              { icon: FileSignature, label: "DPA assinado", status: "sim" },
            ]}
          />
        </div>

        <div className={TILE + " mt-12 h-[250px]"}>
          <ContractTile />
        </div>

        <div className="relative shrink-0">
          <MetaChips
            className="relative z-10 mb-3 -ml-4"
            items={[
              { icon: Megaphone, label: "Meta Ads · Conversions API" },
              { icon: Clock, label: "Retenção: 6 meses" },
              { icon: FileText, label: "Registrado no RAT", status: "sim" },
            ]}
          />
          <div className={TILE + " h-[250px]"}>
            <MetaAdsTile />
          </div>
        </div>

        <div className="relative mt-8 shrink-0">
          <div className={TILE + " h-[290px]"}>
            <FormTile />
          </div>
          <MetaChips
            className="absolute -left-10 bottom-6 z-10"
            items={[
              { icon: ListChecks, label: "Formulário de lead" },
              { icon: ShieldCheck, label: "Consentimento registrado", status: "nao" },
            ]}
          />
        </div>

        <div className="relative mt-20 shrink-0">
          <div className={TILE + " h-[220px]"}>
            <SubsTile />
          </div>
          <MetaChips
            className="absolute -left-6 -top-10 z-10"
            items={[
              { icon: Database, label: "RD Station" },
              { icon: Network, label: "Contrato com subprocessador", status: "nao" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
