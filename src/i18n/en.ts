import { defaultOgImage } from '@/data/seo';

export const en = {
  seo: {
    home: {
      title: 'Camping Clepardia - Camping in Krakow close to the city centre',
      description:
        'Camping Clepardia in Krakow - pitches for motorhomes, caravans and tents plus bungalows close to the city centre. Check prices and ask about availability.',
      ogTitle: 'Camping Clepardia - Camping in Krakow close to the city centre',
      ogDescription:
        'A green camping base in Krakow for motorhomes, caravans, tents and bungalows with easy tram access to the Old Town.',
      ogImage: defaultOgImage,
    },
  },
  nav: {
    aria: 'Main Camping Clepardia navigation',
    homeAria: 'Back to the Camping Clepardia homepage',
    changeLanguage: 'Change language',
    languageList: 'Language list',
    changeTheme: 'Change page theme',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    mobileMenu: 'Mobile menu Camping Clepardia',
    chooseLanguage: 'Choose language',
    lightMode: 'Light mode',
    darkMode: 'Dark mode',
    enableLight: 'Enable light mode',
    enableDark: 'Enable dark mode',
    cta: 'Check availability',
    items: {
      start: 'Home',
      camping: 'Camping',
      domki: 'Bungalows',
      cennik: 'Prices',
      dojazd: 'Directions',
      atrakcje: 'Attractions',
      kontakt: 'Contact',
    },
  },
  footer: {
    description:
      'Camping in Krakow close to the city centre. The website is ready for future online booking and CC SYSTEM integration.',
    languages: 'Language versions',
    quickLinks: 'Quick links',
    contact: 'Contact',
    contactPlace: 'Camping Clepardia<br />Krakow, Poland',
    reception: 'Reception and booking enquiries',
    social: 'Social media',
    rights: 'All rights reserved.',
    bookingReady: 'Online booking foundation ready.',
  },
  global: {
    scrollToTop: 'Back to the top of the page',
    nextStep: 'Next step',
  },
  cta: {
    pricing: 'Check prices',
    availability: 'Ask about availability',
    gallery: 'View gallery',
    bungalows: 'View bungalows',
    directions: 'How to get here',
    contact: 'Contact',
    contactReception: 'Ask reception',
    maps: 'Open in Google Maps',
    camperCost: 'Calculate stay cost',
  },
  chat: {
    open: 'Open Camping Clepardia Assistant',
    close: 'Close chat',
    title: 'Camping Clepardia Assistant',
    status: 'Online',
    intro:
      'Hi. I can quickly help with prices, directions, bungalows, camping or contacting reception.',
    quickLabel: 'Quick questions',
    inputLabel: 'Write a message',
    inputPlaceholder: 'Write a message...',
    send: 'Send message',
    actions: {
      pricing: 'Check prices',
      directions: 'How to get here?',
      bungalow: 'Ask about a bungalow',
      reception: 'Contact reception',
    },
    answers: {
      pricing:
        'As a guide: motorhome 80 PLN / night, caravan 60 PLN / night, van 75 PLN / night, electricity 25 PLN / night and dogs stay free. The full calculator is on the Prices page.',
      directions:
        'The easiest way is to leave your car or camper at the campsite and take the tram towards the centre of Krakow. Address: Henryka Pachońskiego 28A, 31-322 Krakow.',
      bungalows:
        'Bungalows have separate availability. 2-person: 200/220 PLN, 3-person: 250/300 PLN, 4-person: 400/450 PLN depending on season. Family bungalows require reception confirmation.',
      reception:
        'Reception: +48 795 294 486, email: clepardia@gmail.com. The fastest way to confirm availability is by phone or email.',
      camping:
        'Camping Clepardia welcomes motorhomes, vans, caravans, tents and cars with rooftop tents. Availability may be limited in June, July and August.',
      fallback:
        'This is a demo assistant. In the next stage it can be connected to a real backend and reception knowledge base. For now I can help with prices, directions, bungalows, camping and contact.',
    },
  },
  pages: {
    camping: {
      slug: 'camping',
      overline: 'Camping in Krakow',
      title: 'Pitches for motorhomes, caravans, vans and tents',
      lead:
        'A green base in Krakow for guests travelling through the city and Małopolska at their own pace.',
      seoTitle: 'Camping in Krakow - motorhomes, tents and caravans | Camping Clepardia',
      seoDescription:
        'Camping Clepardia in Krakow - pitches for motorhomes, vans, caravans and tents close to the city centre with easy tram access.',
      highlights: [
        {
          title: 'Motorhomes and vans',
          copy:
            'A practical place for guests travelling by motorhome, van or touring vehicle.',
        },
        {
          title: 'Caravans and tents',
          copy: 'Classic camping spaces with access to essential facilities.',
        },
        {
          title: 'Close to public transport',
          copy:
            'Convenient tram access to the Old Town without looking for parking in the centre.',
        },
      ],
      cta: {
        title: 'Plan your camping stay',
        copy: 'Check prices or send an enquiry to Camping Clepardia reception.',
        primaryLabel: 'Check availability',
        primaryHref: '/kontakt',
        secondaryLabel: 'View prices',
        secondaryHref: '/cennik',
      },
    },
    domki: {
      slug: 'domki',
      overline: 'Camping Clepardia bungalows',
      title: 'Comfortable accommodation in Krakow without your own camping gear',
      lead:
        'Bungalows for guests who want to stay close to the city centre but prefer a quieter green space.',
      seoTitle: 'Camping Clepardia bungalows - accommodation in Krakow',
      seoDescription:
        'Camping Clepardia bungalows in Krakow - a calm location close to the city centre with easy tram access.',
      highlights: [
        {
          title: 'For couples and families',
          copy: 'A practical option after a full day of exploring Krakow.',
        },
        {
          title: 'Camping atmosphere',
          copy: 'More freedom than a typical hotel and green space around you.',
        },
        {
          title: 'Seasonal availability',
          copy: 'Bungalow bookings depend on the season and current availability.',
        },
      ],
      cta: {
        title: 'Choose a bungalow and confirm availability',
        copy:
          'Check indicative prices, then send an enquiry to reception for your selected dates.',
        primaryLabel: 'Check prices',
        primaryHref: '/cennik',
        secondaryLabel: 'Ask about a bungalow',
        secondaryHref: '/kontakt',
      },
    },
    cennik: {
      slug: 'cennik',
      overline: 'Camping Clepardia prices',
      title: 'Check the estimated cost of your stay',
      lead:
        'Choose dates, stay type and extras - the calculator will show an indicative price before you send an enquiry.',
      seoTitle: 'Camping Clepardia prices - motorhomes, tents and bungalows',
      seoDescription:
        'Check indicative prices for Camping Clepardia in Krakow. Cost calculator for motorhomes, tents, caravans and bungalows.',
      highlights: [
        {
          title: 'Indicative price',
          copy: 'Prices are indicative and may need confirmation by reception.',
        },
        {
          title: 'Summer season',
          copy: 'Camping pitch reservations may be limited in the summer season.',
        },
        {
          title: 'Seasonal bungalows',
          copy: 'Bungalows have separate low and high season prices.',
        },
        {
          title: 'Availability',
          copy: 'Final availability is confirmed by reception.',
        },
      ],
      cta: {
        title: 'Confirm your dates with reception',
        copy:
          'The calculator helps estimate your stay quickly. Reception confirms final availability and booking details.',
        primaryLabel: 'Ask about availability',
        primaryHref: '/kontakt',
        secondaryLabel: 'View bungalows',
        secondaryHref: '/domki',
      },
    },
    dojazd: {
      slug: 'dojazd',
      overline: 'Directions to Camping Clepardia',
      title: 'Leave your car or camper and take the tram to the centre',
      lead:
        'Camping Clepardia is located in Krakow at Henryka Pachońskiego 28A. The easiest way to reach the city centre is by tram.',
      seoTitle: 'Directions to Camping Clepardia - Krakow',
      seoDescription:
        'See how to get to Camping Clepardia and how to reach Krakow city centre conveniently by tram.',
      highlights: [
        { title: 'Address', copy: 'Henryka Pachońskiego 28A, 31-322 Krakow.' },
        {
          title: 'Tram close to the campsite',
          copy: 'The most convenient way to reach the city centre.',
        },
        {
          title: 'Old Town',
          copy: 'Easy access towards Stary Kleparz and the centre.',
        },
        {
          title: 'A Krakow base',
          copy: 'A convenient base for visiting Krakow without parking in the strict centre.',
        },
      ],
      cta: {
        title: 'Arrive comfortably',
        copy: 'Check prices and plan a stay with simple access to the centre.',
        primaryLabel: 'View prices',
        primaryHref: '/cennik',
        secondaryLabel: 'Contact',
        secondaryHref: '/kontakt',
      },
    },
    atrakcje: {
      slug: 'atrakcje',
      overline: 'Nearby attractions',
      title: 'Explore Krakow and Małopolska from Camping Clepardia',
      lead:
        'Stay in a green part of Krakow and easily head to the city centre, Wieliczka, Ojców, Energylandia and other regional highlights.',
      seoTitle: 'Attractions in Krakow and Małopolska - Camping Clepardia',
      seoDescription:
        'Discover attractions near Camping Clepardia: the Old Town, Wieliczka, Energylandia, Ojców and family trips around Małopolska.',
      highlights: [
        {
          title: 'Krakow without parking stress',
          copy:
            'Your car, camper or caravan can stay at the campsite while you reach the centre by tram.',
        },
        {
          title: 'Małopolska within reach',
          copy:
            'Wieliczka, Ojców, Energylandia and Zakopane are easy to plan as trips from Krakow.',
        },
        {
          title: 'Stay plan',
          copy:
            'One base lets you combine city sightseeing, history, nature and family attractions.',
        },
      ],
      cta: {
        title: 'Plan your Krakow stay with Camping Clepardia',
        copy:
          'Check prices, ask about availability and see how easy it is to reach the city centre.',
        primaryLabel: 'Check prices',
        primaryHref: '/cennik',
        secondaryLabel: 'How to get here',
        secondaryHref: '/dojazd',
      },
    },
    kontakt: {
      slug: 'kontakt',
      overline: 'Contact and reservations',
      title: 'Ask about stay availability',
      lead:
        'Tell us when you want to arrive - Camping Clepardia reception will confirm availability and stay details.',
      seoTitle: 'Contact and reservations - Camping Clepardia Krakow',
      seoDescription:
        'Contact Camping Clepardia reception in Krakow. Ask about camping pitches, bungalows, prices and stay details.',
      highlights: [
        {
          title: 'Summer season',
          copy: 'Camping pitch reservations may be limited in June, July and August.',
        },
        { title: 'Bungalows', copy: 'Bungalows have separate availability.' },
        {
          title: 'Confirmation',
          copy: 'Final price and availability are confirmed by reception.',
        },
        {
          title: 'Fastest contact',
          copy: 'The fastest contact method is phone or email.',
        },
      ],
      cta: {
        title: 'Write to reception',
        copy: 'Complete the form or use phone and email contact.',
        primaryLabel: 'Prices',
        primaryHref: '/cennik',
        secondaryLabel: 'Camping',
        secondaryHref: '/camping',
      },
    },
    faq: {
      slug: 'faq',
      overline: 'FAQ',
      title: 'Frequently asked questions',
      lead:
        'We have collected the most important information about stays, bookings, prices, directions and rules at Camping Clepardia.',
      seoTitle: 'Camping Clepardia FAQ - questions and answers',
      seoDescription:
        'Frequently asked questions about Camping Clepardia: bookings, prices, check-in, bungalows, camping, directions, dogs and facilities.',
      highlights: [
        {
          title: 'Pitch availability',
          copy: 'In season it is worth confirming camping pitch availability with reception.',
        },
        {
          title: 'Getting to the centre',
          copy: 'It is easiest to use the tram and leave your car at the campsite.',
        },
        {
          title: 'Staying with a dog',
          copy: 'Dogs are 0 PLN, but it is worth confirming stay details before arrival.',
        },
      ],
      cta: {
        title: 'Have another question?',
        copy: 'Check prices or contact reception and describe your stay plan.',
        primaryLabel: 'Check prices',
        primaryHref: '/cennik',
        secondaryLabel: 'Ask reception',
        secondaryHref: '/kontakt',
      },
    },
    galeria: {
      slug: 'galeria',
      overline: 'Gallery',
      title: 'See Camping Clepardia',
      lead: 'Photos of the campsite, bungalows, surroundings and guest facilities.',
      seoTitle: 'Camping Clepardia gallery - campsite and bungalow photos',
      seoDescription:
        'View the Camping Clepardia gallery in Krakow: camping, bungalows, sanitary facilities, transport, surroundings and attractions.',
      highlights: [
        {
          title: 'Camping',
          copy: 'Space for photos of pitches, motorhomes, tents and infrastructure.',
        },
        {
          title: 'Bungalows',
          copy: 'Space for exterior, interior and terrace photos.',
        },
        {
          title: 'Krakow',
          copy: 'Space for transport, surroundings and regional attractions.',
        },
      ],
      cta: {
        title: 'See the place and ask about availability',
        copy:
          'Check indicative prices or send an enquiry to Camping Clepardia reception.',
        primaryLabel: 'Check prices',
        primaryHref: '/cennik',
        secondaryLabel: 'Ask about availability',
        secondaryHref: '/kontakt',
      },
    },
    'dla-kamperow': {
      slug: 'dla-kamperow',
      overline: 'For motorhomes',
      title: 'Camping in Krakow for motorhomes, vans and caravans',
      lead:
        'Stay in a green part of Krakow, leave your vehicle at the campsite and head to the centre conveniently by tram.',
      seoTitle: 'Camping for motorhomes in Krakow - Camping Clepardia',
      seoDescription:
        'Pitches for motorhomes, vans and caravans in Krakow. Camping Clepardia close to the city centre.',
      highlights: [
        {
          title: 'Close to Krakow',
          copy: 'A convenient base for sightseeing without parking near the Old Town.',
        },
        {
          title: 'For different vehicles',
          copy: 'Spaces for motorhomes, vans, caravans and cars with rooftop tents.',
        },
        {
          title: 'Electricity and facilities',
          copy: 'Electric hook-up, sanitary facilities and practical amenities on site.',
        },
        {
          title: 'Transport to the centre',
          copy: 'It is easiest to leave the vehicle at the campsite and take the tram.',
        },
      ],
      cta: {
        title: 'Calculate your motorhome stay cost',
        copy:
          'Check the indicative cost of your stay and contact reception about availability for your dates.',
        primaryLabel: 'Calculate stay cost',
        primaryHref: '/cennik',
        secondaryLabel: 'Ask about availability',
        secondaryHref: '/kontakt',
      },
    },
    'dla-rodzin': {
      slug: 'dla-rodzin',
      overline: 'For families',
      title: 'A family stay in Krakow with a camping atmosphere',
      lead:
        'Camping Clepardia is a convenient base for families who want to explore Krakow and relax in a calmer green space.',
      seoTitle: 'Family camping in Krakow - Camping Clepardia',
      seoDescription:
        'A family stay in Krakow with a camping atmosphere. Bungalows, camping, green space and easy access to the centre and Małopolska attractions.',
      highlights: [
        {
          title: 'Close to Krakow city centre',
          copy: 'Easy tram access to the centre without parking stress near the Old Town.',
        },
        {
          title: 'Green space',
          copy: 'After sightseeing you can return to a calmer place outside the strict centre.',
        },
        {
          title: 'Bungalows for families',
          copy:
            'A practical option for families who do not travel by camper or tent.',
        },
        {
          title: 'Trip base',
          copy: 'A good start for Wieliczka, Energylandia, Ojców and other Małopolska attractions.',
        },
      ],
      cta: {
        title: 'Plan a family stay in Krakow',
        copy:
          'Check prices, ask about availability and view attractions that are easy to plan from Camping Clepardia.',
        primaryLabel: 'Check prices',
        primaryHref: '/cennik',
        secondaryLabel: 'Ask about availability',
        secondaryHref: '/kontakt',
      },
    },
  },
  home: {
    hero: {
      badge: 'Premium camping in Krakow',
      title: 'Camping Clepardia',
      subtitle: 'Camping in Krakow close to the city centre',
      copy:
        'A green base for motorhomes, caravans, tents and comfortable bungalows. Stay calmly and reach the Old Town by tram.',
      primary: 'Check availability',
      secondary: 'View prices',
      badges: ['Close to Krakow centre', 'Camping + bungalows', 'Tram to the centre', 'Mister Camping 2024'],
      benefits: ['Near the centre', 'Tram to the Old Town', 'Motorhomes, tents and bungalows'],
      scroll: 'Scroll',
    },
    stats: [
      { value: 'Krakow', label: 'Close to the centre', copy: 'A calm base with access to city attractions.' },
      { value: 'Tram', label: 'Nearby stop', copy: 'Comfortable access to the Old Town.' },
      { value: '2 modes', label: 'Camping + bungalows', copy: 'Choose your style of stay.' },
      { value: 'Region', label: 'Małopolska base', copy: 'Wieliczka, Ojców and Energylandia within reach.' },
    ],
    why: {
      overline: 'A green base in Krakow',
      title: 'Why Camping Clepardia?',
      lead:
        'Green space in Krakow, a convenient sightseeing base and quick access to the centre without parking stress.',
      benefits: [
        {
          title: 'Close to Krakow centre',
          copy: 'Quick tram access to the Old Town without searching for parking in the centre.',
        },
        {
          title: 'Spaces for motorhomes and caravans',
          copy:
            'A convenient base for travellers with a motorhome, van, caravan or rooftop tent.',
        },
        {
          title: 'Bungalows for guests',
          copy:
            'A comfortable accommodation option for guests who want to stay in Krakow without their own camping gear.',
        },
        {
          title: 'Green surroundings',
          copy: 'A calmer space to rest after a full day of sightseeing in Krakow and Małopolska.',
        },
        {
          title: 'Good facilities',
          copy: 'Sanitary facilities, tourist kitchens, electricity, laundry and essentials for the road.',
        },
        {
          title: 'Great trip base',
          copy:
            'A convenient start for visiting Krakow, Wieliczka, Ojców, Energylandia and other regional attractions.',
        },
      ],
    },
    trust: {
      overline: 'Trust',
      title: 'A place chosen by guests who want to explore Krakow their own way.',
      cards: [
        {
          title: 'Mister Camping 2024',
          copy: 'A distinction that builds confidence for guests planning their stay.',
        },
        {
          title: 'High guest rating',
          copy: 'Guests value the location, atmosphere and comfort of the stay.',
        },
        {
          title: 'Family atmosphere',
          copy: 'A camping rhythm without anonymous hotel distance.',
        },
        {
          title: 'Years of experience',
          copy: 'A proven base for travellers visiting Krakow.',
        },
      ],
    },
  },
  content: {
    infoKicker: 'Information',
    infoTitle: 'Key information before arrival',
    pricingQuickAria: 'Key price information',
    highSeason: 'High season',
    lowSeason: 'Low season',
    remainingDates: 'other dates',
    dog: 'Dog',
    free: 'free',
    confirm: 'to confirm',
    electricity: 'Electricity',
    contactAria: 'Camping Clepardia contact details',
    contactCards: {
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      receptionHours: 'Reception hours',
    },
    bungalowKicker: 'Bungalow prices',
    bungalowTitle: 'Bungalow types',
    bungalowCopy:
      'Bungalow prices depend on season and stay configuration. A family bungalow requires availability and final price confirmation by reception.',
    lowSeasonLabel: 'low season',
    highSeasonLabel: 'high season',
    priceFromLabel: 'price from',
    bungalowConfirm: 'Availability and final price are confirmed by reception.',
    seasonNote: 'High season: {range}. Low season: other season dates.',
    pricingGuidanceKicker: 'Important before booking',
    pricingGuidanceTitle: 'Key information',
    contactGuidanceKicker: 'Before sending an enquiry',
    contactGuidanceTitle: 'What is worth knowing?',
  },
  pricing: {
    title: 'Price calculator',
    kicker: 'Stay calculator',
    lead:
      'The calculator counts nights, stay type, people and extras. Final availability and booking terms are confirmed by reception.',
    formAria: 'Camping Clepardia price calculator',
    dates: 'Stay dates',
    arrival: 'Arrival date',
    departure: 'Departure date',
    nightsLabel: 'Nights',
    stayType: 'Stay type',
    from: 'from',
    perNight: 'night',
    summerNotice:
      'In the summer season, camping pitch reservations may be limited. Contact reception about availability.',
    familyNotice:
      'The family bungalow price depends on configuration and requires confirmation by reception.',
    people: 'People',
    adults: 'Adults',
    children: 'Children 4-14',
    toddlers: 'Children under 4',
    extras: 'Extras',
    summary: 'Summary',
    total: 'Total',
    term: 'Dates',
    season: 'Season',
    pricePerNight: 'Price per night',
    toComplete: 'To complete',
    noAddons: 'None',
    noPeople: 'No people',
    lowSeason: 'Low season',
    highSeason: 'High season',
    mixedSeason: 'Mixed season',
    confirmPrice: 'to confirm',
    summaryFootnote:
      'This is an indicative calculation. Reception confirms availability, season and stay details.',
    familyFootnote:
      'For a family bungalow, the calculator shows an indicative value from the base price. Availability and final price are confirmed by reception.',
    mobileTotal: 'Stay total',
    increment: 'Increase',
    decrement: 'Decrease',
    night: {
      one: '1 night',
      other: '{count} nights',
    },
    stayTypes: {
      camper: 'Motorhome',
      caravan: 'Caravan',
      van: 'Van',
      car: 'Car',
      'tent-small': 'Tent 1-2 pers.',
      'tent-large': 'Tent 3-4 pers.',
      'rooftop-tent': 'Car + rooftop tent',
      bus: 'Bus',
      'bungalow-2': '2-person bungalow',
      'bungalow-3': '3-person bungalow',
      'bungalow-4': '4-person bungalow',
      'bungalow-family': 'Family bungalow',
    },
    addons: {
      electricity: 'Electricity',
      dog: 'Dog',
      motorcycle: 'Motorcycle',
      'cargo-trailer': 'Cargo trailer',
      bus: 'Bus',
      parking: 'Parking',
      'extra-car': 'Extra car',
    },
  },
  form: {
    kicker: 'Reservation enquiry form',
    title: 'Send the details of your planned stay',
    lead:
      'The more information you provide right away, the faster reception can confirm date availability and the best stay option.',
    data: 'Details',
    fullName: 'Full name',
    email: 'Email',
    phone: 'Phone',
    country: 'Country',
    contactLanguage: 'Contact language',
    dates: 'Dates',
    arrival: 'Arrival date',
    departure: 'Departure date',
    nights: 'Nights',
    completeDates: 'Complete the dates',
    stayType: 'Stay type',
    people: 'People',
    adults: 'Adults',
    children: 'Children 4-14',
    toddlers: 'Children under 4',
    extras: 'Extras',
    message: 'Message',
    messagePlaceholder:
      'Write what you need: arrival time, equipment type, bungalow questions or additional information.',
    consent: 'I agree to be contacted back about my enquiry.',
    submit: 'Send enquiry',
    summary: 'Enquiry summary',
    summaryEmpty: 'Complete the form and your enquiry summary will appear here.',
    term: 'Dates',
    countrySummary: 'Country',
    language: 'Language',
    season: 'Season',
    noAddons: 'None',
    noPeople: 'No people',
    toComplete: 'To complete',
    summerSeason: 'Summer season',
    outsideSummer: 'Outside the main summer season',
    summerNotice:
      'In the summer season, camping pitch reservations may be limited. Reception will confirm availability in response to your enquiry.',
    success:
      'Your enquiry has been prepared. In the next stage we will connect sending to Camping Clepardia reception.',
    errorHeading: 'Please correct the form:',
    validation: {
      fullName: 'Enter your full name.',
      email: 'Enter your email address.',
      emailFormat: 'Enter a valid email address.',
      arrival: 'Enter the arrival date.',
      departure: 'Enter the departure date.',
      departureAfterArrival: 'Departure date must be after arrival date.',
      stayType: 'Choose a stay type.',
      consent: 'Accept contact back about your enquiry.',
    },
    mailTitle: 'Camping Clepardia reservation enquiry',
    mailLabels: {
      fullName: 'Full name',
      email: 'Email',
      phone: 'Phone',
      country: 'Country',
      notProvided: 'not provided',
      contactLanguage: 'Contact language',
      term: 'Dates',
      nights: 'Nights',
      stayType: 'Stay type',
      adults: 'Adults',
      children: 'Children 4-14',
      toddlers: 'Children under 4',
      addons: 'Extras',
      none: 'none',
      summerNotice: 'Summer notice',
      notApplicable: 'not applicable',
      message: 'Message',
    },
  },
} as const;
