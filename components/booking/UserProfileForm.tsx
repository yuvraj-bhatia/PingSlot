"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Phone } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/Card";
import { UserProfileSchema, type UserProfile } from "../../lib/apiTypes";

interface UserProfileFormProps {
  onSubmit: (data: UserProfile) => void;
  isLoading?: boolean;
  defaultValues?: Partial<UserProfile>;
  className?: string;
}

/**
 * User profile form for collecting booking details.
 * Validates input with zod schema.
 */
export function UserProfileForm({
  onSubmit,
  isLoading = false,
  defaultValues,
  className,
}: UserProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<UserProfile>({
    resolver: zodResolver(UserProfileSchema),
    defaultValues: {
      firstName: defaultValues?.firstName || "",
      lastName: defaultValues?.lastName || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
    },
    mode: "onChange",
  });

  return (
    <Card variant="glass" className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
            <User className="h-5 w-5 text-accent" />
          </div>
          Your Details
        </CardTitle>
        <CardDescription>
          Enter your information to complete the booking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name row */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* First Name */}
            <div className="space-y-2">
              <label
                htmlFor="firstName"
                className="text-sm font-semibold text-foreground"
              >
                First Name <span className="text-error">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                placeholder="John"
                className={cn(
                  "w-full rounded-xl px-4 py-3 text-sm text-foreground",
                  "bg-white/[0.04] backdrop-blur-sm",
                  "border border-white/[0.1]",
                  "placeholder:text-foreground-muted/40",
                  "focus:bg-white/[0.06] focus:border-accent/50",
                  "focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]",
                  "focus:outline-none transition-all duration-200",
                  errors.firstName && "border-error/50 focus:border-error"
                )}
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-xs text-error font-medium" role="alert">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label
                htmlFor="lastName"
                className="text-sm font-semibold text-foreground"
              >
                Last Name <span className="text-error">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                placeholder="Doe"
                className={cn(
                  "w-full rounded-xl px-4 py-3 text-sm text-foreground",
                  "bg-white/[0.04] backdrop-blur-sm",
                  "border border-white/[0.1]",
                  "placeholder:text-foreground-muted/40",
                  "focus:bg-white/[0.06] focus:border-accent/50",
                  "focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]",
                  "focus:outline-none transition-all duration-200",
                  errors.lastName && "border-error/50 focus:border-error"
                )}
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-xs text-error font-medium" role="alert">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="flex items-center gap-2 text-sm font-semibold text-foreground"
            >
              <Mail className="h-4 w-4 text-accent" />
              Email <span className="text-error">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              className={cn(
                "w-full rounded-xl px-4 py-3 text-sm text-foreground",
                "bg-white/[0.04] backdrop-blur-sm",
                "border border-white/[0.1]",
                "placeholder:text-foreground-muted/40",
                "focus:bg-white/[0.06] focus:border-accent/50",
                "focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]",
                "focus:outline-none transition-all duration-200",
                errors.email && "border-error/50 focus:border-error"
              )}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-error font-medium" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="flex items-center gap-2 text-sm font-semibold text-foreground"
            >
              <Phone className="h-4 w-4 text-foreground-muted" />
              Phone <span className="text-foreground-muted text-xs">(optional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              className={cn(
                "w-full rounded-xl px-4 py-3 text-sm text-foreground",
                "bg-white/[0.04] backdrop-blur-sm",
                "border border-white/[0.1]",
                "placeholder:text-foreground-muted/40",
                "focus:bg-white/[0.06] focus:border-accent/50",
                "focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]",
                "focus:outline-none transition-all duration-200",
                errors.phone && "border-error/50 focus:border-error"
              )}
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-error font-medium" role="alert">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={!isValid}
          >
            Start Booking
          </Button>

          {/* Privacy note */}
          <p className="text-center text-xs text-foreground-muted">
            Your information will only be used to complete this booking.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * Compact inline form for when space is limited.
 */
export function UserProfileFormCompact({
  onSubmit,
  isLoading = false,
  defaultValues,
  className,
}: UserProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<UserProfile>({
    resolver: zodResolver(UserProfileSchema),
    defaultValues: {
      firstName: defaultValues?.firstName || "",
      lastName: defaultValues?.lastName || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
    },
    mode: "onChange",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-4", className)}>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          placeholder="First Name *"
          className={cn(
            "w-full rounded-xl px-4 py-3 text-sm text-foreground",
            "bg-white/[0.04] border border-white/[0.1]",
            "placeholder:text-foreground-muted/40",
            "focus:bg-white/[0.06] focus:border-accent/50 focus:outline-none",
            errors.firstName && "border-error/50"
          )}
          {...register("firstName")}
        />
        <input
          type="text"
          placeholder="Last Name *"
          className={cn(
            "w-full rounded-xl px-4 py-3 text-sm text-foreground",
            "bg-white/[0.04] border border-white/[0.1]",
            "placeholder:text-foreground-muted/40",
            "focus:bg-white/[0.06] focus:border-accent/50 focus:outline-none",
            errors.lastName && "border-error/50"
          )}
          {...register("lastName")}
        />
      </div>
      <input
        type="email"
        placeholder="Email *"
        className={cn(
          "w-full rounded-xl px-4 py-3 text-sm text-foreground",
          "bg-white/[0.04] border border-white/[0.1]",
          "placeholder:text-foreground-muted/40",
          "focus:bg-white/[0.06] focus:border-accent/50 focus:outline-none",
          errors.email && "border-error/50"
        )}
        {...register("email")}
      />
      <input
        type="tel"
        placeholder="Phone (optional)"
        className={cn(
          "w-full rounded-xl px-4 py-3 text-sm text-foreground",
          "bg-white/[0.04] border border-white/[0.1]",
          "placeholder:text-foreground-muted/40",
          "focus:bg-white/[0.06] focus:border-accent/50 focus:outline-none"
        )}
        {...register("phone")}
      />
      <Button
        type="submit"
        className="w-full"
        isLoading={isLoading}
        disabled={!isValid}
      >
        Start Booking
      </Button>
    </form>
  );
}
