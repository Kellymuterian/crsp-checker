import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SelectedVehicle({ vehicle }) {
  if (!vehicle) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          {vehicle.Make} {vehicle.Model}
          {vehicle["Model number"] && (
            <span className="ml-1 text-base font-normal text-muted-foreground">
              ({vehicle["Model number"]})
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <DetailItem label="Model Number" value={vehicle["Model number"]} />
            <DetailItem label="Engine" value={`${vehicle["Engine Capacity"]}cc`} />
            <DetailItem label="Transmission" value={vehicle.Transmission} />
          </div>
          <div className="space-y-2">
            <DetailItem label="Body Type" value={vehicle["Body Type "]} />
            <DetailItem label="Drive" value={vehicle["Drive Configuration"]} />
            <DetailItem label="Fuel" value={vehicle.Fuel} />
          </div>
        </div>

        <p className="mt-6 text-xl font-bold text-green-600 dark:text-green-400">
          CRSP: KES {vehicle["CRSP (KES.)"]?.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <span className="font-medium text-foreground">{label}:</span>{" "}
      <span className="text-muted-foreground">{value}</span>
    </div>
  );
}
