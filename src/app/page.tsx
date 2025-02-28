import { GameCard } from "@/components/game-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container py-8 md:py-12">
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-16">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Classic Board Games
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Play your favorite board games online with friends or challenge our
            AI
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="#games">Browse Games</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="games" className="py-8 md:py-12 lg:py-16">
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-2">
          <GameCard
            title="Nine Men's Morris"
            description="A strategic board game for two players dating back to the Roman Empire"
            image="/nmm.png"
            href="/games/nine-mens-morris"
          />
          <GameCard
            title="Gomoku"
            description="Also known as Five in a Row, a classic strategy game played on a Go board"
            image="/gomoku.png"
            href="/games/gomoku"
          />
        </div>
      </section>
    </div>
  );
}
