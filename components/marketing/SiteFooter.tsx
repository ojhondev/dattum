import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export function SiteFooter({ fluid = "w-full px-5 sm:px-10 lg:px-20" }: { fluid?: string }) {
  const year = new Date().getFullYear();

  const columns: { title: string; links: { label: string; href: string }[] }[] = [
    {
      title: "Plataforma",
      links: [
        { label: "Módulos", href: "/#ferramentas" },
        { label: "Planos", href: "/planos" },
        { label: "FAQ", href: "/#faq" },
        { label: "Diagnóstico Expresso", href: "/diagnostico" },
      ],
    },
    {
      title: "Recursos",
      links: [
        { label: "Auditoria pública", href: "/auditoria" },
        { label: "Metodologia", href: "/#por-que-agora" },
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

  return (
    <footer className="bg-rail text-white">
      <div className={`${fluid} py-16`}>
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div className="max-w-sm">
            <Logo height={24} />
            <p className="mt-5 text-body-sm leading-relaxed text-white/55">
              Compliance LGPD para agências de tráfego pago e lançamento. RAT, DPA e registro de subprocessadores
              gerados automaticamente por conta de cliente.
            </p>
            <Link
              href="/cadastro"
              className="mt-6 inline-flex items-center gap-2 border-b border-white/30 pb-1 text-body-sm font-medium text-white transition-colors hover:border-brand hover:text-brand"
            >
              Começar grátis <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/40">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label + l.href}>
                      <Link href={l.href} className="text-body-sm text-white/65 transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/12 pt-6 text-caption text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Dattis. Todos os direitos reservados.</p>
          <p className="max-w-lg sm:text-right">Baseado na Lei nº 13.709/2018 (LGPD).</p>
        </div>
      </div>
    </footer>
  );
}
