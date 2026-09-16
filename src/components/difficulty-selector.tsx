"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DIFFICULTIES, isDifficulty } from "@/lib/ai-search";

export function DifficultySelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "pvp";
  const difficultyParam = searchParams.get("difficulty");
  const currentDifficulty = isDifficulty(difficultyParam)
    ? difficultyParam
    : "medium";

  // Difficulty only applies to the AI opponent.
  if (mode !== "ai") return null;

  const handleDifficultyChange = (difficulty: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("difficulty", difficulty);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Tabs value={currentDifficulty} onValueChange={handleDifficultyChange}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">AI Difficulty</h2>
        <TabsList>
          {DIFFICULTIES.map((difficulty) => (
            <TabsTrigger key={difficulty.id} value={difficulty.id}>
              {difficulty.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
}
