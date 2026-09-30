import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

export type Meta = { icon: LucideIcon; label: string; status?: "sim" | "nao" };

/** Pilha de chips de metadados: ícone num círculo + rótulo + SIM/NÃO opcional. */
export function MetaChips({ items, className = "" }: { items: Meta[]; className?: string }) {
  return (
    <div className={"flex flex-col items-start gap-2.5 " + className}>
      {items.map(({ icon: Icon, label, status }) => (
        <div key={label} className="meta-row">
          <span className="meta-icon">
            <Icon size={17} strokeWidth={1.8} />
          </span>
          <span className="meta-label">{label}</span>
          {status === "sim" && <span className="meta-yes">SIM</span>}
          {status === "nao" && <span className="meta-no">NÃO</span>}
        </div>
      ))}
    </div>
  );
}

/** Link de ação: rótulo em mono maiúsculo + círculo verde com seta. */
export function ArrowLink({ href, children, className = "" }: { href: string; children?: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={"arrow-link " + className}>
      {children}
      <span className="arrow-circle">
        <ArrowRight size={18} strokeWidth={1.6} />
      </span>
    </Link>
  );
}
