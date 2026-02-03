"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Calendar, Copy, ExternalLink, PartyPopper } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { formatHumanDate } from "../../lib/formatters";

interface ConfirmationCardProps {
  confirmationNumber: string;
  datetime: string;
  targetName: string;
  bookingUrl?: string;
  className?: string;
}

/**
 * Success confirmation card with confetti animation.
 * Displays booking confirmation details.
 */
export function ConfirmationCard({
  confirmationNumber,
  datetime,
  targetName,
  bookingUrl,
  className,
}: ConfirmationCardProps) {
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(confirmationNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Confetti animation */}
      {showConfetti && <Confetti />}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card variant="glass" className="overflow-hidden">
          {/* Success header */}
          <div className="relative bg-gradient-to-r from-success/20 to-success/5 px-6 py-8 text-center">
            {/* Glow effect */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: "radial-gradient(circle at 50% 0%, rgba(34, 197, 94, 0.4) 0%, transparent 70%)",
              }}
            />
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success shadow-[0_0_40px_rgba(34,197,94,0.5)]"
            >
              <Check className="h-10 w-10 text-white" strokeWidth={3} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative mt-4"
            >
              <h2 className="text-2xl font-bold text-foreground">
                Booking Confirmed!
              </h2>
              <p className="mt-2 text-foreground-muted">
                Your appointment has been successfully booked
              </p>
            </motion.div>
          </div>

          <CardContent className="space-y-6 p-6">
            {/* Confirmation details */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              {/* Target name */}
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  Appointment
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {targetName}
                </p>
              </div>

              {/* Date & Time */}
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  Date & Time
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {formatHumanDate(datetime)}
                </p>
              </div>

              {/* Confirmation number */}
              <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                      Confirmation Number
                    </p>
                    <p className="mt-1 font-mono text-xl font-bold text-foreground">
                      {confirmationNumber}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleCopy}
                    className="text-foreground-muted hover:text-foreground"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col gap-3 pt-2"
            >
              <Button variant="primary" className="w-full">
                <Calendar className="h-4 w-4" />
                Add to Calendar
              </Button>
              
              {bookingUrl && (
                <Button variant="secondary" asChild className="w-full">
                  <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    View Booking Details
                  </a>
                </Button>
              )}
            </motion.div>

            {/* Note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center text-xs text-foreground-muted"
            >
              A confirmation email has been sent to your registered email address.
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/**
 * Confetti animation component.
 */
function Confetti() {
  const colors = ["#00D4FF", "#22C55E", "#7C3AED", "#FFD700", "#4DE8FF"];
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 8 + 4,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: -20,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
          initial={{
            y: -20,
            rotate: piece.rotation,
            opacity: 1,
          }}
          animate={{
            y: "100vh",
            rotate: piece.rotation + 720,
            opacity: 0,
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: piece.delay,
            ease: "easeIn",
          }}
        />
      ))}
      
      {/* Party popper icon */}
      <motion.div
        className="absolute left-1/2 top-1/4 -translate-x-1/2"
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: [0, 1.5, 1], rotate: [0, 15, 0] }}
        transition={{ duration: 0.5, times: [0, 0.6, 1] }}
      >
        <PartyPopper className="h-12 w-12 text-accent" />
      </motion.div>
    </div>
  );
}
