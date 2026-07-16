import {
  buildPlannerModel,
  nextPlannerNights,
  plannerNightsNumber,
  renderPlannerHtml,
  renderPlannerSkeleton,
} from '@/lib/stayPlannerEngine.js';

const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const decodeConfig = (encoded) => {
  try {
    const binary = window.atob(encoded || '');
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
};

export function initStayPlanner() {
  const root = document.querySelector('[data-stay-planner]');
  if (!(root instanceof HTMLElement) || root.dataset.plannerReady === 'true') return;

  const config = decodeConfig(root.dataset.plannerConfig);
  const result = root.querySelector('[data-planner-result]');
  if (!config || !(result instanceof HTMLElement)) return;

  root.dataset.plannerReady = 'true';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const state = {
    nights: '2',
    pace: 'normal',
    group: 'family',
    children: 'yes',
    transport: 'tram',
    weather: 'flexible',
    trip: 'none',
    startDate: '',
    interests: new Set(['classic', 'history']),
    weatherStatus: 'neutral',
    weatherDays: [],
  };

  let currentModel = null;
  let transitionSequence = 0;
  let weatherSequence = 0;
  let heightTimer = 0;

  const track = (eventType, metadata = {}) => window.dispatchEvent(new CustomEvent('cc:analytics', {
    detail: { eventType, metadata },
  }));

  const setActive = (selector, value) => root.querySelectorAll(`${selector} button`).forEach((button) => {
    if (button instanceof HTMLButtonElement) button.classList.toggle('is-active', button.dataset.value === value);
  });

  const pulseSelection = (button) => {
    if (!(button instanceof HTMLElement) || reducedMotion.matches) return;
    button.classList.remove('is-selecting');
    void button.offsetWidth;
    button.classList.add('is-selecting');
    window.setTimeout(() => button.classList.remove('is-selecting'), 360);
  };

  const resizeResultTo = (height) => {
    window.clearTimeout(heightTimer);
    result.style.height = `${Math.max(240, height)}px`;
    heightTimer = window.setTimeout(() => {
      result.style.height = 'auto';
    }, 720);
  };

  const renderNow = ({ animate = true } = {}) => {
    currentModel = buildPlannerModel(config, state);
    result.innerHTML = renderPlannerHtml(currentModel);
    result.classList.remove('is-exiting', 'is-loading');
    result.classList.toggle('is-entering', animate && !reducedMotion.matches);
    if (animate && !reducedMotion.matches) {
      window.setTimeout(() => result.classList.remove('is-entering'), 780);
    }
    return currentModel;
  };

  const transitionPlan = async (loadingText = config.premium.loading) => {
    const sequence = ++transitionSequence;
    if (reducedMotion.matches) {
      renderNow({ animate: false });
      result.style.height = 'auto';
      return;
    }

    const previousHeight = Math.max(result.offsetHeight, result.scrollHeight);
    result.style.height = `${previousHeight}px`;
    result.classList.add('is-exiting');
    await wait(170);
    if (sequence !== transitionSequence) return;

    result.classList.remove('is-exiting');
    result.classList.add('is-loading');
    result.innerHTML = renderPlannerSkeleton(config, plannerNightsNumber(state.nights), loadingText);
    requestAnimationFrame(() => resizeResultTo(result.scrollHeight));
    await wait(380);
    if (sequence !== transitionSequence) return;

    renderNow({ animate: true });
    requestAnimationFrame(() => resizeResultTo(result.scrollHeight));
  };

  const bindSegment = (selector, key) => {
    const buttons = [...root.querySelectorAll(`${selector} button`)];
    buttons.forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) return;
      button.addEventListener('click', () => {
        buttons.forEach((item) => item.classList.toggle('is-active', item === button));
        state[key] = button.dataset.value || state[key];
        pulseSelection(button);
        if (key === 'nights') {
          track('planner_change_nights', { nights: state.nights, source: 'controls' });
          if (state.startDate) {
            loadWeather();
            return;
          }
        }
        transitionPlan();
      });
    });
  };

  bindSegment('[data-planner-nights]', 'nights');
  bindSegment('[data-planner-pace]', 'pace');
  bindSegment('[data-planner-group]', 'group');
  bindSegment('[data-planner-children]', 'children');
  bindSegment('[data-planner-transport]', 'transport');
  bindSegment('[data-planner-weather]', 'weather');

  const interestButtons = [...root.querySelectorAll('[data-planner-interests] button')];
  interestButtons.forEach((button) => button.addEventListener('click', () => {
    const value = button.dataset.value || '';
    button.classList.toggle('is-active');
    if (button.classList.contains('is-active')) state.interests.add(value);
    else state.interests.delete(value);
    pulseSelection(button);
    transitionPlan();
  }));

  const tripButtons = [...root.querySelectorAll('[data-planner-trips] button')];
  tripButtons.forEach((button) => button.addEventListener('click', () => {
    tripButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    state.trip = button.dataset.value || 'none';
    pulseSelection(button);
    transitionPlan();
  }));

  const addDays = (iso, days) => {
    const date = new Date(`${iso}T12:00:00`);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  };

  const loadWeather = async () => {
    const sequence = ++weatherSequence;
    state.weatherDays = [];
    if (!state.startDate) {
      state.weatherStatus = 'neutral';
      transitionPlan();
      return;
    }

    state.weatherStatus = 'loading';
    transitionPlan(config.premium.loadingWeather);
    try {
      const end = addDays(state.startDate, plannerNightsNumber(state.nights));
      const response = await fetch(`/api/weather?start=${encodeURIComponent(state.startDate)}&end=${encodeURIComponent(end)}`, {
        headers: { accept: 'application/json' },
      });
      const payload = await response.json();
      if (sequence !== weatherSequence) return;
      if (!payload?.ok) throw new Error('WEATHER_UNAVAILABLE');
      state.weatherDays = Array.isArray(payload.daily) ? payload.daily : [];
      state.weatherStatus = payload.forecastInRange && state.weatherDays.length ? 'ready' : 'later';
    } catch {
      if (sequence !== weatherSequence) return;
      state.weatherStatus = 'unavailable';
    }
    transitionPlan();
  };

  const dateInput = root.querySelector('[data-planner-date]');
  if (dateInput instanceof HTMLInputElement) {
    dateInput.min = new Date().toISOString().slice(0, 10);
    dateInput.addEventListener('change', () => {
      state.startDate = dateInput.value;
      loadWeather();
    });
  }

  root.querySelectorAll('[data-planner-scenario]').forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;
    button.addEventListener('click', () => {
      state.nights = button.dataset.nights || '2';
      state.pace = button.dataset.pace || 'normal';
      state.group = button.dataset.group || 'family';
      state.transport = button.dataset.transport || 'tram';
      state.children = state.group === 'family' ? 'yes' : 'no';
      state.interests = new Set((button.dataset.interests || 'classic').split(',').filter(Boolean));
      setActive('[data-planner-nights]', state.nights);
      setActive('[data-planner-pace]', state.pace);
      setActive('[data-planner-group]', state.group);
      setActive('[data-planner-children]', state.children);
      setActive('[data-planner-transport]', state.transport);
      interestButtons.forEach((item) => item.classList.toggle('is-active', state.interests.has(item.dataset.value || '')));
      pulseSelection(button);
      track('planner_generate', { source: 'scenario', nights: state.nights, pace: state.pace, group: state.group });
      if (state.startDate) loadWeather();
      else transitionPlan();
      if (window.innerWidth < 980) window.setTimeout(() => result.scrollIntoView({ behavior: 'smooth', block: 'start' }), 180);
    });
  });

  root.querySelector('[data-planner-generate]')?.addEventListener('click', () => {
    track('planner_generate', {
      source: 'button',
      nights: state.nights,
      pace: state.pace,
      group: state.group,
      transport: state.transport,
      weather: state.weather,
      trip: state.trip,
    });
    transitionPlan();
    if (window.innerWidth < 980) window.setTimeout(() => result.scrollIntoView({ behavior: 'smooth', block: 'start' }), 180);
  });

  const addNight = (source) => {
    if (state.nights === '5+') return;
    state.nights = nextPlannerNights(state.nights);
    setActive('[data-planner-nights]', state.nights);
    track('planner_add_night', { nights: state.nights, source });
    track('planner_change_nights', { nights: state.nights, source: 'upsell' });
    if (state.startDate) loadWeather();
    else transitionPlan();
  };

  const askCampy = (extra = '') => {
    const selectedTrip = config.tripList.find(([value]) => value === state.trip)?.[1] || '';
    const prompt = `${config.campyPlannerPrompt} ${config.nights}: ${state.nights}; ${config.pace}: ${config.options[state.pace]}; ${config.group}: ${config.options[state.group]}; ${config.transport}: ${config.options[state.transport]}; ${config.trips}: ${selectedTrip}. ${extra}`.trim();
    window.dispatchEvent(new CustomEvent('campy:prompt', { detail: { prompt, actionKey: 'stayLength' } }));
  };

  result.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('button') : null;
    if (!(target instanceof HTMLButtonElement)) return;
    if (target.matches('[data-planner-add-night]')) addNight('add');
    if (target.matches('[data-planner-preview-night]')) addNight('preview');
    if (target.matches('[data-planner-campy-upsell]')) askCampy(config.upsell.copy);
    if (target.matches('[data-planner-campy-day]')) {
      const dayNumber = Number(target.dataset.plannerCampyDay || 0);
      const day = currentModel?.days?.find((item) => item.dayNumber === dayNumber);
      askCampy(day ? `${config.premium.dayLabel} ${day.dayNumber}: ${day.title}.` : '');
    }
  });

  root.querySelector('[data-ask-campy-planner]')?.addEventListener('click', () => askCampy());
  renderNow({ animate: false });
}
