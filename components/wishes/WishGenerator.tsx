"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToneSelector } from "@/components/wishes/ToneSelector";
import { WishCard } from "@/components/wishes/WishCard";
import { LANGUAGES } from "@/lib/constants";
import { toast } from "sonner";

type Contact = { id: string; name: string; relationship: string };
type Event = { id: string; title: string; type: string; date: string };

export function WishGenerator({
  initialContactId,
  initialEventId,
}: {
  initialContactId: string | null;
  initialEventId: string | null;
}) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    initialContactId
  );
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    initialEventId
  );

  const [tone, setTone] = useState("Warm");
  const [language, setLanguage] = useState("English");

  const [wish, setWish] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedContact = useMemo(
    () => contacts.find((c) => c.id === selectedContactId) ?? null,
    [contacts, selectedContactId]
  );
  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? null,
    [events, selectedEventId]
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/contacts");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setContacts(data ?? []);
      } catch {
        toast.error("Could not load contacts.");
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedContactId) return;

    (async () => {
      try {
        const res = await fetch(`/api/events?contactId=${selectedContactId}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setEvents(data ?? []);

        if (initialEventId) setSelectedEventId(initialEventId);
      } catch {
        toast.error("Could not load events.");
      }
    })();
  }, [selectedContactId, initialEventId]);

  async function generate() {
    if (!selectedContact || !selectedEvent) {
      toast.error("Select a contact and an event.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate-wish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contactName: selectedContact.name,
          contactId: selectedContact.id,
          eventId: selectedEvent.id,
          eventType: selectedEvent.type,
          eventTitle: selectedEvent.title,
          relationship: selectedContact.relationship,
          tone,
          language,
          previousWishes: [],
        }),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setWish(data?.wish ?? null);
    } catch {
      toast.error("Could not generate wish. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="rounded-2xl shadow-sm p-6">
        <div className="text-lg font-semibold">Generate a wish</div>
        <div className="mt-1 text-sm text-muted-foreground">
          Pick a person, an event, a tone and a language.
        </div>

        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label>Contact</Label>
            <Select
              value={selectedContactId ?? ""}
              onValueChange={(v) => {
                setSelectedContactId(v);
                setSelectedEventId(null);
                setEvents([]);
                setWish(null);
              }}
            >
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Select a contact">
                  {selectedContact?.name ?? (contacts.length === 0 && selectedContactId ? "Loading..." : "Select a contact")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Event</Label>
            <Select
              value={selectedEventId ?? ""}
              onValueChange={(v) => setSelectedEventId(v)}
              disabled={!selectedContactId}
            >
              <SelectTrigger className="rounded-2xl">
                <SelectValue
                  placeholder={
                    selectedContactId ? "Select an event" : "Select a contact first"
                  }
                >
                  {selectedEvent ? `${selectedEvent.title} • ${selectedEvent.date}` : (selectedContactId ? "Select an event" : "Select a contact first")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {events.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.title} • {e.date}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tone</Label>
            <ToneSelector value={tone} onChange={setTone} />
          </div>

          <div className="space-y-2">
            <Label>Language</Label>
            <Select
              value={language}
              onValueChange={(v) => v && setLanguage(v)}
            >
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800"
            onClick={generate}
            disabled={loading}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {loading ? "Generating..." : "Generate Wish ✨"}
          </Button>
        </div>
      </Card>

      <WishCard wish={wish} loading={loading} onRegenerate={generate} />
    </div>
  );
}

