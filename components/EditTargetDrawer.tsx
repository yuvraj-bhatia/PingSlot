"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, ChevronDown, ChevronUp, Globe, Mail, Settings2 } from "lucide-react";
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
import { useUpdateTarget } from "../lib/hooks";
import { useToastHelpers } from "./ToastProvider";
import {
  UpdateTargetInputSchema,
  type UpdateTargetFormInput,
  type TargetDetail,
} from "../lib/apiTypes";

interface EditTargetDrawerProps {
  target: TargetDetail;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

/**
 * Edit Target drawer with modern glassmorphism form styling.
 * Pre-populates form with existing target data.
 */
export function EditTargetDrawer({ target, onSuccess, trigger }: EditTargetDrawerProps) {
  const [open, setOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { success, error: showError } = useToastHelpers();
  const updateTarget = useUpdateTarget();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateTargetFormInput>({
    resolver: zodResolver(UpdateTargetInputSchema),
    defaultValues: {
      name: target.name,
      bookingUrl: target.bookingUrl || "",
      type: (target.type as "acuity" | "generic" | "unknown") || "unknown",
      requirementsUrl: target.requirementsUrl || "",
      alertEmail: target.alertEmail,
      active: target.active ?? true,
    },
  });

  // Reset form when target changes or drawer opens
  useEffect(() => {
    if (open) {
      reset({
        name: target.name,
        bookingUrl: target.bookingUrl || "",
        type: (target.type as "acuity" | "generic" | "unknown") || "unknown",
        requirementsUrl: target.requirementsUrl || "",
        alertEmail: target.alertEmail,
        active: target.active ?? true,
      });
    }
  }, [open, target, reset]);

  const onSubmit = useCallback(
    async (data: UpdateTargetFormInput) => {
      try {
        await updateTarget.mutateAsync({ id: target.id, data });
        success("Target updated", `${data.name || target.name} has been updated.`);
        setOpen(false);
        onSuccess?.();
      } catch (err) {
        showError(
          "Failed to update target",
          err instanceof Error ? err.message : "Please try again"
        );
      }
    },
    [updateTarget, target.id, target.name, success, showError, onSuccess]
  );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {trigger || (
          <Button variant="secondary" size="sm">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent className="bg-[hsl(222,47%,9%)]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DrawerHeader className="border-b border-white/[0.08]">
            <DrawerTitle className="text-xl">Edit target</DrawerTitle>
            <DrawerDescription>
              Update the configuration for {target.name}.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {/* Name */}
            <div className="space-y-3">
              <label
                htmlFor="edit-name"
                className="flex items-center gap-2 text-sm font-semibold text-foreground"
              >
                <Settings2 className="h-4 w-4 text-accent" />
                Target name <span className="text-error">*</span>
              </label>
              <input
                id="edit-name"
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
                htmlFor="edit-bookingUrl"
                className="flex items-center gap-2 text-sm font-semibold text-foreground"
              >
                <Globe className="h-4 w-4 text-teal" />
                Booking URL <span className="text-error">*</span>
              </label>
              <input
                id="edit-bookingUrl"
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
                htmlFor="edit-alertEmail"
                className="flex items-center gap-2 text-sm font-semibold text-foreground"
              >
                <Mail className="h-4 w-4 text-accent" />
                Alert email <span className="text-error">*</span>
              </label>
              <input
                id="edit-alertEmail"
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
                      htmlFor="edit-type"
                      className="text-sm font-semibold text-foreground"
                    >
                      Target type
                    </label>
                    <select
                      id="edit-type"
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
                      htmlFor="edit-requirementsUrl"
                      className="text-sm font-semibold text-foreground"
                    >
                      Requirements URL
                    </label>
                    <input
                      id="edit-requirementsUrl"
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
                  Active monitoring
                </span>
                <p className="text-xs text-foreground-muted mt-0.5">
                  Enable or disable availability checks
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
            <Button 
              type="submit" 
              isLoading={isSubmitting}
              disabled={!isDirty}
            >
              Save changes
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
