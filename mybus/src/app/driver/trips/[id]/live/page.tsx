import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { getLiveState, requireUser } from "@/lib/dal";
import { LiveBoard } from "./LiveBoard";

export default async function LiveBoardingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser("driver");
  const initial = await getLiveState(id, user.id);
  if (!initial) notFound();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/driver"
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          ← უკან
        </Link>
        <Link
          href={`/driver/trips/${id}`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-canvas"
        >
          <ClipboardList className="h-4 w-4" />
          სრული სია
        </Link>
      </div>
      <LiveBoard initial={initial} />
    </div>
  );
}
