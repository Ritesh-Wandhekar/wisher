"use client";

import { useMemo, useState, useEffect } from "react";
import { Copy, RotateCcw, Check, MessageCircle, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
  const [autoCopied, setAutoCopied] = useState(false);
  const encoded = useMemo(() => encodeURIComponent(wish ?? ""), [wish]);

  // Auto-copy when wish is first generated
  useEffect(() => {
    if (wish && !loading) {
      navigator.clipboard.writeText(wish).then(() => {
        setAutoCopied(true);
        setTimeout(() => setAutoCopied(false), 3000);
      }).catch(() => {});
    }
  }, [wish, loading]);

  async function copy() {
    if (!wish) return;
    try {
      await navigator.clipboard.writeText(wish);
      setCopied(true);
      toast.success("Wish copied to clipboard!");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy.");
    }
  }

  function openWhatsApp() {
    if (!wish) return;
    // Copy first, then open WhatsApp
    navigator.clipboard.writeText(wish).catch(() => {});
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
    toast.success("Wish copied & WhatsApp opened!", { duration: 2000 });
  }

  function openSMS() {
    if (!wish) return;
    navigator.clipboard.writeText(wish).catch(() => {});
    window.open(`sms:&body=${encoded}`, "_self");
  }

  return (
    <Card className="rounded-2xl shadow-sm p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">Your wish</div>
          <div className="text-sm text-muted-foreground mt-0.5">
            Unique, personalised & saved so it won&apos;t repeat.
          </div>
        </div>
        {autoCopied && (
          <Badge
            variant="secondary"
            className="bg-green-50 text-green-700 border-green-200 animate-pulse"
          >
            <Check className="h-3 w-3 mr-1" /> Auto-copied!
          </Badge>
        )}
      </div>

      {/* Wish text */}
      <div className="mt-5 flex-1">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        ) : wish ? (
          <div className="text-base sm:text-lg leading-relaxed whitespace-pre-wrap font-medium text-gray-800 bg-violet-50 rounded-xl p-4 border border-violet-100">
            {wish}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground gap-2">
            <span className="text-4xl">✨</span>
            <span>Select a contact and click Generate</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {wish && !loading && (
        <div className="mt-5 space-y-3">
          {/* Primary share buttons */}
          <div className="grid grid-cols-2 gap-2">
            {/* WhatsApp — most prominent */}
            <Button
              className="rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold gap-2 h-11"
              onClick={openWhatsApp}
            >
              <MessageCircle className="h-4 w-4" />
              Send on WhatsApp
            </Button>

            {/* Copy */}
            <Button
              variant="outline"
              className={cn(
                "rounded-xl gap-2 h-11 transition-all",
                copied && "border-green-400 text-green-600 bg-green-50"
              )}
              onClick={copy}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied!" : "Copy Wish"}
            </Button>
          </div>

          {/* Secondary actions */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl gap-1.5 text-muted-foreground hover:text-gray-700"
              onClick={openSMS}
            >
              <Smartphone className="h-3.5 w-3.5" />
              Send via SMS
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-1.5"
              onClick={onRegenerate}
              disabled={loading}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Regenerate
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            💾 Saved to history — Gemini won&apos;t repeat this wish for {" "}
            <span className="font-medium">this person</span>
          </p>
        </div>
      )}

      {/* Regenerate when no wish yet */}
      {!wish && !loading && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={onRegenerate}
            disabled
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
        </div>
      )}
    </Card>
  );
}
