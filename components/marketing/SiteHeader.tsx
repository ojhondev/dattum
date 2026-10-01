import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/nav/ThemeToggle";
import { MobileNav } from "@/components/nav/MobileNav";
import { DesktopNav } from "@/components/nav/DesktopNav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-canvas/90 backdrop-blur">
      <div className="grid h-[76px] w-full grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-10 xl:grid-cols-[1fr_auto_1fr]">
        <Logo height={34} />
        <DesktopNav />
        <div className="flex shrink-0 items-center justify-end gap-2.5">
          <ThemeToggle />
          <Link href="/diagnostico" className="btn btn-dark hidden sm:inline-flex">
            <span className="xl:hidden min-[1440px]:!inline">Auditoria da sua agência</span>
            <span className="hidden xl:inline min-[1440px]:!hidden">Auditoria</span>
          </Link>
          <Link href="/entrar" className="btn btn-primary hidden sm:inline-flex">
            Entrar
          </Link>
          <MobileNav ctaLabel="Auditoria da sua agência" ctaHref="/diagnostico" enterLabel="Entrar" />
        </div>
      </div>
    </header>
  );
}
