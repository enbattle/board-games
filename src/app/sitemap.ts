import type { MetadataRoute } from "next";

// Required for `output: "export"` - this route has no dynamic inputs, so
// it can be fully pre-rendered at build time.
export const dynamic = "force-static";

const baseUrl = "https://enbattle.github.io/board-games";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${baseUrl}/` },
    { url: `${baseUrl}/games/gomoku/` },
    { url: `${baseUrl}/games/nine-mens-morris/` },
  ];
}
