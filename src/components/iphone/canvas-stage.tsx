"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import * as THREE from "three";
import { ExplodedPhoneScene } from "./scene";
import type { ExplodeStore } from "./store";

/** WebGL canvas. Loaded lazily (no SSR) by the experience component. */
export default function CanvasStage({
  store,
  compact,
  active,
  onReady,
}: {
  store: ExplodeStore;
  compact: boolean;
  active: boolean;
  onReady: () => void;
}) {
  const lowPowerDevice = typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 8) <= 4;
  const [dpr, setDpr] = useState(compact ? 1.25 : 1.75);
  const [quality, setQuality] = useState<"high" | "low">(compact || lowPowerDevice ? "low" : "high");

  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 28, position: [0, 0.12, 5.4], near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.setClearColor(0x000000, 0);
        // Reveal after the first frame has rendered, so there is no flash.
        requestAnimationFrame(() => requestAnimationFrame(onReady));
      }}
      onPointerMissed={() => store.setSelected(null)}
      style={{ touchAction: "pan-y" }}
      aria-hidden
    >
      <PerformanceMonitor
        onDecline={() => {
          setDpr(1);
          setQuality("low");
        }}
      />
      <ExplodedPhoneScene store={store} compact={compact} quality={quality} />
    </Canvas>
  );
}
