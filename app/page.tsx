
"use client";


import Image from "next/image";
import { useState } from "react";
import {
  Home as HomeIcon,
  Search as SearchIcon,
  User as UserIcon,
} from "lucide-react";

const animalData = [
  {
    name: "Deer",
    diet: "Herbivore",
    species: "Mammal",
    image: "/images/deer.jpg",
  },
  {
    name: "Lion",
    diet: "Carnivore",
    species: "Mammal",
    image: "/images/lion.jpg",
  },
  {
    name: "Iguana",
    diet: "Herbivore",
    species: "Reptile",
    image: "/images/iguana.jpg",
  },
  {
    name: "Tiger",
    diet: "Carnivore",
    species: "Mammal",
    image: "/images/tiger.jpg",
  },
  {
    name: "Tortoise",
    diet: "Herbivore",
    species: "Reptile",
    image: "/images/tortoise.jpg",
  },
];



function Home() {
  const [location, setLocation] = useState("");
  const [animals, setAnimals] = useState(animalData);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleFindAnimals = () => {
    const query = location.toLowerCase();
    const filtered = animalData.filter(animal =>
      (query.includes("forest") && animal.name === "Deer") ||
      (query.includes("savannah") && animal.name === "Lion") ||
      (query.includes("jungle") && (animal.name === "Tiger" || animal.name === "Iguana")) ||
      (query.includes("desert") && animal.name === "Tortoise")
    );
    setAnimals(filtered.length ? filtered : []);
  };

  const handleRefresh = () => {
    setLocation("");
    setAnimals(animalData);
  };

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

        <div className="max-w-2xl mx-auto">
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
          <section className="mb-12 p-8 bg-gray-900/70 rounded-lg shadow text-white flex flex-col items-center backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 text-center">Organisms Near You</h2>
            <div className="w-full flex justify-center mb-4">
              {/* Simple map embed using OpenStreetMap, can be replaced with a real map API */}
              <iframe
                title="Nearby Organisms Map"
                width="100%"
                height="350"
                className="rounded-lg border border-gray-800"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=-0.09,51.505,-0.08,51.51&layer=mapnik`}
                style={{ minWidth: '300px', maxWidth: '600px' }}
                allowFullScreen
              ></iframe>
            </div>
            <p className="text-gray-300 text-center max-w-xl">
              The map above shows the area around your location. In a real app, animals found nearby would be displayed here based on your address or GPS coordinates.
            </p>
          </section>


          <div className="flex flex-row flex-wrap gap-6 justify-center">
            {animals.length === 0 ? (
              <p className="text-white text-center">No animals found in this location.</p>
            ) : (
              animals.map(animal => (
                <div
                  key={animal.name}
                  className="bg-gray-800/70 rounded-lg shadow p-6 flex flex-col items-center gap-6 backdrop-blur-sm w-[400px]"
                >
                  <Image
                    src={`/final-project-circuit-stream${animal.image}`}
                    alt={animal.name}
                    width={300}
                    height={200}
                    className="object-cover rounded"
                  />
                  <div className="flex flex-col gap-2">
                    <span className="text-lg font-bold">{animal.name}</span>
                    <span>
                      Diet:{" "}
                      <span className={
                        animal.diet === "Carnivore"
                          ? "text-red-400"
                          : animal.diet === "Herbivore"
                          ? "text-green-400"
                          : "text-yellow-400"
                      }>{animal.diet}</span>
                    </span>
                    <span>
                      Species:{" "}
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
          <section className="mt-12 mb-8 p-8 bg-gray-900/70 rounded-lg shadow text-white backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 text-center">About Us</h2>
            <p className="text-center text-gray-300 max-w-2xl mx-auto">
              Animal Identifier is a project dedicated to helping people discover and learn about the wildlife in their local area. Our mission is to make animal information accessible and engaging for everyone, while promoting awareness and conservation.
            </p>
          </section>

          {/* Companies Section */}
          <section className="mb-8 p-8 bg-gray-900/70 rounded-lg shadow text-white backdrop-blur-sm">
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
