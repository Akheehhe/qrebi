import Link from "next/link";
import { Bus, Plus } from "lucide-react";
import { driverVehicles, requireUser } from "@/lib/dal";
import { datetimeLocalMinForNewTrip } from "@/lib/datetime";
import { NewTripForm } from "./NewTripForm";

export default async function NewTripPage() {
  const user = await requireUser("driver");
  const vehicles = await driverVehicles(user.id);

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-ink">ახალი რეისის დამატება</h2>
      {vehicles.length === 0 ? (
        <div className="max-w-2xl rounded-2xl border border-line bg-white p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <Bus className="h-7 w-7" />
          </div>
          <p className="mt-4 font-semibold text-ink">
            ჯერ ავტობუსი დაამატე
          </p>
          <p className="mt-1 text-sm text-subtle">
            რეისის გამოსაქვეყნებლად საჭიროა მინიმუმ ერთი ავტობუსი.
          </p>
          <Link
            href="/driver/vehicles/new"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 font-semibold text-white transition hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            ავტობუსის დამატება
          </Link>
        </div>
      ) : (
        <NewTripForm
          vehicles={vehicles}
          minDeparture={datetimeLocalMinForNewTrip()}
        />
      )}
    </div>
  );
}
