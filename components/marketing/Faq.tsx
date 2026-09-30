import { Plus } from "lucide-react";

export function Faq({ title, items }: { title: string; items: { q: string; a: string }[] }) {
  return (
    <section id="faq" className="on-light relative z-10 bg-gradient-to-b from-brand-tint to-brand-tint-2">
      <div className="mx-auto w-full max-w-5xl px-5 py-24 sm:px-10">
        <h2 className="t-display text-center text-rail">{title}</h2>

        <div className="mt-14 flex flex-col gap-5">
          {items.map((it) => (
            <details key={it.q} className="group rounded-[20px] bg-white px-6 py-5 sm:px-8 sm:py-6 [&_svg]:open:rotate-45">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[17px] text-ink sm:text-[19px]">
                {it.q}
                <Plus size={20} className="shrink-0 text-ink transition-transform" />
              </summary>
              <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-body">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
