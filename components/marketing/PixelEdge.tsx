/**
 * Borda pixelada em degraus entre duas seções (assinatura do proofmode.org).
 * `bg` é a cor da seção de cima; `fill` a da seção de baixo, que "sobe" em blocos.
 * Com `flip`, os blocos descem do topo (fill em cima, bg embaixo).
 * Cada metade é um SVG ancorado na sua borda externa, pra os degraus nunca serem cortados.
 */
const COLS = 40;
const SKYLINE_L = [4, 4, 3, 4, 3, 2, 3, 2, 2, 1, 2, 1];
const SKYLINE_R = [4, 3, 4, 2, 3, 3, 2, 1, 2, 2, 1, 1];
const HOLES_L: [number, number][] = [[1, 1], [2, 2], [4, 0], [5, 1], [8, 0], [0, 3]];
const HOLES_R: [number, number][] = [[1, 2], [3, 0], [4, 1], [6, 0], [2, 3]];

function cells(skyline: number[], holes: [number, number][], mirror: boolean) {
  const rects: { x: number; y: number }[] = [];
  for (let d = 0; d < COLS; d++) {
    const h = skyline[d] ?? 1;
    for (let r = 0; r < h; r++) {
      if (holes.some(([hd, hr]) => hd === d && hr === r)) continue;
      rects.push({ x: mirror ? COLS - 1 - d : d, y: 3 - r });
    }
  }
  return rects;
}

function Half({ side, fill }: { side: "l" | "r"; fill: string }) {
  const rects = side === "l" ? cells(SKYLINE_L, HOLES_L, false) : cells(SKYLINE_R, HOLES_R, true);
  return (
    <svg
      viewBox={`0 0 ${COLS} 4`}
      preserveAspectRatio={side === "l" ? "xMinYMax slice" : "xMaxYMax slice"}
      shapeRendering="crispEdges"
      className={"block h-[88px] w-1/2 sm:h-[96px] " + (side === "r" ? "-ml-px" : "")}
    >
      {rects.map(({ x, y }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1.03" height="1.03" fill={fill} />
      ))}
    </svg>
  );
}

export function PixelEdge({ bg, fill, flip = false }: { bg: string; fill: string; flip?: boolean }) {
  return (
    <div aria-hidden="true" className={"relative z-10 -my-px flex w-full " + (flip ? "-scale-y-100" : "")} style={{ background: bg }}>
      <Half side="l" fill={fill} />
      <Half side="r" fill={fill} />
    </div>
  );
}
