/* ═══════════════════════════════════════════════════════════
   ВОЛЬТА БИЗНЕС — данные прибора компании Whoopy.
   Единственное место для правок: все три виджета
   (индекс, радар, карточки групп) читают отсюда.

   Как править:
   - score: балл 0–100, или null если не измеряли (покажется «—»)
   - value: что показать текстом (факт)
   - raw:   true → это не балл, а просто величина
   - stale: true → замер устарел, в балл группы не идёт
   - est:   true → это оценка Auri, а не замер из данных

   Индекс и покрытие считаются автоматически — руками не проставлять.

   ⚠️ ПРИВАТНОСТЬ: виджет публичный (GitHub Pages).
   Сюда НЕ пишем: суммы в рублях, имена клиентов, тексты договорённостей.
   Только баллы и мягкие подписи. Точные цифры живут в файлах на диске
   (ВОЛЬТА БИЗНЕС/Карты) и в Notion.
   ═══════════════════════════════════════════════════════════ */

var RATING = {
  version: 'v0.4',
  date: '30.08.2026',
  window: 'неделя 24–30.08.2026 · замер сделан вне своего часа, по слову главы компании в день аудита',
  // Дельта к v0.3. Формулы не менялись (кроме вынужденной замены источника
  // для вектора/цены движения — снятий дней не было всю неделю).
  // Весь сдвиг — реальное изменение компании, не починка линейки.
  prev: 31,

  groups: [
    {
      key: 'core', name: 'Интегральные', icon: '◆',
      scales: [
        { name: 'Продуктивность недели', value: '50 задач закрыто из 96 поставленных (по числу, не по весам)', score: 52, est: true },
        { name: 'Запас хода',            value: '17 дней — впервые факт, не оценка; было ≈2 месяца', score: 10 },
        { name: 'Недель без движения к деньгам', value: '2 мёртвые из 5 размеченных', score: 84, est: true }
      ]
    },
    {
      key: 'course', name: 'Действия и курс', icon: '➤',
      scales: [
        // Дневных меток 💰/🔧/⚙️ на этой неделе нет — метод заменён вынужденно
        // на данные Треугольника (движение ÷ весь объём недели).
        { name: 'Вектор недели',        value: 'через Треугольник: движение 4 из ≈27 весов недели ≈ 15%', score: 30, est: true },
        { name: 'Расхождение сказали/сделали', value: 'нет дневных данных', score: null },
        { name: 'Доля в ядре-20%',      value: 'нет дневных данных', score: null },
        { name: 'Ключевых дел за неделю', value: 'нет данных по весам задач', score: null },
        { name: 'Цена движения',        value: '≈27 весов недели на 2 движения к деньгам', score: 74, est: true }
      ]
    },
    {
      key: 'projects', name: 'Проекты', icon: '▣',
      scales: [
        { name: 'Активных проектов',    value: '26 одновременно при норме ~5 · четвёртую карту без единого закрытия', score: 0 },
        { name: 'Проекты без движения', value: '≥5 стоят дольше двух недель — миграция 26.08 могла замаскировать больше', score: 35, est: true },
        { name: 'Ход проектов',         value: 'нет данных', score: null },
        { name: 'Направленность портфеля', value: 'не проверяла заново', score: null },
        { name: 'Доведённость',         value: 'квартал не размечен', score: null },
        { name: 'Точность оценки',      value: 'блоки не размечены', score: null },
        { name: 'Окупаемость заточки',  value: 'нет данных за неделю', score: null }
      ]
    },
    {
      key: 'specs', name: 'Спецы и работа', icon: '⚒',
      scales: [
        { name: 'Баланс ИИ / люди',     value: '≈47% закрытых по числу задач (весов по-прежнему нет)', score: 94, est: true },
        { name: '% выполнения задач',   value: '50 из 96 за неделю · SQL-квота оборвала точную выгрузку', score: 52, est: true },
        { name: 'Задач в день',         value: '7,1 в день — впервые в коридоре 5–12', score: 86 },
        { name: 'Простой',              value: 'двое (Кирилл, Слава) формально без Done — но Слава был активен вне Notion', score: 34 },
        { name: 'Скорость оборота',     value: 'даты постановки не собраны', score: null }
      ]
    },
    {
      key: 'team', name: 'Команда и связь', icon: '◉',
      scales: [
        { name: 'Целевые совещания',    value: 'минимум 3 за неделю · у 2 решение+исполнитель+срок', score: 67, est: true },
        { name: 'Решений с исполнителем', value: '2 исполнено из 3 известных', score: 67, est: true },
        { name: 'Отклик',               value: 'учёт не заведён · четвёртая карта подряд', score: null },
        { name: 'Тишина',               value: 'учёт не заведён · четвёртая карта подряд', score: null }
      ]
    },
    {
      key: 'biz', name: 'Бизнес', icon: '✦',
      scales: [
        { name: 'Живые лиды',           value: 'один — пекарь, теперь с датой совещания по предложению', score: 20 },
        // Впервые за месяц не ноль: письмо + поход Кибердом.
        { name: 'Касаний наружу',       value: '≈8 за неделю — 11 дней тишины прервались', score: 80, est: true },
        { name: 'Дней с касания',       value: 'три дня с последнего касания', score: 58, est: true },
        { name: 'Готовность к продаже', value: 'витрина, White Paper и прайс есть · кейса и отзыва нет', score: 60, est: true },
        { name: 'Контента вышло',       value: '0 единиц · девятую неделю', score: 0 },
        { name: 'Клиентов в ведении',   value: 'ни одного', score: 0 },
        { name: 'Конверсия разговоров', value: '0 продаж при ≈8 разговорах', score: 0 },
        { name: 'Предложений с ценой',  value: 'цена пекарю по-прежнему не дошла как предложение — перенесено на совещание 02.09', score: 0 }
      ]
    },
    {
      key: 'money', name: 'Финансы', icon: '₽',
      scales: [
        { name: 'Приход за месяц',      value: 'ноль · пятая неделя подряд', score: 0 },
        { name: 'Run-rate к цели',      value: 'ноль от цели года', score: 0 },
        { name: 'Запас хода',           value: '17 дней — факт, не оценка; было ≈2 месяца', score: 10 },
        { name: 'Учёт расходов',        value: 'около трети трат не занесено в базу — перенос прежней оценки', score: 63, est: true },
        { name: 'Приход по направлениям', value: 'нечего разбивать', score: null }
      ]
    },
    {
      key: 'system', name: 'Устройство', icon: '⚙',
      scales: [
        { name: 'Ритуалы выполнены',    value: 'аудит и замер выполнены (замер не в свой час) · план недели и разбор улучшений не проверены', score: 75, est: true },
        { name: 'Порядок в памяти',     value: 'моя память в лимите после уборки (15 487 б) · колея компании 4 дня из 7', score: 86 },
        { name: 'Улучшений внедрено',   value: 'минимум 4 за неделю: схема проектов · метод предложения · развенчан слух · глубинная память ВОЛЬТЫ', score: 100 },
        { name: 'Живых спецов',         value: '1 отдел из 4 — перенос прежней оценки', score: 25, est: true },
        { name: 'Окупаемость устройства', value: 'сдвинула работу с портфелем и будущую готовность к продаже — частично', score: 50, est: true }
      ]
    }
  ]
};

