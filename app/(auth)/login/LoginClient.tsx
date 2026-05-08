"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function LoginClient() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/callback${
        redirectedFrom ? `?redirectedFrom=${encodeURIComponent(redirectedFrom)}` : ""
      }`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) throw error;
    } catch {
      toast.error("Could not start Google sign-in.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-violet-50 via-white to-purple-50">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border bg-white/70 backdrop-blur shadow-sm p-8">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 text-white grid place-items-center text-lg">
              🎁
            </div>
            <div>
              <div className="text-2xl font-semibold tracking-tight">Wisher</div>
              <div className="text-sm text-muted-foreground">
                Never miss a moment. Always say the perfect thing.
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Button
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? "Connecting..." : "Continue with Google"}
            </Button>
            <p className="mt-4 text-xs text-muted-foreground text-center">
              We use Google to securely sign you in. No password needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

