import { requireUser } from "@/lib/dal";
import { NewVehicleForm } from "./NewVehicleForm";

export default async function NewVehiclePage() {
  await requireUser("driver");

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-ink">ავტობუსის დამატება</h2>
      <NewVehicleForm />
    </div>
  );
}
