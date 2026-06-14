import { existsSync } from 'node:fs';
import { join } from 'node:path';

export interface RequiredAsset {
  key: string;
  path: string;
  group: string;
  label: string;
  recommendedSize: string;
  format: string;
  priority?: 'required' | 'recommended';
}

export const siteAssets = {
  logo: {
    main: '/brand/logo/clepardia-logo-main.svg',
    mainSvg: '/brand/logo/clepardia-logo-main.svg',
    mainPng: '/brand/logo/clepardia-logo-main.png',
    whiteSvg: '/brand/logo/clepardia-logo-white.svg',
    whitePng: '/brand/logo/clepardia-logo-white.png',
    icon: '/brand/logo/clepardia-logo-icon.svg',
    loader: '/brand/logo/clepardia-logo-loader.svg',
  },
  motion: {
    loaderLogo: '/motion/loader/loader-logo.svg',
    loaderLogoWhite: '/motion/loader/loader-logo-white.svg',
  },
  ui: {
    campy: {
      icon: '/images/ui/campy/campy-icon.webp',
    },
  },
  hero: {
    desktop: '/images/hero/hero-camping-clepardia-main.webp',
    mobile: '/images/hero/hero-camping-clepardia-main-mobile.webp',
    overlayTexture: '/images/hero/hero-overlay-texture.webp',
  },
  camping: {
    pitches: '/images/sections/camping-pitches.webp',
    camperArea: '/images/sections/camping-open-space.webp',
    tents: '/images/sections/camping-green-canopy.webp',
    electricity: '/images/sections/sanitary-facilities.webp',
  },
  bungalows: {
    exterior: '/images/sections/bungalows-main.webp',
    room: '/images/sections/bungalow-bathroom.webp',
    bungalow3: '/images/sections/bungalows-path.webp',
    bungalow4: '/images/sections/bungalows-row.webp',
  },
  sanitary: {
    building: '/images/sections/sanitary-facilities.webp',
    showers: '/images/sections/sanitary-facilities.webp',
    kitchen: '/images/sections/sanitary-facilities.webp',
    laundry: '/images/sections/sanitary-facilities.webp',
  },
  transport: {
    tramToCenter: '/images/sections/tram-stop-near-camping.webp',
    ticketMachine: '/images/sections/tram-stop-near-camping.webp',
    googleMaps: '/images/sections/tram-stop-near-camping.webp',
    jakdojade: '/images/sections/tram-stop-near-camping.webp',
  },
  family: {
    playground: '/images/sections/family-playground.webp',
  },
  attractions: {
    oldTown: '/images/attractions/old-town-krakow.webp',
    kazimierz: '/images/attractions/kazimierz.webp',
    wawel: '/images/attractions/wawel.webp',
    wieliczka: '/images/attractions/wieliczka-salt-mine.webp',
    auschwitz: '/images/attractions/auschwitz-birkenau.webp',
    schindler: '/images/attractions/schindler-factory.webp',
    energylandia: '/images/attractions/energylandia.webp',
    ojcow: '/images/attractions/ojcow.webp',
    zakopane: '/images/attractions/zakopane.webp',
    seeKrakow: '/images/tours/seekrakow-tours.webp',
  },
  gallery: {
    campingPitches: '/images/sections/camping-pitches.webp',
    campingCamperArea: '/images/sections/camping-open-space.webp',
    campingTents: '/images/sections/camping-green-canopy.webp',
    campingElectricity: '/images/sections/sanitary-facilities.webp',
    bungalowExterior: '/images/sections/bungalows-main.webp',
    bungalowRoom: '/images/sections/bungalow-bathroom.webp',
    bungalow3: '/images/sections/bungalows-path.webp',
    bungalow4: '/images/sections/bungalows-row.webp',
    sanitaryBuilding: '/images/sections/sanitary-facilities.webp',
    showers: '/images/sections/sanitary-facilities.webp',
    kitchen: '/images/sections/sanitary-facilities.webp',
    laundry: '/images/sections/sanitary-facilities.webp',
    tramToCenter: '/images/sections/tram-stop-near-camping.webp',
    ticketMachine: '/images/sections/tram-stop-near-camping.webp',
    familyPlayground: '/images/sections/family-playground.webp',
    oldTown: '/images/attractions/old-town-krakow.webp',
    wieliczka: '/images/attractions/wieliczka-salt-mine.webp',
    energylandia: '/images/attractions/energylandia.webp',
  },
  sections: {
    camping: {
      main: '/images/sections/camping-open-space.webp',
      pitches: '/images/sections/camping-pitches.webp',
      tents: '/images/sections/camping-green-canopy.webp',
      electricity: '/images/sections/sanitary-facilities.webp',
    },
    bungalows: {
      main: '/images/sections/bungalows-main.webp',
      room: '/images/sections/bungalow-bathroom.webp',
      bungalow3: '/images/sections/bungalows-path.webp',
      bungalow4: '/images/sections/bungalows-row.webp',
    },
    sanitary: {
      building: '/images/sections/sanitary-facilities.webp',
      showers: '/images/sections/sanitary-facilities.webp',
      kitchen: '/images/sections/sanitary-facilities.webp',
      laundry: '/images/sections/sanitary-facilities.webp',
    },
    transport: {
      tram: '/images/sections/tram-stop-near-camping.webp',
      tickets: '/images/sections/tram-stop-near-camping.webp',
      googleMaps: '/images/sections/tram-stop-near-camping.webp',
      jakdojade: '/images/sections/tram-stop-near-camping.webp',
    },
    family: {
      playground: '/images/sections/family-playground.webp',
    },
    attractions: {
      oldTown: '/images/attractions/old-town-krakow.webp',
      kazimierz: '/images/attractions/kazimierz.webp',
      wawel: '/images/attractions/wawel.webp',
      wieliczka: '/images/attractions/wieliczka-salt-mine.webp',
      auschwitz: '/images/attractions/auschwitz-birkenau.webp',
      schindler: '/images/attractions/schindler-factory.webp',
      energylandia: '/images/attractions/energylandia.webp',
      ojcow: '/images/attractions/ojcow.webp',
      zakopane: '/images/attractions/zakopane.webp',
    },
  },
  seo: {
    ogHomePl: '/seo/og/og-home-pl.jpg',
    ogHomeEn: '/seo/og/og-home-en.jpg',
    ogFallback: '/brand/logo/clepardia-logo-main.png',
  },
  documents: {
    campingGuidePdf: '/documents/pdf/camping-guide-pl.pdf',
  },
} as const;

