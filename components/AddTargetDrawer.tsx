"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, ChevronDown, ChevronUp, Globe, Mail, Settings2 } from "lucide-react";
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

/**
 * Add Target drawer with modern glassmorphism form styling.
 * Includes advanced section for type and requirements URL.
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
    formState: { errors, isSubmitting },
  } = useForm<CreateTargetFormInput>({
    resolver: zodResolver(CreateTargetInputSchema),
    defaultValues: {
      type: "unknown",
      active: true,
    },
  });

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
      <DrawerContent className="bg-[hsl(222,47%,9%)]">
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
                  "focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]",
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

            {/* Booking URL */}
            <div className="space-y-3">
              <label
                htmlFor="bookingUrl"
                className="flex items-center gap-2 text-sm font-semibold text-foreground"
              >
                <Globe className="h-4 w-4 text-teal" />
                Booking URL <span className="text-error">*</span>
              </label>
              <input
                id="bookingUrl"
                type="url"
                placeholder="https://example.gov/booking"
                className={cn(
                  "w-full rounded-xl px-4 py-3 text-sm text-foreground",
                  "bg-white/[0.04] backdrop-blur-sm",
                  "border border-white/[0.1]",
                  "placeholder:text-foreground-muted/40",
                  "focus:bg-white/[0.06] focus:border-accent/50",
                  "focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]",
                  "focus:outline-none transition-all duration-200",
                  errors.bookingUrl && "border-error/50 focus:border-error"
                )}
                {...register("bookingUrl")}
              />
              {errors.bookingUrl && (
                <p className="text-xs text-error font-medium" role="alert">
                  {errors.bookingUrl.message}
                </p>
              )}
              <p className="text-xs text-foreground-muted">
                Must be a valid HTTPS URL for the booking page.
              </p>
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
                  "focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]",
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

              {showAdvanced && (
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
                        "focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]",
                        "focus:outline-none transition-all duration-200",
                        errors.type && "border-error/50"
                      )}
                      {...register("type")}
                    >
                      <option value="unknown">Unknown (auto-detect)</option>
                      <option value="acuity">Acuity Scheduling</option>
                      <option value="generic">Generic</option>
                    </select>
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
                        "focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]",
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
              )}
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
