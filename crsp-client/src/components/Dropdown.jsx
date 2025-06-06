export default function Dropdown({ suggestions, onSelect }) {
  if (!suggestions.length) return null

  return (
    <ul className="absolute z-10 w-full mt-1 max-h-96 overflow-auto rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-xl">
      {suggestions.map((item) => (
        <li
          key={`${item.Make}-${item.Model}-${item["Model number"]}`}
          onClick={() => onSelect(item)}
          className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
        >
          <div className="font-medium text-gray-900 dark:text-white">
            {item.Make} {item.Model}
            {item["Model number"] && (
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                ({item["Model number"]})
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {item.Transmission} • {item["Engine Capacity"]}cc • {item.Fuel}
          </div>
        </li>
      ))}
    </ul>
  )
}