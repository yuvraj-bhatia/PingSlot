"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "../lib/cn";

// ============================================================================
// Toast Context
// ============================================================================

type ToastVariant = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

// ============================================================================
// Toast Provider
// ============================================================================

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2, 11);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        <ToastViewport />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

// ============================================================================
// Toast Viewport
// ============================================================================

function ToastViewport() {
  return (
    <ToastPrimitive.Viewport
      className={cn(
        "fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col gap-2 p-4",
        "sm:bottom-4 sm:right-4 sm:w-auto sm:max-w-[420px]"
      )}
    />
  );
}

// ============================================================================
// Toast Component
// ============================================================================

const toastVariants: Record<ToastVariant, { icon: React.ReactNode; className: string }> = {
  success: {
    icon: <CheckCircle className="h-5 w-5 text-success" />,
    className: "border-success/30 bg-card",
  },
  error: {
    icon: <AlertCircle className="h-5 w-5 text-error" />,
    className: "border-error/30 bg-card",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-warning" />,
    className: "border-warning/30 bg-card",
  },
  info: {
    icon: <Info className="h-5 w-5 text-info" />,
    className: "border-info/30 bg-card",
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const { icon, className } = toastVariants[toast.variant ?? "info"];

  return (
    <ToastPrimitive.Root
      duration={toast.duration ?? 5000}
      className={cn(
        "relative flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg",
        "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
        "data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=end]:animate-swipeOut",
        className
      )}
      onOpenChange={(open) => {
        if (!open) onRemove(toast.id);
      }}
    >
      {icon}
      <div className="flex-1 space-y-1">
        <ToastPrimitive.Title className="font-medium text-foreground">
          {toast.title}
        </ToastPrimitive.Title>
        {toast.description && (
          <ToastPrimitive.Description className="text-sm text-foreground-muted">
            {toast.description}
          </ToastPrimitive.Description>
        )}
      </div>
      <ToastPrimitive.Close
        className={cn(
          "rounded-md p-1 text-foreground-muted",
          "transition-colors hover:bg-muted hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}

// ============================================================================
// Toast Container (renders all toasts)
// ============================================================================

export function Toasts() {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </>
  );
}

// ============================================================================
// Helper Hook for Easy Toast Creation
// ============================================================================

export function useToastHelpers() {
  const { addToast } = useToast();

  return React.useMemo(
    () => ({
      success: (title: string, description?: string) =>
        addToast({ title, description, variant: "success" }),
      error: (title: string, description?: string) =>
        addToast({ title, description, variant: "error" }),
      warning: (title: string, description?: string) =>
        addToast({ title, description, variant: "warning" }),
      info: (title: string, description?: string) =>
        addToast({ title, description, variant: "info" }),
    }),
    [addToast]
  );
}
