"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Globe, 
  Mail, 
  Settings2,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Clipboard,
} from "lucide-react";
import { cn } from "../lib/cn";
import { Button } from "./ui/Button";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "./ui/Drawer";
import { useCreateTarget } from "../lib/hooks";
import { useToastHelpers } from "./ToastProvider";
import {
  CreateTargetInputSchema,
  type CreateTargetFormInput,
} from "../lib/apiTypes";

interface AddTargetDrawerProps {
  onSuccess?: () => void;
}

// Platform detection patterns
const PLATFORM_PATTERNS = [
  { pattern: /acuity|acuityscheduling/i, type: "acuity", name: "Acuity Scheduling", color: "#00B2FF" },
  { pattern: /calendly/i, type: "calendly", name: "Calendly", color: "#006BFF" },
  { pattern: /dmv|motor.*vehicle/i, type: "dmv", name: "DMV", color: "#22C55E" },
  { pattern: /passport|travel\.state\.gov/i, type: "passport", name: "Passport Services", color: "#0057B8" },
  { pattern: /uscis|immigration/i, type: "uscis", name: "USCIS", color: "#EF4444" },
] as const;

function detectPlatform(url: string): { type: string; name: string; color: string } | null {
  if (!url) return null;
  for (const platform of PLATFORM_PATTERNS) {
    if (platform.pattern.test(url)) {
      return { type: platform.type, name: platform.name, color: platform.color };
    }
  }
  return null;
}

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * Add Target drawer with modern glassmorphism form styling.
 * Includes URL preview, platform auto-detection, and advanced options.
 */
