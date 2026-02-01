"use client";

import { useCallback, useEffect, useRef, memo } from "react";
import { cn } from "../../lib/cn";

interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: "default" | "accent" | "teal" | "success";
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  borderWidth?: number;
}

/**
 * Interactive glowing border effect that follows cursor position.
 * Wrap around a card or container to add a dynamic glow effect.
 */
const GlowingEffect = memo(function GlowingEffect({
  blur = 0,
  inactiveZone = 0.7,
  proximity = 0,
  spread = 20,
  variant = "default",
  glow = false,
  className,
  borderWidth = 2,
  disabled = true,
}: GlowingEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPosition = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);
  const currentAngleRef = useRef(0);

  const gradients = {
    // McLaren Papaya Orange - signature color
    default: `
      radial-gradient(circle, rgba(255, 128, 0, 0.95) 10%, transparent 20%),
      radial-gradient(circle at 40% 40%, rgba(255, 144, 32, 0.75) 5%, transparent 15%),
      repeating-conic-gradient(
        from 0deg at 50% 50%,
        rgba(255, 128, 0, 0.95) 0%,
        rgba(255, 144, 32, 0.8) 5%,
        rgba(230, 115, 0, 0.6) 10%,
        rgba(255, 144, 32, 0.8) 15%,
        rgba(255, 128, 0, 0.95) 20%
      )
    `,
    // Intense Papaya Orange
    accent: `
      radial-gradient(circle, rgba(255, 128, 0, 1) 10%, transparent 20%),
      repeating-conic-gradient(
        from 0deg at 50% 50%,
        rgba(255, 128, 0, 1) 0%,
        rgba(230, 115, 0, 0.9) 10%,
        rgba(255, 128, 0, 1) 20%
      )
    `,
    // McLaren Racing Blue - ENHANCED with more prominent glow
    teal: `
      radial-gradient(circle, rgba(0, 150, 255, 1) 10%, rgba(0, 119, 255, 0.8) 15%, transparent 25%),
      radial-gradient(circle at 60% 60%, rgba(0, 200, 255, 0.9) 5%, rgba(0, 180, 255, 0.6) 10%, transparent 20%),
      radial-gradient(circle at 30% 70%, rgba(0, 140, 220, 0.85) 5%, transparent 18%),
      repeating-conic-gradient(
        from 0deg at 50% 50%,
        rgba(0, 150, 255, 1) 0%,
        rgba(0, 200, 255, 0.95) 3%,
        rgba(0, 119, 255, 0.9) 6%,
        rgba(0, 180, 255, 0.95) 9%,
        rgba(0, 140, 220, 0.85) 12%,
        rgba(0, 200, 255, 0.95) 15%,
        rgba(0, 150, 255, 1) 20%
      )
    `,
    // Success - Racing green
    success: `
      radial-gradient(circle, rgba(34, 197, 94, 0.9) 10%, transparent 20%),
      repeating-conic-gradient(
        from 0deg at 50% 50%,
        rgba(34, 197, 94, 0.9) 0%,
        rgba(74, 222, 128, 0.7) 10%,
        rgba(34, 197, 94, 0.9) 20%
      )
    `,
  };

  const handleMove = useCallback(
    (e?: MouseEvent | { x: number; y: number }) => {
      if (!containerRef.current) return;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        const element = containerRef.current;
        if (!element) return;

        const { left, top, width, height } = element.getBoundingClientRect();
        const mouseX = e?.x ?? lastPosition.current.x;
        const mouseY = e?.y ?? lastPosition.current.y;

        if (e) {
          lastPosition.current = { x: mouseX, y: mouseY };
        }

        const center = [left + width * 0.5, top + height * 0.5];
        const distanceFromCenter = Math.hypot(
          mouseX - center[0],
          mouseY - center[1]
        );
        const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

        if (distanceFromCenter < inactiveRadius) {
          element.style.setProperty("--active", "0");
          return;
        }

        const isActive =
          mouseX > left - proximity &&
          mouseX < left + width + proximity &&
          mouseY > top - proximity &&
          mouseY < top + height + proximity;

        element.style.setProperty("--active", isActive ? "1" : "0");

        if (!isActive) return;

        const targetAngle =
          (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) / Math.PI +
          90;

        const angleDiff =
          ((targetAngle - currentAngleRef.current + 180) % 360) - 180;
        currentAngleRef.current += angleDiff * 0.1;

        element.style.setProperty("--start", String(currentAngleRef.current));
      });
    },
    [inactiveZone, proximity]
  );

  useEffect(() => {
    if (disabled) return;

    const handleScroll = () => handleMove();
    const handlePointerMove = (e: PointerEvent) => handleMove(e);

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.body.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("scroll", handleScroll);
      document.body.removeEventListener("pointermove", handlePointerMove);
    };
  }, [handleMove, disabled]);

  return (
    <>
      {/* Static border when disabled */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-[inherit] border opacity-0 transition-opacity",
          glow && "opacity-100",
          disabled && "!block"
        )}
      />
      {/* Dynamic glow effect */}
      <div
        ref={containerRef}
        style={
          {
            "--blur": `${blur}px`,
            "--spread": spread,
            "--start": "0",
            "--active": "0",
            "--border-width": `${borderWidth}px`,
            "--gradient": gradients[variant],
          } as React.CSSProperties
        }
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity",
          glow && "opacity-100",
          blur > 0 && "blur-[var(--blur)]",
          className,
          disabled && "!hidden"
        )}
      >
        <div
          className={cn(
            "rounded-[inherit]",
            'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--border-width))]',
            "after:[border:var(--border-width)_solid_transparent]",
            "after:[background:var(--gradient)] after:[background-attachment:fixed]",
            "after:opacity-[var(--active)] after:transition-opacity after:duration-300",
            "after:[mask-clip:padding-box,border-box]",
            "after:[mask-composite:intersect]",
            "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]"
          )}
        />
      </div>
    </>
  );
});

export { GlowingEffect };
