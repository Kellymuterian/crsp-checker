"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Command, CommandInput } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import Dropdown from "./Dropdown";
import { useDebounce } from "@/hooks/useDebounce";
import { useVehicleSearch } from "@/hooks/useVehicleSearch";
import { encodeModelNumber, makeModelSlug } from "@/lib/slug";

export default function SearchHome() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { suggestions, error } = useVehicleSearch(debouncedQuery);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleSelect = (item) => {
    router.push(
      `/vehicles/${makeModelSlug(item)}/${encodeModelNumber(item["Model number"])}`
    );
  };

  return (
    <div className="min-h-screen bg-background transition-colors">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="fixed top-4 right-4 z-50 rounded-full"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <header className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            CRSP Vehicle Checker
          </h1>
          <p className="text-muted-foreground">Search for vehicle specifications</p>
        </header>

        <div className="relative mb-8">
          <Command shouldFilter={false} className="overflow-visible rounded-lg border">
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search by make and model eg. Toyota Land Cruiser Prado"
            />
            {debouncedQuery.trim().length >= 2 && (
              <Dropdown suggestions={suggestions} onSelect={handleSelect} />
            )}
          </Command>
        </div>

        {error && (
          <div className="rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        <footer className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
          Powered by Kerian Ventures Limited
        </footer>
      </div>
    </div>
  );
}
