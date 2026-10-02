"use client";

import "driver.js/dist/driver.css";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { driver, type DriveStep } from "driver.js";
import { BookOpen, CirclePlay, MessageCircle, Plus, X } from "lucide-react";
import { GLOSSARIO, TOURS, tourDaRota } from "@/lib/tour";
import { linkContato } from "@/lib/contato";

type Ctx = { iniciarTour: (id: string) => void; abrirAjuda: () => void };
const TourCtx = createContext<Ctx>({ iniciarTour: () => {}, abrirAjuda: () => {} });
export const useTour = () => useContext(TourCtx);

const CHAVE_LOCAL = "dattis:tours";

function lerLocal(): string[] {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_LOCAL) ?? "[]");
  } catch {
    return [];
  }
}

/** Primeiro elemento visível com data-tour=alvo (o menu do celular, por exemplo, fica escondido). */
function alvoVisivel(alvo: string) {
  const els = document.querySelectorAll<HTMLElement>(`[data-tour="${alvo}"]`);
  for (const el of els) if (el.getClientRects().length && getComputedStyle(el).visibility !== "hidden") return el;
  return undefined;
}

/**
 * Tours guiados do painel. Abre sozinho o tour de cada tela na primeira visita
 * e guarda o que já foi visto (no banco; na conta demo, só no navegador).
 */
export function TourProvider({ vistosIniciais, salvarNoServidor, children }: { vistosIniciais: string[]; salvarNoServidor: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  const [ajudaAberta, setAjudaAberta] = useState(false);
  const vistos = useRef(new Set(vistosIniciais));
  const ativo = useRef<ReturnType<typeof driver> | null>(null);

  useEffect(() => {
    for (const id of lerLocal()) vistos.current.add(id);
  }, []);

  const marcarVisto = useCallback(
    (id: string) => {
      if (vistos.current.has(id)) return;
      vistos.current.add(id);
      try {
        localStorage.setItem(CHAVE_LOCAL, JSON.stringify([...vistos.current]));
      } catch {}
      if (salvarNoServidor) {
        fetch("/api/agencia/tour", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }).catch(() => null);
      }
    },
    [salvarNoServidor],
  );

  const iniciarTour = useCallback(
    (id: string) => {
      const tour = TOURS.find((t) => t.id === id);
      if (!tour) return;
      ativo.current?.destroy();
      setAjudaAberta(false);
      const passos: DriveStep[] = tour.passos.map((p) => {
        const el = p.alvo ? alvoVisivel(p.alvo) : undefined;
        return { element: el, popover: { title: p.titulo, description: p.texto, side: el ? p.lado : undefined, align: "start" } };
      });
      const d = driver({
        steps: passos,
        showProgress: passos.length > 1,
        progressText: "{{current}} de {{total}}",
        nextBtnText: "Próximo",
        prevBtnText: "Voltar",
        doneBtnText: "Entendi",
        popoverClass: "dattis-tour",
        overlayOpacity: 0.55,
        stagePadding: 6,
        stageRadius: 14,
        smoothScroll: true,
        onDestroyed: () => {
          marcarVisto(tour.id);
          ativo.current = null;
        },
      });
      ativo.current = d;
      d.drive();
    },
    [marcarVisto],
  );

  // Primeira visita a uma tela com tour: abre sozinho, depois que a página terminou de desenhar.
  useEffect(() => {
    const tour = tourDaRota(pathname);
    if (!tour || vistos.current.has(tour.id)) return;
    const t = setTimeout(() => {
      if (!ativo.current && !vistos.current.has(tour.id)) iniciarTour(tour.id);
    }, 900);
    return () => clearTimeout(t);
  }, [pathname, iniciarTour]);

  useEffect(() => () => ativo.current?.destroy(), []);

  return (
    <TourCtx.Provider value={{ iniciarTour, abrirAjuda: () => setAjudaAberta(true) }}>
      {children}
      {ajudaAberta && <PainelAjuda fechar={() => setAjudaAberta(false)} iniciarTour={iniciarTour} pathname={pathname} />}
    </TourCtx.Provider>
  );
}

function PainelAjuda({ fechar, iniciarTour, pathname }: { fechar: () => void; iniciarTour: (id: string) => void; pathname: string }) {
  const daTela = tourDaRota(pathname);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && fechar();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [fechar]);

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-label="Ajuda">
      <button type="button" aria-label="Fechar ajuda" onClick={fechar} className="absolute inset-0 bg-ink/40" />
      <aside className="relative flex h-full w-full max-w-[420px] flex-col overflow-y-auto bg-canvas shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <p className="font-display text-[22px] text-ink">Ajuda</p>
          <button type="button" onClick={fechar} aria-label="Fechar" className="grid h-9 w-9 place-items-center rounded-xl border border-line text-muted hover:text-ink">
            <X size={17} />
          </button>
        </div>

        <div className="flex flex-col gap-6 px-5 py-5">
          <section>
            <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-muted">Tours guiados</p>
            <div className="mt-3 flex flex-col gap-2">
              {daTela && (
                <button type="button" onClick={() => iniciarTour(daTela.id)} className="flex items-center gap-3 rounded-2xl bg-brand px-4 py-3 text-left text-on-brand">
                  <CirclePlay size={20} className="shrink-0" />
                  <span className="text-[15px] font-medium">Rever o tour desta tela ({daTela.nome})</span>
                </button>
              )}
              {daTela?.id !== "boas-vindas" && (
                <button type="button" onClick={() => iniciarTour("boas-vindas")} className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-left text-ink hover:bg-surface-2">
                  <CirclePlay size={20} className="shrink-0 text-brand-ink" />
                  <span className="text-[15px]">Tour completo do painel</span>
                </button>
              )}
            </div>
            <details className="mt-3 text-[14px] [&_svg.plus]:open:rotate-45">
              <summary className="flex cursor-pointer list-none items-center justify-between text-muted hover:text-ink">
                Tours das outras telas <Plus size={15} className="plus transition-transform" />
              </summary>
              <ul className="mt-2 flex flex-col gap-1">
                {TOURS.filter((t) => t.id !== "boas-vindas" && t.id !== daTela?.id).map((t) => (
                  <li key={t.id} className="text-body">
                    {t.nome}
                    <span className="text-faint"> · abra a tela e use “Rever o tour desta tela”</span>
                  </li>
                ))}
              </ul>
            </details>
          </section>

          <section>
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.05em] text-muted">
              <BookOpen size={14} /> Glossário sem juridiquês
            </p>
            <div className="mt-3 flex flex-col gap-1.5">
              {GLOSSARIO.map((g) => (
                <details key={g.termo} className="group rounded-xl border border-line bg-surface px-4 py-3 [&_svg]:open:rotate-45">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] text-ink">
                    {g.termo}
                    <Plus size={15} className="shrink-0 text-muted transition-transform" />
                  </summary>
                  <p className="mt-2 text-[14px] leading-relaxed text-body">{g.significado}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-forest px-5 py-5 text-white">
            <p className="font-display text-[19px]">Ainda com dúvida?</p>
            <p className="mt-1 text-[14px] leading-relaxed text-white/75">Um especialista da Dattis responde no WhatsApp em horário comercial.</p>
            <a
              href={linkContato(`Olá! Estou na tela ${pathname} do painel da Dattis e tenho uma dúvida.`)}
              target="_blank"
              rel="noopener"
              className="btn btn-primary mt-4"
            >
              <MessageCircle size={16} /> Falar com especialista
            </a>
          </section>
        </div>
      </aside>
    </div>
  );
}
