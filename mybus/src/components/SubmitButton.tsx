"use client";

import { useFormStatus } from "react-dom";

const VARIANTS = {
  brand: "bg-brand-500 text-white hover:bg-brand-600",
  accent: "bg-accent-500 text-ink hover:bg-accent-600",
  danger: "bg-danger-500 text-white hover:bg-danger-500/90",
  ghost: "border border-line bg-white text-ink hover:bg-canvas",
} as const;

export function SubmitButton({
  children,
  variant = "brand",
  className = "",
}: {
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
    >
      {pending && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
      )}
      {children}
    </button>
  );
}
