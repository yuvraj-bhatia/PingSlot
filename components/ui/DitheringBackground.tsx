"use client";

import { DitheringShader } from "./DitheringShader";

/**
 * DitheringBackground
 * 
 * Electric Cyan-accented dithering with subtle motion.
 * Professional, fintech-inspired aesthetic.
 * Visible enough to add atmosphere, subtle enough not to distract.
 */
export function DitheringBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Base gradient - deep black */}
      <div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #0a0a0a 0%, #080808 50%, #0a0a0a 100%)",
        }}
      />
      
      {/* Dithering layer - cyan tinted with visible motion */}
      <div className="absolute inset-0 opacity-[0.06]">
        <DitheringShader
          shape="simplex"
          type="8x8"
          colorBack="#000000"
          colorFront="#00D4FF"
          pxSize={2}
          speed={0.04}
          className="h-full w-full"
        />
      </div>
      
      {/* Secondary violet dithering for depth */}
      <div className="absolute inset-0 opacity-[0.04]">
        <DitheringShader
          shape="simplex"
          type="8x8"
          colorBack="#000000"
          colorFront="#7C3AED"
          pxSize={3}
          speed={0.02}
          className="h-full w-full"
        />
      </div>
      
      {/* Subtle vignette for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 120% 100% at 50% 0%, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </div>
  );
}
