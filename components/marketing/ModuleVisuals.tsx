import Image from "next/image";
import { Check, X, PenLine, Sparkles, Send, AlertTriangle, FileSignature } from "lucide-react";
import { MetaChips } from "@/components/marketing/MetaChips";
import { Cena } from "@/components/marketing/Cena";
import marca from "../../public/brand/icone-sidebar-menta.png";

/*
  Telas de exemplo dos módulos, montadas com o próprio sistema visual. Decorativas.
  Cada uma toca uma vez ao entrar na tela (classes .an-* + <Cena>, ver globals.css);
  --d escalona os elementos. Parada, mostra o estado final.
*/

const SCREEN = "relative rounded-t-[24px] border border-b-0 border-black/5 bg-white p-6 text-[#0a120f] shadow-[0_-8px_40px_rgba(0,40,32,0.08)]";
const ROTULO = "font-mono text-[11px] uppercase tracking-[0.05em] text-[#59645f]";
const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

function Assinatura({ atraso, className = "" }: { atraso: number; className?: string }) {
  return (
    <svg viewBox="0 0 120 30" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path
        pathLength={1}
        className="an-traco"
        style={d(atraso)}
        d="M3 21c7-12 12-16 14-11s-5 12-2 10 9-14 12-12-3 10 0 9 7-8 10-8 2 6 5 5 9-7 14-7 5 5 10 4 11-4 18-4"
      />
    </svg>
  );
}

