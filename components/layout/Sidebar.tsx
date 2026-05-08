"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, LogOut, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const nav = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/generate", label: "Generate Wish", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Could not log out.");
    }
  }

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center gap-2 px-2 py-2">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 text-white grid place-items-center text-lg">
          🎁
        </div>
        <div>
          <div className="font-semibold leading-tight">Wisher</div>
          <div className="text-xs text-muted-foreground leading-tight">
            Wish smarter
          </div>
        </div>
      </div>

      <nav className="mt-6 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-violet-50 text-violet-700"
                  : "text-zinc-700 hover:bg-zinc-100"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4">
        <Separator className="mb-4" />
        <Button
          variant="outline"
          className="w-full rounded-2xl justify-start"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}

