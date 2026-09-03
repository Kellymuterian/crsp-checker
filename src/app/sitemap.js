import { getAllVehicles } from "@/lib/crsp";
import { encodeModelNumber, makeModelSlug } from "@/lib/slug";

const SITE_URL = process.env.SITE_URL || "https://crsp-checker.vercel.app";

export default function sitemap() {
  const vehicles = getAllVehicles();
  const seenSlugs = new Set();
  const entries = [
    {
      url: SITE_URL,
      lastModified: new Date(),
    },
  ];

  for (const vehicle of vehicles) {
    const slug = makeModelSlug(vehicle);
    const modelNumber = encodeModelNumber(vehicle["Model number"]);

    if (!seenSlugs.has(slug)) {
      seenSlugs.add(slug);
      entries.push({
        url: `${SITE_URL}/vehicles/${slug}`,
        lastModified: new Date(),
      });
    }

    entries.push({
      url: `${SITE_URL}/vehicles/${slug}/${modelNumber}`,
      lastModified: new Date(),
    });
  }

  return entries;
}
