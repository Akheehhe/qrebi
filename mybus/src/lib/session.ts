import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { rpc } from "./rpc";

export const SESSION_COOKIE = "mybus_session";
const SESSION_DAYS = 30;

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await rpc("mybus_create_session", {
    p_token: token,
    p_user_id: userId,
    p_expires: expires.toISOString(),
  });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await rpc("mybus_delete_session", { p_token: token });
    } catch {
      // clearing the cookie is what logs the user out; DB cleanup is best-effort
    }
  }
  store.delete(SESSION_COOKIE);
}
