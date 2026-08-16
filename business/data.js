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
  version: 'v0.2',
  date: '16.08.2026',
  window: 'неделя 10–16.08.2026 · замер просрочен на неделю, между картами непокрытый разрыв 03–09.08',
  // Дельта считается к v0.1 и покрывает ДВЕ недели, а не одну.
  prev: 26,

  groups: [
    {
      key: 'core', name: 'Интегральные', icon: '◆',
      scales: [
        { name: 'Продуктивность недели', value: '38 весов закрыто из ≈74 плановых', score: 51, est: true },
        { name: 'Запас хода',            value: '≈2,2 месяца при текущем расходе', score: 38 },
        { name: 'Недель без движения к деньгам', value: '1 мёртвая из 3 размеченных — история неполная', score: 92, est: true }
      ]
    },
    {
      key: 'course', name: 'Действия и курс', icon: '➤',
      scales: [
        // Главная цифра прибора. Цель — не меньше половины сил в действие.
        { name: 'Вектор недели',        value: 'действие 13% · заточка 68% · обслуживание 18% (по весам)', score: 26 },
        { name: 'Расхождение сказали/сделали', value: 'объявляли ≈60% наружу — вышло 13% · разрыв 47 п.', score: 29, est: true },
        { name: 'Доля в ядре-20%',      value: 'в объявленное ядро ушло 8% весов', score: 13, est: true },
        { name: 'Ключевых дел за неделю', value: 'одно дело веса 3 за всю неделю', score: 20 },
        { name: 'Цена движения',        value: '19 весов на одно движение к деньгам', score: 53 }
      ]
    },
    {
      key: 'projects', name: 'Проекты', icon: '▣',
      scales: [
        { name: 'Активных проектов',    value: '17 одновременно при норме ~5', score: 10 },
        // ⚠️ Формула считает долю: те же 4 мёртвых проекта дают балл выше,
        // если завести новых. К v0.3 перевести на абсолютный счёт.
        { name: 'Проекты без движения', value: '4 стоят дольше двух недель',   score: 48 },
        { name: 'Ход проектов',         value: 'средний прогресс задач 47%',   score: 47 },
        { name: 'Направленность портфеля', value: '8 проектов из 17 направлены наружу', score: 47, est: true },
        { name: 'Доведённость',         value: 'квартал не размечен',          score: null },
        { name: 'Точность оценки',      value: 'блоки не размечены',           score: null },
        { name: 'Окупаемость заточки',  value: '2 внутренних проекта из 7 сдвинули цифру прибора', score: 29 }
      ]
    },
    {
      key: 'specs', name: 'Спецы и работа', icon: '⚒',
      scales: [
        // Считается по роли исполнителя в Notion (AI / человек).
        // ⚠️ Мерит не работу ИИ, а её оформление: дела, сделанные мной,
        // заведены на человека. Оценкой задним числом не чиню.
        { name: 'Баланс ИИ / люди',     value: '5% весов на ИИ — искажено оформлением задач', score: 11 },
        { name: '% выполнения задач',   value: '23 из 41 за неделю · воскресенье не закончено', score: 56 },
        { name: 'Задач в день',         value: '3,3 в день — ниже коридора 5–12', score: 53 },
        { name: 'Простой',              value: 'трое из шести за неделю не закрыли ничего', score: 0 },
        { name: 'Скорость оборота',     value: 'даты постановки не собраны',    score: null }
      ]
    },
    {
      key: 'team', name: 'Команда и связь', icon: '◉',
      scales: [
        { name: 'Целевые совещания',    value: 'одно за неделю, разбор не размечен', score: null },
        { name: 'Решений с исполнителем', value: 'не считали',                 score: null },
        // Фактура есть (письма без ответа), учёта нет — положить некуда.
        { name: 'Отклик',               value: 'учёт не заведён · вторая карта подряд', score: null },
        { name: 'Тишина',               value: 'учёт не заведён · вторая карта подряд', score: null }
      ]
    },
    {
      key: 'biz', name: 'Бизнес', icon: '✦',
      scales: [
        // Строго по определению шкалы: диалог о покупке, а не список знакомых.
        { name: 'Живые лиды',           value: 'один — тот, кто попросил продукт сам', score: 20 },
        { name: 'Касаний наружу',       value: '2 за неделю · письмо и разговор', score: 20 },
        { name: 'Дней с касания',       value: '4 дня тишины наружу',          score: 44 },
        { name: 'Готовность к продаже', value: 'витрина, White Paper и прайс есть · кейса и отзыва нет', score: 60 },
        { name: 'Контента вышло',       value: '0 единиц · седьмую неделю',    score: 0 },
        { name: 'Клиентов в ведении',   value: 'ни одного',                    score: 0 },
        { name: 'Конверсия разговоров', value: 'один разговор — ноль продаж',  score: 0 },
        // Новая шкала v0.2, заказана аудитом: между «есть лид» и «есть сделка»
        // не было ничего, поэтому месяц не видно, что мы стоим.
        { name: 'Предложений с ценой',  value: 'ноль за неделю и ноль за всё время', score: 0 }
      ]
    },
    {
      key: 'money', name: 'Финансы', icon: '₽',
      scales: [
        // Показывается голой цифрой и не усредняется в зелень. Особенно когда ноль.
        { name: 'Приход за месяц',      value: 'ноль · третья неделя подряд',  score: 0 },
        { name: 'Run-rate к цели',      value: 'ноль от цели года',            score: 0 },
        { name: 'Запас хода',           value: '≈2,2 месяца · до 20-х чисел октября', score: 38 },
        { name: 'Учёт расходов',        value: 'около половины трат не занесено в базу', score: 53, est: true },
        { name: 'Приход по направлениям', value: 'нечего разбивать',           score: null }
      ]
    },
    {
      key: 'system', name: 'Устройство', icon: '⚙',
      scales: [
        { name: 'Ритуалы выполнены',    value: 'аудит и план недели прошли · замер прибора просрочен', score: 50 },
        { name: 'Порядок в памяти',     value: 'стандарт единый, сторож молчит · колея 2 дня из 7', score: 75 },
        { name: 'Улучшений внедрено',   value: 'пять за неделю при лимите три', score: 100 },
        { name: 'Живых спецов',         value: '1 отдел из 4 с живым спецом',  score: 25 },
        // Жёсткая шкала: заточка, не сдвинувшая другие группы, не считается заточкой.
        { name: 'Окупаемость устройства', value: 'за окно внутреннее не сдвинуло других групп', score: 20 }
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
