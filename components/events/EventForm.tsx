"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EVENT_TYPES } from "@/lib/constants";
import { toast } from "sonner";
import type { Event } from "@/types";

export function EventForm({
  contactId,
  onSaved,
}: {
  contactId: string;
  onSaved?: (event: Event) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"birthday" | "anniversary" | "custom">(
    "birthday"
  );
  const [title, setTitle] = useState("Birthday");
  const [date, setDate] = useState("");
  const [isRecurring, setIsRecurring] = useState(true);

  async function submit() {
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!date) {
      toast.error("Date is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contact_id: contactId,
          type,
          title: title.trim(),
          date,
          is_recurring: isRecurring,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      toast.success("Event saved!");
      onSaved?.(data);
    } catch {
      toast.error("Could not save event.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Type</Label>
        <Select
          value={type}
          onValueChange={(v) => {
            if (!v) return;
            const next = v as typeof type;
            setType(next);
            setTitle(
              next === "birthday"
                ? "Birthday"
                : next === "anniversary"
                  ? "Anniversary"
                  : "Custom Event"
            );
          }}
        >
          <SelectTrigger className="rounded-2xl">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {EVENT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.icon} {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Work Anniversary"
          className="rounded-2xl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-2xl"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
        />
        Recurs every year
      </label>

      <Button className="w-full rounded-2xl" onClick={submit} disabled={loading}>
        {loading ? "Saving..." : "Save Event"}
      </Button>
    </div>
  );
}

