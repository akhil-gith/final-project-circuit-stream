"use client";

import { useState } from "react";
import { User as UserIcon } from "lucide-react";

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
      { lat: 52.52, lon: 13.405 }, // Berlin
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
      { lat: 61.524, lon: 105.3188 }, // Russia
      { lat: 64.2008, lon: -149.4937 }, // Alaska
    ],
  },
];

export default function HomePage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [showAuth, setShowAuth] = useState<'login' | 'signup' | null>(null);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden" style={{fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif'}}>
      {/* Top bar with Login/Signup or Profile */}
      <div className="w-full flex justify-end items-center p-4 z-10 relative">
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
          <div className="flex items-center space-x-4">
            <UserIcon className="w-6 h-6" />
            <span>{user.name}</span>
            <span className="text-gray-400">{user.email}</span>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              onClick={() => setUser(null)}
            >
              Log Out
            </button>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20">
          <div className="bg-white text-black rounded-lg p-8 min-w-[300px] relative">
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
                className="bg-white border border-gray-300 text-black px-4 py-2 rounded w-full flex items-center justify-center gap-2 hover:bg-gray-100"
                onClick={() => {
                  setUser({ name: 'Google User', email: 'user@gmail.com' });
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

      {/* Animal Explorer Section */}
      <div className="flex flex-col items-center mt-16">
        <h1 className="text-3xl font-bold mb-6">Animal Explorer</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {animalData.map(animal => (
            <div key={animal.name} className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center">
              <div className="w-32 h-32 mb-4 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                {animal.image && (
                  <img src={animal.image} alt={animal.name} className="object-cover w-full h-full" />
                )}
              </div>
              <h2 className="text-xl font-semibold mb-2">{animal.name}</h2>
              <p className="text-gray-400 mb-1">Species: {animal.species}</p>
              <p className="text-gray-400 mb-1">Diet: {animal.diet}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
