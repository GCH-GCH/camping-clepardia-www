import { defaultOgImage } from '@/data/seo';
import { pageSlugs } from '@/data/sitePages';
import { en } from './en';
import { corePages } from './corePages';
import { getCoreUi } from './coreUi';

type CorePublicLanguage = 'fr' | 'es' | 'nl' | 'cs' | 'sk' | 'sv';

const bookingHref = (language: CorePublicLanguage) => `/${language}/booking`;
const localizedHref = (language: CorePublicLanguage, slug: string) => `/${language}/${slug}`;

const pageCta = (language: CorePublicLanguage, text: CoreText, slug: string) => ({
  title: text.pageCtaTitle,
  copy: text.pageCtaCopy,
  primaryLabel: text.booking,
  primaryHref: bookingHref(language),
  secondaryLabel: text.prices,
  secondaryHref: localizedHref(language, slug === 'cennik' ? 'kontakt' : 'cennik'),
});

type CoreText = {
  seoTitle: string;
  seoDescription: string;
  navAria: string;
  home: string;
  camping: string;
  bungalows: string;
  prices: string;
  directions: string;
  attractions: string;
  gallery: string;
  contact: string;
  bookShort: string;
  booking: string;
  availability: string;
  footerDescription: string;
  quickLinks: string;
  languageVersions: string;
  receptionHours: string;
  rights: string;
  nextStep: string;
  pageCtaTitle: string;
  pageCtaCopy: string;
  heroBadge: string;
  heroSubtitle: string;
  heroCopy: string;
  heroPrimary: string;
  heroSecondary: string;
  heroBadges: string[];
  stats: Array<{ value: string; label: string; copy: string }>;
  whyOverline: string;
  whyTitle: string;
  whyLead: string;
  trustOverline: string;
  trustTitle: string;
  trustCards: Array<{ title: string; copy: string }>;
  pricing: {
    title: string;
    kicker: string;
    lead: string;
    dates: string;
    arrival: string;
    departure: string;
    nightsLabel: string;
    stayType: string;
    from: string;
    perNight: string;
    summerNotice: string;
    people: string;
    adults: string;
    children: string;
    toddlers: string;
    extras: string;
    summary: string;
    total: string;
    term: string;
    season: string;
    toComplete: string;
    noAddons: string;
    lowSeason: string;
    highSeason: string;
    confirmPrice: string;
    mobileTotal: string;
    stayTypes: Record<keyof typeof en.pricing.stayTypes, string>;
    addons: Record<keyof typeof en.pricing.addons, string>;
  };
  form: Partial<typeof en.form>;
  toursBooking: Partial<typeof en.toursBooking>;
};

