// Client-safe WhatsApp click-to-chat helpers (no API, works with any account).

/** '+995 599 11 22 33' -> '995599112233' (Cloud API and wa.me format). */
export function phoneToWaNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function waChatLink(phone: string, text?: string): string {
  const base = `https://wa.me/${phoneToWaNumber(phone)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
