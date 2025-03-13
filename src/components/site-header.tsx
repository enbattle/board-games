"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { Gamepad2 } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Gamepad2 className="h-6 w-6" />
            <span className="inline-block font-bold">Board Game Hub</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link
              href="/games/nine-mens-morris"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {`Nine Men's Morris`}
            </Link>
            <Link
              href="/games/gomoku"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Gomoku
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
