import { getCurrentUser, getLiveState } from "@/lib/dal";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "driver") {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const state = getLiveState(id, user.id);
  if (!state) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return Response.json(state, {
    headers: { "Cache-Control": "no-store" },
  });
}
