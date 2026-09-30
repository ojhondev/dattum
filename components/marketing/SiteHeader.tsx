import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/nav/ThemeToggle";
import { MobileNav } from "@/components/nav/MobileNav";

const ITEMS = [
  { href: "/#modulos", label: "Módulos" },
  { href: "/#por-que-agora", label: "Por que agora" },
  { href: "/diagnostico", label: "Diagnóstico" },
  { href: "/planos", label: "Planos" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-canvas/90 backdrop-blur">
      <div className="flex h-[76px] w-full items-center justify-between gap-4 px-5 sm:px-10">
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
          <Link href="/cadastro" className="btn btn-dark hidden sm:inline-flex">
            Começar grátis
          </Link>
          <Link href="/entrar" className="btn btn-primary hidden sm:inline-flex">
            Entrar
          </Link>
          <MobileNav items={ITEMS} ctaLabel="Começar grátis" ctaHref="/cadastro" enterLabel="Entrar" />
        </div>
      </div>
    </header>
  );
}
