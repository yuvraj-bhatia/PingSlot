"use client";

import { useId, useState } from "react";

export default function MetricHint({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        marginLeft: "0.35rem",
      }}
    >
      <button
        type="button"
        aria-label={text}
        aria-describedby={tooltipId}
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          display: "inline-flex",
          alignItems: "center",
          cursor: "help",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <span
          style={{
            width: "1.1rem",
            height: "1.1rem",
            borderRadius: "999px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.65rem",
            lineHeight: 1,
            color: "rgba(255, 255, 255, 0.85)",
            background: "rgba(148, 163, 184, 0.25)",
            border: "1px solid rgba(148, 163, 184, 0.4)",
          }}
        >
          i
        </span>
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        style={{
          position: "absolute",
          top: "calc(100% + 0.4rem)",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "0.35rem 0.5rem",
          borderRadius: "6px",
          background: "rgba(15, 23, 42, 0.95)",
          color: "#ffffff",
          fontSize: "0.7rem",
          whiteSpace: "nowrap",
          border: "1px solid rgba(148, 163, 184, 0.35)",
          boxShadow: "0 8px 20px rgba(15, 23, 42, 0.6)",
          zIndex: 20,
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
          pointerEvents: "none",
          transition: "opacity 0.15s ease",
        }}
      >
        {text}
      </span>
    </span>
  );
}
