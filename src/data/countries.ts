export type CountryLanguage = 'pl' | 'en' | 'de' | 'it';

export interface CountryOption {
  code: string;
  flagClass: string;
  names: Record<CountryLanguage, string>;
  aliases: string[];
}

export const countries: CountryOption[] = [
  {
    code: 'PL',
    flagClass: 'fi fi-pl',
    names: { pl: 'Polska', en: 'Poland', de: 'Polen', it: 'Polonia' },
    aliases: ['pl', 'pol', 'polska', 'poland', 'polen', 'polonia'],
  },
  {
    code: 'DE',
    flagClass: 'fi fi-de',
    names: { pl: 'Niemcy', en: 'Germany', de: 'Deutschland', it: 'Germania' },
    aliases: ['de', 'ge', 'ger', 'germ', 'niem', 'niemcy', 'deutschland', 'germany', 'germania'],
  },
  {
    code: 'NL',
    flagClass: 'fi fi-nl',
    names: { pl: 'Holandia', en: 'Netherlands', de: 'Niederlande', it: 'Paesi Bassi' },
    aliases: ['nl', 'hol', 'holland', 'holandia', 'nederlands', 'netherlands', 'paesi bassi', 'niederlande'],
  },
  {
    code: 'CZ',
    flagClass: 'fi fi-cz',
    names: { pl: 'Czechy', en: 'Czechia', de: 'Tschechien', it: 'Cechia' },
    aliases: ['cz', 'cs', 'cze', 'czech', 'czechy', 'cesko', 'česko', 'czechia', 'tschechien', 'cechia'],
  },
  {
    code: 'SE',
    flagClass: 'fi fi-se',
    names: { pl: 'Szwecja', en: 'Sweden', de: 'Schweden', it: 'Svezia' },
    aliases: ['sv', 'se', 'swe', 'sweden', 'szwecja', 'sverige', 'schweden', 'svezia'],
  },
  {
    code: 'SK',
    flagClass: 'fi fi-sk',
    names: { pl: 'Słowacja', en: 'Slovakia', de: 'Slowakei', it: 'Slovacchia' },
    aliases: ['sk', 'slovakia', 'slowacja', 'słowacja', 'slovensko', 'slowakei', 'slovacchia'],
  },
  {
    code: 'GB',
    flagClass: 'fi fi-gb',
    names: { pl: 'Wielka Brytania', en: 'United Kingdom', de: 'Vereinigtes Königreich', it: 'Regno Unito' },
    aliases: ['gb', 'uk', 'england', 'britain', 'united kingdom', 'wielka brytania', 'regno unito'],
  },
  {
    code: 'IT',
    flagClass: 'fi fi-it',
    names: { pl: 'Włochy', en: 'Italy', de: 'Italien', it: 'Italia' },
    aliases: ['it', 'ita', 'italy', 'italia', 'wlochy', 'włochy', 'italien'],
  },
  {
    code: 'FR',
    flagClass: 'fi fi-fr',
    names: { pl: 'Francja', en: 'France', de: 'Frankreich', it: 'Francia' },
    aliases: ['fr', 'fra', 'france', 'francja', 'frankreich', 'francia'],
  },
  {
    code: 'ES',
    flagClass: 'fi fi-es',
    names: { pl: 'Hiszpania', en: 'Spain', de: 'Spanien', it: 'Spagna' },
    aliases: ['es', 'esp', 'spain', 'hiszpania', 'espana', 'españa', 'spanien', 'spagna'],
  },
  {
    code: 'AT',
    flagClass: 'fi fi-at',
    names: { pl: 'Austria', en: 'Austria', de: 'Österreich', it: 'Austria' },
    aliases: ['at', 'aut', 'austria', 'osterreich', 'österreich'],
  },
  {
    code: 'CH',
    flagClass: 'fi fi-ch',
    names: { pl: 'Szwajcaria', en: 'Switzerland', de: 'Schweiz', it: 'Svizzera' },
    aliases: ['ch', 'swiss', 'switzerland', 'szwajcaria', 'schweiz', 'svizzera'],
  },
  {
    code: 'BE',
    flagClass: 'fi fi-be',
    names: { pl: 'Belgia', en: 'Belgium', de: 'Belgien', it: 'Belgio' },
    aliases: ['be', 'bel', 'belgia', 'belgium', 'belgien', 'belgio'],
  },
  {
    code: 'DK',
    flagClass: 'fi fi-dk',
    names: { pl: 'Dania', en: 'Denmark', de: 'Dänemark', it: 'Danimarca' },
    aliases: ['dk', 'denmark', 'dania', 'danmark', 'danemark', 'dänemark', 'danimarca'],
  },
  {
    code: 'NO',
    flagClass: 'fi fi-no',
    names: { pl: 'Norwegia', en: 'Norway', de: 'Norwegen', it: 'Norvegia' },
    aliases: ['no', 'norway', 'norwegia', 'norge', 'norwegen', 'norvegia'],
  },
  {
    code: 'FI',
    flagClass: 'fi fi-fi',
    names: { pl: 'Finlandia', en: 'Finland', de: 'Finnland', it: 'Finlandia' },
    aliases: ['fi', 'fin', 'finland', 'finlandia', 'suomi', 'finnland'],
  },
  {
    code: 'UA',
    flagClass: 'fi fi-ua',
    names: { pl: 'Ukraina', en: 'Ukraine', de: 'Ukraine', it: 'Ucraina' },
    aliases: ['ua', 'ukr', 'ukraina', 'ukraine', 'ucraina'],
  },
  {
    code: 'LT',
    flagClass: 'fi fi-lt',
    names: { pl: 'Litwa', en: 'Lithuania', de: 'Litauen', it: 'Lituania' },
    aliases: ['lt', 'litwa', 'lithuania', 'lietuva', 'litauen', 'lituania'],
  },
  {
    code: 'LV',
    flagClass: 'fi fi-lv',
    names: { pl: 'Łotwa', en: 'Latvia', de: 'Lettland', it: 'Lettonia' },
    aliases: ['lv', 'lotwa', 'łotwa', 'latvia', 'latvija', 'lettland', 'lettonia'],
  },
  {
    code: 'HU',
    flagClass: 'fi fi-hu',
    names: { pl: 'Węgry', en: 'Hungary', de: 'Ungarn', it: 'Ungheria' },
    aliases: ['hu', 'hun', 'wegry', 'węgry', 'hungary', 'magyar', 'ungarn', 'ungheria'],
  },
  {
    code: 'RO',
    flagClass: 'fi fi-ro',
    names: { pl: 'Rumunia', en: 'Romania', de: 'Rumänien', it: 'Romania' },
    aliases: ['ro', 'romania', 'rumunia', 'rumanien', 'rumänien'],
  },
];
