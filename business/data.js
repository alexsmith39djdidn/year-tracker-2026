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
  version: 'v0.1',
  date: '03.08.2026',
  window: 'неделя 27.07–02.08.2026 · первый замер, наполовину оценочный',
  // Первый замер — сравнивать не с чем.
  prev: null,

  groups: [
    {
      key: 'core', name: 'Интегральные', icon: '◆',
      scales: [
        { name: 'Продуктивность недели', value: '25 из 50 задач · 5.0 / 10', score: 50 },
        { name: 'Запас хода',            value: '≈3 месяца при текущем расходе', score: 50, est: true },
        { name: 'Недель без движения к деньгам', value: 'история не размечена', score: null }
      ]
    },
    {
      key: 'course', name: 'Действия и курс', icon: '➤',
      scales: [
        // Главная цифра прибора. Цель — не меньше половины сил в действие.
        { name: 'Вектор недели',        value: 'действие 12% · заточка 52% · обслуживание 36%', score: 24 },
        { name: 'Расхождение сказали/сделали', value: 'объявляли наружу — ушли внутрь', score: 28, est: true },
        { name: 'Доля в ядре-20%',      value: 'веса дел не размечены', score: null },
        { name: 'Ключевых дел за неделю', value: 'веса дел не размечены', score: null },
        { name: 'Цена движения',        value: 'движений к деньгам не было', score: null }
      ]
    },
    {
      key: 'projects', name: 'Проекты', icon: '▣',
      scales: [
        { name: 'Активных проектов',    value: '15 одновременно при норме ~5', score: 25 },
        { name: 'Проекты без движения', value: '4 стоят дольше двух недель',   score: 40 },
        { name: 'Ход проектов',         value: 'средний прогресс задач 31%',   score: 31 },
        { name: 'Доведённость',         value: 'квартал не размечен',          score: null },
        { name: 'Точность оценки',      value: 'блоки не размечены',           score: null },
        { name: 'Окупаемость заточки',  value: 'связь с цифрами не прослежена', score: null }
      ]
    },
    {
      key: 'specs', name: 'Спецы и работа', icon: '⚒',
      scales: [
        // Считается по роли исполнителя в Notion (AI / человек).
        { name: 'Баланс ИИ / люди',     value: '20% закрытых дел на ИИ, 80% на людях', score: 40 },
        { name: '% выполнения задач',   value: '25 из 50 за неделю',           score: 50 },
        { name: 'Задач в день',         value: '≈8 в день — в коридоре',       score: 85 },
        { name: 'Простой',              value: 'Кирилл и Слава — 0 из 2 · спецы контента без дел', score: 20 },
        { name: 'Скорость оборота',     value: 'даты закрытия не собраны',      score: null }
      ]
    },
    {
      key: 'team', name: 'Команда и связь', icon: '◉',
      scales: [
        { name: 'Целевые совещания',    value: 'одно за неделю, разбор не размечен', score: null },
        { name: 'Решений с исполнителем', value: 'не считали',                 score: null },
        { name: 'Отклик',               value: 'не считали',                   score: null },
        { name: 'Тишина',               value: 'не считали',                   score: null }
      ]
    },
    {
      key: 'biz', name: 'Бизнес', icon: '✦',
      scales: [
        { name: 'Живые лиды',           value: 'ни одного диалога о покупке',  score: 0 },
        { name: 'Касаний наружу',       value: '0 за неделю',                  score: 0 },
        { name: 'Дней с касания',       value: 'больше недели тишины',         score: 2 },
        { name: 'Готовность к продаже', value: 'документы есть · витрины и кейсов нет', score: 40 },
        { name: 'Контента вышло',       value: '0 единиц',                     score: 0 },
        { name: 'Клиентов в ведении',   value: 'ни одного',                    score: 0 },
        { name: 'Конверсия разговоров', value: 'разговоров не было',           score: null }
      ]
    },
    {
      key: 'money', name: 'Финансы', icon: '₽',
      scales: [
        { name: 'Приход за месяц',      value: 'ноль',                         score: 0 },
        { name: 'Run-rate к цели',      value: 'ноль от цели года',            score: 0 },
        { name: 'Запас хода',           value: '≈3 месяца',                    score: 50, est: true },
        { name: 'Учёт расходов',        value: 'часть трат не занесена в базу', score: 60 },
        { name: 'Приход по направлениям', value: 'нечего разбивать',           score: null }
      ]
    },
    {
      key: 'system', name: 'Устройство', icon: '⚙',
      scales: [
        { name: 'Ритуалы выполнены',    value: 'аудит · план недели · разбор улучшений', score: 85 },
        { name: 'Порядок в памяти',     value: 'обе памяти по стандарту, сторож молчит', score: 90 },
        { name: 'Улучшений внедрено',   value: 'память, плагины, формы работы', score: 80 },
        { name: 'Живых спецов',         value: '1 отдел из 4 с живым спецом',  score: 25 },
        // Жёсткая шкала: заточка, не сдвинувшая другие группы, не считается заточкой.
        { name: 'Окупаемость устройства', value: 'внутреннее не сдвинуло деньги', score: 20 }
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
