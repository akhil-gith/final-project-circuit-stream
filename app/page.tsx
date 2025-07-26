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

  // Enhanced description generator with comprehensive animal database
  const generateComprehensiveDescription = (name: string, sciName: string, source: 'inat' | 'ebird' | 'gbif', additionalInfo?: AdditionalInfo): string => {
    const cleanName = name.toLowerCase();
    const cleanSciName = sciName.toLowerCase();
    
    // Comprehensive animal descriptions database
    const animalDescriptions: { [key: string]: string } = {
      // Birds
      'american robin': `The American Robin (${sciName}) is a widely distributed songbird found throughout North America. These medium-sized birds are easily recognizable by their brick-red breast, dark gray head, and cheerful song. Robins are ground foragers, often seen hopping across lawns searching for earthworms and insects. They build cup-shaped nests in trees and shrubs, typically laying 3-4 blue eggs. American Robins are considered harbingers of spring and play important roles in seed dispersal and insect control in their ecosystems.`,
      
      'blue jay': `The Blue Jay (${sciName}) is an intelligent and adaptable corvid known for its striking blue plumage, black necklace marking, and loud calls. These birds are highly social and exhibit complex behaviors including tool use, problem-solving, and the ability to mimic other bird calls. Blue Jays are omnivorous, feeding on nuts, seeds, insects, and occasionally eggs or nestlings. They cache thousands of acorns each fall, making them important contributors to forest regeneration. Their aggressive behavior helps protect smaller birds from predators.`,
      
      'northern cardinal': `The Northern Cardinal (${sciName}) is a vibrant songbird where males display brilliant red plumage while females show warm brown tones with red accents. Cardinals are non-migratory birds that mate for life and can live up to 15 years in the wild. They prefer dense shrubs and woodland edges, feeding primarily on seeds, grains, and fruits. Their distinctive "birdy-birdy-birdy" call is a common sound in eastern North America. Cardinals are the state bird of seven U.S. states and are beloved backyard visitors.`,
      
      'house sparrow': `The House Sparrow (${sciName}) is a small, social passerine bird originally from Europe and Asia but now found worldwide. Males have distinctive black bibs and chestnut markings, while females are brown and streaky. These highly adaptable birds thrive in urban environments, building nests in building crevices, traffic lights, and other human-made structures. House Sparrows are omnivorous, eating seeds, insects, and scraps. Despite their abundance, their populations have declined in some urban areas due to changes in architecture and food availability.`,
      
      'red-tailed hawk': `The Red-tailed Hawk (${sciName}) is one of North America's most common and recognizable raptors. These powerful birds of prey are known for their distinctive rusty-red tail feathers and piercing call often used in movies. Red-tailed hawks are excellent hunters, using their keen eyesight to spot prey from great distances. They primarily hunt small mammals like rodents and rabbits, but will also take birds, reptiles, and amphibians. These adaptable hawks can be found in diverse habitats from deserts to forests to urban areas.`,
      
      'great blue heron': `The Great Blue Heron (${sciName}) is North America's largest heron, standing up to 4.5 feet tall with a wingspan reaching 6.5 feet. These majestic wading birds are patient hunters, often standing motionless in shallow water waiting for fish, frogs, or other aquatic prey to come within striking distance. Great Blue Herons are found near wetlands, lakes, rivers, and coastal areas. They build large stick nests in colonies called rookeries, often high in trees. Despite their size, they are surprisingly graceful in flight.`,
      
      // Mammals
      'white-tailed deer': `The White-tailed Deer (${sciName}) is North America's most widespread deer species, recognizable by the distinctive white underside of their tail which they flash when alarmed. These graceful mammals are excellent swimmers and can run up to 30 mph. Bucks grow and shed antlers annually, while does typically give birth to 1-3 fawns in late spring. White-tailed deer are browsers, feeding on leaves, shoots, nuts, and fruits. They play crucial roles in their ecosystems but can become overabundant in areas without natural predators.`,
      
      'eastern gray squirrel': `The Eastern Gray Squirrel (${sciName}) is a highly intelligent and acrobatic rodent known for its bushy tail and excellent climbing abilities. These squirrels have exceptional spatial memory, allowing them to relocate thousands of buried nuts. They build two types of homes: leaf nests (dreys) in tree branches and dens in tree cavities. Gray squirrels are primarily herbivorous but occasionally eat insects, bird eggs, or small animals. Their scatter-hoarding behavior makes them important seed dispersers in forest ecosystems.`,
      
      'raccoon': `The Raccoon (${sciName}) is a highly adaptable, nocturnal mammal recognizable by its distinctive black mask and ringed tail. Known for their dexterous front paws and problem-solving abilities, raccoons are often called "nature's bandits." They are omnivorous, eating everything from fruits and nuts to small animals, eggs, and human garbage. Raccoons are excellent climbers and swimmers, and mothers are devoted to their young, teaching them essential survival skills. Their adaptability has allowed them to thrive in both wild and urban environments.`,
      
      'black bear': `The American Black Bear (${sciName}) is North America's most common bear species and an excellent climber despite weighing up to 600 pounds. These intelligent omnivores have an exceptional sense of smell, seven times better than a bloodhound's. Black bears are not always black - they can be brown, cinnamon, blonde, or even white. They are generally shy and avoid humans, but can become dangerous if surprised or protecting cubs. Black bears play important ecological roles as seed dispersers and help control insect populations.`,
      
      'coyote': `The Coyote (${sciName}) is a highly adaptable canid that has expanded its range across North America. These intelligent predators are known for their distinctive howling calls and pack hunting strategies. Coyotes are opportunistic omnivores, eating everything from small mammals and birds to fruits and insects. They have remarkable problem-solving abilities and have learned to thrive in urban environments. Coyotes play important roles in controlling rodent populations and are considered a keystone species in many ecosystems.`,
      
      // Marine life
      'bottlenose dolphin': `The Bottlenose Dolphin (${sciName}) is one of the most intelligent marine mammals, known for their playful behavior, complex social structures, and remarkable communication abilities. These dolphins can live 40-60 years and have been observed using tools, teaching their young, and even displaying self-awareness. They hunt cooperatively, sometimes herding fish or using echolocation to locate prey buried in sand. Bottlenose dolphins form pods that can range from 2-15 individuals, though they may temporarily join larger groups.`,
      
      'harbor seal': `The Harbor Seal (${sciName}) is a true seal found in coastal waters of the northern hemisphere. These marine mammals are excellent divers, capable of staying underwater for up to 30 minutes while hunting for fish, squid, and crustaceans. Harbor seals have excellent underwater vision and sensitive whiskers that help them detect prey in murky water. They come ashore to rest, give birth, and nurse their pups. Harbor seals are important indicators of ocean health.`,
      
      // Reptiles
      'eastern box turtle': `The Eastern Box Turtle (${sciName}) is a terrestrial turtle known for its ability to completely withdraw into its shell, which can be sealed shut like a box. These long-lived reptiles can survive over 100 years and have excellent homing abilities, often returning to the same territories throughout their lives. Box turtles are omnivorous, eating mushrooms, berries, insects, and small animals. They play important ecological roles as seed dispersers and help control insect populations.`,
      
      'garter snake': `The Common Garter Snake (${sciName}) is one of North America's most widespread snake species and is completely harmless to humans. These adaptable reptiles are excellent swimmers and can be found in diverse habitats from gardens to wetlands. Garter snakes are ovoviviparous, meaning they give birth to live young rather than laying eggs. They primarily feed on earthworms, amphibians, and small fish. Garter snakes play important roles in controlling pest populations.`,
      
      // Amphibians
      'american bullfrog': `The American Bullfrog (${sciName}) is North America's largest frog species, with males capable of producing loud, deep calls that can be heard up to a mile away. These semi-aquatic amphibians are voracious predators, eating anything they can swallow including insects, fish, small mammals, and even other frogs. Bullfrogs undergo complete metamorphosis, starting as aquatic tadpoles that can take up to two years to transform into adults. They are important indicators of wetland health.`,
      
      'red-spotted newt': `The Red-spotted Newt (${sciName}) has a fascinating three-stage life cycle including an aquatic larval stage, a terrestrial juvenile stage called an eft, and an aquatic adult stage. The bright orange eft stage serves as a warning to predators about their toxic skin secretions. Adult newts return to water to breed and can regenerate lost limbs, tails, and even parts of their hearts and brains. They feed on insects, worms, and small aquatic creatures.`,
      
      // Insects
      'monarch butterfly': `The Monarch Butterfly (${sciName}) is famous for its incredible multi-generational migration spanning thousands of miles. These orange and black butterflies are toxic to predators due to chemicals they absorb from milkweed plants as caterpillars. Monarchs play crucial roles as pollinators and are considered an indicator species for ecosystem health. Their population has declined significantly due to habitat loss and pesticide use, making conservation efforts critical.`,
      
      'honeybee': `The European Honeybee (${sciName}) is one of the world's most important pollinators, responsible for pollinating about one-third of the food we eat. These social insects live in complex colonies with a single queen, thousands of worker bees, and seasonal drones. Honeybees communicate through intricate dances that convey information about food sources. They produce honey, beeswax, and other valuable products while providing essential pollination services to both wild plants and agricultural crops.`,
      
      // Default descriptions by animal class/type
      'bird': `This bird species (${sciName}) is part of the diverse avian community that plays crucial roles in ecosystems worldwide. Birds serve as pollinators, seed dispersers, and pest controllers while occupying various ecological niches. Most birds have excellent vision, complex social behaviors, and remarkable navigational abilities. They communicate through songs, calls, and visual displays, with many species showing high intelligence and adaptability.`,
      
      'mammal': `This mammal (${sciName}) belongs to the diverse group of warm-blooded vertebrates characterized by hair or fur, mammary glands, and complex social behaviors. Mammals occupy virtually every habitat on Earth and range from tiny shrews to massive whales. Most mammals give birth to live young and provide parental care, with many species showing remarkable intelligence, communication skills, and problem-solving abilities.`,
      
      'fish': `This fish species (${sciName}) is part of the incredibly diverse aquatic vertebrate group that has adapted to life in water environments worldwide. Fish possess gills for extracting oxygen from water, fins for swimming, and lateral line systems for detecting water movement and pressure changes. They occupy various ecological roles from filter feeders to apex predators, helping maintain balanced aquatic ecosystems.`,
      
      'reptile': `This reptile (${sciName}) belongs to the ancient group of cold-blooded vertebrates that includes snakes, lizards, turtles, and crocodilians. Reptiles are characterized by scaly skin, egg-laying reproduction (with some exceptions), and their ability to regulate body temperature through behavioral adaptations. They play important ecological roles as both predators and prey, helping control populations of insects, rodents, and other small animals.`,
      
      'amphibian': `This amphibian (${sciName}) represents the fascinating group of vertebrates that bridge aquatic and terrestrial environments. Most amphibians undergo metamorphosis, starting as aquatic larvae and developing into adults that can live on land. Their permeable skin makes them sensitive to environmental changes, making them important indicators of ecosystem health.`,
      
      'insect': `This insect (${sciName}) belongs to the most diverse group of animals on Earth, with insects making up over half of all known species. Insects have three body segments, six legs, and often wings, allowing them to exploit virtually every ecological niche. They serve as pollinators, decomposers, predators, and prey, making them essential to ecosystem functioning.`
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
    return `${name} (${sciName}) is a fascinating species that plays an important role in its ecosystem. This animal has evolved unique adaptations that allow it to thrive in its natural habitat, contributing to the complex web of life through its interactions with other species and the environment. Like all wildlife, ${name} faces various challenges in the modern world, making conservation efforts and habitat protection crucial for maintaining healthy populations. Understanding and appreciating this species helps us recognize the incredible diversity of life on Earth and our responsibility to protect it for future generations.`;
  };

  // Enhanced facts database with more comprehensive information
  const generateAnimalFacts = (name: string): string[] => {
    const cleanName = name.toLowerCase();
    
    const factDatabase: { [key: string]: string[] } = {
      'american robin': [
        'Robins can live up to 13 years in the wild and have excellent memories',
        'They can see ultraviolet light, helping them spot berries and insects',
        'A robin\'s red breast is actually orange - the name comes from European robins',
        'They migrate at night and can fly up to 250 miles per day',
        'Robins are one of the first birds to sing in the morning and last to stop at night'
      ],
      'blue jay': [
        'Blue jays aren\'t actually blue - their feathers scatter light to appear blue',
        'They can live up to 25 years and remember thousands of hiding spots',
        'Blue jays can mimic hawk calls to steal food from other birds',
        'A group of blue jays is called a "party" or "band"',
        'They are one of the few birds that use tools to obtain food'
      ],
      'northern cardinal': [
        'Cardinals are the state bird of seven U.S. states',
        'They can live up to 15 years and mate for life',
        'Male cardinals feed their mates during courtship and nesting',
        'Cardinals don\'t migrate and can be seen year-round in their territories',
        'They have a vocabulary of over 25 different songs'
      ],
      'white-tailed deer': [
        'Deer can jump up to 10 feet high and 30 feet long',
        'They have excellent night vision, 5-6 times better than humans',
        'Fawns are born with no scent to protect them from predators',
        'Deer can run up to 40 mph and are excellent swimmers',
        'A deer\'s antlers can grow up to an inch per day during summer'
      ],
      'raccoon': [
        'Raccoons have over 200 different sounds for communication',
        'Their front paws are extremely sensitive and become more so when wet',
        'They can remember solutions to problems for up to 3 years',
        'Baby raccoons are called kits and stay with mom for about a year',
        'Raccoons can open complex locks and have been observed washing food'
      ],
      'black bear': [
        'Black bears can run up to 35 mph and are excellent climbers',
        'They have a sense of smell seven times better than a bloodhound',
        'Black bears can live up to 30 years in the wild',
        'Despite their name, black bears can be brown, cinnamon, or even blonde',
        'They can hibernate for up to 7 months without eating, drinking, or eliminating waste'
      ],
      'bottlenose dolphin': [
        'Dolphins have names for each other - unique whistle signatures',
        'They can recognize themselves in mirrors, showing self-awareness',
        'Dolphins sleep with one half of their brain at a time',
        'They can dive up to 1,000 feet deep and hold their breath for 15 minutes',
        'Dolphins have been observed using sea sponges as tools to protect their noses while foraging'
      ],
      'monarch butterfly': [
        'Monarchs migrate up to 3,000 miles, but no single butterfly completes the entire journey',
        'They use the sun and magnetic fields to navigate during migration',
        'Monarchs can only reproduce on milkweed plants',
        'A monarch\'s wings beat about 300-720 times per minute',
        'They taste with their feet and smell with their antennae'
      ]
    };

    // Return specific facts if available
    if (factDatabase[cleanName]) {
      return factDatabase[cleanName];
    }

    // Check for partial matches
    for (const [key, facts] of Object.entries(factDatabase)) {
      if (cleanName.includes(key) || key.includes(cleanName)) {
        return facts;
      }
    }

    // Generate generic but informative facts based on animal type
    if (cleanName.includes('bird') || cleanName.includes('hawk') || cleanName.includes('eagle') || cleanName.includes('owl')) {
      return [
        `${name} has excellent vision and can see details from great distances`,
        `This bird species plays an important role in controlling pest populations`,
        `${name} has specialized feathers that help with flight and temperature regulation`,
        `Many birds like ${name} can navigate using the Earth's magnetic field`,
        `${name} contributes to seed dispersal and pollination in its ecosystem`
      ];
    }

    if (cleanName.includes('deer') || cleanName.includes('elk') || cleanName.includes('moose')) {
      return [
        `${name} has excellent hearing and can detect sounds from far away`,
        `These animals are important herbivores that help shape forest ecosystems`,
        `${name} has specialized digestive systems to process plant material`,
        `They communicate through scent marking and body language`,
        `${name} plays a crucial role in the food web as prey for large predators`
      ];
    }

    if (cleanName.includes('bear') || cleanName.includes('wolf') || cleanName.includes('coyote')) {
      return [
        `${name} has an exceptional sense of smell for finding food and detecting danger`,
        `These predators help maintain healthy prey populations in their ecosystems`,
        `${name} shows complex social behaviors and family structures`,
        `They are highly intelligent and capable of problem-solving`,
        `${name} requires large territories to find sufficient food and mates`
      ];
    }

    // Generate generic but informative facts
    return [
      `${name} has unique adaptations that help it survive in its environment`,
      `This species plays an important role in maintaining ecosystem balance`,
      `${name} has evolved specific behaviors for finding food and avoiding predators`,
      `Conservation efforts help protect ${name} and its habitat for future generations`,
      `${name} contributes to biodiversity and the complex web of life in nature`
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
    name = animal.taxon.name || "Unknown";
  } else if ('gbifSpecies' in animal) {
    name = animal.gbifSpecies || "Unknown";
    gbifClass = animal.gbifClass || "";
    gbifOrder = animal.gbifOrder || "";
    gbifFamily = animal.gbifFamily || "";
    gbifGenus = animal.gbifGenus || "";
  } else if ('ebirdCommon' in animal) {
    name = animal.ebirdCommon || animal.comName || "Unknown";
  }

  // Filter out plants by keywords and GBIF class
  const lowerName = name.toLowerCase();
  const lowerClass = gbifClass.toLowerCase();
  if (
    plantKeywords.some(keyword => lowerName.includes(keyword)) ||
    plantKeywords.some(keyword => lowerClass.includes(keyword))
  ) {
    return false;
  }
    return true;
    });
  };