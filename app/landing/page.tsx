/**
 * PingSlot Landing Page
 * 
 * A clean, credible landing page for the appointment availability monitoring tool.
 * Designed for hackathon judges, technical reviewers, and real users.
 * 
 * Tone: Clear, professional, honest — no hype or exaggerated claims.
 */

"use client";

import { motion } from "framer-motion";
import { 
  Bell, 
  Search, 
  Clock, 
  FileText, 
  CheckCircle, 
  Shield, 
  ExternalLink,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  ArrowRight,
  Building2,
  Plane,
  Car,
  Landmark,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { DitheringBackground } from "../../components/ui/DitheringBackground";
import { 
  HeroText, 
  HeroSubtext, 
  HeroBadge, 
  HeroCTA, 
  HeroFeatures,
  HeroGlowEffects,
  ScrollIndicator,
  SectionHeader,
  AnimatedCard
} from "../../components/ui/HeroText";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen font-space-grotesk">
      {/* ============================================
          DITHERING BACKGROUND LAYER
          Using WebGL shader for dynamic animated effect
          ============================================ */}
      <DitheringBackground />

      {/* ============================================
          MAIN CONTENT
          ============================================ */}
      <div className="relative z-10">
        
        {/* ============================================
            SECTION 1: HERO
            Animated text with blue gradient glow, motion effects
            ============================================ */}
        <section className="min-h-screen relative overflow-hidden flex items-center justify-center">
          {/* Ambient glow effects */}
          <HeroGlowEffects />

          {/* Hero content container */}
          <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-20 text-center space-y-10">
            {/* Product badge */}
            <HeroBadge />

            {/* Main headline with glow and animations */}
            <HeroText />

            {/* Value proposition */}
            <HeroSubtext />

            {/* Key benefits - bullet points */}
            <HeroFeatures />

            {/* Primary CTA */}
            <HeroCTA />
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          
          {/* Scroll indicator */}
          <ScrollIndicator />
        </section>

        {/* ============================================
            SECTION 2: HOW IT WORKS
            4 clear steps explaining the monitoring process
            ============================================ */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
          {/* Section glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] blur-[100px] opacity-20"
              style={{
                background: "radial-gradient(ellipse, rgba(0, 119, 255, 0.5) 0%, transparent 70%)",
              }}
            />
          </div>

          <div className="max-w-5xl mx-auto relative">
            {/* Section header */}
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <motion.span
                className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
                style={{
                  background: "rgba(0, 119, 255, 0.1)",
                  border: "1px solid rgba(0, 119, 255, 0.3)",
                  color: "#0077FF",
                }}
              >
                Simple Process
              </motion.span>
              <h2 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
                style={{
                  background: "linear-gradient(135deg, #F8F4F0 0%, #CCCCCC 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                How It Works
              </h2>
              <p className="text-[#888888] max-w-xl mx-auto text-lg">
                Four simple steps from setup to notification
              </p>
            </motion.div>

            {/* Steps grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StepCard
                number={1}
                icon={<MapPin className="h-6 w-6" />}
                title="Select Target"
                description="Choose the appointment type and location you need to monitor"
                delay={0}
              />
              
              <StepCard
                number={2}
                icon={<Search className="h-6 w-6" />}
                title="Monitor Pages"
                description="We check official booking pages at regular intervals"
                delay={0.1}
              />
              
              <StepCard
                number={3}
                icon={<Clock className="h-6 w-6" />}
                title="Detect Changes"
                description="Our system identifies when new slots become available"
                delay={0.2}
              />
              
              <StepCard
                number={4}
                icon={<Bell className="h-6 w-6" />}
                title="Get Notified"
                description="Receive an alert with slot details, links, and requirements"
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* ============================================
            SECTION 3: WHAT MAKES IT DIFFERENT
            Key differentiators — honest, no hype
            ============================================ */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-black/30 relative overflow-hidden">
          {/* Background accent */}
          <div className="absolute inset-0 pointer-events-none">
            <div 
              className="absolute bottom-0 right-0 w-[600px] h-[600px] blur-[120px] opacity-15"
              style={{
                background: "radial-gradient(circle, rgba(255, 128, 0, 0.5) 0%, transparent 70%)",
              }}
            />
          </div>

          <div className="max-w-5xl mx-auto relative">
            {/* Section header */}
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <motion.span
                className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
                style={{
                  background: "rgba(255, 128, 0, 0.1)",
                  border: "1px solid rgba(255, 128, 0, 0.3)",
                  color: "#FF8000",
                }}
              >
                Why PingSlot
              </motion.span>
              <h2 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
                style={{
                  background: "linear-gradient(135deg, #F8F4F0 0%, #CCCCCC 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                What Makes It Different
              </h2>
              <p className="text-[#888888] max-w-xl mx-auto text-lg">
                Built with transparency and respect for official systems
              </p>
            </motion.div>

            {/* Differentiators grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <DifferentiatorCard
                icon={<Shield className="h-6 w-6" />}
                title="No Auto-Booking"
                description="We only notify you. You book the appointment yourself through official channels."
                delay={0}
              />
              
              <DifferentiatorCard
                icon={<AlertCircle className="h-6 w-6" />}
                title="No Spam"
                description="Alerts only when real availability is detected. No false positives, no noise."
                delay={0.1}
              />
              
              <DifferentiatorCard
                icon={<ExternalLink className="h-6 w-6" />}
                title="Official Sources Only"
                description="We monitor actual government and consulate booking pages — no third-party scrapers."
                delay={0.2}
              />
              
              <DifferentiatorCard
                icon={<FileText className="h-6 w-6" />}
                title="Requirements Included"
                description="Each alert includes the documents and items you'll need for your appointment."
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* ============================================
            SECTION 4: SUPPORTED APPOINTMENT TYPES
            Categories we support (or plan to support)
            ============================================ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F8F4F0] mb-4">
                Supported Appointment Types
              </h2>
              <p className="text-[#888888] max-w-xl mx-auto">
                Currently monitoring or planned for future support
              </p>
            </div>

            {/* Appointment types grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <AppointmentTypeCard
                icon={<FileText className="h-8 w-8" />}
                title="Passport"
                status="available"
                description="US Passport renewal and new applications"
              />
              
              <AppointmentTypeCard
                icon={<Plane className="h-8 w-8" />}
                title="Consulate"
                status="available"
                description="Visa appointments and consular services"
              />
              
              <AppointmentTypeCard
                icon={<Landmark className="h-8 w-8" />}
                title="City / County"
                status="available"
                description="Local government services and permits"
              />
              
              <AppointmentTypeCard
                icon={<Car className="h-8 w-8" />}
                title="DMV"
                status="limited"
                description="Driver's license and vehicle registration"
              />
            </div>
          </div>
        </section>

        {/* ============================================
            SECTION 5: EXAMPLE ALERT
            Sample of what users receive
            ============================================ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/30">
          <div className="max-w-3xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F8F4F0] mb-4">
                Example Alert
              </h2>
              <p className="text-[#888888]">
                This is what a typical notification looks like
              </p>
            </div>

            {/* Email mockup */}
            <div 
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(15, 15, 15, 0.9)",
                border: "1px solid rgba(255, 128, 0, 0.2)",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
              }}
            >
              {/* Email header */}
              <div 
                className="px-6 py-4 border-b"
                style={{ borderColor: "rgba(31, 31, 31, 0.8)" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-[rgba(255,128,0,0.15)]">
                    <Mail className="h-5 w-5 text-[#FF8000]" />
                  </div>
                  <span className="text-xs text-[#666666] uppercase tracking-wide">Email Alert</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-[#888888]">
                    <span className="text-[#666666]">From:</span> alerts@pingslot.app
                  </p>
                  <p className="text-base font-semibold text-[#F8F4F0]">
                    <span className="text-[#666666] font-normal text-sm">Subject:</span> 🟢 Passport Appointment Available — San Francisco
                  </p>
                </div>
              </div>

              {/* Email body */}
              <div className="px-6 py-6 space-y-5">
                <p className="text-[#CCCCCC]">
                  An appointment slot has opened up:
                </p>

                {/* Slot details */}
                <div 
                  className="rounded-xl p-5 space-y-3"
                  style={{
                    background: "rgba(255, 128, 0, 0.08)",
                    border: "1px solid rgba(255, 128, 0, 0.2)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-[#FF8000]" />
                    <div>
                      <p className="text-sm text-[#888888]">Date & Time</p>
                      <p className="text-[#F8F4F0] font-medium">Tuesday, February 18, 2026 at 10:30 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-[#FF8000]" />
                    <div>
                      <p className="text-sm text-[#888888]">Location</p>
                      <p className="text-[#F8F4F0] font-medium">San Francisco Passport Agency, 95 Hawthorne St</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-[#FF8000]" />
                    <div>
                      <p className="text-sm text-[#888888]">Service</p>
                      <p className="text-[#F8F4F0] font-medium">Passport Renewal (Adult)</p>
                    </div>
                  </div>
                </div>

                {/* Book now link */}
                <div className="pt-2">
                  <a 
                    href="#" 
                    className="inline-flex items-center gap-2 text-[#FF8000] hover:underline font-medium"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Book this appointment →
                  </a>
                </div>

                {/* Requirements checklist */}
                <div className="pt-4 border-t" style={{ borderColor: "rgba(31, 31, 31, 0.8)" }}>
                  <p className="text-sm font-medium text-[#F8F4F0] mb-3">Required Documents:</p>
                  <ul className="space-y-2 text-sm text-[#AAAAAA]">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-[#22C55E] mt-0.5 flex-shrink-0" />
                      <span>Current passport (or expired within last 5 years)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-[#22C55E] mt-0.5 flex-shrink-0" />
                      <span>Completed Form DS-82</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-[#22C55E] mt-0.5 flex-shrink-0" />
                      <span>One passport photo (2x2 inches)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-[#22C55E] mt-0.5 flex-shrink-0" />
                      <span>Proof of travel within 14 days</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            SECTION 6: ETHICS & SAFETY
            Transparency about how we operate
            ============================================ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F8F4F0] mb-4">
                Ethics & Safety
              </h2>
              <p className="text-[#888888]">
                How we operate responsibly
              </p>
            </div>

            {/* Ethics points */}
            <div 
              className="rounded-2xl p-8 space-y-6"
              style={{
                background: "rgba(15, 15, 15, 0.8)",
                border: "1px solid rgba(31, 31, 31, 0.8)",
              }}
            >
              <EthicsPoint
                title="Public Pages Only"
                description="We only monitor publicly accessible booking pages. No login credentials are used or stored."
              />
              
              <EthicsPoint
                title="Respectful Frequency"
                description="Our monitoring intervals are designed to minimize load on official servers. We don't hammer endpoints."
              />
              
              <EthicsPoint
                title="No System Bypassing"
                description="We don't circumvent CAPTCHAs, rate limits, or queue systems. We simply observe availability."
              />
              
              <EthicsPoint
                title="Transparent Operation"
                description="Users always book through official channels. We provide information, not automation."
              />
            </div>
          </div>
        </section>

        {/* ============================================
            SECTION 7: FINAL CTA
            Simple call to action
            ============================================ */}
        <section className="py-32 px-4 sm:px-6 lg:px-8 bg-black/30 relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] blur-[120px]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.3 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              style={{
                background: "radial-gradient(ellipse, rgba(0, 119, 255, 0.4) 0%, rgba(255, 128, 0, 0.2) 50%, transparent 70%)",
              }}
            />
          </div>

          <motion.div 
            className="max-w-2xl mx-auto text-center space-y-8 relative"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider"
              style={{
                background: "rgba(0, 119, 255, 0.1)",
                border: "1px solid rgba(0, 119, 255, 0.3)",
                color: "#0077FF",
              }}
            >
              Get Started
            </motion.span>
            
            <h2 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold"
              style={{
                background: "linear-gradient(135deg, #F8F4F0 0%, #0077FF 50%, #FF8000 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 30px rgba(0, 119, 255, 0.3))",
              }}
            >
              Start Monitoring Today
            </h2>
            
            <p className="text-lg sm:text-xl text-[#AAAAAA]">
              Set up your first target and get notified when appointments become available.
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/"
                className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-lg font-bold overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #FF8000 0%, #E67300 100%)",
                  color: "#0A0A0A",
                  boxShadow: "0 8px 40px rgba(255, 128, 0, 0.5), 0 0 80px rgba(255, 128, 0, 0.2)",
                }}
              >
                {/* Shine effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative z-10">Open Dashboard</span>
                <ArrowRight className="relative z-10 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

/* ============================================
   COMPONENT: StepCard
   Used in the "How It Works" section
   ============================================ */
function StepCard({
  number,
  icon,
  title,
  description,
  delay = 0,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div 
      className="group relative rounded-2xl p-6 space-y-4 transition-all duration-500"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -4 }}
      style={{
        background: "rgba(15, 15, 15, 0.8)",
        border: "1px solid rgba(31, 31, 31, 0.8)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Hover glow effect */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0, 119, 255, 0.1) 0%, transparent 70%)",
        }}
      />
      
      {/* Step number */}
      <motion.div 
        className="absolute -top-3 -left-3 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold"
        whileHover={{ scale: 1.1, rotate: 5 }}
        style={{
          background: "linear-gradient(135deg, #0077FF 0%, #0057B8 100%)",
          color: "#FFFFFF",
          boxShadow: "0 4px 15px rgba(0, 119, 255, 0.5)",
        }}
      >
        {number}
      </motion.div>
      
      {/* Icon */}
      <div 
        className="text-[#0077FF] p-3 rounded-xl inline-block transition-all duration-300 group-hover:scale-110"
        style={{
          background: "rgba(0, 119, 255, 0.1)",
          boxShadow: "0 0 20px rgba(0, 119, 255, 0.1)",
        }}
      >
        {icon}
      </div>
      
      {/* Content */}
      <h3 className="text-lg font-semibold text-[#F8F4F0] group-hover:text-[#0077FF] transition-colors duration-300">{title}</h3>
      <p className="text-sm text-[#888888] leading-relaxed">{description}</p>
    </motion.div>
  );
}

/* ============================================
   COMPONENT: DifferentiatorCard
   Used in the "What Makes It Different" section
   ============================================ */
function DifferentiatorCard({
  icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div 
      className="group rounded-2xl p-6 space-y-4 transition-all duration-500"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -4 }}
      style={{
        background: "rgba(15, 15, 15, 0.8)",
        border: "1px solid rgba(31, 31, 31, 0.8)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Icon */}
      <div 
        className="p-3 rounded-xl inline-block transition-all duration-300 group-hover:scale-110" 
        style={{ 
          background: "rgba(255, 128, 0, 0.15)",
          boxShadow: "0 0 20px rgba(255, 128, 0, 0.1)",
        }}
      >
        <div className="text-[#FF8000]">{icon}</div>
      </div>
      
      {/* Content */}
      <h3 className="text-lg font-semibold text-[#F8F4F0] group-hover:text-[#FF8000] transition-colors duration-300">{title}</h3>
      <p className="text-sm text-[#888888] leading-relaxed">{description}</p>
    </motion.div>
  );
}

/* ============================================
   COMPONENT: AppointmentTypeCard
   Used in the "Supported Types" section
   ============================================ */
function AppointmentTypeCard({
  icon,
  title,
  status,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  status: "available" | "limited" | "coming";
  description: string;
}) {
  const statusStyles = {
    available: {
      label: "Available",
      bg: "rgba(34, 197, 94, 0.15)",
      color: "#22C55E",
      border: "rgba(34, 197, 94, 0.3)",
    },
    limited: {
      label: "Limited",
      bg: "rgba(255, 128, 0, 0.15)",
      color: "#FF8000",
      border: "rgba(255, 128, 0, 0.3)",
    },
    coming: {
      label: "Coming Soon",
      bg: "rgba(136, 136, 136, 0.15)",
      color: "#888888",
      border: "rgba(136, 136, 136, 0.3)",
    },
  };

  const s = statusStyles[status];

  return (
    <div 
      className="rounded-2xl p-6 space-y-4 text-center transition-all duration-300 hover:translate-y-[-2px]"
      style={{
        background: "rgba(15, 15, 15, 0.8)",
        border: "1px solid rgba(31, 31, 31, 0.8)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Icon */}
      <div className="mx-auto text-[#FF8000]">{icon}</div>
      
      {/* Title */}
      <h3 className="text-lg font-semibold text-[#F8F4F0]">{title}</h3>
      
      {/* Description */}
      <p className="text-sm text-[#888888] leading-relaxed">{description}</p>
      
      {/* Status badge */}
      <div 
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
        style={{
          background: s.bg,
          color: s.color,
          border: `1px solid ${s.border}`,
        }}
      >
        <span 
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: s.color }}
        />
        {s.label}
      </div>
    </div>
  );
}

/* ============================================
   COMPONENT: EthicsPoint
   Used in the "Ethics & Safety" section
   ============================================ */
function EthicsPoint({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 mt-1">
        <CheckCircle className="h-5 w-5 text-[#22C55E]" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-[#F8F4F0] mb-1">{title}</h3>
        <p className="text-sm text-[#888888] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