const texts: Record<CorePublicLanguage, CoreText> = {
  fr: {
    seoTitle: 'Camping Clepardia — camping à Cracovie près du centre',
    seoDescription: 'Camping Clepardia à Cracovie : emplacements pour camping-cars, caravanes et tentes, bungalows et accès rapide au centre en tramway.',
    navAria: 'Navigation principale Camping Clepardia',
    home: 'Accueil',
    camping: 'Camping',
    bungalows: 'Bungalows',
    prices: 'Tarifs',
    directions: 'Accès',
    attractions: 'Attractions',
    gallery: 'Galerie',
    contact: 'Contact',
    bookShort: 'Réserver',
    booking: 'Envoyer une demande',
    availability: 'Demander la disponibilité',
    footerDescription: 'Camping Clepardia — camping et bungalows à Cracovie près du centre.',
    quickLinks: 'Liens rapides',
    languageVersions: 'Versions linguistiques',
    receptionHours: 'Horaires de réception',
    rights: 'Tous droits réservés.',
    nextStep: 'Étape suivante',
    pageCtaTitle: 'Planifiez votre séjour à Camping Clepardia',
    pageCtaCopy: 'Consultez les informations, les tarifs indicatifs et envoyez une demande à la réception.',
    heroBadge: 'Cracovie · camping et bungalows',
    heroSubtitle: 'Camping à Cracovie près du centre',
    heroCopy: 'Une base verte pour camping-cars, caravanes, tentes et bungalows. Reposez-vous au calme et rejoignez la Vieille Ville en tramway.',
    heroPrimary: 'Envoyer une demande',
    heroSecondary: 'Voir les tarifs',
    heroBadges: ['Près du centre de Cracovie', 'Camping + bungalows', 'Tramway vers le centre', 'Mister Camping 2024 & 2025'],
    stats: [
      { value: 'Cracovie', label: 'Près du centre', copy: 'Une base calme avec accès aux attractions.' },
      { value: 'Tramway', label: 'Arrêt tout proche', copy: 'Accès simple à la Vieille Ville.' },
      { value: 'Séjour', label: 'Camping + bungalows', copy: 'Choisissez votre style de séjour.' },
      { value: 'Vert', label: 'Partie verte de la ville', copy: 'Repos après une journée de visite.' },
    ],
    whyOverline: 'Une base verte à Cracovie',
    whyTitle: 'Pourquoi Camping Clepardia ?',
    whyLead: 'Un espace vert en ville, une base pratique pour visiter Cracovie et un accès rapide au centre sans stress de parking.',
    trustOverline: 'Confiance',
    trustTitle: 'Un lieu choisi par les voyageurs qui veulent visiter Cracovie à leur rythme.',
    trustCards: [
      { title: 'Mister Camping 2024 & 2025', copy: 'Une distinction qui rassure les clients avant leur séjour.' },
      { title: 'Très bonne appréciation', copy: 'Les clients apprécient l’emplacement, l’ambiance et le confort.' },
      { title: 'Atmosphère familiale', copy: 'Le rythme du camping, sans distance d’hôtel anonyme.' },
      { title: 'Expérience confirmée', copy: 'Une base éprouvée pour visiter Cracovie.' },
    ],
    pricing: {
      title: 'Calculateur de prix',
      kicker: 'Calculateur de séjour',
      lead: 'Calculez une estimation selon les nuits, les personnes, le type de séjour et les options. La réception confirme toujours le final.',
      dates: 'Dates du séjour', arrival: 'Date d’arrivée', departure: 'Date de départ', nightsLabel: 'Nuits', stayType: 'Type de séjour', from: 'à partir de', perNight: 'nuit', summerNotice: 'En été, les réservations de camping peuvent être limitées. La réception confirme la disponibilité.', people: 'Personnes', adults: 'Adultes', children: 'Enfants 4–14', toddlers: 'Enfants moins de 4 ans', extras: 'Options', summary: 'Résumé', total: 'Total', term: 'Dates', season: 'Saison', toComplete: 'À compléter', noAddons: 'Aucune', lowSeason: 'Basse saison', highSeason: 'Haute saison', confirmPrice: 'à confirmer', mobileTotal: 'Total séjour',
      stayTypes: { camper: 'Camping-car', caravan: 'Caravane', van: 'Van', car: 'Voiture', 'tent-small': 'Tente 1–2 pers.', 'tent-large': 'Tente 3–4 pers.', 'rooftop-tent': 'Voiture + tente de toit', bus: 'Bus / camion', 'bungalow-2': 'Bungalow 2 pers.', 'bungalow-3': 'Bungalow 3 pers.', 'bungalow-4': 'Bungalow 4 pers.' },
      addons: { electricity: 'Électricité', dog: 'Chien', motorcycle: 'Moto', 'cargo-trailer': 'Remorque bagages', bus: 'Bus / camion', parking: 'Parking', 'extra-car': 'Voiture supplémentaire' },
    },
    form: { kicker: 'Demande de réservation', title: 'Envoyez les détails de votre séjour', lead: 'Plus vous donnez d’informations, plus vite la réception peut confirmer les dates.', fullName: 'Nom et prénom', email: 'E-mail', phone: 'Téléphone', country: 'Pays', contactLanguage: 'Langue de contact', dates: 'Dates', arrival: 'Arrivée', departure: 'Départ', message: 'Message', submit: 'Envoyer la demande', loading: 'Envoi...', networkError: 'Impossible d’envoyer la demande. Réessayez ou contactez la réception.', summary: 'Résumé de la demande', success: 'Merci ! Votre demande a été envoyée à la réception. Nous répondrons dès que possible.' },
    toursBooking: { reserve: 'Réserver', reserveTitle: 'Réserver une excursion depuis Cracovie', reserveDescription: 'Vérifiez les excursions et les informations pratiques pour visiter Cracovie et la région.', sellingText: 'Combinez le séjour avec Wieliczka, Auschwitz-Birkenau, Zakopane, Ojców ou Energylandia.' },
  },
  es: {
    seoTitle: 'Camping Clepardia — camping en Cracovia cerca del centro',
    seoDescription: 'Camping Clepardia en Cracovia: parcelas para autocaravanas, caravanas y tiendas, bungalows y tranvía rápido al centro.',
    navAria: 'Navegación principal Camping Clepardia',
    home: 'Inicio', camping: 'Camping', bungalows: 'Bungalows', prices: 'Precios', directions: 'Cómo llegar', attractions: 'Atracciones', gallery: 'Galería', contact: 'Contacto', bookShort: 'Reservar', booking: 'Enviar consulta', availability: 'Consultar disponibilidad',
    footerDescription: 'Camping Clepardia — camping y bungalows en Cracovia cerca del centro.',
    quickLinks: 'Enlaces rápidos', languageVersions: 'Versiones de idioma', receptionHours: 'Horario de recepción', rights: 'Todos los derechos reservados.', nextStep: 'Siguiente paso',
    pageCtaTitle: 'Planifica tu estancia en Camping Clepardia', pageCtaCopy: 'Consulta información, precios orientativos y envía una consulta a recepción.',
    heroBadge: 'Cracovia · camping y bungalows', heroSubtitle: 'Camping en Cracovia cerca del centro', heroCopy: 'Una base verde para autocaravanas, caravanas, tiendas y bungalows. Descansa tranquilo y llega al casco antiguo en tranvía.', heroPrimary: 'Enviar consulta', heroSecondary: 'Ver precios', heroBadges: ['Cerca del centro', 'Camping + bungalows', 'Tranvía al centro', 'Mister Camping 2024 & 2025'],
    stats: [{ value: 'Cracovia', label: 'Cerca del centro', copy: 'Base tranquila con acceso a atracciones.' }, { value: 'Tranvía', label: 'Parada cercana', copy: 'Acceso cómodo al casco antiguo.' }, { value: 'Estancia', label: 'Camping + bungalows', copy: 'Elige tu estilo de viaje.' }, { value: 'Verde', label: 'Zona verde de la ciudad', copy: 'Descanso tras visitar Cracovia.' }],
    whyOverline: 'Una base verde en Cracovia', whyTitle: '¿Por qué Camping Clepardia?', whyLead: 'Espacio verde en la ciudad, buena base para visitar Cracovia y acceso rápido al centro sin estrés de aparcamiento.',
    trustOverline: 'Confianza', trustTitle: 'Un lugar elegido por viajeros que quieren descubrir Cracovia a su ritmo.', trustCards: [{ title: 'Mister Camping 2024 & 2025', copy: 'Distinción que da confianza al planificar la estancia.' }, { title: 'Alta valoración', copy: 'Los huéspedes valoran la ubicación, el ambiente y la comodidad.' }, { title: 'Ambiente familiar', copy: 'Ritmo de camping sin distancia hotelera.' }, { title: 'Experiencia probada', copy: 'Base conocida para visitar Cracovia.' }],
    pricing: { title: 'Calculadora de precios', kicker: 'Calculadora de estancia', lead: 'Calcula una estimación según noches, personas, tipo de estancia y extras. Recepción confirma el final.', dates: 'Fechas', arrival: 'Llegada', departure: 'Salida', nightsLabel: 'Noches', stayType: 'Tipo de estancia', from: 'desde', perNight: 'noche', summerNotice: 'En verano, las reservas de parcelas pueden ser limitadas.', people: 'Personas', adults: 'Adultos', children: 'Niños 4–14', toddlers: 'Menores de 4', extras: 'Extras', summary: 'Resumen', total: 'Total', term: 'Fechas', season: 'Temporada', toComplete: 'Por completar', noAddons: 'Ninguno', lowSeason: 'Temporada baja', highSeason: 'Temporada alta', confirmPrice: 'a confirmar', mobileTotal: 'Total estancia', stayTypes: { camper: 'Autocaravana', caravan: 'Caravana', van: 'Furgoneta', car: 'Coche', 'tent-small': 'Tienda 1–2 pers.', 'tent-large': 'Tienda 3–4 pers.', 'rooftop-tent': 'Coche + tienda techo', bus: 'Bus / camión', 'bungalow-2': 'Bungalow 2 pers.', 'bungalow-3': 'Bungalow 3 pers.', 'bungalow-4': 'Bungalow 4 pers.' }, addons: { electricity: 'Electricidad', dog: 'Perro', motorcycle: 'Moto', 'cargo-trailer': 'Remolque', bus: 'Bus / camión', parking: 'Parking', 'extra-car': 'Coche extra' } },
    form: { kicker: 'Consulta de reserva', title: 'Envía los detalles de tu estancia', lead: 'Cuanta más información envíes, antes recepción podrá confirmar fechas.', fullName: 'Nombre y apellidos', email: 'Email', phone: 'Teléfono', country: 'País', contactLanguage: 'Idioma de contacto', dates: 'Fechas', arrival: 'Llegada', departure: 'Salida', message: 'Mensaje', submit: 'Enviar consulta', loading: 'Enviando...', networkError: 'No se pudo enviar la consulta. Inténtalo de nuevo o contacta con recepción.', summary: 'Resumen de la consulta', success: '¡Gracias! La consulta se ha enviado a recepción. Responderemos lo antes posible.' },
    toursBooking: { reserve: 'Reservar', reserveTitle: 'Reservar excursión desde Cracovia', reserveDescription: 'Consulta excursiones e información práctica para visitar Cracovia y la región.', sellingText: 'Combina tu estancia con Wieliczka, Auschwitz-Birkenau, Zakopane, Ojców o Energylandia.' },
  },
  nl: {
    seoTitle: 'Camping Clepardia — camping in Krakau dicht bij het centrum',
    seoDescription: 'Camping Clepardia in Krakau: plaatsen voor campers, caravans en tenten, bungalows en snelle tram naar het centrum.',
    navAria: 'Hoofdnavigatie Camping Clepardia',
    home: 'Start', camping: 'Camping', bungalows: 'Bungalows', prices: 'Prijzen', directions: 'Route', attractions: 'Attracties', gallery: 'Galerij', contact: 'Contact', bookShort: 'Boeken', booking: 'Aanvraag sturen', availability: 'Vraag beschikbaarheid',
    footerDescription: 'Camping Clepardia — camping en bungalows in Krakau dicht bij het centrum.',
    quickLinks: 'Snelle links', languageVersions: 'Taalversies', receptionHours: 'Receptie-uren', rights: 'Alle rechten voorbehouden.', nextStep: 'Volgende stap',
    pageCtaTitle: 'Plan je verblijf bij Camping Clepardia', pageCtaCopy: 'Bekijk informatie, richtprijzen en stuur een aanvraag naar de receptie.',
    heroBadge: 'Krakau · camping en bungalows', heroSubtitle: 'Camping in Krakau dicht bij het centrum', heroCopy: 'Een groene basis voor campers, caravans, tenten en bungalows. Rust uit en ga met de tram naar de Oude Stad.', heroPrimary: 'Aanvraag sturen', heroSecondary: 'Bekijk prijzen', heroBadges: ['Dicht bij centrum', 'Camping + bungalows', 'Tram naar centrum', 'Mister Camping 2024 & 2025'],
    stats: [{ value: 'Krakau', label: 'Dicht bij centrum', copy: 'Rustige basis met toegang tot attracties.' }, { value: 'Tram', label: 'Halte dichtbij', copy: 'Comfortabel naar de Oude Stad.' }, { value: 'Verblijf', label: 'Camping + bungalows', copy: 'Kies jouw verblijf.' }, { value: 'Groen', label: 'Groene stadszone', copy: 'Rust na sightseeing.' }],
    whyOverline: 'Een groene basis in Krakau', whyTitle: 'Waarom Camping Clepardia?', whyLead: 'Groene ruimte in de stad, handige basis voor Krakau en snelle tram naar het centrum zonder parkeerdruk.',
    trustOverline: 'Vertrouwen', trustTitle: 'Een plek voor reizigers die Krakau op hun eigen manier willen ontdekken.', trustCards: [{ title: 'Mister Camping 2024 & 2025', copy: 'Een onderscheiding die vertrouwen geeft.' }, { title: 'Hoge gastwaardering', copy: 'Gasten waarderen locatie, sfeer en comfort.' }, { title: 'Familiale sfeer', copy: 'Campingritme zonder anonieme hotelafstand.' }, { title: 'Jaren ervaring', copy: 'Beproefde basis voor Krakau.' }],
    pricing: { title: 'Prijscalculator', kicker: 'Verblijfscalculator', lead: 'Bereken een indicatie op basis van nachten, personen, verblijfstype en extra’s. De receptie bevestigt definitief.', dates: 'Data', arrival: 'Aankomst', departure: 'Vertrek', nightsLabel: 'Nachten', stayType: 'Verblijfstype', from: 'vanaf', perNight: 'nacht', summerNotice: 'In de zomer kunnen reserveringen voor kampeerplaatsen beperkt zijn.', people: 'Personen', adults: 'Volwassenen', children: 'Kinderen 4–14', toddlers: 'Kinderen onder 4', extras: 'Extra’s', summary: 'Samenvatting', total: 'Totaal', term: 'Data', season: 'Seizoen', toComplete: 'Aanvullen', noAddons: 'Geen', lowSeason: 'Laagseizoen', highSeason: 'Hoogseizoen', confirmPrice: 'te bevestigen', mobileTotal: 'Totaal verblijf', stayTypes: { camper: 'Camper', caravan: 'Caravan', van: 'Van', car: 'Auto', 'tent-small': 'Tent 1–2 pers.', 'tent-large': 'Tent 3–4 pers.', 'rooftop-tent': 'Auto + daktent', bus: 'Bus / vrachtwagen', 'bungalow-2': 'Bungalow 2 pers.', 'bungalow-3': 'Bungalow 3 pers.', 'bungalow-4': 'Bungalow 4 pers.' }, addons: { electricity: 'Stroom', dog: 'Hond', motorcycle: 'Motor', 'cargo-trailer': 'Bagageaanhanger', bus: 'Bus / vrachtwagen', parking: 'Parking', 'extra-car': 'Extra auto' } },
    form: { kicker: 'Reserveringsaanvraag', title: 'Stuur je verblijfsdetails', lead: 'Hoe meer informatie, hoe sneller de receptie kan bevestigen.', fullName: 'Naam', email: 'E-mail', phone: 'Telefoon', country: 'Land', contactLanguage: 'Contacttaal', dates: 'Data', arrival: 'Aankomst', departure: 'Vertrek', message: 'Bericht', submit: 'Aanvraag sturen', loading: 'Verzenden...', networkError: 'Aanvraag kon niet worden verzonden. Probeer opnieuw of neem contact op.', summary: 'Samenvatting aanvraag', success: 'Dank je! De aanvraag is naar de receptie gestuurd. We antwoorden zo snel mogelijk.' },
    toursBooking: { reserve: 'Boeken', reserveTitle: 'Tour boeken vanuit Krakau', reserveDescription: 'Bekijk tours en praktische informatie voor Krakau en de regio.', sellingText: 'Combineer je verblijf met Wieliczka, Auschwitz-Birkenau, Zakopane, Ojców of Energylandia.' },
  },
  cs: {
    seoTitle: 'Camping Clepardia — kemp v Krakově blízko centra',
    seoDescription: 'Camping Clepardia v Krakově: místa pro obytné vozy, karavany a stany, bungalovy a rychlá tramvaj do centra.',
    navAria: 'Hlavní navigace Camping Clepardia',
    home: 'Úvod', camping: 'Kemp', bungalows: 'Bungalovy', prices: 'Ceny', directions: 'Doprava', attractions: 'Atrakce', gallery: 'Galerie', contact: 'Kontakt', bookShort: 'Rezervovat', booking: 'Odeslat dotaz', availability: 'Zeptat se na dostupnost',
    footerDescription: 'Camping Clepardia — kemp a bungalovy v Krakově blízko centra.',
    quickLinks: 'Rychlé odkazy', languageVersions: 'Jazykové verze', receptionHours: 'Hodiny recepce', rights: 'Všechna práva vyhrazena.', nextStep: 'Další krok',
    pageCtaTitle: 'Naplánujte pobyt v Camping Clepardia', pageCtaCopy: 'Prohlédněte si informace, orientační ceny a odešlete dotaz recepci.',
    heroBadge: 'Krakov · kemp a bungalovy', heroSubtitle: 'Kemp v Krakově blízko centra', heroCopy: 'Zelená základna pro obytné vozy, karavany, stany a bungalovy. Odpočívejte v klidu a jeďte do centra tramvají.', heroPrimary: 'Odeslat dotaz', heroSecondary: 'Zobrazit ceny', heroBadges: ['Blízko centra', 'Kemp + bungalovy', 'Tramvaj do centra', 'Mister Camping 2024 & 2025'],
    stats: [{ value: 'Krakov', label: 'Blízko centra', copy: 'Klidná základna k atrakcím.' }, { value: 'Tramvaj', label: 'Zastávka blízko', copy: 'Pohodlně do Starého Města.' }, { value: 'Pobyt', label: 'Kemp + bungalovy', copy: 'Vyberte styl pobytu.' }, { value: 'Zeleň', label: 'Zelená část města', copy: 'Odpočinek po prohlídce.' }],
    whyOverline: 'Zelená základna v Krakově', whyTitle: 'Proč Camping Clepardia?', whyLead: 'Zelený prostor ve městě, praktická základna pro Krakov a rychlá tramvaj do centra bez parkovacího stresu.',
    trustOverline: 'Důvěra', trustTitle: 'Místo pro cestovatele, kteří chtějí poznat Krakov po svém.', trustCards: [{ title: 'Mister Camping 2024 & 2025', copy: 'Ocenění, které posiluje důvěru hostů.' }, { title: 'Vysoké hodnocení hostů', copy: 'Hosté oceňují polohu, atmosféru a pohodlí.' }, { title: 'Rodinná atmosféra', copy: 'Kempový rytmus bez anonymity hotelu.' }, { title: 'Zkušená základna', copy: 'Ověřené místo pro návštěvu Krakova.' }],
    pricing: { title: 'Cenová kalkulačka', kicker: 'Kalkulačka pobytu', lead: 'Spočítá orientační cenu podle nocí, osob, typu pobytu a doplňků. Recepce potvrzuje finální podmínky.', dates: 'Termín', arrival: 'Příjezd', departure: 'Odjezd', nightsLabel: 'Noci', stayType: 'Typ pobytu', from: 'od', perNight: 'noc', summerNotice: 'V létě mohou být rezervace míst omezené.', people: 'Osoby', adults: 'Dospělí', children: 'Děti 4–14', toddlers: 'Děti do 4 let', extras: 'Doplňky', summary: 'Souhrn', total: 'Celkem', term: 'Termín', season: 'Sezóna', toComplete: 'Doplnit', noAddons: 'Žádné', lowSeason: 'Nízká sezóna', highSeason: 'Vysoká sezóna', confirmPrice: 'k potvrzení', mobileTotal: 'Celkem za pobyt', stayTypes: { camper: 'Obytný vůz', caravan: 'Karavan', van: 'Dodávka', car: 'Auto', 'tent-small': 'Stan 1–2 os.', 'tent-large': 'Stan 3–4 os.', 'rooftop-tent': 'Auto + střešní stan', bus: 'Bus / nákladní vůz', 'bungalow-2': 'Bungalov 2 os.', 'bungalow-3': 'Bungalov 3 os.', 'bungalow-4': 'Bungalov 4 os.' }, addons: { electricity: 'Elektřina', dog: 'Pes', motorcycle: 'Motocykl', 'cargo-trailer': 'Přívěs', bus: 'Bus / nákladní vůz', parking: 'Parkování', 'extra-car': 'Další auto' } },
    form: { kicker: 'Rezervační dotaz', title: 'Pošlete detaily pobytu', lead: 'Čím více informací, tím rychleji recepce potvrdí termín.', fullName: 'Jméno a příjmení', email: 'E-mail', phone: 'Telefon', country: 'Země', contactLanguage: 'Jazyk kontaktu', dates: 'Termín', arrival: 'Příjezd', departure: 'Odjezd', message: 'Zpráva', submit: 'Odeslat dotaz', loading: 'Odesílám...', networkError: 'Dotaz se nepodařilo odeslat. Zkuste to znovu nebo kontaktujte recepci.', summary: 'Souhrn dotazu', success: 'Děkujeme! Dotaz byl odeslán recepci. Odpovíme co nejdříve.' },
    toursBooking: { reserve: 'Rezervovat', reserveTitle: 'Rezervovat výlet z Krakova', reserveDescription: 'Zkontrolujte výlety a praktické informace pro Krakov a region.', sellingText: 'Spojte pobyt s Wieliczkou, Auschwitz-Birkenau, Zakopaným, Ojcówem nebo Energylandií.' },
  },
  sk: {
    seoTitle: 'Camping Clepardia — kemp v Krakove blízko centra',
    seoDescription: 'Camping Clepardia v Krakove: miesta pre obytné autá, karavany a stany, bungalovy a rýchla električka do centra.',
    navAria: 'Hlavná navigácia Camping Clepardia',
    home: 'Úvod', camping: 'Kemp', bungalows: 'Bungalovy', prices: 'Ceny', directions: 'Doprava', attractions: 'Atrakcie', gallery: 'Galéria', contact: 'Kontakt', bookShort: 'Rezervovať', booking: 'Odoslať dopyt', availability: 'Spýtať sa na dostupnosť',
    footerDescription: 'Camping Clepardia — kemp a bungalovy v Krakove blízko centra.',
    quickLinks: 'Rýchle odkazy', languageVersions: 'Jazykové verzie', receptionHours: 'Hodiny recepcie', rights: 'Všetky práva vyhradené.', nextStep: 'Ďalší krok',
    pageCtaTitle: 'Naplánujte pobyt v Camping Clepardia', pageCtaCopy: 'Pozrite si informácie, orientačné ceny a odošlite dopyt recepcii.',
    heroBadge: 'Krakov · kemp a bungalovy', heroSubtitle: 'Kemp v Krakove blízko centra', heroCopy: 'Zelená základňa pre obytné autá, karavany, stany a bungalovy. Oddychujte pokojne a choďte do centra električkou.', heroPrimary: 'Odoslať dopyt', heroSecondary: 'Zobraziť ceny', heroBadges: ['Blízko centra', 'Kemp + bungalovy', 'Električka do centra', 'Mister Camping 2024 & 2025'],
    stats: [{ value: 'Krakov', label: 'Blízko centra', copy: 'Pokojná základňa k atrakciám.' }, { value: 'Električka', label: 'Zastávka blízko', copy: 'Pohodlne do Starého Mesta.' }, { value: 'Pobyt', label: 'Kemp + bungalovy', copy: 'Vyberte štýl pobytu.' }, { value: 'Zeleň', label: 'Zelená časť mesta', copy: 'Oddych po prehliadke.' }],
    whyOverline: 'Zelená základňa v Krakove', whyTitle: 'Prečo Camping Clepardia?', whyLead: 'Zelený priestor v meste, praktická základňa pre Krakov a rýchla električka do centra bez stresu z parkovania.',
    trustOverline: 'Dôvera', trustTitle: 'Miesto pre cestovateľov, ktorí chcú spoznať Krakov po svojom.', trustCards: [{ title: 'Mister Camping 2024 & 2025', copy: 'Ocenenie, ktoré posilňuje dôveru hostí.' }, { title: 'Vysoké hodnotenie hostí', copy: 'Hostia oceňujú polohu, atmosféru a pohodlie.' }, { title: 'Rodinná atmosféra', copy: 'Kempový rytmus bez anonymity hotela.' }, { title: 'Skúsená základňa', copy: 'Overené miesto pre návštevu Krakova.' }],
    pricing: { title: 'Cenová kalkulačka', kicker: 'Kalkulačka pobytu', lead: 'Spočíta orientačnú cenu podľa nocí, osôb, typu pobytu a doplnkov. Recepcia potvrdzuje finálne podmienky.', dates: 'Termín', arrival: 'Príchod', departure: 'Odchod', nightsLabel: 'Noci', stayType: 'Typ pobytu', from: 'od', perNight: 'noc', summerNotice: 'V lete môžu byť rezervácie miest obmedzené.', people: 'Osoby', adults: 'Dospelí', children: 'Deti 4–14', toddlers: 'Deti do 4 rokov', extras: 'Doplnky', summary: 'Súhrn', total: 'Celkom', term: 'Termín', season: 'Sezóna', toComplete: 'Doplniť', noAddons: 'Žiadne', lowSeason: 'Nízka sezóna', highSeason: 'Vysoká sezóna', confirmPrice: 'na potvrdenie', mobileTotal: 'Celkom za pobyt', stayTypes: { camper: 'Obytné auto', caravan: 'Karavan', van: 'Dodávka', car: 'Auto', 'tent-small': 'Stan 1–2 os.', 'tent-large': 'Stan 3–4 os.', 'rooftop-tent': 'Auto + strešný stan', bus: 'Bus / nákladné auto', 'bungalow-2': 'Bungalov 2 os.', 'bungalow-3': 'Bungalov 3 os.', 'bungalow-4': 'Bungalov 4 os.' }, addons: { electricity: 'Elektrina', dog: 'Pes', motorcycle: 'Motorka', 'cargo-trailer': 'Príves', bus: 'Bus / nákladné auto', parking: 'Parkovanie', 'extra-car': 'Ďalšie auto' } },
    form: { kicker: 'Rezervačný dopyt', title: 'Pošlite detaily pobytu', lead: 'Čím viac informácií, tým rýchlejšie recepcia potvrdí termín.', fullName: 'Meno a priezvisko', email: 'E-mail', phone: 'Telefón', country: 'Krajina', contactLanguage: 'Jazyk kontaktu', dates: 'Termín', arrival: 'Príchod', departure: 'Odchod', message: 'Správa', submit: 'Odoslať dopyt', loading: 'Odosielam...', networkError: 'Dopyt sa nepodarilo odoslať. Skúste znova alebo kontaktujte recepciu.', summary: 'Súhrn dopytu', success: 'Ďakujeme! Dopyt bol odoslaný recepcii. Odpovieme čo najskôr.' },
    toursBooking: { reserve: 'Rezervovať', reserveTitle: 'Rezervovať výlet z Krakova', reserveDescription: 'Skontrolujte výlety a praktické informácie pre Krakov a región.', sellingText: 'Spojte pobyt s Wieliczkou, Auschwitz-Birkenau, Zakopaným, Ojcówom alebo Energylandiou.' },
  },
  sv: {
    seoTitle: 'Camping Clepardia — camping i Kraków nära centrum',
    seoDescription: 'Camping Clepardia i Kraków: platser för husbilar, husvagnar och tält, bungalower och snabb spårvagn till centrum.',
    navAria: 'Huvudnavigering Camping Clepardia',
    home: 'Start', camping: 'Camping', bungalows: 'Bungalower', prices: 'Priser', directions: 'Vägbeskrivning', attractions: 'Sevärdheter', gallery: 'Galleri', contact: 'Kontakt', bookShort: 'Boka', booking: 'Skicka förfrågan', availability: 'Fråga om tillgänglighet',
    footerDescription: 'Camping Clepardia — camping och bungalower i Kraków nära centrum.',
    quickLinks: 'Snabblänkar', languageVersions: 'Språkversioner', receptionHours: 'Receptionstider', rights: 'Alla rättigheter förbehållna.', nextStep: 'Nästa steg',
    pageCtaTitle: 'Planera din vistelse på Camping Clepardia', pageCtaCopy: 'Se information, ungefärliga priser och skicka en förfrågan till receptionen.',
    heroBadge: 'Kraków · camping och bungalower', heroSubtitle: 'Camping i Kraków nära centrum', heroCopy: 'En grön bas för husbilar, husvagnar, tält och bungalower. Vila lugnt och ta spårvagnen till Gamla stan.', heroPrimary: 'Skicka förfrågan', heroSecondary: 'Se priser', heroBadges: ['Nära centrum', 'Camping + bungalower', 'Spårvagn till centrum', 'Mister Camping 2024 & 2025'],
    stats: [{ value: 'Kraków', label: 'Nära centrum', copy: 'Lugn bas med tillgång till sevärdheter.' }, { value: 'Spårvagn', label: 'Hållplats nära', copy: 'Bekvämt till Gamla stan.' }, { value: 'Vistelse', label: 'Camping + bungalower', copy: 'Välj din vistelse.' }, { value: 'Grönt', label: 'Grön stadsdel', copy: 'Vila efter sightseeing.' }],
    whyOverline: 'En grön bas i Kraków', whyTitle: 'Varför Camping Clepardia?', whyLead: 'Grön yta i staden, praktisk bas för Kraków och snabb spårvagn till centrum utan parkeringsstress.',
    trustOverline: 'Förtroende', trustTitle: 'En plats för resenärer som vill upptäcka Kraków på sitt sätt.', trustCards: [{ title: 'Mister Camping 2024 & 2025', copy: 'En utmärkelse som skapar trygghet.' }, { title: 'Högt gästbetyg', copy: 'Gäster uppskattar läge, atmosfär och bekvämlighet.' }, { title: 'Familjär atmosfär', copy: 'Campingrytm utan anonym hotellkänsla.' }, { title: 'Erfaren bas', copy: 'Beprövad plats för att besöka Kraków.' }],
    pricing: { title: 'Priskalkylator', kicker: 'Vistelsekalkylator', lead: 'Räkna en uppskattning utifrån nätter, personer, vistelsetyp och tillval. Receptionen bekräftar slutligt.', dates: 'Datum', arrival: 'Ankomst', departure: 'Avresa', nightsLabel: 'Nätter', stayType: 'Vistelsetyp', from: 'från', perNight: 'natt', summerNotice: 'På sommaren kan bokning av campingplatser vara begränsad.', people: 'Personer', adults: 'Vuxna', children: 'Barn 4–14', toddlers: 'Barn under 4', extras: 'Tillval', summary: 'Sammanfattning', total: 'Totalt', term: 'Datum', season: 'Säsong', toComplete: 'Komplettera', noAddons: 'Inga', lowSeason: 'Lågsäsong', highSeason: 'Högsäsong', confirmPrice: 'bekräftas', mobileTotal: 'Totalt för vistelsen', stayTypes: { camper: 'Husbil', caravan: 'Husvagn', van: 'Van', car: 'Bil', 'tent-small': 'Tält 1–2 pers.', 'tent-large': 'Tält 3–4 pers.', 'rooftop-tent': 'Bil + taktält', bus: 'Buss / lastbil', 'bungalow-2': 'Bungalow 2 pers.', 'bungalow-3': 'Bungalow 3 pers.', 'bungalow-4': 'Bungalow 4 pers.' }, addons: { electricity: 'El', dog: 'Hund', motorcycle: 'Motorcykel', 'cargo-trailer': 'Bagagesläp', bus: 'Buss / lastbil', parking: 'Parkering', 'extra-car': 'Extra bil' } },
    form: { kicker: 'Bokningsförfrågan', title: 'Skicka dina vistelsedetaljer', lead: 'Ju mer information, desto snabbare kan receptionen bekräfta datum.', fullName: 'Namn', email: 'E-post', phone: 'Telefon', country: 'Land', contactLanguage: 'Kontaktspråk', dates: 'Datum', arrival: 'Ankomst', departure: 'Avresa', message: 'Meddelande', submit: 'Skicka förfrågan', loading: 'Skickar...', networkError: 'Det gick inte att skicka förfrågan. Försök igen eller kontakta receptionen.', summary: 'Sammanfattning', success: 'Tack! Förfrågan har skickats till receptionen. Vi svarar så snart som möjligt.' },
    toursBooking: { reserve: 'Boka', reserveTitle: 'Boka utflykt från Kraków', reserveDescription: 'Se utflykter och praktisk information för Kraków och regionen.', sellingText: 'Kombinera vistelsen med Wieliczka, Auschwitz-Birkenau, Zakopane, Ojców eller Energylandia.' },
  },
};

