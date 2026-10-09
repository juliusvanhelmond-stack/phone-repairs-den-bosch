"use client";

/**
 * STAND-IN MODEL — not a licensed or technically accurate iPhone 17.
 *
 * A carefully proportioned, procedurally modelled phone (iPhone 17 outer
 * dimensions, dual vertical camera plateau, USB-C) so the exploded-view
 * experience can be built and tested. The internal layout is a simplified,
 * generic representation. Replace it with a licensed GLB model; see
 * docs/3d-model-requirements.md. `IphoneModel` switches automatically when
 * NEXT_PUBLIC_IPHONE_MODEL_URL is set.
 */
import { RoundedBox } from "@react-three/drei";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import * as THREE from "three";
import type { PartId, Vec3 } from "./parts";

const W = 0.715;
const H = 1.496;
const T = 0.0795;
const R = 0.1;

/** Assembled centre of each part in phone space; parts render relative to it. */
export const STANDIN_CENTERS: Record<PartId, Vec3> = {
  frontGlass: [0, 0, 0.0365],
  display: [0, 0, 0.0305],
  midframe: [0, 0, 0.0235],
  frame: [0, 0, 0],
  logicBoard: [0, 0.44, 0.006],
  battery: [0, -0.2, -0.006],
  camera: [-0.2, 0.52, -0.036],
  chargingPort: [0, -0.7, 0],
  backGlass: [0, 0, -0.0345],
};

function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Hook that creates a material once per mount and disposes it on unmount. */
function useMaterial<T extends THREE.Material>(factory: () => T): T {
  const [material] = useState(factory);
  useEffect(() => () => material.dispose(), [material]);
  return material;
}

/** Frosted, slightly tinted glass (iPhone 17 "Mist Blue" inspired). */
const BODY_TINT = "#b7c4d6";

function Slab({
  w,
  h,
  d,
  r,
  material,
  position = [0, 0, 0],
}: {
  w: number;
  h: number;
  d: number;
  r: number;
  material: THREE.Material;
  position?: Vec3;
}) {
  return (
    <RoundedBox args={[w, h, d]} radius={Math.min(r, d / 2 - 0.0001)} smoothness={6} bevelSegments={3} position={position} material={material} castShadow />
  );
}

function FlatRounded({ w, h, r, d, material, position = [0, 0, 0] }: { w: number; h: number; r: number; d: number; material: THREE.Material; position?: Vec3 }) {
  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRectShape(w, h, r), {
      depth: d,
      bevelEnabled: true,
      bevelThickness: d * 0.35,
      bevelSize: Math.min(0.004, r * 0.2),
      bevelSegments: 4,
      curveSegments: 24,
    });
    g.translate(0, 0, -d / 2);
    // ExtrudeGeometry UVs are in shape units; normalise to 0..1 so textures fit the panel.
    const uv = g.attributes.uv as THREE.BufferAttribute;
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
    uv.needsUpdate = true;
    return g;
  }, [w, h, r, d]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} material={material} position={position as unknown as THREE.Vector3Tuple} castShadow />;
}

function useScreenTexture() {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 1072;
    const ctx = c.getContext("2d")!;
    const bg = ctx.createLinearGradient(0, 0, 380, 1072);
    bg.addColorStop(0, "#22345a");
    bg.addColorStop(0.55, "#111c33");
    bg.addColorStop(1, "#0a0f1c");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, c.width, c.height);
    const glow = ctx.createRadialGradient(140, 220, 10, 140, 220, 520);
    glow.addColorStop(0, "rgba(59,130,246,0.55)");
    glow.addColorStop(1, "rgba(37,99,235,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, c.width, c.height);
    // Dynamic Island
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.roundRect(196, 30, 120, 36, 18);
    ctx.fill();
    // Clock
    ctx.fillStyle = "rgba(255,255,255,0.94)";
    ctx.font = "600 128px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("9:41", 256, 300);
    ctx.font = "500 30px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("donderdag 9 oktober", 256, 160);
    // Widgets
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.beginPath();
    ctx.roundRect(48, 760, 196, 196, 40);
    ctx.roundRect(268, 760, 196, 196, 40);
    ctx.fill();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function FrontGlass() {
  const material = useMaterial(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#1c2a40",
        roughness: 0.02,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        transparent: true,
        opacity: 0.2,
        envMapIntensity: 2.6,
      }),
  );
  return <Slab w={W - 0.004} h={H - 0.004} d={0.006} r={R - 0.002} material={material} />;
}

