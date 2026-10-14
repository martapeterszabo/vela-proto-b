import { motion } from "motion/react";
import { useRef, useState } from "react";
import { haptic, pct, usd } from "./lib";
import { GlowLine, yOnPath, type Pt } from "./motion-ui";

/** B-direction chart: dashed grid, glowing line, scrub with glass tooltip (rests at a default spot like in Figma). */
export function BChart({
  pts,
  vbW,
  vbH,
  height,
  drawKey,
  restX,
  priceAt,
  labelAt,
  current,
  levels = [],
  gridRows = [0.075, 0.325, 0.558],
  gridCols = [0.128, 0.3, 0.472, 0.645, 0.8, 0.948],
}: {
  pts: Pt[];
  vbW: number;
  vbH: number;
  height: number;
  drawKey: string;
  restX: number;
  priceAt: (y: number) => number;
  labelAt: (x: number) => string;
  current: number;
  levels?: { y: number; label: string; kind: "entry" | "liq" }[];
  gridRows?: number[];
  gridCols?: number[];
}) {
  const box = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement | null>(null);
  const [drawn, setDrawn] = useState(false);
  const [x, setX] = useState<number | null>(null);
  const [touching, setTouching] = useState(false);
  const last = pts[pts.length - 1];

  const sx = x ?? restX;
  const sy = (drawn || touching) && lineRef.current ? yOnPath(lineRef.current, sx) ?? 0 : 0;
  const showScrub = drawn || touching;

  const move = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    const nx = Math.max(pts[0][0], Math.min(last[0], ((clientX - r.left) / r.width) * vbW));
    if (Math.abs(nx - sx) > vbW / 40) haptic(2);
    setX(nx);
  };
  const p = priceAt(sy);
  const change = (current / p - 1) * 100;
  const leftPct = (sx / vbW) * 100;
  const tipOnLeft = leftPct > 62;

  return (
    <div
      className="bchart"
      ref={box}
      style={{ height }}
      onPointerDown={(e) => {
        (e.target as Element).setPointerCapture?.(e.pointerId);
        setTouching(true);
        haptic(8);
        move(e.clientX);
      }}
      onPointerMove={(e) => touching && move(e.clientX)}
      onPointerUp={() => setTouching(false)}
      onPointerCancel={() => setTouching(false)}
    >
      <svg className="bgrid" viewBox={`0 0 100 100`} preserveAspectRatio="none" width="100%" height="100%">
        {gridRows.map((r) => (
          <line key={"r" + r} x1="0" x2="100" y1={r * 100} y2={r * 100} />
        ))}
        {gridCols.map((c) => (
          <line key={"c" + c} y1="0" y2="96.7" x1={c * 100} x2={c * 100} />
        ))}
      </svg>
      <div className="bchart-plot">
        <GlowLine pts={pts} vbW={vbW} vbH={vbH} drawKey={drawKey} pathRef={lineRef} onDrawn={setDrawn} areaOpacity={0.1} />
        {levels.map((l) => (
          <div key={l.kind} className={"blevel " + l.kind} style={{ top: `${(l.y / vbH) * 100}%` }}>
            <span>{l.label}</span>
          </div>
        ))}
        {showScrub && (
          <>
            <motion.div className="bscrub-line" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ left: `${leftPct}%` }} />
            <motion.div className="bscrub-dot" initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ left: `${leftPct}%`, top: `${(sy / vbH) * 100}%` }} />
            <motion.div
              className="btip"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                left: tipOnLeft ? undefined : `calc(${leftPct}% + 12px)`,
                right: tipOnLeft ? `calc(${100 - leftPct}% + 12px)` : undefined,
                top: `calc(${(sy / vbH) * 100}% - 26px)`,
              }}
            >
              <b>{labelAt(sx)}</b>
              <span className="v">{usd(p)}</span>
              <span className={change >= 0 ? "t-up" : "t-down"}>{pct(change)}</span>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
