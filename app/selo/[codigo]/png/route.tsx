import { ImageResponse } from "next/og";
import { CORES, SELO_ALTURA, SELO_LARGURA, dadosSelo, logoBase64, temaDe } from "@/lib/selo";

export const runtime = "nodejs";

const ESCALA = 2; // PNG em alta resolução (1140×200), nítido em telas retina e impressões

/** PNG do selo para baixar (?tema=claro|escuro). Retrata o status no momento do download. */
export async function GET(req: Request, { params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const tema = temaDe(new URL(req.url).searchParams.get("tema"));
  const [selo, logo] = await Promise.all([dadosSelo(codigo), logoBase64(tema)]);
  const c = CORES[tema];
  const s = (n: number) => n * ESCALA;

  const img = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: c.fundo,
          border: `${s(1)}px solid ${c.borda}`,
          borderRadius: s(c.raio),
          paddingLeft: s(30),
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/png;base64,${logo}`} width={s(104)} height={s(36)} alt="" />
        <div style={{ display: "flex", flexDirection: "column", marginLeft: s(22) }}>
          <div style={{ display: "flex", fontSize: s(15), lineHeight: 1.35, color: c.texto }}>{selo.linhas[0]}</div>
          <div style={{ display: "flex", fontSize: s(15), lineHeight: 1.35, color: c.texto }}>{selo.linhas[1]}</div>
          <div style={{ display: "flex", marginTop: s(5), fontSize: s(14), fontWeight: 600, letterSpacing: s(0.3), color: c.codigo[selo.estado] }}>{selo.codigo}</div>
        </div>
      </div>
    ),
    { width: s(SELO_LARGURA), height: s(SELO_ALTURA) },
  );
  const corpo = await img.arrayBuffer();
  return new Response(corpo, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="selo-dattis-${selo.codigo}-${tema}.png"`,
      "Cache-Control": "no-store",
    },
  });
}
