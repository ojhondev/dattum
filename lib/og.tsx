import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

// Degraus da borda pixelada (mesma assinatura visual do site), de baixo pra cima.
const DEGRAUS = [4, 3, 4, 3, 2, 3, 2, 2, 1, 2, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 2, 1, 2, 2, 3, 2, 3, 4, 3, 4, 4, 3, 4, 4];

/** Imagem de compartilhamento (1200×630) no visual Dattis: verde-floresta, título em Montagu Slab e borda pixelada menta. */
export async function imagemOg({ eyebrow, titulo, rodape }: { eyebrow: string; titulo: string; rodape?: string }) {
  const [slab, mono, logo] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/MontaguSlab-Medium.woff")),
    readFile(join(process.cwd(), "assets/fonts/GeistMono-Medium.woff")),
    readFile(join(process.cwd(), "public/brand/logo-fundo-dark.png"), "base64"),
  ]);
  const tamanho = titulo.length > 80 ? 54 : titulo.length > 50 ? 64 : 76;
  const lado = OG_SIZE.width / DEGRAUS.length;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#002820", position: "relative", padding: "64px 72px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`data:image/png;base64,${logo}`} height={48} alt="" style={{ height: 48 }} />
          <div style={{ display: "flex", fontFamily: "Geist Mono", fontSize: 22, letterSpacing: 2, textTransform: "uppercase", color: "#6ceead" }}>{eyebrow}</div>
        </div>
        <div style={{ display: "flex", marginTop: 56, maxWidth: 1000, fontFamily: "Montagu Slab", fontSize: tamanho, lineHeight: 1.08, color: "#ffffff" }}>{titulo}</div>
        {rodape && (
          <div style={{ display: "flex", marginTop: 28, fontFamily: "Geist Mono", fontSize: 22, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: 1.5 }}>{rodape}</div>
        )}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", alignItems: "flex-end" }}>
          {DEGRAUS.map((h, i) => (
            <div key={i} style={{ width: lado, height: h * lado * 0.55, background: "#6ceead" }} />
          ))}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Montagu Slab", data: slab, weight: 500, style: "normal" },
        { name: "Geist Mono", data: mono, weight: 500, style: "normal" },
      ],
    },
  );
}
