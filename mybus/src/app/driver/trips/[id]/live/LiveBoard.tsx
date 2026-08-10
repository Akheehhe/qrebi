"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  ArrowRight,
  Banknote,
  Check,
  CreditCard,
  Flag,
  Lock,
  LockOpen,
  MessageCircle,
  Minus,
  Plus,
  UserRoundX,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  adjustWalkinAction,
  departTripAction,
  releaseNoShowsAction,
  toggleBoardedAction,
  toggleSalesAction,
} from "@/app/actions/driver";
import { PLATFORM_FEE_GEL } from "@/lib/constants";
import { formatTbilisiTime } from "@/lib/datetime";
import { waChatLink } from "@/lib/wa";
import type { LiveManifestEntry, LiveState } from "@/lib/types";

const POLL_MS = 4000;

interface LiveEvent {
  id: number;
  kind: "booking" | "cancel" | "info";
  text: string;
  time: string;
}

// ---------- sounds (WebAudio, no assets) ----------

function playNote(
  ctx: AudioContext,
  freq: number,
  startSec: number,
  durSec: number,
  type: OscillatorType = "sine",
  volume = 0.4
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ctx.currentTime + startSec;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + durSec);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + durSec + 0.05);
}

function playDing(ctx: AudioContext) {
  playNote(ctx, 880, 0, 0.15);
  playNote(ctx, 1318, 0.16, 0.3);
}

function playAlarm(ctx: AudioContext) {
  playNote(ctx, 523, 0, 0.18, "square", 0.3);
  playNote(ctx, 392, 0.2, 0.18, "square", 0.3);
  playNote(ctx, 523, 0.4, 0.18, "square", 0.3);
  playNote(ctx, 392, 0.6, 0.28, "square", 0.3);
}

// ---------- countdown ----------

