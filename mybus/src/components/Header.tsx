import Link from "next/link";
import {
  Bus,
  Car,
  Home,
  Info,
  LayoutDashboard,
  LogOut,
  Route,
  UserRound,
} from "lucide-react";
import { getCurrentUser } from "@/lib/dal";
import { logoutAction } from "@/app/actions/auth";

const TNET_FAMILY = ["myauto.ge", "myhome.ge", "mymarket.ge"];

export async function Header() {
  const user = await getCurrentUser();

  return (
    <>
      <div className="hidden bg-brand-900 sm:block">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-1.5 text-[11px] font-medium text-white/50">
          {TNET_FAMILY.map((site) => (
            <span key={site}>{site}</span>
          ))}
          <span className="rounded-full bg-accent-500 px-2 py-0.5 font-bold text-ink">
            mybus.ge
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white">
              <Bus className="h-5 w-5" />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-ink">
              My<span className="text-brand-500">Bus</span>
              <span className="text-sm font-bold text-faint">.ge</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-subtle md:flex">
            <Link
              href="/"
              className="flex items-center gap-1.5 transition hover:text-ink"
            >
              <Home className="h-4 w-4" />
              მთავარი
            </Link>
            <Link
              href="/trips"
              className="flex items-center gap-1.5 transition hover:text-ink"
            >
              <Route className="h-4 w-4" />
              რეისები
            </Link>
            <Link
              href="/#how-it-works"
              className="flex items-center gap-1.5 transition hover:text-ink"
            >
              <Info className="h-4 w-4" />
              როგორ მუშაობს
            </Link>
            <Link
              href={user?.role === "driver" ? "/driver" : "/signup?role=driver"}
              className="flex items-center gap-1.5 transition hover:text-ink"
            >
              <Car className="h-4 w-4" />
              მძღოლებისთვის
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href={user.role === "driver" ? "/driver" : "/account"}
                  className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2 text-sm font-semibold text-ink transition hover:bg-canvas"
                >
                  {user.role === "driver" ? (
                    <LayoutDashboard className="h-4 w-4 text-brand-500" />
                  ) : (
                    <UserRound className="h-4 w-4 text-brand-500" />
                  )}
                  <span className="max-w-28 truncate">{user.firstName}</span>
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    aria-label="გასვლა"
                    title="გასვლა"
                    className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-subtle transition hover:bg-canvas hover:text-danger-500"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl px-3.5 py-2 text-sm font-semibold text-ink transition hover:bg-canvas"
                >
                  შესვლა
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  რეგისტრაცია
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
