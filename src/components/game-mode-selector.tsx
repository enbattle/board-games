"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GameMode {
  id: string;
  name: string;
}

interface GameModeSelectorProps {
  gameName: string;
  modes: GameMode[];
}

export function GameModeSelector({ modes }: GameModeSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentMode = searchParams.get("mode") || "pvp";

  const handleModeChange = (mode: string) => {
    // Create new URLSearchParams object
    const params = new URLSearchParams(searchParams);
    // Update the mode parameter
    params.set("mode", mode);
    // Navigate to the new URL, which will trigger a game reset
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Tabs
      defaultValue={currentMode}
      className="w-full"
      onValueChange={handleModeChange}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Game Mode</h2>
        <TabsList>
          {modes.map((mode) => (
            <TabsTrigger key={mode.id} value={mode.id}>
              {mode.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {modes.map((mode) => (
        <TabsContent key={mode.id} value={mode.id} className="mt-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              {mode.id === "pvp"
                ? "Play against a friend on the same device"
                : "Challenge our AI opponent"}
            </p>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
