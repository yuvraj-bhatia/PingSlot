import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * Modern Drawer component with glassmorphism effects.
 * Provides focus trap, escape to close, and accessibility features.
 */
export const Drawer = Dialog.Root;
export const DrawerTrigger = Dialog.Trigger;
export const DrawerClose = Dialog.Close;

interface DrawerPortalProps {
  children: React.ReactNode;
}

export function DrawerPortal({ children }: DrawerPortalProps) {
  return <Dialog.Portal>{children}</Dialog.Portal>;
}

interface DrawerOverlayProps extends React.ComponentPropsWithoutRef<typeof Dialog.Overlay> {}

export const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof Dialog.Overlay>,
  DrawerOverlayProps
>(({ className, ...props }, ref) => (
  <Dialog.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/70 backdrop-blur-md",
      "data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut",
      className
    )}
    {...props}
  />
));

DrawerOverlay.displayName = Dialog.Overlay.displayName;

interface DrawerContentProps extends React.ComponentPropsWithoutRef<typeof Dialog.Content> {
  showClose?: boolean;
  position?: "right" | "left" | "bottom";
}

export const DrawerContent = React.forwardRef<
  React.ElementRef<typeof Dialog.Content>,
  DrawerContentProps
>(({ className, children, showClose = true, position = "right", ...props }, ref) => {
  const positionStyles = {
    right: "right-0 top-0 h-full w-full max-w-md border-l",
    left: "left-0 top-0 h-full w-full max-w-md border-r",
    bottom: "bottom-0 left-0 right-0 max-h-[85vh] border-t rounded-t-2xl",
  };

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <Dialog.Content
        ref={ref}
        className={cn(
          "fixed z-50",
          "bg-[hsl(222,47%,9%)] backdrop-blur-xl",
          "border-white/[0.08]",
          "shadow-[0_0_60px_rgba(0,0,0,0.5)]",
          "data-[state=open]:animate-slideIn data-[state=closed]:animate-slideOut",
          "focus:outline-none",
          positionStyles[position],
          className
        )}
        {...props}
      >
        <div className="flex h-full flex-col">
          {showClose && (
            <Dialog.Close
              className={cn(
                "absolute right-4 top-4 z-10 rounded-xl p-2.5",
                "bg-white/[0.04] border border-white/[0.1]",
                "text-foreground-muted hover:text-foreground",
                "hover:bg-white/[0.08] hover:border-white/[0.15]",
                "transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          )}
          {children}
        </div>
      </Dialog.Content>
    </DrawerPortal>
  );
});

DrawerContent.displayName = Dialog.Content.displayName;

interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DrawerHeader({ className, ...props }: DrawerHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-b border-white/[0.08] p-6",
        className
      )}
      {...props}
    />
  );
}

interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DrawerFooter({ className, ...props }: DrawerFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-3 border-t border-white/[0.08] p-6 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

interface DrawerTitleProps extends React.ComponentPropsWithoutRef<typeof Dialog.Title> {}

export const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof Dialog.Title>,
  DrawerTitleProps
>(({ className, ...props }, ref) => (
  <Dialog.Title
    ref={ref}
    className={cn(
      "font-display text-xl font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
));

DrawerTitle.displayName = Dialog.Title.displayName;

interface DrawerDescriptionProps extends React.ComponentPropsWithoutRef<typeof Dialog.Description> {}

export const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof Dialog.Description>,
  DrawerDescriptionProps
>(({ className, ...props }, ref) => (
  <Dialog.Description
    ref={ref}
    className={cn("text-sm text-foreground-muted", className)}
    {...props}
  />
));

DrawerDescription.displayName = Dialog.Description.displayName;
