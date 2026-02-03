"use client";

import { motion } from "framer-motion";
import { Plus, Target, Bell, Zap, ArrowRight } from "lucide-react";
import { cn } from "../lib/cn";
import { Button } from "./ui/Button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  variant?: "default" | "minimal" | "featured";
  className?: string;
}

/**
 * EmptyState - Animated empty state component with clear CTAs.
 * Features a subtle animated illustration and action buttons.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  secondaryAction,
  variant = "default",
  className,
}: EmptyStateProps) {
  if (variant === "minimal") {
    return (
      <motion.div
        className={cn(
          "flex flex-col items-center justify-center py-12 px-6 text-center",
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {icon && (
          <div className="mb-4 text-foreground-muted">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-foreground-muted max-w-md">{description}</p>
        {action && (
          <Button
            variant="primary"
            className="mt-6"
            onClick={action.onClick}
            asChild={!!action.href}
          >
            {action.href ? (
              <a href={action.href}>{action.label}</a>
            ) : (
              action.label
            )}
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-[#0A0A0A]/80 border border-white/[0.08]",
        "p-8 sm:p-12",
        className
      )}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0, 212, 255, 0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0, 87, 184, 0.06) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
      </div>

      <div className="relative flex flex-col items-center text-center">
        {/* Animated Illustration */}
        <EmptyStateIllustration className="mb-8" />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-3">
            {title}
          </h3>
          <p className="text-foreground-muted max-w-md mx-auto mb-8">
            {description}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {action && (
              <Button
                variant="primary"
                size="lg"
                onClick={action.onClick}
                asChild={!!action.href}
              >
                {action.href ? (
                  <a href={action.href} className="inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {action.label}
                  </a>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    {action.label}
                  </>
                )}
              </Button>
            )}
            {secondaryAction && (
              <Button
                variant="ghost"
                onClick={secondaryAction.onClick}
                asChild={!!secondaryAction.href}
              >
                {secondaryAction.href ? (
                  <a href={secondaryAction.href} className="inline-flex items-center gap-2">
                    {secondaryAction.label}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                ) : (
                  <>
                    {secondaryAction.label}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/**
 * Animated SVG illustration for empty states.
 * Shows monitoring concept with pulsing elements.
 */
function EmptyStateIllustration({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-48 h-48", className)}>
      {/* Central target icon */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 212, 255, 0.05) 100%)",
            border: "1px solid rgba(0, 212, 255, 0.3)",
            boxShadow: "0 0 40px rgba(0, 212, 255, 0.2)",
          }}
        >
          <Target className="w-10 h-10 text-accent" />
        </div>
      </motion.div>

      {/* Orbiting elements */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {/* Bell icon */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(0, 87, 184, 0.2) 0%, rgba(0, 87, 184, 0.05) 100%)",
              border: "1px solid rgba(0, 87, 184, 0.3)",
            }}
          >
            <Bell className="w-5 h-5 text-teal" />
          </div>
        </motion.div>

        {/* Zap icon */}
        <motion.div
          className="absolute bottom-2 right-2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.05) 100%)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
            }}
          >
            <Zap className="w-5 h-5 text-success" />
          </div>
        </motion.div>
      </motion.div>

      {/* Pulse rings */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            className="absolute rounded-full border border-accent/20"
            style={{
              width: `${60 + ring * 30}%`,
              height: `${60 + ring * 30}%`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: ring * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

/**
 * Dashboard-specific empty state for targets list.
 */
export function TargetsEmptyState({ onAddTarget }: { onAddTarget?: () => void }) {
  return (
    <EmptyState
      title="No targets yet"
      description="Start monitoring appointment availability by adding your first target. We'll check for open slots and notify you instantly."
      action={{
        label: "Add Your First Target",
        onClick: onAddTarget,
      }}
      secondaryAction={{
        label: "Learn how it works",
        href: "/landing#how-it-works",
      }}
    />
  );
}

/**
 * Empty state for check history.
 */
export function CheckHistoryEmptyState() {
  return (
    <EmptyState
      variant="minimal"
      title="No checks yet"
      description="Run your first check to see the history here."
      icon={<Target className="h-12 w-12" />}
    />
  );
}

/**
 * Empty state for no available slots.
 */
export function NoSlotsEmptyState() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-8 px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: "linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 212, 255, 0.02) 100%)",
          border: "1px solid rgba(0, 212, 255, 0.15)",
        }}
      >
        <Target className="h-8 w-8 text-foreground-muted" />
      </div>
      <h4 className="text-base font-medium text-foreground mb-1">No slots available</h4>
      <p className="text-sm text-foreground-muted max-w-xs">
        We&apos;ll keep monitoring and notify you when appointments open up.
      </p>
    </motion.div>
  );
}
