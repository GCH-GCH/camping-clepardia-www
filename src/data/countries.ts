export type CountryLanguage = 'pl' | 'en' | 'de' | 'it';

export interface CountryOption {
  code: string;
  flagClass: string;
  names: Record<CountryLanguage, string>;
  aliases: string[];
}

const countryCodes = [
  'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
  'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS',
  'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN',
  'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE',
  'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF',
  'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM',
  'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM',
  'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC',
  'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK',
  'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA',
  'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG',
  'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW',
  'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS',
  'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO',
  'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI',
  'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW',
] as const;

const displayNames = {
  pl: new Intl.DisplayNames(['pl'], { type: 'region' }),
  en: new Intl.DisplayNames(['en'], { type: 'region' }),
  de: new Intl.DisplayNames(['de'], { type: 'region' }),
  it: new Intl.DisplayNames(['it'], { type: 'region' }),
} satisfies Record<CountryLanguage, Intl.DisplayNames>;

const nameOverrides: Partial<Record<string, Partial<Record<CountryLanguage, string>>>> = {
  CZ: { pl: 'Czechy' },
  GB: { pl: 'Wielka Brytania', de: 'Vereinigtes Koenigreich' },
  NL: { pl: 'Holandia' },
  US: { pl: 'Stany Zjednoczone' },
};

const aliasOverrides: Record<string, string[]> = {
  CL: ['cl', 'chl', 'chile'],
  CZ: ['cz', 'cs', 'cze', 'czech', 'czechy', 'cesko', 'cesky', 'ceska republika', 'czechia', 'tschechien', 'cechia'],
  DE: ['de', 'ge', 'ger', 'germ', 'niem', 'niemcy', 'deutsch', 'deutschland', 'germany', 'germania'],
  ES: ['es', 'esp', 'spain', 'hiszpania', 'espana', 'espagna', 'spanien', 'spagna'],
  FR: ['fr', 'fra', 'france', 'francja', 'frankreich', 'francia'],
  GB: ['gb', 'uk', 'england', 'britain', 'great britain', 'united kingdom', 'wielka brytania', 'anglia', 'regno unito'],
  IT: ['it', 'ita', 'italy', 'italia', 'wlochy', 'włochy', 'italien'],
  NL: ['nl', 'hol', 'holland', 'holandia', 'niderlandy', 'nederlands', 'netherlands', 'paesi bassi', 'niederlande'],
  PL: ['pl', 'pol', 'polska', 'poland', 'polen', 'polonia'],
  SE: ['sv', 'se', 'swe', 'sweden', 'szwecja', 'sverige', 'schweden', 'svezia'],
  SK: ['sk', 'slovakia', 'slowacja', 'słowacja', 'slovensko', 'slowakei', 'slovacchia'],
};

const countryName = (code: string, language: CountryLanguage) =>
  nameOverrides[code]?.[language] || displayNames[language].of(code) || code;

const unique = (values: string[]) => [...new Set(values.map((value) => value.trim()).filter(Boolean))];

export const countries: CountryOption[] = countryCodes.map((code) => {
  const names: Record<CountryLanguage, string> = {
    pl: countryName(code, 'pl'),
    en: countryName(code, 'en'),
    de: countryName(code, 'de'),
    it: countryName(code, 'it'),
  };

  return {
    code,
    flagClass: `fi fi-${code.toLowerCase()}`,
    names,
    aliases: unique([
      code.toLowerCase(),
      ...(aliasOverrides[code] || []),
      ...Object.values(names).map((name) => name.toLowerCase()),
    ]),
  };
});
