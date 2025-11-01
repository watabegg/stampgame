"use client";

import { playPressAnimation } from "@stampgame/ui";
import { useRef } from "react";

interface PressButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function PressButton({ loading, children, disabled, ...rest }: PressButtonProps) {
  const ref = useRef<HTMLButtonElement | null>(null);

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className="rounded-full bg-emerald-500 px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
      onClick={(event) => {
        rest.onClick?.(event);
        if (!ref.current || disabled || loading) return;
        playPressAnimation({ element: ref.current });
      }}
      {...rest}
    >
      {loading ? "Stamping..." : children}
    </button>
  );
}
