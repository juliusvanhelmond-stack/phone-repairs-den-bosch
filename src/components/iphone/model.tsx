"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { MODEL_URL } from "./config";
import { PARTS, type PartId, type Vec3 } from "./parts";
import { STANDIN_CENTERS, StandInPart } from "./stand-in-phone";

/**
 * A phone model exposes the assembled centre of every part and renders each
 * part relative to that centre. The scene animates parts by moving their
 * groups, so stand-in and production GLB models are interchangeable.
 */
export type PhoneModel = {
  kind: "stand-in" | "glb";
  centers: Record<PartId, Vec3>;
  renderPart: (id: PartId) => ReactNode;
};


const STAND_IN: PhoneModel = {
  kind: "stand-in",
  centers: STANDIN_CENTERS,
  renderPart: (id) => <StandInPart id={id} />,
};

export function IphoneModel({ children }: { children: (model: PhoneModel) => ReactNode }) {
  if (!MODEL_URL) return <>{children(STAND_IN)}</>;
  return <GlbModel url={MODEL_URL}>{children}</GlbModel>;
}

/** Target phone height in scene units (1 = 10 cm). */
const PHONE_HEIGHT = 1.496;

function GlbModel({ url, children }: { url: string; children: (model: PhoneModel) => ReactNode }) {
  const gltf = useGLTF(url, false, true);
  const model = useMemo(() => buildGlbModel(gltf.scene), [gltf.scene]);
  return <>{children(model)}</>;
}

/**
 * Splits a GLB scene into part groups using the node names listed in the part
 * manifest. Each part's meshes are cloned with their world transform baked in,
 * normalised to PHONE_HEIGHT and re-centred around the part's own centre.
 */
export function buildGlbModel(scene: THREE.Object3D): PhoneModel {
  scene.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const middle = box.getCenter(new THREE.Vector3());
  const scale = PHONE_HEIGHT / Math.max(size.y, 1e-6);
  const normalise = new THREE.Matrix4().makeScale(scale, scale, scale).multiply(new THREE.Matrix4().makeTranslation(-middle.x, -middle.y, -middle.z));

  const centers = {} as Record<PartId, Vec3>;
  const groups = {} as Record<PartId, THREE.Group>;
  const missing: PartId[] = [];

  for (const spec of PARTS) {
    const group = new THREE.Group();
    group.name = `glb-${spec.id}`;
    const nodes = spec.nodeNames.map((n) => scene.getObjectByName(n)).filter((n): n is THREE.Object3D => !!n);
    if (!nodes.length) missing.push(spec.id);
    for (const node of nodes) {
      node.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        const clone = new THREE.Mesh(
          mesh.geometry,
          Array.isArray(mesh.material) ? mesh.material.map((m) => m.clone()) : mesh.material.clone(),
        );
        clone.applyMatrix4(new THREE.Matrix4().multiplyMatrices(normalise, mesh.matrixWorld));
        clone.castShadow = true;
        group.add(clone);
      });
    }
    const partBox = new THREE.Box3().setFromObject(group);
    const c = partBox.isEmpty() ? new THREE.Vector3() : partBox.getCenter(new THREE.Vector3());
    group.children.forEach((child) => child.position.sub(c));
    centers[spec.id] = [c.x, c.y, c.z];
    groups[spec.id] = group;
  }

  if (missing.length && process.env.NODE_ENV !== "production") {
    console.warn(`[iphone] GLB is missing nodes for parts: ${missing.join(", ")} (see docs/3d-model-requirements.md)`);
  }

  return {
    kind: "glb",
    centers,
    renderPart: (id) => <primitive object={groups[id]} />,
  };
}
