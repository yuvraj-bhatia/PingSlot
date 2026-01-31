"use client";
import {
  ArrowRight,
  Circle,
  Layers,
  LayoutGrid,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { DitheringShader } from "@/components/ui/dithering-shader";
import { GradientButton } from "@/components/ui/gradient-button";

export default function Home() {
  const [_scrollY, setScrollY] = useState(0);
  const [_mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [chartVisible, setChartVisible] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mountFrame = requestAnimationFrame(() => setMounted(true));
    const throttle = <T extends unknown[]>(
      fn: (...args: T) => void,
      limit: number,
    ) => {
      let inThrottle = false;
      return (...args: T) => {
        if (!inThrottle) {
          fn(...args);
          inThrottle = true;
          setTimeout(() => {
            inThrottle = false;
          }, limit);
        }
      };
    };

    const handleScroll = throttle(() => setScrollY(window.scrollY), 100);
    const handleMouseMove = throttle((e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }, 50);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(mountFrame);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Intersection Observer for chart animation
  useEffect(() => {
    if (!chartRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setChartVisible(true);
            // Once visible, we can disconnect the observer
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.3, // Trigger when 30% of the chart is visible
        rootMargin: "0px",
      },
    );

    observer.observe(chartRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="landing-page">
      <style jsx>{`
        .landing-page {
          position: relative;
          overflow-x: hidden;
          background: transparent;
          min-height: 100vh;
        }

        .shader-gradient-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
          opacity: 1;
        }

        .content-wrapper {
          position: relative;
          z-index: 10;
          opacity: 1;
        }

        /* Enhanced Hero Section */
        .hero {
          min-height: 85vh;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          position: relative;
          padding: 2rem 1rem;
          padding-top: 4rem;
          padding-bottom: 0;
          background: transparent;
          --hero-primary: #eaf0ff;
          --hero-accent: #5edfff;
          --hero-muted: rgba(234, 240, 255, 0.75);
          --hero-border: rgba(94, 223, 255, 0.35);
        }

        .hero-content {
          text-align: center;
          max-width: 1200px;
          margin: 0 auto;
          animation: fadeInUp 1s ease-out;
          position: relative;
          z-index: 100;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
          color: var(--hero-primary);
        }

        .new-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1.5rem;
          background: linear-gradient(
            135deg,
            rgba(94, 223, 255, 0.12),
            rgba(234, 240, 255, 0.08)
          );
          backdrop-filter: blur(20px);
          border: 1px solid var(--hero-border);
          border-radius: 50px;
          color: var(--hero-primary);
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          margin-bottom: 2rem;
          animation: pulse 2s ease-in-out infinite;
          position: relative;
          z-index: 10;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45);
          opacity: 1;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }

        .hero-title {
          font-size: clamp(3rem, 10vw, 6rem);
          font-weight: 800;
          margin-bottom: 1.5rem;
          color: var(--hero-primary);
          line-height: 1.1;
          position: relative;
          z-index: 10;
          letter-spacing: -0.02em;
          filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.55));
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .hero-title .accent {
          color: var(--hero-accent);
        }

        .hero-subtitle {
          font-size: clamp(1.1rem, 3vw, 1.4rem);
          color: var(--hero-muted);
          margin-bottom: 2.5rem;
          line-height: 1.6;
          max-width: 760px;
          margin-left: auto;
          margin-right: auto;
          opacity: 1;
          font-weight: 500;
          letter-spacing: 0.01em;
          text-shadow: 0 3px 12px rgba(0, 0, 0, 0.7);
        }

        .cta-buttons {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 4rem;
        }

        .cta-buttons a {
          text-decoration: none;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0.625rem 1.75rem !important;
          gap: 0.5rem !important;
        }

        /* Dashboard Mockup */

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .dashboard-content {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          gap: 1.25rem;
          padding: 0.5rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }

        .dashboard-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          opacity: 1;
        }

        .confidence-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 50px;
          color: #16a34a;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.15);
          opacity: 1;
        }

        .dashboard-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .metric-card {
          padding: 1.5rem;
          background: #f8f9fa;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 16px;
          transition: all 0.3s ease;
          opacity: 1;
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }

        .metric-card:hover {
          background: #f0f1f3;
          border-color: rgba(0, 112, 243, 0.3);
          transform: translateY(-2px);
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
        }

        .metric-label {
          font-size: 0.85rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
          opacity: 1;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 900;
          background: linear-gradient(135deg, #0070f3, #9333ea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          opacity: 1;
        }

        .chart-container {
          height: 200px;
          background: #f8f9fa;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          padding: 1rem;
          gap: 0.5rem;
          opacity: 1;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .chart-bar {
          flex: 1;
          background: linear-gradient(180deg, rgba(0, 112, 243, 0.6), rgba(0, 112, 243, 0.2));
          border-radius: 8px 8px 0 0;
          position: relative;
          height: 0;
          opacity: 0;
        }

        .chart-container.visible .chart-bar {
          animation: growBar 1s ease-out both;
        }

        .chart-container.visible .chart-bar:nth-child(1) { height: 60%; animation-delay: 0.1s; }
        .chart-container.visible .chart-bar:nth-child(2) { height: 85%; animation-delay: 0.2s; background: linear-gradient(180deg, rgba(147, 51, 234, 0.6), rgba(147, 51, 234, 0.2)); }
        .chart-container.visible .chart-bar:nth-child(3) { height: 95%; animation-delay: 0.3s; background: linear-gradient(180deg, rgba(34, 197, 94, 0.6), rgba(34, 197, 94, 0.2)); }
        .chart-container.visible .chart-bar:nth-child(4) { height: 75%; animation-delay: 0.4s; }
        .chart-container.visible .chart-bar:nth-child(5) { height: 88%; animation-delay: 0.5s; background: linear-gradient(180deg, rgba(147, 51, 234, 0.6), rgba(147, 51, 234, 0.2)); }

        @keyframes growBar {
          from { height: 0; opacity: 0; }
          to { opacity: 1; }
        }

        .chart-label {
          position: absolute;
          bottom: -1.5rem;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.7rem;
          color: #6b7280;
          white-space: nowrap;
          opacity: 1;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Trust Logos Section */
        .trust-section {
          padding: 4rem 1rem;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .trust-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 2rem;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .trust-strip-container {
          width: 100%;
          overflow: hidden;
          position: relative;
          padding: 1.5rem 0;
        }

        .trust-strip {
          display: flex;
          align-items: center;
          gap: 4rem;
          animation: scrollHorizontal 30s linear infinite;
          will-change: transform;
        }

        @keyframes scrollHorizontal {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .trust-logo {
          font-size: 1.2rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          white-space: nowrap;
          padding: 0.75rem 2rem;
          background: linear-gradient(
            180deg,
            rgba(10, 16, 30, 0.78) 0%,
            rgba(12, 20, 40, 0.75) 55%,
            rgba(26, 78, 170, 0.45) 100%
          );
          backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          box-shadow: 
            0 10px 26px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            inset 0 -32px 48px rgba(59, 130, 246, 0.18);
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .trust-logo:hover {
          color: rgba(255, 255, 255, 1);
          background: linear-gradient(
            180deg,
            rgba(12, 20, 38, 0.82) 0%,
            rgba(18, 28, 52, 0.78) 55%,
            rgba(34, 96, 196, 0.5) 100%
          );
          border-color: rgba(255, 255, 255, 0.16);
          transform: scale(1.05);
          box-shadow:
            0 14px 30px rgba(0, 0, 0, 0.45),
            inset 0 1px 0 rgba(255, 255, 255, 0.14),
            inset 0 -36px 54px rgba(59, 130, 246, 0.22);
        }

        /* Dual-Engine Feature Grid */
        .features-section {
          padding: 8rem 1rem;
          position: relative;
        }

        .section-header {
          text-align: center;
          margin-bottom: 5rem;
        }

        .section-title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
          opacity: 1;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
        }

        .section-subtitle {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 1);
          max-width: 600px;
          margin: 0 auto;
          opacity: 1;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        @media (min-width: 1024px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .feature-card {
          background: linear-gradient(
            180deg,
            rgba(10, 16, 30, 0.82) 0%,
            rgba(12, 20, 40, 0.78) 55%,
            rgba(26, 78, 170, 0.48) 100%
          );
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          padding: 3rem 2rem;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(20px) saturate(180%);
          z-index: 10;
          box-shadow: 
            0 16px 40px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            inset 0 -90px 120px rgba(59, 130, 246, 0.18);
          opacity: 1;
        }


        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(0, 112, 243, 0.1) 0%, rgba(225, 29, 72, 0.1) 100%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          background: linear-gradient(
            180deg,
            rgba(12, 20, 38, 0.86) 0%,
            rgba(18, 28, 52, 0.82) 55%,
            rgba(38, 110, 210, 0.55) 100%
          );
          border-color: rgba(255, 255, 255, 0.18);
          box-shadow:
            0 22px 64px rgba(0, 0, 0, 0.55),
            inset 0 1px 0 rgba(255, 255, 255, 0.16),
            inset 0 -110px 140px rgba(59, 130, 246, 0.24);
        }

        .feature-card:hover::before {
          opacity: 1;
        }

        .feature-icon {
          width: 3.5rem;
          height: 3.5rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          transition: transform 0.4s ease;
          color: rgba(255, 255, 255, 0.9);
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .feature-subtitle {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 1rem;
          font-weight: 500;
          position: relative;
          z-index: 1;
          opacity: 1;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        }

        .feature-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
          position: relative;
          z-index: 1;
          opacity: 1;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
        }

        .feature-description {
          color: rgba(255, 255, 255, 1);
          line-height: 1.6;
          position: relative;
          z-index: 1;
          margin-bottom: 1.5rem;
          opacity: 1;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);
        }

        .feature-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          position: relative;
          z-index: 1;
        }

        .feature-tag {
          padding: 0.4rem 0.8rem;
          background: rgba(0, 112, 243, 0.15);
          backdrop-filter: blur(10px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          font-size: 0.75rem;
          color: #0070f3;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0, 112, 243, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          opacity: 1;
        }

        .feature-list {
          list-style: none;
          padding: 0;
          margin: 1.5rem 0 0 0;
          position: relative;
          z-index: 1;
        }

        .feature-list li {
          list-style: none;
          padding: 0.75rem 0;
          color: rgba(255, 255, 255, 0.7);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .feature-list-icon {
          color: #22c55e;
          flex-shrink: 0;
        }

        .security-badges {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-top: 1.5rem;
          position: relative;
          z-index: 1;
        }

        .security-badge {
          padding: 1rem;
          background: linear-gradient(
            135deg,
            rgba(34, 197, 94, 0.18),
            rgba(6, 20, 12, 0.35)
          );
          backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          text-align: center;
          font-size: 0.85rem;
          color: #22c55e;
          font-weight: 600;
          box-shadow:
            0 6px 16px rgba(34, 197, 94, 0.25),
            0 0 22px rgba(34, 197, 94, 0.22),
            inset 0 0 20px rgba(34, 197, 94, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.12);
          opacity: 1;
        }

        /* Steps Section */
        .steps-section {
          padding: 8rem 1rem;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 112, 243, 0.03) 50%, rgba(0, 0, 0, 0) 100%);
        }

        .steps-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 3rem;
        }

        .step-card {
          text-align: center;
          position: relative;
          padding: 2rem;
          background: linear-gradient(
            180deg,
            rgba(10, 16, 30, 0.8) 0%,
            rgba(12, 20, 40, 0.76) 55%,
            rgba(26, 78, 170, 0.42) 100%
          );
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          backdrop-filter: blur(20px) saturate(180%);
          z-index: 10;
          box-shadow:
            0 14px 34px rgba(0, 0, 0, 0.45),
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            inset 0 -70px 100px rgba(59, 130, 246, 0.16);
          opacity: 1;
        }

        .step-number {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #0070f3, #9333ea);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
          font-size: 1.5rem;
          font-weight: 900;
          color: white;
          box-shadow: 0 10px 30px rgba(0, 112, 243, 0.3);
        }

        .step-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
          opacity: 1;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
        }

        .step-description {
          color: rgba(255, 255, 255, 1);
          line-height: 1.6;
          opacity: 1;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);
        }

        .step-card-arrow {
          position: absolute;
          right: -1.5rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(0, 112, 243, 0.3);
        }

        .step-card:last-child .step-card-arrow {
          display: none;
        }

        /* Stats Section */
        .stats-section {
          padding: 6rem 1rem;
          background: linear-gradient(135deg, rgba(0, 112, 243, 0.05), rgba(147, 51, 234, 0.05));
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .stats-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 3rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .stat-item {
          text-align: center;
          padding: 2rem;
          background: linear-gradient(
            180deg,
            rgba(10, 16, 30, 0.82) 0%,
            rgba(12, 20, 40, 0.78) 55%,
            rgba(26, 78, 170, 0.48) 100%
          );
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(20px) saturate(180%);
          transition: all 0.3s ease;
          z-index: 10;
          box-shadow:
            0 16px 38px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            inset 0 -90px 120px rgba(59, 130, 246, 0.18);
          opacity: 1;
        }

        .stat-item:hover {
          transform: translateY(-10px);
          background: linear-gradient(
            180deg,
            rgba(12, 20, 38, 0.86) 0%,
            rgba(18, 28, 52, 0.82) 55%,
            rgba(38, 110, 210, 0.55) 100%
          );
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow:
            0 22px 46px rgba(0, 0, 0, 0.55),
            inset 0 1px 0 rgba(255, 255, 255, 0.16),
            inset 0 -110px 140px rgba(59, 130, 246, 0.24);
        }

        .stat-number {
          font-size: 3.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, #0070f3, #e11d48);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* CTA Section */
        .cta-section {
          padding: 8rem 1rem;
          text-align: center;
          position: relative;
        }

        .cta-box {
          max-width: 900px;
          margin: 0 auto;
          padding: 5rem 3rem;
          background: linear-gradient(135deg, rgba(0, 112, 243, 0.12) 0%, rgba(225, 29, 72, 0.12) 100%);
          border: 2px solid rgba(255, 255, 255, 0.25);
          border-radius: 32px;
          backdrop-filter: blur(20px) saturate(180%);
          position: relative;
          overflow: hidden;
          z-index: 10;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15);
          opacity: 1;
        }

        .cta-box::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(0, 112, 243, 0.1) 0%, transparent 70%);
          animation: rotate 20s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .cta-content {
          position: relative;
          z-index: 1;
        }

        .cta-title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          color: white;
          margin-bottom: 1.5rem;
          opacity: 1;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
        }

        .cta-text {
          font-size: 1.3rem;
          color: rgba(255, 255, 255, 1);
          margin-bottom: 2.5rem;
          line-height: 1.6;
          opacity: 1;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
        }

        .cta-buttons-final {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-buttons-final a {
          text-decoration: none;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0.625rem 1.75rem !important;
          gap: 0.5rem !important;
        }

        /* Footer */
        .footer {
          padding: 3rem 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(0, 0, 0, 0.5);
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 2rem;
        }

        .footer-logo {
          font-size: 1.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, #0070f3, #9333ea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .footer-links {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .footer-links a {
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .footer-links a:hover {
          color: #0070f3;
        }

        .footer-copyright {
          width: 100%;
          text-align: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .hero {
            min-height: 90vh;
          }


          .stats-container {
            grid-template-columns: repeat(2, 1fr);
          }

          .features-grid {
            grid-template-columns: 1fr;
          }


          .steps-container {
            grid-template-columns: 1fr;
          }

          .step-card::after {
            display: none;
          }

          .cta-box {
            padding: 3rem 1.5rem;
          }

          .footer-content {
            flex-direction: column;
            text-align: center;
          }

          .footer-links {
            justify-content: center;
          }
        }
      `}</style>

      {mounted && (
        <div className="fixed inset-0 z-0 pointer-events-none w-screen h-screen">
          <DitheringShader
            shape="wave"
            type="8x8"
            colorBack="#000000"
            colorFront="#3b82f6"
            pxSize={3}
            speed={0.4}
            className="w-full h-full"
          />
        </div>
      )}

      <div className="content-wrapper">
        {/* Hero Section with Dashboard Mockup */}
        <section className="hero">
          <div className="hero-content">
            <div className="new-badge">
              <Sparkles
                size={16}
                style={{
                  display: "inline-block",
                  marginRight: "0.5rem",
                  verticalAlign: "middle",
                }}
              />
              Now Live: AutoML + OLS Engines
            </div>
            <h1 className="hero-title">
              Stop Guessing.
              <br />
              Predict <span className="accent">Revenue</span> with Certainty.
            </h1>
            <p className="hero-subtitle">
              Transform sales hiring from gut calls into measurable outcomes.
              Get ~95% confidence revenue estimates for new hires with
              enterprise-grade ML built for SMBs.
            </p>
            <div className="cta-buttons">
              <GradientButton asChild>
                <Link href="/SignUp">Start Predicting Now</Link>
              </GradientButton>
              <GradientButton variant="variant" asChild>
                <Link href="/SignIn">Watch Demo</Link>
              </GradientButton>
            </div>
          </div>
        </section>

        {/* Dashboard Mockup with Scroll Animation */}
        <ContainerScroll titleComponent={null}>
          <div className="dashboard-content">
            {/* Header Section */}
            <header className="dashboard-header">
              <h3 className="dashboard-title">Revenue Prediction Dashboard</h3>
              <div className="confidence-badge">
                <Circle
                  size={8}
                  fill="currentColor"
                  style={{ display: "inline-block", marginRight: "0.5rem" }}
                />
                <span>95.2% Confidence</span>
              </div>
            </header>

            {/* Metrics Section */}
            <section className="dashboard-metrics">
              <div className="metric-card">
                <div className="metric-label">Predicted Revenue</div>
                <div className="metric-value">$24,500</div>
                <div className="metric-label" style={{ marginTop: "0.5rem" }}>
                  per week
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Model R²</div>
                <div className="metric-value">0.952</div>
                <div className="metric-label" style={{ marginTop: "0.5rem" }}>
                  fit score
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Best Algorithm</div>
                <div className="metric-value" style={{ fontSize: "1.3rem" }}>
                  XGBoost
                </div>
                <div className="metric-label" style={{ marginTop: "0.5rem" }}>
                  ensemble
                </div>
              </div>
            </section>

            {/* Chart Section */}
            <section
              className={`chart-container ${chartVisible ? "visible" : ""}`}
              ref={chartRef}
            >
              <div className="chart-bar">
                <div className="chart-label">RF</div>
              </div>
              <div className="chart-bar">
                <div className="chart-label">XGB</div>
              </div>
              <div className="chart-bar">
                <div className="chart-label">OLS</div>
              </div>
              <div className="chart-bar">
                <div className="chart-label">SVR</div>
              </div>
              <div className="chart-bar">
                <div className="chart-label">NN</div>
              </div>
            </section>
          </div>
        </ContainerScroll>

        {/* Trust Logos */}
        <section className="trust-section">
          <div className="trust-label">Trusted by leading SMBs</div>
          <div className="trust-strip-container">
            <div className="trust-strip">
              <div className="trust-logo">Acme Corp</div>
              <div className="trust-logo">SalesForce One</div>
              <div className="trust-logo">Global Tech</div>
              <div className="trust-logo">NextGen SMB</div>
              <div className="trust-logo">FutureScale</div>
              {/* Duplicate for seamless loop */}
              <div className="trust-logo">Acme Corp</div>
              <div className="trust-logo">SalesForce One</div>
              <div className="trust-logo">Global Tech</div>
              <div className="trust-logo">NextGen SMB</div>
              <div className="trust-logo">FutureScale</div>
            </div>
          </div>
        </section>

        {/* Dual-Engine Feature Grid */}
        <section className="features-section">
          <div className="section-header">
            <h2 className="section-title">Dual AI Engine Architecture</h2>
            <p className="section-subtitle">
              Choose between maximum fit quality and maximum interpretability—or
              use both.
            </p>
          </div>
          <div className="features-grid">
            {/* Card 1: Dual-Engine Forecasting */}
            <div className="feature-card">
              <div className="feature-icon">
                <Layers
                  aria-label="Dual-Engine Forecasting"
                  size={56}
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="feature-title">Dual-Engine Forecasting</h3>
              <p className="feature-subtitle">
                Fit quality meets interpretability
              </p>
              <p className="feature-description">
                Choose between high-fidelity AutoML forecasts or transparent
                regression analysis — or run both engines together. Get
                predictive power <em>and</em> statistical clarity.
              </p>
            </div>

            {/* Card 2: Revenue-Per-Hire Forecast */}
            <div className="feature-card">
              <div className="feature-icon">
                <TrendingUp
                  aria-label="Revenue-Per-Hire Forecast"
                  size={56}
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="feature-title">Revenue-Per-Hire Forecast</h3>
              <p className="feature-subtitle">
                Know hire value before you sign
              </p>
              <p className="feature-description">
                See predicted weekly or monthly revenue per candidate — with
                clear confidence intervals. Evaluate hires not on hope, but on
                expected return.
              </p>
            </div>

            {/* Card 3: Team & Candidate Comparison Dashboard */}
            <div className="feature-card">
              <div className="feature-icon">
                <LayoutGrid
                  aria-label="Team & Candidate Comparison Dashboard"
                  size={56}
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="feature-title">
                Team & Candidate Comparison Dashboard
              </h3>
              <p className="feature-subtitle">Side-by-side ROI clarity</p>
              <p className="feature-description">
                Compare multiple candidates or team compositions at once. View
                ROI projections, confidence bounds, and stability metrics — pick
                the best fit for your budget and goals.
              </p>
            </div>

            {/* Card 4: Enterprise-Grade Security & Compliance */}
            <div className="feature-card">
              <div className="feature-icon">
                <Shield
                  aria-label="Enterprise-Grade Security & Compliance"
                  size={56}
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="feature-title">
                Enterprise-Grade Security & Compliance
              </h3>
              <p className="feature-subtitle">
                Secure, compliant, ready for scale
              </p>
              <p className="feature-description">
                Bank-grade data encryption, tenant isolation, secure
                architecture and compliance-ready infrastructure — ideal for
                SMBs, growing businesses, or clients with sensitive data.
              </p>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="steps-section">
          <div className="section-header">
            <h2 className="section-title">From Upload to Insight in Seconds</h2>
            <p className="section-subtitle">
              Three simple steps to transform your sales data into revenue
              predictions
            </p>
          </div>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Upload Data</h3>
              <p className="step-description">
                Drag & drop your CSV. Our AI automatically cleans, validates,
                and normalizes your sales data in milliseconds.
              </p>
              <ArrowRight className="step-card-arrow" size={32} />
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Train Model</h3>
              <p className="step-description">
                AI tests thousands of feature permutations and algorithm
                combinations to find the optimal predictive model.
              </p>
              <ArrowRight className="step-card-arrow" size={32} />
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Get Results</h3>
              <p className="step-description">
                Receive revenue predictions with 95% confidence intervals,
                actionable insights, and exportable reports.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">Confidence Interval</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">10+</div>
              <div className="stat-label">ML Algorithms</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">&lt;50ms</div>
              <div className="stat-label">Inference Latency</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Data Isolation</div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="cta-section">
          <div className="cta-box">
            <div className="cta-content">
              <h2 className="cta-title">
                Ready to Optimize Your Sales Workforce?
              </h2>
              <p className="cta-text">
                Join leading SMBs using APTECH to make data-driven hiring
                decisions with 95% confidence.
              </p>
              <div className="cta-buttons-final">
                <GradientButton asChild>
                  <Link href="/SignUp">Create Free Account</Link>
                </GradientButton>
                <GradientButton variant="variant" asChild>
                  <Link href="/SignIn">Talk to Sales</Link>
                </GradientButton>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
