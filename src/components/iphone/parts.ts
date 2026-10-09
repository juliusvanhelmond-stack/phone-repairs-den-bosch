/**
 * Part manifest for the exploded-view phone.
 *
 * Units: 1 = 10 cm (iPhone 17: 71.5 × 149.6 × 7.95 mm → 0.715 × 1.496 × 0.0795).
 * Local axes: +Y up (top of the phone), +Z towards the front glass.
 *
 * Every part separates along its own window of the scroll progress, so the
 * phone opens in a believable order (glass first, internals last) and closes
 * again in exact reverse when scrolling back.
 *
 * `nodeNames` maps a part to node names in a production GLB model; see
 * docs/3d-model-requirements.md. The stand-in model ignores it.
 */
export type Vec3 = readonly [number, number, number];

export type PartId =
  | "frontGlass"
  | "display"
  | "midframe"
  | "frame"
  | "logicBoard"
  | "battery"
  | "camera"
  | "chargingPort"
  | "backGlass";

export type RepairKey = "display" | "battery" | "camera" | "backGlass" | "chargingPort";

export type PartSpec = {
  id: PartId;
  /** Dutch component name (shown in tooltips / accessible names). */
  name: string;
  /** Offset applied when fully exploded, relative to the assembled position. */
  explode: Vec3;
  /** Extra rotation when fully exploded (radians), for a livelier composition. */
  explodeRotation?: Vec3;
  /** Scroll-progress window [start, end] in which this part travels. */
  window: readonly [number, number];
  /** Which repair this part opens; parts sharing a repair highlight together. */
  repair?: RepairKey;
  /** Node names in a production GLB that belong to this part. */
  nodeNames: readonly string[];
};

export const PARTS: readonly PartSpec[] = [
  {
    id: "frontGlass",
    name: "Voorglas",
    explode: [0, 0, 0.62],
    window: [0.14, 0.5],
    repair: "display",
    nodeNames: ["front_glass", "FrontGlass"],
  },
  {
    id: "display",
    name: "OLED-display",
    explode: [0, 0, 0.42],
    window: [0.16, 0.54],
    repair: "display",
    nodeNames: ["display", "oled_display", "Display"],
  },
  {
    id: "midframe",
    name: "Middenframe",
    explode: [0, 0, 0.22],
    window: [0.2, 0.58],
    nodeNames: ["midframe", "MidFrame"],
  },
  {
    id: "frame",
    name: "Aluminium behuizing",
    explode: [0, 0, 0],
    window: [0, 1],
    nodeNames: ["frame", "housing", "Frame"],
  },
  {
    id: "logicBoard",
    name: "Logic board",
    explode: [0.04, 0.06, -0.2],
    window: [0.3, 0.68],
    nodeNames: ["logic_board", "LogicBoard"],
  },
  {
    id: "battery",
    name: "Batterij",
    explode: [-0.02, -0.04, -0.38],
    window: [0.28, 0.66],
    repair: "battery",
    nodeNames: ["battery", "Battery"],
  },
  {
    id: "camera",
    name: "Cameramodule",
    explode: [-0.34, 0.12, -0.56],
    explodeRotation: [0, 0, 0.12],
    window: [0.24, 0.64],
    repair: "camera",
    nodeNames: ["camera_module", "rear_camera", "Camera"],
  },
  {
    id: "chargingPort",
    name: "Oplaadpoort",
    explode: [0.1, -0.34, -0.12],
    window: [0.34, 0.72],
    repair: "chargingPort",
    nodeNames: ["charging_port", "usb_c", "ChargingPort"],
  },
  {
    id: "backGlass",
    name: "Achterglas",
    explode: [0, 0, -0.78],
    window: [0.12, 0.52],
    repair: "backGlass",
    nodeNames: ["back_glass", "BackGlass"],
  },
];

/** Label anchors (local, assembled coordinates) and which side the label sits on. */
export const REPAIR_LABELS: Record<
  RepairKey,
  { label: string; shortLabel: string; anchorPart: PartId; anchor: Vec3; side: "left" | "right" }
> = {
  display: { label: "Scherm reparatie", shortLabel: "Scherm", anchorPart: "display", anchor: [0.36, 0.3, 0.02], side: "right" },
  battery: { label: "Batterij vervangen", shortLabel: "Batterij", anchorPart: "battery", anchor: [-0.3, -0.1, 0], side: "left" },
  camera: { label: "Camera reparatie", shortLabel: "Camera", anchorPart: "camera", anchor: [-0.1, 0.06, -0.02], side: "left" },
  backGlass: { label: "Achterkant reparatie", shortLabel: "Achterkant", anchorPart: "backGlass", anchor: [-0.3, -0.3, 0], side: "left" },
  chargingPort: { label: "Oplaadpoort reparatie", shortLabel: "Oplaadpoort", anchorPart: "chargingPort", anchor: [0.06, -0.02, 0], side: "right" },
};

/** Maps a repair key to the repair service id used on the site (src/data/repairs.json). */
export const REPAIR_SERVICE_IDS: Record<RepairKey, string> = {
  display: "scherm-vervangen",
  battery: "batterij-vervangen",
  camera: "camera-repareren",
  backGlass: "achterkant-vervangen",
  chargingPort: "oplaadpoort-repareren",
};

export const REPAIR_ORDER: readonly RepairKey[] = ["display", "battery", "camera", "backGlass", "chargingPort"];

/** Stage boundaries of the overall scroll progress. */
export const STAGES = {
  /** Camera turns towards the exploded pose until here. */
  poseEnd: 0.6,
  /** Labels fade in between these points. */
  labelsStart: 0.74,
  labelsEnd: 0.86,
  /** From here the exploded view is interactive. */
  interactive: 0.8,
} as const;

export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/** Ease-in-out with a softer start and end than smoothstep, for part travel. */
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const partProgress = (part: PartSpec, progress: number) =>
  easeInOutCubic(smoothstep(part.window[0], part.window[1], progress));
