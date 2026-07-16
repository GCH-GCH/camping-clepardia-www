const ROUTE_META = [
  { id: 'classic', icon: '🏰', accent: 'emerald', transportKey: 'city', tags: ['classic'], mapQuery: 'Rynek Główny Wawel Kraków' },
  { id: 'district', icon: '✨', accent: 'amber', transportKey: 'district', tags: ['history', 'food'], mapQuery: 'Kazimierz Kraków' },
  { id: 'trip', icon: '🧭', accent: 'blue', transportKey: 'trip', tags: ['trip'], mapQuery: 'Wieliczka Poland' },
  { id: 'nature', icon: '🌲', accent: 'forest', transportKey: 'nature', tags: ['nature'], mapQuery: 'Ojców National Park' },
  { id: 'relax', icon: '🌿', accent: 'mint', transportKey: 'relax', tags: ['kids', 'relax'], mapQuery: 'Park Wodny Kraków' },
];

const INTEREST_TO_ROUTE = {
  classic: 0,
  history: 1,
  food: 1,
  tours: 2,
  nature: 3,
  kids: 4,
};

const GROUP_ROUTE_ORDER = {
  pair: [1, 3, 4, 2],
  family: [4, 3, 1, 2],
  solo: [3, 1, 2, 4],
  group: [2, 1, 4, 3],
};

const ACCENT_FALLBACK = ['emerald', 'amber', 'blue', 'forest', 'mint'];
const TRIP_DISTANCES = { wieliczka:'≈ 15 km', auschwitz:'≈ 70 km', ojcow:'≈ 25 km', energylandia:'≈ 50 km' };

export const escapePlannerHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
}[character]));

const asArray = (value) => value instanceof Set ? [...value] : Array.isArray(value) ? value : [];

const safeLink = (value, fallback = '#') => {
  const link = String(value || '');
  return /^(https?:\/\/|\/)/.test(link) ? link : fallback;
};

const unique = (items) => [...new Set(items.filter((value) => Number.isInteger(value) && value >= 0 && value < ROUTE_META.length))];

export const plannerNightsNumber = (value) => value === '5+' ? 5 : Math.min(5, Math.max(1, Number(value || 1)));

export const nextPlannerNights = (value) => {
  const current = plannerNightsNumber(value);
  return current >= 4 ? '5+' : String(current + 1);
};

const selectRouteIndexes = (state, nights) => {
  const interests = asArray(state.interests);
  const selected = [0];

  interests.forEach((interest) => selected.push(INTEREST_TO_ROUTE[interest]));
  if (state.children === 'yes' || state.group === 'family') selected.push(4);
  if (state.trip && state.trip !== 'none') selected.push(2);
  selected.push(...(GROUP_ROUTE_ORDER[state.group] || GROUP_ROUTE_ORDER.pair));
  selected.push(0, 1, 2, 3, 4);

  const ordered = unique(selected);
  if (state.trip && state.trip !== 'none' && nights >= 3) {
    const withoutTrip = ordered.filter((index) => index !== 2);
    withoutTrip.splice(Math.min(2, withoutTrip.length), 0, 2);
    return withoutTrip.slice(0, nights);
  }
  return ordered.slice(0, nights);
};

const tripLabel = (config, state) => config.tripList?.find(([value]) => value === state.trip)?.[1] || '';

const weatherStatusText = (config, state) => {
  if (state.weatherStatus === 'ready') return config.weatherReady;
  if (state.weatherStatus === 'later') return config.weatherLater;
  if (state.weatherStatus === 'unavailable') return config.weatherUnavailable;
  if (state.weatherStatus === 'loading') return config.premium.loadingWeather;
  return config.weatherNeutral;
};

const routeTransport = (config, state, routeIndex) => {
  const modes = config.premium.transportModes;
  if (routeIndex === 2) return state.transport === 'car' ? modes.tripCar : modes.tripOrganised;
  if (routeIndex === 3 && state.transport !== 'car') return modes.natureMixed;
  return modes[state.transport] || modes.tram;
};

const weatherForDay = (state, dayIndex) => {
  const day = Array.isArray(state.weatherDays) ? state.weatherDays[dayIndex] : null;
  if (!day) return null;
  const min = Number(day.temperatureMinC);
  const max = Number(day.temperatureMaxC);
  const rain = Number(day.rainProbability);
  return {
    date: day.date || '',
    temperatureMinC: Number.isFinite(min) ? Math.round(min) : null,
    temperatureMaxC: Number.isFinite(max) ? Math.round(max) : null,
    rainProbability: Number.isFinite(rain) ? Math.round(rain) : null,
  };
};

