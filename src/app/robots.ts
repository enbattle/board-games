import type { MetadataRoute } from "next";

// Required for `output: "export"` - this route has no dynamic inputs, so
// it can be fully pre-rendered at build time.
export const dynamic = "force-static";

const baseUrl = "https://enbattle.github.io/board-games";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
