import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { HomeIndicator, StatusBar, bimg, bvid, haptic, reducedMotion } from "./lib";

const SLIDE_MS = 7000;

type Props = { step: number; setStep: (n: number) => void; onDone: () => void };

const ART = [{ src: "onb1" }, { src: "onb2" }, { src: "onb3" }];
const COPY = [
  { serif: "Every market.", sans: "One balance.", body: "Stocks, crypto and metals, tradable around the clock." },
  { serif: "Amplify", sans: "your position.", body: "Stocks, crypto and metals, tradable around the clock." },
  { serif: "Every market.", sans: "One balance.", body: "Stocks, crypto and metals, tradable around the clock." },
];

export default function Onboarding({ step, setStep, onDone }: Props) {
  const rm = reducedMotion();
  useEffect(() => {
    if (step >= 2) return;
    const id = setTimeout(() => setStep(step + 1), SLIDE_MS);
    return () => clearTimeout(id);
  }, [step, setStep]);

  const next = () => {
    haptic(8);
    if (step < 2) setStep(step + 1);
    else onDone();
  };
  const art = ART[step];
  const copy = COPY[step];

  return (
    <div className="onb-b">
      <StatusBar />
      <div className="onb-b-top">
        <div className="onb-b-progress" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div className="bar" key={i}>
              <div
                key={`${i}-${step}`}
                className="fill"
                style={i < step ? { width: "100%" } : i === step ? (step === 2 ? { width: "100%", transition: "width .6s ease" } : { animation: `onb-fill ${SLIDE_MS}ms linear forwards` }) : { width: 0 }}
              />
            </div>
          ))}
        </div>
        <button className="onb-b-skip" onClick={onDone}>
          Skip
        </button>
      </div>
      <style>{`@keyframes onb-fill { from { width: 0 } to { width: 100% } }`}</style>

      <div className="onb-b-art">
        <AnimatePresence mode="popLayout" initial={false}>
          {/* Figma "Flow" video fill, exported from the frame timeline and cropped to the 393×404 Image frame */}
          <motion.video
            key={art.src}
            poster={bimg(art.src + "-poster")}
            className="onb-b-video"
            autoPlay={!rm}
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <source src={bvid(art.src, "mp4")} type="video/mp4" />
            <source src={bvid(art.src, "webm")} type="video/webm" />
          </motion.video>
        </AnimatePresence>
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={`copy-${step}`}
          className="onb-b-copy"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1>
            <em>{copy.serif}</em>
            <span>{copy.sans}</span>
          </h1>
          <p>{copy.body}</p>
        </motion.div>
      </AnimatePresence>

      <div className="onb-b-actions">
        <button className={"btn-b " + (step === 2 ? "solid" : "ghost")} onClick={next}>
          {step === 2 ? "Create account" : "Continue"}
        </button>
        <button className="onb-b-link" onClick={onDone}>
          {step === 2 ? "Log in" : "I already have an account"}
        </button>
      </div>
      <HomeIndicator />
    </div>
  );
}
