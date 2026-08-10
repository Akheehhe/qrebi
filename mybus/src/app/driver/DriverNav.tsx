"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

const TABS = [
  { href: "/driver", label: "მიმოხილვა", exact: true },
  { href: "/driver/vehicles", label: "ჩემი ავტობუსები", exact: false },
  { href: "/driver/messages", label: "შეტყობინებები", exact: false },
  { href: "/driver/fees", label: "ბალანსი", exact: false },
] as const;

export function DriverNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <nav className="inline-flex gap-1 rounded-2xl border border-line bg-white p-1.5">
        {TABS.map((tab) => {
          const active = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-brand-500 text-white"
                  : "text-subtle hover:bg-canvas"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/driver/trips/new"
        className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 font-bold text-ink transition hover:bg-accent-600"
      >
        <Plus className="h-4 w-4" />
        ახალი რეისი
      </Link>
    </div>
  );
}
