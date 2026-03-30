"use client";

import dynamic from "next/dynamic";

const Dither = dynamic(() => import("@/components/Dither"), {
  ssr: false,
  loading: () => null,
});

/** Grayscale (R=G=B) for dark login; shader mixes black → this tone. */
const WAVE_COLOR: [number, number, number] = [0.34, 0.34, 0.34];

/**
 * Full-viewport dither shader background for auth screens.
 * WebGL is client-only; the canvas is loaded dynamically.
 */
export function LoginDitherBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 isolate bg-neutral-950"
      aria-hidden
    >
      <Dither
        colorNum={4}
        disableAnimation={false}
        enableMouseInteraction={false}
        mouseRadius={1}
        pixelSize={2}
        waveAmplitude={0.32}
        waveColor={WAVE_COLOR}
        waveFrequency={2.8}
        waveSpeed={0.045}
      />
    </div>
  );
}
