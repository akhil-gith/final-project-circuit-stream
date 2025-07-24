
"use client";


import Image from "next/image";
import { useState } from "react";
import {
  Home as HomeIcon,
  Search as SearchIcon,
  User as UserIcon,
} from "lucide-react";

type Animal = {
  name: string;
  diet?: string;
  species?: string;
  image?: string;
  locations?: { lat: number; lon: number }[];
  sightings?: { lat: number; lon: number; lastSeen: string }[];
};

const animalData: Animal[] = [
  {
    name: "Deer",
    diet: "Herbivore",
    species: "Mammal",
    image: "/images/deer.jpg",
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
    locations: [
      { lat: 22.5726, lon: 88.3639 }, // Kolkata
      { lat: 23.8103, lon: 90.4125 }, // Dhaka
    ],
  },
  {
    name: "Tortoise",
    diet: "Herbivore",
    species: "Reptile",
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
    locations: [
      { lat: -1.2921, lon: 36.8219 }, // Nairobi
      { lat: -2.3333, lon: 34.8333 }, // Serengeti
    ],
  },
// All duplicate animal objects outside the array removed. Only one animalData array remains, properly closed.
  {
    name: "Iguana",
    diet: "Herbivore",
    species: "Reptile",
    image: "/images/iguana.jpg",
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
    locations: [
      { lat: 61.5240, lon: 105.3188 }, // Russia
      { lat: 64.2008, lon: -149.4937 }, // Alaska
    ],
  },
];
// All main JSX and logic should be inside the Home function below

// (Removed duplicate export default)





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
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [showAdvice, setShowAdvice] = useState(false);
  const [location, setLocation] = useState("");
  const [animals, setAnimals] = useState<Animal[]>(animalData);
  // Removed unused sightings state
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
      {/* ...rest of your JSX... */}
    </div>
  );
}

export default function HomePage() {
  return <Home />;
}
