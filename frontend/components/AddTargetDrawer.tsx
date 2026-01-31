"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
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
 * Add Target drawer with form validation (RHF + Zod).
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
        <Button>
          <Plus className="h-4 w-4" />
          Add target
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DrawerHeader>
            <DrawerTitle>Add a target</DrawerTitle>
            <DrawerDescription>
              Configure a new booking target to monitor for availability.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {/* Name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Target name <span className="text-error">*</span>
              </label>
              <input
                id="name"
                type="text"
                placeholder="e.g., Downtown DMV"
                className={cn(
                  "w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted/50",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  errors.name && "border-error"
                )}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-error" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Booking URL */}
            <div className="space-y-2">
              <label
                htmlFor="bookingUrl"
                className="text-sm font-medium text-foreground"
              >
                Booking URL <span className="text-error">*</span>
              </label>
              <input
                id="bookingUrl"
                type="url"
                placeholder="https://example.gov/booking"
                className={cn(
                  "w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted/50",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  errors.bookingUrl && "border-error"
                )}
                {...register("bookingUrl")}
              />
              {errors.bookingUrl && (
                <p className="text-xs text-error" role="alert">
                  {errors.bookingUrl.message}
                </p>
              )}
              <p className="text-xs text-foreground-muted">
                Must be a valid HTTPS URL.
              </p>
            </div>

            {/* Alert Email */}
            <div className="space-y-2">
              <label
                htmlFor="alertEmail"
                className="text-sm font-medium text-foreground"
              >
                Alert email <span className="text-error">*</span>
              </label>
              <input
                id="alertEmail"
                type="email"
                placeholder="alerts@example.com"
                className={cn(
                  "w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted/50",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  errors.alertEmail && "border-error"
                )}
                {...register("alertEmail")}
              />
              {errors.alertEmail && (
                <p className="text-xs text-error" role="alert">
                  {errors.alertEmail.message}
                </p>
              )}
            </div>

            {/* Advanced Section */}
            <div className="border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex w-full items-center justify-between text-sm font-medium text-foreground-muted transition-colors hover:text-foreground"
              >
                Advanced options
                {showAdvanced ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4">
                  {/* Type */}
                  <div className="space-y-2">
                    <label
                      htmlFor="type"
                      className="text-sm font-medium text-foreground"
                    >
                      Target type
                    </label>
                    <select
                      id="type"
                      className={cn(
                        "w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        errors.type && "border-error"
                      )}
                      {...register("type")}
                    >
                      <option value="unknown">Unknown (auto-detect)</option>
                      <option value="acuity">Acuity Scheduling</option>
                      <option value="generic">Generic</option>
                    </select>
                    {errors.type && (
                      <p className="text-xs text-error" role="alert">
                        {errors.type.message}
                      </p>
                    )}
                  </div>

                  {/* Requirements URL */}
                  <div className="space-y-2">
                    <label
                      htmlFor="requirementsUrl"
                      className="text-sm font-medium text-foreground"
                    >
                      Requirements URL
                    </label>
                    <input
                      id="requirementsUrl"
                      type="url"
                      placeholder="https://example.gov/requirements"
                      className={cn(
                        "w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted/50",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        errors.requirementsUrl && "border-error"
                      )}
                      {...register("requirementsUrl")}
                    />
                    {errors.requirementsUrl && (
                      <p className="text-xs text-error" role="alert">
                        {errors.requirementsUrl.message}
                      </p>
                    )}
                    <p className="text-xs text-foreground-muted">
                      Optional. Link to appointment requirements/documentation.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Active toggle */}
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border bg-background text-accent focus:ring-accent"
                {...register("active")}
              />
              <span className="text-foreground">
                Start monitoring immediately
              </span>
            </label>
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button type="button" variant="secondary">
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
