"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function HeroText() {
  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Glass Card Container */}
      <div 
        className="relative rounded-3xl p-8 sm:p-10 lg:p-12 backdrop-blur-xl"
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset",
        }}
      >
        {/* Subtle inner glow */}
        <div 
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at top center, rgba(0, 119, 255, 0.1) 0%, transparent 50%)",
          }}
        />

        {/* Main headline */}
        <h1 className="relative font-space-grotesk text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.1] text-center">
          {/* Line 1: "Know When" - white gradient */}
          <motion.span
            className="block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #FFFFFF 0%, #E8E8E8 50%, #D0D0D0 100%)",
              }}
            >
              Know When
            </span>
          </motion.span>

          {/* Line 2: "Appointments" - blue gradient */}
          <motion.span
            className="block mt-1 sm:mt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
          >
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #00BFFF 0%, #0077FF 40%, #0057B8 80%, #003D80 100%)",
              }}
            >
              Appointments
            </span>
          </motion.span>

          {/* Line 3: "Actually Open" - white to blue gradient */}
          <motion.span
            className="block mt-1 sm:mt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #FFFFFF 0%, #B8D4FF 30%, #0077FF 70%, #0057B8 100%)",
              }}
            >
              Actually Open
            </span>
          </motion.span>
        </h1>

        {/* Decorative corner accents - all blue */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-[#0077FF]/40 rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-[#0077FF]/40 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-[#0077FF]/40 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-[#0077FF]/40 rounded-br-lg" />
      </div>
    </motion.div>
  );
}

export function HeroSubtext() {
  return (
    <motion.p
      className="text-lg sm:text-xl lg:text-2xl text-[#CCCCCC] max-w-2xl mx-auto leading-relaxed font-space-grotesk"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
    >
      Monitor official government booking pages. Get{" "}
      <span className="text-[#0077FF] font-semibold">instant alerts</span> when 
      real slots open — with booking links and required documents.
    </motion.p>
  );
}

export function HeroBadge() {
  return (
    <motion.div 
      className="inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 backdrop-blur-md font-space-grotesk"
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        border: "1px solid rgba(0, 119, 255, 0.4)",
        background: "rgba(0, 119, 255, 0.15)",
        boxShadow: "0 4px 20px rgba(0, 119, 255, 0.2)",
      }}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0077FF] opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0077FF]" />
      </span>
      <span className="text-sm font-semibold tracking-wide text-[#0077FF] uppercase">
        Live Monitoring
      </span>
    </motion.div>
  );
}

export function HeroCTA() {
  return (
    <motion.div
      className="flex flex-col sm:flex-row items-center justify-center gap-4 font-space-grotesk"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.6, ease: "easeOut" }}
    >
      <motion.a
        href="/"
        className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold overflow-hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        style={{
          background: "linear-gradient(135deg, #0077FF 0%, #0057B8 100%)",
          color: "#FFFFFF",
          boxShadow: "0 8px 32px rgba(0, 119, 255, 0.4)",
        }}
      >
        {/* Shine effect on hover */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        <span className="relative z-10">View Dashboard</span>
        <svg 
          className="relative z-10 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300"
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
      
      <span className="text-sm text-[#888888]">
        No signup required
      </span>
    </motion.div>
  );
}

export function HeroFeatures() {
  const features = [
    { icon: "✓", text: "Real availability data" },
    { icon: "✓", text: "Official sources only" },
    { icon: "✓", text: "Instant alerts" },
  ];

  return (
    <motion.div
      className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm font-space-grotesk"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.1, delayChildren: 0.7 },
        },
      }}
    >
      {features.map((feature, i) => (
        <motion.div
          key={i}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full backdrop-blur-sm"
          variants={{
            hidden: { opacity: 0, y: 10, scale: 0.9 },
            visible: { opacity: 1, y: 0, scale: 1 },
          }}
          style={{
            background: "rgba(0, 119, 255, 0.15)",
            border: "1px solid rgba(0, 119, 255, 0.3)",
          }}
        >
          <span className="text-[#0077FF] font-bold">{feature.icon}</span>
          <span className="text-[#E8E8E8] font-medium">{feature.text}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Additional animated components for the landing page

export function HeroGlowEffects() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 2, ease: "easeOut" }}
        style={{
          background: "radial-gradient(circle, rgba(0, 119, 255, 0.6) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
        style={{
          background: "radial-gradient(circle, rgba(0, 180, 255, 0.5) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
    </div>
  );
}

export function ScrollIndicator() {
  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.6 }}
    >
      <motion.div
        className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-[#0077FF]"
          animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}

export function SectionHeader({ 
  badge, 
  badgeColor = "blue",
  title, 
  subtitle 
}: { 
  badge: string; 
  badgeColor?: "blue" | "orange";
  title: string; 
  subtitle: string;
}) {
  const colors = {
    blue: {
      bg: "rgba(0, 119, 255, 0.1)",
      border: "rgba(0, 119, 255, 0.3)",
      text: "#0077FF",
    },
    orange: {
      bg: "rgba(255, 128, 0, 0.1)",
      border: "rgba(255, 128, 0, 0.3)",
      text: "#FF8000",
    },
  };
  const c = colors[badgeColor];

  return (
    <motion.div 
      className="text-center mb-16 font-space-grotesk"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      <span
        className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
        style={{
          background: c.bg,
          border: `1px solid ${c.border}`,
          color: c.text,
        }}
      >
        {badge}
      </span>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white">
        {title}
      </h2>
      <p className="text-[#AAAAAA] max-w-xl mx-auto text-lg">
        {subtitle}
      </p>
    </motion.div>
  );
}

export function AnimatedCard({ 
  children, 
  delay = 0,
  className = "",
  hoverGlow = "blue",
}: { 
  children: ReactNode; 
  delay?: number;
  className?: string;
  hoverGlow?: "blue" | "orange";
}) {
  const glowColors = {
    blue: "rgba(0, 119, 255, 0.1)",
    orange: "rgba(255, 128, 0, 0.1)",
  };

  return (
    <motion.div 
      className={`group relative rounded-2xl p-6 space-y-4 transition-all duration-500 font-space-grotesk ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -4 }}
      style={{
        background: "rgba(15, 15, 15, 0.8)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Hover glow effect */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${glowColors[hoverGlow]} 0%, transparent 70%)`,
        }}
      />
      {children}
    </motion.div>
  );
}

export function FinalCTASection() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.2 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        style={{
          background: "radial-gradient(ellipse, rgba(0, 119, 255, 0.4) 0%, rgba(255, 128, 0, 0.2) 50%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />
    </div>
  );
}

export function AnimatedCTAButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <a
        href={href}
        className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-lg font-bold overflow-hidden font-space-grotesk"
        style={{
          background: "linear-gradient(135deg, #FF8000 0%, #E67300 100%)",
          color: "#0A0A0A",
          boxShadow: "0 8px 40px rgba(255, 128, 0, 0.5)",
        }}
      >
        {/* Shine effect */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        {children}
      </a>
    </motion.div>
  );
}
