"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ContactCard } from "@/components/contacts/ContactCard";
import { ContactForm } from "@/components/contacts/ContactForm";
import type { Contact } from "@/types";

type ContactListItem = Contact & {
  events_count?: number;
  last_wish?: string | null;
};

export function ContactList({ initialContacts }: { initialContacts: ContactListItem[] }) {
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactListItem[]>(initialContacts);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return contacts;
    return contacts.filter((c) => (c.name ?? "").toLowerCase().includes(query));
  }, [contacts, q]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Contacts</div>
          <div className="text-sm text-muted-foreground mt-1">
            Add the people you care about, then attach birthdays and events.
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="rounded-2xl" />}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Contact
          </DialogTrigger>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle>Add Contact</DialogTitle>
            </DialogHeader>
            <ContactForm
              onSaved={(created) => {
                setContacts((prev) => [created, ...prev]);
                setOpen(false);
                router.push(`/contacts/${created.id}`);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search contacts..."
          className="pl-9 rounded-2xl"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="rounded-2xl shadow-sm p-10 text-center">
          <div className="text-lg font-semibold">No contacts yet</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Add your first contact to start generating wishes.
          </div>
          <div className="mt-5">
            <Button className="rounded-2xl" onClick={() => setOpen(true)}>
              Add Contact
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <ContactCard
              key={c.id}
              id={c.id}
              name={c.name}
              relationship={c.relationship}
              eventsCount={c.events_count ?? c.events?.length ?? 0}
              lastWish={c.last_wish ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}

