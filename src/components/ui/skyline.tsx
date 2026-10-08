import { cn } from "@/lib/utils";

/**
 * Fine-line, stylised skyline of 's-Hertogenbosch (left → right):
 * canal houses, De Moriaan, Stadhuis, Sint-Janskathedraal, Sint-Jacobskerk,
 * more stepped gables and the Binnendieze with a boat. Decorative only.
 */
const BASE = 200;

/** Narrow canal house with a stepped gable and a few windows. */
function stepGable(x: number, w: number, h: number, steps = 3) {
  const top = BASE - h;
  const stepW = w / (steps * 2 + 1);
  const stepH = 8;
  let d = `M${x} ${BASE} V${top}`;
  for (let i = 0; i < steps; i++) d += ` h${stepW} v-${stepH}`;
  d += ` h${stepW}`;
  for (let i = 0; i < steps; i++) d += ` v${stepH} h${stepW}`;
  d += ` V${BASE}`;
  const win: string[] = [];
  const cols = w > 34 ? 3 : 2;
  const gap = w / (cols + 1);
  for (let row = 0; row < Math.floor((h - 26) / 22); row++) {
    for (let c = 1; c <= cols; c++) {
      win.push(`M${x + gap * c - 2.5} ${BASE - 18 - row * 22} h5 v-9 h-5 Z`);
    }
  }
  return [d, ...win].join(" ");
}

/** Bell / neck gable variant for rhythm. */
function bellGable(x: number, w: number, h: number) {
  const top = BASE - h;
  const nw = w * 0.42;
  const nx = x + (w - nw) / 2;
  return [
    `M${x} ${BASE} V${top + 22} Q${x} ${top + 10} ${nx} ${top + 8} V${top} Q${x + w / 2} ${top - 10} ${nx + nw} ${top} V${top + 8} Q${x + w} ${top + 10} ${x + w} ${top + 22} V${BASE}`,
    `M${x + w / 2} ${top + 2} m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0`,
    `M${x + w * 0.3 - 2.5} ${BASE - 18} h5 v-10 h-5 Z M${x + w * 0.7 - 2.5} ${BASE - 18} h5 v-10 h-5 Z`,
    `M${x + w * 0.3 - 2.5} ${BASE - 40} h5 v-10 h-5 Z M${x + w * 0.7 - 2.5} ${BASE - 40} h5 v-10 h-5 Z`,
  ].join(" ");
}

function pinnacles(x1: number, x2: number, y: number, count: number, h = 12) {
  const step = (x2 - x1) / (count - 1);
  return Array.from({ length: count }, (_, i) => {
    const x = x1 + i * step;
    return `M${x} ${y} V${y - h} M${x - 2} ${y - h + 4} L${x} ${y - h - 3} L${x + 2} ${y - h + 4}`;
  }).join(" ");
}

