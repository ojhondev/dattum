import Image from "next/image";
import type { Depoimento } from "@/lib/depoimentos";

/**
 * Depoimentos de agências clientes, lado a lado (foto, frase, nome e agência).
 * `escuro` é a versão para fundo preto da landing de anúncios.
 */
export function Testimonials({ kicker, title, items, escuro = false }: { kicker: string; title: string; items: Depoimento[]; escuro?: boolean }) {
  return (
    <section className={"relative z-10 " + (escuro ? "" : "bg-canvas")}>
      <div className={escuro ? "mx-auto max-w-7xl px-4 py-24 sm:px-10" : "w-full px-5 py-24 sm:px-10 lg:px-14"}>
        <p className={escuro ? "font-mono text-[13px] uppercase tracking-[0.08em] text-brand" : "t-eyebrow mb-4"}>{kicker}</p>
        <h2 className={escuro ? "mt-4 max-w-3xl font-display text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.1] text-white" : "t-display max-w-2xl"}>{title}</h2>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {items.map((t) => (
            <figure
              key={t.name}
              className={
                "flex flex-col justify-between gap-10 rounded-[28px] p-8 sm:p-10 " +
                (escuro ? "border border-white/10 bg-[#0b100e]" : "block-card")
              }
            >
              <blockquote className={"font-display text-[clamp(1.3rem,2.2vw,1.75rem)] leading-snug " + (escuro ? "text-white" : "text-ink")}>
                “{t.quote}”
              </blockquote>
              <figcaption className="flex items-center gap-4">
                <Image src={t.foto} alt={`${t.name}, ${t.agencia}`} width={56} height={56} className="h-14 w-14 shrink-0 rounded-full object-cover" />
                <span className="leading-tight">
                  <span className={"block text-[16px] font-medium " + (escuro ? "text-white" : "text-ink")}>{t.name}</span>
                  <span className={"mt-1 block font-mono text-[12.5px] uppercase tracking-[0.05em] " + (escuro ? "text-brand" : "text-brand-ink")}>
                    {t.agencia}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
