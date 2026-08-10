import { ArrowRight, BadgePercent, Flag, Wallet } from "lucide-react";
import { driverFees, requireUser } from "@/lib/dal";
import { PLATFORM_FEE_GEL } from "@/lib/constants";
import { formatPrice, formatTbilisiDateTime } from "@/lib/datetime";
import { Badge } from "@/components/Badge";

export default async function DriverFeesPage() {
  const user = await requireUser("driver");
  const { fees, totalGel } = driverFees(user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-subtle">
            <BadgePercent className="h-4 w-4 text-success-500" />
            საკომისიო ბილეთებზე
          </p>
          <p className="mt-2 text-3xl font-extrabold text-success-500">0%</p>
          <p className="mt-1 text-sm text-subtle">
            ბილეთების სრული თანხა შენია, მგზავრიც ზედმეტს არ იხდის
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-subtle">
            <Wallet className="h-4 w-4 text-brand-500" />
            პლატფორმის საფასური
          </p>
          <p className="mt-2 text-3xl font-extrabold text-ink">
            {formatPrice(PLATFORM_FEE_GEL)}
            <span className="text-base font-semibold text-subtle">
              {" "}
              / შემდგარი რეისი
            </span>
          </p>
          <p className="mt-1 text-sm text-subtle">
            იხდი მხოლოდ მაშინ, როცა რეისი გადის. არანაირი აბონემენტი.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
            <Flag className="h-5 w-5 text-brand-500" />
            შემდგარი რეისები
          </h2>
          <p className="text-sm text-subtle">
            სულ გადახდილი:{" "}
            <span className="font-bold text-ink">{formatPrice(totalGel)}</span>
          </p>
        </div>
        {fees.length === 0 ? (
          <p className="p-10 text-center text-subtle">
            ჯერ არცერთი შემდგარი რეისი. როცა LIVE ეკრანზე დააჭერ ღილაკს
            &quot;რეისი გავიდა&quot;, აქ გამოჩნდება {formatPrice(PLATFORM_FEE_GEL)}
            -იანი ჩანაწერი.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {fees.map((fee) => (
              <li
                key={fee.id}
                className="flex flex-wrap items-center gap-x-5 gap-y-1.5 p-4"
              >
                <p className="flex items-center gap-1.5 font-semibold text-ink">
                  {fee.originCity}
                  <ArrowRight className="h-4 w-4 text-brand-500" />
                  {fee.destinationCity}
                </p>
                <p className="text-sm text-subtle">
                  {formatTbilisiDateTime(fee.departureAt)}
                </p>
                <span className="ml-auto flex items-center gap-3">
                  <span className="font-bold text-ink">
                    {formatPrice(fee.amountGel)}
                  </span>
                  {fee.status === "paid" ? (
                    <Badge variant="success">გადახდილია</Badge>
                  ) : (
                    <Badge variant="warning">გადასახდელი</Badge>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-center text-xs text-faint">
        დემო რეჟიმი: საფასურის ჩამოჭრა სიმულირებულია. რეალურ ვერსიაში დაერთვება
        საბანკო ბარათი ან ბალანსის შევსება.
      </p>
    </div>
  );
}
