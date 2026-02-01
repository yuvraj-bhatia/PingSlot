"use client";

import { DitheringShader } from "./dithering-shader";

/**
 * DitheringBackground
 * 
 * A fixed full-screen dithering shader background for the landing page.
 * Uses the wave pattern with PingSlot's orange/black color scheme.
 */
export function DitheringBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <DitheringShader
        shape="wave"
        type="8x8"
        colorBack="#050505"
        colorFront="#FF8000"
        pxSize={3}
        speed={0.4}
        className="h-full w-full"
      />
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
    </div>
  );
}
