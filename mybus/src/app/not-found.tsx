import Link from "next/link";
import { BusFront } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-500">
        <BusFront className="h-8 w-8" />
      </span>
      <h1 className="mt-6 text-5xl font-extrabold text-ink">404</h1>
      <p className="mt-3 max-w-md text-subtle">
        ეს გვერდი ვერ მოიძებნა. შესაძლოა რეისი უკვე გავიდა ან ბმული არასწორია.
      </p>
      <Link
        href="/trips"
        className="mt-8 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600"
      >
        რეისების ნახვა
      </Link>
    </div>
  );
}
