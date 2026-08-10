import Link from "next/link";
import { Plus } from "lucide-react";
import { driverVehicles, requireUser } from "@/lib/dal";
import { Badge } from "@/components/Badge";

export default async function DriverVehiclesPage() {
  const user = await requireUser("driver");
  const vehicles = driverVehicles(user.id);

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-ink">ჩემი ავტობუსები</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="overflow-hidden rounded-2xl border border-line bg-white"
          >
            <img
              src={vehicle.photoUrl}
              alt={vehicle.name}
              className="h-36 w-full rounded-t-2xl object-cover"
            />
            <div className="p-4">
              <p className="font-bold text-ink">{vehicle.name}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <Badge variant="neutral" className="font-mono">
                  {vehicle.plateNumber}
                </Badge>
                <span className="text-sm text-subtle">
                  {vehicle.capacity} ადგილი
                </span>
              </div>
            </div>
          </div>
        ))}
        <Link
          href="/driver/vehicles/new"
          className="grid min-h-52 place-items-center rounded-2xl border-2 border-dashed border-line text-subtle transition hover:border-brand-500 hover:text-brand-500"
        >
          <span className="flex flex-col items-center gap-2 font-semibold">
            <Plus className="h-6 w-6" />
            ავტობუსის დამატება
          </span>
        </Link>
      </div>
    </div>
  );
}
