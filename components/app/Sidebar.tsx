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
  BadgeCheck,
  FolderOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import iconeMenta from "../../public/brand/icone-sidebar-menta.png";
import iconeBranco from "../../public/brand/icone-sidebar-branco.png";
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
  {
    title: "Proteção",
    items: [
      { href: "/painel/certificados", label: "Certificados e selo", icon: BadgeCheck },
      { href: "/painel/dossie", label: "Dossiê para BM", icon: FolderOpen },
    ],
  },
];

function RailMark({ withWordmark = false }: { withWordmark?: boolean }) {
  if (withWordmark) {
    return <Image src={logoDark} alt="Dattis" height={20} width={Math.round((logoDark.width / logoDark.height) * 20)} priority />;
  }
  const w = Math.round((iconeMenta.width / iconeMenta.height) * 28);
  return (
    <>
      <Image src={iconeMenta} alt="Dattis" height={28} width={w} priority className="logo-light" />
      <Image src={iconeBranco} alt="Dattis" height={28} width={w} priority className="logo-dark" />
    </>
  );
}

function NavItems({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string, exact = false) => (exact ? pathname === href : pathname === href || pathname.startsWith(href + "/"));

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 text-[15px]">
      {GROUPS.map((g, gi) => (
        <div key={g.title} className={gi > 0 ? "mt-4" : ""}>
          {collapsed ? (
            gi > 0 && <div className="mx-2 my-2 h-px bg-white/10" />
          ) : (
            <p className="mb-2 px-3.5 font-mono text-[11px] uppercase tracking-[0.06em] text-white/40">{g.title}</p>
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
                  "group relative flex items-center gap-2.5 rounded-full px-3.5 py-2.5 transition-colors " +
                  (active ? "bg-brand text-on-brand" : "text-white/70 hover:bg-white/[0.08] hover:text-white") +
                  (collapsed ? " justify-center px-0" : "")
                }
              >
                <Icon size={17} strokeWidth={1.8} className="shrink-0" />
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
        className="fixed left-4 top-4 z-30 rounded-full border border-line bg-surface p-2.5 text-ink shadow-[var(--shadow-chip)] lg:hidden"
      >
        <Menu size={18} />
      </button>

      <aside
        className={
          "thin-scroll sticky top-3 m-3 mr-0 hidden h-[calc(100svh-24px)] shrink-0 flex-col rounded-[28px] bg-rail py-5 transition-[width] duration-200 lg:flex " +
          (collapsed ? "w-[76px]" : "w-[260px]")
        }
      >
        <div className={"flex items-center px-6 pb-8 pt-3 " + (collapsed ? "justify-center px-0" : "")}>
          <RailMark withWordmark={!collapsed} />
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <NavItems collapsed={collapsed} />
        </div>
        <div className={"mx-3 mt-2 border-t border-white/10 pt-3 " + (collapsed ? "text-center" : "")}>
          {!collapsed && <p className="font-display truncate px-3.5 pb-1 text-[16px] text-white/85">{agenciaNome}</p>}
          <div className={collapsed ? "flex justify-center" : ""}>{sairSlot}</div>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          title="Recolher"
          className={"mx-3 mt-2 flex items-center gap-2 rounded-full px-3.5 py-2.5 font-mono text-[12px] uppercase tracking-[0.04em] text-white/45 transition-colors hover:bg-white/[0.08] hover:text-white/80 " + (collapsed ? "justify-center" : "")}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          {!collapsed && "Recolher"}
        </button>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/45" onClick={() => setMobileOpen(false)} />
          <div className="thin-scroll absolute inset-y-2 left-2 flex w-[280px] flex-col overflow-y-auto rounded-[28px] bg-rail py-5">
            <div className="flex items-center justify-between px-4 pb-4 pt-1">
              <RailMark withWordmark />
              <button type="button" aria-label="Fechar" onClick={() => setMobileOpen(false)} className="p-1.5 text-white/70">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-1 flex-col">
              <NavItems collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="mx-3 mt-2 border-t border-white/10 pt-3">{sairSlot}</div>
          </div>
        </div>
      )}
    </>
  );
}
