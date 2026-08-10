import Link from "next/link";
import { Bus, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-brand-900 text-white/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white">
              <Bus className="h-5 w-5" />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-white">
              My<span className="text-accent-400">Bus</span>
              <span className="text-sm font-bold text-white/40">.ge</span>
            </span>
          </div>
          <p className="mt-4 text-sm leading-6">
            საქართველოს ავტობუსებისა და მიკროავტობუსების ერთიანი პლატფორმა.
            იპოვე რეისი, დაჯავშნე ადგილი და იმგზავრე ლოდინის გარეშე.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> +995 32 2 00 00 00
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> info@mybus.ge
            </p>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
            ნავიგაცია
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/" className="transition hover:text-white">
                მთავარი
              </Link>
            </li>
            <li>
              <Link href="/trips" className="transition hover:text-white">
                ყველა რეისი
              </Link>
            </li>
            <li>
              <Link href="/#how-it-works" className="transition hover:text-white">
                როგორ მუშაობს
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
            მგზავრებისთვის
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/trips" className="transition hover:text-white">
                რეისის მოძებნა
              </Link>
            </li>
            <li>
              <Link href="/account" className="transition hover:text-white">
                ჩემი ჯავშნები
              </Link>
            </li>
            <li>
              <Link href="/signup" className="transition hover:text-white">
                რეგისტრაცია
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
            მძღოლებისთვის
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link
                href="/signup?role=driver"
                className="transition hover:text-white"
              >
                გახდი პარტნიორი მძღოლი
              </Link>
            </li>
            <li>
              <Link href="/driver" className="transition hover:text-white">
                მძღოლის კაბინეტი
              </Link>
            </li>
            <li>
              <Link
                href="/driver/trips/new"
                className="transition hover:text-white"
              >
                რეისის დამატება
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs sm:flex-row">
          <p>© 2026 MyBus.ge · ყველა უფლება დაცულია</p>
          <div className="flex items-center gap-2">
            <span className="rounded bg-white/10 px-2 py-1 font-bold text-white/80">
              VISA
            </span>
            <span className="rounded bg-white/10 px-2 py-1 font-bold text-white/80">
              Mastercard
            </span>
            <span className="rounded bg-white/10 px-2 py-1 font-bold text-white/80">
              Apple Pay
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
