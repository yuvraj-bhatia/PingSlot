/**
 * PingSlot Landing Page
 * 
 * Electric Cyan + Deep Violet color scheme.
 * Clean, professional, trustworthy. Fintech-inspired.
 */

"use client";

import { motion } from "framer-motion";
import { 
  Bell, 
  Search, 
  Clock, 
  MapPin,
  Shield, 
  ExternalLink,
  Mail,
  Calendar,
  CheckCircle,
  ArrowRight,
  FileText,
  Plane,
  Car,
  Landmark,
  Building2,
  Zap,
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
} from "../../components/ui/HeroText";

// Electric Cyan - Primary accent
const CYAN = "#00D4FF";
const CYAN_LIGHT = "#4DE8FF";
const CYAN_DIM = "rgba(0, 212, 255, 0.12)";
const CYAN_BORDER = "rgba(0, 212, 255, 0.25)";

// Deep Violet - Secondary accent
const VIOLET = "#7C3AED";
const VIOLET_DIM = "rgba(124, 58, 237, 0.12)";
const VIOLET_BORDER = "rgba(124, 58, 237, 0.25)";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen antialiased">
      <DitheringBackground />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen relative flex items-center justify-center px-6">
          <HeroGlowEffects />

          <div className="max-w-4xl mx-auto py-32 text-center space-y-12">
            <HeroBadge />
            <HeroText />
            <HeroSubtext />
            <HeroFeatures />
            <HeroCTA />
          </div>

          <ScrollIndicator />
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              className="text-center mb-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span 
                className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6"
                style={{
                  background: CYAN_DIM,
                  border: `1px solid ${CYAN_BORDER}`,
                  color: CYAN,
                }}
              >
                How It Works
              </span>
              <h2 className="text-[clamp(2rem,5vw,3rem)] font-semibold tracking-[-0.03em] text-white">
                Four simple steps
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: MapPin, title: "Select Target", desc: "Choose appointment type and location" },
                { icon: Search, title: "Monitor", desc: "We check booking pages regularly" },
                { icon: Clock, title: "Detect", desc: "Identify when slots become available" },
                { icon: Bell, title: "Alert", desc: "Get notified with all the details" },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  className="relative p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(0,212,255,0.2)] transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                >
                  <span 
                    className="absolute -top-3 -left-3 w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${CYAN} 0%, ${CYAN_LIGHT} 100%)`, 
                      color: "#0a0a0a",
                      boxShadow: "0 0 15px rgba(0, 212, 255, 0.4)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <step.icon className="h-6 w-6 mb-4" style={{ color: CYAN }} />
                  <h3 className="text-white font-medium mb-2">{step.title}</h3>
                  <p className="text-[#888888] text-sm">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-32 px-6 bg-[rgba(255,255,255,0.01)]">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              className="text-center mb-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span 
                className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6"
                style={{
                  background: VIOLET_DIM,
                  border: `1px solid ${VIOLET_BORDER}`,
                  color: VIOLET,
                }}
              >
                Why PingSlot
              </span>
              <h2 className="text-[clamp(2rem,5vw,3rem)] font-semibold tracking-[-0.03em] text-white">
                Built different
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: Shield, title: "Smart Detection", desc: "AI-powered analysis understands page content, not just keywords." },
                { icon: Bell, title: "No Spam", desc: "Alerts only when real availability is detected." },
                { icon: Zap, title: "Auto-Booking", desc: "Optional browser automation to book instantly when slots open." },
                { icon: FileText, title: "Requirements Included", desc: "Each alert includes documents you'll need to bring." },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(124,58,237,0.2)] transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ 
                      background: i % 2 === 0 ? CYAN_DIM : VIOLET_DIM,
                      border: `1px solid ${i % 2 === 0 ? CYAN_BORDER : VIOLET_BORDER}`,
                    }}
                  >
                    <feature.icon className="h-5 w-5" style={{ color: i % 2 === 0 ? CYAN : VIOLET }} />
                  </div>
                  <h3 className="text-white font-medium mb-2">{feature.title}</h3>
                  <p className="text-[#888888] text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Supported Types */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold tracking-[-0.02em] text-white mb-4">
                Supported appointments
              </h2>
              <p className="text-[#888888]">Currently monitoring or planned</p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: FileText, title: "Passport", status: "Live" },
                { icon: Plane, title: "Consulate", status: "Live" },
                { icon: Landmark, title: "City/County", status: "Live" },
                { icon: Car, title: "DMV", status: "Beta" },
              ].map((type, i) => (
                <motion.div
                  key={i}
                  className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] text-center hover:border-[rgba(0,212,255,0.15)] transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <type.icon className="h-7 w-7 text-[#888888] mx-auto mb-3" />
                  <h3 className="text-white font-medium text-sm mb-2">{type.title}</h3>
                  <span 
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      background: type.status === "Live" ? CYAN_DIM : VIOLET_DIM,
                      color: type.status === "Live" ? CYAN : VIOLET,
                      border: `1px solid ${type.status === "Live" ? CYAN_BORDER : VIOLET_BORDER}`,
                    }}
                  >
                    {type.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Example Alert */}
        <section className="py-32 px-6 bg-[rgba(255,255,255,0.01)]">
          <div className="max-w-2xl mx-auto">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold tracking-[-0.02em] text-white mb-4">
                What you&apos;ll receive
              </h2>
            </motion.div>

            <motion.div 
              className="rounded-2xl overflow-hidden bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(0, 212, 255, 0.05)",
              }}
            >
              <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-[#888888]" />
                  <span className="text-xs text-[#888888]">Email Alert</span>
                </div>
                <p className="text-white font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  Passport Appointment — San Francisco
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div 
                  className="rounded-xl p-4"
                  style={{
                    background: CYAN_DIM,
                    border: `1px solid ${CYAN_BORDER}`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="h-4 w-4" style={{ color: CYAN }} />
                    <div>
                      <p className="text-xs text-[#888888]">Date</p>
                      <p className="text-white text-sm font-medium">Feb 18, 2026 at 10:30 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="h-4 w-4" style={{ color: CYAN }} />
                    <div>
                      <p className="text-xs text-[#888888]">Location</p>
                      <p className="text-white text-sm font-medium">SF Passport Agency, 95 Hawthorne St</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4" style={{ color: CYAN }} />
                    <div>
                      <p className="text-xs text-[#888888]">Service</p>
                      <p className="text-white text-sm font-medium">Passport Renewal (Adult)</p>
                    </div>
                  </div>
                </div>

                <a 
                  href="#" 
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ color: CYAN }}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Book this appointment →
                </a>

                <div className="pt-4 border-t border-[rgba(255,255,255,0.06)]">
                  <p className="text-xs text-[#888888] mb-3 font-medium uppercase tracking-wider">Required Documents</p>
                  <div className="space-y-2">
                    {["Current passport", "Form DS-82", "Passport photo", "Proof of travel"].map((doc, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-[#C0C0C0]">
                        <CheckCircle className="h-3.5 w-3.5" style={{ color: CYAN }} />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-40 px-6">
          <motion.div 
            className="max-w-2xl mx-auto text-center space-y-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-[clamp(2rem,6vw,3.5rem)] font-semibold tracking-[-0.03em] text-white">
              Start monitoring today
            </h2>
            <p className="text-lg text-[#888888]">
              Set up your first target and get notified when appointments open.
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold transition-all duration-300"
                style={{ 
                  background: `linear-gradient(135deg, ${CYAN} 0%, ${CYAN_LIGHT} 100%)`, 
                  color: "#0a0a0a",
                  boxShadow: "0 0 30px rgba(0, 212, 255, 0.4), 0 8px 32px rgba(0, 212, 255, 0.3)",
                }}
              >
                Open Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-[rgba(255,255,255,0.06)]">
          <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-[#888888]">
            <span className="flex items-center gap-2">
              <span 
                className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold"
                style={{ background: CYAN, color: "#0a0a0a" }}
              >
                P
              </span>
              © 2026 PingSlot
            </span>
            <span>Built with care</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
