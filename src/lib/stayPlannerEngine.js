const ROUTE_META = [
  { id:'classic', icon:'♜', accent:'emerald', tags:['classic'], mapQuery:'Rynek Główny Wawel Kraków' },
  { id:'district', icon:'✦', accent:'amber', tags:['history','food'], mapQuery:'Kazimierz Kraków' },
  { id:'trip', icon:'△', accent:'blue', tags:['trip'], mapQuery:'Wieliczka Poland' },
  { id:'nature', icon:'⌁', accent:'forest', tags:['nature'], mapQuery:'Ojców National Park' },
  { id:'relax', icon:'♧', accent:'mint', tags:['kids','relax'], mapQuery:'Park Wodny Kraków' },
];

const INTEREST_ROUTE_ORDER = {
  classic:[0,1],
  history:[1,0],
  kids:[4,0],
  nature:[3,0],
  food:[1,4],
  tours:[2,0],
};
const GROUP_ROUTE_ORDER = {
  pair:[1,3,4,2],
  family:[4,3,1,2],
  solo:[3,1,2,4],
  group:[2,1,4,3],
};
const TRIP_DISTANCES = { wieliczka:'≈ 15 km', auschwitz:'≈ 70 km', ojcow:'≈ 25 km', energylandia:'≈ 50 km' };

export const escapePlannerHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;',
}[character]));

const asArray = (value) => value instanceof Set ? [...value] : Array.isArray(value) ? value : [];
const safeLink = (value, fallback = '#') => /^(https?:\/\/|\/)/.test(String(value || '')) ? String(value) : fallback;
const unique = (items) => [...new Set(items.filter((value) => Number.isInteger(value) && value >= 0 && value < ROUTE_META.length))];

export const plannerNightsNumber = (value) => value === '5+' ? 5 : Math.min(5, Math.max(1, Number(value || 1)));
export const nextPlannerNights = (value) => {
  const current = plannerNightsNumber(value);
  return current >= 4 ? '5+' : String(current + 1);
};
export const previousPlannerNights = (value) => String(Math.max(1, plannerNightsNumber(value) - 1));

const selectRouteIndexes = (state, nights) => {
  const interests = asArray(state.interests);
  const selected = interests.length ? [] : [0];
  interests.forEach((interest) => selected.push(...(INTEREST_ROUTE_ORDER[interest] || [])));
  if (state.children === 'yes' && state.group !== 'family') selected.unshift(4);
  else if (state.children === 'yes' || state.group === 'family') selected.push(4);
  if (state.trip && state.trip !== 'none') selected.push(2);
  selected.push(...(GROUP_ROUTE_ORDER[state.group] || GROUP_ROUTE_ORDER.pair),0,1,2,3,4);
  const ordered = unique(selected);
  if (state.trip && state.trip !== 'none' && nights >= 3) {
    const withoutTrip = ordered.filter((index) => index !== 2);
    withoutTrip.splice(Math.min(2,withoutTrip.length),0,2);
    return withoutTrip.slice(0,nights);
  }
  return ordered.slice(0,nights);
};

const tripLabel = (config, state) => config.tripList?.find(([value]) => value === state.trip)?.[1] || '';
const routeTransport = (config, state, routeIndex) => {
  const modes = config.premium.transportModes;
  if (routeIndex === 2) return state.transport === 'car' ? modes.tripCar : modes.tripOrganised;
  if (routeIndex === 3 && state.transport !== 'car') return modes.natureMixed;
  return modes[state.transport] || modes.tram;
};

const weatherForDay = (state, dayIndex) => {
  const day = Array.isArray(state.weatherDays) ? state.weatherDays[dayIndex] : null;
  if (!day) return null;
  const numberOrNull = (value) => Number.isFinite(Number(value)) ? Math.round(Number(value)) : null;
  return {
    date:day.date || '',
    weatherCode:numberOrNull(day.weatherCode),
    temperatureMinC:numberOrNull(day.temperatureMinC),
    temperatureMaxC:numberOrNull(day.temperatureMaxC),
    rainProbability:numberOrNull(day.rainProbability),
  };
};

