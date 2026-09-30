import Link from "next/link";
import Image from "next/image";
import appIcon from "../../public/brand/app-icon.png";

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
      { label: "DAT", href: "/#modulos" },
    ],
  },
  {
    title: "Ferramentas",
    links: [
      { label: "Diagnóstico Expresso", href: "/diagnostico" },
      { label: "Auditoria de site", href: "/auditoria" },
    ],
  },
  {
    title: "Sobre",
    links: [
      { label: "Planos", href: "/planos" },
      { label: "Diferencial competitivo", href: "/#diferencial" },
      { label: "O papel do DPO", href: "/#dpo" },
      { label: "Perguntas frequentes", href: "/#faq" },
      { label: "Contato", href: "mailto:contato@dattis.com" },
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

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="font-mono text-[15px] uppercase tracking-[0.03em]">{col.title}</p>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-[15px] text-white/80 transition-colors hover:text-brand">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-8 border-t border-white/10 pt-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl space-y-2 text-[13px] text-white/55">
            <p>© {year} Dattis. Todos os direitos reservados.</p>
            <p>Compliance LGPD para agências de tráfego pago. Baseado na Lei nº 13.709/2018 (LGPD).</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/planos" className="btn btn-primary">
              Ver planos
            </Link>
            <Link href="/diagnostico" className="btn border-white/25 text-white hover:border-white/60">
              Fazer diagnóstico
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
