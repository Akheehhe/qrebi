export const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-ink placeholder:text-faint focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

export const selectClass = inputClass;

export const labelClass = "mb-1.5 block text-sm font-medium text-ink";

export function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      {children}
      {error && <p className="mt-1.5 text-sm text-danger-500">{error}</p>}
    </div>
  );
}

export function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="rounded-xl border border-danger-500/20 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-500">
      {message}
    </div>
  );
}
