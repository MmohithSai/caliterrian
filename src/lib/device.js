import { useSyncExternalStore } from "react";

// Device/preference probes shared by every effect-heavy component. All are
// window-guarded so they return the "cheap" answer during SSR prerendering,
// which is also the safe default for a first paint.

export const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

// No hover/fine pointer → mouse-driven canvases have nothing to react to.
export const coarsePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(pointer: coarse)").matches === true;

export const saveData = () =>
  typeof navigator !== "undefined" && navigator.connection?.saveData === true;

// "Don't spin up WebGL / rAF here": the user asked for less motion, is on a
// metered connection, or the device has little memory to spare.
export const lowPower = () =>
  reducedMotion() ||
  saveData() ||
  (typeof navigator !== "undefined" && navigator.deviceMemory > 0 && navigator.deviceMemory <= 4);

const subscribeNever = () => () => {};

// Returns `fallback` during SSR and through hydration, then fn() once mounted.
// useSyncExternalStore's getServerSnapshot is also what React uses for the
// hydration pass, so server and client markup can never disagree — the real
// value lands in a follow-up render.
export function useClientValue(fn, fallback) {
  return useSyncExternalStore(subscribeNever, fn, () => fallback);
}
