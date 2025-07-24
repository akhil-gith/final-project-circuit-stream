
"use client";


import { useState } from "react";

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
    name: "Bear",
    diet: "Omnivore",
    species: "Mammal",
    image: "/images/bear.jpg",
    locations: [
      { lat: 61.5240, lon: 105.3188 }, // Russia
      { lat: 64.2008, lon: -149.4937 }, // Alaska
    ],
  }
];
