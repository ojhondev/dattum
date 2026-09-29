"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocalStorageBoolean } from "@/lib/use-local-storage";
import {
  LayoutDashboard,
  Users,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import markDark from "../../public/brand/icone-fundo-dark.png";
import logoDark from "../../public/brand/logo-fundo-dark.png";

type Item = { href: string; label: string; icon: LucideIcon; exact?: boolean };

const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: "Visão geral",
    items: [{ href: "/painel", label: "Painel", icon: LayoutDashboard, exact: true }],
  },
  {
    title: "Operação",
    items: [
      { href: "/painel/contas", label: "Contas de cliente", icon: Users },
      { href: "/painel/subprocessadores", label: "Subprocessadores", icon: Network },
    ],
  },
];

function RailMark({ withWordmark = false }: { withWordmark?: boolean }) {
  if (withWordmark) {
    return <Image src={logoDark} alt="Dattis" height={20} width={Math.round((logoDark.width / logoDark.height) * 20)} priority />;
  }
  return <Image src={markDark} alt="Dattis" height={22} width={Math.round((markDark.width / markDark.height) * 22)} priority />;
}

function NavItems({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string, exact = false) => (exact ? pathname === href : pathname === href || pathname.startsWith(href + "/"));

  return (
    <nav className="font-ui flex flex-1 flex-col gap-1 px-2 text-body-sm">
      {GROUPS.map((g, gi) => (
        <div key={g.title} className={gi > 0 ? "mt-4" : ""}>
          {collapsed ? (
            gi > 0 && <div className="mx-2 my-2 h-px bg-white/10" />
          ) : (
            <p className="mb-1 px-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">{g.title}</p>
          )}
          {g.items.map((it) => {
            const Icon = it.icon;
            const active = isActive(it.href, it.exact);
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={onNavigate}
                title={it.label}
                className={
                  "group relative flex items-center gap-2.5 rounded-none px-2.5 py-2 transition-colors " +
                  (active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/[0.06] hover:text-white") +
                  (collapsed ? " justify-center px-0" : "")
                }
              >
                {active && <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r bg-brand" />}
                <Icon size={16} strokeWidth={1.9} className={"shrink-0 " + (active ? "text-brand" : "")} />
                {!collapsed && <span className="flex-1 truncate">{it.label}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function Sidebar({ agenciaNome, sairSlot }: { agenciaNome: string; sairSlot: React.ReactNode }) {
  const [collapsed, setCollapsed] = useLocalStorageBoolean("dattis:sidebar", false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Menu"
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-30 rounded-none border border-line bg-surface p-2 text-ink shadow-[var(--shadow-card)] lg:hidden"
      >
        <Menu size={18} />
      </button>

      <aside
        className={
          "thin-scroll sticky top-0 hidden h-svh shrink-0 flex-col bg-rail py-4 transition-[width] duration-200 lg:flex " +
          (collapsed ? "w-[64px]" : "w-[236px]")
        }
      >
        <div className={"flex items-center px-4 pb-5 pt-1 " + (collapsed ? "justify-center px-0" : "")}>
          <RailMark withWordmark={!collapsed} />
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <NavItems collapsed={collapsed} />
        </div>
        <div className={"mx-2 mt-2 border-t border-white/10 pt-2 " + (collapsed ? "text-center" : "")}>
          {!collapsed && <p className="truncate px-2.5 pb-1 font-ui text-caption text-white/45">{agenciaNome}</p>}
          <div className={collapsed ? "flex justify-center" : "px-1"}>{sairSlot}</div>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          title="Recolher"
          className={"font-ui mx-2 mt-2 flex items-center gap-2 rounded-none px-2.5 py-2 text-caption text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white/80 " + (collapsed ? "justify-center" : "")}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          {!collapsed && "Recolher"}
        </button>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/45" onClick={() => setMobileOpen(false)} />
          <div className="thin-scroll absolute inset-y-0 left-0 flex w-[264px] flex-col overflow-y-auto bg-rail py-4">
            <div className="flex items-center justify-between px-4 pb-4 pt-1">
              <RailMark withWordmark />
              <button type="button" aria-label="Fechar" onClick={() => setMobileOpen(false)} className="p-1.5 text-white/70">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-1 flex-col">
              <NavItems collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="mx-2 mt-2 border-t border-white/10 px-1 pt-2">{sairSlot}</div>
          </div>
        </div>
      )}
    </>
  );
}
