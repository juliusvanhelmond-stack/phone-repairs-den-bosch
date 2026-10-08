"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

/**
 * Isometric exploded view of a smartphone: back glass, internals, frame and display.
 * It visualises what a repair is about without stock photography.
 */
const GAP = 64;
const ease = [0.22, 1, 0.36, 1] as const;

const layer: Variants = {
  closed: { z: 0 },
  open: (i: number) => ({ z: i * GAP, transition: { duration: 1.4, delay: 0.25 + i * 0.08, ease } }),
  hover: (i: number) => ({ z: i * (GAP + 14), transition: { duration: 0.8, ease } }),
};

export function ExplodedPhone() {
  const reduce = useReducedMotion();
  return (
    <div className="relative mx-auto aspect-[1/1.02] w-full max-w-[34rem]" aria-hidden>
      <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(closest-side,rgb(37_99_235/0.14),transparent)]" />
      <motion.div
        className="absolute top-1/2 left-1/2 [transform-style:preserve-3d]"
        style={{ width: 0, height: 0 }}
        initial={reduce ? "open" : "closed"}
        animate="open"
        whileHover={reduce ? undefined : "hover"}
      >
        <div
          className="absolute [transform-style:preserve-3d]"
          style={
            {
              width: "var(--w)",
              height: "var(--h)",
              left: "calc(var(--w) / -2)",
              top: "calc(var(--h) / -2 - 3.5rem)",
              transform: "rotateX(58deg) rotateZ(-42deg)",
              "--w": "clamp(9.5rem, 30vw, 12.75rem)",
              "--h": "calc(var(--w) * 2.05)",
            } as CSSProperties
          }
        >
          <Layer i={0}>
            <BackGlass />
          </Layer>
          <Layer i={1}>
            <Internals />
          </Layer>
          <Layer i={2}>
            <Frame />
          </Layer>
          <Layer i={3}>
            <Display />
          </Layer>
        </div>
      </motion.div>
    </div>
  );
}

function Layer({ i, children }: { i: number; children: ReactNode }) {
  return (
    <motion.div custom={i} variants={layer} className="absolute inset-0 [transform-style:preserve-3d]">
      {children}
    </motion.div>
  );
}

const radius = "rounded-[calc(var(--w)*0.2)]";

function BackGlass() {
  return (
    <div
      className={`absolute inset-0 ${radius} bg-[linear-gradient(140deg,#F3F5F8,#D5DBE4_55%,#BCC4CF)] shadow-[0_40px_60px_-20px_rgb(16_24_40/0.45),inset_0_0_0_1px_rgb(255_255_255/0.6)]`}
    >
      <div className="absolute top-[4.5%] left-[8%] aspect-square w-[44%] rounded-[24%] bg-[linear-gradient(140deg,#E7EBF0,#C3CAD4)] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.7),0_6px_14px_-6px_rgb(16_24_40/0.35)]">
        <Lens className="top-[9%] left-[9%]" />
        <Lens className="top-[52%] left-[9%]" />
        <Lens className="top-[30%] left-[52%]" />
        <span className="absolute right-[12%] bottom-[12%] size-[9%] rounded-full bg-[#F5E6B8]" />
      </div>
    </div>
  );
}

function Lens({ className }: { className: string }) {
  return (
    <span
      className={`absolute size-[39%] rounded-full bg-[radial-gradient(circle_at_35%_35%,#4B5563,#0B0F19_62%)] shadow-[0_0_0_3px_#D9DEE5,0_0_0_4px_rgb(16_24_40/0.12)] ${className}`}
    />
  );
}

function Internals() {
  return (
    <div className={`absolute inset-[3%] ${radius}`}>
      {/* logic board */}
      <div className="absolute top-[2%] right-[4%] left-[4%] h-[30%] rounded-[1.1rem] bg-[#1C2638] shadow-[0_20px_30px_-16px_rgb(16_24_40/0.6)]">
        <span className="absolute top-[18%] left-[52%] h-[34%] w-[30%] rounded-md bg-[#2B3A52]" />
        <span className="absolute top-[60%] left-[52%] h-[18%] w-[16%] rounded bg-[#34475F]" />
        <span className="absolute top-[18%] left-[10%] size-[22%] rounded-full bg-[#111827] ring-2 ring-[#2B3A52]" />
        <span className="absolute top-[62%] left-[14%] h-[14%] w-[26%] rounded-full bg-accent/80" />
      </div>
      {/* battery */}
      <div className="absolute top-[35%] right-[10%] left-[10%] h-[48%] rounded-[1.1rem] bg-[linear-gradient(160deg,#2A3346,#141B2B)] shadow-[0_20px_30px_-16px_rgb(16_24_40/0.6),inset_0_0_0_1px_rgb(255_255_255/0.06)]">
        <span className="absolute inset-x-[18%] top-[44%] h-[3%] rounded-full bg-white/10" />
        <span className="absolute inset-x-[30%] top-[52%] h-[3%] rounded-full bg-white/6" />
      </div>
      {/* charging port / speaker */}
      <div className="absolute right-[18%] bottom-[3%] left-[18%] h-[8%] rounded-lg bg-[#1C2638]">
        <span className="absolute top-1/2 left-1/2 h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3E5170]" />
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div
      className={`absolute inset-0 ${radius} shadow-[inset_0_0_0_calc(var(--w)*0.03)_#C9D0DA,inset_0_0_0_calc(var(--w)*0.036)_#9EA7B4,0_10px_30px_-12px_rgb(16_24_40/0.3)]`}
    />
  );
}

function Display() {
  return (
    <div
      className={`absolute inset-0 ${radius} overflow-hidden bg-[#05070C] p-[3.5%] shadow-[0_30px_60px_-24px_rgb(16_24_40/0.55),inset_0_0_0_1px_rgb(255_255_255/0.08)]`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[calc(var(--w)*0.17)] bg-[linear-gradient(165deg,#1C2A47,#0E1628_60%,#0A0F1C)]">
        <div className="absolute -top-1/4 -left-1/4 size-[120%] bg-[radial-gradient(closest-side,rgb(59_130_246/0.45),transparent)]" />
        <div className="absolute top-[3%] left-1/2 h-[4%] w-[32%] -translate-x-1/2 rounded-full bg-black" />
        <p className="absolute top-[12%] w-full text-center text-[calc(var(--w)*0.2)] font-semibold tracking-tight text-white/90">
          9:41
        </p>
        <div className="absolute inset-0 bg-[linear-gradient(125deg,rgb(255_255_255/0.18),transparent_38%)]" />
      </div>
    </div>
  );
}
