export const languages = [
  { code: 'pl', name: 'Polski', flag: '/flags/pl.svg', flagClass: 'fi-pl', href: '/pl/', translation: 'full' },
  { code: 'en', name: 'English', flag: '/flags/en.svg', flagClass: 'fi-gb', href: '/en/', translation: 'full' },
  { code: 'de', name: 'Deutsch', flag: '/flags/de.svg', flagClass: 'fi-de', href: '/de/', translation: 'full' },
  { code: 'it', name: 'Italiano', flag: '/flags/it.svg', flagClass: 'fi-it', href: '/it/', translation: 'full' },
  { code: 'fr', name: 'Français', flag: '/flags/fr.svg', flagClass: 'fi-fr', href: '/fr/', translation: 'core-ui' },
  { code: 'es', name: 'Español', flag: '/flags/es.svg', flagClass: 'fi-es', href: '/es/', translation: 'core-ui' },
  { code: 'nl', name: 'Nederlands', flag: '/flags/nl.svg', flagClass: 'fi-nl', href: '/nl/', translation: 'core-ui' },
  { code: 'cs', name: 'Čeština', flag: '/flags/cs.svg', flagClass: 'fi-cz', href: '/cs/', translation: 'core-ui' },
  { code: 'sk', name: 'Slovenčina', flag: '/flags/sk.svg', flagClass: 'fi-sk', href: '/sk/', translation: 'core-ui' },
  { code: 'sv', name: 'Svenska', flag: '/flags/sv.svg', flagClass: 'fi-se', href: '/sv/', translation: 'core-ui' },
] as const;

export const defaultLanguage = languages[0];
