export const languages = [
  { code: 'pl', name: 'Polski', flag: '/flags/pl.svg', flagClass: 'fi-pl', href: '/pl/' },
  { code: 'en', name: 'English', flag: '/flags/en.svg', flagClass: 'fi-gb', href: '/en/' },
  { code: 'de', name: 'Deutsch', flag: '/flags/de.svg', flagClass: 'fi-de', href: '/de/' },
  { code: 'it', name: 'Italiano', flag: '/flags/it.svg', flagClass: 'fi-it', href: '/it/' },
  { code: 'fr', name: 'Français', flag: '/flags/fr.svg', flagClass: 'fi-fr', href: '/fr/' },
  { code: 'es', name: 'Español', flag: '/flags/es.svg', flagClass: 'fi-es', href: '/es/' },
  { code: 'nl', name: 'Nederlands', flag: '/flags/nl.svg', flagClass: 'fi-nl', href: '/nl/' },
  { code: 'cs', name: 'Čeština', flag: '/flags/cs.svg', flagClass: 'fi-cz', href: '/cs/' },
  { code: 'sk', name: 'Slovenčina', flag: '/flags/sk.svg', flagClass: 'fi-sk', href: '/sk/' },
  { code: 'sv', name: 'Svenska', flag: '/flags/sv.svg', flagClass: 'fi-se', href: '/sv/' },
] as const;

export const defaultLanguage = languages[0];
