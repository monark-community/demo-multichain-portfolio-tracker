import type { MetadataRoute } from "next"

import { SITE_URL } from "@/i18n/config"

export default function robots(): MetadataRoute.Robots {
  return {
    // /pricing is noindexed in its own metadata; listing it here would advertise it.
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
