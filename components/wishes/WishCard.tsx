"use client";

import { useMemo, useState } from "react";
import { Copy, MessageSquareText, RotateCcw, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function WishCard({
  wish,
  loading,
  onRegenerate,
}: {
  wish: string | null;
  loading: boolean;
  onRegenerate: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const encoded = useMemo(() => encodeURIComponent(wish ?? ""), [wish]);

  async function copy() {
    if (!wish) return;
    try {
      await navigator.clipboard.writeText(wish);
      setCopied(true);
      toast.success("Wish copied!");
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Could not copy.");
    }
  }

  return (
    <Card className="rounded-2xl shadow-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">Your wish</div>
          <div className="text-sm text-muted-foreground mt-1">
            Generated uniquely and saved so it won’t repeat.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-2xl"
            onClick={copy}
            disabled={!wish || loading}
            aria-label="Copy wish"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <a
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "rounded-2xl",
              (!wish || loading) && "pointer-events-none opacity-50"
            )}
            href={wish ? `https://wa.me/?text=${encoded}` : undefined}
            target="_blank"
            rel="noreferrer"
            aria-label="Share on WhatsApp"
          >
            <Send className="h-4 w-4" />
          </a>
          <a
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "rounded-2xl",
              (!wish || loading) && "pointer-events-none opacity-50"
            )}
            href={wish ? `sms:&body=${encoded}` : undefined}
            aria-label="Share via SMS"
          >
            <MessageSquareText className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
          </div>
        ) : wish ? (
          <div className="text-lg leading-relaxed whitespace-pre-wrap">{wish}</div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Select a contact and click Generate ✨
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {copied ? "Copied!" : ""}
        </div>
        <Button
          variant="outline"
          className="rounded-2xl"
          onClick={onRegenerate}
          disabled={!wish || loading}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Regenerate
        </Button>
      </div>
    </Card>
  );
}

