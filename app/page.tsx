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

// Define types for API responses
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

// Define additional info type for better type safety
type AdditionalInfo = {
  gbifClass?: string;
  gbifOrder?: string;
  gbifFamily?: string;
  gbifGenus?: string;
};

export default function HomePage() {
  // User and authentication state
  const [user, setUser] = useState<{ name: string; email: string; password?: string; photoUrl?: string } | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAuth, setShowAuth] = useState<'login' | 'signup' | null>(null);
  
  // Settings and UI state
  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [searchUnit, setSearchUnit] = useState<'miles' | 'km'>('miles');
  const [searchRange, setSearchRange] = useState(8);
  const [showHelp, setShowHelp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  
  // Search and location state
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Animal display state
  const [selectedAnimal, setSelectedAnimal] = useState<SelectedAnimal | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [savedAnimals, setSavedAnimals] = useState<SavedAnimal[]>([]);
  
  // Add Animal feature state
  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const [addAnimalInput, setAddAnimalInput] = useState("");
  const [addAnimalCard, setAddAnimalCard] = useState<SavedAnimal | null>(null);

  // Utility functions
  const toTitleCase = (str: string) => {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  const handleAnimationPress = (element: HTMLElement) => {
    element.classList.add('animate-press');
    setTimeout(() => element.classList.remove('animate-press'), 300);
  };

  // Enhanced description generator
  const generateComprehensiveDescription = (name: string, sciName: string, source: 'inat' | 'ebird' | 'gbif', additionalInfo?: AdditionalInfo): string => {
    const cleanName = name.toLowerCase();
    const cleanSciName = sciName.toLowerCase();
    
    // Enhanced animal descriptions database
    const animalDescriptions: { [key: string]: string } = {
      // Birds
      'american robin': `The American Robin (${sciName}) is a widely distributed songbird found throughout North America. These medium-sized birds are easily recognizable by their brick-red breast, dark gray head, and cheerful song. Robins are ground foragers, often seen hopping across lawns searching for earthworms and insects. They build cup-shaped nests in trees and shrubs, typically laying 3-4 blue eggs. American Robins are considered harbingers of spring and play important roles in seed dispersal and insect control in their ecosystems.`,
      'blue jay': `The Blue Jay (${sciName}) is an intelligent and adaptable corvid known for its striking blue plumage, black necklace marking, and loud calls. These birds are highly social and exhibit complex behaviors including tool use, problem-solving, and the ability to mimic other bird calls. Blue Jays are omnivorous, feeding on nuts, seeds, insects, and occasionally eggs or nestlings. They cache thousands of acorns each fall, making them important contributors to forest regeneration. Their aggressive behavior helps protect smaller birds from predators.`,
      'northern cardinal': `The Northern Cardinal (${sciName}) is a vibrant songbird where males display brilliant red plumage while females show warm brown tones with red accents. Cardinals are non-migratory birds that mate for life and can live up to 15 years in the wild. They prefer dense shrubs and woodland edges, feeding primarily on seeds, grains, and fruits. Their distinctive "birdy-birdy-birdy" call is a common sound in eastern North America. Cardinals are the state bird of seven U.S. states and are beloved backyard visitors.`,
      'house sparrow': `The House Sparrow (${sciName}) is a small, social passerine bird originally from Europe and Asia but now found worldwide. Males have distinctive black bibs and chestnut markings, while females are brown and streaky. These highly adaptable birds thrive in urban environments, building nests in building crevices, traffic lights, and other human-made structures. House Sparrows are omnivorous, eating seeds, insects, and scraps. Despite their abundance, their populations have declined in some urban areas due to changes in architecture and food availability.`,
      // Mammals
      'white-tailed deer': `The White-tailed Deer (${sciName}) is North America's most widespread deer species, recognizable by the distinctive white underside of their tail which they flash when alarmed. These graceful mammals are excellent swimmers and can run up to 30 mph. Bucks grow and shed antlers annually, while does typically give birth to 1-3 fawns in late spring. White-tailed deer are browsers, feeding on leaves, shoots, nuts, and fruits. They play crucial roles in their ecosystems but can become overabundant in areas without natural predators.`,
      'eastern gray squirrel': `The Eastern Gray Squirrel (${sciName}) is a highly intelligent and acrobatic rodent known for its bushy tail and excellent climbing abilities. These squirrels have exceptional spatial memory, allowing them to relocate thousands of buried nuts. They build two types of homes: leaf nests (dreys) in tree branches and dens in tree cavities. Gray squirrels are primarily herbivorous but occasionally eat insects, bird eggs, or small animals. Their scatter-hoarding behavior makes them important seed dispersers in forest ecosystems.`,
      'raccoon': `The Raccoon (${sciName}) is a highly adaptable, nocturnal mammal recognizable by its distinctive black mask and ringed tail. Known for their dexterous front paws and problem-solving abilities, raccoons are often called "nature's bandits." They are omnivorous, eating everything from fruits and nuts to small animals, eggs, and human garbage. Raccoons are excellent climbers and swimmers, and mothers are devoted to their young, teaching them essential survival skills. Their adaptability has allowed them to thrive in both wild and urban environments.`,
      // Marine life
      'bottlenose dolphin': `The Bottlenose Dolphin (${sciName}) is one of the most intelligent marine mammals, known for their playful behavior, complex social structures, and remarkable communication abilities. These dolphins can live 40-60 years and have been observed using tools, teaching their young, and even displaying self-awareness. They hunt cooperatively, sometimes herding fish or using echolocation to locate prey buried in sand. Bottlenose dolphins form pods that can range from 2-15 individuals, though they may temporarily join larger groups. They play important roles in marine ecosystems as both predators and prey.`,
      // Reptiles
      'eastern box turtle': `The Eastern Box Turtle (${sciName}) is a terrestrial turtle known for its ability to completely withdraw into its shell, which can be sealed shut like a box. These long-lived reptiles can survive over 100 years and have excellent homing abilities, often returning to the same territories throughout their lives. Box turtles are omnivorous, eating mushrooms, berries, insects, and small animals. They play important ecological roles as seed dispersers and help control insect populations. Unfortunately, habitat loss and road mortality threaten many populations.`,
      // Default descriptions by animal class/type
      'bird': `This bird species (${sciName}) is part of the diverse avian community that plays crucial roles in ecosystems worldwide. Birds serve as pollinators, seed dispersers, and pest controllers while occupying various ecological niches. Most birds have excellent vision, complex social behaviors, and remarkable navigational abilities. They communicate through songs, calls, and visual displays, with many species showing high intelligence and adaptability. Birds face various challenges including habitat loss, climate change, and human interference, making conservation efforts essential for maintaining healthy populations.`,
      'mammal': `This mammal (${sciName}) belongs to the diverse group of warm-blooded vertebrates characterized by hair or fur, mammary glands, and complex social behaviors. Mammals occupy virtually every habitat on Earth and range from tiny shrews to massive whales. Most mammals give birth to live young and provide parental care, with many species showing remarkable intelligence, communication skills, and problem-solving abilities. They play vital roles in ecosystems as predators, prey, pollinators, and seed dispersers, contributing to the complex web of life that sustains biodiversity.`,
      'fish': `This fish species (${sciName}) is part of the incredibly diverse aquatic vertebrate group that has adapted to life in water environments worldwide. Fish possess gills for extracting oxygen from water, fins for swimming, and lateral line systems for detecting water movement and pressure changes. They occupy various ecological roles from filter feeders to apex predators, helping maintain balanced aquatic ecosystems. Many fish species show complex behaviors including schooling, territorial defense, and elaborate mating rituals. Healthy fish populations are indicators of aquatic ecosystem health.`,
      'reptile': `This reptile (${sciName}) belongs to the ancient group of cold-blooded vertebrates that includes snakes, lizards, turtles, and crocodilians. Reptiles are characterized by scaly skin, egg-laying reproduction (with some exceptions), and their ability to regulate body temperature through behavioral adaptations. They play important ecological roles as both predators and prey, helping control populations of insects, rodents, and other small animals. Many reptiles are long-lived and show remarkable adaptations to their environments, from desert survival to aquatic lifestyles.`,
      'amphibian': `This amphibian (${sciName}) represents the fascinating group of vertebrates that bridge aquatic and terrestrial environments. Most amphibians undergo metamorphosis, starting as aquatic larvae and developing into adults that can live on land. Their permeable skin makes them sensitive to environmental changes, making them important indicators of ecosystem health. Amphibians play crucial roles in food webs, consuming vast quantities of insects as adults while serving as prey for various predators. Many species face threats from habitat loss, pollution, and climate change.`,
      'insect': `This insect (${sciName}) belongs to the most diverse group of animals on Earth, with insects making up over half of all known species. Insects have three body segments, six legs, and often wings, allowing them to exploit virtually every ecological niche. They serve as pollinators, decomposers, predators, and prey, making them essential to ecosystem functioning. Many insects undergo complete metamorphosis, with distinct larval and adult stages. Their incredible diversity includes species that are social engineers, master architects, and crucial partners in plant reproduction.`
    };

    // Try to find specific description first
    if (animalDescriptions[cleanName]) {
      return animalDescriptions[cleanName];
    }

    // Check for partial matches
    for (const [key, description] of Object.entries(animalDescriptions)) {
      if (cleanName.includes(key) || key.includes(cleanName)) {
        return description.replace(/\([^)]*\)/g, `(${sciName})`);
      }
    }

    // Generate description based on source and classification
    if (source === 'ebird' || cleanName.includes('bird') || cleanSciName.includes('aves')) {
      return animalDescriptions['bird'].replace(/\([^)]*\)/g, `(${sciName})`);
    }

    if (additionalInfo?.gbifClass) {
      const gbifClass = additionalInfo.gbifClass.toLowerCase();
      if (gbifClass.includes('mammalia') || gbifClass.includes('mammal')) {
        return animalDescriptions['mammal'].replace(/\([^)]*\)/g, `(${sciName})`);
      }
      if (gbifClass.includes('actinopterygii') || gbifClass.includes('fish')) {
        return animalDescriptions['fish'].replace(/\([^)]*\)/g, `(${sciName})`);
      }
      if (gbifClass.includes('reptilia') || gbifClass.includes('reptile')) {
        return animalDescriptions['reptile'].replace(/\([^)]*\)/g, `(${sciName})`);
      }
      if (gbifClass.includes('amphibia') || gbifClass.includes('amphibian')) {
        return animalDescriptions['amphibian'].replace(/\([^)]*\)/g, `(${sciName})`);
      }
      if (gbifClass.includes('insecta') || gbifClass.includes('insect')) {
        return animalDescriptions['insect'].replace(/\([^)]*\)/g, `(${sciName})`);
      }
    }

    // Enhanced generic description with more detail
    return `${name} (${sciName}) is a fascinating species that plays an important role in its ecosystem. This animal has evolved unique adaptations that allow it to thrive in its natural habitat, contributing to the complex web of life through its interactions with other species and the environment. Like all wildlife, ${name} faces various challenges in the modern world, making conservation efforts and habitat protection crucial for maintaining healthy populations. Understanding and appreciating this species helps us recognize the incredible diversity of life on Earth and our responsibility to protect it for future generations. Each individual animal contributes to ecosystem health through complex ecological relationships that support biodiversity and environmental stability.`;
  };

  // Generate interesting facts based on animal type
  const generateAnimalFacts = (name: string): string[] => {
    const cleanName = name.toLowerCase();
    
    const factDatabase: { [key: string]: string[] } = {
      'american robin': [
        'Robins can live up to 13 years in the wild',
        'They can see ultraviolet light, helping them spot berries and insects',
        'A robin\'s red breast is actually orange - the name comes from European robins',
        'They migrate at night and can fly up to 250 miles per day'
      ],
      'blue jay': [
        'Blue jays aren\'t actually blue - their feathers scatter light to appear blue',
        'They can live up to 25 years and remember thousands of hiding spots',
        'Blue jays can mimic hawk calls to steal food from other birds',
        'A group of blue jays is called a "party" or "band"'
      ],
      'white-tailed deer': [
        'Deer can jump up to 10 feet high and 30 feet long',
        'They have excellent night vision, 5-6 times better than humans',
        'Fawns are born with no scent to protect them from predators',
        'Deer can run up to 40 mph and are excellent swimmers'
      ],
      'raccoon': [
        'Raccoons have over 200 different sounds for communication',
        'Their front paws are extremely sensitive and become more so when wet',
        'They can remember solutions to problems for up to 3 years',
        'Baby raccoons are called kits and stay with mom for about a year'
      ]
    };

    // Return specific facts if available
    if (factDatabase[cleanName]) {
      return factDatabase[cleanName];
    }

    // Generate generic but informative facts
    return [
      `${name} has unique adaptations that help it survive in its environment`,
      `This species plays an important role in maintaining ecosystem balance`,
      `${name} has evolved specific behaviors for finding food and avoiding predators`,
      `Conservation efforts help protect ${name} and its habitat for future generations`
    ];
  };

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

  // Main search function
  const handleLocationSearch = async (e: React.FormEvent) => {
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

    try {
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
      let allResults: Sighting[] = [];

      // Fetch from iNaturalist
      const apiUrl = `https://api.inaturalist.org/v1/observations?lat=${lat}&lng=${lon}&radius=${radiusKm}&per_page=50&order=desc&order_by=created_at&verifiable=true&photos=true`;
      const sightRes = await fetch(apiUrl);
      const sightData = await sightRes.json();
      allResults = sightData.results || [];

      // Fetch from eBird (with error handling)
      try {
        const ebirdDist = searchUnit === 'miles' ? searchRange : Math.round(searchRange / 1.60934);
        const ebirdRes = await fetch(`https://api.ebird.org/v2/data/obs/geo/recent?lat=${lat}&lng=${lon}&dist=${ebirdDist}`, {
          headers: { 'X-eBirdApiToken': 'sample' } // Replace with real token
        });
        
        if (ebirdRes.ok) {
          const ebirdData: EBirdObservation[] = await ebirdRes.json();
          const ebirdSightings: EBirdSighting[] = ebirdData.map((bird: EBirdObservation) => ({
            geojson: { coordinates: [bird.lng, bird.lat] as [number, number] },
            taxon: { name: bird.sciName },
            ebirdCommon: bird.comName,
            sciName: bird.sciName,
            comName: bird.comName,
          }));
          allResults = [...allResults, ...ebirdSightings];
        }
      } catch (error) {
        console.warn('eBird API error:', error);
      }

      // Fetch from GBIF (with error handling)
      try {
        const gbifRadius = searchUnit === 'miles' ? searchRange * 0.016 : searchRange * 0.01;
        const gbifMinLat = lat - gbifRadius;
        const gbifMaxLat = lat + gbifRadius;
        const gbifMinLon = lon - gbifRadius;
        const gbifMaxLon = lon + gbifRadius;
        
        const gbifUrl = `https://api.gbif.org/v1/occurrence/search?decimalLatitude=${gbifMinLat},${gbifMaxLat}&decimalLongitude=${gbifMinLon},${gbifMaxLon}&limit=50&hasCoordinate=true&hasGeospatialIssue=false`;
        const gbifRes = await fetch(gbifUrl);
        
        if (gbifRes.ok) {
          const gbifData: { results: GBIFOccurrence[] } = await gbifRes.json();
          const gbifSightings: GBIFSighting[] = gbifData.results.map((item: GBIFOccurrence) => ({
            geojson: { coordinates: [item.decimalLongitude, item.decimalLatitude] as [number, number] },
            gbifSpecies: item.species || item.scientificName || "Unknown",
            gbifScientific: item.scientificName || "",
            gbifClass: item.class || "",
            gbifOrder: item.order || "",
            gbifFamily: item.family || "",
            gbifGenus: item.genus || "",
          }));
          allResults = [...allResults, ...gbifSightings];
        }
      } catch (error) {
        console.warn('GBIF API error:', error);
      }

      setSightings(allResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced Add Animal functionality with comprehensive description
  const handleAddAnimalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = addAnimalInput.trim();
    if (!input) return;

    // Generate comprehensive description for added animals
    const comprehensiveDesc = generateComprehensiveDescription(input, input, 'inat');

    setAddAnimalCard({
      name: toTitleCase(input),
      sciName: input,
      desc: comprehensiveDesc,
      imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=256&h=256&q=80"
    });
    setShowAddAnimal(false);
    setAddAnimalInput("");
  };

  // Filter animals (remove plants)
  const filterAnimals = (animals: Sighting[]) => {
    return animals.filter(animal => {
      let name = "Unknown";
      let gbifClass = "";
      let gbifOrder = "";
      let gbifFamily = "";
      let gbifGenus = "";

      if ('taxon' in animal && animal.taxon) {
        const taxon = animal.taxon as INatTaxonFull;
        name = taxon.preferred_common_name || taxon.name || "Unknown";
      } else if ('ebirdCommon' in animal) {
        name = animal.ebirdCommon || "Unknown";
      } else if ('gbifSpecies' in animal) {
        name = animal.gbifSpecies || "Unknown";
        gbifClass = animal.gbifClass || "";
        gbifOrder = animal.gbifOrder || "";
        gbifFamily = animal.gbifFamily || "";
        gbifGenus = animal.gbifGenus || "";
      }

      name = toTitleCase(name);
      const lowerName = name.toLowerCase();
      const lowerClass = gbifClass.toLowerCase();
      const lowerOrder = gbifOrder.toLowerCase();
      const lowerFamily = gbifFamily.toLowerCase();
      const lowerGenus = gbifGenus.toLowerCase();

      // Filter out plants
      const isPlant = plantKeywords.some(kw =>
        lowerName.includes(kw) ||
        lowerClass.includes(kw) ||
        lowerOrder.includes(kw) ||
        lowerFamily.includes(kw) ||
        lowerGenus.includes(kw)
      );

      return !isPlant && name !== "Unknown";
    });
  };

  // Enhanced process animal data with comprehensive descriptions
  const processAnimalData = (animal: Sighting, idx: number) => {
    let imageUrl = "";
    if ('photos' in animal && Array.isArray(animal.photos) && animal.photos.length > 0) {
      imageUrl = animal.photos[0].url.replace("square.", "medium.");
    }

    let name = "Unknown";
    let sciName = "";
    let desc = "";
    let source: 'inat' | 'ebird' | 'gbif' = 'inat';

    if ('taxon' in animal && animal.taxon) {
      const taxon = animal.taxon as INatTaxonFull;
      name = taxon.preferred_common_name || taxon.name || "Unknown";
      sciName = taxon.name || "";
      desc = taxon.wikipedia_summary || "";
      source = 'inat';
    } else if ('ebirdCommon' in animal) {
      name = animal.ebirdCommon || "Unknown";
      sciName = ('sciName' in animal) ? animal.sciName || "" : "";
      source = 'ebird';
    } else if ('gbifSpecies' in animal) {
      name = animal.gbifSpecies || "Unknown";
      sciName = animal.gbifScientific || "";
      source = 'gbif';
      desc = [animal.gbifClass, animal.gbifOrder, animal.gbifFamily, animal.gbifGenus]
        .filter(Boolean).join(", ");
    }

    name = toTitleCase(name);
    
    // Always ensure we have a comprehensive description
    if (!desc || desc.length < 100 || desc.split('.').length < 3) {
      desc = generateComprehensiveDescription(name, sciName, source, animal as AdditionalInfo);
    }

    // Check if dangerous
    const lowerName = name.toLowerCase();
    const lowerSci = sciName.toLowerCase();
    const lowerDesc = desc.toLowerCase();
    const isDangerous = dangerKeywords.some(kw => 
      lowerName.includes(kw) || lowerSci.includes(kw) || lowerDesc.includes(kw)
    );

    // Determine rarity
    const rarity: 'common' | 'rare' = (
      lowerName.includes('rare') || 
      lowerDesc.includes('rare') || 
      lowerDesc.includes('endangered') || 
      lowerDesc.includes('threatened')
    ) ? 'rare' : 'common';

    // Generate facts
    const facts = generateAnimalFacts(name);

    return { 
      name, 
      sciName, 
      desc, 
      rarity, 
      imageUrl, 
      isDangerous, 
      facts,
      key: name + idx 
    };
  };

  const filteredAnimals = filterAnimals(sightings);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden" style={{fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif'}}>
      {/* ...all UI and modal code as shown in previous answers... */}
      {/* See previous answer for the full return block, including all modals and main content */}
    </div>
  );
}