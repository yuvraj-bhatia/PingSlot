"use client";

import { Play, Loader2 } from "lucide-react";
import { Button } from "./ui/Button";
import { SimpleTooltip } from "./ui/Tooltip";

interface CheckNowButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

/**
 * Primary action button to start a check run.
 */
export function CheckNowButton({
  onClick,
  isLoading,
  disabled,
}: CheckNowButtonProps) {
  return (
    <SimpleTooltip content="Check all active targets for availability">
      <Button
        onClick={onClick}
        isLoading={isLoading}
        disabled={disabled || isLoading}
        variant="primary"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking...
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            Check now
          </>
        )}
      </Button>
    </SimpleTooltip>
  );
}
