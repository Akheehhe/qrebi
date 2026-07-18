// Qrebi order-form lead handler (Vercel serverless).
// Delivers each lead to Telegram + email. All secrets come from env vars - never hard-coded.
// Required env vars (set in Vercel → Project → Settings → Environment Variables):
//   TG_BOT_TOKEN   – Telegram bot token (from @BotFather)
//   TG_CHAT_ID     – chat/user id that should receive the leads
//   RESEND_API_KEY – Resend API key (resend.com) for email
//   LEAD_EMAIL_TO  – address that should receive lead emails
// Optional:
//   LEAD_EMAIL_FROM – verified "from" (defaults to Resend's shared sender)

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) raw += chunk;
  try { return JSON.parse(raw || '{}'); } catch { return {}; }
}

const esc = (s) => String(s || '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c])).slice(0, 200);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method' });

  const { name = '', business = '', phone = '', maps = '', nomaps = false, address = '', website = '' } = await readBody(req);
  if (website) return res.status(200).json({ ok: true });            // honeypot: silently accept bots
  if (!String(phone).trim()) return res.status(400).json({ ok: false, error: 'missing-phone' });

  const mapsInfo = nomaps ? `სჭირდება რეგისტრაცია რუკაზე, მისამართი: ${esc(address) || '-'}` : (esc(maps) || '-');
  const line = `🟣 ახალი შეკვეთა: Qrebi.ge\n\n👤 ${esc(name) || '-'}\n🏢 ${esc(business) || '-'}\n📞 ${esc(phone)}\n🗺️ ${mapsInfo}`;
  const tasks = [];

  const { TG_BOT_TOKEN, TG_CHAT_ID, RESEND_API_KEY, LEAD_EMAIL_TO, LEAD_EMAIL_FROM } = process.env;

  if (TG_BOT_TOKEN && TG_CHAT_ID) {
    tasks.push(fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT_ID, text: line }),
    }));
  }

  if (RESEND_API_KEY && LEAD_EMAIL_TO) {
    tasks.push(fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: LEAD_EMAIL_FROM || 'Qrebi <onboarding@resend.dev>',
        to: [LEAD_EMAIL_TO],
        subject: `ახალი შეკვეთა - ${esc(business) || esc(name) || esc(phone)}`,
        text: line.replace(/^🟣 /, ''),
      }),
    }));
  }

  if (!tasks.length) return res.status(200).json({ ok: false, error: 'not-configured' });

  const results = await Promise.allSettled(tasks);
  const delivered = results.some((r) => r.status === 'fulfilled' && r.value && r.value.ok);
  return res.status(delivered ? 200 : 502).json({ ok: delivered });
}