export const publicAssetExists = (assetPath: string) =>
  existsSync(join(process.cwd(), 'public', assetPath.replace(/^\//, '')));

export const requiredAssets: RequiredAsset[] = [
  { key: 'logo.mainSvg', path: siteAssets.logo.mainSvg, group: 'logo', label: 'Logo główne SVG', recommendedSize: 'wektor', format: 'svg', priority: 'required' },
  { key: 'logo.mainPng', path: siteAssets.logo.mainPng, group: 'logo', label: 'Logo główne PNG fallback', recommendedSize: 'min. 800 px szerokości', format: 'png', priority: 'required' },
  { key: 'logo.whiteSvg', path: siteAssets.logo.whiteSvg, group: 'logo', label: 'Logo białe SVG', recommendedSize: 'wektor', format: 'svg', priority: 'recommended' },
  { key: 'logo.whitePng', path: siteAssets.logo.whitePng, group: 'logo', label: 'Logo białe PNG fallback', recommendedSize: 'min. 800 px szerokości', format: 'png', priority: 'recommended' },
  { key: 'logo.icon', path: siteAssets.logo.icon, group: 'logo', label: 'Symbol / ikona marki', recommendedSize: 'wektor', format: 'svg', priority: 'recommended' },
  { key: 'logo.loader', path: siteAssets.logo.loader, group: 'logo', label: 'Logo do loadera', recommendedSize: 'wektor', format: 'svg', priority: 'recommended' },
  { key: 'hero.desktop', path: siteAssets.hero.desktop, group: 'hero', label: 'Hero desktop', recommendedSize: '2400x1400 lub 2560x1440', format: 'webp', priority: 'required' },
  { key: 'hero.mobile', path: siteAssets.hero.mobile, group: 'hero', label: 'Hero mobile', recommendedSize: '1080x1440 lub 1200x1600', format: 'webp', priority: 'recommended' },
  { key: 'hero.overlayTexture', path: siteAssets.hero.overlayTexture, group: 'hero', label: 'Subtelna tekstura/noise hero', recommendedSize: '1600x1600', format: 'webp/png', priority: 'recommended' },
  { key: 'camping.pitches', path: siteAssets.camping.pitches, group: 'camping', label: 'Miejsca campingowe', recommendedSize: '1600x1000', format: 'webp', priority: 'required' },
  { key: 'camping.camperArea', path: siteAssets.camping.camperArea, group: 'camping', label: 'Strefa kamperów', recommendedSize: '1600x1000', format: 'webp', priority: 'required' },
  { key: 'camping.tents', path: siteAssets.camping.tents, group: 'camping', label: 'Namioty', recommendedSize: '1600x1000', format: 'webp', priority: 'recommended' },
  { key: 'camping.electricity', path: siteAssets.camping.electricity, group: 'camping', label: 'Prąd / infrastruktura', recommendedSize: '1200x800', format: 'webp', priority: 'recommended' },
  { key: 'bungalows.exterior', path: siteAssets.bungalows.exterior, group: 'bungalows', label: 'Domek z zewnątrz', recommendedSize: '1600x1000', format: 'webp', priority: 'required' },
  { key: 'bungalows.room', path: siteAssets.bungalows.room, group: 'bungalows', label: 'Pokój w domku', recommendedSize: '1600x1000', format: 'webp', priority: 'recommended' },
  { key: 'bungalows.bungalow3', path: siteAssets.bungalows.bungalow3, group: 'bungalows', label: 'Domek 3-osobowy', recommendedSize: '1600x1000', format: 'webp', priority: 'recommended' },
  { key: 'bungalows.bungalow4', path: siteAssets.bungalows.bungalow4, group: 'bungalows', label: 'Domek 4-osobowy', recommendedSize: '1600x1000', format: 'webp', priority: 'recommended' },
  { key: 'sanitary.building', path: siteAssets.sanitary.building, group: 'sanitary', label: 'Budynek sanitarny', recommendedSize: '1600x1000', format: 'webp', priority: 'recommended' },
  { key: 'sanitary.showers', path: siteAssets.sanitary.showers, group: 'sanitary', label: 'Prysznice', recommendedSize: '1600x1000', format: 'webp', priority: 'recommended' },
  { key: 'sanitary.kitchen', path: siteAssets.sanitary.kitchen, group: 'sanitary', label: 'Kuchnia turystyczna', recommendedSize: '1600x1000', format: 'webp', priority: 'recommended' },
  { key: 'sanitary.laundry', path: siteAssets.sanitary.laundry, group: 'sanitary', label: 'Pralnia', recommendedSize: '1600x1000', format: 'webp', priority: 'recommended' },
  { key: 'transport.tramToCenter', path: siteAssets.transport.tramToCenter, group: 'transport', label: 'Tramwaj do centrum', recommendedSize: '1600x1000', format: 'webp', priority: 'required' },
  { key: 'transport.ticketMachine', path: siteAssets.transport.ticketMachine, group: 'transport', label: 'Automat biletowy', recommendedSize: '1200x800', format: 'webp', priority: 'recommended' },
  { key: 'transport.googleMaps', path: siteAssets.transport.googleMaps, group: 'transport', label: 'Google Maps preview', recommendedSize: '1200x800', format: 'webp', priority: 'recommended' },
  { key: 'transport.jakdojade', path: siteAssets.transport.jakdojade, group: 'transport', label: 'Jakdojade preview', recommendedSize: '1200x800', format: 'webp', priority: 'recommended' },
  { key: 'attractions.oldTown', path: siteAssets.attractions.oldTown, group: 'attractions', label: 'Stare Miasto', recommendedSize: '1600x1000', format: 'webp', priority: 'required' },
  { key: 'attractions.kazimierz', path: siteAssets.attractions.kazimierz, group: 'attractions', label: 'Kazimierz', recommendedSize: '1600x1000', format: 'webp', priority: 'recommended' },
  { key: 'attractions.wawel', path: siteAssets.attractions.wawel, group: 'attractions', label: 'Wawel', recommendedSize: '1600x1000', format: 'webp', priority: 'recommended' },
  { key: 'attractions.wieliczka', path: siteAssets.attractions.wieliczka, group: 'attractions', label: 'Wieliczka', recommendedSize: '1600x1000', format: 'webp', priority: 'recommended' },
  { key: 'attractions.auschwitz', path: siteAssets.attractions.auschwitz, group: 'attractions', label: 'Auschwitz-Birkenau', recommendedSize: '1600x1000', format: 'webp', priority: 'recommended' },
  { key: 'attractions.schindler', path: siteAssets.attractions.schindler, group: 'attractions', label: 'Fabryka Schindlera', recommendedSize: '1600x1000', format: 'webp', priority: 'recommended' },
  { key: 'attractions.energylandia', path: siteAssets.attractions.energylandia, group: 'attractions', label: 'Energylandia', recommendedSize: '1600x1000', format: 'webp', priority: 'recommended' },
  { key: 'attractions.ojcow', path: siteAssets.attractions.ojcow, group: 'attractions', label: 'Ojców', recommendedSize: '1600x1000', format: 'webp', priority: 'recommended' },
  { key: 'attractions.zakopane', path: siteAssets.attractions.zakopane, group: 'attractions', label: 'Zakopane', recommendedSize: '1600x1000', format: 'webp', priority: 'recommended' },
  { key: 'seo.ogHomePl', path: siteAssets.seo.ogHomePl, group: 'seo', label: 'OpenGraph PL', recommendedSize: '1200x630', format: 'jpg', priority: 'required' },
  { key: 'seo.ogHomeEn', path: siteAssets.seo.ogHomeEn, group: 'seo', label: 'OpenGraph EN', recommendedSize: '1200x630', format: 'jpg', priority: 'recommended' },
  { key: 'pwa.appleTouchIcon', path: '/apple-touch-icon.png', group: 'pwa', label: 'Apple touch icon', recommendedSize: '180x180', format: 'png', priority: 'recommended' },
  { key: 'pwa.manifest', path: '/manifest.webmanifest', group: 'pwa', label: 'Manifest PWA', recommendedSize: 'JSON manifest', format: 'webmanifest', priority: 'recommended' },
  { key: 'pwa.icon192', path: '/icons/icon-192.png', group: 'pwa', label: 'PWA icon 192', recommendedSize: '192x192', format: 'png', priority: 'recommended' },
  { key: 'pwa.icon512', path: '/icons/icon-512.png', group: 'pwa', label: 'PWA icon 512', recommendedSize: '512x512', format: 'png', priority: 'recommended' },
];

export const getMissingRequiredAssets = () =>
  requiredAssets.filter((asset) => !publicAssetExists(asset.path));

export const logoMain = siteAssets.logo.mainSvg;
export const logoMainPng = siteAssets.logo.mainPng;
const loaderLogoCandidates = [
  siteAssets.logo.whiteSvg,
  siteAssets.logo.mainSvg,
  siteAssets.logo.icon,
  siteAssets.motion.loaderLogoWhite,
  siteAssets.logo.loader,
  siteAssets.motion.loaderLogo,
  siteAssets.logo.mainPng,
];
export const loaderLogo = loaderLogoCandidates.find((asset) => publicAssetExists(asset)) ?? logoMain;
export const loaderLogoFallback = publicAssetExists(siteAssets.logo.mainSvg)
  ? siteAssets.logo.mainSvg
  : publicAssetExists(siteAssets.logo.mainPng)
    ? siteAssets.logo.mainPng
    : logoMain;
export const heroDesktop = siteAssets.hero.desktop;
export const heroMobile = siteAssets.hero.mobile;
export const campyIcon = siteAssets.ui.campy.icon;
