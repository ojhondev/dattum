"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocalStorageBoolean } from "@/lib/use-local-storage";
import { ThemeToggle } from "@/components/nav/ThemeToggle";
import { linkContato } from "@/lib/contato";
import {
  LayoutDashboard,
  Users,
  Network,
  BadgeCheck,
  FolderOpen,
  FileText,
  Radar,
  Building2,
  Inbox,
  KeyRound,
  Newspaper,
  SearchCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  ShieldCheck,
  type LucideIcon,
  Settings,
  Cookie,
  Wallet,
  Activity,
} from "lucide-react";
import iconeMenta from "../../public/brand/icone-sidebar-menta.png";
import iconeBranco from "../../public/brand/icone-sidebar-branco.png";
import logoClaro from "../../public/brand/logo-fundo-claro.png";
import logoEscuro from "../../public/brand/logo-fundo-dark.png";

type Item = { href: string; label: string; icon: LucideIcon; exact?: boolean };
type Grupo = { title: string; items: Item[] };

const GRUPOS_PAINEL: Grupo[] = [
  {
    title: "Menu principal",
    items: [
      { href: "/painel", label: "Painel", icon: LayoutDashboard, exact: true },
      { href: "/painel/contas", label: "Clientes", icon: Users },
      { href: "/painel/documentos", label: "Documentos", icon: FileText },
      { href: "/painel/subprocessadores", label: "Ferramentas", icon: Network },
    ],
  },
  {
    title: "Proteção",
    items: [
      { href: "/painel/vigilancia", label: "Vigilância", icon: Radar },
      { href: "/painel/cookies", label: "Cookies", icon: Cookie },
      { href: "/painel/titulares", label: "Pedidos de titulares", icon: Inbox },
      { href: "/painel/certificados", label: "Certificados e selo", icon: BadgeCheck },
      { href: "/painel/dossie", label: "Dossiê para BM", icon: FolderOpen },
    ],
  },
  {
    title: "Conta",
    items: [{ href: "/painel/configuracoes", label: "Configurações", icon: Settings }],
  },
];

const GRUPOS_ADMIN: Grupo[] = [
  {
    title: "WebMaster",
    items: [{ href: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true }],
  },
  {
    title: "Operação",
    items: [
      { href: "/admin/vigilancia", label: "Vigilância", icon: Radar },
      { href: "/admin/agencias", label: "Agências", icon: Building2 },
    ],
  },
  {
    title: "Conteúdo",
    items: [
      { href: "/admin/blog", label: "Blog", icon: Newspaper },
      { href: "/admin/seo", label: "SEO", icon: SearchCheck },
    ],
  },
  {
    title: "Comercial",
    items: [
      { href: "/admin/leads", label: "Leads da auditoria", icon: Inbox },
      { href: "/admin/titulares", label: "Pedidos de titulares", icon: ShieldCheck },
      { href: "/admin/codigos", label: "Códigos de ativação", icon: KeyRound },
      { href: "/admin/cobranca", label: "Cobrança", icon: Wallet },
      { href: "/admin/sistema", label: "Sistema", icon: Activity },
    ],
  },
];

const GRUPOS = { painel: GRUPOS_PAINEL, admin: GRUPOS_ADMIN };

export type PlanoSidebar = { nome: string; usados: number; limite: number | null };

function Marca({ compacta = false }: { compacta?: boolean }) {
  if (compacta) {
    const w = Math.round((iconeMenta.width / iconeMenta.height) * 28);
    return (
      <>
        <Image src={iconeMenta} alt="Dattis" height={28} width={w} priority className="logo-light" />
        <Image src={iconeBranco} alt="Dattis" height={28} width={w} priority className="logo-dark" />
      </>
    );
  }
  const w = (s: { width: number; height: number }) => Math.round((s.width / s.height) * 24);
  return (
    <>
      <Image src={logoClaro} alt="Dattis" height={24} width={w(logoClaro)} priority className="logo-light" />
      <Image src={logoEscuro} alt="Dattis" height={24} width={w(logoEscuro)} priority className="logo-dark" />
    </>
  );
}

const iniciais = (nome: string) =>
  nome
    .split(/\s+/)
    .filter((p) => p.length > 2 || /^[A-Z]/.test(p))
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "D";

