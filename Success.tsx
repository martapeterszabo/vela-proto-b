import { motion } from "motion/react";
import { useEffect } from "react";
import { HomeIndicator, StatusBar, bimg, bvid, haptic, liqPrice, reducedMotion, usd } from "./lib";
import type { TradeResult } from "./Trade";

type Props = { r: TradeResult; onDone: () => void; onThesis: () => void };

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Success({ r, onDone, onThesis }: Props) {
  const rm = reducedMotion();
  const c = r.side === "long" ? "#5BE3B0" : "#FF6B6B";

  // haptic beats from the motion sketch (TRD-02): 40 ms with the title, 18 ms with the details
  useEffect(() => {
    const a = setTimeout(() => haptic(40), 250);
    const b = setTimeout(() => haptic(18), 380);
    const k = setTimeout(() => haptic(24), 2400); // checkmark lands in the seal video
    return () => {
      clearTimeout(a);
      clearTimeout(b);
      clearTimeout(k);
    };
  }, []);

  const fade = (delay: number) =>
    rm
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } }
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay, ease: EASE } };

  const rows: [string, string, string?][] = [
    ["Size", usd(r.amount * r.lev)],
    ["Entry price", usd(r.entry)],
    ["Liquidation", usd(liqPrice(r.entry, r.lev, r.side)), "var(--coral-soft)"],
  ];

  return (
    <motion.div
      className="success success-b"
      initial={rm ? { opacity: 0 } : { clipPath: `circle(32px at ${r.origin.x}px ${r.origin.y}px)` }}
      animate={rm ? { opacity: 1 } : { clipPath: `circle(1200px at ${r.origin.x}px ${r.origin.y}px)` }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <StatusBar />
      <div className="wp-b" style={{ height: 852 }}>
        <img src={bimg("wp-success")} alt="" />
      </div>
      {/* Figma seal video fill (frame timeline export, trimmed to the flip-in → checkmark part); plays once and holds */}
      {rm ? (
        <img className="seal-vid" src={bimg(`seal-${r.side}-end`)} alt="" />
      ) : (
        <motion.video
          className="seal-vid"
          poster={bimg(`seal-${r.side}-poster`)}
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-hidden
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <source src={bvid(`seal-${r.side}`, "mp4")} type="video/mp4" />
          <source src={bvid(`seal-${r.side}`, "webm")} type="video/webm" />
        </motion.video>
      )}

      <div className="success-body">
        <div className="seal-b" aria-hidden />

        <motion.h1 {...fade(0.25)} style={{ color: c }}>
          {r.side === "long" ? "Long opened." : "Short opened."}
        </motion.h1>
        <motion.p className="sub" {...fade(0.38)}>
          Bitcoin · {r.lev}× · at market
        </motion.p>

        <div className="details">
          {rows.map(([k, v, col], i) => (
            <motion.div key={k} {...fade(0.5 + i * 0.05)}>
              {i > 0 && <div className="divider" />}
              <div className="r">
                <span>{k}</span>
                <b style={col ? { color: col } : undefined}>{v}</b>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div className="actions" {...fade(0.62)}>
          <button className="btn-b ghost wide" onClick={onThesis}>
            Add your thesis
          </button>
          <button className="btn-b solid wide" onClick={onDone}>
            Close
          </button>
        </motion.div>
      </div>
      <HomeIndicator />
    </motion.div>
  );
}
