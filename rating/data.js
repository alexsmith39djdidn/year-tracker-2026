/* ═══════════════════════════════════════════════════════════
   ДАННЫЕ КАРТЫ ПРОКАЧКИ САШИ — единственное место для правок.
   Все три виджета (общий рейтинг, радар, области) читают отсюда.

   Как править:
   - score: балл 0–100, или null если не измеряли (покажется «—»)
   - value: что показать текстом (факт). Для сырых показателей — само число
   - raw:   true → это не балл, а просто величина (вес, обхваты)
   - stale: true → замер устарел, в балл группы не идёт (правило свежести
            из skill rating-calc: поведение 14 дней, физика 45 дней)
   - est:   true → это оценка Auri, а не замер (энергия, резерв). Считается
            наравне, но помечается — чтобы впечатление не путать с данными

   Индекс и покрытие считаются автоматически — руками не проставлять.
   ═══════════════════════════════════════════════════════════ */

var RATING = {
  version: 'v0.1.1',
  date: '27.07.2026',
  window: 'неделя 19–25.07.2026 (та же, пересчёт после аудита формул)',
  prev: 41,                // индекс карты v0.1 (26.07.2026) — виджет считает дельту от него

  groups: [
    {
      key: 'core', name: 'Интегральные', icon: '◆',
      scales: [
        { name: 'Резерв',            value: '≈59',            score: 59, est: true },
        { name: 'Энергия Current',   value: '54.6',           score: 55, est: true },
        { name: 'Продуктивность дня',value: '5.08 / 10',      score: 51 },
        { name: 'Дни откиса',        value: '2 за полгода · 26 дней чисто', score: 65 }
      ]
    },
    {
      key: 'stability', name: 'Стабильность', icon: '⏱',
      scales: [
        { name: 'Стабильность сна',  value: 'отбой 4/7 · подъём 1/7 · сон 9:39', score: 38 },
        { name: 'Ровность дня',      value: 'старт работы ±5 ч',      score: 19 },
        { name: 'Стабильность работы',value: 'нет целей недели',      score: null },
        { name: 'Настроение',        value: 'не спрашивается',        score: null }
      ]
    },
    {
      key: 'food', name: 'Питание', icon: '◐',
      scales: [
        { name: 'Вода',              value: '2150 мл',        score: 86 },
        { name: 'Без срывов',        value: '6 дней из 7',    score: 86 },
        { name: 'Регулярность',      value: '3.0 приёма/день',score: 70 },
        { name: 'Правильность еды',  value: '20% зелёных',    score: 46 },
        { name: 'Калории',           value: '1251 из 2900',   score: 43 }
      ]
    },
    {
      key: 'sport', name: 'Спорт', icon: '▲',
      scales: [
        { name: 'Выносливость',      value: '27.0 км/ч',      score: 90, stale: true },
        { name: 'Боли',              value: '0 эпизодов',     score: 85 },
        { name: 'Силовые',           value: '20 подтягиваний',score: 80, stale: true },
        { name: 'Стабильность спорта',value: 'зарядка 3/7',   score: 40 },
        { name: 'Осанка',            value: 'плечо вперёд',   score: 40 },
        { name: 'Гибкость',          value: 'не мерили',      score: null },
        { name: 'Карта мышц',        value: 'не сделана',     score: null }
      ]
    },
    {
      key: 'health', name: 'Здоровье', icon: '＋',
      scales: [
        { name: 'Больные дни',       value: '0 за июль',      score: 100 },
        { name: 'Вес',               value: '72 кг',          score: null, raw: true, stale: true, note: 'цель 78–80' },
        { name: 'Замеры тела',       value: 'не мерили',      score: null },
        { name: 'Кожа · витамины',   value: 'нет данных',     score: null }
      ]
    },
    {
      key: 'head', name: 'Голова', icon: '◇',
      scales: [
        { name: 'Чтение',            value: '6 дней из 7',    score: 86 },
        { name: 'Экранная гигиена',  value: '3 чистых вечера',score: 43 },
        // ⚠️ занижено: 27.07 выяснилось, что Саша пишет 30–50 страниц (бумага + Notion).
        // Письменная часть стоит 0 по незнанию. Пересчитать, когда уточним частоту и место.
        { name: 'Осознанность',      value: 'вечерняя 7/7 · письменная под пересчёт', score: 52 },
        { name: 'Музыка',            value: 'не спрашивается',score: null }
      ]
    },
    {
      key: 'spirit', name: 'Дух', icon: '☾',
      scales: [
        { name: 'Медитация',         value: '0 из 7 дней',    score: 0 },
        { name: 'Аффирмации',        value: 'нет практики',   score: 0 }
      ]
    }
  ]
};

