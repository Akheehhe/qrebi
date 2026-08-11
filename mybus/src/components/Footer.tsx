import Link from "next/link";
import { Bus, Car, Phone, Route } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-brand-900 text-white/70">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-8 sm:flex-row sm:justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white">
            <Bus className="h-5 w-5" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-white">
            My<span className="text-accent-400">Bus</span>
            <span className="text-sm font-bold text-white/40">.ge</span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium">
          <Link
            href="/trips"
            className="flex items-center gap-1.5 transition hover:text-white"
          >
            <Route className="h-4 w-4" />
            რეისები
          </Link>
          <Link
            href="/signup?role=driver"
            className="flex items-center gap-1.5 transition hover:text-white"
          >
            <Car className="h-4 w-4" />
            მძღოლებისთვის
          </Link>
          <a
            href="tel:+995322000000"
            className="flex items-center gap-1.5 transition hover:text-white"
          >
            <Phone className="h-4 w-4" />
            +995 32 2 00 00 00
          </a>
        </nav>
        <p className="text-xs text-white/40">© 2026 MyBus.ge</p>
      </div>
    </footer>
  );
}
