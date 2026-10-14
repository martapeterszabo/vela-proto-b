import { LayoutGroup, motion } from "motion/react";
import { haptic, icon, useStore } from "./lib";

export function TabBarB({ active = "Home", onHome }: { active?: string; onHome: () => void }) {
  const { toast } = useStore();
  return (
    <LayoutGroup id="tabs-b">
      <nav className="tabbar glass">
        {[
          ["Home", "tab-home"],
          ["Markets", "tab-markets"],
          ["Leaders", "tab-leaders"],
          ["Profile", "tab-profile"],
        ].map(([t, ic]) => (
          <button
            key={t}
            className={active === t ? "on" : ""}
            onClick={() => {
              haptic(4);
              if (t === "Home") onHome();
              else toast(`${t} isn’t part of this prototype`);
            }}
          >
            {active === t && <motion.span layoutId="tab-pill-b" className="tab-pill" />}
            <img src={icon(ic)} alt="" style={{ opacity: active === t ? 1 : 0.85 }} />
            {t}
          </button>
        ))}
      </nav>
    </LayoutGroup>
  );
}
