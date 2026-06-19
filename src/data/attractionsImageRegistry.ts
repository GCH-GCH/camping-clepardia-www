export interface AttractionImageAsset {
  src: string;
  altPl: string;
  width: number;
  height: number;
  sizes: string;
}

const cardSizes = '(max-width: 759px) calc(100vw - 32px), (max-width: 1199px) 50vw, 33vw';
const featureSizes = '(max-width: 759px) calc(100vw - 32px), (max-width: 1199px) 58vw, 52vw';

export const attractionImages = {
  mainSquare: {
    src: '/images/attractions/krakow-main-square.webp',
    altPl: 'Rynek Główny i Stare Miasto w Krakowie',
    width: 1280,
    height: 853,
    sizes: featureSizes,
  },
  kazimierz: {
    src: '/images/attractions/kazimierz.webp',
    altPl: 'Ulice i zabudowa krakowskiego Kazimierza',
    width: 1200,
    height: 760,
    sizes: cardSizes,
  },
  wawel: {
    src: '/images/attractions/krakow-wawel-castle.webp',
    altPl: 'Zamek Królewski na Wawelu w Krakowie',
    width: 1280,
    height: 853,
    sizes: cardSizes,
  },
  wieliczka: {
    src: '/images/attractions/wieliczka-salt-mine.webp',
    altPl: 'Podziemna komora Kopalni Soli Wieliczka',
    width: 1280,
    height: 853,
    sizes: cardSizes,
  },
  auschwitz: {
    src: '/images/attractions/auschwitz-birkenau-memorial.webp',
    altPl: 'Miejsce Pamięci Auschwitz-Birkenau',
    width: 1280,
    height: 853,
    sizes: cardSizes,
  },
  schindler: {
    src: '/images/attractions/schindler-factory.webp',
    altPl: 'Fabryka Emalia Oskara Schindlera w Krakowie',
    width: 1280,
    height: 853,
    sizes: cardSizes,
  },
  energylandia: {
    src: '/images/attractions/energylandia-family-trip.webp',
    altPl: 'Rodzinna wycieczka do Energylandii',
    width: 1280,
    height: 853,
    sizes: cardSizes,
  },
  ojcow: {
    src: '/images/attractions/ojcow-national-park.webp',
    altPl: 'Ojcowski Park Narodowy i wapienne skały',
    width: 1280,
    height: 853,
    sizes: cardSizes,
  },
  zakopane: {
    src: '/images/attractions/zakopane-tatra-mountains.webp',
    altPl: 'Zakopane i panorama Tatr',
    width: 1280,
    height: 853,
    sizes: cardSizes,
  },
  bagry: {
    src: '/images/attractions/bagry-lake-beach.webp',
    altPl: 'Plaża i teren rekreacyjny nad Zalewem Bagry',
    width: 1280,
    height: 853,
    sizes: cardSizes,
  },
  kryspinow: {
    src: '/images/attractions/kryspinow-lake-beach.webp',
    altPl: 'Plaża i kąpielisko w Kryspinowie',
    width: 1280,
    height: 853,
    sizes: cardSizes,
  },
  tramCity: {
    src: '/images/attractions/krakow-tram-city-trip.webp',
    altPl: 'Tramwaj podczas zwiedzania Krakowa',
    width: 1280,
    height: 852,
    sizes: cardSizes,
  },
  waterPark: {
    src: '/images/attractions/krakow-water-park.webp',
    altPl: 'Park Wodny w Krakowie',
    width: 1280,
    height: 853,
    sizes: cardSizes,
  },
} as const satisfies Record<string, AttractionImageAsset>;

export type AttractionImageKey = keyof typeof attractionImages;