const weatherGroup = (code) => {
  if (code === 0) return 'clear';
  if ([1,2].includes(code)) return 'mostlyClear';
  if (code === 3) return 'cloudy';
  if ([45,48].includes(code)) return 'fog';
  if ([51,53,55,56,57].includes(code)) return 'drizzle';
  if ([61,63,65,66,67,80,81,82].includes(code)) return 'rain';
  if ([71,73,75,77,85,86].includes(code)) return 'snow';
  if ([95,96,99].includes(code)) return 'storm';
  return 'cloudy';
};

const weatherIcon = (group) => ({ clear:'☀️', mostlyClear:'🌤️', cloudy:'☁️', fog:'🌫️', drizzle:'🌦️', rain:'🌧️', snow:'🌨️', storm:'⛈️' }[group] || '☁️');
const mapQueryForDay = (routeIndex, state, selectedTrip) => routeIndex === 2 && state.trip !== 'none' ? `${selectedTrip} Poland` : ROUTE_META[routeIndex].mapQuery;

const personalisedTimeline = (config, state, route, routeIndex) => {
  const p = config.premium;
  const isFamily = state.children === 'yes' || state.group === 'family';
  let midday = route.noon;
  let evening = route.evening;
  if (state.pace === 'calm') midday = `${midday} ${p.paceAdjustments.calm}`;
  if (state.pace === 'intensive') midday = `${midday} ${p.paceAdjustments.intensive}`;
  if (isFamily && routeIndex !== 2) evening = `${evening} ${p.familyEvening}`;
  if (state.group === 'pair' && routeIndex < 2) evening = `${evening} ${p.coupleEvening}`;
  return { morning:route.morning, midday, evening };
};

const daySubtitle = (config, state, routeIndex) => {
  const p = config.premium;
  const base = p.routeSubtitles[routeIndex] || '';
  const key = state.children === 'yes' || state.group === 'family' ? 'family' : state.group;
  return `${base} ${p.subtitleNotes[key] || p.subtitleNotes.pair}`.trim();
};

const practicalTips = (config, state, routeIndex) => {
  const p = config.premium;
  const tips = [p.routeTips[routeIndex],p.groupTips[state.group] || p.groupTips.pair,p.transportTips[state.transport] || p.transportTips.tram];
  if (state.children === 'yes') tips.splice(1,0,p.childrenTip);
  if (state.pace === 'intensive') tips.push(p.intensiveTip);
  return tips.filter(Boolean);
};

const compactText = (value, limit = 82) => {
  const text = String(value || '').replace(/\s+/g,' ').trim();
  if (text.length <= limit) return text;
  const sliced = text.slice(0,limit - 1);
  const breakAt = Math.max(sliced.lastIndexOf('.'),sliced.lastIndexOf(','),sliced.lastIndexOf(' '));
  return `${sliced.slice(0,breakAt > limit * .62 ? breakAt : limit - 1).replace(/[,. ]+$/,'')}…`;
};

const addDays = (iso, days) => {
  if (!iso) return '';
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0,10);
};

const formatDate = (iso, locale, options) => {
  if (!iso) return '';
  try { return new Intl.DateTimeFormat(locale || 'pl-PL',{ timeZone:'UTC',...options }).format(new Date(`${iso}T12:00:00Z`)); }
  catch { return iso; }
};

const formatNights = (config, value) => {
  const nights = plannerNightsNumber(value);
  const units = config.premium.nightUnits || [config.nights,config.nights,config.nights];
  const unit = nights === 1 ? units[0] : nights >= 2 && nights <= 4 ? units[1] : units[2];
  return `${value === '5+' ? '5+' : nights} ${unit}`;
};

const weatherMessage = (config, state) => {
  const d = config.dashboard;
  if (state.weatherStatus === 'later') return d.weatherLater;
  if (state.weatherStatus === 'unavailable') return d.weatherUnavailable;
  if (state.weatherStatus === 'loading') return config.premium.loadingWeather;
  return d.weatherEmpty;
};

