import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/nav/ThemeToggle";
import { MobileNav, type NavGroup } from "@/components/nav/MobileNav";
import { EMAIL_CONTATO } from "@/lib/contato";

const ITEMS = [
  { href: "/#modulos", label: "Módulos" },
  { href: "/#bm-suspensa", label: "BM suspensa" },
  { href: "/diagnostico", label: "Diagnóstico" },
  { href: "/planos", label: "Planos" },
  { href: "/#faq", label: "FAQ" },
];

const GROUPS: NavGroup[] = [
  {
    label: "Plataforma",
    items: [
      { href: "/#modulos", label: "Módulos", desc: "RAT, contrato, subprocessadores, auditoria e DAT." },
      { href: "/#modulos", label: "Certificado e selo", desc: "Prova verificável por QR Code no rodapé do site." },
      { href: "/#bm-suspensa", label: "Dossiê para BM", desc: "Contestação organizada quando a BM é suspensa." },
      { href: "/#dpo", label: "DPO", desc: "A Dattis como encarregado de dados da agência." },
    ],
  },
  {
    label: "Ferramentas",
    items: [
      { href: "/diagnostico", label: "Diagnóstico Expresso", desc: "Descubra quanto sua agência está exposta." },
      { href: "/auditoria", label: "Auditoria de site", desc: "Pixel, formulário e política de privacidade." },
    ],
  },
  {
    label: "Planos",
    items: [
      { href: "/planos", label: "Planos e preços", desc: "De R$ 47 a R$ 297 por usuário/mês." },
      { href: "/#multa", label: "Multa x assinatura", desc: "Quanto custa estar sem prova quando a fiscalização chega." },
    ],
  },
  {
    label: "Sobre",
    items: [
      { href: "/#diferencial", label: "Diferencial competitivo", desc: "Privacidade como argumento de venda da agência." },
      { href: "/#faq", label: "Perguntas frequentes", desc: "RAT, DPA, selo, BM suspensa e preços." },
      { href: `mailto:${EMAIL_CONTATO}`, label: "Contato", desc: EMAIL_CONTATO },
    ],
  },
];

export function SiteHeader() {
  return (
    <>
      <header className="sticky top-0 z-40 bg-canvas/90 backdrop-blur">
        <div className="flex h-[76px] w-full items-center justify-between gap-4 px-4 sm:px-10">
          <div className="flex items-center gap-12">
            <Logo height={26} />
            <nav className="hidden items-center gap-8 lg:flex">
              {ITEMS.map((it) => (
                <Link key={it.href} href={it.href} className="nav-link">
                  {it.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <ThemeToggle />
            <Link href="/planos" className="btn btn-dark hidden sm:inline-flex">
              Ver planos
            </Link>
            <Link href="/entrar" className="btn btn-primary hidden sm:inline-flex">
              Entrar
            </Link>
            <MobileNav groups={GROUPS} ctaLabel="Ver planos" ctaHref="/planos" enterLabel="Entrar" />
          </div>
        </div>
      </header>
      <div className="flex justify-center gap-4 px-4 pb-2 pt-1 sm:hidden">
        <Link href="/planos" className="btn btn-dark">
          Ver planos
        </Link>
        <Link href="/entrar" className="btn btn-primary">
          Entrar
        </Link>
      </div>
    </>
  );
}
