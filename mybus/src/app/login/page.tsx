import Link from "next/link";
import { Info } from "lucide-react";
import { sanitizeNextPath } from "@/lib/urls";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = sanitizeNextPath(params.next);

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">შესვლა</h1>
        <p className="mt-1.5 text-sm text-subtle">
          გააგრძელე მგზავრობა MyBus-ით
        </p>
        <div className="mt-6">
          <LoginForm next={next} />
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-subtle">
        არ გაქვს ანგარიში?{" "}
        <Link
          href={"/signup" + (next ? "?next=" + encodeURIComponent(next) : "")}
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          რეგისტრაცია
        </Link>
      </p>

      <div className="mt-6 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm">
        <p className="flex items-center gap-2 font-semibold text-ink">
          <Info className="h-4 w-4 text-brand-600" />
          დემო ანგარიშები
        </p>
        <div className="mt-2 space-y-1 font-mono text-xs text-subtle">
          <p>მგზავრი: demo@mybus.ge / Demo123!</p>
          <p>მძღოლი: driver@mybus.ge / Driver123!</p>
        </div>
      </div>
    </div>
  );
}
