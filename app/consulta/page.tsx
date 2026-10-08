import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, X, ShieldCheck, ShieldAlert, SearchX, FileText, FileSignature, Network, Radar, Users, Globe } from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { MetaChips } from "@/components/marketing/MetaChips";
import { consultarAgencia, type ResultadoConsulta } from "@/lib/consulta";
import { FormConsulta } from "./FormConsulta";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Consulta de agências em conformidade com a LGPD",
  description:
    "Consulte pelo CNPJ se uma agência de marketing e tráfego pago está em conformidade com a LGPD e é acompanhada pela Dattis.",
};

const fmt = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });
const mesAno = (d: Date) => d.toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });

const COMO = [
  { t: "A agência documenta", d: "Registro do uso de dados de cada cliente, contratos de dados assinados e a lista das ferramentas que recebem os dados." },
  { t: "A Dattis confere", d: "Os documentos são conferidos e os sites passam por verificação diária de privacidade e segurança." },
  { t: "Você consulta", d: "Qualquer pessoa confere aqui, pelo CNPJ, se a agência mantém tudo em dia. A resposta é calculada na hora." },
];

export default async function ConsultaPage({ searchParams }: { searchParams: Promise<{ cnpj?: string }> }) {
  const { cnpj } = await searchParams;
  const resultado = cnpj ? await consultarAgencia(cnpj) : null;

  return (
    <>
      <SiteHeader />
      <main>
        <section className="px-5 pb-16 pt-14 text-center sm:pt-20">
          <p className="t-eyebrow">Consulta pública · LGPD</p>
          <h1 className="t-display mx-auto mt-5 max-w-[20ch]">Essa agência leva os seus dados a sério?</h1>
          <p className="mx-auto mt-5 max-w-2xl text-[18px] leading-relaxed text-body">
            Digite o CNPJ da agência de marketing ou tráfego pago e veja se ela está em conformidade com a Lei Geral de Proteção de
            Dados, com a documentação conferida pela Dattis.
          </p>
          <FormConsulta inicial={cnpj ?? ""} />
        </section>

        {resultado && (
          <section id="resultado" className="mx-auto max-w-5xl scroll-mt-24 px-4 pb-20 sm:px-6">
            <Resultado r={resultado} />
          </section>
        )}

        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <p className="text-center font-mono text-[13px] uppercase tracking-[0.05em] text-muted">Como funciona</p>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {COMO.map((c, i) => (
              <li key={c.t} className="rounded-[28px] border border-line bg-surface p-6 sm:p-7">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-rail font-mono text-[15px] text-brand">{i + 1}</span>
                <p className="mt-5 font-display text-[22px] leading-tight text-ink">{c.t}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-body">{c.d}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Resultado({ r }: { r: ResultadoConsulta }) {
  if (r.tipo === "invalido") {
    return (
      <div className="rounded-[40px] bg-warn-tint px-7 py-12 text-center sm:px-14">
        <ShieldAlert size={28} className="mx-auto text-warn" />
        <h2 className="t-display mt-4 text-[clamp(1.6rem,3vw,2.2rem)]">CNPJ inválido</h2>
        <p className="mx-auto mt-3 max-w-xl text-[16px] leading-relaxed text-body">
          O número <span className="font-mono">{r.cnpj}</span> não passa na conferência dos dígitos. Confira e consulte de novo.
        </p>
      </div>
    );
  }

  if (r.tipo === "nao_encontrado") {
    return (
      <div className="rounded-[40px] border border-line bg-surface px-7 py-12 sm:px-14 sm:py-14">
        <span className="tag tag-white border border-line">
          <SearchX size={16} className="mr-2" /> Sem certificado ativo
        </span>
        <h2 className="t-display mt-6 max-w-3xl text-[clamp(1.7rem,3.4vw,2.6rem)]">
          Não há certificado Dattis ativo para o CNPJ <span className="whitespace-nowrap font-mono text-[0.8em]">{r.cnpj}</span>.
        </h2>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-body">
          Isso não quer dizer que a agência descumpra a LGPD: ela pode cuidar da privacidade de outra forma. Quer dizer só que não há uma
          comprovação pública e conferida pela Dattis. Se você é cliente dela, vale pedir a documentação: registro do uso de dados,
          contrato de dados e política de privacidade.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[20px] bg-canvas p-5">
            <p className="font-medium text-ink">É dono dessa agência?</p>
            <p className="mt-1 text-[14px] text-muted">Organize a LGPD da agência e dos clientes e ganhe o certificado público.</p>
            <Link href="/cadastro" className="btn btn-primary mt-4">
              Criar conta <ArrowRight size={15} />
            </Link>
          </div>
          <div className="rounded-[20px] bg-canvas p-5">
            <p className="font-medium text-ink">Quer saber como sua agência está?</p>
            <p className="mt-1 text-[14px] text-muted">Faça a auditoria gratuita e veja o que expõe a agência hoje.</p>
            <Link href="/diagnostico" className="btn btn-ghost mt-4">
              Auditoria da sua agência
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const agora = new Date().toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short", timeZone: "America/Sao_Paulo" });
  const indicadores = [
    { icon: Users, rotulo: "Clientes acompanhados", valor: String(r.clientesAcompanhados) },
    { icon: Radar, rotulo: r.ultimaVarredura ? "Última verificação dos sites" : "Verificação dos sites", valor: r.ultimaVarredura ? fmt(r.ultimaVarredura) : "Diária" },
    { icon: ShieldCheck, rotulo: "Acompanhada pela Dattis desde", valor: mesAno(r.desde) },
  ];

  return (
    <>
      <div className={"on-light rounded-[40px] px-7 py-12 sm:px-14 sm:py-16 " + (r.emDia ? "bg-gradient-to-br from-brand to-brand-tint-2" : "bg-warn-tint")}>
        <div className="flex flex-wrap items-center gap-1">
          <span className={"tag " + (r.emDia ? "" : "!bg-orange")}>
            {r.emDia ? <ShieldCheck size={16} className="mr-2" /> : <ShieldAlert size={16} className="mr-2" />}
            {r.emDia ? "Em conformidade com a LGPD" : "Documentação em atualização"}
          </span>
          <span className="tag tag-white">Consultado agora · {agora}</span>
        </div>
        <p className="mt-10 font-mono text-[15px] uppercase tracking-[0.04em] text-rail/80">Agência verificada · CNPJ {r.cnpj}</p>
        <h2 className="t-hero mt-3 max-w-[18ch] text-rail">{r.nome}</h2>
        <p className="mt-6 max-w-3xl font-display text-[clamp(1.4rem,2.6vw,2rem)] leading-snug text-rail">
          {r.emDia
            ? "mantém a documentação de privacidade em dia e leva a sério os dados dos clientes e de quem fala com eles."
            : "tem certificado válido, mas parte da documentação está sendo atualizada neste momento. Confira abaixo o que já está em dia."}
        </p>
        <div className="mt-10 flex flex-wrap gap-1">
          {r.certificado.dominio && <span className="tag tag-white font-mono">{r.certificado.dominio}</span>}
          <span className="tag tag-white font-mono">{r.certificado.codigo}</span>
          <span className="tag tag-white">Válido até {fmt(r.certificado.validoAte)}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {indicadores.map(({ icon: Icon, rotulo, valor }) => (
          <div key={rotulo} className="rounded-[24px] border border-line bg-surface p-6">
            <Icon size={20} className="text-brand-ink" />
            <p className="mt-4 font-display text-[28px] leading-none text-ink first-letter:uppercase">{valor}</p>
            <p className="mt-2 text-[14px] text-muted">{rotulo}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_300px]">
        <div className="block-card px-7 py-10 sm:px-10">
          <p className="t-label">Documentação conferida</p>
          <ul className="mt-6 flex flex-col gap-3">
            {r.requisitos.map((q) => (
              <li key={q.label} className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3.5">
                <span className={"mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full " + (q.ok ? "bg-brand-strong text-on-brand" : "bg-orange text-ink")}>
                  {q.ok ? <Check size={14} strokeWidth={2.5} /> : <X size={14} strokeWidth={2.5} />}
                </span>
                <span>
                  <span className="block text-[15px] font-medium text-ink">{q.label}</span>
                  <span className="block text-[14px] text-muted">{q.detalhe}</span>
                </span>
              </li>
            ))}
          </ul>
          {r.emDia && (
            <MetaChips
              wrap
              className="mt-8"
              items={[
                { icon: FileText, label: "Atividades registradas", status: "sim" },
                { icon: FileSignature, label: "Contratos de dados", status: "sim" },
                { icon: Network, label: "Ferramentas mapeadas", status: "sim" },
              ]}
            />
          )}
        </div>
        <div className="flex flex-col gap-4">
          <Link href={`/verificar/${r.certificado.codigo}`} className="group card flex flex-1 flex-col justify-between gap-6 transition-colors hover:border-brand-strong">
            <span>
              <ShieldCheck size={22} className="text-brand-ink" />
              <span className="mt-4 block font-display text-[21px] leading-tight text-ink">Ver o certificado completo</span>
              <span className="mt-2 block text-[14px] text-muted">Com QR Code e o que cada item significa para os seus dados.</span>
            </span>
            <span className="inline-flex items-center gap-2 font-mono text-[13px] uppercase tracking-[0.04em] text-brand-ink">
              Abrir <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
          {r.politicaUrl && (
            <a href={r.politicaUrl} target="_blank" rel="noopener" className="card flex items-center gap-3 transition-colors hover:border-brand-strong">
              <Globe size={20} className="shrink-0 text-brand-ink" />
              <span className="text-[15px] text-ink">Política de privacidade publicada</span>
            </a>
          )}
        </div>
      </div>
    </>
  );
}
