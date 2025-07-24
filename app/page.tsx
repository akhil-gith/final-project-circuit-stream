
"use client";


import Image from "next/image";
import { useState } from "react";
import {
  Home as HomeIcon,
  Search as SearchIcon,
  User as UserIcon,
} from "lucide-react";

// animalData will be filled from API
const animalData: any[] = [];
  {
    name: "Deer",
    diet: "Herbivore",
    species: "Mammal",
    image: "/images/deer.jpg",
    biome: "forest",
    locations: [
      { lat: 51.505, lon: -0.09 }, // London
      { lat: 52.520, lon: 13.405 }, // Berlin
    ],
  },
  {
    name: "Lion",
    diet: "Carnivore",
    species: "Mammal",
    image: "/images/lion.jpg",
    biome: "savannah",
    locations: [
      { lat: -1.2921, lon: 36.8219 }, // Nairobi
      { lat: -2.3333, lon: 34.8333 }, // Serengeti
    ],
  },
  {
    name: "Iguana",
    diet: "Herbivore",
    species: "Reptile",
    image: "/images/iguana.jpg",
    biome: "jungle",
    locations: [
      { lat: -6.2088, lon: 106.8456 }, // Jakarta
      { lat: 10.4806, lon: -66.9036 }, // Caracas
    ],
  },
  {
    name: "Tiger",
    diet: "Carnivore",
    species: "Mammal",
    image: "/images/tiger.jpg",
    biome: "jungle",
    locations: [
      { lat: 22.5726, lon: 88.3639 }, // Kolkata
      { lat: 23.8103, lon: 90.4125 }, // Dhaka
    ],
  },
  {
    name: "Tortoise",
    diet: "Herbivore",
    species: "Reptile",
    image: "/images/tortoise.jpg",
    biome: "desert",
    locations: [
      { lat: 25.6628, lon: 23.4162 }, // Sahara
      { lat: 33.6844, lon: 73.0479 }, // Pakistan
    ],
  },
  {
    name: "Elephant",
    diet: "Herbivore",
    species: "Mammal",
    image: "/images/elephant.jpg",
    biome: "savannah",
    locations: [
      { lat: -1.9577, lon: 37.2972 }, // Kenya
      { lat: 17.366, lon: 78.476 }, // India
    ],
  },
  {
    name: "Wolf",
    diet: "Carnivore",
    species: "Mammal",
    image: "/images/wolf.jpg",
    biome: "forest",
    locations: [
      { lat: 60.1699, lon: 24.9384 }, // Helsinki
      { lat: 45.4215, lon: -75.6997 }, // Ottawa
    ],
  },
  {
    name: "Rabbit",
    diet: "Herbivore",
    species: "Mammal",
    image: "/images/rabbit.jpg",
    biome: "forest",
    locations: [
      { lat: 51.1657, lon: 10.4515 }, // Germany
      { lat: 48.8566, lon: 2.3522 }, // Paris
    ],
  },
  {
    name: "Crocodile",
    diet: "Carnivore",
    species: "Reptile",
    image: "/images/crocodile.jpg",
    biome: "wetlands",
    locations: [
      { lat: 29.9511, lon: -90.0715 }, // Louisiana
      { lat: -12.4634, lon: 130.8456 }, // Darwin, Australia
    ],
  },
  {
    name: "Bear",
    diet: "Omnivore",
    species: "Mammal",
    image: "/images/bear.jpg",
    biome: "forest",
    locations: [
      { lat: 61.5240, lon: 105.3188 }, // Russia
      { lat: 64.2008, lon: -149.4937 }, // Alaska
    ],
  },
];




