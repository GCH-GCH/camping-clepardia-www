import { publicAssetExists, siteAssets } from './assets';

export const siteUrl = 'https://www.clepardia.com.pl';
export const siteName = 'Camping Clepardia';
export const defaultOgImage = siteAssets.seo.ogHomePl;
export const fallbackOgImage = siteAssets.seo.ogFallback;

export const homeSeo = {
  title: 'Camping Clepardia — Camping w Krakowie blisko centrum',
  description:
    'Camping Clepardia w Krakowie — miejsca dla kamperów, przyczep i namiotów oraz domki blisko centrum miasta. Sprawdź cennik i zapytaj o dostępność.',
  ogTitle: 'Camping Clepardia — Camping w Krakowie blisko centrum',
  ogDescription:
    'Miejsca dla kamperów, przyczep i namiotów oraz domki w Krakowie, blisko centrum i tramwaju do Starego Miasta.',
  ogImage: defaultOgImage,
} as const;

export const resolveOgImage = (preferredImage = defaultOgImage) =>
  publicAssetExists(preferredImage) ? preferredImage : fallbackOgImage;

interface BusinessJsonLdOptions {
  image: string;
  pageUrl: string;
}

export const getCampgroundJsonLd = ({ image, pageUrl }: BusinessJsonLdOptions) => ({
  '@context': 'https://schema.org',
  '@type': ['Campground', 'LodgingBusiness'],
  '@id': `${siteUrl}/#camping-clepardia`,
  name: siteName,
  url: pageUrl,
  image,
  telephone: '+48 795 294 486',
  email: 'clepardia@gmail.com',
  priceRange: 'PLN',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Henryka Pachońskiego 28A',
    postalCode: '31-322',
    addressLocality: 'Kraków',
    addressCountry: 'PL',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 'TODO: add exact latitude',
    longitude: 'TODO: add exact longitude',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '09:00',
      closes: '20:00',
    },
  ],
});
