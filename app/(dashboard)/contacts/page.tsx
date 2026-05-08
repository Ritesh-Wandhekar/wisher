import { createClient } from "@/lib/supabase/server";
import { ContactList } from "@/components/contacts/ContactList";
import type { Contact } from "@/types";

export default async function ContactsPage() {
  const supabase = await createClient();
  const { data: contacts, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-2xl border bg-white p-6">
        <div className="text-lg font-semibold">Contacts</div>
        <div className="mt-2 text-sm text-muted-foreground">
          Could not load contacts.
        </div>
      </div>
    );
  }

  return <ContactList initialContacts={(contacts ?? []) as Contact[]} />;
}

