export async function fetchVehicles(make, model) {
  let url = `/api/search?make=${encodeURIComponent(make)}`;
  if (model) {
    url += `&model=${encodeURIComponent(model)}`;
  }
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch suggestions');
  return response.json();
}
