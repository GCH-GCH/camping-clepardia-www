export type SectionImageCategory =
  | 'camping'
  | 'bungalows'
  | 'sanitary'
  | 'transport'
  | 'family'
  | 'reception'
  | 'aerial';

export interface SectionImage {
  key: string;
  src: string;
  title: string;
  alt: string;
  category: SectionImageCategory;
  tags: string[];
  featured?: boolean;
}

const sectionPath = (file: string) => `/images/sections/${file}`;

export const sectionImages: SectionImage[] = [
  {
    key: 'camping-pitches',
    src: sectionPath('camping-pitches.webp'),
    title: 'Miejsca campingowe',
    alt: 'Zielone miejsca campingowe na Camping Clepardia',
    category: 'camping',
    tags: ['kamper', 'namiot', 'przyczepa', 'teren'],
    featured: true,
  },
  {
    key: 'camping-open-space',
    src: sectionPath('camping-open-space.webp'),
    title: 'Otwarta przestrzeń campingu',
    alt: 'Otwarta zielona przestrzeń campingu w Krakowie',
    category: 'camping',
    tags: ['teren', 'zieleń', 'pobyt'],
  },
  {
    key: 'camping-green-canopy',
    src: sectionPath('camping-green-canopy.webp'),
    title: 'Zieleń i cień',
    alt: 'Zacieniona część campingu z drzewami',
    category: 'camping',
    tags: ['cień', 'drzewa', 'spokój'],
  },
  {
    key: 'camper-pitches-concrete-slabs',
    src: sectionPath('camper-pitches-concrete-slabs.webp'),
    title: 'Płyty betonowe dla kamperów',
    alt: 'Miejsca dla kamperów na płytach betonowych',
    category: 'camping',
    tags: ['kamper', 'płyty betonowe', 'pojazd'],
  },
  {
    key: 'campers-under-trees',
    src: sectionPath('campers-under-trees.webp'),
    title: 'Kampery pod drzewami',
    alt: 'Kampery ustawione w zielonej części campingu',
    category: 'camping',
    tags: ['kamper', 'drzewa', 'cień'],
  },
  {
    key: 'campground-road-main-field',
    src: sectionPath('campground-road-main-field.webp'),
    title: 'Droga i główna część campingu',
    alt: 'Droga wewnętrzna i główna część Camping Clepardia',
    category: 'camping',
    tags: ['dojazd', 'teren', 'organizacja'],
  },
  {
    key: 'camping-kitchen-main',
    src: sectionPath('camping-kitchen-main.webp'),
    title: 'Kuchnia turystyczna',
    alt: 'Kuchnia turystyczna dla gości campingu',
    category: 'sanitary',
    tags: ['kuchnia', 'zaplecze', 'goście'],
  },
  {
    key: 'camping-laundry-room',
    src: sectionPath('camping-laundry-room.webp'),
    title: 'Pralnia',
    alt: 'Pralnia dla gości Camping Clepardia',
    category: 'sanitary',
    tags: ['pralnia', 'zaplecze', 'wygoda'],
  },
  {
    key: 'bungalows-main',
    src: sectionPath('bungalows-main.webp'),
    title: 'Domki Clepardia',
    alt: 'Domki na terenie Camping Clepardia',
    category: 'bungalows',
    tags: ['domki', 'nocleg', 'rodzina'],
    featured: true,
  },
  {
    key: 'bungalows-path',
    src: sectionPath('bungalows-path.webp'),
    title: 'Alejka przy domkach',
    alt: 'Alejka prowadząca do domków Camping Clepardia',
    category: 'bungalows',
    tags: ['domki', 'alejka', 'teren'],
  },
  {
    key: 'bungalows-row',
    src: sectionPath('bungalows-row.webp'),
    title: 'Rząd domków',
    alt: 'Rząd domków 2-, 3- i 4-osobowych',
    category: 'bungalows',
    tags: ['domki', 'zewnętrze'],
  },
  {
    key: 'bungalows-row-camping-view',
    src: sectionPath('bungalows-row-camping-view.webp'),
    title: 'Domki przy części campingowej',
    alt: 'Domki widoczne od strony części campingowej',
    category: 'bungalows',
    tags: ['domki', 'camping', 'razem'],
  },
  {
    key: 'bungalow-bathroom',
    src: sectionPath('bungalow-bathroom.webp'),
    title: 'Łazienka w domku',
    alt: 'Łazienka w domku Camping Clepardia',
    category: 'bungalows',
    tags: ['łazienka', 'domki'],
  },
  {
    key: 'domek-3os-bedroom-main',
    src: sectionPath('domek-3os-bedroom-main.webp'),
    title: 'Domek 3-osobowy - sypialnia',
    alt: 'Sypialnia w domku 3-osobowym',
    category: 'bungalows',
    tags: ['domek 3-os', 'sypialnia'],
  },
  {
    key: 'domek-3os-bedroom-alt',
    src: sectionPath('domek-3os-bedroom-alt.webp'),
    title: 'Domek 3-osobowy - pokój',
    alt: 'Pokój w domku 3-osobowym',
    category: 'bungalows',
    tags: ['domek 3-os', 'pokój'],
  },
  {
    key: 'domek-3os-bathroom-main',
    src: sectionPath('domek-3os-bathroom-main.webp'),
    title: 'Domek 3-osobowy - łazienka',
    alt: 'Łazienka w domku 3-osobowym',
    category: 'bungalows',
    tags: ['domek 3-os', 'łazienka'],
  },
  {
    key: 'domek-3os-bathroom-detail',
    src: sectionPath('domek-3os-bathroom-detail.webp'),
    title: 'Łazienka 3-os. - detal',
    alt: 'Detal łazienki w domku 3-osobowym',
    category: 'bungalows',
    tags: ['domek 3-os', 'łazienka'],
  },
  {
    key: 'domek-4os-living-dining',
    src: sectionPath('domek-4os-living-dining.webp'),
    title: 'Domek 4-osobowy - część dzienna',
    alt: 'Część dzienna w domku 4-osobowym',
    category: 'bungalows',
    tags: ['domek 4-os', 'salon', 'rodzina'],
  },
  {
    key: 'domek-4os-kitchen-living',
    src: sectionPath('domek-4os-kitchen-living.webp'),
    title: 'Domek 4-osobowy - kuchnia',
    alt: 'Aneks kuchenny w domku 4-osobowym',
    category: 'bungalows',
    tags: ['domek 4-os', 'kuchnia'],
  },
  {
    key: 'domek-4os-bedroom-detail',
    src: sectionPath('domek-4os-bedroom-detail.webp'),
    title: 'Domek 4-osobowy - sypialnia',
    alt: 'Sypialnia w domku 4-osobowym',
    category: 'bungalows',
    tags: ['domek 4-os', 'sypialnia'],
  },
  {
    key: 'domek-4os-bathroom-main',
    src: sectionPath('domek-4os-bathroom-main.webp'),
    title: 'Domek 4-osobowy - łazienka',
    alt: 'Łazienka w domku 4-osobowym',
    category: 'bungalows',
    tags: ['domek 4-os', 'łazienka'],
  },
  {
    key: 'sanitary-facilities',
    src: sectionPath('sanitary-facilities.webp'),
    title: 'Zaplecze sanitarne',
    alt: 'Zaplecze sanitarne na Camping Clepardia',
    category: 'sanitary',
    tags: ['sanitariaty', 'prysznice', 'zaplecze'],
  },
  {
    key: 'sanitary-facilities-main',
    src: sectionPath('sanitary-facilities-main.webp'),
    title: 'Budynek sanitarny',
    alt: 'Główny budynek sanitarny dla gości',
    category: 'sanitary',
    tags: ['sanitariaty', 'budynek'],
    featured: true,
  },
  {
    key: 'tram-stop-near-camping',
    src: sectionPath('tram-stop-near-camping.webp'),
    title: 'Przystanek przy campingu',
    alt: 'Przystanek tramwajowy około 40 metrów od bramy',
    category: 'transport',
    tags: ['tramwaj', 'centrum', 'dojazd'],
    featured: true,
  },
  {
    key: 'family-playground',
    src: sectionPath('family-playground.webp'),
    title: 'Plac zabaw',
    alt: 'Plac zabaw dla dzieci na Camping Clepardia',
    category: 'family',
    tags: ['dzieci', 'rodzina', 'plac zabaw'],
  },
  {
    key: 'family-playground-main',
    src: sectionPath('family-playground-main.webp'),
    title: 'Rodzinna część campingu',
    alt: 'Plac zabaw i rodzinna część Camping Clepardia',
    category: 'family',
    tags: ['dzieci', 'rodzina', 'atrakcje'],
    featured: true,
  },
  {
    key: 'reception-main',
    src: sectionPath('reception-main.webp'),
    title: 'Recepcja',
    alt: 'Recepcja Camping Clepardia',
    category: 'reception',
    tags: ['recepcja', 'przyjazd', 'kontakt'],
    featured: true,
  },
  {
    key: 'drone-overview-camping',
    src: sectionPath('drone-overview-camping.webp'),
    title: 'Camping z lotu ptaka',
    alt: 'Camping Clepardia widziany z lotu ptaka',
    category: 'aerial',
    tags: ['z lotu ptaka', 'teren', 'układ'],
    featured: true,
  },
  {
    key: 'drone-overview-premium',
    src: sectionPath('drone-overview-premium.webp'),
    title: 'Clepardia z góry',
    alt: 'Widok z góry na teren Camping Clepardia',
    category: 'aerial',
    tags: ['z lotu ptaka', 'camping', 'okolica'],
  },
];

export const sectionImageByKey = Object.fromEntries(
  sectionImages.map((image) => [image.key, image]),
) as Record<string, SectionImage>;

export const getSectionImagesByCategory = (category: SectionImageCategory) =>
  sectionImages.filter((image) => image.category === category);
