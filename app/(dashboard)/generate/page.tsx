import { WishGenerator } from "@/components/wishes/WishGenerator";

export default async function GeneratePage({
  searchParams,
}: {
  searchParams: Promise<{ contactId?: string; eventId?: string }>;
}) {
  const sp = await searchParams;
  return (
    <WishGenerator
      initialContactId={sp.contactId ?? null}
      initialEventId={sp.eventId ?? null}
    />
  );
}

