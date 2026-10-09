"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { easing } from "maath";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { IphoneModel, type PhoneModel } from "./model";
import {
  PARTS,
  REPAIR_LABELS,
  REPAIR_ORDER,
  STAGES,
  partProgress,
  smoothstep,
  type PartId,
  type RepairKey,
} from "./parts";
import type { ExplodeStore } from "./store";

const ACCENT = new THREE.Color("#3b82f6");
const ASSEMBLED_POSE = new THREE.Euler(0.16, -0.62, 0.08);
const EXPLODED_POSE = new THREE.Euler(-1.0, 0.24, 0.5);

type SceneProps = {
  store: ExplodeStore;
  compact: boolean;
  quality: "high" | "low";
};

export function ExplodedPhoneScene({ store, compact, quality }: SceneProps) {
  return (
    <>
      <StudioLighting />
      <Suspense fallback={null}>
        <IphoneModel>{(model) => <PhoneRig model={model} store={store} compact={compact} />}</IphoneModel>
      </Suspense>
      {quality === "high" && (
        <ContactShadows position={[0, -1.12, 0]} opacity={0.32} scale={5} blur={2.6} far={2.4} resolution={512} color="#1e3a8a" />
      )}
      <CameraRig store={store} compact={compact} />
    </>
  );
}

/** Soft studio lighting built from light formers: no external HDR files needed. */
function StudioLighting() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[2.5, 4, 3]} intensity={1.6} color="#ffffff" />
      <directionalLight position={[-3, 1.5, -2]} intensity={0.6} color="#bcd0ff" />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#c7d3e6"]} />
        <Lightformer form="rect" intensity={3} position={[0, 4, 2]} rotation={[Math.PI / 2, 0, 0]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={2.2} position={[-4, 1, 1]} rotation={[0, Math.PI / 2, 0]} scale={[3, 6, 1]} color="#dbe7ff" />
        <Lightformer form="rect" intensity={1.6} position={[4, 0, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[3, 6, 1]} />
        <Lightformer form="ring" intensity={1.2} position={[0, 0, -5]} scale={4} color="#93b4ff" />
        <Lightformer form="rect" intensity={1.4} position={[0, -3, 1]} rotation={[-Math.PI / 2, 0, 0]} scale={[6, 2, 1]} color="#eef2f9" />
      </Environment>
    </>
  );
}

/** Camera: gentle orbit while assembling, settles when exploded, focuses on a selected part. */
function CameraRig({ store, compact }: { store: ExplodeStore; compact: boolean }) {
  const { camera, size } = useThree();
  const target = useRef(new THREE.Vector3());
  const desired = useMemo(() => new THREE.Vector3(), []);
  const focusPoint = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const p = store.rendered;
    const aspect = size.width / size.height;
    // Keep the whole exploded stack in frame on narrow viewports.
    const fit = compact ? Math.max(1, 1.05 / aspect) : Math.max(1, 1.25 / aspect);
    const distance = (compact ? 5.6 : 5.1) * Math.min(fit, 1.9);
    const orbit = store.reducedMotion ? 0 : (1 - smoothstep(0.4, STAGES.poseEnd, p)) * Math.sin(p * Math.PI) * 0.6;
    desired.set(orbit, 0.12 + p * 0.18, distance);
    focusPoint.set(0, -0.02 * p, 0);

    const selected = store.getUi().selected;
    const anchor = selected ? state.scene.getObjectByName(`label-anchor-${selected}`) : null;
    if (anchor) {
      anchor.getWorldPosition(focusPoint);
      desired.set(focusPoint.x, focusPoint.y + 0.06, distance * 0.82);
      // Keep the part clear of the information card (right on desktop, bottom on mobile).
      if (compact) focusPoint.setY(focusPoint.y - 0.32);
      else focusPoint.setX(focusPoint.x + 0.42);
    }
    const smooth = store.reducedMotion ? 0.001 : 0.35;
    easing.damp3(camera.position, desired, smooth, delta);
    easing.damp3(target.current, focusPoint, smooth, delta);
    camera.lookAt(target.current);
  });
  return null;
}

