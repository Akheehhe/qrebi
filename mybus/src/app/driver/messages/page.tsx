import { Info, MessageCircle, Ticket, XCircle } from "lucide-react";
import { driverNotifications, requireUser } from "@/lib/dal";
import { formatTbilisiDate, formatTbilisiTime } from "@/lib/datetime";
import type { DriverNotification } from "@/lib/types";

const WHATSAPP_GREEN = "#25d366";

function Bubble({ n }: { n: DriverNotification }) {
  const iso = n.createdAt.includes("T")
    ? n.createdAt
    : n.createdAt.replace(" ", "T") + "Z";
  return (
    <div
      className={`relative max-w-xl rounded-2xl rounded-tl-sm border p-4 shadow-sm ${
        n.kind === "cancellation"
          ? "border-danger-500/20 bg-danger-50"
          : "border-success-500/20 bg-success-50"
      }`}
    >
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-subtle">
        {n.kind === "cancellation" ? (
          <XCircle className="h-3.5 w-3.5 text-danger-500" />
        ) : (
          <Ticket className="h-3.5 w-3.5 text-success-500" />
        )}
        MyBus ბოტი → {n.toPhone}
      </p>
      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink">
        {n.body}
      </p>
      <p className="mt-2 text-right text-[11px] text-faint">
        {formatTbilisiDate(iso)}, {formatTbilisiTime(iso)} ·{" "}
        {n.delivery === "sent"
          ? "გაგზავნილია ✓✓"
          : n.delivery === "failed"
            ? "ვერ გაიგზავნა"
            : "დემო რეჟიმი"}
      </p>
    </div>
  );
}

export default async function DriverMessagesPage() {
  const user = await requireUser("driver");
  const notifications = driverNotifications(user.id);
  const realMode =
    !!process.env.WHATSAPP_TOKEN && !!process.env.WHATSAPP_PHONE_NUMBER_ID;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-5">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white"
          style={{ backgroundColor: WHATSAPP_GREEN }}
        >
          <MessageCircle className="h-6 w-6" />
        </span>
        <div>
          <h2 className="font-bold text-ink">WhatsApp შეტყობინებები</h2>
          <p className="text-sm text-subtle">
            ყოველი ონლაინ ჯავშანი და გაუქმება ავტომატურად გეგზავნება WhatsApp-ზე
            ნომერზე {user.phone}
          </p>
        </div>
      </div>

      {!realMode && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            დემო რეჟიმი: შეტყობინებები აქ ჩანს ზუსტად ისე, როგორც WhatsApp-ში
            მივა. რეალური გაგზავნა ირთვება WhatsApp Business API-ის გასაღებების
            მითითებით.
          </p>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-center text-subtle">
          შეტყობინებები ჯერ არ არის. პირველივე ონლაინ ჯავშანზე ბოტი მოგწერს.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Bubble key={n.id} n={n} />
          ))}
        </div>
      )}
    </div>
  );
}