function Display() {
  const map = useScreenTexture();
  const panel = useMaterial(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#000000",
        emissive: new THREE.Color("#ffffff"),
        emissiveMap: map,
        emissiveIntensity: 1,
        roughness: 0.35,
        metalness: 0,
      }),
  );
  const backing = useMaterial(() => new THREE.MeshStandardMaterial({ color: "#05070b", roughness: 0.6 }));
  const flex = useMaterial(() => new THREE.MeshStandardMaterial({ color: "#c77a12", roughness: 0.45, metalness: 0.3 }));
  return (
    <group>
      <FlatRounded w={W - 0.03} h={H - 0.03} r={R - 0.016} d={0.002} material={panel} position={[0, 0, 0.0012]} />
      <Slab w={W - 0.026} h={H - 0.026} d={0.0028} r={R - 0.014} material={backing} position={[0, 0, -0.0012]} />
      <mesh material={flex} position={[0.18, -0.62, -0.003]}>
        <boxGeometry args={[0.12, 0.08, 0.0012]} />
      </mesh>
    </group>
  );
}

function Midframe() {
  const plate = useMaterial(() => new THREE.MeshStandardMaterial({ color: "#8d97a5", metalness: 0.9, roughness: 0.38 }));
  const shield = useMaterial(() => new THREE.MeshStandardMaterial({ color: "#c3cad4", metalness: 1, roughness: 0.22 }));
  return (
    <group>
      <FlatRounded w={W - 0.034} h={H - 0.034} r={R - 0.018} d={0.0018} material={plate} />
      {[-0.42, -0.14, 0.14, 0.42].map((y) => (
        <mesh key={y} material={shield} position={[0, y, -0.0016]}>
          <boxGeometry args={[W - 0.08, 0.006, 0.0016]} />
        </mesh>
      ))}
    </group>
  );
}

