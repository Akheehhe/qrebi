const VARIANTS = {
  success: "bg-success-50 text-success-500",
  warning: "bg-warning-50 text-warning-500",
  danger: "bg-danger-50 text-danger-500",
  brand: "bg-brand-50 text-brand-600",
  accent: "bg-accent-400/20 text-accent-600",
  neutral: "bg-canvas text-subtle",
} as const;

export type BadgeVariant = keyof typeof VARIANTS;

export function Badge({
  variant = "neutral",
  children,
  className = "",
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
