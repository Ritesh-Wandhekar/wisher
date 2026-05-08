"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Users } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/generate", label: "Generate Wish", icon: Sparkles },
];

export function MobileNav({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 w-80">
        <SheetHeader className="p-5">
          <SheetTitle className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 text-white grid place-items-center">
              🎁
            </span>
            <span className="font-semibold">Wisher</span>
          </SheetTitle>
        </SheetHeader>
        <Separator />
        <nav className="p-3 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
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
      </SheetContent>
    </Sheet>
  );
}