/* Планка на сейчас — куда тянемся этим месяцем.
   Растёт по принципу растущей планки, когда держится. */
var TARGET = 70;

/* ─── Зоны балла ─────────────────────────────────────────── */
var ZONES = [
  { lo: 0,  hi: 39,  name: 'Дно',      v: '--z-red'    },
  { lo: 40, hi: 64,  name: 'Просело',  v: '--z-orange' },
  { lo: 65, hi: 84,  name: 'Рабочее',  v: '--z-yellow' },
  { lo: 85, hi: 100, name: 'Держит',   v: '--z-green'  }
];

function zoneOf(v) {
  if (v === null || v === undefined) return null;
  for (var i = 0; i < ZONES.length; i++) {
    if (v >= ZONES[i].lo && v <= ZONES[i].hi) return ZONES[i];
  }
  return ZONES[ZONES.length - 1];
}

function colorOf(v) {
  var z = zoneOf(v);
  return z ? 'var(' + z.v + ')' : 'var(--fade)';
}

/* ─── Расчёт по правилам skill rating-calc ───────────────── */

// балл группы = среднее живых баллов (устаревшие и пустые не участвуют).
// Меньше двух живых шкал — балла нет: одна шкала за целую область врёт.
var MIN_LIVE = 2;

function groupScore(g) {
  var live = g.scales.filter(function (s) {
    return s.score !== null && s.score !== undefined && !s.stale && !s.raw;
  });
  if (live.length < MIN_LIVE) return null;
  var sum = live.reduce(function (a, s) { return a + s.score; }, 0);
  return Math.round(sum / live.length);
}

function groupCounts(g) {
  var live = 0, stale = 0, empty = 0;
  g.scales.forEach(function (s) {
    var has = (s.score !== null && s.score !== undefined) || s.raw;
    if (!has) empty++;
    else if (s.stale) stale++;
    else live++;
  });
  return { live: live, stale: stale, empty: empty, total: g.scales.length };
}

// Веса групп (решение Саши, 27.07.2026). Простое среднее врало:
// «Дух» — 2 незапущенные шкалы — весил столько же, сколько «Спорт» с семью,
// и ронял индекс на 7 пунктов. Вес — про важность области, не про число шкал.
var WEIGHTS = {
  core: 2, stability: 2, food: 1.5, sport: 1.5, health: 1, head: 1, spirit: 0.5
};

function overall() {
  var scores = [], noSpirit = [];
  RATING.groups.forEach(function (g) {
    var s = groupScore(g);
    if (s === null) return;
    var w = WEIGHTS[g.key] || 1;
    scores.push({ s: s, w: w });
    if (g.key !== 'spirit') noSpirit.push({ s: s, w: w });
  });
  var avg = function (a) {
    if (!a.length) return null;
    var sum = a.reduce(function (x, i) { return x + i.s * i.w; }, 0);
    var wsum = a.reduce(function (x, i) { return x + i.w; }, 0);
    return Math.round(sum / wsum);
  };
  var live = 0, stale = 0, empty = 0, total = 0;
  RATING.groups.forEach(function (g) {
    var c = groupCounts(g);
    live += c.live; stale += c.stale; empty += c.empty; total += c.total;
  });
  return {
    index: avg(scores),
    indexNoSpirit: avg(noSpirit),
    live: live, stale: stale, empty: empty, total: total,
    coverage: Math.round(live / total * 100)
  };
}

/* ─── Тема: системная + страховка ?theme=dark|light ──────── */
(function () {
  var m = location.search.match(/theme=(dark|light)/);
  if (m) document.documentElement.setAttribute('data-theme', m[1]);
})();
