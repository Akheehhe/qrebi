import { DriverNav } from "./DriverNav";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
        მძღოლის კაბინეტი
      </h1>
      <div className="mt-4">
        <DriverNav />
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