/* Планка на первый месяц — намеренно низкая (решение Саши 03.08.2026):
   первый замер обязан быть некрасивым, иначе он врёт. */
var TARGET = 40;

/* ─── Зоны балла ─────────────────────────────────────────── */
var ZONES = [
  { lo: 0,  hi: 39,  name: 'Стоим',  v: '--z-red'    },
  { lo: 40, hi: 64,  name: 'Едем',   v: '--z-orange' },
  { lo: 65, hi: 84,  name: 'Везёт',  v: '--z-yellow' },
  { lo: 85, hi: 100, name: 'Разгон', v: '--z-green'  }
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

/* ─── Расчёт ─────────────────────────────────────────────── */

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

/* Веса групп (решение Саши, 03.08.2026).
   Бизнес + Финансы = 52 против 48 у всего остального — намеренно:
   прибор обязан болеть, когда денег нет, даже если внутри всё блестит.
   «Устройство» с потолком 5, иначе мы прокачиваем себя вместо компании.
   «Интегральные» — производная от остальных, поэтому вес 0. */
var WEIGHTS = {
  biz: 30, money: 22, course: 14, projects: 14, specs: 10, team: 5, system: 5, core: 0
};

function overall() {
  var scores = [], noSystem = [];
  RATING.groups.forEach(function (g) {
    var s = groupScore(g);
    if (s === null) return;
    var w = (g.key in WEIGHTS) ? WEIGHTS[g.key] : 1;
    if (w === 0) return;
    scores.push({ s: s, w: w });
    if (g.key !== 'system') noSystem.push({ s: s, w: w });
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
    indexNoSystem: avg(noSystem),
    live: live, stale: stale, empty: empty, total: total,
    coverage: Math.round(live / total * 100)
  };
}

/* ─── Тема: системная + страховка ?theme=dark|light ──────── */
(function () {
  var m = location.search.match(/theme=(dark|light)/);
  if (m) document.documentElement.setAttribute('data-theme', m[1]);
})();

/* ═══════════════════════════════════════════════════════════
   ТРЕУГОЛЬНИК — верхний слой прибора (модель 0.1, 23.08.2026).
   Неделя = три области по глаголу:
     внутреннее держит · улучшение растит · внешнее двигает.
   Движение недели = сумма весов ВНЕШНИХ действий.
   Путь = движение, накопленное по неделям.
   Склад = законченная подготовка, которая ждёт выхода наружу.

   ⚠️ ПРИВАТНОСТЬ: только баллы и мягкие подписи.
   Ни сумм, ни имён клиентов — они живут в файлах на диске.
   ═══════════════════════════════════════════════════════════ */

var TRIANGLE = {
  version: '0.1',
  date: '30.08.2026',
  note: 'второй прогон теста, четыре прожитые недели',

  weeks: [
    {
      label: '03–09.08',
      inner: 8, better: 17, outer: 7,
      stock: 0,
      top: 'сайт выпущен наружу'
    },
    {
      label: '10–16.08',
      inner: 14, better: 23, outer: 4,
      stock: 0,
      top: 'два касания, ни одного предложения'
    },
    {
      label: '17–23.08',
      inner: 22, better: 24, outer: 0,
      stock: 9,
      top: 'ни одного выхода наружу'
    },
    {
      label: '24–30.08',
      inner: 15, better: 8, outer: 4,
      stock: 9,
      top: 'путь пошёл: письмо + поход Кибердом'
    }
  ],

  // Что готово и лежит без выхода — оценка на последнюю неделю, не перепроверена заново.
  stockItems: [
    { name: 'Два сценария первой серии', w: 3, since: 'с 14.08' },
    { name: 'Каркас основы контента',    w: 3, since: 'с 17.08' },
    { name: 'Предложение с ценой',       w: 3, since: 'с 21.08' }
  ]
};

/* Зона движения недели. Пороги — первая версия, на текущих числах. */
function moveZone(m) {
  if (m === null || m === undefined) return { name: '—', color: 'var(--muted)' };
  if (m <= 0)  return { name: 'стоим',   color: 'var(--z-red)' };
  if (m <= 4)  return { name: 'касания', color: 'var(--z-orange)' };
  if (m <= 9)  return { name: 'едем',    color: 'var(--z-yellow)' };
  return           { name: 'разгон',  color: 'var(--z-green)' };
}

function triPath() {
  var p = 0;
  return TRIANGLE.weeks.map(function (w) { p += w.outer; return p; });
}
