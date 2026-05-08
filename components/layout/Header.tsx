"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/MobileNav";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <div className="h-14 px-4 border-b bg-white flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-2xl"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="font-semibold">Wisher</div>
      </div>
      <MobileNav open={open} onOpenChange={setOpen} />
    </div>
  );
}