const paths: string[] = [
  // Left canal houses
  stepGable(10, 30, 70, 3),
  bellGable(42, 28, 62),
  stepGable(72, 34, 82, 3),
  stepGable(108, 26, 66, 2),
  bellGable(136, 30, 74),

  // De Moriaan: tall brick house with a stepped gable and side turret
  stepGable(176, 44, 104, 4),
  `M222 ${BASE} V118 h8 V${BASE} M222 118 L226 108 L230 118`,

  // Stadhuis: classical facade, cornice and central bell tower
  `M246 ${BASE} V128 H380 V${BASE}`,
  `M242 128 H384 M246 136 H380`,
  ...[262, 284, 306, 342, 364].map((x) => `M${x} ${BASE - 14} v-22 h10 v22 Z M${x} ${BASE - 46} v-16 h10 v16 Z`),
  `M318 ${BASE} V176 a7 7 0 0 1 14 0 V${BASE}`,
  `M309 128 V100 H341 V128 M305 100 H345`,
  `M313 100 V82 H337 V100 M325 91 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0`,
  `M316 82 Q325 64 334 82 M325 70 V52 M321 58 H329`,

  // Sint-Janskathedraal: west tower
  `M408 ${BASE} V64 H462 V${BASE}`,
  `M404 64 H466 M408 96 H462 M408 132 H462 M408 166 H462`,
  `M420 ${BASE - 8} v-20 a7 7 0 0 1 14 0 v20 M436 ${BASE - 8} v-20 a7 7 0 0 1 14 0 v20`,
  `M424 158 v-18 a5 5 0 0 1 10 0 v18 M436 158 v-18 a5 5 0 0 1 10 0 v18`,
  `M422 124 v-20 a6 6 0 0 1 12 0 v20 M436 124 v-20 a6 6 0 0 1 12 0 v20`,
  `M426 88 v-16 a4 4 0 0 1 8 0 v16 M436 88 v-16 a4 4 0 0 1 8 0 v16`,
  pinnacles(408, 462, 64, 5, 10),
  `M426 64 V48 H444 V64 M422 48 H448 M429 48 Q435 30 441 48 M435 36 V22 M431 27 H439`,

  // Nave with roof, pinnacles and flying buttresses
  `M462 ${BASE} V128 L476 104 H648 L662 128 V${BASE}`,
  pinnacles(476, 648, 104, 11, 11),
  ...Array.from({ length: 7 }, (_, i) => {
    const x = 484 + i * 24;
    return `M${x} ${BASE} V150 Q${x + 6} 132 ${x + 18} 128 M${x + 6} ${BASE - 10} v-26 a6 6 0 0 1 12 0 v26`;
  }),

  // Transept gable with rose window
  `M590 128 L620 82 L650 128 M620 104 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0 M620 95 V113 M611 104 H629`,
  pinnacles(594, 646, 128, 3, 14),

  // Crossing tower (lantern with spire)
  `M548 104 V78 H576 V104 M544 78 H580 M552 78 V66 H572 V78 M556 66 L562 40 L568 66 M562 40 V30`,

  // Choir / apse
  `M662 ${BASE} V140 Q700 134 714 160 V${BASE}`,
  pinnacles(672, 708, 140, 3, 10),

  // Sint-Jacobskerk tower (Jheronimus Bosch Art Center)
  `M752 ${BASE} V96 H780 V${BASE} M748 96 H784`,
  `M756 96 V74 H776 V96 M756 74 L766 62 L776 74 M766 62 V50`,
  `M760 ${BASE - 18} v-16 a6 6 0 0 1 12 0 v16 M760 140 v-14 a6 6 0 0 1 12 0 v14`,

  // Right canal houses and trees
  stepGable(800, 32, 76, 3),
  bellGable(834, 28, 64),
  stepGable(864, 38, 90, 4),
  stepGable(904, 28, 70, 2),
  bellGable(934, 30, 78),
  stepGable(966, 34, 66, 3),
  `M1018 ${BASE} V180 M1018 180 m-16 -10 a16 14 0 1 0 32 0 a16 14 0 1 0 -32 0`,
  `M1056 ${BASE} V176 M1056 176 m-20 -12 a20 18 0 1 0 40 0 a20 18 0 1 0 -40 0`,
  stepGable(1086, 30, 72, 3),
  bellGable(1118, 28, 60),
  stepGable(1148, 36, 84, 3),

  // Binnendieze: waterline, bridge arch, boat and reflections
  `M0 ${BASE} H1200`,
  `M980 ${BASE} Q1000 ${BASE + 18} 1020 ${BASE}`,
  `M560 ${BASE + 14} h56 l-6 8 h-44 Z M578 ${BASE + 14} v-6 h18 v6`,
  `M40 ${BASE + 12} h70 M180 ${BASE + 18} h40 M300 ${BASE + 10} h90 M430 ${BASE + 20} h60 M660 ${BASE + 12} h80 M820 ${BASE + 20} h50 M900 ${BASE + 10} h70 M1080 ${BASE + 16} h90`,
];

export function Skyline({ className, title = "Skyline van Den Bosch" }: { className?: string; title?: string }) {
  // On narrow screens the drawing is shown at double width, centred on the cathedral.
  return (
    <div className={cn("overflow-hidden", className)}>
      <svg
        viewBox="0 0 1200 230"
        preserveAspectRatio="xMidYMax meet"
        role="img"
        aria-label={title}
        className="skyline h-auto w-[200%] max-w-none -translate-x-1/4 sm:w-full sm:translate-x-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths.map((d, i) => (
          <path key={i} d={d} pathLength={1} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
    </div>
  );
}