function NavItems({ grupos, collapsed, onNavigate }: { grupos: Grupo[]; collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string, exact = false) => (exact ? pathname === href : pathname === href || pathname.startsWith(href + "/"));

  return (
    <nav className="flex flex-col gap-0.5 px-3 text-[15px]">
      {grupos.map((g, gi) => (
        <div key={g.title} className={gi > 0 ? "mt-5" : ""}>
          {collapsed ? (
            gi > 0 && <div className="mx-3 mb-3 h-px bg-line" />
          ) : (
            <p className="mb-2 px-3 font-mono text-[11px] uppercase tracking-[0.06em] text-faint">{g.title}</p>
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
                data-tour={`nav:${it.href}`}
                aria-current={active ? "page" : undefined}
                className={
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors " +
                  (active
                    ? "bg-canvas font-medium text-ink shadow-[inset_0_0_0_1px_var(--color-line)]"
                    : "text-muted hover:bg-canvas hover:text-ink") +
                  (collapsed ? " justify-center px-0" : "")
                }
              >
                <Icon size={18} strokeWidth={1.8} className={"shrink-0 " + (active ? "text-brand-ink" : "")} />
                {!collapsed && <span className="flex-1 truncate">{it.label}</span>}
                {active && !collapsed && <span className="pixel-corners pixel-corners-sm h-2 w-2 bg-brand-strong" />}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function CartaoPlano({ plano }: { plano: PlanoSidebar }) {
  const pct = plano.limite ? Math.min(100, (plano.usados / plano.limite) * 100) : 100;
  return (
    <div className="pixel-corners mx-3 bg-rail p-4 text-white">
      <div className="flex items-center gap-2">
        <ShieldCheck size={16} className="text-brand" />
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-brand">Plano {plano.nome}</p>
      </div>
      <p className="mt-2 text-[13px] leading-snug text-white/75">
        {plano.limite ? `${plano.usados} de ${plano.limite} clientes protegidos` : `${plano.usados} clientes protegidos`}
      </p>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/15">
        <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
      </div>
      <a
        href={linkContato(`Olá! Quero incluir mais clientes no meu plano ${plano.nome} da Dattis.`)}
        target="_blank"
        rel="noopener"
        className="mt-3.5 inline-flex font-mono text-[11px] uppercase tracking-[0.05em] text-white/80 underline-offset-4 hover:text-white hover:underline"
      >
        Incluir clientes →
      </a>
    </div>
  );
}

export function Sidebar({
  agenciaNome,
  sairSlot,
  variante = "painel",
  plano,
  pessoa,
}: {
  agenciaNome: string;
  sairSlot: React.ReactNode;
  variante?: keyof typeof GRUPOS;
  plano?: PlanoSidebar;
  pessoa?: string | null; // pessoa da equipe logada (nulo = dono)
}) {
  const grupos = GRUPOS[variante];
  const [collapsed, setCollapsed] = useLocalStorageBoolean("dattis:sidebar", false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const conta = (
    <div className="mx-3 flex items-center gap-3 rounded-2xl border border-line bg-surface px-3 py-2.5">
      <span className="pixel-corners pixel-corners-sm grid h-9 w-9 shrink-0 place-items-center bg-brand font-mono text-[13px] text-on-brand">{iniciais(agenciaNome)}</span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[14px] font-medium text-ink">{agenciaNome}</span>
        <span className="block truncate text-[12px] text-muted">{variante === "admin" ? "Administrador" : pessoa ? `Equipe · ${pessoa}` : "Dono da conta"}</span>
      </span>
    </div>
  );

  const rodape = (compacto: boolean) => (
    <div className={"mx-3 mt-3 flex items-center gap-1 border-t border-line pt-3 " + (compacto ? "flex-col" : "")}>
      <div className={compacto ? "" : "flex-1"}>{sairSlot}</div>
      <ThemeToggle className="grid h-9 w-9 place-items-center rounded-xl text-muted transition-colors hover:bg-canvas hover:text-ink" />
    </div>
  );

  return (
    <>
      <button
        type="button"
        aria-label="Menu"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-30 rounded-xl border border-line bg-surface p-2.5 text-ink shadow-[var(--shadow-chip)] lg:hidden"
      >
        <Menu size={18} />
      </button>

      <aside
        className={
          "thin-scroll sticky top-0 hidden h-svh shrink-0 flex-col overflow-y-auto border-r border-line bg-surface pb-4 pt-5 transition-[width] duration-200 lg:flex " +
          (collapsed ? "w-[80px]" : "w-[268px]")
        }
      >
        <div className={"flex items-center justify-between px-6 pb-6 " + (collapsed ? "justify-center px-0" : "")}>
          <Marca compacta={collapsed} />
          {!collapsed && (
            <button type="button" onClick={() => setCollapsed(true)} title="Recolher menu" className="rounded-lg p-1.5 text-faint hover:bg-canvas hover:text-ink">
              <PanelLeftClose size={17} />
            </button>
          )}
        </div>
        {collapsed ? (
          <button type="button" onClick={() => setCollapsed(false)} title="Expandir menu" className="mx-auto mb-4 rounded-lg p-2 text-faint hover:bg-canvas hover:text-ink">
            <PanelLeftOpen size={17} />
          </button>
        ) : (
          <div className="mb-6">{conta}</div>
        )}
        <div className="flex-1">
          <NavItems grupos={grupos} collapsed={collapsed} />
        </div>
        {plano && !collapsed && <div className="mt-6">{<CartaoPlano plano={plano} />}</div>}
        {rodape(collapsed)}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="thin-scroll absolute inset-y-0 left-0 flex w-[290px] flex-col overflow-y-auto border-r border-line bg-surface pb-4 pt-5">
            <div className="flex items-center justify-between px-6 pb-6">
              <Marca />
              <button type="button" aria-label="Fechar" onClick={() => setMobileOpen(false)} className="p-1.5 text-muted">
                <X size={20} />
              </button>
            </div>
            <div className="mb-6">{conta}</div>
            <div className="flex-1">
              <NavItems grupos={grupos} collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </div>
            {plano && <div className="mt-6">{<CartaoPlano plano={plano} />}</div>}
            {rodape(false)}
          </div>
        </div>
      )}
    </>
  );
}
