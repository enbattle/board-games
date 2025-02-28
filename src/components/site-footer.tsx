import { Gamepad2 } from "lucide-react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Board Game Hub. All rights reserved.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/games/nine-mens-morris"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Nine Men's Morris
          </Link>
          <Link
            href="/games/gomoku"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Gomoku
          </Link>
        </div>
      </div>
    </footer>
  );
}
