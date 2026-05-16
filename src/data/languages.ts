export const languages = [
  { code: 'pl', name: 'Polski', emoji: '🇵🇱', flag: '/flags/pl.svg', href: '/pl/' },
  { code: 'en', name: 'English', emoji: '🇬🇧', flag: '/flags/en.svg', href: '/en/' },
  { code: 'de', name: 'Deutsch', emoji: '🇩🇪', flag: '/flags/de.svg', href: '/de/' },
  { code: 'it', name: 'Italiano', emoji: '🇮🇹', flag: '/flags/it.svg', href: '/it/' },
  { code: 'fr', name: 'Français', emoji: '🇫🇷', flag: '/flags/fr.svg', href: '/fr/' },
  { code: 'es', name: 'Español', emoji: '🇪🇸', flag: '/flags/es.svg', href: '/es/' },
  { code: 'nl', name: 'Nederlands', emoji: '🇳🇱', flag: '/flags/nl.svg', href: '/nl/' },
  { code: 'cs', name: 'Čeština', emoji: '🇨🇿', flag: '/flags/cs.svg', href: '/cs/' },
  { code: 'sk', name: 'Slovenčina', emoji: '🇸🇰', flag: '/flags/sk.svg', href: '/sk/' },
  { code: 'sv', name: 'Svenska', emoji: '🇸🇪', flag: '/flags/sv.svg', href: '/sv/' },
] as const;

export const defaultLanguage = languages[0];
