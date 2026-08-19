// Qrebi order-form lead handler.
// Delivers each lead to Telegram + email. All secrets come from env vars — never hard-coded.
// Required env vars (Vercel → Project → Settings → Environment Variables):
//   TG_BOT_TOKEN   – Telegram bot token (from @BotFather)
//   TG_CHAT_ID     – chat/user id that should receive the leads
//   RESEND_API_KEY – Resend API key (resend.com) for email
// Optional:
//   LEAD_EMAIL_TO   – recipient override (defaults to qrebinfc@gmail.com)
//   LEAD_EMAIL_FROM – verified "from" (defaults to Resend's shared sender)

const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c] as string)
    .slice(0, 200)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

export async function POST(request: Request) {
  let body: Record<string, unknown> = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const { name = '', business = '', phone = '', maps = '', nomaps = false, address = '', website = '' } = body

  // honeypot: silently accept bots so they don't retry
  if (website) return Response.json({ ok: true }, { headers: CORS })
  if (!String(phone).trim()) {
    return Response.json({ ok: false, error: 'missing-phone' }, { status: 400, headers: CORS })
  }

  const mapsInfo = nomaps
    ? `სჭირდება რეგისტრაცია რუკაზე, მისამართი: ${esc(address) || '-'}`
    : esc(maps) || '-'
  const line = `🟣 ახალი შეკვეთა: Qrebi.ge\n\n👤 ${esc(name) || '-'}\n🏢 ${esc(business) || '-'}\n📞 ${esc(phone)}\n🗺️ ${mapsInfo}`

  const { TG_BOT_TOKEN, TG_CHAT_ID, RESEND_API_KEY, LEAD_EMAIL_FROM } = process.env
  const LEAD_EMAIL_TO = process.env.LEAD_EMAIL_TO || 'qrebinfc@gmail.com'
  const tasks: Promise<Response>[] = []

  if (TG_BOT_TOKEN && TG_CHAT_ID) {
    tasks.push(
      fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: TG_CHAT_ID, text: line }),
      }),
    )
  }

  if (RESEND_API_KEY && LEAD_EMAIL_TO) {
    tasks.push(
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { authorization: `Bearer ${RESEND_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          from: LEAD_EMAIL_FROM || 'Qrebi <onboarding@resend.dev>',
          to: [LEAD_EMAIL_TO],
          subject: `ახალი შეკვეთა - ${esc(business) || esc(name) || esc(phone)}`,
          text: line.replace(/^🟣 /, ''),
        }),
      }),
    )
  }

  if (!tasks.length) return Response.json({ ok: false, error: 'not-configured' }, { headers: CORS })

  const results = await Promise.allSettled(tasks)
  const delivered = results.some((r) => r.status === 'fulfilled' && r.value.ok)
  return Response.json({ ok: delivered }, { status: delivered ? 200 : 502, headers: CORS })
}