function countdownLabel(departureAt: string, nowMs: number): string {
  const diff = Date.parse(departureAt) - nowMs;
  if (diff <= 0) return "დრო ამოიწურა";
  const totalMin = Math.floor(diff / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `გასვლამდე ${h} სთ ${m} წთ`;
  return `გასვლამდე ${m} წთ`;
}

export function LiveBoard({ initial }: { initial: LiveState }) {
  const [state, setState] = useState<LiveState>(initial);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [soundOn, setSoundOn] = useState(false);
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [armRelease, setArmRelease] = useState(false);
  const [armDepart, setArmDepart] = useState(false);
  const [, startTransition] = useTransition();

  const prevManifestRef = useRef<Map<string, LiveManifestEntry>>(
    new Map(initial.manifest.map((m) => [m.bookingId, m]))
  );
  const audioRef = useRef<AudioContext | null>(null);
  const soundOnRef = useRef(false);
  const actingRef = useRef(false);
  const eventSeq = useRef(0);

  const ensureAudio = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (!audioRef.current) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      audioRef.current = new Ctor();
    }
    if (audioRef.current.state === "suspended") {
      void audioRef.current.resume();
    }
    return audioRef.current;
  }, []);

  const pushEvent = useCallback((kind: LiveEvent["kind"], text: string) => {
    eventSeq.current += 1;
    const event: LiveEvent = {
      id: eventSeq.current,
      kind,
      text,
      time: new Intl.DateTimeFormat("ka-GE", {
        timeZone: "Asia/Tbilisi",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(new Date()),
    };
    setEvents((prev) => [event, ...prev].slice(0, 6));
  }, []);

  const applyState = useCallback(
    (next: LiveState, withAlerts: boolean) => {
      const prev = prevManifestRef.current;
      if (withAlerts) {
        for (const entry of next.manifest) {
          const before = prev.get(entry.bookingId);
          if (!before && entry.status === "confirmed") {
            pushEvent(
              "booking",
              `ონლაინ ჯავშანი: ${entry.name}, ${entry.seats} ადგილი`
            );
            if (soundOnRef.current) {
              const ctx = ensureAudio();
              if (ctx) playDing(ctx);
            }
          } else if (
            before &&
            before.status === "confirmed" &&
            entry.status === "cancelled" &&
            !entry.noShow
          ) {
            pushEvent(
              "cancel",
              `გაუქმდა: ${entry.name}, +${entry.seats} ადგილი გათავისუფლდა`
            );
            if (soundOnRef.current) {
              const ctx = ensureAudio();
              if (ctx) playAlarm(ctx);
            }
          }
        }
      }
      prevManifestRef.current = new Map(
        next.manifest.map((m) => [m.bookingId, m])
      );
      setState(next);
    },
    [ensureAudio, pushEvent]
  );

  const refetch = useCallback(
    async (withAlerts: boolean) => {
      try {
        const res = await fetch(`/api/driver/trips/${initial.trip.id}/state`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const next = (await res.json()) as LiveState;
        applyState(next, withAlerts);
      } catch {
        // offline blip; next poll retries
      }
    },
    [applyState, initial.trip.id]
  );

  useEffect(() => {
    setNowMs(Date.now());
    const timer = setInterval(() => {
      setNowMs(Date.now());
      if (!actingRef.current) void refetch(true);
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [refetch]);

  const runAction = useCallback(
    (optimistic: (s: LiveState) => LiveState, action: () => Promise<void>) => {
      ensureAudio();
      actingRef.current = true;
      setState(optimistic);
      startTransition(async () => {
        try {
          await action();
          await refetch(false);
        } finally {
          actingRef.current = false;
        }
      });
    },
    [ensureAudio, refetch]
  );

  const trip = state.trip;
  const confirmed = state.manifest.filter((m) => m.status === "confirmed");
  const notBoardedCount = confirmed.filter((m) => !m.boarded).length;
  const live = trip.status === "scheduled";

  const handleWalkin = (delta: 1 | -1) => {
    if (!live) return;
    if (delta === 1 && trip.seatsLeft <= 0) return;
    if (delta === -1 && trip.walkinSeats <= 0) return;
    runAction(
      (s) => ({
        ...s,
        trip: {
          ...s.trip,
          walkinSeats: s.trip.walkinSeats + delta,
          seatsLeft: s.trip.seatsLeft - delta,
        },
      }),
      () => adjustWalkinAction(trip.id, delta)
    );
  };

  const handleSalesToggle = () => {
    if (!live) return;
    const closing = !trip.salesClosed;
    runAction(
      (s) => ({
        ...s,
        trip: { ...s.trip, salesClosed: closing, salesOpen: !closing && s.trip.salesOpen },
      }),
      () => toggleSalesAction(trip.id, closing)
    );
    pushEvent(
      "info",
      closing ? "ონლაინ გაყიდვები დაიხურა" : "ონლაინ გაყიდვები გაიხსნა"
    );
  };

  const handleBoardToggle = (entry: LiveManifestEntry) => {
    runAction(
      (s) => ({
        ...s,
        manifest: s.manifest.map((m) =>
          m.bookingId === entry.bookingId ? { ...m, boarded: !m.boarded } : m
        ),
      }),
      () => toggleBoardedAction(entry.bookingId, !entry.boarded)
    );
  };

  const handleRelease = () => {
    if (!armRelease) {
      setArmRelease(true);
      setTimeout(() => setArmRelease(false), 4000);
      return;
    }
    setArmRelease(false);
    runAction(
      (s) => s,
      async () => {
        const released = await releaseNoShowsAction(trip.id);
        pushEvent(
          "info",
          released > 0
            ? `გათავისუფლდა ${released} არმოსული ჯავშანი`
            : "არმოსული ჯავშნები არ არის"
        );
      }
    );
  };

  const handleDepart = () => {
    if (!live) return;
    if (!armDepart) {
      setArmDepart(true);
      setTimeout(() => setArmDepart(false), 4000);
      return;
    }
    setArmDepart(false);
    runAction(
      (s) => s,
      async () => {
        const ok = await departTripAction(trip.id);
        if (ok) {
          pushEvent(
            "info",
            `რეისი გავიდა. პლატფორმის საფასური ${PLATFORM_FEE_GEL}₾ გადახდილია. კარგი გზა!`
          );
        }
      }
    );
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundOnRef.current = next;
    if (next) {
      const ctx = ensureAudio();
      if (ctx) playDing(ctx);
    }
  };

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="rounded-2xl border border-line bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-ink">
              {trip.originCity}
              <ArrowRight className="h-5 w-5 text-brand-500" />
              {trip.destinationCity}
            </h2>
            <p className="mt-1 text-sm text-subtle">
              გასვლა {formatTbilisiTime(trip.departureAt)}
              {nowMs !== null && live && (
                <span className="ml-2 font-semibold text-brand-600">
                  · {countdownLabel(trip.departureAt, nowMs)}
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleSound}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
              soundOn
                ? "border-success-500/30 bg-success-50 text-success-500"
                : "border-line bg-white text-subtle hover:bg-canvas"
            }`}
          >
            {soundOn ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
            {soundOn ? "ხმა ჩართულია" : "ჩართე ხმა"}
          </button>
        </div>
        {!live &&
          (trip.status === "departed" ? (
            <p className="mt-3 flex items-center gap-2 rounded-xl bg-success-50 p-3 text-sm font-semibold text-success-500">
              <Flag className="h-4 w-4" />
              რეისი გავიდა. პლატფორმის საფასური {PLATFORM_FEE_GEL}₾ დაფარულია,
              ბილეთების სრული თანხა შენია.
            </p>
          ) : (
            <p className="mt-3 rounded-xl bg-danger-50 p-3 text-sm font-semibold text-danger-500">
              ეს რეისი აღარ არის აქტიური
            </p>
          ))}
      </div>

      {/* event feed */}
      {events.length > 0 && (
        <div className="space-y-2" aria-live="polite">
          {events.map((e) => (
            <div
              key={e.id}
              className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 text-sm font-bold ${
                e.kind === "booking"
                  ? "border-success-500/30 bg-success-50 text-success-500"
                  : e.kind === "cancel"
                    ? "border-danger-500/30 bg-danger-50 text-danger-500"
                    : "border-line bg-white text-subtle"
              }`}
            >
              <span>{e.text}</span>
              <span className="shrink-0 font-mono text-xs opacity-70">
                {e.time}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* counter */}
        <div className="rounded-3xl border border-line bg-white p-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-faint">
            თავისუფალი ადგილი
          </p>
          <p
            data-testid="seats-left"
            className={`mt-1 text-8xl font-extrabold ${
              trip.seatsLeft === 0
                ? "text-danger-500"
                : trip.seatsLeft <= 4
                  ? "text-warning-500"
                  : "text-ink"
            }`}
          >
            {trip.seatsLeft}
          </p>
          <p className="mt-1 text-sm text-subtle">
            ონლაინ {trip.onlineSeatsTaken} · ადგილზე {trip.walkinSeats} · სულ{" "}
            {trip.totalSeats}
          </p>

          <div className="mt-5 grid grid-cols-[1fr_88px] gap-3">
            <button
              type="button"
              data-testid="walkin-plus"
              onClick={() => handleWalkin(1)}
              disabled={!live || trip.seatsLeft <= 0}
              className="flex min-h-24 items-center justify-center gap-3 rounded-2xl bg-accent-500 text-2xl font-extrabold text-ink transition hover:bg-accent-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-8 w-8" />
              ჩაჯდა
            </button>
            <button
              type="button"
              data-testid="walkin-minus"
              onClick={() => handleWalkin(-1)}
              disabled={!live || trip.walkinSeats <= 0}
              aria-label="ერთით შემცირება"
              className="flex min-h-24 items-center justify-center rounded-2xl border-2 border-line bg-white text-ink transition hover:bg-canvas active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="h-8 w-8" />
            </button>
          </div>
          <p className="mt-2 text-xs text-faint">
            დააჭირე ყოველ ჯერზე, როცა მგზავრი ადგილზე ჯდება
          </p>

          <button
            type="button"
            data-testid="sales-toggle"
            onClick={handleSalesToggle}
            disabled={!live}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-lg font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
              trip.salesClosed
                ? "bg-danger-500 text-white hover:bg-danger-500/90"
                : "border-2 border-line bg-white text-ink hover:bg-canvas"
            }`}
          >
            {trip.salesClosed ? (
              <>
                <LockOpen className="h-5 w-5" />
                გახსენი ონლაინ გაყიდვები
              </>
            ) : (
              <>
                <Lock className="h-5 w-5" />
                ივსება ადგილზე: დახურე ონლაინ
              </>
            )}
          </button>
          <p className="mt-2 text-xs text-faint">
            {trip.salesClosed
              ? "ონლაინ ჯავშნები დახურულია, ადგილებს მხოლოდ შენ ითვლი"
              : trip.salesOpen
                ? `ონლაინ გაყიდვები ავტომატურად იხურება ${formatTbilisiTime(trip.salesCloseAt)}-ზე`
                : "ონლაინ გაყიდვები დახურულია დროის ამოწურვის გამო"}
          </p>

          {live && (
            <>
              <button
                type="button"
                data-testid="depart-trip"
                onClick={handleDepart}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-lg font-bold transition ${
                  armDepart
                    ? "bg-success-500 text-white"
                    : "bg-brand-900 text-white hover:bg-brand-700"
                }`}
              >
                <Flag className="h-5 w-5" />
                {armDepart
                  ? `დაადასტურე: ვიხდი ${PLATFORM_FEE_GEL}₾-ს და გავდივარ`
                  : "რეისი გავიდა"}
              </button>
              <p className="mt-2 text-xs text-faint">
                გასვლისას იხდი მხოლოდ {PLATFORM_FEE_GEL}₾-ს. ბილეთებზე საკომისიო
                არ იჭრება.
              </p>
            </>
          )}
        </div>

        {/* boarding checklist */}
        <div className="rounded-3xl border border-line bg-white p-6">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-ink">ჩასხდომის სია</h3>
            <span className="text-sm text-subtle">
              ჩაჯდა {confirmed.length - notBoardedCount}/{confirmed.length}
            </span>
          </div>

          {confirmed.length === 0 ? (
            <p className="mt-6 rounded-xl bg-canvas p-6 text-center text-sm text-subtle">
              ონლაინ ჯავშნები ჯერ არ არის
            </p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {confirmed.map((entry) => (
                <li key={entry.bookingId} className="flex items-stretch gap-2">
                  <button
                    type="button"
                    onClick={() => handleBoardToggle(entry)}
                    className={`flex min-w-0 flex-1 items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition active:scale-[0.99] ${
                      entry.boarded
                        ? "border-success-500/50 bg-success-50"
                        : "border-line bg-white hover:bg-canvas"
                    }`}
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                        entry.boarded
                          ? "bg-success-500 text-white"
                          : "border-2 border-line bg-white text-transparent"
                      }`}
                    >
                      <Check className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold text-ink">
                        {entry.name}
                      </span>
                      <span className="block text-sm text-subtle">
                        {entry.seats} ადგილი · {entry.phone}
                      </span>
                    </span>
                    <span className="shrink-0">
                      {entry.paymentStatus === "paid" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-xs font-semibold text-success-500">
                          <CreditCard className="h-3.5 w-3.5" />
                          გადახდილია
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-warning-50 px-2.5 py-1 text-xs font-semibold text-warning-500">
                          <Banknote className="h-3.5 w-3.5" />
                          ნაღდით
                        </span>
                      )}
                    </span>
                  </button>
                  <a
                    href={waChatLink(
                      entry.phone,
                      `გამარჯობა, ${entry.name}! გწერთ MyBus-ის მძღოლი, თქვენი ჯავშნის შესახებ (${trip.originCity} → ${trip.destinationCity}).`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`მისწერე WhatsApp-ში: ${entry.name}`}
                    className="grid w-12 shrink-0 place-items-center rounded-2xl text-white transition hover:opacity-85"
                    style={{ backgroundColor: "#25d366" }}
                  >
                    <MessageCircle className="h-5 w-5" />
                  </a>
                </li>
              ))}
            </ul>
          )}

          {live && confirmed.length > 0 && (
            <button
              type="button"
              onClick={handleRelease}
              disabled={notBoardedCount === 0}
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                armRelease
                  ? "bg-danger-500 text-white"
                  : "border-2 border-danger-500/30 bg-white text-danger-500 hover:bg-danger-50"
              }`}
            >
              <UserRoundX className="h-5 w-5" />
              {armRelease
                ? "დაადასტურე: გაათავისუფლე ადგილები"
                : `გაათავისუფლე არმოსულები (${notBoardedCount})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
