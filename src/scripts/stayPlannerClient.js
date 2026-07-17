import {
  buildPlannerModel,
  nextPlannerNights,
  plannerNightsNumber,
  previousPlannerNights,
  renderPlannerDayModal,
  renderPlannerHtml,
  renderPlannerSkeleton,
} from '@/lib/stayPlannerEngine.js';

const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve,milliseconds));

const decodeConfig = (encoded) => {
  try {
    const binary = window.atob(encoded || '');
    const bytes = Uint8Array.from(binary,(character) => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch { return null; }
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
    nights:'2', pace:'normal', group:'family', children:'yes', transport:'tram', weather:'flexible', trip:'none', startDate:'',
    interests:new Set(['classic','history']), weatherStatus:'neutral', weatherDays:[],
  };
  let currentModel = null;
  let transitionSequence = 0;
  let weatherSequence = 0;
  let heightTimer = 0;
  let toastTimer = 0;
  let carouselStart = 0;
  let carouselRefresh = () => {};
  let lastModalTrigger = null;

  const track = (eventType,metadata = {}) => window.dispatchEvent(new CustomEvent('cc:analytics',{ detail:{ eventType,metadata } }));

  const setPressed = (buttons, activeButton) => buttons.forEach((button) => {
    const active = button === activeButton;
    button.classList.toggle('is-active',active);
    button.setAttribute('aria-pressed',String(active));
  });

  const setActive = (selector,value) => root.querySelectorAll(`${selector} button`).forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;
    const active = button.dataset.value === value;
    button.classList.toggle('is-active',active);
    button.setAttribute('aria-pressed',String(active));
  });

  const pulseSelection = (button) => {
    if (!(button instanceof HTMLElement) || reducedMotion.matches) return;
    button.classList.remove('is-selecting');
    void button.offsetWidth;
    button.classList.add('is-selecting');
    window.setTimeout(() => button.classList.remove('is-selecting'),360);
  };

  const formatNights = () => {
    const nights = plannerNightsNumber(state.nights);
    const units = config.premium.nightUnits;
    const unit = nights === 1 ? units[0] : nights <= 4 ? units[1] : units[2];
    return `${state.nights === '5+' ? '5+' : nights} <span>${unit}</span>`;
  };

  const updateNightControl = () => {
    const value = root.querySelector('[data-planner-night-value]');
    if (!(value instanceof HTMLElement)) return;
    value.innerHTML = formatNights();
    if (!reducedMotion.matches) {
      value.classList.remove('is-changing');
      void value.offsetWidth;
      value.classList.add('is-changing');
      window.setTimeout(() => value.classList.remove('is-changing'),350);
    }
    root.querySelectorAll('[data-planner-night-step]').forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) return;
      const direction = Number(button.dataset.plannerNightStep || 0);
      button.disabled = direction < 0 ? plannerNightsNumber(state.nights) <= 1 : state.nights === '5+';
    });
  };

  const updateTimestamp = () => {
    const time = root.querySelector('[data-planner-updated-time]');
    if (!(time instanceof HTMLTimeElement)) return;
    const now = new Date();
    time.dateTime = now.toISOString();
    time.textContent = new Intl.DateTimeFormat(config.locale || 'pl-PL',{ hour:'2-digit',minute:'2-digit' }).format(now);
  };

  const showToast = (message,error = false) => {
    const toast = root.querySelector('[data-planner-toast]');
    if (!(toast instanceof HTMLElement)) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.toggle('is-error',error);
    toast.classList.add('is-visible');
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'),4300);
  };

  const resizeResultTo = (height) => {
    window.clearTimeout(heightTimer);
    result.style.height = `${Math.max(300,height)}px`;
    heightTimer = window.setTimeout(() => { result.style.height = 'auto'; },700);
  };

  const setupCarousel = () => {
    const daysRoot = result.querySelector('[data-planner-days]');
    const viewport = result.querySelector('[data-planner-days-viewport]');
    const trackEl = result.querySelector('[data-planner-days-track]');
    const cards = [...result.querySelectorAll('[data-planner-day-card]')];
    const previous = result.querySelector('[data-planner-days-prev]');
    const next = result.querySelector('[data-planner-days-next]');
    const indicator = result.querySelector('[data-planner-days-indicator]');
    const toolbar = daysRoot?.querySelector('.planner-days__toolbar');
    if (!(daysRoot instanceof HTMLElement) || !(viewport instanceof HTMLElement) || !(trackEl instanceof HTMLElement)) return;

    let pointerStart = null;
    const visibleCount = () => window.innerWidth <= 700 ? 1 : Math.min(3,cards.length);
    const refresh = () => {
      const visible = visibleCount();
      const maximum = Math.max(0,cards.length - visible);
      carouselStart = Math.min(carouselStart,maximum);
      daysRoot.style.setProperty('--planner-visible',String(visible));
      const firstCard = cards[0];
      const gap = Number.parseFloat(window.getComputedStyle(trackEl).columnGap || '12') || 12;
      const step = firstCard instanceof HTMLElement ? firstCard.getBoundingClientRect().width + gap : viewport.clientWidth;
      trackEl.style.transform = `translate3d(${-carouselStart * step}px,0,0)`;
      if (previous instanceof HTMLButtonElement) previous.disabled = carouselStart <= 0;
      if (next instanceof HTMLButtonElement) next.disabled = carouselStart >= maximum;
      if (indicator instanceof HTMLElement) indicator.textContent = `${carouselStart + 1}–${Math.min(cards.length,carouselStart + visible)} / ${cards.length}`;
      if (toolbar instanceof HTMLElement) toolbar.hidden = cards.length <= visible;
    };
    carouselRefresh = refresh;
    refresh();

    previous?.addEventListener('click',() => { carouselStart = Math.max(0,carouselStart - 1); refresh(); });
    next?.addEventListener('click',() => { carouselStart += 1; refresh(); });
    viewport.addEventListener('pointerdown',(event) => { pointerStart = event.clientX; });
    viewport.addEventListener('pointerup',(event) => {
      if (pointerStart === null) return;
      const delta = event.clientX - pointerStart;
      pointerStart = null;
      if (Math.abs(delta) < 46) return;
      carouselStart += delta < 0 ? 1 : -1;
      refresh();
    });
  };

  const renderNow = ({ animate = true } = {}) => {
    currentModel = buildPlannerModel(config,state);
    result.innerHTML = renderPlannerHtml(currentModel);
    result.classList.remove('is-exiting','is-loading');
    result.classList.toggle('is-entering',animate && !reducedMotion.matches);
    carouselStart = 0;
    setupCarousel();
    updateNightControl();
    updateTimestamp();
    if (animate && !reducedMotion.matches) window.setTimeout(() => result.classList.remove('is-entering'),900);
    return currentModel;
  };

  const transitionPlan = async (loadingText = config.premium.loading) => {
    const sequence = ++transitionSequence;
    if (reducedMotion.matches) { renderNow({ animate:false }); result.style.height = 'auto'; return; }
    const previousHeight = Math.max(result.offsetHeight,result.scrollHeight,300);
    result.style.height = `${previousHeight}px`;
    result.classList.add('is-exiting');
    await wait(170);
    if (sequence !== transitionSequence) return;
    result.classList.remove('is-exiting');
    result.classList.add('is-loading');
    result.innerHTML = renderPlannerSkeleton(config,plannerNightsNumber(state.nights),loadingText);
    requestAnimationFrame(() => resizeResultTo(result.scrollHeight));
    await wait(390);
    if (sequence !== transitionSequence) return;
    renderNow({ animate:true });
    requestAnimationFrame(() => resizeResultTo(result.scrollHeight));
  };

  const bindSegment = (selector,key,onChange) => {
    const buttons = [...root.querySelectorAll(`${selector} button`)].filter((button) => button instanceof HTMLButtonElement);
    buttons.forEach((button) => button.addEventListener('click',() => {
      setPressed(buttons,button);
      state[key] = button.dataset.value || state[key];
      pulseSelection(button);
      onChange?.(button);
      transitionPlan();
    }));
  };

  bindSegment('[data-planner-pace]','pace');
  bindSegment('[data-planner-group]','group',() => {
    state.children = state.group === 'family' ? 'yes' : 'no';
    setActive('[data-planner-children]',state.children);
    const wrap = root.querySelector('[data-planner-children-wrap]');
    if (wrap instanceof HTMLElement) wrap.hidden = state.group !== 'family';
  });
  bindSegment('[data-planner-children]','children');
  bindSegment('[data-planner-transport]','transport');
  bindSegment('[data-planner-weather]','weather');

  root.querySelectorAll('[data-planner-night-step]').forEach((button) => button.addEventListener('click',() => {
    const direction = Number(button.dataset.plannerNightStep || 0);
    const nextValue = direction > 0 ? nextPlannerNights(state.nights) : previousPlannerNights(state.nights);
    if (nextValue === state.nights) return;
    state.nights = nextValue;
    updateNightControl();
    pulseSelection(button);
    track('planner_change_nights',{ nights:state.nights,source:'stepper' });
    if (state.startDate) loadWeather(); else transitionPlan();
  }));

  const interestButtons = [...root.querySelectorAll('[data-planner-interests] button')];
  interestButtons.forEach((button) => button.addEventListener('click',() => {
    const value = button.dataset.value || '';
    button.classList.toggle('is-active');
    button.setAttribute('aria-pressed',String(button.classList.contains('is-active')));
    if (button.classList.contains('is-active')) state.interests.add(value); else state.interests.delete(value);
    pulseSelection(button);
    transitionPlan();
  }));

  const destinationButtons = [...root.querySelectorAll('[data-planner-trips] button')];
  destinationButtons.forEach((button) => button.addEventListener('click',() => {
    setPressed(destinationButtons,button);
    state.trip = button.dataset.value || 'wieliczka';
    pulseSelection(button);
    transitionPlan();
  }));

  const tripChoiceButtons = [...root.querySelectorAll('[data-planner-trip-choice] button')];
  const destinations = root.querySelector('[data-planner-trips]');
  tripChoiceButtons.forEach((button) => button.addEventListener('click',() => {
    setPressed(tripChoiceButtons,button);
    const enabled = button.dataset.value === 'yes';
    if (destinations instanceof HTMLElement) destinations.hidden = !enabled;
    state.trip = enabled ? (destinationButtons.find((item) => item.classList.contains('is-active'))?.dataset.value || 'wieliczka') : 'none';
    pulseSelection(button);
    transitionPlan();
  }));

  const addDays = (iso,days) => {
    const date = new Date(`${iso}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0,10);
  };

  const loadWeather = async () => {
    const sequence = ++weatherSequence;
    state.weatherDays = [];
    if (!state.startDate) { state.weatherStatus = 'neutral'; transitionPlan(); return; }
    state.weatherStatus = 'loading';
    transitionPlan(config.premium.loadingWeather);
    try {
      const end = addDays(state.startDate,plannerNightsNumber(state.nights) - 1);
      const response = await fetch(`/api/weather?start=${encodeURIComponent(state.startDate)}&end=${encodeURIComponent(end)}`,{ headers:{ accept:'application/json' } });
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
    dateInput.min = new Date().toISOString().slice(0,10);
    dateInput.addEventListener('change',() => { state.startDate = dateInput.value; loadWeather(); });
  }

  const panel = root.querySelector('[data-planner-panel]');
  const filterToggle = root.querySelector('[data-planner-filter-toggle]');
  filterToggle?.addEventListener('click',() => {
    if (!(panel instanceof HTMLElement) || !(filterToggle instanceof HTMLButtonElement)) return;
    const open = panel.classList.toggle('is-open');
    filterToggle.setAttribute('aria-expanded',String(open));
    const label = filterToggle.querySelector('[data-planner-filter-label]');
    if (label) label.textContent = open ? config.dashboard.filtersClose : config.dashboard.filtersOpen;
  });

  const scrollToResult = () => {
    if (window.innerWidth >= 960) return;
    if (panel instanceof HTMLElement) panel.classList.remove('is-open');
    filterToggle?.setAttribute('aria-expanded','false');
    window.setTimeout(() => result.scrollIntoView({ behavior:reducedMotion.matches ? 'auto' : 'smooth',block:'start' }),180);
  };

  root.querySelector('[data-planner-generate]')?.addEventListener('click',() => {
    track('planner_generate',{ source:'button',nights:state.nights,pace:state.pace,group:state.group,transport:state.transport,weather:state.weather,trip:state.trip });
    transitionPlan();
    scrollToResult();
  });

  const addNight = () => {
    if (state.nights === '5+') return;
    state.nights = nextPlannerNights(state.nights);
    updateNightControl();
    track('planner_add_night',{ nights:state.nights,source:'upsell' });
    track('planner_change_nights',{ nights:state.nights,source:'upsell' });
    if (state.startDate) loadWeather(); else transitionPlan();
  };

  const askCampy = (extra = '') => {
    const selectedTrip = config.tripList.find(([value]) => value === state.trip)?.[1] || '';
    const prompt = `${config.campyPlannerPrompt} ${config.nights}: ${state.nights}; ${config.pace}: ${config.options[state.pace]}; ${config.group}: ${config.options[state.group]}; ${config.transport}: ${state.transport === 'mixed' ? config.dashboard.walkBike : config.options[state.transport]}; ${config.trips}: ${selectedTrip}. ${extra}`.trim();
    window.dispatchEvent(new CustomEvent('campy:prompt',{ detail:{ prompt,actionKey:'stayLength' } }));
  };

  const savePlan = () => {
    try {
      const payload = { version:3,savedAt:new Date().toISOString(),language:config.language,state:{ ...state,interests:[...state.interests] },days:currentModel?.days?.map(({ dayNumber,title,morning,midday,evening,transport,duration,weatherAlternative }) => ({ dayNumber,title,morning,midday,evening,transport,duration,weatherAlternative })) || [] };
      window.localStorage.setItem('cc-stay-planner-v3',JSON.stringify(payload));
      showToast(config.dashboard.saved);
      track('planner_save',{ nights:state.nights,days:payload.days.length });
    } catch { showToast(config.dashboard.saveError,true); }
  };

  const mailPlan = () => {
    const lines = currentModel?.days?.flatMap((day) => [`${config.premium.dayLabel} ${day.dayNumber}: ${day.title}`,`${config.labels.morning}: ${day.morning}`,`${config.labels.noon}: ${day.midday}`,`${config.labels.evening}: ${day.evening}`]) || [];
    const body = [config.dashboard.mailIntro,'',...lines].join('\n');
    window.location.href = `mailto:?subject=${encodeURIComponent(config.dashboard.mailSubject)}&body=${encodeURIComponent(body)}`;
    track('planner_mail',{ nights:state.nights });
  };

  const closeModal = async (dialog) => {
    if (!(dialog instanceof HTMLDialogElement) || !dialog.open) return;
    dialog.classList.remove('is-visible');
    if (!reducedMotion.matches) { dialog.classList.add('is-closing'); await wait(180); }
    dialog.close();
    dialog.classList.remove('is-closing');
    document.body.classList.remove('planner-modal-open');
    if (lastModalTrigger instanceof HTMLElement) lastModalTrigger.focus();
  };

  const openDay = (dayNumber,trigger) => {
    const day = currentModel?.days?.find((item) => item.dayNumber === dayNumber);
    const dialog = result.querySelector('[data-planner-modal]');
    const content = dialog?.querySelector('[data-planner-modal-content]');
    if (!day || !(dialog instanceof HTMLDialogElement) || !(content instanceof HTMLElement)) return;
    content.innerHTML = renderPlannerDayModal(day,currentModel.labels);
    lastModalTrigger = trigger instanceof HTMLElement ? trigger : null;
    if (dialog.dataset.modalBound !== 'true') {
      dialog.dataset.modalBound = 'true';
      dialog.addEventListener('cancel',(event) => { event.preventDefault(); closeModal(dialog); });
      dialog.addEventListener('close',() => {
        dialog.classList.remove('is-visible','is-closing');
        document.body.classList.remove('planner-modal-open');
      });
    }
    dialog.showModal();
    document.body.classList.add('planner-modal-open');
    requestAnimationFrame(() => {
      dialog.classList.add('is-visible');
      dialog.querySelector('[data-planner-modal-close]')?.focus();
    });
    track('planner_day_details',{ day:dayNumber,route:day.routeIndex });
  };

  result.addEventListener('click',(event) => {
    const element = event.target instanceof Element ? event.target : null;
    if (!element) return;
    const dialog = element.closest('[data-planner-modal]');
    if (dialog instanceof HTMLDialogElement && element === dialog) { closeModal(dialog); return; }
    const close = element.closest('[data-planner-modal-close]');
    if (close) { closeModal(close.closest('dialog')); return; }
    const details = element.closest('[data-planner-day-details]');
    if (details instanceof HTMLElement) { openDay(Number(details.dataset.plannerDayDetails || 0),details); return; }
    const card = element.closest('[data-planner-day-card]');
    if (card instanceof HTMLElement && !element.closest('a,button')) { openDay(Number(card.dataset.plannerDay || 0),card); return; }
    if (element.closest('[data-planner-add-night]')) { addNight(); return; }
    if (element.closest('[data-planner-campy]')) { askCampy(); return; }
    if (element.closest('[data-planner-save]')) { savePlan(); return; }
    if (element.closest('[data-planner-mail]')) { mailPlan(); return; }
    const weatherButton = element.closest('[data-planner-weather-details]');
    if (weatherButton instanceof HTMLButtonElement) {
      const strip = weatherButton.closest('[data-planner-weather-strip]');
      const expanded = strip?.classList.toggle('is-expanded') || false;
      weatherButton.setAttribute('aria-expanded',String(expanded));
      const label = weatherButton.querySelector('span');
      if (label) label.textContent = expanded ? config.dashboard.weatherLess : config.dashboard.weatherDetails;
    }
  });

  result.addEventListener('keydown',(event) => {
    const dialog = event.target instanceof Element ? event.target.closest('dialog[open]') : null;
    if (!(dialog instanceof HTMLDialogElement)) return;
    if (event.key === 'Escape') { event.preventDefault(); closeModal(dialog); return; }
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter((node) => node instanceof HTMLElement && !node.hidden);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  let resizeTimer = 0;
  window.addEventListener('resize',() => { window.clearTimeout(resizeTimer); resizeTimer = window.setTimeout(carouselRefresh,120); });
  renderNow({ animate:false });
}
