"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { cn } from "../lib/cn";
import { Button } from "./ui/Button";
import { useDeleteTarget } from "../lib/hooks";
import { useToastHelpers } from "./ToastProvider";
import * as Dialog from "@radix-ui/react-dialog";

interface DeleteConfirmDialogProps {
  targetId: string;
  targetName: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  redirectOnDelete?: boolean;
}

/**
 * Delete confirmation dialog with modern glassmorphism styling.
 * Shows a modal asking the user to confirm target deletion.
 */
export function DeleteConfirmDialog({
  targetId,
  targetName,
  onSuccess,
  trigger,
  redirectOnDelete = true,
}: DeleteConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { success, error: showError } = useToastHelpers();
  const deleteTarget = useDeleteTarget();

  const handleDelete = useCallback(async () => {
    try {
      await deleteTarget.mutateAsync(targetId);
      success("Target deleted", `${targetName} has been removed.`);
      setOpen(false);
      onSuccess?.();
      if (redirectOnDelete) {
        router.push("/");
      }
    } catch (err) {
      showError(
        "Failed to delete target",
        err instanceof Error ? err.message : "Please try again"
      );
    }
  }, [deleteTarget, targetId, targetName, success, showError, onSuccess, router, redirectOnDelete]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger || (
          <Button variant="danger" size="sm">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay 
          className={cn(
            "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm",
            "data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut"
          )}
        />
        
        {/* Content */}
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl border border-white/[0.1] bg-[#0D0D0D]/95 backdrop-blur-xl",
            "shadow-[0_25px_60px_rgba(0,0,0,0.65)]",
            "p-6",
            "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
            "focus:outline-none"
          )}
        >
          {/* Close button */}
          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 rounded-lg p-2 text-foreground-muted hover:text-foreground hover:bg-white/[0.08] transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>

          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error/10 border border-error/30">
            <AlertTriangle className="h-8 w-8 text-error" />
          </div>

          {/* Title */}
          <Dialog.Title className="mt-6 text-center text-xl font-bold text-foreground">
            Delete Target
          </Dialog.Title>

          {/* Description */}
          <Dialog.Description className="mt-3 text-center text-sm text-foreground-muted">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{targetName}</span>?
            This action cannot be undone.
          </Dialog.Description>

          {/* Warning */}
          <div className="mt-4 rounded-xl border border-error/20 bg-error/5 p-4">
            <p className="text-xs text-error/90">
              All check history, alerts, and booking records for this target will be permanently deleted.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <Dialog.Close asChild>
              <Button variant="secondary" className="flex-1">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDelete}
              isLoading={deleteTarget.isPending}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
