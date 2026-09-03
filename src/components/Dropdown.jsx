import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export default function Dropdown({ suggestions, onSelect }) {
  return (
    <CommandList className="max-h-96">
      {suggestions.length === 0 ? (
        <CommandEmpty>No vehicles found.</CommandEmpty>
      ) : (
        <CommandGroup>
          {suggestions.map((item) => (
            <CommandItem
              key={`${item.Make}-${item.Model}-${item["Model number"]}`}
              value={`${item.Make}-${item.Model}-${item["Model number"]}`}
              onSelect={() => onSelect(item)}
              className="flex-col items-start gap-1 py-2"
            >
              <span className="font-medium text-foreground">
                {item.Make} {item.Model}
                {item["Model number"] && (
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    ({item["Model number"]})
                  </span>
                )}
              </span>
              <span className="text-sm text-muted-foreground">
                {item.Transmission} • {item["Engine Capacity"]}cc • {item.Fuel}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </CommandList>
  );
}
