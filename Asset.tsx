import { RollingNumber } from "./motion-ui";
import { BChart } from "./b-chart";
import { ASSET_B, variant } from "./b-points";
import { TabBarB } from "./b-tabbar";
import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AssetIcon, BTC_PREV_CLOSE, HomeIndicator, StatusBar, haptic, bimg, icon, posLiq, pct, pnlOf, signedUsd, usd, useStore, type Side } from "./lib";

type Props = { onBack: () => void; onTrade: (side: Side) => void };

const ASSET_RANGE: Record<string, [number, number, number]> = { "15m": [7, 150, 9], "1H": [0, 0, 0], "1D": [21, 240, 7], "7D": [3, 225, 8], "1M": [11, 255, 9], All: [5, 262, 6] };
const ASSET_SERIES: Record<string, [number, number][]> = Object.fromEntries(Object.entries(ASSET_RANGE).map(([k, [seed, y0, vol]]) => [k, variant(ASSET_B, seed, y0, vol, 270)]));
const PX_PER_USD_B = (151.4 - 7 - 47) / 2102.5;
const TRADERS = [
  { h: "@kova", c: "#7b95ff", side: "long" as Side, lev: 20, size: 182.4, pnl: 14210, avg: 95880, q: "Breakout over 97k held twice. Adding on dips.", ago: 42, follow: true },
  { h: "@nightdesk", c: "#ff9f43", side: "short" as Side, lev: 5, size: 64, pnl: -460, avg: 99120, q: "Funding too hot, fading the move into 100k.", ago: 8, follow: false },
  { h: "@mira.eth", c: "#5be3b0", side: "long" as Side, lev: 3, size: 23.5, pnl: 1180, avg: 93450, q: "Slow money. Holding through the halving cycle.", ago: 15, follow: true },
  { h: "@lumen", c: "#c9d4ff", side: "long" as Side, lev: 10, size: 8.2, pnl: 312, avg: 97020, q: "Small size, testing the range high.", ago: 3, follow: false },
];

