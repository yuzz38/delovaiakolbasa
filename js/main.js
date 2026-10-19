/* Деловая колбаса 038 — скрипты лендинга. Без зависимостей, ES5-совместимый синтаксис для старых браузеров. */
(function () {
  'use strict';

  var doc = document.documentElement;
  doc.className += ' js';

  var IG_DIRECT = 'https://ig.me/m/delovaiakolbasa038';
  var qs = function (s, c) { return (c || document).querySelector(s); };
  var qsa = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Шапка и бургер ---------- */
  var header = qs('.header');
  var burger = qs('.burger');
  var nav = qs('#nav');
  var fab = qs('.fab');

  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('is-locked', open);
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  qsa('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if ((e.key === 'Escape' || e.keyCode === 27) && nav.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 860 && nav.classList.contains('is-open')) setMenu(false); });

  var ticking = false;
  function onScroll() {
    var y = window.pageYOffset || doc.scrollTop;
    header.classList.toggle('is-scrolled', y > 20);
    fab.classList.toggle('is-visible', y > window.innerHeight * 0.9);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; (window.requestAnimationFrame || setTimeout)(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Маршрут доставки ---------- */
  var ROUTE = [
    { short: 'Пн', full: 'Понедельник', acc: 'в понедельник', stops: ['Лермонтова', 'Баргузин', 'Трилиссера', 'Энергетиков', 'Юбилейный', 'Ерши', 'Маркова', 'Луговое'] },
    { short: 'Вт', full: 'Вторник', acc: 'во вторник', stops: ['НЛО', 'Рабочий штаб', 'Ушаковка', 'К. Маркса', 'Берёзовый', 'Синюшка'] },
    { short: 'Ср', full: 'Среда', acc: 'в среду', stops: ['НЛО', 'Лермонтова', 'Радужный', 'Солнечный', 'Молодёжный', 'Байкальский тракт до 15 км', 'Крылатый', 'Университетский', 'Первомайский'] },
    { short: 'Чт', full: 'Четверг', acc: 'в четверг', stops: ['Бармия', 'Кожова', 'Сибирская', 'Верхняя набережная', 'Волжский рынок', 'Трилиссера', 'Советская и рядом'] },
    { short: 'Пт', full: 'Пятница', acc: 'в пятницу', stops: ['Челябинская', 'Рабочий штаб', 'Юбилейный', 'Маркова', 'Лермонтова', 'Синюшка'] }
  ];
  /* Разговорные названия, по которым тоже ищем */
  var ALIASES = {
    'рабочий штаб': ['раб штаба', 'рабочего штаба', 'раб.штаба'],
    'молодежный': ['молодежка'],
    'университетский': ['универ'],
    'к. маркса': ['карла маркса', 'маркса'],
    'синюшка': ['синюшина гора', 'синюха'],
    'байкальский тракт до 15 км': ['байкальский тракт', 'байк тракт', 'тракт'],
    'верхняя набережная': ['верхняя наб', 'набережная']
  };

  function norm(s) {
    return String(s).toLowerCase().replace(/ё/g, 'е').replace(/[.,]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function stopMatches(stop, q) {
    if (q.length < 2) return false;
    var n = norm(stop);
    if (n.indexOf(q) !== -1) return true;
    var al = ALIASES[n] || [];
    for (var i = 0; i < al.length; i++) {
      var a = norm(al[i]);
      if (a.indexOf(q) !== -1 || (q.length > 3 && q.indexOf(a) !== -1)) return true;
    }
    return q.length > 3 && q.indexOf(n) !== -1;
  }
  function daysFor(query) {
    var q = norm(query);
    var hits = [];
    ROUTE.forEach(function (d, i) {
      d.stops.forEach(function (s) { if (stopMatches(s, q) && hits.indexOf(i) === -1) hits.push(i); });
    });
    return hits;
  }

  var board = qs('#board');
  var tabsBox = qs('.board__tabs', board);
  var daysBox = qs('.board__days', board);
  var dayEls = [], tabEls = [];

  ROUTE.forEach(function (d, i) {
    var tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'board__tab';
    tab.id = 'tab-' + i;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', 'day-' + i);
    tab.textContent = d.short;
    tab.addEventListener('click', function () { selectDay(i); });
    tabsBox.appendChild(tab);
    tabEls.push(tab);

    var day = document.createElement('div');
    day.className = 'day';
    day.id = 'day-' + i;
    day.setAttribute('role', 'tabpanel');
    day.setAttribute('aria-labelledby', 'tab-' + i);
    var html = '<p class="day__name">' + d.short + '<span class="day__full">' + d.full + '</span></p><ul class="stops">';
    d.stops.forEach(function (s) { html += '<li>' + s + '</li>'; });
    day.innerHTML = html + '</ul>';
    daysBox.appendChild(day);
    dayEls.push(day);
  });

  function selectDay(i) {
    tabEls.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
    dayEls.forEach(function (d, k) { d.classList.toggle('is-active', k === i); });
  }
  tabsBox.addEventListener('keydown', function (e) {
    var cur = tabEls.indexOf(document.activeElement);
    if (cur < 0) return;
    var next = e.key === 'ArrowRight' ? cur + 1 : e.key === 'ArrowLeft' ? cur - 1 : null;
    if (next === null) return;
    next = (next + tabEls.length) % tabEls.length;
    selectDay(next); tabEls[next].focus(); e.preventDefault();
  });
  var today = new Date().getDay(); /* 0 — воскресенье */
  selectDay(today >= 1 && today <= 5 ? today - 1 : 0);

  var routeInput = qs('#district');
  var routeAnswer = qs('#route-answer');
  var DEFAULT_ANSWER = routeAnswer.innerHTML;

  function dayList(hits) {
    return hits.map(function (i) { return ROUTE[i].acc; }).join(', ').replace(/, ([^,]*)$/, ' и $1');
  }
  function highlight(query) {
    var q = norm(query);
    var hits = daysFor(q);
    dayEls.forEach(function (d, i) {
      d.classList.toggle('is-hit', hits.indexOf(i) !== -1);
      tabEls[i].classList.toggle('is-hit', hits.indexOf(i) !== -1);
      qsa('li', d).forEach(function (li) { li.classList.toggle('is-hit', stopMatches(li.textContent, q)); });
    });
    if (q.length < 2) { routeAnswer.innerHTML = DEFAULT_ANSWER; return; }
    if (hits.length) {
      routeAnswer.innerHTML = 'Привезём <b>' + dayList(hits) + '</b>. Напишите заказ накануне.';
      if (hits.indexOf(dayEls.indexOf(qs('.day.is-active', daysBox))) === -1) selectDay(hits[0]);
    } else {
      routeAnswer.innerHTML = 'Такого района нет в маршруте — напишите в Direct, часто получается заехать по пути.';
    }
  }
  routeInput.addEventListener('input', function () { highlight(routeInput.value); });

  /* ---------- Выбор продуктов ---------- */
  var products = [];
  qsa('.pick[data-product]').forEach(function (b) {
    var p = b.getAttribute('data-product');
    if (products.indexOf(p) === -1) products.push(p);
  });
  var chipsBox = qs('#order-chips');
  products.forEach(function (p) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick';
    b.setAttribute('data-product', p);
    b.setAttribute('aria-pressed', 'false');
    b.textContent = p;
    chipsBox.appendChild(b);
  });

  var selected = [];
  var bar = qs('.shelf__bar');
  var barCount = qs('.shelf__count');
  var LABELS = { 'Salami beef (новинка)': 'Добавить salami beef в заказ' };

  function plural(n) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return 'позиция';
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'позиции';
    return 'позиций';
  }
  function syncPicks() {
    qsa('.pick[data-product]').forEach(function (b) {
      var p = b.getAttribute('data-product');
      var on = selected.indexOf(p) !== -1;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      var inChips = b.parentNode && b.parentNode.id === 'order-chips';
      if (inChips) return;
      if (LABELS[p]) b.textContent = on ? 'Salami beef в заказе' : LABELS[p];
      else b.textContent = on ? 'В заказе' : 'В заказ';
    });
    var n = selected.length;
    barCount.textContent = n ? 'В заказе ' + n + ' ' + plural(n) : 'Пока ничего не выбрано';
    bar.classList.toggle('is-visible', n > 0);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.pick[data-product]') : null;
    if (!b) return;
    var p = b.getAttribute('data-product');
    var i = selected.indexOf(p);
    if (i === -1) selected.push(p); else selected.splice(i, 1);
    syncPicks();
  });

  /* ---------- Форма заказа ---------- */
  var form = qs('#order-form');
  var status = qs('#order-status');
  var areaInput = qs('#o-area');
  var dayHint = qs('#o-day');
  var pickup = qs('#o-pickup');

  function updateDayHint() {
    if (pickup.checked) { dayHint.textContent = 'Самовывоз: ул. Аксакова, 2 — время согласуем в Direct.'; return; }
    var hits = areaInput.value.length > 1 ? daysFor(areaInput.value) : [];
    dayHint.textContent = hits.length ? 'По маршруту привезём ' + dayList(hits) + '.' : '';
  }
  areaInput.addEventListener('input', updateDayHint);
  pickup.addEventListener('change', function () { areaInput.disabled = pickup.checked; updateDayHint(); });

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.top = '0'; ta.style.left = '0'; ta.style.opacity = '0'; ta.style.fontSize = '16px';
    document.body.appendChild(ta);
    var range = document.createRange(); range.selectNodeContents(ta);
    var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    ta.setSelectionRange(0, text.length); /* iOS */
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.classList.remove('is-error');
    if (!selected.length) {
      status.textContent = 'Отметьте хотя бы один продукт — список появится в сообщении.';
      status.classList.add('is-error');
      return;
    }
    var name = qs('#o-name').value.trim();
    var note = qs('#o-note').value.trim();
    var lines = ['Здравствуйте, Маргоша! Хочу сделать заказ:'];
    selected.forEach(function (p) { lines.push('— ' + p); });
    lines.push(pickup.checked ? 'Заберу сам(а) с Аксакова, 2.' : 'Доставка: ' + (areaInput.value.trim() || 'район уточню'));
    if (note) lines.push('Пожелания: ' + note);
    if (name) lines.push(name);
    var text = lines.join('\n');

    /* Окно открываем сразу, в обработчике клика, иначе iOS Safari его заблокирует */
    var win = window.open(IG_DIRECT, '_blank');
    copyText(text).then(function (ok) {
      status.textContent = ok
        ? 'Заказ скопирован. Вставьте его в сообщение Маргоше в Instagram.'
        : 'Не получилось скопировать автоматически. Выделите текст ниже и отправьте его в Direct.';
      if (!ok) { status.classList.add('is-error'); status.textContent += '\n' + text; status.style.whiteSpace = 'pre-line'; }
      if (!win) window.location.href = IG_DIRECT;
    });
  });

  /* ---------- Слайдер отзывов ---------- */
  var slider = qs('#slider');
  var track = qs('.slider__track', slider);
  var slides = qsa('.review', track);
  var dotsBox = qs('.slider__dots');
  var index = 0, perView = 3, timer = null;

  function getPerView() { return window.innerWidth <= 600 ? 1 : window.innerWidth <= 860 ? 2 : 3; }
  function maxIndex() { return Math.max(0, slides.length - perView); }

  function buildDots() {
    dotsBox.innerHTML = '';
    for (var i = 0; i <= maxIndex(); i++) {
      (function (k) {
        var d = document.createElement('button');
        d.type = 'button';
        d.setAttribute('role', 'tab');
        d.setAttribute('aria-label', 'Отзыв ' + (k + 1));
        d.addEventListener('click', function () { go(k); restart(); });
        dotsBox.appendChild(d);
      })(i);
    }
  }
  function go(i, instant) {
    index = Math.min(Math.max(i, 0), maxIndex());
    var step = slides[0].offsetWidth + parseFloat(getComputedStyle(slides[0]).marginRight || 0);
    if (instant) track.style.transition = 'none';
    track.style.transform = 'translate3d(' + (-index * step) + 'px,0,0)';
    if (instant) { track.offsetHeight; track.style.transition = ''; }
    qsa('button', dotsBox).forEach(function (d, k) { d.setAttribute('aria-selected', k === index ? 'true' : 'false'); });
    slides.forEach(function (s, k) { s.setAttribute('aria-hidden', k >= index && k < index + perView ? 'false' : 'true'); });
  }
  function next() { go(index >= maxIndex() ? 0 : index + 1); }
  function prev() { go(index <= 0 ? maxIndex() : index - 1); }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function restart() { clearInterval(timer); if (!reduce) timer = setInterval(next, 6000); }

  qsa('.slider__btn').forEach(function (b) {
    b.addEventListener('click', function () { (b.getAttribute('data-dir') === '1' ? next : prev)(); restart(); });
  });
  slider.addEventListener('mouseenter', function () { clearInterval(timer); });
  slider.addEventListener('mouseleave', restart);

  /* свайп */
  var sx = 0, sy = 0, dx = 0, dragging = false;
  slider.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; dx = 0; dragging = true; clearInterval(timer); }, { passive: true });
  slider.addEventListener('touchmove', function (e) {
    if (!dragging) return;
    dx = e.touches[0].clientX - sx;
    if (Math.abs(e.touches[0].clientY - sy) > Math.abs(dx)) { dragging = false; }
  }, { passive: true });
  slider.addEventListener('touchend', function () {
    if (dragging && Math.abs(dx) > 40) { (dx < 0 ? next : prev)(); }
    dragging = false; restart();
  });

  function layoutSlider() {
    var pv = getPerView();
    if (pv !== perView || !dotsBox.children.length) { perView = pv; buildDots(); }
    go(index, true);
  }
  var rT;
  window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(layoutSlider, 120); });
  window.addEventListener('orientationchange', function () { setTimeout(layoutSlider, 250); });
  layoutSlider();
  restart();
  document.addEventListener('visibilitychange', function () { if (document.hidden) clearInterval(timer); else restart(); });

  /* ---------- Карта: подгружаем при приближении ---------- */
  var map = qs('#map');
  function loadMap() {
    if (map.getAttribute('data-loaded')) return;
    map.setAttribute('data-loaded', '1');
    var f = document.createElement('iframe');
    f.src = map.getAttribute('data-src');
    f.title = 'Карта: Иркутск, ул. Аксакова, 2';
    f.loading = 'lazy';
    f.setAttribute('allowfullscreen', '');
    map.innerHTML = '';
    map.appendChild(f);
  }
  qs('.map__load', map).addEventListener('click', loadMap);

  /* ---------- Появление блоков ---------- */
  var revealTargets = qsa('.section__head, .shelf, .novinka__in, .why__in, .hozyaika__in, .board, .reviews__head, .order__in, .faq__in, .contacts__in');
  if ('IntersectionObserver' in window) {
    revealTargets.forEach(function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealTargets.forEach(function (el) { io.observe(el); });

    var mo = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { loadMap(); mo.disconnect(); }
    }, { rootMargin: '300px 0px' });
    mo.observe(map);
  } else {
    loadMap();
  }
})();
