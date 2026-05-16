import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const siteAssets = {
  logo: {
    main: '/brand/logo/clepardia-logo-main.svg',
    mainPng: '/brand/logo/clepardia-logo-main.png',
  },
  hero: {
    desktop: '/images/hero/hero-camping-clepardia-main.webp',
    mobile: '/images/hero/hero-camping-clepardia-main-mobile.webp',
    overlayTexture: '/images/hero/hero-overlay-texture.webp',
  },
  camping: {
    pitches: '/images/camping/camping-pitches.webp',
    camperArea: '/images/camping/camping-camper-area.webp',
    tents: '/images/camping/camping-tents.webp',
    electricity: '/images/camping/camping-electricity.webp',
  },
  bungalows: {
    exterior: '/images/bungalows/bungalow-exterior.webp',
    room: '/images/bungalows/bungalow-room.webp',
    terrace: '/images/bungalows/bungalow-terrace.webp',
    family: '/images/bungalows/bungalow-family.webp',
  },
  transport: {
    tramToCenter: '/images/transport/tram-to-center.webp',
    ticketMachine: '/images/transport/tram-ticket-machine.webp',
    googleMaps: '/images/transport/google-maps-preview.webp',
    jakdojade: '/images/transport/jakdojade-preview.webp',
  },
  attractions: {
    oldTown: '/images/attractions/krakow-old-town.webp',
    wieliczka: '/images/attractions/wieliczka-salt-mine.webp',
    auschwitz: '/images/attractions/auschwitz.webp',
    schindler: '/images/attractions/schindler-factory.webp',
    energylandia: '/images/attractions/energylandia.webp',
    zakopane: '/images/attractions/zakopane.webp',
  },
} as const;

export const publicAssetExists = (assetPath: string) =>
  existsSync(join(process.cwd(), 'public', assetPath.replace(/^\//, '')));

export const logoMain = siteAssets.logo.main;
export const logoMainPng = siteAssets.logo.mainPng;
export const loaderLogo = logoMain;
export const heroDesktop = siteAssets.hero.desktop;
export const heroMobile = siteAssets.hero.mobile;