type PartRuntime = {
  meshes: THREE.Mesh[];
  highlight: number;
  dim: number;
  pull: THREE.Vector3;
};

function PhoneRig({ model, store, compact }: { model: PhoneModel; store: ExplodeStore; compact: boolean }) {
  const root = useRef<THREE.Group>(null);
  const partRefs = useRef<Partial<Record<PartId, THREE.Group>>>({});
  const runtime = useRef<Partial<Record<PartId, PartRuntime>>>({});
  const intro = useRef(0);
  const pose = useMemo(() => new THREE.Quaternion(), []);
  const qa = useMemo(() => new THREE.Quaternion().setFromEuler(ASSEMBLED_POSE), []);
  const qb = useMemo(() => new THREE.Quaternion().setFromEuler(EXPLODED_POSE), []);
  const anchorRefs = useRef<Partial<Record<RepairKey, THREE.Group>>>({});
  const projected = useMemo(() => new THREE.Vector3(), []);
  const camLocal = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const { camera, size } = useThree();

  // Cache meshes per part and remember each material's base state.
  useEffect(() => {
    for (const spec of PARTS) {
      const group = partRefs.current[spec.id];
      if (!group) continue;
      const meshes: THREE.Mesh[] = [];
      group.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh);
      });
      for (const mesh of meshes) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const m of mats as THREE.MeshStandardMaterial[]) {
          if (m.userData.base) continue;
          m.userData.base = {
            emissive: m.emissive ? m.emissive.clone() : null,
            emissiveIntensity: m.emissiveIntensity ?? 1,
            opacity: m.opacity,
            transparent: m.transparent,
            depthWrite: m.depthWrite,
          };
        }
      }
      runtime.current[spec.id] = { meshes, highlight: 0, dim: 0, pull: new THREE.Vector3() };
    }
  }, [model]);

  useFrame((state, delta) => {
    if (!root.current) return;
    // Damped scroll progress; reversing is exact because state is derived from it.
    easing.damp(store, "rendered", store.progress, store.reducedMotion ? 0.001 : 0.18, delta);
    const p = store.rendered;
    intro.current = Math.min(1, intro.current + delta / 1.4);
    const introEase = 1 - Math.pow(1 - intro.current, 3);

    // Overall pose: from a 3/4 product shot to a tilted, burger-like layered stack.
    const poseT = smoothstep(0.08, STAGES.poseEnd, p);
    pose.slerpQuaternions(qa, qb, poseT);
    root.current.quaternion.copy(pose);
    const t = state.clock.elapsedTime;
    const idle = store.reducedMotion ? 0 : 1;
    root.current.rotateY(idle * (Math.sin(t * 0.35) * 0.04 * (1 - poseT * 0.7) - (1 - introEase) * 0.35));
    const offsetX = compact ? 0 : 0.62 - 0.12 * poseT;
    const offsetY = compact ? -0.32 : 0.04;
    root.current.position.set(offsetX, offsetY + idle * Math.sin(t * 0.8) * 0.018 - (1 - introEase) * 0.18, 0);
    const scale = (compact ? 0.78 : 0.88) * (0.94 + 0.06 * introEase);
    root.current.scale.setScalar(scale);

    const ui = store.getUi();
    const interactive = p >= STAGES.interactive;
    camLocal.copy(camera.position);
    root.current.worldToLocal(camLocal);

    for (const spec of PARTS) {
      const group = partRefs.current[spec.id];
      const rt = runtime.current[spec.id];
      if (!group || !rt) continue;
      const k = partProgress(spec, p);
      const center = model.centers[spec.id];
      const isSelected = !!ui.selected && spec.repair === ui.selected;
      const isHovered = interactive && !!ui.hovered && spec.repair === ui.hovered;

      // Selected part moves slightly towards the camera.
      tmp.set(center[0], center[1], center[2]).sub(camLocal).normalize().multiplyScalar(-0.16);
      easing.damp3(rt.pull, isSelected ? tmp : ZERO, 0.3, delta);
      group.position.set(
        center[0] + spec.explode[0] * k + rt.pull.x,
        center[1] + spec.explode[1] * k + rt.pull.y,
        center[2] + spec.explode[2] * k + rt.pull.z,
      );
      const r = spec.explodeRotation;
      if (r) group.rotation.set(r[0] * k, r[1] * k, r[2] * k);

      easing.damp(rt, "highlight", isHovered || isSelected ? 1 : 0, 0.15, delta);
      easing.damp(rt, "dim", ui.selected && !isSelected && spec.id !== "frame" ? 1 : ui.selected && spec.id === "frame" ? 0.6 : 0, 0.25, delta);
      applyMaterialState(rt);
    }

    // Project label anchors to screen space for the DOM label overlay.
    root.current.updateMatrixWorld();
    for (const key of REPAIR_ORDER) {
      const anchor = anchorRefs.current[key];
      if (!anchor) continue;
      anchor.getWorldPosition(projected).project(camera);
      store.setLabel(key, ((projected.x + 1) / 2) * size.width, ((1 - projected.y) / 2) * size.height, projected.z < 1);
    }
  });

  const onOver = (repair?: RepairKey) => (e: ThreeEvent<PointerEvent>) => {
    if (!repair || store.rendered < STAGES.interactive) return;
    e.stopPropagation();
    store.setHovered(repair);
    document.body.style.cursor = "pointer";
  };
  const onOut = (repair?: RepairKey) => () => {
    if (!repair) return;
    if (store.getUi().hovered === repair && !store.getUi().selected) store.setHovered(null);
    document.body.style.cursor = "";
  };
  const onClick = (repair?: RepairKey) => (e: ThreeEvent<MouseEvent>) => {
    if (!repair || store.rendered < STAGES.interactive) return;
    e.stopPropagation();
    store.setSelected(store.getUi().selected === repair ? null : repair);
  };

  useEffect(() => () => void (document.body.style.cursor = ""), []);

  return (
    <group ref={root} dispose={null}>
      {PARTS.map((spec) => (
        <group
          key={spec.id}
          ref={(g) => {
            if (g) partRefs.current[spec.id] = g;
          }}
          name={`part-${spec.id}`}
          onPointerOver={onOver(spec.repair)}
          onPointerOut={onOut(spec.repair)}
          onClick={onClick(spec.repair)}
        >
          {model.renderPart(spec.id)}
          {REPAIR_ORDER.filter((key) => REPAIR_LABELS[key].anchorPart === spec.id).map((key) => (
            <group
              key={key}
              name={`label-anchor-${key}`}
              position={REPAIR_LABELS[key].anchor as unknown as THREE.Vector3Tuple}
              ref={(g) => {
                if (g) anchorRefs.current[key] = g;
              }}
            />
          ))}
        </group>
      ))}
    </group>
  );
}

const ZERO = new THREE.Vector3();

function applyMaterialState(rt: PartRuntime) {
  for (const mesh of rt.meshes) {
    const mats = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as THREE.MeshStandardMaterial[];
    for (const m of mats) {
      const base = m.userData.base as
        | { emissive: THREE.Color | null; emissiveIntensity: number; opacity: number; transparent: boolean; depthWrite: boolean }
        | undefined;
      if (!base) continue;
      if (m.emissive && base.emissive) {
        const glowsAlready = base.emissive.r + base.emissive.g + base.emissive.b > 0.01;
        if (glowsAlready) {
          m.emissiveIntensity = base.emissiveIntensity + rt.highlight * 0.35;
        } else {
          m.emissive.copy(ACCENT).multiplyScalar(rt.highlight * 0.32);
        }
      }
      const opacity = base.opacity * (1 - rt.dim * 0.78);
      const transparent = base.transparent || rt.dim > 0.01;
      if (m.transparent !== transparent) {
        m.transparent = transparent;
        m.depthWrite = base.transparent ? base.depthWrite : !transparent;
        m.needsUpdate = true;
      }
      m.opacity = opacity;
    }
  }
}
