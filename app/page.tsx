"use client";

import { useState } from "react";
import Image from "next/image";

// animalData removed; animals will be shown dynamically from API results

export default function HomePage() {
  const [user, setUser] = useState<{ name: string; email: string; password?: string; photoUrl?: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [searchUnit, setSearchUnit] = useState<'miles' | 'km'>('miles');
  const [searchRange, setSearchRange] = useState(8);
  const [showAuth, setShowAuth] = useState<'login' | 'signup' | null>(null);
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  // Sighting types for iNaturalist, eBird, GBIF
  type INatTaxonBasic = { name?: string };
  type INatTaxonFull = { name?: string; preferred_common_name?: string; wikipedia_summary?: string };
  type INatSighting = {
    geojson: { coordinates: [number, number] };
    taxon?: INatTaxonBasic | INatTaxonFull;
    photos?: { url: string }[];
  };
  type EBirdSighting = {
    geojson: { coordinates: [number, number] };
    ebirdCommon?: string;
    sciName?: string;
    taxon?: { name?: string };
    comName?: string;
  };
  type GBIFSighting = {
    geojson: { coordinates: [number, number] };
    gbifSpecies?: string;
    gbifScientific?: string;
    gbifClass?: string;
    gbifOrder?: string;
    gbifFamily?: string;
    gbifGenus?: string;
  };
  type Sighting = INatSighting | EBirdSighting | GBIFSighting;
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<{
    name: string;
    sciName: string;
    desc: string;
    rarity: 'common' | 'rare';
    imageUrl: string;
    isDangerous?: boolean;
  } | null>(null);
  // Geocode location and fetch sightings from iNaturalist and eBird
  async function handleLocationSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchError(null);
    if (!location) return;
    // Limit search count for non-logged-in users
    if (!user && searchCount >= 10) {
      setSearchError("You have reached the maximum of 10 searches. Please log in or sign up to continue searching.");
      return;
    }
    setSearchCount(c => !user ? c + 1 : c);
    setLoading(true);
    // Geocode location
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
    const geoData = await geoRes.json();
    if (!geoData[0]) {
      setCoords(null);
      setSightings([]);
      setLoading(false);
      return;
    }
    const lat = parseFloat(geoData[0].lat);
    const lon = parseFloat(geoData[0].lon);
    setCoords({ lat, lon });
    // Convert range to km if needed
    const radiusKm = searchUnit === 'miles' ? searchRange * 1.60934 : searchRange;
    const apiUrl = `https://api.inaturalist.org/v1/observations?lat=${lat}&lng=${lon}&radius=${radiusKm}&per_page=50&order=desc&order_by=created_at&verifiable=true&photos=true`;
    const sightRes = await fetch(apiUrl);
    const sightData = await sightRes.json();
    let allResults = sightData.results || [];

    // Fetch bird sightings from eBird (public API, returns recent birds)
    try {
      const ebirdDist = searchUnit === 'miles' ? searchRange : Math.round(searchRange / 1.60934);
      const ebirdRes = await fetch(`https://api.ebird.org/v2/data/obs/geo/recent?lat=${lat}&lng=${lon}&dist=${ebirdDist}`, {
        headers: { 'X-eBirdApiToken': 'sample' } // Replace 'sample' with your eBird API token
      });
      if (ebirdRes.ok) {
        const ebirdData = await ebirdRes.json();
        // eBird results: { comName, sciName, lat, lng }
        const ebirdSightings = ebirdData.map((bird: EBirdSighting & { lng: number; lat: number; sciName?: string; comName?: string }) => ({
          geojson: { coordinates: [bird.lng, bird.lat] },
          taxon: { name: bird.sciName },
          ebirdCommon: bird.comName,
        }));
        allResults = [...allResults, ...ebirdSightings];
      }
    } catch {
      // Ignore eBird errors for now
    }

    // Fetch animal occurrences from GBIF (Global Biodiversity Information Facility)
    try {
      // GBIF API: search for occurrences within bounding box
      const gbifRadius = searchUnit === 'miles' ? searchRange * 0.016 : searchRange * 0.01; // ~1 mile = 0.016 deg, 1 km = 0.01 deg
      const gbifMinLat = lat - gbifRadius;
      const gbifMaxLat = lat + gbifRadius;
      const gbifMinLon = lon - gbifRadius;
      const gbifMaxLon = lon + gbifRadius;
      const gbifUrl = `https://api.gbif.org/v1/occurrence/search?decimalLatitude=${gbifMinLat},${gbifMaxLat}&decimalLongitude=${gbifMinLon},${gbifMaxLon}&limit=50&hasCoordinate=true&hasGeospatialIssue=false`;
      const gbifRes = await fetch(gbifUrl);
      if (gbifRes.ok) {
        const gbifData = await gbifRes.json();
        // GBIF results: { species, scientificName, decimalLatitude, decimalLongitude, taxonRank, kingdom, phylum, class, order, family, genus }
        const gbifSightings = gbifData.results.map((item: GBIFSighting & {
          decimalLongitude: number;
          decimalLatitude: number;
          species?: string;
          scientificName?: string;
          class?: string;
          order?: string;
          family?: string;
          genus?: string;
        }) => ({
          geojson: { coordinates: [item.decimalLongitude, item.decimalLatitude] },
          gbifSpecies: item.species || item.scientificName || "Unknown",
          gbifScientific: item.scientificName || "",
          gbifClass: item.class || "",
          gbifOrder: item.order || "",
          gbifFamily: item.family || "",
          gbifGenus: item.genus || "",
        }));
        allResults = [...allResults, ...gbifSightings];
      }
    } catch {
      // Ignore GBIF errors for now
    }

    setSightings(allResults);
    setLoading(false);
  }
  // Use all sightings as animals to display
  const filteredAnimals = sightings;
  // Map markers for sightings
  const allLocations = sightings.map(s => ({ lat: s.geojson.coordinates[1], lon: s.geojson.coordinates[0] }));
let bbox = "-0.09,51.505,-0.08,51.51";
if (coords) {
  bbox = `${coords.lon-0.1},${coords.lat-0.1},${coords.lon+0.1},${coords.lat+0.1}`;
} else if (allLocations.length > 0) {
  const lats = allLocations.map(loc => loc.lat);
  const lons = allLocations.map(loc => loc.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  bbox = `${minLon-0.5},${minLat-0.5},${maxLon+0.5},${maxLat+0.5}`;
}
// Marker string: blue for user, red for animals
let markerString = "";
if (coords) {
  markerString += `&marker=${coords.lon},${coords.lat},blue`;
}
markerString += allLocations.map(loc => `&marker=${loc.lon},${loc.lat},red`).join("");

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden" style={{fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif'}}>
      {/* Jungle Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover z-0"
        style={{ pointerEvents: 'none' }}
      >
        <source src="/final-project-circuit-stream/videos/jungle.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Top bar with Help/Feedback and Login/Signup or Profile */}
      <div className="absolute top-0 left-0 w-full flex justify-end items-center p-4 z-[100]" style={{background: 'transparent'}}>
        <div className="flex flex-col items-end mr-4 gap-2">
          <button
            className="bg-yellow-500 text-white px-3 py-2 rounded shadow hover:bg-yellow-600 font-bold animate-fadein"
            onClick={() => setShowHelp(true)}
            title="Help / Tutorial"
          >
            ❓
          </button>
          <button
            className="bg-blue-500 text-white px-3 py-2 rounded shadow hover:bg-blue-600 font-bold animate-fadein"
            onClick={() => setShowFeedback(true)}
            title="Send Feedback"
          >
            Feedback
          </button>
        </div>
        <div className="flex items-center space-x-4">
          {/* Settings button for all users */}
          <button
            className="p-2 rounded-full bg-white hover:bg-gray-200 border border-gray-300 mr-2 text-xl"
            onClick={() => {
              setEditName(user?.name || "");
              setEditPassword(user?.password || "");
              setShowSettings(true);
            }}
            title="Settings"
          >
            ⚙️
          </button>
          {!user ? (
            <>
              <button
                className="bg-white text-black px-4 py-2 rounded mr-2 hover:bg-gray-200"
                onClick={() => setShowAuth('login')}
              >
                Log In
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => setShowAuth('signup')}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              {/* Custom profile logo */}
              {user.photoUrl ? (
                <Image src={user.photoUrl} alt="Profile" width={32} height={32} className="rounded-full border-2 border-blue-400 shadow-lg animate-swoosh" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{user.name ? user.name[0].toUpperCase() : 'U'}</span>
                </div>
              )}
              <span className="font-semibold">{user.name}</span>
              <button
                className="bg-white text-black px-4 py-2 rounded font-bold border-2 border-white hover:bg-gray-200"
                onClick={() => setUser(null)}
              >
                Log Out
              </button>
            </>
          )}
        </div>
      </div>

      {/* Auth Modal - direct child, highest z-index */}
      {showAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[999]">
          <div className="bg-white text-black rounded-lg p-8 min-w-[300px] relative animate-fadein">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setShowAuth(null)}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">{showAuth === 'login' ? 'Log In' : 'Sign Up'}</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const name = (form.elements.namedItem('name') as HTMLInputElement)?.value || '';
                const email = (form.elements.namedItem('email') as HTMLInputElement)?.value || '';
                setUser({ name, email });
                setShowAuth(null);
              }}
            >
              {showAuth === 'signup' && (
                <input
                  name="name"
                  type="text"
                  placeholder="Name"
                  className="border px-3 py-2 rounded w-full mb-3"
                  required
                />
              )}
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="border px-3 py-2 rounded w-full mb-3"
                required
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="border px-3 py-2 rounded w-full mb-4"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 mb-2"
              >
                {showAuth === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            </form>
            <div className="flex flex-col items-center mt-2">
              <button
                className="bg-white border border-gray-300 text-black px-4 py-2 rounded w-full flex items-center justify-center gap-2 hover:bg-gray-100 transition-all duration-300 animate-fadein"
                onClick={() => {
                  setUser({ name: 'Google User', email: 'user@gmail.com', photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg' });
                  setShowAuth(null);
                }}
              >
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g><path d="M44.5 20H24V28.5H35.7C34.3 32.6 30.6 35.5 24 35.5C17.1 35.5 11.5 29.9 11.5 23C11.5 16.1 17.1 10.5 24 10.5C27.1 10.5 29.7 11.6 31.7 13.4L37.1 8C33.6 4.9 29.1 3 24 3C12.4 3 3 12.4 3 24C3 35.6 12.4 45 24 45C35.6 45 45 35.6 45 24C45 22.7 44.8 21.3 44.5 20Z" fill="#FFC107"/><path d="M6.3 14.7L12.5 19.1C14.5 15.1 18.9 12.5 24 12.5C27.1 12.5 29.7 13.6 31.7 15.4L37.1 10C33.6 6.9 29.1 5 24 5C16.1 5 9.1 10.1 6.3 14.7Z" fill="#FF3D00"/><path d="M24 44C29.1 44 33.6 42.1 37.1 39L31.7 33.6C29.7 35.4 27.1 36.5 24 36.5C18.9 36.5 14.5 33.9 12.5 29.9L6.3 34.3C9.1 38.9 16.1 44 24 44Z" fill="#4CAF50"/><path d="M44.5 20H24V28.5H35.7C35.1 30.2 34.1 31.7 32.7 32.8L38.1 37.2C40.7 34.8 42.5 31.7 44.5 28.5Z" fill="#1976D2"/></g></svg>
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ...existing code... */}
      {/* ...existing code... */}

      {/* ...existing code... */}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg p-8 min-w-[350px] relative flex flex-col items-center animate-fadein">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl font-bold"
              onClick={() => setShowSettings(false)}
            >×</button>
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                setUser(u => u ? { ...u, name: editName, password: editPassword } : u);
                setShowSettings(false);
              }}
              className="w-full flex flex-col gap-3"
            >
              <label className="font-semibold">Change Username</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="border px-3 py-2 rounded w-full"
                required
              />
              <label className="font-semibold">Change Password</label>
              <input
                type="password"
                value={editPassword}
                onChange={e => setEditPassword(e.target.value)}
                className="border px-3 py-2 rounded w-full"
                required
              />
              <label className="font-semibold">Search Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={searchUnit === 'miles' ? 8 : 13}
                  max={searchUnit === 'miles' ? 50 : 80}
                  value={searchRange}
                  onChange={e => setSearchRange(Number(e.target.value))}
                  className="border px-3 py-2 rounded w-24"
                  required
                />
                <span>{searchUnit === 'miles' ? 'miles' : 'km'}</span>
              </div>
              <label className="font-semibold">Units</label>
              <div className="flex gap-4 mb-2">
                <button
                  type="button"
                  className={`px-4 py-2 rounded ${searchUnit === 'miles' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
                  onClick={() => setSearchUnit('miles')}
                >Miles</button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded ${searchUnit === 'km' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
                  onClick={() => setSearchUnit('km')}
                >Kilometers</button>
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 font-bold mt-2"
              >Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg p-8 min-w-[320px] max-w-lg w-full relative animate-fadein">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl font-bold"
              onClick={() => setShowHelp(false)}
            >×</button>
            <h2 className="text-xl font-bold mb-4 text-center">How to Use Animal Explorer</h2>
            <ol className="list-decimal list-inside text-left text-base mb-4">
              <li>Enter your location in the search bar to find animals nearby.</li>
              <li>Click on any animal card to view details, rarity, and safety info.</li>
              <li>Dangerous animals are highlighted in red and show safety resources.</li>
              <li>Sign up or log in to unlock unlimited searches and profile features.</li>
              <li>Use the settings icon to change your profile, search range, or units.</li>
              <li>Click the Help button anytime for this tutorial.</li>
              <li>Send feedback or suggestions using the Feedback button below Help.</li>
            </ol>
            <p className="text-gray-700 text-center">Explore, learn, and stay safe!</p>
          </div>
        </div>
      )}
      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg p-8 min-w-[320px] max-w-lg w-full relative animate-fadein">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl font-bold"
              onClick={() => setShowFeedback(false)}
            >×</button>
            <h2 className="text-xl font-bold mb-4 text-center">Send Feedback</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                window.location.href = `mailto:akhilsnalluri@gmail.com?subject=Animal Explorer Feedback&body=${encodeURIComponent(feedbackText)}`;
                setShowFeedback(false);
                setFeedbackText("");
              }}
              className="flex flex-col gap-4"
            >
              <label className="font-semibold">Your feedback or suggestions:</label>
              <textarea
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                rows={5}
                className="border px-3 py-2 rounded w-full resize-none"
                placeholder="How is the app performance? Any improvements you'd like to see?"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 font-bold"
              >Send Feedback</button>
            </form>
          </div>
        </div>
      )}

      {/* About Section */}
      <div className="flex flex-col items-center mt-8 mb-8 z-10 relative">
        <h2 className="text-2xl font-bold mb-2">About Animal Explorer</h2>
        <p className="text-gray-300 max-w-xl text-center">
          Animal Explorer helps you discover animals around the world, learn about their habitats, and see where they live. Sign up to save your favorite animals and get updates on sightings!
        </p>
      </div>

      {/* Map Section */}
      <div className="flex flex-col items-center mb-12 z-10 relative">
        <h2 className="text-2xl font-bold mb-4 text-white drop-shadow-lg">Animal Locations Map</h2>
        <div className="w-full max-w-3xl h-96 rounded-lg overflow-hidden shadow-lg border border-gray-700">
          <div className="w-full h-full rounded-2xl border-8 border-white border-opacity-30 bg-white bg-opacity-10 shadow-2xl" style={{boxShadow: '0 0 32px 8px rgba(255,255,255,0.2)'}}>
            {/* Use static OpenStreetMap marker images for better visibility */}
            <div className="w-full h-full rounded-2xl relative" style={{ minHeight: '384px' }}>
              <img
                src={`https://staticmap.openstreetmap.de/staticmap.php?center=${coords ? coords.lat + ',' + coords.lon : '51.505,-0.09'}&zoom=12&size=800x384${coords ? `&markers=${coords.lat},${coords.lon},lightblue1` : ''}${allLocations.length > 0 ? `&markers=${allLocations.map(loc => loc.lat + ',' + loc.lon + ',red').join('|')}` : ''}`}
                alt="Animal Map"
                className="absolute top-0 left-0 w-full h-full object-cover rounded-2xl"
                style={{ border: 'none', background: 'transparent' }}
              />
            </div>
          </div>
        </div>
        {/* Map Key/Legend */}
        <div className="flex items-center gap-6 mt-4 bg-black bg-opacity-60 rounded-lg px-6 py-3 shadow-lg text-white text-base font-bold drop-shadow-lg">
          <div className="flex items-center gap-2">
            <span style={{display: 'inline-block', width: 18, height: 18, background: 'blue', borderRadius: '50%', border: '2px solid #fff'}}></span>
            <span className="text-white">User Location</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{display: 'inline-block', width: 18, height: 18, background: 'red', borderRadius: '50%', border: '2px solid #fff'}}></span>
            <span className="text-white">Animal Location</span>
          </div>
        </div>
      </div>

      {/* Animal Explorer Section */}
      <div className="flex flex-col items-center mt-8 mb-16 z-10 relative">
        <h1 className="text-3xl font-bold mb-6">Animal Explorer</h1>
        {/* Location Search Bar */}
        <form onSubmit={handleLocationSearch} className="flex flex-col items-center w-full max-w-md mb-6">
          {searchError && (
            <div className="bg-red-700 text-white rounded px-4 py-2 mb-2 w-full text-center font-semibold">
              {searchError}
            </div>
          )}
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Enter your location (city, address, etc.)"
            className="px-4 py-2 rounded w-full bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-blue-500 mb-2"
            required
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600" disabled={loading}>
            {loading ? "Searching..." : "Find Animals Near Me"}
          </button>
        </form>
        {coords && (
          <p className="text-gray-400 mb-4">Showing animals within {searchRange} {searchUnit} of <span className="font-semibold">{location}</span></p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAnimals.length === 0 && coords && !loading && (
            <p className="text-gray-400 col-span-3">No animals found within 8 miles of this location.</p>
          )}
          {filteredAnimals.map((animal, idx) => {
            // Type guards for iNaturalist, eBird, GBIF
            let imageUrl = "";
            if ('photos' in animal && Array.isArray(animal.photos) && animal.photos.length > 0 && animal.photos[0].url) {
              imageUrl = animal.photos[0].url.replace("square.", "medium.");
            }
            let name = "Unknown";
            let sciName = "";
            let desc = "";
            if ('taxon' in animal && animal.taxon) {
              const taxon = animal.taxon as INatTaxonFull;
              name = typeof taxon.preferred_common_name === 'string' && taxon.preferred_common_name
                ? taxon.preferred_common_name
                : taxon.name || "Unknown";
              sciName = taxon.name || "";
              desc = typeof taxon.wikipedia_summary === 'string' ? taxon.wikipedia_summary : "";
            } else if ('ebirdCommon' in animal) {
              name = animal.ebirdCommon || "Unknown";
              sciName = 'sciName' in animal ? animal.sciName || "" : "";
            } else if ('comName' in animal || 'sciName' in animal) {
              name = 'comName' in animal ? animal.comName || "Unknown" : "Unknown";
              sciName = 'sciName' in animal ? animal.sciName || "" : "";
            } else if ('gbifSpecies' in animal || 'gbifScientific' in animal) {
              name = animal.gbifSpecies || "Unknown";
              sciName = animal.gbifScientific || "";
              desc = [
                animal.gbifClass,
                animal.gbifOrder,
                animal.gbifFamily,
                animal.gbifGenus
              ].filter(Boolean).join(", ");
            }
            // Title case for animal name
            function toTitleCase(str: string) {
              return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
            }
            name = toTitleCase(name);
            // Danger/poison keyword check
            const dangerKeywords = [
              "poison", "venom", "danger", "toxic", "bite", "sting", "attack", "aggressive", "deadly", "harm", "fatal", "rabies", "scorpion", "snake", "spider", "shark", "bear", "wolf", "lion", "tiger", "crocodile", "alligator", "jellyfish", "mosquito", "wasp", "bee", "ant", "centipede", "millipede", "lethal", "predator", "disease", "infection", "injury"
            ];
            const lowerName = name.toLowerCase();
            const lowerSci = sciName.toLowerCase();
            const lowerDesc = desc.toLowerCase();
            const isDangerous = dangerKeywords.some(kw => lowerName.includes(kw) || lowerSci.includes(kw) || lowerDesc.includes(kw));
            // Rarity estimation
            let rarity: 'common' | 'rare' = 'common';
            if (lowerName.includes('rare') || lowerDesc.includes('rare') || lowerDesc.includes('endangered') || lowerDesc.includes('threatened')) {
              rarity = 'rare';
            }
            // Generate a varied, paragraph-style description of at least 10 lines
            let fullDesc = desc;
            if (!fullDesc || fullDesc.split('.').length < 10) {
              const lines: string[] = [];
              lines.push(`${name} (${sciName}) is a fascinating animal species.`);
              lines.push(`It is commonly found in various habitats and regions.`);
              lines.push(`The scientific name for this animal is ${sciName}.`);
              lines.push(`Many people are intrigued by the unique characteristics of the ${name}.`);
              lines.push(`This animal plays an important role in its ecosystem.`);
              lines.push(`Researchers have studied the ${name} to learn more about its behavior and adaptations.`);
              lines.push(`Some individuals of this species can be identified by their distinct appearance.`);
              lines.push(`The ${name} may interact with other animals and plants in its environment.`);
              lines.push(`Conservation efforts are sometimes necessary to protect populations of ${name}.`);
              lines.push(`Learning about the ${name} can help people appreciate biodiversity and nature.`);
              // If desc exists, add it as the last line
              if (desc) lines.push(desc);
              fullDesc = lines.join(' ');
            }
            return (
              <div
                key={name + idx}
                className={`rounded-lg shadow-lg p-6 flex flex-col items-center cursor-pointer ${isDangerous ? 'bg-red-700 bg-opacity-70' : 'bg-gray-800 bg-opacity-50'}`}
                style={{
                  transition: 'background 0.3s',
                  border: isDangerous ? '2px solid #ff0000' : '2px solid rgba(255,255,255,0.1)',
                  boxShadow: isDangerous ? '0 0 24px 4px #ff0000' : '0 0 24px 4px rgba(255,255,255,0.1)',
                  color: isDangerous ? '#fff' : undefined
                }}
                onClick={() => setSelectedAnimal({ name, sciName, desc: fullDesc, rarity, imageUrl, isDangerous })}
              >
                <div className="w-32 h-32 mb-4 bg-gray-700 bg-opacity-40 rounded-full flex items-center justify-center overflow-hidden">
                  {imageUrl ? (
                    <Image src={imageUrl} alt={name} width={128} height={128} className="object-cover w-full h-full rounded-full" />
                  ) : (
                    <span className="text-gray-400">No image</span>
                  )}
                </div>
                <h2 className="text-xl font-semibold mb-2">{name}</h2>
                <p className="text-gray-400 mb-1">Scientific Name: {sciName}</p>
                {desc && (
                  <p className="text-gray-300 text-center mt-2 text-sm">{desc}</p>
                )}
                {isDangerous && (
                  <p className="text-red-200 text-center mt-2 text-sm font-bold">Warning: This animal may be dangerous or poisonous!</p>
                )}
              </div>
            );
          })}
      {/* Animal Modal */}
      {selectedAnimal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-90 rounded-xl shadow-2xl p-10 max-w-lg w-full relative flex flex-col items-center animate-fadein">
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-black text-2xl font-bold"
              onClick={() => setSelectedAnimal(null)}
            >
              ×
            </button>
            {selectedAnimal.imageUrl ? (
              <Image src={selectedAnimal.imageUrl} alt={selectedAnimal.name} width={160} height={160} className="object-cover rounded-full mb-4" />
            ) : (
              <div className="w-40 h-40 mb-4 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-500">No image</span>
              </div>
            )}
            <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: '#111' }}>{selectedAnimal.name}</h2>
            <p className="mb-2 text-center" style={{ color: '#222' }}>Scientific Name: {selectedAnimal.sciName}</p>
            {/* Rarity scale */}
            <div className="w-full flex items-center justify-center mb-4">
              <span className="mr-2 text-sm" style={{ color: '#222' }}>Rarity:</span>
              <div className="w-32 h-4 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-purple-700 flex items-center">
                <div
                  className="h-4 rounded-full"
                  style={{
            // Emphasize danger in description for dangerous animals
            if (isDangerous) {
              fullDesc = `⚠️ Danger! ${name} is known to be dangerous or harmful to humans. Please exercise caution when encountering this animal.\n\n` + fullDesc;
            }
                    width: selectedAnimal.rarity === 'rare' ? '80%' : '20%',
                    background: selectedAnimal.rarity === 'rare' ? 'purple' : 'red',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
              <span className="ml-2 text-sm font-bold" style={{ color: selectedAnimal.rarity === 'rare' ? 'purple' : 'red' }}>
                {selectedAnimal.rarity === 'rare' ? 'Rare' : 'Common'}
              </span>
            </div>
            <p className="text-base leading-relaxed text-center mb-2" style={{ maxHeight: '350px', overflowY: 'auto', color: '#111' }}>{selectedAnimal.desc}</p>
            {/* Special Facts Section */}
            {selectedAnimal.facts && (
              <div className="w-full mt-4 mb-2">
                <h3 className="text-lg md:text-xl font-bold text-blue-700 mb-2 text-center">Special Facts</h3>
                <ul className="list-disc list-inside text-left text-blue-800 text-base md:text-lg mb-4">
                  {selectedAnimal.facts.map((fact, i) => (
                    <li key={i} className="mb-2 md:mb-3">{fact}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* Danger reasons bullet points */}
            {selectedAnimal.isDangerous && (
              <div className="w-full mt-4 mb-2">
                <h3 className="text-lg md:text-xl font-bold text-red-700 mb-2 text-center">Why is this animal dangerous?</h3>
                <ul className="list-disc list-inside text-left text-red-800 text-base md:text-lg mb-4">
                  {(() => {
                    const reasons: string[] = [];
                    const lowerName = selectedAnimal.name.toLowerCase();
                    const lowerDesc = selectedAnimal.desc.toLowerCase();
                    if (lowerName.includes('poison') || lowerDesc.includes('poison')) reasons.push('May be poisonous if touched or ingested.');
                    if (lowerName.includes('venom') || lowerDesc.includes('venom')) reasons.push('May inject venom through bite or sting.');
                    if (lowerDesc.includes('bite') || lowerName.includes('bite')) reasons.push('Can bite and cause injury.');
                    if (lowerDesc.includes('sting') || lowerName.includes('sting')) reasons.push('Can sting and cause pain or allergic reaction.');
                    if (lowerDesc.includes('attack') || lowerName.includes('attack')) reasons.push('Known to attack when threatened.');
                    if (lowerDesc.includes('aggressive') || lowerName.includes('aggressive')) reasons.push('Has aggressive behavior.');
                    if (lowerDesc.includes('deadly') || lowerName.includes('deadly')) reasons.push('Can be deadly to humans.');
                    if (lowerDesc.includes('harm') || lowerName.includes('harm')) reasons.push('Can cause harm to humans.');
                    if (lowerDesc.includes('fatal') || lowerName.includes('fatal')) reasons.push('May cause fatal injuries or illness.');
                    if (lowerDesc.includes('rabies') || lowerName.includes('rabies')) reasons.push('May carry rabies.');
                    if (lowerName.includes('scorpion')) reasons.push('Scorpions have venomous stings.');
                    if (lowerName.includes('snake')) reasons.push('Snakes may be venomous and bite.');
                    if (lowerName.includes('spider')) reasons.push('Spiders may inject venom through bites.');
                    if (lowerName.includes('shark')) reasons.push('Sharks can bite and cause serious injury.');
                    if (lowerName.includes('bear')) reasons.push('Bears are large and can attack if provoked.');
                    if (lowerName.includes('wolf')) reasons.push('Wolves may attack in packs.');
                    if (lowerName.includes('lion')) reasons.push('Lions are powerful predators.');
                    if (lowerName.includes('tiger')) reasons.push('Tigers are strong and can attack humans.');
                    if (lowerName.includes('crocodile') || lowerName.includes('alligator')) reasons.push('Crocodiles and alligators can bite and drag prey.');
                    if (lowerName.includes('jellyfish')) reasons.push('Jellyfish stings can be painful and toxic.');
                    if (lowerName.includes('mosquito')) reasons.push('Mosquitoes can transmit diseases.');
                    if (lowerName.includes('wasp') || lowerName.includes('bee') || lowerName.includes('ant')) reasons.push('Stings may cause allergic reactions.');
                    if (lowerName.includes('centipede') || lowerName.includes('millipede')) reasons.push('Some centipedes and millipedes have venomous bites.');
                    if (lowerDesc.includes('lethal')) reasons.push('Can be lethal to humans.');
                    if (lowerDesc.includes('predator')) reasons.push('Is a natural predator and may attack.');
                    if (lowerDesc.includes('disease')) reasons.push('May transmit diseases.');
                    if (lowerDesc.includes('infection')) reasons.push('Can cause infection if bitten or stung.');
                    if (lowerDesc.includes('injury')) reasons.push('Can cause serious injury.');
                    if (reasons.length === 0) reasons.push('Known to be dangerous or harmful to humans.');
                    return reasons.map((reason, i) => <li key={i} className="mb-2 md:mb-3">{reason}</li>);
                  })()}
                </ul>
                <div className="flex flex-col items-center w-full mt-6">
                  <h4 className="text-md md:text-lg font-bold text-gray-800 mb-4 text-center">Encountered this Animal? Recommended Safety Resources:</h4>
                  <ul className="w-full flex flex-col gap-3 md:gap-4">
                    <li>
                      <a
                        href="https://www.nwf.org/Educational-Resources/Wildlife-Guide/Safety-Tips"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 md:py-4 md:px-8 rounded shadow-lg text-base md:text-lg transition-colors animate-fadein text-center"
                      >
                        Wildlife Safety Tips (NWF)
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.cdc.gov/niosh/topics/wildlife/default.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block bg-yellow-700 hover:bg-yellow-800 text-white font-bold py-3 px-4 md:py-4 md:px-8 rounded shadow-lg text-base md:text-lg transition-colors animate-fadein text-center"
                      >
                        CDC: Animal Encounter Safety
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.fs.usda.gov/visit/know-before-you-go/wildlife-safety"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-4 md:py-4 md:px-8 rounded shadow-lg text-base md:text-lg transition-colors animate-fadein text-center"
                      >
                        USDA: Wildlife Safety Guide
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
        </div>
      </div>

      {/* Animations for fade/swoosh */}
      <style jsx global>{`
        .animate-fadein {
          animation: fadein 0.5s;
        }
        @keyframes fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-swoosh {
          animation: swoosh 0.5s cubic-bezier(.68,-0.55,.27,1.55);
        }
        @keyframes swoosh {
          from { transform: translateY(40px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