export function RatVisual() {
  const rows = [
    ["Dado", "E-mail e telefone, hasheados"],
    ["Finalidade", "Otimizar e mensurar campanhas"],
    ["Base legal", "Legítimo interesse · art. 7º, IX"],
    ["Retenção", "Campanha ativa + 6 meses"],
  ];
  return (
    <Cena className="relative">
      <div aria-hidden="true" className={SCREEN}>
        <p className={ROTULO}>RAT · Loja Aurora</p>
        <p className="font-display mt-2 text-[20px] leading-tight">Envio de vendas e leads pro Meta</p>
        <dl className="mt-5 divide-y divide-[#e3e3e1] text-[13px]">
          {rows.map(([k, v], i) => (
            <div key={k} className="an-sobe grid grid-cols-[110px_1fr] gap-3 py-2.5" style={d(250 + i * 180)}>
              <dt className="text-[#59645f]">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div aria-hidden="true" className="an-pop absolute -top-5 right-4" style={d(1100)}>
        <MetaChips items={[{ icon: Sparkles, label: "Gerado ao ativar a conta", status: "sim" }]} />
      </div>
    </Cena>
  );
}

export function DpaVisual() {
  return (
    <Cena className="relative">
      <div aria-hidden="true" className={SCREEN}>
        <p className={ROTULO}>Contrato de operação de dados</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
          {[
            ["Operadora", "Sua agência"],
            ["Controladora", "Loja Aurora"],
          ].map(([k, v], i) => (
            <div key={k} className="an-sobe rounded-2xl bg-[#f4f4f2] p-3" style={d(150 + i * 150)}>
              <p className="text-[11px] text-[#59645f]">{k}</p>
              <p className="mt-0.5 font-medium">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {[100, 94, 88, 72].map((w, i) => (
            <span key={i} className="an-barra block h-[5px] rounded-full bg-[#e3e3e1]" style={{ width: `${w}%`, ...d(400 + i * 110) }} />
          ))}
        </div>
        <div className="mt-5 flex items-end justify-between gap-4 rounded-2xl border border-dashed border-[#d0d3cf] p-3 text-[12px]">
          <div>
            <p className="font-medium">Ana Souza · Sócia-diretora</p>
            <p className="text-[#59645f]">12/09/2026, 14:32 · IP registrado</p>
          </div>
          <Assinatura atraso={900} className="h-7 w-24 shrink-0 text-[#002820]" />
        </div>
      </div>
      <div aria-hidden="true" className="an-pop absolute -top-5 right-4" style={d(2100)}>
        <MetaChips items={[{ icon: PenLine, label: "Assinado pelas duas partes", status: "sim" }]} />
      </div>
    </Cena>
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
    <Cena className="relative">
      <div aria-hidden="true" className="rounded-[24px] border border-white/10 bg-white/[0.06] p-6 text-white backdrop-blur">
        <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-white/60">Registro de subprocessadores · 24 contas</p>
        <ul className="mt-5 space-y-3.5">
          {rows.map((r, i) => (
            <li key={r.t}>
              <div className="mb-1.5 flex justify-between text-[13px]">
                <span>{r.t}</span>
                <span className="text-white/60">{r.n} contas</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div
                  className={"an-barra h-full rounded-full " + (r.ok ? "bg-[#6ceead]" : "bg-[#f38536]")}
                  style={{ width: `${(r.n / 24) * 100}%`, ...d(200 + i * 160) }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div aria-hidden="true" className="absolute -bottom-6 left-4">
        <div className="an-pop" style={d(1300)}>
          <div className="an-tremor" style={d(1800)}>
            <MetaChips items={[{ icon: AlertTriangle, label: "Zapier entrou sem contrato", status: "nao" }]} />
          </div>
        </div>
      </div>
    </Cena>
  );
}

export function AuditVisual() {
  const findings = [
    { t: "Pixel da Meta carrega antes do aviso de cookies", ok: false },
    { t: "Política de privacidade publicada", ok: true },
    { t: "Formulário sem registro de consentimento", ok: false },
  ];
  return (
    <Cena>
      <div aria-hidden="true" className={SCREEN + " overflow-hidden"}>
        <span className="an-varre pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-transparent via-[#6ceead]/25 to-transparent" />
        <div className="relative flex items-center gap-4">
          <div className="an-anel grid h-16 w-16 shrink-0 place-items-center rounded-full" style={{ "--alvo": 62, ...d(200) } as React.CSSProperties}>
            <div className="grid h-12 w-12 place-items-center rounded-full bg-white">
              <span className="an-num font-display text-[17px]" style={{ "--alvo": 62, ...d(200) } as React.CSSProperties} />
            </div>
          </div>
          <div>
            <p className={ROTULO}>Risco · lojaaurora.com.br</p>
            <p className="font-display text-[18px] leading-tight">3 pontos de atenção</p>
          </div>
        </div>
        <ul className="relative mt-5 space-y-2.5 text-[13px]">
          {findings.map((f, i) => (
            <li key={f.t} className="an-sobe flex items-start gap-2.5" style={d(700 + i * 220)}>
              <span className={"mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full " + (f.ok ? "bg-[#cff5e1] text-[#05563a]" : "bg-[#fdebdc] text-[#c8641b]")}>
                {f.ok ? <Check size={12} strokeWidth={2.5} /> : <X size={12} strokeWidth={2.5} />}
              </span>
              {f.t}
            </li>
          ))}
        </ul>
      </div>
    </Cena>
  );
}

function ItemChecado({ texto, extra, i, base }: { texto: string; extra?: string; i: number; base: number }) {
  return (
    <li className="an-sobe flex items-center gap-3 rounded-2xl bg-[#f4f4f2] px-3 py-2.5" style={d(base + i * 200)}>
      <span className="an-pop grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#45d190] text-[#002820]" style={d(base + 150 + i * 200)}>
        <Check size={12} strokeWidth={2.5} />
      </span>
      <span className="font-medium">{texto}</span>
      {extra && <span className="ml-auto text-right text-[#59645f]">{extra}</span>}
    </li>
  );
}

export function DatVisual() {
  const rows = [
    { t: "RAT", v: "4 atividades" },
    { t: "Contrato", v: "Assinado em 12/09" },
    { t: "Ferramentas", v: "4, todas com contrato" },
  ];
  return (
    <Cena>
      <div aria-hidden="true" className={SCREEN}>
        <p className={ROTULO}>DAT · resumo de conformidade</p>
        <p className="font-display mt-2 text-[20px] leading-tight">Loja Aurora está em dia</p>
        <ul className="mt-4 space-y-2 text-[13px]">
          {rows.map((r, i) => (
            <ItemChecado key={r.t} texto={r.t} extra={r.v} i={i} base={250} />
          ))}
        </ul>
        <div className="an-pop mt-4 inline-flex" style={d(1100)}>
          <span className="an-pulso inline-flex items-center gap-2 rounded-full bg-[#002820] px-4 py-2 font-mono text-[11px] uppercase text-white">
            <Send size={12} /> Enviar pro cliente
          </span>
        </div>
      </div>
    </Cena>
  );
}

/* QR decorativo (não aponta pra lugar nenhum) — só ilustra o certificado. */
function QrDecor({ size = 104 }: { size?: number }) {
  const n = 21;
  const on = (x: number, y: number) => {
    const finder = (fx: number, fy: number) =>
      x >= fx && x < fx + 7 && y >= fy && y < fy + 7 && (x === fx || x === fx + 6 || y === fy || y === fy + 6 || (x >= fx + 2 && x <= fx + 4 && y >= fy + 2 && y <= fy + 4));
    if (finder(0, 0) || finder(n - 7, 0) || finder(0, n - 7)) return true;
    if ((x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9)) return false;
    return (x * 7 + y * 13 + x * y) % 5 < 2;
  };
  const cells = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (on(x, y)) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} width={size} height={size} shapeRendering="crispEdges" className="an-revela rounded-lg bg-white" style={d(200)} fill="#002820">
      {cells}
    </svg>
  );
}

export function CertVisual() {
  return (
    <Cena className="relative">
      <div aria-hidden="true" className={SCREEN}>
        <p className={ROTULO}>Certificado de privacidade</p>
        <div className="mt-4 flex items-center gap-5">
          <QrDecor />
          <div className="an-sobe min-w-0" style={d(500)}>
            <p className="font-display text-[20px] leading-tight">Loja Aurora</p>
            <p className="mt-1 font-mono text-[11px] text-[#59645f]">DTS-7K3F-9QPA</p>
            <p className="mt-2 text-[12px] text-[#59645f]">Válido até 30/09/2027</p>
          </div>
        </div>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.05em] text-[#59645f]">Selo no rodapé do site</p>
        <div className="an-pop mt-2 inline-flex" style={d(1000)}>
          <span className="an-brilho inline-flex items-center gap-3 rounded-full bg-[#002820] py-2 pl-3 pr-5 text-white">
            <Image src={marca} alt="" className="h-7 w-auto" />
            <span>
              <span className="block font-mono text-[8px] tracking-[0.1em] text-[#6ceead]">DATTIS · LGPD</span>
              <span className="block font-display text-[14px] leading-tight">Privacidade verificada</span>
            </span>
          </span>
        </div>
      </div>
      <div aria-hidden="true" className="an-pop absolute -top-5 right-4" style={d(1400)}>
        <MetaChips items={[{ icon: Sparkles, label: "Verificável por QR Code", status: "sim" }]} />
      </div>
    </Cena>
  );
}

export function DossieVisual() {
  const itens = ["Dados da empresa", "Contrato de operação assinado", "Registro de atividades (RAT)", "Ferramentas e certificado", "Texto-base da contestação"];
  return (
    <Cena className="relative">
      <div aria-hidden="true" className={SCREEN}>
        <p className={ROTULO}>Dossiê para BM · Loja Aurora</p>
        <ul className="mt-4 space-y-2 text-[13px]">
          {itens.map((t, i) => (
            <ItemChecado key={t} texto={t} i={i} base={200} />
          ))}
        </ul>
      </div>
      <div aria-hidden="true" className="an-pop absolute -top-5 right-4" style={d(1400)}>
        <MetaChips items={[{ icon: Send, label: "Pronto pra contestação", status: "sim" }]} />
      </div>
    </Cena>
  );
}

export function BmAlertVisual() {
  return (
    <Cena className="relative">
      <div aria-hidden="true" className="an-tremor rounded-[24px] bg-white p-6 text-[#0a120f] shadow-[0_20px_60px_rgba(0,0,0,0.35)]" style={d(300)}>
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fdebdc] text-[#c8641b]">
            <AlertTriangle size={18} />
          </span>
          <div>
            <p className="font-display text-[19px] leading-tight">Conta de anúncios restrita</p>
            <p className="mt-1 text-[13px] text-[#59645f]">Os anúncios desta conta foram pausados. Você pode solicitar uma análise.</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          {[
            ["12", "campanhas paradas"],
            ["4", "clientes afetados"],
            ["0", "leads hoje"],
          ].map(([v, l], i) => (
            <div key={l} className="an-sobe rounded-2xl bg-[#f4f4f2] px-2 py-3" style={d(700 + i * 150)}>
              <p className="font-display text-[24px] leading-none">{v}</p>
              <p className="mt-1 text-[11px] text-[#59645f]">{l}</p>
            </div>
          ))}
        </div>
      </div>
      <div aria-hidden="true" className="relative ml-6 mt-3 flex flex-col items-start gap-2.5 border-l border-dashed border-white/25 pl-5 pt-3">
        <div className="an-pop" style={d(1500)}>
          <MetaChips items={[{ icon: FileSignature, label: "Contrato de operação anexado", status: "sim" }]} />
        </div>
        <div className="an-pop" style={d(1900)}>
          <MetaChips items={[{ icon: Sparkles, label: "Dossiê Dattis enviado", status: "sim" }]} />
        </div>
      </div>
    </Cena>
  );
}
