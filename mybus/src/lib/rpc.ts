import "server-only";

/**
 * Thin PostgREST RPC client for the shared Supabase database.
 * The anon key is a public client credential by design; all data access
 * goes through SECURITY DEFINER functions defined in the database.
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://hzainqtiszkoemdmbpyd.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6YWlucXRpc3prb2VtZG1icHlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNjY5MDYsImV4cCI6MjA5Njc0MjkwNn0.a_jeRis44xRVgSD0dE79DVUGJMSmInMr1ju_UWABMds";

export async function rpc<T>(
  fn: string,
  args: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`${fn} failed: ${res.status} ${detail.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}
