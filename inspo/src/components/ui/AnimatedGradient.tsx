"use client";

/**
 * Lightweight CSS-only animated gradient background
 * Replaces @shadergradient/react (saves ~66MB from three.js)
 */
export function AnimatedGradient() {
  return (
    <div className="animated-gradient-bg">
      <div className="gradient-layer gradient-1" />
      <div className="gradient-layer gradient-2" />
      <div className="gradient-layer gradient-3" />
      <style jsx>{`
        .animated-gradient-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
          background: #0a0e27;
        }

        .gradient-layer {
          position: absolute;
          width: 200%;
          height: 200%;
          top: -50%;
          left: -50%;
          opacity: 0.8;
        }

        .gradient-1 {
          background: radial-gradient(
            ellipse at 30% 20%,
            rgba(30, 58, 138, 0.9) 0%,
            transparent 50%
          );
          animation: drift1 20s ease-in-out infinite;
        }

        .gradient-2 {
          background: radial-gradient(
            ellipse at 70% 60%,
            rgba(59, 130, 246, 0.7) 0%,
            transparent 45%
          );
          animation: drift2 25s ease-in-out infinite;
        }

        .gradient-3 {
          background: radial-gradient(
            ellipse at 50% 80%,
            rgba(15, 23, 42, 0.95) 0%,
            transparent 60%
          );
          animation: drift3 30s ease-in-out infinite;
        }

        @keyframes drift1 {
          0%, 100% {
            transform: translate(0%, 0%) rotate(0deg) scale(1);
          }
          25% {
            transform: translate(5%, 10%) rotate(2deg) scale(1.05);
          }
          50% {
            transform: translate(-5%, 5%) rotate(-1deg) scale(0.98);
          }
          75% {
            transform: translate(3%, -5%) rotate(1deg) scale(1.02);
          }
        }

        @keyframes drift2 {
          0%, 100% {
            transform: translate(0%, 0%) rotate(0deg) scale(1);
          }
          33% {
            transform: translate(-8%, 6%) rotate(-2deg) scale(1.03);
          }
          66% {
            transform: translate(6%, -8%) rotate(2deg) scale(0.97);
          }
        }

        @keyframes drift3 {
          0%, 100% {
            transform: translate(0%, 0%) scale(1);
          }
          50% {
            transform: translate(3%, 3%) scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Loading placeholder with matching background color
 */
export function GradientPlaceholder() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0a0e27",
        zIndex: 0,
      }}
    />
  );
}