export default function Asset({ onBack, onTrade }: Props) {
  const { prices, positions, closePosition, toast } = useStore();
  const pos = positions.find((p) => p.asset === "BTC");
  const scroller = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [starred, setStarred] = useState(true);
  const star = useAnimationControls();
  const [range, setRange] = useState("1H");
  const [tab, setTab] = useState<"Feed" | "Stats">("Feed");
  const [filter, setFilter] = useState<"Top by size" | "Recent">("Top by size");
  const [following, setFollowing] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [ratioOn, setRatioOn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRatioOn(true), 250);
    return () => clearTimeout(t);
  }, []);

  const [int, dec] = usd(prices.btc).split(".");
  const dayChg = prices.btc - BTC_PREV_CLOSE;

  const traders = useMemo(() => {
    let t = [...TRADERS];
    if (following) t = t.filter((x) => x.follow);
    if (filter === "Recent") t = t.filter((x) => x.size >= 10).sort((a, b) => a.ago - b.ago);
    else t.sort((a, b) => b.size - a.size);
    return t;
  }, [filter, following]);

  return (
    <div style={{ position: "absolute", inset: 0, background: "var(--bg)", overflow: "hidden" }}>
      <StatusBar />
      <div className={"asset-header" + (scrolled ? " scrolled" : "")}>
        <button className="icon-btn glass" onClick={onBack} aria-label="Back">
          <img src={icon("back")} width={20} height={20} alt="" />
        </button>
        <div className="mini">
          <b>Bitcoin</b>
          <span>
            <RollingNumber text={usd(prices.btc)} dir={prices.btcDir} /> ▲ {((dayChg / BTC_PREV_CLOSE) * 100).toFixed(2)}%
          </span>
        </div>
        <motion.button
          className="icon-btn glass"
          aria-label="Watchlist"
          aria-pressed={starred}
          animate={star}
          onClick={() => {
            haptic(10);
            const on = !starred;
            setStarred(on);
            star.start({ scale: [1, 1.45, 1], rotate: [0, 8, 0], transition: { type: "spring", duration: 0.55, bounce: 0.5 } });
            toast(on ? "Added to watchlist" : "Removed from watchlist");
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20">
            <path
              d="M10 2.91667L12.1667 7.33333L17.0833 8.08333L13.5 11.5L14.3333 16.3333L10 14.0833L5.66667 16.3333L6.5 11.5L2.91667 8.08333L7.83333 7.33333L10 2.91667Z"
              fill={starred ? "#9DB0FF" : "none"}
              stroke={starred ? "none" : "#c9d4ff"}
              strokeWidth={1.5}
              strokeLinejoin="round"
              style={{ transition: "fill .2s" }}
            />
          </svg>
        </motion.button>
        <button className="icon-btn glass" aria-label="Share" onClick={() => toast("Share sheet would open here")}>
          <img src={icon("share")} width={20} height={20} alt="" />
        </button>
      </div>

      <div className="scroller" ref={scroller} onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 110)}>
        <div className="wp-b" style={{ height: 1221 }}>
          <img src={bimg("wp-asset")} alt="" />
        </div>
        <div className="asset-content">
          <div className="price-block">
            <div className="id">
              <AssetIcon bg="#f7931a" glyph="₿" />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 500, fontSize: 17, color: "#fff" }}>Bitcoin</span>
                <span className="t-meta">BTC · Crypto · up to 40×</span>
              </div>
            </div>
            <div className="pf-row asset" style={{ opacity: scrolled ? 0 : 1, transition: "opacity .25s" }}>
              <div className="value">
                <RollingNumber text={int} dir={prices.btcDir} className="int" tint={false} />
                <RollingNumber text={"." + dec} dir={prices.btcDir} className="dec" tint={false} />
              </div>
              <div className="today-col">
                <span>Today</span>
                <div className="pill-up">
                  <img src={icon("arrowup")} width={10} height={10} alt="" />
                  {usd(dayChg)} ({((dayChg / BTC_PREV_CLOSE) * 100).toFixed(2)}%)
                </div>
              </div>
            </div>
          </div>

          <div className="chart-b-wrap">
            <BChart
              pts={ASSET_SERIES[range]}
              vbW={320.42}
              vbH={270}
              height={270}
              drawKey={range}
              restX={243}
              current={prices.btc}
              priceAt={(y) => prices.btc - (y - 47) / PX_PER_USD_B}
              labelAt={(x) => {
                const mins = ((320.42 - x) / 320.42) * ({ "15m": 15, "1H": 60, "1D": 1440, "7D": 10080, "1M": 43200, All: 525600 }[range] ?? 60);
                const d = new Date(2026, 9, 14, 10, 57 - mins);
                return range === "15m" || range === "1H" || range === "1D" ? d.toTimeString().slice(0, 5) : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              }}
              levels={pos ? [
                { y: 151.4 - 7, label: `Entry  ${usd(pos.entry, 0)}`, kind: "entry" },
                { y: 238.4 - 7, label: `Liq.  ${usd(posLiq(pos), 0)}`, kind: "liq" },
              ] : []}
            />
          </div>

          <div className="trange glass b asset">
            {["15m", "1H", "1D", "7D", "1M", "All"].map((r) => (
              <button
                key={r}
                className={r === range ? "on" : ""}
                onClick={() => {
                  haptic(4);
                  setRange(r);
                }}
              >
                {r === range && <motion.span layoutId="trange-pill" className="pill" style={{ inset: 0, position: "absolute", background: "#fff", borderRadius: 18 }} transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                <span style={{ position: "relative" }}>{r}</span>
              </button>
            ))}
          </div>

          <div className="ratio">
            <div className="lbls">
              <span className="t-up" style={{ flex: 1 }}>Long 64%</span>
              <span className="mid">Traders on Vela · 24h</span>
              <span className="t-down">Short 36%</span>
            </div>
            <div className="bars">
              <i style={{ background: "var(--mint)", flexGrow: ratioOn ? 64 : 50, flexBasis: 0 }} />
              <i style={{ background: "var(--coral)", flexGrow: ratioOn ? 36 : 50, flexBasis: 0 }} />
            </div>
          </div>

          <div className="below">
            {pos ? <PositionCard /> : <NoPosition onTrade={onTrade} />}

            {pos && (
              <div className="list tight">
                <button className="prow" onClick={() => onTrade(pos.side)}>
                  <b>Auto close</b>
                  <span>TP $105,000 · SL $92,000</span>
                  <img src={icon("chevron")} width={16} height={16} alt="" />
                </button>
                <div className="divider" />
                <button className="prow" onClick={() => toast("Thesis editor isn’t wired here")}>
                  <b>Thesis</b>
                  <span>“{pos.thesis ?? "Add your thesis"}”</span>
                  <img src={icon("chevron")} width={16} height={16} alt="" />
                </button>
                <div className="divider" />
                <button className="prow" onClick={() => toast("History export isn’t wired")}>
                  <b>History</b>
                  <span>12 trades · export for tax</span>
                  <img src={icon("chevron")} width={16} height={16} alt="" />
                </button>
              </div>
            )}

            <div className="tabs2">
              {(["Feed", "Stats"] as const).map((t) => (
                <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>
                  {t}
                  <i />
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {tab === "Feed" ? (
                <motion.div key="feed" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div className="filters">
                    {(["Top by size", "Recent"] as const).map((f) => (
                      <button key={f} className={"chip pressable " + (filter === f ? "on" : "glass")} onClick={() => setFilter(f)}>
                        {f}
                      </button>
                    ))}
                    <div style={{ flex: 1 }} />
                    <span style={{ fontWeight: 600, fontSize: 13, color: "var(--muted-2)" }}>Following</span>
                    <button className={"switch" + (following ? " on" : "")} role="switch" aria-checked={following} onClick={() => setFollowing(!following)}>
                      <i />
                    </button>
                  </div>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {traders.map((t) => (
                      <motion.div layout key={t.h} className="trader" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.25 }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <AssetIcon bg={t.c} glyph={t.h[1].toUpperCase()} color="#021222" />
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                            <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>{t.h}</span>
                            <span className={t.side === "long" ? "t-up" : "t-down"} style={{ fontWeight: 600, fontSize: 12 }}>
                              {t.side === "long" ? "Long" : "Short"} {t.lev}× · ${t.size.toFixed(1)}K
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                            <span className={t.pnl >= 0 ? "t-up" : "t-down"} style={{ fontWeight: 700, fontSize: 15 }}>
                              {signedUsd(t.pnl, 0)}
                            </span>
                            <span className="t-meta">Avg. {usd(t.avg, 0)}</span>
                          </div>
                        </div>
                        <p className="quote">“{t.q}”</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {traders.length === 0 && <p className="empty">No positions match these filters</p>}
                </motion.div>
              ) : (
                <motion.div key="stats" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="stat-card">
                    {[
                      ["52w high", "$108,268.40"],
                      ["52w low", "$56,552.10"],
                      ["24h change", pct((dayChg / BTC_PREV_CLOSE) * 100)],
                      ["24h volume", "$4.1B"],
                      ["Max leverage", "40×"],
                    ].map(([k, v], i) => (
                      <div key={k}>
                        {i > 0 && <div className="divider" />}
                        <div className="prow">
                          <span style={{ textAlign: "left", fontSize: 14 }}>{k}</span>
                          <b style={{ color: k === "24h change" ? "var(--mint)" : "#fff" }}>{v}</b>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="trader">
                    <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>About</span>
                    <p className="quote" style={{ lineHeight: "20px", color: "var(--lav)" }}>
                      Bitcoin is a decentralised digital currency with a fixed supply of 21 million coins. On Vela you can trade BTC perpetuals around the clock, long or short, with up to 40× leverage.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="btn-row-b">
              {pos ? (
                <>
                  <button className="btn-b ghost" onClick={() => onTrade(pos.side)}>Modify</button>
                  <button className="btn-b solid" onClick={() => setSheet(true)}>Close</button>
                </>
              ) : (
                <>
                  <button className="btn-b ghost" onClick={() => onTrade("short")}>Short ▼</button>
                  <button className="btn-b solid" onClick={() => onTrade("long")}>Long ▲</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-fade" style={{ height: 150 }} />
      <TabBarB onHome={onBack} />
      <HomeIndicator />

      <AnimatePresence>
        {sheet && pos && (
          <>
            <motion.div className="sheet-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} />
            <motion.div className="sheet" initial={{ y: "110%" }} animate={{ y: 0 }} exit={{ y: "110%" }} transition={{ type: "spring", stiffness: 380, damping: 36 }}>
              <div className="grab" />
              <h3>Close position?</h3>
              <p className="sub">
                Bitcoin · {pos.side === "long" ? "Long" : "Short"} {pos.lev}× · realised PnL{" "}
                <b style={{ color: pnlOf(pos, prices) >= 0 ? "var(--mint)" : "var(--coral)" }}>{signedUsd(pnlOf(pos, prices))}</b>
              </p>
              <div className="stack">
                <button
                  className="btn-white pressable"
                  onClick={() => {
                    haptic(12);
                    closePosition(pos.id);
                    setSheet(false);
                    toast("Position closed");
                  }}
                >
                  Close at market
                </button>
                <button className="btn-glass glass pressable" onClick={() => setSheet(false)}>
                  Keep open
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function PositionCard() {
  const { prices, positions, toast } = useStore();
  const pos = positions.find((p) => p.asset === "BTC")!;
  const pnl = pnlOf(pos, prices);
  const dir = (pos.side === "long" ? prices.btcDir : -prices.btcDir) as 1 | -1 | 0;
  return (
    <div className="pos-card">
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 15, color: "var(--lav)" }}>Your position</span>
        <span className={"badge " + pos.side} style={{ fontSize: 12, padding: "3px 8px", borderRadius: 8 }}>
          {pos.side === "long" ? "Long" : "Short"} {pos.lev}×
        </span>
      </div>
      <div className="pnl" style={{ color: pnl >= 0 ? "var(--mint)" : "var(--coral)" }}>
        <RollingNumber className="big" text={signedUsd(pnl)} dir={dir} />
        <span className="pct">{pct((pnl / pos.margin) * 100)}</span>
      </div>
      <div className="kv-grid">
        <div>
          <div className="k">Lev. size</div>
          <div className="v">{usd(pos.margin * pos.lev)}</div>
        </div>
        <div>
          <div className="k">Avg. entry</div>
          <div className="v">{usd(pos.entry)}</div>
        </div>
        <div>
          <div className="k">Liq. price</div>
          <div className="v" style={{ color: "var(--coral-soft)" }}>
            {usd(posLiq(pos))}
          </div>
        </div>
        <div>
          <div className="k">Funding</div>
          <div className="v">−$1.84</div>
        </div>
      </div>
      <button className="share-btn glass pressable" onClick={() => toast("Share card generated")}>
        <img src={icon("share-sm")} width={16} height={16} alt="" /> Share position
      </button>
    </div>
  );
}

function NoPosition({ onTrade }: { onTrade: (s: Side) => void }) {
  return (
    <div className="pos-card" style={{ alignItems: "flex-start" }}>
      <span style={{ fontWeight: 700, fontSize: 15, color: "var(--lav)" }}>No open position</span>
      <p style={{ color: "var(--muted-2)", fontSize: 14, lineHeight: "20px" }}>Go long if you think Bitcoin rises, short if you think it falls.</p>
      <button className="share-btn glass pressable" style={{ width: "100%" }} onClick={() => onTrade("long")}>
        Open a trade
      </button>
    </div>
  );
}

