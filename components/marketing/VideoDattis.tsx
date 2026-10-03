"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Play, X } from "lucide-react";

const VIDEOS = {
  desktop: { src: "/videos/dattis-desktop.mp4", poster: "/videos/dattis-desktop.jpg" },
  mobile: { src: "/videos/dattis-mobile.mp4", poster: "/videos/dattis-mobile.jpg" },
};

/**
 * Botão "O que é a Dattis" do hero: abre o vídeo de 30 segundos numa janela.
 * Tela estreita ou em pé recebe a versão vertical (9:16); o resto, a horizontal (16:9).
 */
export function VideoDattis({ className = "btn btn-dark btn-lg" }: { className?: string }) {
  const [versao, setVersao] = useState<keyof typeof VIDEOS | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);

  const abrir = () => setVersao(matchMedia("(max-width: 767px), (orientation: portrait) and (max-width: 1024px)").matches ? "mobile" : "desktop");
  const fechar = () => {
    video.current?.pause();
    setVersao(null);
  };

  useEffect(() => {
    if (!versao) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && fechar();
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [versao]);

  const v = versao ? VIDEOS[versao] : null;

  return (
    <>
      <button type="button" onClick={abrir} className={className}>
        <span className="grid h-6 w-6 place-items-center rounded-full bg-brand text-rail">
          <Play size={12} strokeWidth={0} fill="currentColor" className="translate-x-px" />
        </span>
        O que é a Dattis
      </button>
      {v &&
        createPortal(
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#020f0c]/85 p-4 backdrop-blur-sm" onClick={fechar}>
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Vídeo: o que é a Dattis"
              className={"relative " + (versao === "mobile" ? "h-[min(82svh,calc((100vw-32px)*16/9))] aspect-[9/16]" : "w-[min(1100px,100%)] aspect-video")}
              onClick={(e) => e.stopPropagation()}
            >
              <video
                ref={video}
                src={v.src}
                poster={v.poster}
                controls
                autoPlay
                playsInline
                preload="auto"
                className="h-full w-full rounded-2xl bg-black object-contain shadow-2xl"
              />
              <button
                type="button"
                onClick={fechar}
                aria-label="Fechar vídeo"
                className="absolute -top-3 right-0 grid h-10 w-10 -translate-y-full place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:-right-3 sm:translate-x-full sm:translate-y-0 sm:top-0"
              >
                <X size={20} />
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
