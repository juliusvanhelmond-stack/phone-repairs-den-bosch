import { useId } from "react";
import type { DeviceArt as DeviceArtKind } from "@/types/content";
import { cn } from "@/lib/utils";

/**
 * Vector device renders. Drawn in code so every model has a consistent,
 * high-quality visual without stock photography. Replace with official
 * product photography once licensed images are available.
 */
export function DeviceArt({
  art,
  className,
  title,
}: {
  art: DeviceArtKind;
  className?: string;
  title?: string;
}) {
  const id = useId().replace(/:/g, "");
  const a11y = title ? { role: "img", "aria-label": title } : { "aria-hidden": true };

  if (art === "laptop") return <Laptop id={id} className={className} a11y={a11y} />;
  if (art === "tablet" || art === "tablet-home-button")
    return <Tablet id={id} homeButton={art === "tablet-home-button"} className={className} a11y={a11y} />;
  if (art === "phone-foldable") return <Foldable id={id} className={className} a11y={a11y} />;
  return <Phone id={id} art={art} className={className} a11y={a11y} />;
}

type A11y = Record<string, unknown>;

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-frame`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#E5E7EB" />
        <stop offset="0.5" stopColor="#CBD2DC" />
        <stop offset="1" stopColor="#9CA3AF" />
      </linearGradient>
      <linearGradient id={`${id}-screen`} x1="0" y1="0" x2="0.9" y2="1">
        <stop offset="0" stopColor="#1E2A44" />
        <stop offset="0.55" stopColor="#111A2E" />
        <stop offset="1" stopColor="#0B1220" />
      </linearGradient>
      <radialGradient id={`${id}-glow`} cx="0.25" cy="0.15" r="0.8">
        <stop offset="0" stopColor="#3B82F6" stopOpacity="0.45" />
        <stop offset="0.6" stopColor="#2563EB" stopOpacity="0.06" />
        <stop offset="1" stopColor="#2563EB" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
        <stop offset="0.38" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
    </defs>
  );
}

function Screen({ id, x, y, w, h, r }: { id: string; x: number; y: number; w: number; h: number; r: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={r} fill={`url(#${id}-screen)`} />
      <rect x={x} y={y} width={w} height={h} rx={r} fill={`url(#${id}-glow)`} />
      <path d={`M${x + r} ${y} H${x + w * 0.62} L${x} ${y + h * 0.48} V${y + r} Q${x} ${y} ${x + r} ${y}Z`} fill={`url(#${id}-sheen)`} />
    </g>
  );
}

function Phone({ id, art, className, a11y }: { id: string; art: DeviceArtKind; className?: string; a11y: A11y }) {
  const flip = art === "phone-flip";
  const home = art === "phone-home-button";
  const W = 120;
  const H = flip ? 256 : 240;
  const r = home ? 20 : 24;
  const inset = 5;
  const screenY = home ? 30 : inset;
  const screenH = home ? H - 60 : H - inset * 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn("h-auto w-full drop-shadow-[0_18px_30px_rgb(16_24_40/0.18)]", className)} {...a11y}>
      <Defs id={id} />
      <rect x="0.5" y="0.5" width={W - 1} height={H - 1} rx={r} fill={`url(#${id}-frame)`} />
      <rect x="2.5" y="2.5" width={W - 5} height={H - 5} rx={r - 2} fill="#0A0F1A" />
      <Screen id={id} x={inset} y={screenY} w={W - inset * 2} h={screenH} r={home ? 3 : r - 5} />
      {art === "phone-island" && <rect x={W / 2 - 17} y={12} width="34" height="10" rx="5" fill="#000" />}
      {art === "phone-notch" && (
        <path d={`M${W / 2 - 26} ${inset} h52 v4 q0 9 -9 9 h-34 q-9 0 -9 -9z`} fill="#000" />
      )}
      {(art === "phone-punch-hole" || flip) && <circle cx={W / 2} cy={15} r="4" fill="#000" />}
      {home && (
        <>
          <rect x={W / 2 - 12} y={14} width="24" height="3" rx="1.5" fill="#1F2937" />
          <circle cx={W / 2} cy={H - 15} r="9" fill="none" stroke="#374151" strokeWidth="1.5" />
        </>
      )}
      {flip && <rect x={inset} y={H / 2 - 0.5} width={W - inset * 2} height="1" fill="#fff" opacity="0.12" />}
      <text x={W / 2} y={home ? 54 : 46} textAnchor="middle" fill="#fff" fillOpacity="0.92" fontSize="22" fontWeight="600" letterSpacing="-0.5" fontFamily="var(--font-geist-sans), sans-serif">
        9:41
      </text>
    </svg>
  );
}

