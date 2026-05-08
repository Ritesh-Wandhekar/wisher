"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TONES } from "@/lib/constants";

export function ToneSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (tone: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {TONES.map((t) => (
        <Button
          key={t.value}
          type="button"
          variant="outline"
          className={cn(
            "rounded-full",
            value === t.value
              ? "border-violet-300 bg-violet-50 text-violet-700"
              : "hover:bg-zinc-50"
          )}
          onClick={() => onChange(t.value)}
        >
          <span className="mr-2">{t.emoji}</span>
          {t.label}
        </Button>
      ))}
    </div>
  );
}

