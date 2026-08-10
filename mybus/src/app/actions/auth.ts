"use server";

import { redirect } from "next/navigation";
import { createUser, findUserByEmail } from "@/lib/dal";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, destroySession } from "@/lib/session";
import type { ActionState, Role } from "@/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s-]{7,17}$/;

function safeNext(value: FormDataEntryValue | null, fallback: string): string {
  if (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
  ) {
    return value;
  }
  return fallback;
}

export async function signupAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const role: Role = formData.get("role") === "driver" ? "driver" : "passenger";
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (firstName.length < 2) fieldErrors.firstName = "შეიყვანეთ სახელი";
  if (lastName.length < 2) fieldErrors.lastName = "შეიყვანეთ გვარი";
  if (!EMAIL_RE.test(email)) fieldErrors.email = "შეიყვანეთ სწორი ელფოსტა";
  if (!PHONE_RE.test(phone)) {
    fieldErrors.phone = "შეიყვანეთ სწორი ტელეფონის ნომერი";
  }
  if (password.length < 8) {
    fieldErrors.password = "პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო";
  }
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  if (findUserByEmail(email)) {
    return { fieldErrors: { email: "ამ ელფოსტით ანგარიში უკვე არსებობს" } };
  }

  let userId: string;
  try {
    const user = createUser({
      role,
      firstName,
      lastName,
      email,
      phone,
      passwordHash: hashPassword(password),
    });
    userId = user.id;
  } catch {
    return { fieldErrors: { email: "ამ ელფოსტით ანგარიში უკვე არსებობს" } };
  }

  await createSession(userId);
  redirect(safeNext(formData.get("next"), role === "driver" ? "/driver" : "/trips"));
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "შეიყვანეთ ელფოსტა და პაროლი" };
  }

  const found = findUserByEmail(email);
  if (!found || !verifyPassword(password, found.passwordHash)) {
    return { error: "ელფოსტა ან პაროლი არასწორია" };
  }

  await createSession(found.user.id);
  redirect(
    safeNext(
      formData.get("next"),
      found.user.role === "driver" ? "/driver" : "/trips"
    )
  );
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
