import "server-only";
import path from "node:path";

/**
 * Writable data directory for the SQLite file and uploaded photos.
 * Vercel's deployed functions have a read-only filesystem except /tmp,
 * so on Vercel everything lives there instead of ./data. /tmp is wiped
 * between cold starts and is not shared across instances, so on Vercel
 * this is best-effort demo storage, not durable production storage.
 */
export function dataDir(): string {
  if (process.env.VERCEL) return "/tmp/mybus-data";
  return path.join(process.cwd(), "data");
}
