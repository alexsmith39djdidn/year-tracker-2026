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
  version: 'v0.2',
  date: '02.08.2026',
  window: 'неделя 28.07–01.08.2026 (первая плановая; вс 02.08 ещё идёт)',
  // Индекс карты v0.1.1, ПЕРЕСЧИТАННЫЙ 02.08: было 45, стало 50.
  // Причина: велозаезд 27 км/ч я ошибочно пометила как прошлогодний и выкинула
  // из группы «Спорт». Замер назван 19.07.2026 — свежий. Спорт v0.1.1: 55 → 64.
  // Сравнивать можно только по одной линейке, поэтому база исправлена, а не оставлена.
  prev: 50,

  groups: [
    {
      key: 'core', name: 'Интегральные', icon: '◆',
      scales: [
        { name: 'Резерв',            value: '≈58',            score: 58, est: true },
        { name: 'Энергия Current',   value: '70.1',           score: 70, est: true },
        { name: 'Продуктивность дня',value: '5.9 / 10',       score: 59 },
        // 4 откиса за полгода. Градация по глубине введена 02.08.2026:
        // глубокий моложе 90 дней −25, лёгкий однодневный −8, 90–180 дней −10.
        { name: 'Дни откиса',        value: '4 за полгода · 2 из них на этой неделе', score: 49 }
      ]
    },
    {
      key: 'stability', name: 'Стабильность', icon: '⏱',
      scales: [
        { name: 'Стабильность сна',  value: 'отбой 4/6 · подъём 0/5 · сон 8:30', score: 43 },
        { name: 'Ровность дня',      value: 'старт работы 10:00 ровно ×3',       score: 58 },
        { name: 'Стабильность работы',value: 'план недели на 75%',   score: 75 },
        { name: 'Настроение',        value: '4.4 из 5',              score: 85 },
        // Новые шкалы от Саши (02.08.2026). Сбор начинается с недели 03–09.08.
        { name: 'Бодрость пробуждения', value: 'сбор с 03.08',       score: null },
        { name: 'Обязательность',    value: 'сбор с 03.08',          score: null }
      ]
    },
    {
      key: 'food', name: 'Питание', icon: '◐',
      scales: [
        { name: 'Вода',              value: '2125 мл',        score: 85 },
        { name: 'Без срывов',        value: '2 дня из 5',     score: 40 },
        { name: 'Регулярность',      value: '3.6 приёма/день',score: 82 },
        { name: 'Правильность еды',  value: '28% зелёных',    score: 50 },
        { name: 'Калории',           value: '1836 из 2900',   score: 63 }
      ]
    },
    {
      key: 'sport', name: 'Спорт', icon: '▲',
      scales: [
        // Замер назван 19.07.2026 — свежий (физика годна 45 дней). Пометка stale снята 02.08:
        // стояла по ошибке, я приняла его за прошлогодний.
        { name: 'Выносливость',      value: '10 км за 22:11 = 27.0 км/ч', score: 90 },
        { name: 'Боли',              value: '1 лёгкий эпизод',score: 90 },
        { name: 'Силовые',           value: '20 подтягиваний',score: 80, stale: true },
        { name: 'Стабильность спорта',value: 'зарядка 4/5 · вел 2/2', score: 79 },
        { name: 'Осанка',            value: 'плечо вперёд',   score: 40 },
        { name: 'Гибкость',          value: 'не мерили',      score: null },
        { name: 'Карта мышц',        value: 'не сделана',     score: null }
      ]
    },
    {
      key: 'health', name: 'Здоровье', icon: '＋',
      scales: [
        { name: 'Больные дни',       value: '0 за июль',      score: 100 },
        { name: 'Вес',               value: '74.1 кг',        score: null, raw: true, note: 'цель 78–80' },
        { name: 'Замеры тела',       value: 'не мерили',      score: null },
        // Новые шкалы от Саши: первый замер пришёл раньше плана (02.08 вместо 09.08).
        { name: 'Ногти',             value: '1/5 · грызёт постоянно', score: 20 },
        { name: 'Кожа лица',         value: '4/5 · без воспалений',   score: 80 },
        // 02.08: пришли 4 забора INVITRO (21.11.25 · 26.12.25 · 05.04.26 · 28.07.26).
        // Формула-старт: 100 − 30×(вне нормы) − 10×(у границы) по последнему забору.
        // 28.07: вне нормы витамин D (20.5) → −30; у границы креатинин 98 → −10. Итого 60.
        // ⚠️ Первая калибровка, проверить в ближайшем params-audit.
        { name: 'Витамины · анализы',value: 'D 20.5 ↓ с 52.9 · 1 из 8 вне нормы', score: 60 }
      ]
    },
    {
      key: 'head', name: 'Голова', icon: '◇',
      scales: [
        { name: 'Чтение',            value: '3 дня из 5',     score: 60 },
        { name: 'Экранная гигиена',  value: '3 чистых вечера из 5', score: 60 },
        // ⚠️ занижено: 27.07 выяснилось, что Саша пишет 30–50 страниц (бумага + Notion).
        // Письменная часть стоит 0 по незнанию. Пересчитать, когда уточним частоту и место.
        { name: 'Осознанность',      value: 'вечерняя 5/5 · письменная под пересчёт', score: 60 },
        // Данные есть с 28.07 (Spotify, 5 дней из 5), формулы пока нет — шкала ждёт правила.
        { name: 'Музыка',            value: 'данные есть, формулы нет', score: null }
      ]
    },
    {
      key: 'spirit', name: 'Дух', icon: '☾',
      scales: [
        { name: 'Медитация',         value: '2 из 5 дней',    score: 40 },
        { name: 'Аффирмации',        value: '4 из 5 дней',    score: 80 }
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