export function AddTargetDrawer({ onSuccess }: AddTargetDrawerProps) {
  const [open, setOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { success, error: showError } = useToastHelpers();
  const createTarget = useCreateTarget();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTargetFormInput>({
    resolver: zodResolver(CreateTargetInputSchema),
    defaultValues: {
      type: "unknown",
      active: true,
    },
  });

  // Watch the booking URL for preview and auto-detection
  const bookingUrl = useWatch({ control, name: "bookingUrl" });
  const [urlValidation, setUrlValidation] = useState<{
    status: "idle" | "validating" | "valid" | "invalid";
    domain?: string;
    platform?: { type: string; name: string; color: string } | null;
  }>({ status: "idle" });

  // Validate URL and detect platform
  useEffect(() => {
    if (!bookingUrl) {
      setUrlValidation({ status: "idle" });
      return;
    }

    // Simple URL validation
    try {
      new URL(bookingUrl);
      const domain = extractDomain(bookingUrl);
      const platform = detectPlatform(bookingUrl);
      
      setUrlValidation({
        status: "valid",
        domain,
        platform,
      });

      // Auto-set platform type if detected
      if (platform && platform.type !== "unknown") {
        setValue("type", platform.type as CreateTargetFormInput["type"]);
      }
    } catch {
      setUrlValidation({ status: "invalid" });
    }
  }, [bookingUrl, setValue]);

  // Paste from clipboard
  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.startsWith("http")) {
        setValue("bookingUrl", text);
      }
    } catch {
      // Clipboard access denied
    }
  }, [setValue]);

  const onSubmit = useCallback(
    async (data: CreateTargetFormInput) => {
      try {
        await createTarget.mutateAsync(data);
        success("Target added", `${data.name} is now being monitored.`);
        reset();
        setOpen(false);
        onSuccess?.();
      } catch (err) {
        showError(
          "Failed to add target",
          err instanceof Error ? err.message : "Please try again"
        );
      }
    },
    [createTarget, success, showError, reset, onSuccess]
  );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="secondary">
          <Plus className="h-4 w-4" />
          Add target
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-[#0A0A0A]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DrawerHeader className="border-b border-white/[0.08]">
            <DrawerTitle className="text-xl">Add a new target</DrawerTitle>
            <DrawerDescription>
              Configure a booking target to monitor for availability.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {/* Name */}
            <div className="space-y-3">
              <label
                htmlFor="name"
                className="flex items-center gap-2 text-sm font-semibold text-foreground"
              >
                <Settings2 className="h-4 w-4 text-accent" />
                Target name <span className="text-error">*</span>
              </label>
              <input
                id="name"
                type="text"
                placeholder="e.g., Downtown DMV"
                className={cn(
                  "w-full rounded-xl px-4 py-3 text-sm text-foreground",
                  "bg-white/[0.04] backdrop-blur-sm",
                  "border border-white/[0.1]",
                  "placeholder:text-foreground-muted/40",
                  "focus:bg-white/[0.06] focus:border-accent/50",
                  "focus:shadow-[0_0_0_4px_rgba(0,212,255,0.1)]",
                  "focus:outline-none transition-all duration-200",
                  errors.name && "border-error/50 focus:border-error"
                )}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-error font-medium" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Booking URL with preview */}
            <div className="space-y-3">
              <label
                htmlFor="bookingUrl"
                className="flex items-center justify-between text-sm font-semibold text-foreground"
              >
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-teal" />
                  Booking URL <span className="text-error">*</span>
                </span>
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground transition-colors"
                >
                  <Clipboard className="h-3 w-3" />
                  Paste
                </button>
              </label>
              <div className="relative">
                <input
                  id="bookingUrl"
                  type="url"
                  placeholder="https://example.gov/booking"
                  className={cn(
                    "w-full rounded-xl px-4 py-3 pr-10 text-sm text-foreground",
                    "bg-white/[0.04] backdrop-blur-sm",
                    "border border-white/[0.1]",
                    "placeholder:text-foreground-muted/40",
                    "focus:bg-white/[0.06] focus:border-accent/50",
                    "focus:shadow-[0_0_0_4px_rgba(0,212,255,0.1)]",
                    "focus:outline-none transition-all duration-200",
                    errors.bookingUrl && "border-error/50 focus:border-error"
                  )}
                  {...register("bookingUrl")}
                />
                {/* Validation indicator */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AnimatePresence mode="wait">
                    {urlValidation.status === "validating" && (
                      <motion.div
                        key="validating"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <Loader2 className="h-4 w-4 text-foreground-muted animate-spin" />
                      </motion.div>
                    )}
                    {urlValidation.status === "valid" && (
                      <motion.div
                        key="valid"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <CheckCircle className="h-4 w-4 text-success" />
                      </motion.div>
                    )}
                    {urlValidation.status === "invalid" && (
                      <motion.div
                        key="invalid"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <AlertCircle className="h-4 w-4 text-error" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              {errors.bookingUrl && (
                <p className="text-xs text-error font-medium" role="alert">
                  {errors.bookingUrl.message}
                </p>
              )}

              {/* URL Preview Card */}
              <AnimatePresence>
                {urlValidation.status === "valid" && urlValidation.domain && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                      <div className="flex items-center gap-3">
                        {/* Favicon placeholder */}
                        <div 
                          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.1]"
                          style={{ 
                            backgroundColor: urlValidation.platform?.color 
                              ? `${urlValidation.platform.color}20` 
                              : "rgba(255, 255, 255, 0.05)" 
                          }}
                        >
                          <Globe 
                            className="h-5 w-5" 
                            style={{ color: urlValidation.platform?.color || "#888" }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {urlValidation.domain}
                          </p>
                          {urlValidation.platform ? (
                            <p 
                              className="text-xs font-medium flex items-center gap-1"
                              style={{ color: urlValidation.platform.color }}
                            >
                              <CheckCircle className="h-3 w-3" />
                              {urlValidation.platform.name} detected
                            </p>
                          ) : (
                            <p className="text-xs text-foreground-muted">
                              Generic booking page
                            </p>
                          )}
                        </div>
                        <a
                          href={bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4 text-foreground-muted" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Alert Email */}
            <div className="space-y-3">
              <label
                htmlFor="alertEmail"
                className="flex items-center gap-2 text-sm font-semibold text-foreground"
              >
                <Mail className="h-4 w-4 text-accent" />
                Alert email <span className="text-error">*</span>
              </label>
              <input
                id="alertEmail"
                type="email"
                placeholder="alerts@example.com"
                className={cn(
                  "w-full rounded-xl px-4 py-3 text-sm text-foreground",
                  "bg-white/[0.04] backdrop-blur-sm",
                  "border border-white/[0.1]",
                  "placeholder:text-foreground-muted/40",
                  "focus:bg-white/[0.06] focus:border-accent/50",
                  "focus:shadow-[0_0_0_4px_rgba(0,212,255,0.1)]",
                  "focus:outline-none transition-all duration-200",
                  errors.alertEmail && "border-error/50 focus:border-error"
                )}
                {...register("alertEmail")}
              />
              {errors.alertEmail && (
                <p className="text-xs text-error font-medium" role="alert">
                  {errors.alertEmail.message}
                </p>
              )}
            </div>

            {/* Advanced Section */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-foreground-muted transition-colors hover:text-foreground hover:bg-white/[0.03]"
              >
                <span className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  Advanced options
                </span>
                {showAdvanced ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-5 px-4 pb-4 pt-2 border-t border-white/[0.06]">
                      {/* Type */}
                      <div className="space-y-3">
                        <label
                          htmlFor="type"
                          className="text-sm font-semibold text-foreground"
                        >
                          Target type
                        </label>
                        <select
                          id="type"
                          className={cn(
                            "w-full rounded-xl px-4 py-3 text-sm text-foreground",
                            "bg-white/[0.04] backdrop-blur-sm",
                            "border border-white/[0.1]",
                            "focus:bg-white/[0.06] focus:border-accent/50",
                            "focus:shadow-[0_0_0_4px_rgba(0,212,255,0.1)]",
                            "focus:outline-none transition-all duration-200",
                            errors.type && "border-error/50"
                          )}
                          {...register("type")}
                        >
                          <option value="unknown">Auto-detect</option>
                          <option value="acuity">Acuity Scheduling</option>
                          <option value="calendly">Calendly</option>
                          <option value="generic">Generic</option>
                        </select>
                        {urlValidation.platform && (
                          <p className="text-xs text-success flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Auto-detected: {urlValidation.platform.name}
                          </p>
                        )}
                        {errors.type && (
                          <p className="text-xs text-error font-medium" role="alert">
                            {errors.type.message}
                          </p>
                        )}
                      </div>

                      {/* Requirements URL */}
                      <div className="space-y-3">
                        <label
                          htmlFor="requirementsUrl"
                          className="text-sm font-semibold text-foreground"
                        >
                          Requirements URL
                        </label>
                        <input
                          id="requirementsUrl"
                          type="url"
                          placeholder="https://example.gov/requirements"
                          className={cn(
                            "w-full rounded-xl px-4 py-3 text-sm text-foreground",
                            "bg-white/[0.04] backdrop-blur-sm",
                            "border border-white/[0.1]",
                            "placeholder:text-foreground-muted/40",
                            "focus:bg-white/[0.06] focus:border-accent/50",
                            "focus:shadow-[0_0_0_4px_rgba(0,212,255,0.1)]",
                            "focus:outline-none transition-all duration-200",
                            errors.requirementsUrl && "border-error/50"
                          )}
                          {...register("requirementsUrl")}
                        />
                        {errors.requirementsUrl && (
                          <p className="text-xs text-error font-medium" role="alert">
                            {errors.requirementsUrl.message}
                          </p>
                        )}
                        <p className="text-xs text-foreground-muted">
                          Optional link to appointment requirements.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Active toggle */}
            <label className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 cursor-pointer hover:bg-white/[0.04] transition-colors">
              <div className="relative">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  {...register("active")}
                />
                <div className="h-6 w-11 rounded-full bg-white/[0.1] peer-checked:bg-accent transition-colors" />
                <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform peer-checked:translate-x-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground">
                  Start monitoring immediately
                </span>
                <p className="text-xs text-foreground-muted mt-0.5">
                  Begin checking for availability right away
                </p>
              </div>
            </label>
          </div>

          <DrawerFooter className="border-t border-white/[0.08] bg-white/[0.02]">
            <DrawerClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DrawerClose>
            <Button type="submit" isLoading={isSubmitting}>
              Save target
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
