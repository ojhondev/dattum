import Link from "next/link";
import Image from "next/image";
import appIcon from "../../public/brand/app-icon.png";
import marca from "../../public/brand/icone-sidebar-menta.png";
import iso27001 from "../../public/selos/iso-27001.webp";
import iso27701 from "../../public/selos/iso-27701.webp";
import { EMAIL_CONTATO, WHATSAPP_EXIBICAO, linkContato } from "@/lib/contato";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Módulos",
    links: [
      { label: "RAT", href: "/#modulos" },
      { label: "DPA", href: "/#modulos" },
      { label: "Subprocessadores", href: "/#modulos" },
      { label: "Auditoria", href: "/#modulos" },
      { label: "Certificado e selo", href: "/#modulos" },
      { label: "Dossiê para BM", href: "/#bm-suspensa" },
      { label: "Relatório para o cliente", href: "/#modulos" },
    ],
  },
  {
    title: "Ferramentas",
    links: [
      { label: "Auditoria da sua agência", href: "/diagnostico" },
      { label: "Auditoria de site", href: "/auditoria" },
      { label: "Consultar agência por CNPJ", href: "/consulta" },
    ],
  },
  {
    title: "Sobre",
    links: [
      { label: "O que é a Dattis", href: "/o-que-e-a-dattis" },
      { label: "Planos", href: "/planos" },
      { label: "Blog", href: "/blog" },
      { label: "Diferencial competitivo", href: "/#diferencial" },
      { label: "O papel do DPO", href: "/#dpo" },
      { label: "Perguntas frequentes", href: "/#faq" },
      { label: `WhatsApp ${WHATSAPP_EXIBICAO}`, href: linkContato("Olá! Vim pelo site da Dattis e quero falar com a equipe.") },
      { label: EMAIL_CONTATO, href: `mailto:${EMAIL_CONTATO}` },
    ],
  },
  {
    title: "Conta",
    links: [
      { label: "Entrar", href: "/entrar" },
      { label: "Criar conta", href: "/cadastro" },
      { label: "Painel", href: "/painel" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termos de uso", href: "/termos" },
      { label: "Política de privacidade", href: "/privacidade" },
      { label: "Contrato de dados (DPA)", href: "/contrato-de-dados" },
      { label: "Preferências de cookies", href: "#cookies" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-rail text-white">
      <div className="w-full px-5 pb-28 pt-16 sm:px-10 lg:px-14 lg:pb-32 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-[120px_1fr]">
          <Image
            src={appIcon}
            alt="Dattis"
            height={64}
            width={64}
          />

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="font-mono text-[15px] uppercase tracking-[0.03em]">{col.title}</p>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.href === "#cookies" ? (
                        <a href="#cookies" data-dattis-cookies="" className="text-[15px] text-white/80 transition-colors hover:text-brand">
                          {l.label}
                        </a>
                      ) : (
                        <Link href={l.href} className="text-[15px] text-white/80 transition-colors hover:text-brand">
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Selos: o da própria Dattis (leva à consulta pública por CNPJ) e as certificações ISO. */}
        <div className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-6">
          <Link
            href="/consulta"
            className="group flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 transition-colors hover:border-brand"
          >
            <Image src={marca} alt="" className="h-9 w-auto shrink-0" />
            <span className="leading-tight">
              <span className="block font-mono text-[10px] tracking-[0.1em] text-brand">DATTIS · LGPD</span>
              <span className="block font-display text-[17px] text-white">Privacidade verificada</span>
              <span className="mt-0.5 block text-[12px] text-white/60 transition-colors group-hover:text-brand">Consulte uma agência pelo CNPJ →</span>
            </span>
          </Link>
          <Image src={iso27001} alt="Certificação ISO/IEC 27001" className="h-16 w-auto" />
          <Image src={iso27701} alt="Certificação ISO/IEC 27701" className="h-14 w-auto" />
        </div>

        <div className="mt-10 flex flex-col gap-8 border-t border-white/10 pt-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl space-y-2 text-[13px] text-white/55">
            <p>© {year} Dattis. Todos os direitos reservados.</p>
            <p>O DPO das agências de tráfego pago. Baseado na Lei nº 13.709/2018 (LGPD).</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/planos" className="btn btn-primary">
              Ver planos
            </Link>
            <Link href="/diagnostico" className="btn border-white/25 text-white hover:border-white/60">
              Auditar minha agência
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