function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Returns distance in km between two lat/lon points
  const toRad = (deg: number) => deg * Math.PI / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function Home() {
  const [location, setLocation] = useState("");
  const [animals, setAnimals] = useState<any[]>([]);
  const [sightings, setSightings] = useState<any[]>([]); // {lat, lon, name, lastSeen}
  const [menuOpen, setMenuOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lon: number } | null>(null); // {lat, lon}

  const handleFindAnimals = async () => {
    // Try to parse as lat,lon first
    let lat = null, lon = null;
    const coordMatch = location.match(/^\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (coordMatch) {
      lat = parseFloat(coordMatch[1]);
      lon = parseFloat(coordMatch[2]);
    } else {
      // Geocode using Nominatim
      try {
        const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
        const data = await resp.json();
        if (data && data.length > 0) {
          lat = parseFloat(data[0].lat);
          lon = parseFloat(data[0].lon);
        }
      } catch {
        // ignore
      }
    }
    if (lat !== null && lon !== null) {
      setMapCenter({ lat, lon });
      // 8 miles = 12.87 km
      const RADIUS_KM = 12.87;
      // Find animals with any location within 8 miles, and sort by closest distance
      const filtered = animalData
        .map(animal => {
          let minDist = Infinity;
          if (animal.locations) {
            for (const loc of animal.locations) {
              const dist = haversine(lat, lon, loc.lat, loc.lon);
              if (dist < minDist) minDist = dist;
            }
          }
          return { animal, minDist };
        })
        .filter(({ minDist }) => minDist <= RADIUS_KM)
        .sort((a, b) => a.minDist - b.minDist)
        .map(({ animal }) => animal);
      setAnimals(filtered.length ? filtered : []);
    } else {
      setAnimals([]);
    }
  };

  const handleRefresh = () => {
    setLocation("");
    setAnimals(animalData);
    setMapCenter(null);
  };




  // Gather all animal locations for the filtered list
  const allLocations = animals.flatMap(animal => animal.locations || []);

  // If mapCenter is set, center map there, else fit all markers or use default
  let bbox = "-0.09,51.505,-0.08,51.51";
  if (mapCenter) {
    // 1 degree ~ 111km, so 1 deg box is ~222km wide/high
    bbox = `${mapCenter.lon-1},${mapCenter.lat-1},${mapCenter.lon+1},${mapCenter.lat+1}`;
  } else if (allLocations.length > 0) {
    const lats = allLocations.map(loc => loc.lat);
    const lons = allLocations.map(loc => loc.lon);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    // Add a small margin
    bbox = `${minLon-0.5},${minLat-0.5},${maxLon+0.5},${maxLat+0.5}`;
  }

  // Create marker string for all animal locations
  const markerString = allLocations.map(loc => `&marker=${loc.lon},${loc.lat}`).join("");

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
      {/* Top Navigation Bar with Horizontal Menu */}
      {/* Content overlay to ensure text is readable over video */}
      <div className="relative z-10">
      <header className="sticky top-0 bg-gray-900/60 backdrop-blur-sm z-50 border-b border-gray-800">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-0 sm:p-4 gap-0 sm:gap-4">
          <div className="flex flex-row w-full items-center justify-between">
            <div className="flex items-center gap-2 p-4 sm:p-0 sm:gap-6 sm:text-xl font-bold" style={{fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif'}}>
              <HomeIcon className="w-6 h-6" />
              <span>Animal App</span>
            </div>
            {/* Dropdown Menu Button */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                <span className="hidden sm:inline">Menu</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded shadow-lg z-50 animate-fade-in">
                  <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-800 text-left" onClick={() => setMenuOpen(false)}>
                    <HomeIcon className="w-4 h-4" /> Home
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-800 text-left" onClick={() => setMenuOpen(false)}>
                    <SearchIcon className="w-4 h-4" /> Search
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-800 text-left" onClick={() => setMenuOpen(false)}>
                    <UserIcon className="w-4 h-4" /> Profile
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 p-4 sm:p-0">
              {/* Auth buttons removed for static export */}
              <span className="text-gray-400 text-sm">Welcome, Guest!</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-12">
        <div className="text-sm text-gray-400 mb-4">Home / Animal Identifier</div>

        <div>
          <h1 className="text-2xl font-bold text-center mb-6">Animal Identifier</h1>

          <div className="flex flex-col gap-4 mb-6">
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Enter your address or location (e.g. 123 Main St, City)"
              className="px-4 py-2 rounded border border-gray-300 text-black"
            />
            <button
              onClick={handleFindAnimals}
              className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition-colors"
            >
              Find Animals
            </button>
            <button
              onClick={handleRefresh}
              className="bg-gray-200 text-black py-2 rounded w-24 mx-auto hover:bg-gray-300 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(pos => {
                    const { latitude, longitude } = pos.coords;
                    setLocation(`${latitude}, ${longitude}`);
                  });
                }
              }}
              className="bg-green-700 text-white py-2 rounded w-40 mx-auto hover:bg-green-800 transition-colors"
            >
              Use My GPS Location
            </button>
          </div>
          {/* Map Section */}
          <section className="mb-12 p-8 bg-gray-900/70 rounded-lg shadow text-white flex flex-col items-center backdrop-blur-sm max-w-xl mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center">Organisms Near You</h2>
            <div className="w-full flex justify-center mb-4">
              {/* Map with biome marker */}
              <iframe
                title="Nearby Organisms Map"
                width="100%"
                height="350"
                className="rounded-lg border border-gray-800"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${markerString}`}
                style={{ minWidth: '300px', maxWidth: '600px' }}
                allowFullScreen
              ></iframe>
            </div>
            <p className="text-gray-300 text-center max-w-xl">
              The map above now shows markers for each animal&apos;s location based on sample sighting data. In a real app, you could use real census or sighting datasets for more accuracy.
            </p>
          </section>


          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-center mb-12">
            {animals.length === 0 ? (
              <p className="text-white text-center">No animals found in this location.</p>
            ) : (
              animals.map(animal => (
                <div
                  key={animal.name}
                  className="bg-gray-800/70 rounded-lg shadow-xl p-8 flex flex-col items-start gap-6 backdrop-blur-sm min-w-[340px] max-w-[420px] mx-auto"
                >
                  <Image
                    src={`/final-project-circuit-stream${animal.image}`}
                    alt={animal.name}
                    width={380}
                    height={260}
                    className="object-cover rounded w-full"
                  />
                  <div className="flex flex-col gap-2 w-full">
                    <span className="text-2xl font-bold">{animal.name}</span>
                    <span>
                      Diet: {" "}
                      <span className={
                        animal.diet === "Carnivore"
                          ? "text-red-400"
                          : animal.diet === "Herbivore"
                          ? "text-green-400"
                          : "text-yellow-400"
                      }>{animal.diet}</span>
                    </span>
                    <span>
                      Species: {" "}
                      <span className={
                        animal.species === "Mammal"
                          ? "text-blue-300"
                          : "text-blue-400"
                      }>{animal.species}</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* About Us Section */}
          <section className="mt-12 mb-8 p-8 bg-gray-900/70 rounded-lg shadow text-white backdrop-blur-sm max-w-xl mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center">About Us</h2>
            <p className="text-center text-gray-300 max-w-2xl mx-auto">
              Animal Identifier is a project dedicated to helping people discover and learn about the wildlife in their local area. Our mission is to make animal information accessible and engaging for everyone, while promoting awareness and conservation.
            </p>
          </section>

          {/* Companies Section */}
          <section className="mb-8 p-8 bg-gray-900/70 rounded-lg shadow text-white backdrop-blur-sm max-w-xl mx-auto">
            <h2 className="text-xl font-bold mb-6 text-center">Our Partners</h2>
            <div className="flex flex-wrap justify-center items-center gap-8">
              <div className="flex flex-col items-center">
                <Image src="/final-project-circuit-stream/next.svg"
                  alt="Next.js" width={48} height={48} className="h-12 w-auto mb-2" />
                <span className="text-gray-300 text-sm">Next.js</span>
              </div>
              <div className="flex flex-col items-center">
                <Image src="/final-project-circuit-stream/vercel.svg"
                  alt="Vercel" width={48} height={48} className="h-12 w-auto mb-2" />
                <span className="text-gray-300 text-sm">Vercel</span>
              </div>
              <div className="flex flex-col items-center">
                <Image src="/final-project-circuit-stream/globe.svg"
                  alt="Globe" width={48} height={48} className="h-12 w-auto mb-2" />
                <span className="text-gray-300 text-sm">Globe</span>
              </div>
            </div>
          </section>
        </div>
      </main>
      </div>
    </div>
  );
}

export default function HomePage() {
  return <Home />;
}