const mapQueryForDay = (routeIndex, state, selectedTrip) => {
  if (routeIndex !== 2 || state.trip === 'none') return ROUTE_META[routeIndex].mapQuery;
  return `${selectedTrip} Poland`;
};

const personalisedTimeline = (config, state, route, routeIndex) => {
  const p = config.premium;
  const isFamily = state.children === 'yes' || state.group === 'family';
  const morning = route.morning;
  const midday = `${route.noon}${state.pace === 'calm' ? ` ${p.paceAdjustments.calm}` : state.pace === 'intensive' ? ` ${p.paceAdjustments.intensive}` : ''}`;
  let evening = route.evening;
  if (isFamily && routeIndex !== 2) evening = `${evening} ${p.familyEvening}`;
  if (state.group === 'pair' && routeIndex < 2) evening = `${evening} ${p.coupleEvening}`;
  return { morning, midday, evening };
};

const daySubtitle = (config, state, routeIndex) => {
  const p = config.premium;
  const base = p.routeSubtitles[routeIndex] || '';
  if (state.children === 'yes' || state.group === 'family') return `${base} ${p.subtitleNotes.family}`;
  if (state.group === 'pair') return `${base} ${p.subtitleNotes.pair}`;
  if (state.group === 'solo') return `${base} ${p.subtitleNotes.solo}`;
  return `${base} ${p.subtitleNotes.group}`;
};

const practicalTips = (config, state, routeIndex) => {
  const p = config.premium;
  const tips = [p.routeTips[routeIndex], p.groupTips[state.group] || p.groupTips.pair, p.transportTips[state.transport] || p.transportTips.tram];
  if (state.children === 'yes') tips.splice(1, 0, p.childrenTip);
  if (state.pace === 'intensive') tips.push(p.intensiveTip);
  return tips.filter(Boolean);
};

const formatWeatherBadge = (weather) => {
  if (!weather || weather.temperatureMinC === null || weather.temperatureMaxC === null) return '';
  const rain = weather.rainProbability === null ? '' : ` · ${weather.rainProbability}% 🌧️`;
  return `${weather.temperatureMinC}–${weather.temperatureMaxC}°C${rain}`;
};

const formatNights = (config, value) => {
  const nights = plannerNightsNumber(value);
  const units = config.premium.nightUnits || [config.nights,config.nights,config.nights];
  const unit = nights === 1 ? units[0] : nights >= 2 && nights <= 4 ? units[1] : units[2];
  return `${value === '5+' ? '5+' : nights} ${unit}`;
};

