"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Cake, Heart, Star, X } from "lucide-react";
import { useState } from "react";

type TodayEvent = {
  id: string;
  contact_id: string;
  contactName: string;
  eventTitle: string;
  type: "birthday" | "anniversary" | "custom";
};

const EVENT_CONFIG = {
  birthday: {
    emoji: "🎂",
    icon: Cake,
    gradient: "from-violet-600 via-purple-600 to-fuchsia-600",
    glow: "shadow-[0_0_40px_rgba(139,92,246,0.4)]",
    label: "birthday",
  },
  anniversary: {
    emoji: "💍",
    icon: Heart,
    gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
    glow: "shadow-[0_0_40px_rgba(244,114,182,0.4)]",
    label: "anniversary",
  },
  custom: {
    emoji: "🎉",
    icon: Star,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    glow: "shadow-[0_0_40px_rgba(251,146,60,0.4)]",
    label: "event",
  },
};

function SingleBanner({ ev, onDismiss }: { ev: TodayEvent; onDismiss: () => void }) {
  const cfg = EVENT_CONFIG[ev.type] ?? EVENT_CONFIG.custom;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-r p-[1px]",
        cfg.glow,
        cfg.gradient
      )}
    >
      {/* inner card */}
      <div className="relative flex items-center gap-4 rounded-[15px] bg-white/95 backdrop-blur px-5 py-4">
        {/* animated emoji */}
        <div className="flex-shrink-0 text-4xl animate-bounce select-none">
          {cfg.emoji}
        </div>

        {/* text */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-base sm:text-lg text-gray-900 leading-tight">
            Today is{" "}
            <span
              className={cn(
                "bg-gradient-to-r bg-clip-text text-transparent",
                cfg.gradient
              )}
            >
              {ev.contactName}&apos;s {ev.eventTitle}
            </span>
            !
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            Don&apos;t forget to send a personalised wish 💬
          </p>
        </div>

        {/* CTA */}
        <Link
          href={`/generate?contactId=${ev.contact_id}&eventId=${ev.id}`}
          className={cn(
            buttonVariants({ variant: "default" }),
            "rounded-xl flex-shrink-0 text-sm font-semibold px-4 py-2",
            "bg-gradient-to-r text-white border-0",
            cfg.gradient
          )}
        >
          Wish Now ✨
        </Link>

        {/* dismiss */}
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors ml-1"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        {/* sparkle decorations */}
        <div
          className={cn(
            "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 bg-gradient-to-br",
            cfg.gradient
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute -left-4 -bottom-6 h-16 w-16 rounded-full opacity-10 bg-gradient-to-tr",
            cfg.gradient
          )}
        />
      </div>
    </div>
  );
}

export function TodayBanner({ events }: { events: TodayEvent[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = events.filter((e) => !dismissed.has(e.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-3">
      {visible.map((ev) => (
        <SingleBanner
          key={ev.id}
          ev={ev}
          onDismiss={() => setDismissed((prev) => new Set([...prev, ev.id]))}
        />
      ))}
    </div>
  );
}
