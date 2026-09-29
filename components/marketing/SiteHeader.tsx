import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/nav/ThemeToggle";
import { MobileNav } from "@/components/nav/MobileNav";

const ITEMS = [
  { href: "/#problema", label: "O problema" },
  { href: "/#ferramentas", label: "Módulos" },
  { href: "/planos", label: "Planos" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur">
      <div className="flex h-16 w-full items-center justify-between gap-4 px-5 sm:px-10 lg:px-20">
        <div className="flex items-center gap-10">
          <Logo height={22} />
          <nav className="hidden items-center gap-7 lg:flex">
            {ITEMS.map((it) => (
              <Link key={it.href} href={it.href} className="nav-link">
                {it.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <ThemeToggle />
          <Link href="/entrar" className="nav-link ml-1 hidden sm:inline">
            Entrar
          </Link>
          <div className="hidden sm:block">
            <Link href="/cadastro" className="btn btn-dark whitespace-nowrap">
              Começar grátis
            </Link>
          </div>
          <MobileNav items={ITEMS} ctaLabel="Começar grátis" ctaHref="/cadastro" enterLabel="Entrar" />
        </div>
      </div>
    </header>
  );
}
