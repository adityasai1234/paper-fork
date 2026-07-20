import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/signup"],
      disallow: ["/api/", "/audits", "/research", "/login"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
