export const languages = [
  { code: 'pl', name: 'Polski', flag: '/flags/pl.svg', href: '/pl/' },
  { code: 'en', name: 'English', flag: '/flags/en.svg', href: '/en/' },
  { code: 'de', name: 'Deutsch', flag: '/flags/de.svg', href: '/de/' },
  { code: 'it', name: 'Italiano', flag: '/flags/it.svg', href: '/it/' },
  { code: 'fr', name: 'Français', flag: '/flags/fr.svg', href: '/fr/' },
  { code: 'es', name: 'Español', flag: '/flags/es.svg', href: '/es/' },
  { code: 'nl', name: 'Nederlands', flag: '/flags/nl.svg', href: '/nl/' },
  { code: 'cs', name: 'Čeština', flag: '/flags/cs.svg', href: '/cs/' },
  { code: 'sk', name: 'Slovenčina', flag: '/flags/sk.svg', href: '/sk/' },
  { code: 'sv', name: 'Svenska', flag: '/flags/sv.svg', href: '/sv/' },
] as const;

export const defaultLanguage = languages[0];
