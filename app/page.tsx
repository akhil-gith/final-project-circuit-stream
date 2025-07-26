"use client";

import { useState } from "react";
import Image from "next/image";

// Type definitions
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

type SavedAnimal = {
  name: string;
  sciName: string;
  desc: string;
  imageUrl: string;
};

type SelectedAnimal = {
  name: string;
  sciName: string;
  desc: string;
  rarity: 'common' | 'rare';
  imageUrl: string;
  isDangerous?: boolean;
  facts?: string[];
};

type EBirdObservation = {
  lng: number;
  lat: number;
  sciName: string;
  comName: string;
};

type GBIFOccurrence = {
  decimalLongitude: number;
  decimalLatitude: number;
  species?: string;
  scientificName?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
};

type AdditionalInfo = {
  gbifClass?: string;
  gbifOrder?: string;
  gbifFamily?: string;
  gbifGenus?: string;
};

export default function HomePage() {
  // State
  const [user, setUser] = useState<{ name: string; email: string; password?: string; photoUrl?: string } | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAuth, setShowAuth] = useState<'login' | 'signup' | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [searchUnit, setSearchUnit] = useState<'miles' | 'km'>('miles');
  const [searchRange, setSearchRange] = useState(8);
  const [showHelp, setShowHelp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<SelectedAnimal | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [savedAnimals, setSavedAnimals] = useState<SavedAnimal[]>([]);
  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const [addAnimalInput, setAddAnimalInput] = useState("");
  const [addAnimalCard, setAddAnimalCard] = useState<SavedAnimal | null>(null);

  // Utility
  const toTitleCase = (str: string) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  const handleAnimationPress = (element: HTMLElement) => {
    element.classList.add('animate-press');
    setTimeout(() => element.classList.remove('animate-press'), 300);
  };

  // --- Enhanced animalDescriptions ---
  const generateComprehensiveDescription = (
    name: string,
    sciName: string,
    source: 'inat' | 'ebird' | 'gbif',
    additionalInfo?: AdditionalInfo
  ): string => {
    const cleanName = name.toLowerCase();
    const cleanSciName = sciName.toLowerCase();

    const animalDescriptions: { [key: string]: string } = {
      // ...your specific animals...
      'default': `${name} (${sciName}) is a unique member of the animal kingdom. Like all animals, it possesses specialized adaptations for survival, reproduction, and interaction with its environment. This species plays a vital role in its ecosystem, contributing to biodiversity, food webs, and ecological balance. Whether as predator, prey, pollinator, or decomposer, ${name} helps maintain the health and stability of its habitat. Studying ${name} provides insights into evolution, behavior, and the interconnectedness of life on Earth. Conservation of this species is important for sustaining natural resources and the well-being of future generations.`
    };

    if (animalDescriptions[cleanName]) {
      return animalDescriptions[cleanName];
    }
    for (const [key, description] of Object.entries(animalDescriptions)) {
      if (cleanName.includes(key) || key.includes(cleanName)) {
        return description.replace(/\([^)]*\)/g, `(${sciName})`);
      }
    }
    return animalDescriptions['default'];
  };

  // ...rest of your logic (generateAnimalFacts, filterAnimals, processAnimalData, etc.)...

  // Plant keywords for filtering
  const plantKeywords = [
    'plant', 'tree', 'flower', 'grass', 'herb', 'shrub', 'bush', 'fungi', 'moss', 'algae', 
    'lichen', 'fern', 'pinophyta', 'magnoliophyta', 'poaceae', 'fabaceae', 'rosaceae', 
    'asteraceae', 'cactaceae', 'orchidaceae', 'solanaceae', 'brassicaceae', 'lamiaceae'
  ];

  // Danger keywords for safety detection
  const dangerKeywords = [
    "poison", "venom", "danger", "toxic", "bite", "sting", "attack", "aggressive", 
    "deadly", "harm", "fatal", "rabies", "scorpion", "snake", "spider", "shark", 
    "bear", "wolf", "lion", "tiger", "crocodile", "alligator", "jellyfish"
  ];

  // ...rest of your search, add animal, filter, and process logic...

  // Example for Help/Feedback buttons side by side:
  // Replace your nav bar section with this:
  // (This is the only change you need for the buttons)
  // The rest of your file remains unchanged.

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden" style={{fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif'}}>
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 w-full flex justify-between items-center p-4 z-50">
        {/* Left side buttons */}
        <div className="flex items-center gap-2">
          {/* ...existing left buttons... */}
        </div>

        {/* Help and Feedback buttons - side by side */}
        <div className="flex flex-row items-center gap-2 mr-4">
          <button
            className="bg-yellow-500 text-white px-3 py-2 rounded shadow hover:bg-yellow-600 font-bold"
            onClick={(e) => {
              handleAnimationPress(e.currentTarget);
              setShowHelp(true);
            }}
            title="Help / Tutorial"
          >
            ❓
          </button>
          <button
            className="bg-blue-500 text-white px-3 py-2 rounded shadow hover:bg-blue-600 font-bold"
            onClick={(e) => {
              handleAnimationPress(e.currentTarget);
              setShowFeedback(true);
            }}
            title="Send Feedback"
          >
            Feedback
          </button>
        </div>

        {/* ...existing right side profile/auth buttons... */}
      </div>

      {/* ...rest of your modals and main content... */}
      {/* (No changes needed to modals or main content for these features) */}
    </div>
  );
}