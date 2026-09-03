export function slugify(...parts) {
  return parts
    .join(" ")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function makeModelSlug(vehicle) {
  return slugify(vehicle.Make, vehicle.Model);
}

export function findByMakeModelSlug(rows, slug) {
  return rows.filter((row) => makeModelSlug(row) === slug);
}

export function findByModelNumber(rows, modelNumber) {
  return rows.find((row) => String(row["Model number"]) === modelNumber);
}

// encodeURIComponent leaves a few characters (*, !, ', (, )) unescaped that
// are valid in URLs but break static file generation on Windows/some filesystems.
export function encodeModelNumber(modelNumber) {
  return encodeURIComponent(String(modelNumber)).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}
