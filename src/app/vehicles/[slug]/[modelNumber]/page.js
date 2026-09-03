import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllVehicles } from "@/lib/crsp";
import {
  encodeModelNumber,
  findByMakeModelSlug,
  findByModelNumber,
  makeModelSlug,
} from "@/lib/slug";
import SelectedVehicle from "@/components/SelectedVehicle";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return getAllVehicles().map((vehicle) => ({
    slug: makeModelSlug(vehicle),
    modelNumber: encodeModelNumber(vehicle["Model number"]),
  }));
}

export async function generateMetadata({ params }) {
  const { slug, modelNumber } = await params;
  const variants = findByMakeModelSlug(getAllVehicles(), slug);
  const vehicle = findByModelNumber(variants, decodeURIComponent(modelNumber));
  if (!vehicle) return {};

  return {
    title: `${vehicle.Make} ${vehicle.Model} (${vehicle["Model number"]}) CRSP Price - Kenya`,
    description: `CRSP price KES ${vehicle["CRSP (KES.)"]?.toLocaleString()} for ${vehicle.Make} ${vehicle.Model} ${vehicle["Model number"]}. Engine ${vehicle["Engine Capacity"]}cc, ${vehicle.Transmission}, ${vehicle.Fuel}.`,
  };
}

export default async function VehicleDetailPage({ params }) {
  const { slug, modelNumber } = await params;
  const variants = findByMakeModelSlug(getAllVehicles(), slug);
  const vehicle = findByModelNumber(variants, decodeURIComponent(modelNumber));

  if (!vehicle) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: `${vehicle.Make} ${vehicle.Model} ${vehicle["Model number"] || ""}`.trim(),
    brand: vehicle.Make,
    model: vehicle.Model,
    vehicleEngine: {
      "@type": "EngineSpecification",
      engineDisplacement: `${vehicle["Engine Capacity"]}cc`,
    },
    fuelType: vehicle.Fuel,
    vehicleTransmission: vehicle.Transmission,
    offers: {
      "@type": "Offer",
      priceCurrency: "KES",
      price: vehicle["CRSP (KES.)"],
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href={`/vehicles/${slug}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to {vehicle.Make} {vehicle.Model} trims
        </Link>

        <div className="mt-4">
          <SelectedVehicle vehicle={vehicle} />
        </div>
      </div>
    </div>
  );
}
