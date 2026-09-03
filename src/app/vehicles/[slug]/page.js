import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllVehicles } from "@/lib/crsp";
import { encodeModelNumber, findByMakeModelSlug } from "@/lib/slug";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const variants = findByMakeModelSlug(getAllVehicles(), slug);
  if (variants.length === 0) return {};

  const { Make, Model } = variants[0];
  return {
    title: `${Make} ${Model} CRSP Prices & Specs in Kenya`,
    description: `Compare CRSP prices, engine, transmission and fuel specs for all ${Make} ${Model} trims available in Kenya.`,
  };
}

export default async function MakeModelPage({ params }) {
  const { slug } = await params;
  const variants = findByMakeModelSlug(getAllVehicles(), slug);

  if (variants.length === 0) notFound();

  const { Make, Model } = variants[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          &larr; Back to search
        </Link>

        <header className="mb-8 mt-4">
          <h1 className="text-3xl font-bold text-foreground">
            {Make} {Model}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {variants.length} trim{variants.length === 1 ? "" : "s"} available
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {variants.map((vehicle) => (
            <Link
              key={vehicle["Model number"]}
              href={`/vehicles/${slug}/${encodeModelNumber(vehicle["Model number"])}`}
            >
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle>
                    {vehicle.Make} {vehicle.Model}
                    {vehicle["Model number"] && (
                      <span className="ml-1 text-sm font-normal text-muted-foreground">
                        ({vehicle["Model number"]})
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {vehicle.Transmission} • {vehicle["Engine Capacity"]}cc •{" "}
                    {vehicle.Fuel}
                  </div>
                  <p className="mt-2 font-bold text-green-600 dark:text-green-400">
                    CRSP: KES {vehicle["CRSP (KES.)"]?.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
