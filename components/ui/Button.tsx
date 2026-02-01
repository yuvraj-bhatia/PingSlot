import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/cn";
import { Loader2 } from "lucide-react";

const buttonVariants = {
  // Primary - McLaren Papaya Orange with strong glow
  primary: cn(
    "border-2 border-[#FF8000]/30 bg-gradient-to-r from-[#FF8000] to-[#FF9933] text-[#0A0A0A]",
    "shadow-[0_0_20px_rgba(255,128,0,0.5),0_8px_32px_rgba(255,128,0,0.35)]",
    "hover:from-[#FF9020] hover:to-[#FFaa44] hover:shadow-[0_0_30px_rgba(255,128,0,0.6),0_12px_40px_rgba(255,128,0,0.4)]",
    "active:scale-[0.98] active:shadow-[0_0_15px_rgba(255,128,0,0.4)]",
    "focus-visible:ring-2 focus-visible:ring-[#FF8000] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
  ),
  // Secondary - Glass effect with subtle border
  secondary: cn(
    "bg-white/[0.06] backdrop-blur-md",
    "border border-white/20",
    "text-[#F8F4F0]",
    "shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]",
    "hover:bg-white/[0.12] hover:border-white/30",
    "hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]",
    "active:scale-[0.98]"
  ),
  // Ghost - Minimal styling
  ghost: cn(
    "text-[#888888]",
    "hover:bg-white/[0.08] hover:text-[#F8F4F0]",
    "hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)]",
    "active:scale-[0.98]"
  ),
  // Danger - Error/destructive actions
  danger: cn(
    "border border-error/40 bg-gradient-to-r from-error to-[#ff6b6b] text-white",
    "shadow-[0_0_15px_rgba(239,68,68,0.4),0_6px_20px_rgba(239,68,68,0.3)]",
    "hover:shadow-[0_0_25px_rgba(239,68,68,0.5),0_8px_28px_rgba(239,68,68,0.4)]",
    "active:scale-[0.98]"
  ),
  // Success - Positive actions
  success: cn(
    "border border-success/40 bg-gradient-to-r from-success to-[#4ade80] text-white",
    "shadow-[0_0_15px_rgba(34,197,94,0.4),0_6px_20px_rgba(34,197,94,0.3)]",
    "hover:shadow-[0_0_25px_rgba(34,197,94,0.5),0_8px_28px_rgba(34,197,94,0.4)]",
    "active:scale-[0.98]"
  ),
  // Teal/Blue - Secondary accent (for info actions)
  teal: cn(
    "border border-[#0077FF]/40 bg-gradient-to-r from-[#0057B8] to-[#0088FF] text-white",
    "shadow-[0_0_15px_rgba(0,119,255,0.4),0_6px_20px_rgba(0,87,184,0.3)]",
    "hover:shadow-[0_0_25px_rgba(0,119,255,0.5),0_8px_28px_rgba(0,87,184,0.4)]",
    "active:scale-[0.98]"
  ),
} as const;

const buttonSizes = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
  icon: "h-11 w-11",
  "icon-sm": "h-9 w-9",
} as const;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  asChild?: boolean;
  isLoading?: boolean;
}

/**
 * Accessible button component with modern gradient effects and glass styling.
 * Supports loading state and polymorphic rendering via asChild.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      asChild = false,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const content = asChild ? (
      children
    ) : (
      <>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </>
    );

    return (
      <Comp
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center gap-2",
          "rounded-xl font-semibold",
          "transition-all duration-200 ease-out",
          "focus-visible:outline-none",
          // Disabled state - more visible but clearly inactive
          "disabled:pointer-events-none disabled:opacity-40 disabled:saturate-50 disabled:shadow-none",
          // Variant styles
          buttonVariants[variant],
          // Size styles
          buttonSizes[size],
          className
        )}
        {...props}
      >
        {content}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export function buttonStyles(
  variant: keyof typeof buttonVariants = "primary",
  size: keyof typeof buttonSizes = "md"
) {
  return cn(
    "inline-flex items-center justify-center gap-2",
    "rounded-xl font-semibold",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-40 disabled:saturate-50 disabled:shadow-none",
    buttonVariants[variant],
    buttonSizes[size]
  );
}
