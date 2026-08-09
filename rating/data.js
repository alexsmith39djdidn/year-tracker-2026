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
  version: 'v0.3',
  date: '09.08.2026',
  window: 'неделя 03–09.08.2026 (⚠️ 05–08.08 без сбора — часть шкал на оценке)',
  // Индекс карты v0.2 (02.08.2026) = 65. Сравниваем с ним.
  // ⚠️ ГЛАВНАЯ ОГОВОРКА v0.3: вечерние сборы 05–08.08 пропущены, Meal Log не велась.
  // Часть шкал посчитана по двум дням из семи (03–04.08) или по словесной оценке.
  // Такие шкалы помечены est:true. Спорт и добавки — объективный Notion, там нули настоящие.
  prev: 65,

  groups: [
    {
      key: 'core', name: 'Интегральные', icon: '◆',
      scales: [
        { name: 'Резерв',            value: '≈62',            score: 62, est: true },
        { name: 'Энергия Current',   value: '≈80 · «высоко» все дни', score: 80, est: true },
        // Дневные баллы продуктивности не собраны — считать не из чего. Прочерк, не ноль.
        { name: 'Продуктивность дня',value: 'сбор пропущен',  score: null },
        // Новых откисов на неделе нет, балл держится. ⚠️ февральский откис подходит
        // к границе 180 дней — на следующем params-audit пересчитать, будет 49 → 59.
        { name: 'Дни откиса',        value: '4 за полгода · новых нет', score: 49 }
      ]
    },
    {
      key: 'stability', name: 'Стабильность', icon: '⏱',
      scales: [
        // Подъём 6:30–7:30 со слов, отбой по плану. Длина сна ~8.2 ч → 100 по личной таблице.
        { name: 'Стабильность сна',  value: 'подъём 6:30–7:30 · сон ~8:12', score: 64, est: true },
        { name: 'Ровность дня',      value: 'точек дня нет',  score: null },
        // ⚠️ Считана только по измеримым линиям (спорт, зарядки, прогулки, D3): 1 из 10.
        // Работа в расчёт НЕ вошла — часов нет, а она была лучшей за наблюдение.
        // Балл занижен дырой в данных, а не только поведением.
        { name: 'Стабильность работы',value: '1 из 10 измеримых линий', score: 10 },
        { name: 'Настроение',        value: '≈4.6 из 5 · «отличное»',  score: 90, est: true },
        { name: 'Бодрость пробуждения', value: 'сбор пропущен',  score: null },
        { name: 'Обязательность',    value: 'сбор пропущен',     score: null }
      ]
    },
    {
      key: 'food', name: 'Питание', icon: '◐',
      // ⚠️ ВСЯ ГРУППА посчитана по двум дням из семи (03–04.08). Meal Log за 05–08 не велась.
      scales: [
        { name: 'Вода',              value: '~3000 мл · 2 дня из 7', score: 100, est: true },
        { name: 'Без срывов',        value: '0 чистых дней · оба дня печеньки', score: 0, est: true },
        { name: 'Регулярность',      value: '4 приёма/день · 2 дня из 7', score: 91, est: true },
        { name: 'Правильность еды',  value: '~25% зелёных · 2 дня из 7', score: 56, est: true },
        { name: 'Калории',           value: '1900 из 2900 · 2 дня из 7', score: 66, est: true }
      ]
    },
    {
      key: 'sport', name: 'Спорт', icon: '▲',
      // Вся группа — объективный Notion Workout Log. Нули здесь настоящие, не дыра.
      scales: [
        { name: 'Выносливость',      value: '10 км за 22:11 = 27.0 км/ч · замер 19.07', score: 90 },
        // Спина болела всю неделю (перекос в плечах) — 7 дней × −10.
        // ⚠️ формула не различает «немного болела» и сильную боль — под градацию в аудите.
        { name: 'Боли',              value: 'спина 7 дней из 7 (перекос в плечах)', score: 30 },
        { name: 'Силовые',           value: '20 подтягиваний',score: 80, stale: true },
        // зарядка 3/7 · силовые 1/3 · вел 1/2 → 43×0.4 + 33×0.4 + 50×0.2
        { name: 'Стабильность спорта',value: 'зарядка 3/7 · силовая 1/3 · вел 1/2', score: 40 },
        { name: 'Осанка',            value: 'плечо вперёд',   score: 40 },
        { name: 'Гибкость',          value: 'не мерили',      score: null },
        { name: 'Карта мышц',        value: 'не сделана',     score: null }
      ]
    },
    {
      key: 'health', name: 'Здоровье', icon: '＋',
      scales: [
        { name: 'Больные дни',       value: '0 за неделю',    score: 100 },
        { name: 'Вес',               value: '74.1 кг · замер 02.08', score: null, raw: true, note: 'цель 78–80' },
        { name: 'Замеры тела',       value: 'не мерили',      score: null },
        { name: 'Ногти',             value: '1/5 · грызёт постоянно', score: 20 },
        { name: 'Кожа лица',         value: '4/5 · без воспалений',   score: 80 },
        // 02.08: 4 забора INVITRO. Формула: 100 − 30×(вне нормы) − 10×(у границы) по последнему.
        // 28.07: вне нормы витамин D (20.5) → −30; у границы креатинин 98 → −10. Итого 60.
        { name: 'Витамины · анализы',value: 'D 20.5 ↓ с 52.9 · 1 из 8 вне нормы', score: 60 },
        // 🆕 Шкала введена 09.08.2026. Причина: курс витамина D шёл неделю и был полностью
        // невидим в рейтинге — 0 из 7 нигде не отражались. Тип B, % дней приёма.
        // В прошлых картах шкалы не было (курс начат 03.08) — прочерк, пересчёт не нужен.
        { name: 'Приём добавок',     value: 'витамин D 0 из 7 · не куплен', score: 0 }
      ]
    },
    {
      key: 'head', name: 'Голова', icon: '◇',
      scales: [
        // «Очень много читал каждый день» — его слова, все 7 дней.
        { name: 'Чтение',            value: '7 дней из 7',    score: 100, est: true },
        { name: 'Экранная гигиена',  value: '4 чистых вечера из 7', score: 57, est: true },
        // ✅ Пометка «письменная под пересчёт» закрыта 09.08: письмо было каждый день недели (7/7).
        // Вечерняя рефлексия (разговор со мной) — только 2 дня из 7, сборы пропущены.
        // 0.6 × 28.6 + 0.4 × 100 = 57.
        { name: 'Осознанность',      value: 'вечерняя 2/7 · письменная 7/7', score: 57 },
        { name: 'Музыка',            value: 'данные есть, формулы нет', score: null }
      ]
    },
    {
      key: 'spirit', name: 'Дух', icon: '☾',
      scales: [
        // Медитация за неделю не упоминалась ни разу — прочерк, не ноль.
        { name: 'Медитация',         value: 'не упоминалась', score: null },
        { name: 'Аффирмации',        value: '≈4 из 7 · «были, но с пропусками»', score: 57, est: true }
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