export function buildPlannerModel(config, rawState = {}) {
  if (!config?.premium || !config?.dashboard || !Array.isArray(config.routes) || config.routes.length < 5) throw new Error('PLANNER_CONFIG_INVALID');
  const state = {
    nights:'2', pace:'normal', group:'family', children:'yes', transport:'tram', weather:'flexible', trip:'none', startDate:'', interests:[], weatherStatus:'neutral', weatherDays:[],
    ...rawState,
  };
  const d = config.dashboard;
  const p = config.premium;
  const nights = plannerNightsNumber(state.nights);
  const selectedTrip = tripLabel(config,state);
  const indexes = selectRouteIndexes(state,nights);
  const groupKey = state.children === 'yes' ? 'family' : state.group;
  const departureDate = addDays(state.startDate,nights);
  const dateRange = state.startDate
    ? `${formatDate(state.startDate,config.locale,{day:'2-digit',month:'short'})} – ${formatDate(departureDate,config.locale,{day:'2-digit',month:'short'})}`
    : d.chooseDate;

  const days = indexes.map((routeIndex,dayIndex) => {
    const route = config.routes[routeIndex];
    const meta = ROUTE_META[routeIndex];
    const timeline = personalisedTimeline(config,state,route,routeIndex);
    const weather = weatherForDay(state,dayIndex);
    const mapQuery = mapQueryForDay(routeIndex,state,selectedTrip);
    const title = routeIndex === 2 && selectedTrip ? `${route.title} · ${selectedTrip}` : route.title;
    const isFamily = state.children === 'yes' || state.group === 'family';
    let planB = route.rain;
    if (state.weather === 'sun') planB = `${route.rain} · ${config.options.sun}`;
    if (state.weather === 'indoor') planB = `${route.rain} · ${config.options.indoor}`;
    return {
      dayNumber:dayIndex + 1,
      routeIndex,
      title,
      subtitle:daySubtitle(config,state,routeIndex),
      intensity:`${p.tempoLabel}: ${config.intensity[state.pace] || config.intensity.normal}`,
      morning:timeline.morning,
      midday:timeline.midday,
      evening:timeline.evening,
      morningShort:compactText(timeline.morning),
      middayShort:compactText(timeline.midday),
      eveningShort:compactText(timeline.evening),
      transport:routeTransport(config,state,routeIndex),
      duration:route.duration,
      distance:routeIndex === 2 && TRIP_DISTANCES[state.trip] ? TRIP_DISTANCES[state.trip] : p.distances[routeIndex] || p.distances[0],
      weatherAlternative:planB,
      planBShort:compactText(planB,54),
      familyNote:isFamily ? p.familyNotes[routeIndex] : '',
      restNote:config.paceNotes[state.pace] || config.paceNotes.normal,
      practicalTips:practicalTips(config,state,routeIndex),
      mapLinks:{
        maps:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`,
        transport:safeLink(config.links?.transport),
        attraction:safeLink(config.links?.attractions),
        trip:safeLink(config.links?.tours,'https://qr.codes/vksKBT'),
      },
      weather,
      transportIcon:routeIndex >= 2 && state.transport !== 'car' ? '🚌' : state.transport === 'car' ? '🚗' : state.transport === 'mixed' ? '🚲' : '🚋',
      icon:meta.icon,
      accent:meta.accent,
      isTrip:routeIndex === 2,
      image:safeLink(config.assets?.days?.[routeIndex] || config.assets?.hero),
    };
  });

  const weatherDays = state.weatherStatus === 'ready' ? days.filter((day) => day.weather).map((day) => {
    const group = weatherGroup(day.weather.weatherCode);
    return {
      dayNumber:day.dayNumber,
      date:formatDate(day.weather.date,config.locale,{weekday:'short',day:'2-digit',month:'2-digit'}),
      icon:weatherIcon(group),
      temperature:day.weather.temperatureMaxC === null ? '—' : `${day.weather.temperatureMaxC}°C`,
      description:config.weatherConditions?.[group] || group,
      rain:day.weather.rainProbability === null ? '—' : `${day.weather.rainProbability}%`,
    };
  }) : [];

  const paceLabel = state.pace === 'intensive' ? d.active : state.pace === 'calm' ? d.veryCalm : d.calm;
  const transportLabel = state.transport === 'mixed' ? d.walkBike : config.options[state.transport];
  const groupLabel = config.options[groupKey] || config.options[state.group];

  return {
    language:config.language || 'pl',
    nights,
    nightsValue:state.nights,
    state:{ ...state, interests:asArray(state.interests) },
    days,
    hero:{
      eyebrow:p.heroEyebrow,
      title:p.heroTitles[groupKey] || p.heroTitles.pair,
      subtitle:p.heroSubtitle,
      image:safeLink(config.assets?.hero),
      brand:safeLink(config.assets?.brand),
      stats:[
        { icon:'▣', label:d.nightsDates, value:`${formatNights(config,state.nights)} · ${dateRange}` },
        { icon:'♧', label:d.groupTile, value:groupLabel },
        { icon:state.transport === 'car' ? '🚗' : state.transport === 'mixed' ? '🚲' : '🚋', label:d.transportTile, value:transportLabel },
        { icon:'⌁', label:d.paceTile, value:paceLabel },
      ],
    },
    weather:{ status:state.weatherStatus, title:d.weatherTitle, message:weatherMessage(config,state), days:weatherDays, details:d.weatherDetails, less:d.weatherLess, rainLabel:d.weatherRain },
    quickActions:{
      title:d.quickTitle,
      maps:{ label:d.quickMaps, hint:d.quickMapsHint, href:safeLink(config.links?.maps) },
      tram:{ label:d.quickTram, hint:d.quickTramHint, href:safeLink(config.links?.transport) },
      transport:state.transport === 'tram'
        ? { icon:'tram', label:d.quickTram, hint:d.quickTramHint, href:safeLink(config.links?.transport) }
        : state.transport === 'car'
          ? { icon:'car', label:config.options.car, hint:d.quickMapsHint, href:safeLink(config.links?.maps) }
          : { icon:'bike', label:d.walkBike, hint:d.quickMapsHint, href:safeLink(config.links?.maps) },
      tickets:{ label:d.quickTickets, hint:d.quickTicketsHint, href:safeLink(config.links?.attractions) },
      campy:{ label:d.quickCampy, hint:d.quickCampyHint, icon:safeLink(config.assets?.campy) },
      save:{ label:d.quickSave, hint:d.quickSaveHint },
      mail:{ label:d.quickMail, hint:d.quickMailHint },
    },
    upsell:{
      visible:state.nights !== '5+',
      title:d.upsellTitle,
      copy:state.nights === '5+' ? d.upsellMax : d.upsellCopy,
      benefits:d.upsellBenefits,
      addLabel:d.upsellAdd,
      nextNights:nextPlannerNights(state.nights),
      image:safeLink(config.assets?.camp),
    },
    summer:{ title:d.summerTitle, bullets:d.summerBullets, disclaimer:d.summerDisclaimer },
    labels:{
      day:p.dayLabel,
      morning:config.labels.morning,
      midday:config.labels.noon,
      evening:config.labels.evening,
      transport:config.labels.transport,
      duration:config.labels.duration,
      distance:config.labels.distance,
      rain:config.labels.rain,
      details:d.dayDetails,
      previousDays:d.previousDays,
      nextDays:d.nextDays,
      daysRange:d.daysRange,
      modalClose:d.modalClose,
      modalSchedule:d.modalSchedule,
      modalPractical:d.modalPractical,
      modalPlanB:d.modalPlanB,
      modalTips:d.modalTips,
      modalLinks:d.modalLinks,
      openMaps:p.openMaps,
      tramRoute:p.tramRoute,
      attraction:p.seeAttraction,
      trip:p.checkTrip,
    },
  };
}

export const renderPlannerHero = (hero) => `<header class="planner-hero" data-planner-hero>
  <img class="planner-hero__image" src="${escapePlannerHtml(hero.image)}" alt="" width="1280" height="853" loading="eager" decoding="async">
  <div class="planner-hero__content">
    <span class="planner-hero__badge">★ ${escapePlannerHtml(hero.eyebrow)}</span>
    <h2>${escapePlannerHtml(hero.title)}</h2>
    <p class="planner-hero__subtitle">${escapePlannerHtml(hero.subtitle)}</p>
    <div class="planner-hero__stats">${hero.stats.map((stat) => `<div class="planner-hero__stat"><span aria-hidden="true">${stat.icon}</span><div><small>${escapePlannerHtml(stat.label)}</small><strong>${escapePlannerHtml(stat.value)}</strong></div></div>`).join('')}</div>
  </div>
  <div class="planner-hero__brand" aria-hidden="true"><img src="${escapePlannerHtml(hero.brand)}" alt=""><span>⛺</span></div>
</header>`;

export const renderPlannerWeather = (weather) => `<section class="planner-weather" data-planner-weather-strip>
  <h3>${escapePlannerHtml(weather.title)}</h3>
  ${weather.days.length ? `<div class="planner-weather__days">${weather.days.map((day) => `<article class="planner-weather__day"><span aria-hidden="true">${day.icon}</span><div><strong>${escapePlannerHtml(day.date)}</strong><small>${escapePlannerHtml(day.temperature)}</small></div><div><p>${escapePlannerHtml(day.description)}</p><em>${escapePlannerHtml(weather.rainLabel)}: ${escapePlannerHtml(day.rain)}</em></div></article>`).join('')}</div>` : `<p class="planner-weather__empty">${escapePlannerHtml(weather.message)}</p>`}
  <button class="planner-weather__toggle" type="button" data-planner-weather-details aria-expanded="false"><span>${escapePlannerHtml(weather.details)}</span><b aria-hidden="true">→</b></button>
</section>`;

const renderDayCard = (day, labels, index) => `<article class="planner-day-card planner-day-card--${escapePlannerHtml(day.accent)}" data-planner-day-card data-planner-day="${day.dayNumber}" style="--planner-card-index:${index}">
  <header class="planner-day-card__head"><span class="planner-day-card__number">${day.dayNumber}</span><div><small>${escapePlannerHtml(labels.day)} ${day.dayNumber}</small><h3>${escapePlannerHtml(day.title)}</h3></div><span class="planner-day-card__icon" aria-hidden="true">${day.icon}</span></header>
  <div class="planner-day-card__times">
    <article class="planner-day-card__time"><span>🌅 ${escapePlannerHtml(labels.morning)}</span><p>${escapePlannerHtml(day.morningShort)}</p></article>
    <article class="planner-day-card__time"><span>☀️ ${escapePlannerHtml(labels.midday)}</span><p>${escapePlannerHtml(day.middayShort)}</p></article>
    <article class="planner-day-card__time"><span>🌙 ${escapePlannerHtml(labels.evening)}</span><p>${escapePlannerHtml(day.eveningShort)}</p></article>
  </div>
  <div class="planner-day-card__practical">
    <div><span aria-hidden="true">${day.transportIcon}</span><div><small>${escapePlannerHtml(labels.transport)}</small><strong>${escapePlannerHtml(compactText(day.transport,26))}</strong></div></div>
    <div><span aria-hidden="true">◷</span><div><small>${escapePlannerHtml(labels.duration)}</small><strong>${escapePlannerHtml(day.duration)}</strong></div></div>
    <div><span aria-hidden="true">☂</span><div><small>${escapePlannerHtml(labels.rain)}</small><strong>${escapePlannerHtml(day.planBShort)}</strong></div></div>
  </div>
  <button class="planner-day-card__details" type="button" data-planner-day-details="${day.dayNumber}">${escapePlannerHtml(labels.details)} <span aria-hidden="true">→</span></button>
</article>`;

const quickItem = (icon, action, attributes = '') => `<${action.href ? 'a' : 'button'} class="planner-quick__item" ${action.href ? `href="${escapePlannerHtml(action.href)}" ${action.href.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}` : 'type="button"'} ${attributes}><span class="planner-quick__icon">${icon}</span><span><strong>${escapePlannerHtml(action.label)}</strong><small>${escapePlannerHtml(action.hint)}</small></span></${action.href ? 'a' : 'button'}>`;

export function renderPlannerDayCards(model) {
  const { days,labels } = model;
  const visible = Math.min(3,days.length);
  return `<section class="planner-days" data-planner-days data-planner-total-days="${days.length}" style="--planner-visible:${visible}">
    <div class="planner-days__toolbar">
      <button type="button" data-planner-days-prev aria-label="${escapePlannerHtml(labels.previousDays)}">&larr;</button>
      <span class="planner-days__indicator" data-planner-days-indicator aria-label="${escapePlannerHtml(labels.daysRange)}"></span>
      <button type="button" data-planner-days-next aria-label="${escapePlannerHtml(labels.nextDays)}">&rarr;</button>
    </div>
    <div class="planner-days__viewport" data-planner-days-viewport><div class="planner-days__track" data-planner-days-track>${days.map((day,index) => renderDayCard(day,labels,index)).join('')}</div></div>
  </section>`;
}

export const renderPlannerQuickActions = (quickActions) => {
  const transportIcons = { tram:'&#128651;', car:'&#128663;', bike:'&#128690;' };
  return `<section class="planner-quick" aria-label="${escapePlannerHtml(quickActions.title)}">
    ${quickItem('&#8982;',quickActions.maps)}
    ${quickItem(transportIcons[quickActions.transport.icon] || transportIcons.tram,quickActions.transport)}
    ${quickItem('&#127915;',quickActions.tickets)}
    ${quickItem(`<img src="${escapePlannerHtml(quickActions.campy.icon)}" alt="">`,quickActions.campy,'data-planner-campy')}
    ${quickItem('&#9635;',quickActions.save,'data-planner-save')}
    ${quickItem('&#9993;',quickActions.mail,'data-planner-mail')}
  </section>`;
};

export const renderPlannerUpsell = (upsell) => `<article class="planner-upsell ${upsell.visible ? '' : 'is-max'}">
  <img class="planner-upsell__image" src="${escapePlannerHtml(upsell.image)}" alt="" width="1280" height="720" loading="lazy" decoding="async">
  <div class="planner-upsell__content"><h3>${escapePlannerHtml(upsell.title)}</h3><p>${escapePlannerHtml(upsell.copy)}</p><div class="planner-upsell__benefits">${upsell.benefits.map((benefit,index) => `<span><b aria-hidden="true">${['&#10087;','&#10022;','&#9728;'][index]}</b>${escapePlannerHtml(benefit)}</span>`).join('')}</div><button type="button" data-planner-add-night>&#65291; ${escapePlannerHtml(upsell.addLabel)} &rarr;</button></div>
</article>`;

export const renderPlannerSummer = (summer) => `<article class="planner-summer"><h3>&#9728; ${escapePlannerHtml(summer.title)}</h3><ul>${summer.bullets.map((item) => `<li>${escapePlannerHtml(item)}</li>`).join('')}</ul><small>${escapePlannerHtml(summer.disclaimer)}</small></article>`;

export function renderPlannerHtml(model) {
  const { hero,weather,days,labels,quickActions,upsell,summer } = model;
  const visible = Math.min(3,days.length);
  return `<div class="planner-result-shell" data-planner-result-shell>
    ${renderPlannerHero(hero)}
    ${renderPlannerWeather(weather)}
    <section class="planner-days" data-planner-days data-planner-total-days="${days.length}" style="--planner-visible:${visible}">
      <div class="planner-days__toolbar">
        <button type="button" data-planner-days-prev aria-label="${escapePlannerHtml(labels.previousDays)}">←</button>
        <span class="planner-days__indicator" data-planner-days-indicator aria-label="${escapePlannerHtml(labels.daysRange)}"></span>
        <button type="button" data-planner-days-next aria-label="${escapePlannerHtml(labels.nextDays)}">→</button>
      </div>
      <div class="planner-days__viewport" data-planner-days-viewport><div class="planner-days__track" data-planner-days-track>${days.map((day,index) => renderDayCard(day,labels,index)).join('')}</div></div>
    </section>
    <section class="planner-quick" aria-label="${escapePlannerHtml(quickActions.title)}">
      ${quickItem('⌖',quickActions.maps)}
      ${quickItem('🚋',quickActions.tram)}
      ${quickItem('🎟',quickActions.tickets)}
      ${quickItem(`<img src="${escapePlannerHtml(quickActions.campy.icon)}" alt="">`,quickActions.campy,'data-planner-campy')}
      ${quickItem('▣',quickActions.save,'data-planner-save')}
      ${quickItem('✉',quickActions.mail,'data-planner-mail')}
    </section>
    <section class="planner-bottom">
      <article class="planner-upsell ${upsell.visible ? '' : 'is-max'}">
        <img class="planner-upsell__image" src="${escapePlannerHtml(upsell.image)}" alt="" width="1280" height="720" loading="lazy" decoding="async">
        <div class="planner-upsell__content"><h3>${escapePlannerHtml(upsell.title)}</h3><p>${escapePlannerHtml(upsell.copy)}</p><div class="planner-upsell__benefits">${upsell.benefits.map((benefit,index) => `<span><b aria-hidden="true">${['⌁','✦','☀'][index]}</b>${escapePlannerHtml(benefit)}</span>`).join('')}</div><button type="button" data-planner-add-night>＋ ${escapePlannerHtml(upsell.addLabel)} →</button></div>
      </article>
      <article class="planner-summer"><h3>☀ ${escapePlannerHtml(summer.title)}</h3><ul>${summer.bullets.map((item) => `<li>${escapePlannerHtml(item)}</li>`).join('')}</ul><small>${escapePlannerHtml(summer.disclaimer)}</small></article>
    </section>
    <dialog class="planner-dialog" data-planner-modal aria-modal="true"><div data-planner-modal-content></div></dialog>
  </div>`;
}

export function renderPlannerDayModal(day, labels) {
  if (!day) return '';
  return `<div class="planner-dialog__inner">
    <button class="planner-dialog__close" type="button" data-planner-modal-close aria-label="${escapePlannerHtml(labels.modalClose)}">×</button>
    <header class="planner-dialog__hero"><img src="${escapePlannerHtml(day.image)}" alt="" width="1280" height="853"><div><span>${escapePlannerHtml(labels.day)} ${day.dayNumber} · ${escapePlannerHtml(day.intensity)}</span><h2>${escapePlannerHtml(day.title)}</h2></div></header>
    <div class="planner-dialog__body">
      <section class="planner-dialog__section"><h3>${escapePlannerHtml(labels.modalSchedule)}</h3><div class="planner-dialog__timeline">
        <article><span>🌅</span><div><b>${escapePlannerHtml(labels.morning)}</b><p>${escapePlannerHtml(day.morning)}</p></div></article>
        <article><span>☀️</span><div><b>${escapePlannerHtml(labels.midday)}</b><p>${escapePlannerHtml(day.midday)}</p></div></article>
        <article><span>🌙</span><div><b>${escapePlannerHtml(labels.evening)}</b><p>${escapePlannerHtml(day.evening)}</p></div></article>
      </div></section>
      <div>
        <section class="planner-dialog__section"><h3>${escapePlannerHtml(labels.modalPractical)}</h3><div class="planner-dialog__facts"><span>${day.transportIcon} ${escapePlannerHtml(day.transport)}</span><span>◷ ${escapePlannerHtml(day.duration)}</span><span>⌖ ${escapePlannerHtml(day.distance)}</span><span>⌁ ${escapePlannerHtml(day.restNote)}</span></div></section>
        <section class="planner-dialog__section"><h3>${escapePlannerHtml(labels.modalPlanB)}</h3><p>${escapePlannerHtml(day.weatherAlternative)}</p></section>
      </div>
      <section class="planner-dialog__section"><h3>${escapePlannerHtml(labels.modalTips)}</h3><ul>${day.practicalTips.map((tip) => `<li>${escapePlannerHtml(tip)}</li>`).join('')}</ul></section>
      <section class="planner-dialog__section"><h3>${escapePlannerHtml(labels.modalLinks)}</h3><div class="planner-dialog__links"><a href="${escapePlannerHtml(day.mapLinks.maps)}" target="_blank" rel="noopener noreferrer">⌖ ${escapePlannerHtml(labels.openMaps)}</a><a href="${escapePlannerHtml(day.mapLinks.transport)}">🚋 ${escapePlannerHtml(labels.tramRoute)}</a><a href="${escapePlannerHtml(day.isTrip ? day.mapLinks.trip : day.mapLinks.attraction)}" ${day.isTrip ? 'target="_blank" rel="noopener noreferrer"' : ''}>✦ ${escapePlannerHtml(day.isTrip ? labels.trip : labels.attraction)}</a></div></section>
    </div>
  </div>`;
}

export function renderPlannerSkeleton(config, cards = 2, text) {
  const loadingText = text || config?.premium?.loading || '';
  const safeCards = Math.min(3,Math.max(1,Number(cards || 2)));
  return `<div class="planner-skeleton" role="status" aria-live="polite">
    <div class="planner-skeleton__status"><span aria-hidden="true"></span><strong>${escapePlannerHtml(loadingText)}</strong></div>
    <div class="planner-skeleton__hero"></div><div class="planner-skeleton__weather"></div>
    <div class="planner-skeleton__cards">${Array.from({ length:safeCards },() => '<article class="planner-skeleton__card"></article>').join('')}</div>
  </div>`;
}
