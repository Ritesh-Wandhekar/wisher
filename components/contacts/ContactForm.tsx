"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RELATIONSHIP_TYPES } from "@/lib/constants";
import { toast } from "sonner";
import type { Contact } from "@/types";

export function ContactForm({
  onSaved,
}: {
  onSaved?: (contact: Contact) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState<string>("Friend");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  async function submit() {
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          relationship,
          phone: phone.trim() || null,
          notes: notes.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      toast.success("Contact saved!");
      onSaved?.(data);
    } catch {
      toast.error("Could not save contact.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aisha" />
      </div>
      <div className="space-y-2">
        <Label>Relationship</Label>
        <Select
          value={relationship}
          onValueChange={(v) => setRelationship(v ?? "Friend")}
        >
          <SelectTrigger className="rounded-2xl">
            <SelectValue placeholder="Select relationship" />
          </SelectTrigger>
          <SelectContent>
            {RELATIONSHIP_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 123 4567" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything special to mention..." />
      </div>
      <Button className="w-full rounded-2xl" onClick={submit} disabled={loading}>
        {loading ? "Saving..." : "Save Contact"}
      </Button>
    </div>
  );
}