function Frame() {
  const geometry = useMemo(() => {
    const outer = roundedRectShape(W, H, R);
    const inner = roundedRectShape(W - 0.022, H - 0.022, R - 0.011);
    outer.holes.push(new THREE.Path(inner.getPoints(48).reverse()));
    const g = new THREE.ExtrudeGeometry(outer, {
      depth: T - 0.012,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.005,
      bevelSegments: 8,
      curveSegments: 48,
    });
    g.translate(0, 0, -(T - 0.012) / 2);
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const aluminium = useMaterial(
    () => new THREE.MeshPhysicalMaterial({ color: BODY_TINT, metalness: 1, roughness: 0.26, clearcoat: 0.3, envMapIntensity: 1.3 }),
  );
  const buttons = useMaterial(() => new THREE.MeshStandardMaterial({ color: BODY_TINT, metalness: 1, roughness: 0.3 }));
  return (
    <group>
      <mesh geometry={geometry} material={aluminium} castShadow />
      {/* Volume, action button (left) and side button + camera control (right) */}
      <Slab w={0.012} h={0.12} d={0.022} r={0.005} material={buttons} position={[-W / 2 - 0.004, 0.3, 0]} />
      <Slab w={0.012} h={0.12} d={0.022} r={0.005} material={buttons} position={[-W / 2 - 0.004, 0.15, 0]} />
      <Slab w={0.012} h={0.06} d={0.022} r={0.005} material={buttons} position={[-W / 2 - 0.004, 0.46, 0]} />
      <Slab w={0.012} h={0.18} d={0.022} r={0.005} material={buttons} position={[W / 2 + 0.004, 0.26, 0]} />
      <Slab w={0.01} h={0.1} d={0.02} r={0.005} material={buttons} position={[W / 2 + 0.003, -0.15, 0]} />
    </group>
  );
}

function LogicBoard() {
  const pcb = useMaterial(() => new THREE.MeshStandardMaterial({ color: "#13262a", roughness: 0.55, metalness: 0.2 }));
  const shield = useMaterial(() => new THREE.MeshStandardMaterial({ color: "#aeb6c1", metalness: 1, roughness: 0.3 }));
  const chip = useMaterial(() => new THREE.MeshStandardMaterial({ color: "#16181d", roughness: 0.4, metalness: 0.4 }));
  const gold = useMaterial(() => new THREE.MeshStandardMaterial({ color: "#c9a24a", metalness: 1, roughness: 0.3 }));
  return (
    <group>
      <Slab w={0.58} h={0.34} d={0.006} r={0.03} material={pcb} />
      <Slab w={0.24} h={0.2} d={0.006} r={0.012} material={shield} position={[0.13, 0.03, 0.005]} />
      <Slab w={0.16} h={0.12} d={0.006} r={0.012} material={shield} position={[-0.16, -0.07, 0.005]} />
      <Slab w={0.1} h={0.1} d={0.004} r={0.01} material={chip} position={[-0.08, 0.09, 0.004]} />
      <Slab w={0.06} h={0.06} d={0.004} r={0.008} material={chip} position={[0.06, -0.12, 0.004]} />
      {[-0.24, -0.2, -0.16].map((x) => (
        <mesh key={x} material={gold} position={[x, 0.12, 0.004]}>
          <cylinderGeometry args={[0.008, 0.008, 0.003, 16]} />
        </mesh>
      ))}
    </group>
  );
}

function Battery() {
  const cell = useMaterial(() => new THREE.MeshStandardMaterial({ color: "#232a35", roughness: 0.42, metalness: 0.35 }));
  const label = useMaterial(() => new THREE.MeshStandardMaterial({ color: "#2f3846", roughness: 0.6 }));
  const tab = useMaterial(() => new THREE.MeshStandardMaterial({ color: "#c77a12", roughness: 0.45, metalness: 0.3 }));
  return (
    <group>
      <Slab w={0.56} h={0.78} d={0.04} r={0.04} material={cell} />
      <Slab w={0.46} h={0.32} d={0.002} r={0.02} material={label} position={[0, 0.05, 0.0205]} />
      <mesh material={tab} position={[0.18, 0.41, 0.012]}>
        <boxGeometry args={[0.1, 0.06, 0.002]} />
      </mesh>
    </group>
  );
}

function Camera() {
  const plateau = useMaterial(
    () => new THREE.MeshPhysicalMaterial({ color: BODY_TINT, roughness: 0.18, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08 }),
  );
  const ring = useMaterial(() => new THREE.MeshStandardMaterial({ color: "#a9b3c1", metalness: 1, roughness: 0.18 }));
  const lens = useMaterial(
    () => new THREE.MeshPhysicalMaterial({ color: "#0b1426", roughness: 0.05, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2 }),
  );
  const sensor = useMaterial(() => new THREE.MeshStandardMaterial({ color: "#6b7482", roughness: 0.35, metalness: 0.9 }));
  const flash = useMaterial(() => new THREE.MeshStandardMaterial({ color: "#f3ead4", roughness: 0.3, emissive: "#3a3426" }));
  const lenses: Vec3[] = [
    [0, 0.085, 0],
    [0, -0.085, 0],
  ];
  return (
    <group>
      {/* Raised pill-shaped plateau (back side faces -Z) */}
      <Slab w={0.215} h={0.42} d={0.012} r={0.1} material={plateau} position={[0, 0, -0.008]} />
      {lenses.map((p) => (
        <group key={p[1]} position={p as unknown as THREE.Vector3Tuple} rotation={[Math.PI / 2, 0, 0]}>
          <mesh material={ring} position={[0, -0.02, 0]}>
            <cylinderGeometry args={[0.072, 0.072, 0.016, 48]} />
          </mesh>
          <mesh material={lens} position={[0, -0.029, 0]}>
            <cylinderGeometry args={[0.058, 0.058, 0.004, 48]} />
          </mesh>
          {/* Sensor module behind the lens, visible when exploded */}
          <mesh material={sensor} position={[0, 0.012, 0]}>
            <cylinderGeometry args={[0.062, 0.066, 0.03, 40]} />
          </mesh>
        </group>
      ))}
      <mesh material={flash} position={[0.075, 0.0, -0.016]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.006, 24]} />
      </mesh>
    </group>
  );
}

function ChargingPort() {
  const metal = useMaterial(() => new THREE.MeshStandardMaterial({ color: "#c7ced8", metalness: 1, roughness: 0.25 }));
  const flex = useMaterial(() => new THREE.MeshStandardMaterial({ color: "#c77a12", roughness: 0.45, metalness: 0.3 }));
  const speaker = useMaterial(() => new THREE.MeshStandardMaterial({ color: "#20252d", roughness: 0.5, metalness: 0.4 }));
  return (
    <group>
      <Slab w={0.09} h={0.03} d={0.03} r={0.012} material={metal} />
      <mesh material={flex} position={[0, 0.07, 0]}>
        <boxGeometry args={[0.36, 0.1, 0.0016]} />
      </mesh>
      <Slab w={0.12} h={0.07} d={0.024} r={0.01} material={speaker} position={[-0.2, 0.05, -0.004]} />
      <Slab w={0.12} h={0.07} d={0.024} r={0.01} material={speaker} position={[0.2, 0.05, -0.004]} />
    </group>
  );
}

function BackGlass() {
  const glass = useMaterial(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#9fb3cf",
        roughness: 0.32,
        metalness: 0.1,
        clearcoat: 0.8,
        clearcoatRoughness: 0.3,
        sheen: 0.3,
        sheenColor: new THREE.Color("#dbe5f2"),
      }),
  );
  return <Slab w={W - 0.004} h={H - 0.004} d={0.006} r={R - 0.002} material={glass} />;
}

const COMPONENTS: Record<PartId, () => ReactNode> = {
  frontGlass: FrontGlass,
  display: Display,
  midframe: Midframe,
  frame: Frame,
  logicBoard: LogicBoard,
  battery: Battery,
  camera: Camera,
  chargingPort: ChargingPort,
  backGlass: BackGlass,
};

export function StandInPart({ id }: { id: PartId }) {
  const Component = COMPONENTS[id];
  return <Component />;
}
