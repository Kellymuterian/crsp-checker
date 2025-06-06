export default function SelectedVehicle({ vehicle }) {
  if (!vehicle) return null

  return (
    <section className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
        {vehicle.Make} {vehicle.Model}
        {vehicle["Model number"] && (
          <span className="text-base font-normal text-gray-500 dark:text-gray-400 ml-1">
            ({vehicle["Model number"]})
          </span>
        )}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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

      <div className="mt-6">
        <p className="text-xl font-bold text-green-600 dark:text-green-400">
          CRSP: KES {vehicle["CRSP (KES.)"]?.toLocaleString()}
        </p>
      </div>
    </section>
  )
}

function DetailItem({ label, value }) {
  return (
    <div>
      <span className="font-medium text-gray-700 dark:text-gray-300">{label}:</span>{' '}
      <span className="text-gray-600 dark:text-gray-400">{value}</span>
    </div>
  )
}