const makePages = (language: CorePublicLanguage, text: CoreText) => {
  const pages = { ...en.pages };
  pageSlugs.forEach((slug) => {
    const core = corePages[language]?.pages[slug];
    const fallbackPage = en.pages[slug];
    if (!fallbackPage) return;
    pages[slug] = {
      ...fallbackPage,
      slug,
      overline: core?.overline ?? fallbackPage.overline,
      title: core?.title ?? fallbackPage.title,
      lead: core?.lead ?? fallbackPage.lead,
      seoTitle: core?.title ? `${core.title} | Camping Clepardia` : fallbackPage.seoTitle,
      seoDescription: core?.lead ?? fallbackPage.seoDescription,
      highlights: core?.highlights.map(([title, copy]) => ({ title, copy })) ?? fallbackPage.highlights,
      cta: pageCta(language, text, slug),
    };
  });
  return pages;
};

const makeTranslation = (language: CorePublicLanguage) => {
  const text = texts[language];
  const coreUi = getCoreUi(language);

  return {
    ...en,
    seo: {
      home: {
        title: text.seoTitle,
        description: text.seoDescription,
        ogTitle: text.seoTitle,
        ogDescription: text.seoDescription,
        ogImage: defaultOgImage,
      },
    },
    nav: {
      ...en.nav,
      aria: text.navAria,
      homeAria: text.home,
      changeLanguage: text.languageVersions,
      chooseLanguage: text.languageVersions,
      cta: text.bookShort,
      items: {
        start: text.home,
        camping: text.camping,
        domki: text.bungalows,
        cennik: text.prices,
        dojazd: text.directions,
        atrakcje: text.attractions,
        galeria: text.gallery,
        kontakt: text.contact,
      },
    },
    footer: {
      ...en.footer,
      description: text.footerDescription,
      languages: text.languageVersions,
      quickLinks: text.quickLinks,
      contact: text.contact,
      phoneLabel: text.form.phone ?? en.footer.phoneLabel,
      emailLabel: text.form.email ?? en.footer.emailLabel,
      addressLabel: en.footer.addressLabel,
      receptionHoursLabel: text.receptionHours,
      mapsLabel: corePages[language]?.maps ?? en.footer.mapsLabel,
      rights: text.rights,
      bookingReady: text.footerDescription,
    },
    loader: {
      messages: [text.heroBadge, text.heroCopy, text.booking],
    },
    global: {
      ...en.global,
      scrollToTop: text.home,
      nextStep: text.nextStep,
    },
    cta: {
      pricing: text.prices,
      availability: text.availability,
      gallery: text.gallery,
      bungalows: text.bungalows,
      directions: text.directions,
      contact: text.contact,
      contactReception: corePages[language]?.contact ?? text.contact,
      maps: corePages[language]?.maps ?? en.cta.maps,
      camperCost: text.pricing.title,
    },
    toursBooking: {
      ...en.toursBooking,
      ...text.toursBooking,
    },
    chat: {
      ...en.chat,
      open: coreUi.search[1],
      title: `CAMPY — ${text.contact}`,
      quickLabel: coreUi.quick[0],
      actions: {
        ...en.chat.actions,
        pricing: coreUi.quick[2],
        directions: coreUi.quick[3],
        attractions: coreUi.quick[4],
        reception: coreUi.quick[5],
      },
    },
    pages: makePages(language, text),
    home: {
      hero: {
        badge: text.heroBadge,
        title: 'Camping Clepardia',
        subtitle: text.heroSubtitle,
        copy: text.heroCopy,
        primary: text.heroPrimary,
        secondary: text.heroSecondary,
        badges: text.heroBadges,
        benefits: text.heroBadges.slice(0, 3),
        scroll: text.nextStep,
      },
      stats: text.stats,
      why: {
        ...en.home.why,
        overline: text.whyOverline,
        title: text.whyTitle,
        lead: text.whyLead,
      },
      trust: {
        overline: text.trustOverline,
        title: text.trustTitle,
        cards: text.trustCards,
      },
    },
    content: {
      ...en.content,
      infoKicker: corePages[language]?.info ?? en.content.infoKicker,
      infoTitle: text.pageCtaTitle,
      contactCards: {
        ...en.content.contactCards,
        phone: text.form.phone ?? en.content.contactCards.phone,
        email: text.form.email ?? en.content.contactCards.email,
        receptionHours: text.receptionHours,
      },
    },
    pricing: {
      ...en.pricing,
      ...text.pricing,
      night: en.pricing.night,
    },
    form: {
      ...en.form,
      ...text.form,
      validation: en.form.validation,
      mailLabels: en.form.mailLabels,
    },
  };
};

export const corePublicTranslations = {
  fr: makeTranslation('fr'),
  es: makeTranslation('es'),
  nl: makeTranslation('nl'),
  cs: makeTranslation('cs'),
  sk: makeTranslation('sk'),
  sv: makeTranslation('sv'),
};
