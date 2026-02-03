"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

/**
 * Hero Components with Papaya Orange Accent Color Scheme
 * 
 * Design principles:
 * - Typography is the hero
 * - Electric Cyan (#00D4FF) as primary accent - unified with dashboard
 * - Racing Blue (#0057B8) as secondary accent
 * - Clean, confident animations
 * - Premium feel through simplicity
 */

// Primary accent - Electric Cyan/Teal
const PRIMARY = "#00D4FF";
const PRIMARY_LIGHT = "#4DE8FF";
const PRIMARY_DIM = "rgba(0, 212, 255, 0.12)";
const PRIMARY_BORDER = "rgba(0, 212, 255, 0.25)";

// Secondary - Deep Violet for depth
const SECONDARY = "#7C3AED";
const SECONDARY_DIM = "rgba(124, 58, 237, 0.12)";

export function HeroText() {
  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-semibold tracking-[-0.04em] leading-[1.05] text-center">
        {/* Line 1 */}
        <motion.span
          className="block text-white"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
        >
          Stop refreshing.
        </motion.span>

        {/* Line 2 - the emphasis with cyan gradient */}
        <motion.span
          className="block"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span 
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(90deg, ${PRIMARY} 0%, ${PRIMARY_LIGHT} 100%)`,
              filter: "drop-shadow(0 0 30px rgba(0, 212, 255, 0.4))",
            }}
          >
            Start booking.
          </span>
        </motion.span>
      </h1>
    </motion.div>
  );
}

export function HeroSubtext() {
  return (
    <motion.p
      className="text-[clamp(1.125rem,2.5vw,1.375rem)] text-[#888888] max-w-2xl mx-auto leading-relaxed font-normal text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
    >
      We watch booking pages so you don&apos;t have to.
      <br />
      Get instant alerts when appointments open up.
    </motion.p>
  );
}

export function HeroBadge() {
  return (
    <motion.div 
      className="inline-flex items-center gap-2 rounded-full px-4 py-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        background: PRIMARY_DIM,
        border: `1px solid ${PRIMARY_BORDER}`,
        boxShadow: "0 0 30px rgba(0, 212, 255, 0.15)",
      }}
    >
      <span className="relative flex h-2 w-2">
        <span 
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
          style={{ background: PRIMARY }}
        />
        <span 
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ background: PRIMARY, boxShadow: "0 0 8px rgba(0, 212, 255, 0.6)" }}
        />
      </span>
      <span className="text-sm font-semibold" style={{ color: PRIMARY }}>
        Live Monitoring
      </span>
    </motion.div>
  );
}

export function HeroCTA() {
  return (
    <motion.div
      className="flex flex-col sm:flex-row items-center justify-center gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <motion.a
        href="/"
        className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold transition-all duration-300"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_LIGHT} 100%)`,
          color: "#0A0A0A",
          boxShadow: "0 0 30px rgba(0, 212, 255, 0.4), 0 8px 32px rgba(0, 212, 255, 0.3)",
        }}
      >
        <span>Get Started</span>
        <svg 
          className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-300"
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </motion.a>
      
      <motion.a
        href="#how-it-works"
        className="text-base font-medium transition-all duration-300 hover:opacity-80"
        style={{ color: "#F8F4F0" }}
        whileHover={{ opacity: 0.8 }}
      >
        Learn more <span style={{ color: PRIMARY }}>→</span>
      </motion.a>
    </motion.div>
  );
}

export function HeroFeatures() {
  const features = [
    "24/7 automated monitoring",
    "Instant email alerts", 
    "Multiple booking platforms",
    "Never miss an opening",
  ];

  return (
    <motion.div
      className="flex flex-wrap justify-center gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9, duration: 0.8 }}
    >
      {features.map((feature, i) => (
        <motion.div
          key={i}
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 + i * 0.1, duration: 0.5 }}
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <svg 
            className="h-4 w-4" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke={PRIMARY}
            strokeWidth="2.5"
          >
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm text-[#C0C0C0]">{feature}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function HeroGlowEffects() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Primary cyan ambient glow */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 }}
        transition={{ duration: 2, ease: "easeOut" }}
        style={{
          background: `radial-gradient(circle, ${PRIMARY} 0%, transparent 70%)`,
          filter: "blur(120px)",
        }}
      />
      {/* Secondary violet glow for depth */}
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[400px] rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.06 }}
        transition={{ duration: 2.5, delay: 0.5, ease: "easeOut" }}
        style={{
          background: `radial-gradient(circle, ${SECONDARY} 0%, transparent 70%)`,
          filter: "blur(100px)",
        }}
      />
    </div>
  );
}

export function ScrollIndicator() {
  return (
    <motion.div
      className="absolute bottom-12 left-1/2 -translate-x-1/2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      transition={{ delay: 2, duration: 1 }}
    >
      <motion.div
        className="w-6 h-10 rounded-full border border-white/20 flex justify-center pt-2"
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="w-1 h-2 rounded-full"
          style={{ background: PRIMARY }}
          animate={{ y: [0, 8, 0], opacity: [0.8, 0.3, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}

export function SectionHeader({ 
  badge, 
  badgeColor = "cyan",
  title, 
  subtitle 
}: { 
  badge: string; 
  badgeColor?: "cyan" | "violet";
  title: string; 
  subtitle: string;
}) {
  const colors = {
    cyan: {
      bg: PRIMARY_DIM,
      border: PRIMARY_BORDER,
      text: PRIMARY,
    },
    violet: {
      bg: SECONDARY_DIM,
      border: "rgba(124, 58, 237, 0.3)",
      text: SECONDARY,
    },
  };
  const c = colors[badgeColor];

  return (
    <motion.div 
      className="text-center mb-20"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <span
        className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6"
        style={{
          background: c.bg,
          border: `1px solid ${c.border}`,
          color: c.text,
        }}
      >
        {badge}
      </span>
      <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold tracking-[-0.03em] mb-4 text-white">
        {title}
      </h2>
      <p className="text-[#888888] max-w-xl mx-auto text-lg">
        {subtitle}
      </p>
    </motion.div>
  );
}

export function AnimatedCard({ 
  children, 
  delay = 0,
  className = "",
}: { 
  children: ReactNode; 
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div 
      className={`group relative rounded-2xl p-6 transition-all duration-500 ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -2 }}
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      {children}
    </motion.div>
  );
}

export function FinalCTASection() {
  return null;
}

export function AnimatedCTAButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <a
        href={href}
        className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_LIGHT} 100%)`,
          color: "#0A0A0A",
          boxShadow: "0 0 30px rgba(0, 212, 255, 0.4), 0 8px 32px rgba(0, 212, 255, 0.3)",
        }}
      >
        {children}
      </a>
    </motion.div>
  );
}
