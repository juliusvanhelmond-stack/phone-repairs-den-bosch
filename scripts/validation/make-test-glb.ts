/**
 * Generates a synthetic GLB with the node names from the part manifest, to test
 * the production-model loading path (NOT a phone model; plain boxes).
 * Usage: npx tsx scripts/validation/make-test-glb.ts [out=public/models/test-parts.glb]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { PARTS } from "../../src/components/iphone/parts";

// Minimal FileReader polyfill for GLTFExporter's binary output in Node.
class NodeFileReader {
  result: ArrayBuffer | null = null;
  onloadend: (() => void) | null = null;
  readAsArrayBuffer(blob: Blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf;
      this.onloadend?.();
    });
  }
  readAsDataURL(blob: Blob) {
    blob.arrayBuffer().then((buf) => {
      (this as unknown as { result: string }).result = `data:${blob.type};base64,${Buffer.from(buf).toString("base64")}`;
      this.onloadend?.();
    });
  }
}
(globalThis as unknown as { FileReader: unknown }).FileReader = NodeFileReader;

const out = process.argv[2] ?? "public/models/test-parts.glb";
const scene = new THREE.Scene();
// Authored in metres like a real asset: 0.0715 × 0.1496 × 0.0079.
const z: Record<string, number> = { backGlass: -0.0035, camera: -0.0045, battery: -0.0006, logicBoard: 0.0006, frame: 0, chargingPort: 0, midframe: 0.0024, display: 0.003, frontGlass: 0.0037 };
const colors = ["#94a3b8", "#1e293b", "#64748b", "#cbd5e1", "#0f766e", "#334155", "#475569", "#c2410c", "#a5b4fc"];
PARTS.forEach((part, i) => {
  const size =
    part.id === "camera" ? [0.02, 0.04, 0.002] : part.id === "chargingPort" ? [0.01, 0.003, 0.003] : part.id === "battery" ? [0.056, 0.078, 0.004] : part.id === "logicBoard" ? [0.058, 0.034, 0.001] : [0.0715, 0.1496, 0.0006];
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), new THREE.MeshStandardMaterial({ color: colors[i % colors.length] }));
  mesh.name = part.nodeNames[0];
  mesh.position.set(part.id === "camera" ? -0.02 : 0, part.id === "camera" ? 0.052 : part.id === "chargingPort" ? -0.07 : part.id === "logicBoard" ? 0.044 : part.id === "battery" ? -0.02 : 0, z[part.id] ?? 0);
  scene.add(mesh);
});

new GLTFExporter().parse(
  scene,
  (result) => {
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, Buffer.from(result as ArrayBuffer));
    console.log(`Wrote ${out}`);
  },
  (err) => {
    console.error(err);
    process.exit(1);
  },
  { binary: true },
);
