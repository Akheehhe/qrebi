import Link from "next/link";
import { sanitizeNextPath } from "@/lib/urls";
import { SignupForm } from "./SignupForm";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = sanitizeNextPath(params.next);
  const role: "passenger" | "driver" =
    params.role === "driver" ? "driver" : "passenger";

  return (
    <div className="mx-auto max-w-lg px-4 py-14">
      <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
          რეგისტრაცია
        </h1>
        <p className="mt-1.5 text-sm text-subtle">
          შექმენი ანგარიში ერთ წუთში
        </p>
        <div className="mt-6">
          <SignupForm defaultRole={role} next={next} />
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-subtle">
        უკვე გაქვს ანგარიში?{" "}
        <Link
          href={"/login" + (next ? "?next=" + encodeURIComponent(next) : "")}
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          შესვლა
        </Link>
      </p>
    </div>
  );
}