export function buildPlannerModel(config, rawState) {
  if (!config?.premium || !Array.isArray(config.routes) || config.routes.length < 5) {
    throw new Error('PLANNER_CONFIG_INVALID');
  }

  const state = {
    nights: '2',
    pace: 'normal',
    group: 'pair',
    children: 'no',
    transport: 'tram',
    weather: 'flexible',
    trip: 'none',
    startDate: '',
    interests: [],
    weatherStatus: 'neutral',
    weatherDays: [],
    ...rawState,
  };
  const p = config.premium;
  const nights = plannerNightsNumber(state.nights);
  const selectedTrip = tripLabel(config, state);
  const indexes = selectRouteIndexes(state, nights);
  const groupKey = state.children === 'yes' ? 'family' : state.group;

  const days = indexes.map((routeIndex, dayIndex) => {
    const route = config.routes[routeIndex];
    const meta = ROUTE_META[routeIndex];
    const timeline = personalisedTimeline(config, state, route, routeIndex);
    const weather = weatherForDay(state, dayIndex);
    const mapQuery = mapQueryForDay(routeIndex, state, selectedTrip);
    const title = routeIndex === 2 && selectedTrip ? `${route.title} · ${selectedTrip}` : route.title;
    const isFamily = state.children === 'yes' || state.group === 'family';
    const distance = routeIndex === 2 && TRIP_DISTANCES[state.trip] ? TRIP_DISTANCES[state.trip] : p.distances[routeIndex] || p.distances[0];

    return {
      dayNumber: dayIndex + 1,
      routeIndex,
      title,
      subtitle: daySubtitle(config, state, routeIndex),
      intensity: `${p.tempoLabel}: ${config.intensity[state.pace] || config.intensity.normal}`,
      morning: timeline.morning,
      midday: timeline.midday,
      evening: timeline.evening,
      transport: routeTransport(config, state, routeIndex),
      duration: route.duration,
      distance,
      weatherAlternative: route.rain,
      familyNote: isFamily ? p.familyNotes[routeIndex] : '',
      restNote: config.paceNotes[state.pace] || config.paceNotes.normal,
      practicalTips: practicalTips(config, state, routeIndex),
      mapLinks: {
        maps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`,
        transport: safeLink(config.links?.transport),
        attraction: safeLink(config.links?.attractions),
        trip: safeLink(config.links?.tours, 'https://qr.codes/vksKBT'),
      },
      weather,
      weatherBadge: formatWeatherBadge(weather),
      transportIcon: routeIndex >= 2 && state.transport !== 'car' ? '🚌' : state.transport === 'car' ? '🚗' : '🚋',
      icon: meta.icon,
      accent: meta.accent || ACCENT_FALLBACK[routeIndex],
      isTrip: routeIndex === 2,
    };
  });

  const nextNights = nextPlannerNights(state.nights);
  const currentLabel = formatNights(config, state.nights);
  const nextLabel = formatNights(config, nextNights);
  const interestNames = asArray(state.interests)
    .map((value) => config.interestsList?.find(([key]) => key === value)?.[1])
    .filter(Boolean);

  return {
    language: config.language || 'pl',
    nights,
    nightsValue: state.nights,
    group: state.group,
    days,
    hero: {
      eyebrow: p.heroEyebrow,
      title: p.heroTitles[groupKey] || p.heroTitles.pair,
      subtitle: p.heroSubtitle,
      summary: `${config.groupNotes[groupKey] || config.groupNotes.pair} ${config.paceNotes[state.pace] || config.paceNotes.normal}`,
      chips: [
        { icon: '🌙', label: currentLabel },
        { icon: '👥', label: config.options[groupKey] || config.options[state.group] },
        { icon: state.transport === 'car' ? '🚗' : '🚋', label: config.options[state.transport] },
        { icon: '🌿', label: `${p.tempoLabel}: ${config.options[state.pace]}` },
      ],
      interestSummary: interestNames.length ? interestNames.join(' · ') : p.flexibleInterests,
      weatherSummary: weatherStatusText(config, state),
    },
    rainPlan: {
      title: p.rainPlanTitle,
      copy: state.weatherStatus === 'ready' ? p.rainPlanForecastCopy : p.rainPlanBackupCopy,
      items: days.map((day) => ({ dayNumber: day.dayNumber, title: day.title, value: day.weatherAlternative })),
    },
    upsell: {
      visible: state.nights !== '5+',
      title: config.upsell.title,
      copy: state.nights === '5+' ? config.upsell.max : config.upsell.copy,
      currentLabel,
      nextLabel,
      currentTitle: p.upsellCurrent,
      nextTitle: p.upsellLonger,
      currentBenefit: p.upsellCurrentBenefits[Math.max(0, nights - 1)] || p.upsellCurrentBenefits[4],
      nextBenefits: p.upsellNextBenefits[Math.min(4, nights)] || p.upsellNextBenefits[4],
      addLabel: config.upsell.add,
      previewLabel: `${config.upsell.check} · ${nextLabel}`,
      bookingLabel: p.addToEnquiry,
      askCampyLabel: config.ctaCampy,
      bookingHref: safeLink(config.links?.booking),
      nextNights,
    },
    labels: {
      day: p.dayLabel,
      timeline: p.timelineTitle,
      morning: config.labels.morning,
      midday: config.labels.noon,
      evening: config.labels.evening,
      practical: p.practicalTitle,
      transport: config.labels.transport,
      duration: config.labels.duration,
      distance: config.labels.distance,
      rain: config.labels.rain,
      family: p.familyLabel,
      rest: p.restLabel,
      tips: p.tipsLabel,
      plan: config.dayPlan,
      openMaps: p.openMaps,
      tramRoute: p.tramRoute,
      attraction: p.seeAttraction,
      trip: p.checkTrip,
      askCampy: config.ctaCampy,
    },
  };
}

const timelineItem = (icon, label, value, period) => `
  <article class="planner-timeline__item planner-timeline__item--${period}">
    <span class="planner-timeline__icon" aria-hidden="true">${icon}</span>
    <div>
      <span class="planner-timeline__label">${escapePlannerHtml(label)}</span>
      <p class="planner-timeline__value">${escapePlannerHtml(value)}</p>
    </div>
  </article>`;

const practicalItem = (icon, label, value) => `
  <div class="planner-practical__item">
    <span aria-hidden="true">${icon}</span>
    <div><span class="planner-practical__label">${escapePlannerHtml(label)}</span><strong class="planner-practical__value">${escapePlannerHtml(value)}</strong></div>
  </div>`;

const renderDayCard = (day, labels, index) => `
  <article class="stay-planner__day-card planner-day-card planner-day-card--${escapePlannerHtml(day.accent)}" data-planner-day-card style="--planner-card-index:${index}">
    <header class="planner-day-card__header">
      <span class="planner-day-card__number" aria-label="${escapePlannerHtml(labels.day)} ${day.dayNumber}">${day.dayNumber}</span>
      <span class="planner-day-card__icon" aria-hidden="true">${day.icon}</span>
      <div class="planner-day-card__heading">
        <span class="planner-day-card__eyebrow">${escapePlannerHtml(labels.day)} ${day.dayNumber}</span>
        <h3>${escapePlannerHtml(day.title)}</h3>
        <p>${escapePlannerHtml(day.subtitle)}</p>
      </div>
      <span class="planner-day-card__intensity">${escapePlannerHtml(day.intensity)}</span>
    </header>
    ${day.weatherBadge ? `<span class="planner-day-card__weather">🌤️ ${escapePlannerHtml(day.weatherBadge)}</span>` : ''}
    <section class="planner-timeline" aria-label="${escapePlannerHtml(labels.timeline)}">
      <h4>${escapePlannerHtml(labels.timeline)}</h4>
      <div class="planner-timeline__rail">
        ${timelineItem('🌅', labels.morning, day.morning, 'morning')}
        ${timelineItem('☀️', labels.midday, day.midday, 'midday')}
        ${timelineItem('🌆', labels.evening, day.evening, 'evening')}
      </div>
    </section>
    <section class="planner-practical" aria-label="${escapePlannerHtml(labels.practical)}">
      <h4>${escapePlannerHtml(labels.practical)}</h4>
      <div class="planner-practical__grid">
        ${practicalItem(day.transportIcon, labels.transport, day.transport)}
        ${practicalItem('⏱️', labels.duration, day.duration)}
        ${practicalItem('📏', labels.distance, day.distance)}
      </div>
    </section>
    <div class="planner-day-card__notes">
      ${day.familyNote ? `<article class="planner-note planner-note--family"><span aria-hidden="true">👨‍👩‍👧</span><div><strong>${escapePlannerHtml(labels.family)}</strong><p>${escapePlannerHtml(day.familyNote)}</p></div></article>` : ''}
      <article class="planner-note planner-note--rest"><span aria-hidden="true">🌿</span><div><strong>${escapePlannerHtml(labels.rest)}</strong><p>${escapePlannerHtml(day.restNote)}</p></div></article>
      <article class="planner-note planner-note--tips"><span aria-hidden="true">💡</span><div><strong>${escapePlannerHtml(labels.tips)}</strong><ul>${day.practicalTips.map((tip) => `<li>${escapePlannerHtml(tip)}</li>`).join('')}</ul></div></article>
    </div>
    <div class="planner-day-card__actions">
      <a href="${escapePlannerHtml(day.mapLinks.maps)}" target="_blank" rel="noopener noreferrer">🗺️ ${escapePlannerHtml(labels.openMaps)}</a>
      ${day.isTrip ? `<a href="${escapePlannerHtml(day.mapLinks.trip)}" target="_blank" rel="noopener noreferrer">🎟️ ${escapePlannerHtml(labels.trip)}</a>` : `<a href="${escapePlannerHtml(day.mapLinks.attraction)}">✨ ${escapePlannerHtml(labels.attraction)}</a>`}
      <a href="${escapePlannerHtml(day.mapLinks.transport)}">🚋 ${escapePlannerHtml(labels.tramRoute)}</a>
      <button type="button" data-planner-campy-day="${day.dayNumber}">🤖 ${escapePlannerHtml(labels.askCampy)}</button>
    </div>
  </article>`;

export function renderPlannerHtml(model) {
  const { hero, labels, days, rainPlan, upsell } = model;
  return `
    <div class="planner-result-shell" data-planner-result-shell>
      <header class="planner-result-hero">
        <div class="planner-result-hero__glow" aria-hidden="true"></div>
        <span class="stay-planner__result-badge">${escapePlannerHtml(hero.eyebrow)}</span>
        <h2>${escapePlannerHtml(hero.title)}</h2>
        <p class="planner-result-hero__subtitle">${escapePlannerHtml(hero.subtitle)}</p>
        <div class="planner-result-hero__chips">${hero.chips.map((chip) => `<span><span aria-hidden="true">${chip.icon}</span>${escapePlannerHtml(chip.label)}</span>`).join('')}</div>
        <p class="planner-result-hero__summary">${escapePlannerHtml(hero.summary)}</p>
        <div class="planner-result-hero__signals"><span>✨ ${escapePlannerHtml(hero.interestSummary)}</span><span>🌤️ ${escapePlannerHtml(hero.weatherSummary)}</span></div>
      </header>
      <section class="stay-planner__plan" aria-labelledby="plannerDayHeading">
        <div class="stay-planner__plan-heading"><span>🧭</span><div><small>${escapePlannerHtml(labels.plan)}</small><h3 id="plannerDayHeading">${escapePlannerHtml(hero.title)}</h3></div><strong data-planner-days-count>${days.length}</strong></div>
        <div class="stay-planner__day-list">${days.map((day, index) => renderDayCard(day, labels, index)).join('')}</div>
      </section>
      <section class="planner-rain-plan">
        <header><span aria-hidden="true">🌧️</span><div><h3>${escapePlannerHtml(rainPlan.title)}</h3><p>${escapePlannerHtml(rainPlan.copy)}</p></div></header>
        <div class="planner-rain-plan__grid">${rainPlan.items.map((item) => `<article><span>${escapePlannerHtml(labels.day)} ${item.dayNumber}</span><strong>${escapePlannerHtml(item.title)}</strong><p>${escapePlannerHtml(item.value)}</p></article>`).join('')}</div>
      </section>
      <section class="stay-planner__upsell ${upsell.visible ? '' : 'is-max'}">
        <span class="stay-planner__upsell-icon" aria-hidden="true">🌿</span>
        <div class="stay-planner__upsell-head"><h3>${escapePlannerHtml(upsell.title)}</h3><p>${escapePlannerHtml(upsell.copy)}</p></div>
        ${upsell.visible ? `<div class="stay-planner__upsell-compare">
          <article><small>${escapePlannerHtml(upsell.currentTitle)}</small><strong>${escapePlannerHtml(upsell.currentLabel)}</strong><p>${escapePlannerHtml(upsell.currentBenefit)}</p></article>
          <span aria-hidden="true">→</span>
          <article class="is-better"><small>${escapePlannerHtml(upsell.nextTitle)}</small><strong>${escapePlannerHtml(upsell.nextLabel)}</strong><ul>${upsell.nextBenefits.map((benefit) => `<li>${escapePlannerHtml(benefit)}</li>`).join('')}</ul></article>
        </div>
        <div class="stay-planner__upsell-actions"><button type="button" data-planner-add-night>${escapePlannerHtml(upsell.addLabel)}</button><button type="button" data-planner-preview-night>${escapePlannerHtml(upsell.previewLabel)}</button><a href="${escapePlannerHtml(upsell.bookingHref)}">${escapePlannerHtml(upsell.bookingLabel)}</a><button type="button" data-planner-campy-upsell>${escapePlannerHtml(upsell.askCampyLabel)}</button></div>` : ''}
      </section>
    </div>`;
}

export function renderPlannerSkeleton(config, cards = 2, text) {
  const loadingText = text || config?.premium?.loading || '';
  const safeCards = Math.min(5, Math.max(1, Number(cards || 2)));
  return `
    <div class="planner-skeleton" role="status" aria-live="polite">
      <div class="planner-skeleton__status"><span aria-hidden="true"></span><strong>${escapePlannerHtml(loadingText)}</strong></div>
      <div class="planner-skeleton__hero"><i></i><i></i><i></i></div>
      ${Array.from({ length: safeCards }, (_, index) => `<article class="planner-skeleton__card" style="--planner-card-index:${index}"><div><i></i><i></i></div><i></i><i></i><div><i></i><i></i><i></i></div></article>`).join('')}
    </div>`;
}
