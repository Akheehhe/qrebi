import fs from "node:fs/promises";
import path from "node:path";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const safeName = path.basename(name);
  const filePath = path.join(process.cwd(), "data", "uploads", safeName);
  try {
    const buffer = await fs.readFile(filePath);
    const mime =
      MIME_TYPES[path.extname(safeName).toLowerCase()] ??
      "application/octet-stream";
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
