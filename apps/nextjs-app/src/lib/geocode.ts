async function geocodeAddress(locationString: string): Promise<{ lat: number; lon: number } | null> {
  if (!locationString || !locationString.trim()) return null;

  try {
    const cleanStr = locationString.trim();
    const query = cleanStr.toLowerCase().includes("india") ? cleanStr : `${cleanStr}, India`;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: {
          "User-Agent": "RojgaarApp/1.0 (contact@rojgaar.com)",
          "Accept-Language": "en-US,en;q=0.9",
        },
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      if (!isNaN(lat) && !isNaN(lon)) {
        return { lat, lon };
      }
    }
    return null;
  } catch (err) {
    console.error("Dynamic Geocoding error for query:", locationString, err);
    return null;
  }
}

export default geocodeAddress;

