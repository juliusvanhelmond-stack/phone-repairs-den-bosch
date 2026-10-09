import { useSyncExternalStore } from "react";
import type { RepairKey } from "./parts";

/**
 * Tiny external store shared by the DOM overlay and the WebGL scene.
 *
 * - `progress` (scroll) is written on every scroll event and read inside
 *   `useFrame`; it never triggers React renders.
 * - `hovered` / `selected` change rarely and are subscribed to by the overlay.
 */
type UiState = { hovered: RepairKey | null; selected: RepairKey | null };

export type ExplodeStore = {
  /** Target scroll progress 0..1 (raw). */
  progress: number;
  /** Damped progress as rendered by the scene; read by the overlay for label opacity. */
  rendered: number;
  /** True when the user prefers reduced motion. */
  reducedMotion: boolean;
  /** Screen positions of label anchors (px, relative to the stage), written by the scene each frame. */
  labels: Record<RepairKey, { x: number; y: number; visible: boolean }>;
  setLabel: (key: RepairKey, x: number, y: number, visible: boolean) => void;
  setProgress: (p: number) => void;
  setReducedMotion: (reduced: boolean) => void;
  getUi: () => UiState;
  setHovered: (key: RepairKey | null) => void;
  setSelected: (key: RepairKey | null) => void;
  subscribe: (listener: () => void) => () => void;
};

export function createExplodeStore(): ExplodeStore {
  let ui: UiState = { hovered: null, selected: null };
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());
  const store: ExplodeStore = {
    progress: 0,
    rendered: 0,
    reducedMotion: false,
    labels: {
      display: { x: 0, y: 0, visible: false },
      battery: { x: 0, y: 0, visible: false },
      camera: { x: 0, y: 0, visible: false },
      backGlass: { x: 0, y: 0, visible: false },
      chargingPort: { x: 0, y: 0, visible: false },
    },
    setLabel: (key, x, y, visible) => {
      const label = store.labels[key];
      label.x = x;
      label.y = y;
      label.visible = visible;
    },
    setProgress: (p) => {
      store.progress = p;
    },
    setReducedMotion: (reduced) => {
      store.reducedMotion = reduced;
      if (reduced) {
        store.progress = 1;
        store.rendered = 1;
      }
    },
    getUi: () => ui,
    setHovered: (hovered) => {
      if (ui.hovered === hovered) return;
      ui = { ...ui, hovered };
      emit();
    },
    setSelected: (selected) => {
      if (ui.selected === selected) return;
      ui = { ...ui, selected, hovered: selected ?? ui.hovered };
      emit();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  return store;
}

const serverUi: UiState = { hovered: null, selected: null };

export function useExplodeUi(store: ExplodeStore) {
  return useSyncExternalStore(store.subscribe, store.getUi, () => serverUi);
}
