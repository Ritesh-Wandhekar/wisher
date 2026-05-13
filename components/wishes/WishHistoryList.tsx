"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Clock, User, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type WishEntry = {
  id: string;
  wish_text: string;
  language: string;
  tone: string;
  created_at: string;
  contacts: { id: string; name: string; relationship: string } | null;
  events: { id: string; title: string; type: string } | null;
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function typeEmoji(type: string) {
  if (type === "birthday") return "🎂";
  if (type === "anniversary") return "💍";
  return "🎉";
}

function WishHistoryCard({ entry }: { entry: WishEntry }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(entry.wish_text);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy.");
    }
  }

  return (
    <Card className="rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xl">{typeEmoji(entry.events?.type ?? "")}</span>
          <div>
            <div className="font-semibold text-sm leading-tight">
              {entry.contacts?.name ?? "Unknown"}
            </div>
            <div className="text-xs text-muted-foreground">
              {entry.events?.title ?? "Event"} · {entry.contacts?.relationship}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant="outline" className="text-xs rounded-full">
            {entry.tone}
          </Badge>
          {entry.language !== "English" && (
            <Badge variant="secondary" className="text-xs rounded-full">
              {entry.language}
            </Badge>
          )}
        </div>
      </div>

      {/* Wish text */}
      <p className="text-sm leading-relaxed text-gray-700 bg-violet-50 rounded-xl p-3 border border-violet-100">
        {entry.wish_text}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {timeAgo(entry.created_at)}
        </div>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "rounded-xl gap-1.5 h-8 text-xs",
            copied && "border-green-400 text-green-600 bg-green-50"
          )}
          onClick={copy}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
    </Card>
  );
}

export function WishHistoryList() {
  const [entries, setEntries] = useState<WishEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Could not load wish history."))
      .finally(() => setLoading(false));
  }, []);

  // Get unique contact names for filter
  const contacts = Array.from(
    new Map(
      entries
        .filter((e) => e.contacts)
        .map((e) => [e.contacts!.id, e.contacts!.name])
    ).entries()
  );

  const filtered =
    filter === "all" ? entries : entries.filter((e) => e.contacts?.id === filter);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="rounded-2xl p-5 space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-1/3" />
          </Card>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <span className="text-6xl">✨</span>
        <div className="text-lg font-semibold">No wishes yet</div>
        <div className="text-sm text-muted-foreground">
          Generate your first wish and it will appear here.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter by contact */}
      {contacts.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1 rounded-full text-sm border transition-colors",
              filter === "all"
                ? "bg-violet-600 text-white border-violet-600"
                : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            )}
          >
            <User className="h-3 w-3 inline mr-1" />
            All ({entries.length})
          </button>
          {contacts.map(([id, name]) => {
            const count = entries.filter((e) => e.contacts?.id === id).length;
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm border transition-colors",
                  filter === id
                    ? "bg-violet-600 text-white border-violet-600"
                    : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                )}
              >
                {name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Grid of wish cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((entry) => (
          <WishHistoryCard key={entry.id} entry={entry} />
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        <Sparkles className="h-3 w-3 inline mr-1" />
        {entries.length} wish{entries.length !== 1 ? "es" : ""} generated · AI never repeats a wish for the same person
      </p>
    </div>
  );
}
