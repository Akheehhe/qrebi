import "server-only";

/**
 * WhatsApp delivery layer.
 *
 * With WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID set (Meta WhatsApp
 * Business Cloud API credentials), messages are actually sent. Without
 * them the app runs in demo mode: every message is composed and stored,
 * and the driver's "შეტყობინებები" feed shows exactly what the bot would
 * deliver. Production note: business-initiated messages outside the 24h
 * customer-service window need a Meta-approved message template; swap the
 * text payload for a template payload when registering one.
 */

import { phoneToWaNumber } from "./wa";

export type WhatsAppDelivery = "sent" | "simulated" | "failed";

export async function sendWhatsApp(
  toPhone: string,
  body: string
): Promise<WhatsAppDelivery> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return "simulated";
  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phoneToWaNumber(toPhone),
          type: "text",
          text: { body },
        }),
      }
    );
    return res.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}