function Foldable({ id, className, a11y }: { id: string; className?: string; a11y: A11y }) {
  const W = 200;
  const H = 230;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn("h-auto w-full drop-shadow-[0_18px_30px_rgb(16_24_40/0.18)]", className)} {...a11y}>
      <Defs id={id} />
      <rect x="0.5" y="0.5" width={W - 1} height={H - 1} rx="18" fill={`url(#${id}-frame)`} />
      <rect x="2.5" y="2.5" width={W - 5} height={H - 5} rx="16" fill="#0A0F1A" />
      <Screen id={id} x={6} y={6} w={W - 12} h={H - 12} r={13} />
      <rect x={W / 2 - 0.5} y="6" width="1" height={H - 12} fill="#fff" opacity="0.1" />
      <circle cx={W * 0.75} cy={16} r="3.5" fill="#000" />
      <text x={W / 4} y={50} textAnchor="middle" fill="#fff" fillOpacity="0.92" fontSize="22" fontWeight="600" fontFamily="var(--font-geist-sans), sans-serif">
        9:41
      </text>
    </svg>
  );
}

function Tablet({ id, homeButton, className, a11y }: { id: string; homeButton: boolean; className?: string; a11y: A11y }) {
  const W = 220;
  const H = 300;
  const bezel = homeButton ? 22 : 9;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn("h-auto w-full drop-shadow-[0_18px_30px_rgb(16_24_40/0.18)]", className)} {...a11y}>
      <Defs id={id} />
      <rect x="0.5" y="0.5" width={W - 1} height={H - 1} rx="20" fill={`url(#${id}-frame)`} />
      <rect x="2.5" y="2.5" width={W - 5} height={H - 5} rx="18" fill="#0A0F1A" />
      <Screen id={id} x={9} y={bezel} w={W - 18} h={H - bezel * 2} r={homeButton ? 3 : 12} />
      <circle cx={W / 2} cy={homeButton ? 11 : 5.5} r="2" fill="#1F2937" />
      {homeButton && <circle cx={W / 2} cy={H - 11} r="7" fill="none" stroke="#374151" strokeWidth="1.5" />}
      <text x={W / 2} y={bezel + 64} textAnchor="middle" fill="#fff" fillOpacity="0.92" fontSize="40" fontWeight="600" letterSpacing="-1" fontFamily="var(--font-geist-sans), sans-serif">
        9:41
      </text>
    </svg>
  );
}

function Laptop({ id, className, a11y }: { id: string; className?: string; a11y: A11y }) {
  const W = 320;
  const H = 210;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn("h-auto w-full drop-shadow-[0_18px_30px_rgb(16_24_40/0.18)]", className)} {...a11y}>
      <Defs id={id} />
      <rect x="30" y="2" width="260" height="176" rx="12" fill={`url(#${id}-frame)`} />
      <rect x="32" y="4" width="256" height="172" rx="10" fill="#0A0F1A" />
      <Screen id={id} x={38} y={14} w={244} h={156} r={4} />
      <rect x={W / 2 - 14} y="4" width="28" height="7" rx="3.5" fill="#000" />
      <path d="M4 180 H316 Q320 180 318 186 L314 196 Q312 200 306 200 H14 Q8 200 6 196 L2 186 Q0 180 4 180Z" fill={`url(#${id}-frame)`} />
      <rect x={W / 2 - 26} y="180" width="52" height="5" rx="2.5" fill="#9CA3AF" />
    </svg>
  );
}
