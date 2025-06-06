import { useState, useEffect } from 'react'
import Dropdown from './components/Dropdown'
import SelectedVehicle from './components/SelectedVehicle'
import { useVehicleSearch } from './hooks/useVehicleSearch'

export default function App() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [similarVehicles, setSimilarVehicles] = useState([])
  const [isDarkMode, setIsDarkMode] = useState(
    JSON.parse(localStorage.getItem('darkMode')) ??
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  const { suggestions, error } = useVehicleSearch(query)

  // Sync dark mode with HTML class and localStorage
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
    localStorage.setItem('darkMode', isDarkMode)
  }, [isDarkMode])

  const handleSelect = (item) => {
    setSelected(item)
    setQuery(`${item.Make} ${item.Model}`)
    setSimilarVehicles(
      suggestions
        .filter(v => 
          v.Make === item.Make && 
          v.Model === item.Model &&
          v["Model number"] !== item["Model number"]
        )
        .slice(0, 10)
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        >
          {isDarkMode ? (
            <span className="text-yellow-400">☀️</span>
          ) : (
            <span className="text-blue-500">🌙</span>
          )}
        </button>

        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            CRSP Vehicle Checker
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Search for vehicle specifications
          </p>
        </header>

        {/* Search Input */}
        <div className="relative mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected(null)
              setSimilarVehicles([])
            }}
            placeholder="Search by make and model eg. Toyota Land Cruiser Prado"
            className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          {!selected && suggestions.length > 0 && (
            <Dropdown suggestions={suggestions} onSelect={handleSelect} />
          )}
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <SelectedVehicle vehicle={selected} />

          {similarVehicles.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Similar Vehicles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {similarVehicles.map((vehicle) => (
                  <div 
                    key={`${vehicle.Make}-${vehicle.Model}-${vehicle["Model number"]}`}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-bold text-gray-800 dark:text-white">
                      {vehicle.Make} {vehicle.Model}
                      {vehicle["Model number"] && (
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                          ({vehicle["Model number"]})
                        </span>
                      )}
                    </h3>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <p><span className="font-medium">Engine:</span> {vehicle["Engine Capacity"]}cc</p>
                      <p><span className="font-medium">Transmission:</span> {vehicle.Transmission}</p>
                      <p><span className="font-medium">Fuel:</span> {vehicle.Fuel}</p>
                    </div>
                    <p className="mt-2 font-bold text-green-600 dark:text-green-400">
                      CRSP: KES {vehicle["CRSP (KES.)"]?.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
          Powered by Kerian Ventures Limited
        </footer>
      </div>
    </div>
  )
}