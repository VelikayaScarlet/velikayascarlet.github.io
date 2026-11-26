(function () {
  var gate = document.getElementById('gpu-board-gate');
  var gateCard = gate.querySelector('.gpu-gate-card');
  var board = document.getElementById('gpu-board-content');
  var input = document.getElementById('gpu-board-password');
  var toggleBtn = document.getElementById('gpu-password-toggle');
  var message = document.getElementById('gpu-board-gate-status');
  var storageKey = 'gpu-weekly-board-kuee';
  var password = 'kuee';

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var visible = input.type === 'text';
      input.type = visible ? 'password' : 'text';
      toggleBtn.setAttribute('aria-pressed', String(!visible));
      toggleBtn.setAttribute('aria-label', visible ? '显示密码' : '隐藏密码');
      input.focus();
    });
  }

  function unlock(moveFocus) {
    gate.hidden = true;
    if (moveFocus) board.classList.add('gpu-board--enter');
    board.hidden = false;
    if (moveFocus) board.focus();
    loadBoard();
  }

  gate.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault();
    if (input.value !== password) {
      message.textContent = '密码不正确，请重试。';
      input.setAttribute('aria-invalid', 'true');
      input.select();
      if (gateCard) {
        gateCard.classList.remove('is-shaking');
        void gateCard.offsetWidth;
        gateCard.classList.add('is-shaking');
      }
      return;
    }
    input.removeAttribute('aria-invalid');
    message.textContent = '';
    input.value = '';
    try { sessionStorage.setItem(storageKey, '1'); } catch (error) {}
    unlock(true);
  });

  input.addEventListener('input', function () {
    if (input.getAttribute('aria-invalid') === 'true') {
      input.removeAttribute('aria-invalid');
      message.textContent = '';
    }
  });

  document.getElementById('gpu-board-lock').addEventListener('click', function () {
    try { sessionStorage.removeItem(storageKey); } catch (error) {}
    window.location.reload();
  });

  try {
    if (sessionStorage.getItem(storageKey) === '1') unlock(false);
  } catch (error) {}
})();

async function loadBoard() {
  var status = document.getElementById('gpu-week-status');
  var week = document.getElementById('gpu-board-week');
  var capacityPill = document.getElementById('gpu-cluster-capacity');
  var tableCard = document.getElementById('gpu-table-card');
  var table = document.getElementById('gpu-week-ranking');
  var body = table.tBodies[0];
  var leaders = document.getElementById('gpu-board-leaders');
  var rankingCount = document.getElementById('gpu-ranking-count');
  var searchWrap = document.getElementById('gpu-search-wrap');
  var searchInput = document.getElementById('gpu-account-search');
  var activeFilterBtn = document.getElementById('gpu-active-filter');
  var controls = document.querySelectorAll('[data-gpu-sort]');
  var headers = table.querySelectorAll('[data-metric]');
  var legend = document.getElementById('gpu-board-legend');
  var stops = Array.from(document.querySelectorAll('[data-gpu-stop]'));
  var dateControl = document.getElementById('gpu-chart-date-control');
  var dateInput = document.getElementById('gpu-chart-date');
  var chart = document.getElementById('gpu-daily-chart');
  var legendDaily = document.getElementById('gpu-daily-legend');
  var periodTotals = document.getElementById('gpu-period-totals');
  var dailyUnit = document.getElementById('gpu-daily-unit');
  var sharePanel = document.getElementById('gpu-daily-share');
  var shareBar = sharePanel.querySelector('.gpu-share-bar');
  var shareTotal = document.getElementById('gpu-share-total');
  var zoomControls = Object.fromEntries(Array.from(document.querySelectorAll('[data-chart-zoom]'), function (button) {
    return [button.dataset.chartZoom, button];
  }));

  var number = new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var integerFmt = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 });
  var oneDecFmt = new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  var compactTick = new Intl.NumberFormat('en', { notation: 'compact', maximumSignificantDigits: 3 });
  var percent = new Intl.NumberFormat('zh-CN', { style: 'percent', maximumFractionDigits: 1 });
  var wholePercent = new Intl.NumberFormat('zh-CN', { style: 'percent', maximumFractionDigits: 0 });

  var refreshMs = 120_000;
  var repo = 'VelikayaScarlet/velikayascarlet.github.io';
  var revision = '';
  var currentData;
  var displayed = '';
  var sort = 'memory';
  var items = [];
  var daily = {};
  var archives = new Map();
  var days = -1;
  var renderedHour;
  var hourMs = 3600000;
  var fiveMinutesMs = 300000;
  var selectedDate = '';
  var selectedSeries = null;
  var searchQuery = '';
  var viewport;

  // Curated 12-hue palette tuned for both light & dark themes
  var PALETTE = [
    ['#4f46e5', '#818cf8'], // Indigo
    ['#e11d48', '#fb7185'], // Rose
    ['#059669', '#34d399'], // Emerald
    ['#d97706', '#fbbf24'], // Amber
    ['#0284c7', '#38bdf8'], // Sky
    ['#7c3aed', '#a78bfa'], // Violet
    ['#ea580c', '#fb923c'], // Coral Orange
    ['#0d9488', '#2dd4bf'], // Teal
    ['#c026d3', '#e879f9'], // Fuchsia
    ['#2563eb', '#60a5fa'], // Cobalt
    ['#65a30d', '#a3e635'], // Lime
    ['#be123c', '#fda4af']  // Crimson
  ];
  var accountColors = new Map();

  function hashString(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function colorFor(name) {
    var existing = accountColors.get(name);
    if (existing) return existing;
    var pair = PALETTE[hashString(name) % PALETTE.length];
    var color = 'light-dark(' + pair[0] + ', ' + pair[1] + ')';
    accountColors.set(name, color);
    return color;
  }

  function assignRankingColors(rankedList) {
    accountColors.clear();
    rankedList.forEach(function (item, idx) {
      var pair = PALETTE[idx % PALETTE.length];
      accountColors.set(item.nickname, 'light-dark(' + pair[0] + ', ' + pair[1] + ')');
    });
  }

  function unitShort() {
    return sort === 'memory' ? 'GiB·h' : 'H100·h';
  }

  function svgNode(tag, attrs, label) {
    var node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(function ([key, value]) { node.setAttribute(key, value); });
    if (label !== undefined) node.textContent = label;
    return node;
  }

  // Fritsch-Carlson monotone cubic spline so curves stay silky & never dip below zero
  function buildMonotoneSegment(pts) {
    var n = pts.length;
    if (n === 0) return '';
    if (n === 1) return 'M' + pts[0].x.toFixed(2) + ' ' + pts[0].y.toFixed(2);
    if (n === 2) {
      return 'M' + pts[0].x.toFixed(2) + ' ' + pts[0].y.toFixed(2) +
        ' L' + pts[1].x.toFixed(2) + ' ' + pts[1].y.toFixed(2);
    }
    var dx = new Array(n - 1);
    var m = new Array(n - 1);
    for (var i = 0; i < n - 1; i += 1) {
      dx[i] = pts[i + 1].x - pts[i].x;
      m[i] = dx[i] ? (pts[i + 1].y - pts[i].y) / dx[i] : 0;
    }
    var t = new Array(n);
    t[0] = m[0];
    t[n - 1] = m[n - 2];
    for (var j = 1; j < n - 1; j += 1) {
      if (m[j - 1] * m[j] <= 0) {
        t[j] = 0;
      } else {
        var w1 = 2 * dx[j] + dx[j - 1];
        var w2 = dx[j] + 2 * dx[j - 1];
        t[j] = (w1 + w2) / (w1 / m[j - 1] + w2 / m[j]);
      }
    }
    var d = 'M' + pts[0].x.toFixed(2) + ' ' + pts[0].y.toFixed(2);
    for (var k = 0; k < n - 1; k += 1) {
      var step = dx[k] / 3;
      var cp1x = pts[k].x + step;
      var cp1y = pts[k].y + t[k] * step;
      var cp2x = pts[k + 1].x - step;
      var cp2y = pts[k + 1].y - t[k + 1] * step;
      d += ' C' + cp1x.toFixed(2) + ' ' + cp1y.toFixed(2) + ', ' +
        cp2x.toFixed(2) + ' ' + cp2y.toFixed(2) + ', ' +
        pts[k + 1].x.toFixed(2) + ' ' + pts[k + 1].y.toFixed(2);
    }
    return d;
  }

  function buildSeriesPaths(segments, baselineY) {
    var strokeParts = [];
    var areaParts = [];
    segments.forEach(function (pts) {
      if (!pts.length) return;
      var lineD = buildMonotoneSegment(pts);
      strokeParts.push(lineD);
      if (pts.length >= 2) {
        var first = pts[0];
        var last = pts[pts.length - 1];
        areaParts.push(
          lineD +
          ' L' + last.x.toFixed(2) + ' ' + baselineY.toFixed(2) +
          ' L' + first.x.toFixed(2) + ' ' + baselineY.toFixed(2) + ' Z'
        );
      }
    });
    return { stroke: strokeParts.join(' '), area: areaParts.join(' ') };
  }

  function toggleSeriesFocus(name, scrollToChart) {
    selectedSeries = selectedSeries === name ? null : name;
    viewport = null;
    syncFocusIndicators();
    renderDaily(false);
    if (scrollToChart && selectedSeries) {
      document.getElementById('gpu-daily-title')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function syncFocusIndicators() {
    if (selectedSeries) {
      activeFilterBtn.hidden = false;
      activeFilterBtn.style.setProperty('--filter-color', colorFor(selectedSeries));
      activeFilterBtn.querySelector('.gpu-active-filter__name').textContent = '聚焦：' + selectedSeries;
    } else {
      activeFilterBtn.hidden = true;
    }
    leaders.querySelectorAll('.gpu-podium-card').forEach(function (card) {
      card.setAttribute('aria-pressed', String(card.dataset.account === selectedSeries));
    });
    body.querySelectorAll('tr').forEach(function (row) {
      var focused = row.dataset.account === selectedSeries;
      row.classList.toggle('is-focused-account', focused);
      var pin = row.querySelector('.gpu-account-pin');
      if (pin) pin.hidden = !focused;
    });
  }

  activeFilterBtn.addEventListener('click', function () {
    if (!selectedSeries) return;
    selectedSeries = null;
    viewport = null;
    syncFocusIndicators();
    renderDaily(false);
  });

  function bindChartViewport(svg, bounds, redraw) {
    var maxScale = 8;
    var pointers = new Map();
    var view = viewport || { scale: 1, left: 0, top: 0 };
    var center = { x: bounds.width / 2, y: bounds.height / 2 };

    function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
    function svgPoint(event) {
      var ctm = svg.getScreenCTM();
      if (!ctm) return { x: 0, y: 0 };
      var point = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
      return { x: point.x - bounds.x, y: point.y - bounds.y };
    }
    function inside(point) {
      return point.x >= 0 && point.x <= bounds.width && point.y >= 0 && point.y <= bounds.height;
    }
    function apply(scale, left, top) {
      view = viewport = {
        scale: scale,
        left: clamp(left, 0, bounds.width * (1 - 1 / scale)),
        top: clamp(top, 0, bounds.height * (1 - 1 / scale))
      };
      svg.classList.toggle('is-zoomed', scale > 1);
      zoomControls.in.disabled = scale >= maxScale;
      zoomControls.out.disabled = zoomControls.reset.disabled = scale <= 1;
      zoomControls.reset.textContent = Number(scale.toFixed(1)) + '×';
      redraw(view);
    }
    function zoom(factor, from, to) {
      var scale = clamp(view.scale * factor, 1, maxScale);
      apply(scale, view.left + from.x / view.scale - to.x / scale, view.top + from.y / view.scale - to.y / scale);
    }
    function midpoint(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
    function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
    zoomControls.in.onclick = function () { zoom(1.5, center, center); };
    zoomControls.out.onclick = function () { zoom(1 / 1.5, center, center); };
    zoomControls.reset.onclick = function () { apply(1, 0, 0); };
    svg.addEventListener('wheel', function (event) {
      if (!event.deltaY || (event.deltaY > 0 && view.scale === 1 && !event.ctrlKey)) return;
      var p = svgPoint(event);
      if (!inside(p)) return;
      event.preventDefault();
      var delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 120 : 1);
      zoom(Math.exp(clamp(-delta / 300, -.55, .55)), p, p);
    }, { passive: false });
    svg.addEventListener('dblclick', function (event) {
      var p = svgPoint(event);
      if (inside(p)) { event.preventDefault(); zoom(1.5, p, p); }
    });
    svg.setAttribute('tabindex', '0');
    svg.addEventListener('keydown', function (event) {
      if (event.target !== svg) return;
      var shifts = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      var shift = shifts[event.key];
      if (shift && view.scale > 1) {
        apply(view.scale, view.left + shift[0] * 32 / view.scale, view.top + shift[1] * 24 / view.scale);
      } else if (event.key === '+' || event.key === '=') zoom(1.5, center, center);
      else if (event.key === '-') zoom(1 / 1.5, center, center);
      else if (event.key === '0') apply(1, 0, 0);
      else return;
      event.preventDefault();
    });
    svg.addEventListener('pointerdown', function (event) {
      if (event.button !== 0 || pointers.size >= 2 || (event.pointerType === 'mouse' && view.scale === 1)) return;
      var p = svgPoint(event);
      if (!inside(p)) return;
      pointers.set(event.pointerId, p);
      svg.setPointerCapture(event.pointerId);
      svg.classList.add('is-grabbing');
    });
    svg.addEventListener('pointermove', function (event) {
      var old = pointers.get(event.pointerId);
      if (!old) return;
      var next = svgPoint(event);
      var other = Array.from(pointers.entries()).find(function (entry) { return entry[0] !== event.pointerId; })?.[1];
      pointers.set(event.pointerId, next);
      if (other) {
        var before = distance(old, other);
        if (before > 0) zoom(distance(next, other) / before, midpoint(old, other), midpoint(next, other));
      } else if (view.scale > 1) {
        apply(view.scale, view.left + (old.x - next.x) / view.scale, view.top + (old.y - next.y) / view.scale);
      }
    });
    svg.addEventListener('lostpointercapture', function (event) {
      pointers.delete(event.pointerId);
      if (!pointers.size) svg.classList.remove('is-grabbing');
    });
    apply(view.scale, view.left, view.top);
  }

  function usage(row) {
    return sort === 'memory' ? row.mib_minutes / (1024 * 60) : row.h100_hours;
  }

  function renderTotals(date) {
    periodTotals.replaceChildren();
    var day = new Date(date + 'T00:00:00Z');
    var weekStart = new Date(day.getTime() - ((day.getUTCDay() + 6) % 7) * 86400000);
    var month = date.slice(0, 7);
    var source = Date.parse(currentData?.source_time);
    var startOfWeek = weekStart.toISOString().slice(0, 10);
    var sampleDate = currentData?.source_time?.slice(0, 10);
    var capacity = currentData?.capacity;
    var rate = sort === 'memory' ? capacity?.mib / 1024 : capacity?.h100;
    var monthDays = Object.keys(daily).filter(function (key) { return key.startsWith(month) && key <= date; });

    [
      ['今日累计', date, daily[date] ?? (sampleDate < date ? [] : null), 'JST 今日'],
      ['本周累计', startOfWeek, sampleDate >= startOfWeek && sampleDate <= date ? items : null, 'JST 本周'],
      ['本月累计', month + '-01', monthDays.length ? monthDays.flatMap(function (key) { return daily[key]; }) : null, 'JST 本月']
    ].forEach(function ([label, start, rows, scopeHint]) {
      var card = document.createElement('article');
      card.className = 'gpu-kpi-card';

      var head = document.createElement('div');
      head.className = 'gpu-kpi-card__head';
      var title = document.createElement('span');
      title.className = 'gpu-kpi-card__label';
      var dot = document.createElement('span');
      dot.className = 'gpu-kpi-card__dot';
      dot.setAttribute('aria-hidden', 'true');
      title.append(dot, label);

      var elapsed = (source - Date.parse(start + 'T00:00:00+09:00')) / 3600000;
      var actual = rows?.reduce(function (sum, row) { return sum + usage(row); }, 0);
      var limit = rate > 0 && Number.isFinite(elapsed) ? rate * Math.max(0, elapsed) : null;
      var ratio = limit && actual !== undefined ? Math.min(1, actual / limit) : null;

      var pct = document.createElement('span');
      pct.className = 'gpu-kpi-card__pct';
      pct.textContent = ratio === null ? '—' : percent.format(ratio);
      pct.title = '占理论算力上限比例';
      head.append(title, pct);

      var valueRow = document.createElement('div');
      valueRow.className = 'gpu-kpi-card__value-row';
      var total = document.createElement('div');
      total.className = 'gpu-kpi-card__value';
      total.textContent = actual === undefined ? '—' : number.format(actual);
      var unit = document.createElement('span');
      unit.className = 'gpu-kpi-card__unit';
      unit.textContent = unitShort();
      valueRow.append(total, unit);

      var track = document.createElement('span');
      track.className = 'gpu-period-track';
      track.setAttribute('aria-hidden', 'true');
      track.style.setProperty('--fill', (ratio !== null ? ratio * 100 : 0).toFixed(2) + '%');

      var foot = document.createElement('div');
      foot.className = 'gpu-kpi-card__foot';
      var ceiling = document.createElement('span');
      ceiling.textContent = '理论上限 ' + (limit === null ? '—' : number.format(limit));
      var scope = document.createElement('span');
      scope.textContent = scopeHint;
      foot.append(ceiling, scope);

      card.append(head, valueRow, track, foot);
      periodTotals.append(card);
    });
  }

  function eightHourRows(hourly, start) {
    var totals = new Map();
    var collected = false;
    for (var i = 0; i < 8; i += 1) {
      var hour = new Date(start + i * hourMs).toISOString().slice(0, 13);
      if (!hourly[hour]) continue;
      collected = true;
      hourly[hour].forEach(function (row) {
        var total = totals.get(row.nickname);
        if (!total) {
          total = { nickname: row.nickname, mib_minutes: 0, rated_mib_minutes: 0, h100_hours: 0 };
          totals.set(row.nickname, total);
        }
        total.mib_minutes += row.mib_minutes || 0;
        total.rated_mib_minutes += row.rated_mib_minutes || 0;
        total.h100_hours += row.h100_hours || 0;
      });
    }
    return collected ? Array.from(totals.values()) : undefined;
  }

  function loadArchive(month) {
    var entry = { state: 'loading' };
    archives.set(month, entry);
    fetch('https://raw.githubusercontent.com/' + repo + '/' + revision + '/archive/' + month + '.json', {
      signal: AbortSignal.timeout(12000)
    }).then(function (response) {
      if (!response.ok) throw new Error('Archive unavailable');
      return response.json();
    }).then(function (data) {
      if (data.month !== month || !data.hourly || typeof data.hourly !== 'object') throw new Error('Invalid archive');
      entry.state = 'ready';
      entry.hourly = data.hourly;
    }).catch(function () {
      entry.state = 'error';
    }).finally(function () {
      if (days === 0 && selectedDate.startsWith(month + '-')) renderDaily();
    });
    return entry;
  }

  function setChartEmpty(text) {
    var msg = document.createElement('p');
    msg.className = 'gpu-chart-empty';
    msg.textContent = text;
    chart.replaceChildren(msg);
  }

  function renderDaily(animate) {
    var focusedSeries = document.activeElement?.dataset.gpuSeries;
    chart.replaceChildren();
    legendDaily.replaceChildren();
    shareBar.replaceChildren();
    sharePanel.hidden = true;
    Object.values(zoomControls).forEach(function (button) { button.disabled = true; button.onclick = null; });
    zoomControls.reset.textContent = '1×';

    var now = Date.now();
    renderedHour = Math.floor(now / (days === -2 ? fiveMinutesMs : hourMs));
    var today = new Date(now + 9 * hourMs);
    var date = today.toISOString().slice(0, 10);
    dateControl.hidden = days !== 0;

    var liveStart = new Date(today.getTime() - 30 * 86400000).toISOString().slice(0, 10);
    var archiveMonths = currentData?.archive_months || [];
    var archiveStart = archiveMonths[0] ? archiveMonths[0] + '-01' : liveStart;
    dateInput.min = archiveStart < liveStart ? archiveStart : liveStart;
    dateInput.max = date;
    if (selectedDate && (selectedDate < dateInput.min || selectedDate > date)) selectedDate = '';
    var chartDate = selectedDate || date;
    dateInput.value = chartDate;
    renderTotals(date);

    var unit = sort === 'memory' ? '显存小时（GiB·h）' : 'H100 等效小时（已折算卡）';
    var dailyView = days === 30;
    var shortView = days === -2;
    var eightHourView = days === 7;
    var hourly = currentData?.hourly || {};
    var resolution = shortView ? ' · 每 5 分钟' : eightHourView ? ' · 每 8 小时' : dailyView ? ' · 按日汇总' : ' · 按小时汇总';
    dailyUnit.textContent = unit + ' · JST' + resolution;

    var month = chartDate.slice(0, 7);
    if (days === 0 && chartDate < liveStart && archiveMonths.includes(month)) {
      var archive = archives.get(month) || loadArchive(month);
      if (archive.state !== 'ready') {
        setChartEmpty(archive.state === 'error' ? '归档暂时无法读取。' : '正在读取月度归档…');
        return;
      }
      hourly = archive.hourly;
    }

    var binMs = eightHourView ? 8 * hourMs : fiveMinutesMs;
    var lastBucket = Math.floor(today.getTime() / binMs) * binMs;
    var count = dailyView ? days : eightHourView ? 21 : 24;
    var points = Array.from({ length: count }, function (_, index) {
      var key;
      if (shortView || eightHourView) {
        var start = lastBucket - (count - 1 - index) * binMs;
        key = new Date(start).toISOString().slice(0, 16);
        return { key: key, rows: shortView ? currentData?.five_minutes?.[key] : eightHourRows(hourly, start) };
      }
      if (dailyView) key = new Date(today.getTime() - (days - 1 - index) * 86400000).toISOString().slice(0, 10);
      else if (days === -1) key = new Date(today.getTime() - (23 - index) * hourMs).toISOString().slice(0, 13);
      else key = chartDate + 'T' + String(index).padStart(2, '0');
      return { key: key, rows: dailyView ? daily[key] : hourly[key] };
    });

    if (!points.some(function (point) { return point.rows; })) {
      setChartEmpty('这个时间范围还没有采样记录。');
      return;
    }

    var shares = new Map();
    points.forEach(function (point) {
      (point.rows || []).forEach(function (row) {
        shares.set(row.nickname, (shares.get(row.nickname) || 0) + (usage(row) || 0));
      });
    });

    var names = Array.from(shares.keys()).sort(function (a, b) {
      return (shares.get(b) || 0) - (shares.get(a) || 0) || a.localeCompare(b);
    });
    if (!names.length) {
      setChartEmpty('该时间范围内没有记录到 GPU 占用。');
      return;
    }

    var totalUsage = Array.from(shares.values()).reduce(function (total, value) { return total + value; }, 0);
    var active = names.includes(selectedSeries) ? [selectedSeries] : names;
    var isSolo = active.length === 1;

    var series = new Map(active.map(function (name) {
      return [name, points.map(function (point) {
        var row = point.rows?.find(function (entry) { return entry.nickname === name; });
        if (!point.rows || (sort === 'compute' && row && !row.rated_mib_minutes)) return null;
        return { value: row ? usage(row) : 0, row: row };
      })];
    }));

    var svg = svgNode('svg', {
      viewBox: '0 0 880 300',
      role: 'group',
      'aria-label': isSolo ? active[0] + ' GPU 用量折线图' : '全员 GPU 用量折线图'
    });
    if (animate) svg.classList.add('gpu-chart-enter');

    var values = Array.from(series.values()).flat().filter(Boolean).map(function (point) { return point.value; });
    var high = Math.max(0, ...values);
    var max = high > 0 ? high * 1.08 : 1;
    var bounds = { x: 68, y: 20, width: 786, height: 236 };
    var baselineY = bounds.y + bounds.height;
    var x = function (i) { return bounds.x + i * bounds.width / (points.length - 1); };
    var y = function (value) { return bounds.y + bounds.height * (1 - value / max); };

    var tooltip = document.createElement('div');
    tooltip.className = 'gpu-chart-tooltip';
    tooltip.hidden = true;

    var visuals = [];
    var highlighted = null;
    var activeDot = null;
    var currentView = { scale: 1, left: 0, top: 0 };
    var restoreFocus;

    var axes = svgNode('g', {});
    var clip = svgNode('clipPath', { id: 'gpu-chart-plot-clip' });
    clip.append(svgNode('rect', { x: bounds.x - 6, y: bounds.y - 6, width: bounds.width + 12, height: bounds.height + 12 }));
    var defs = svgNode('defs', {});
    defs.append(clip);

    var crosshair = svgNode('line', {
      x1: bounds.x, x2: bounds.x,
      y1: bounds.y, y2: baselineY,
      class: 'gpu-chart-crosshair',
      visibility: 'hidden'
    });

    var frame = svgNode('g', { 'clip-path': 'url(#gpu-chart-plot-clip)' });
    var plot = svgNode('g', { class: 'gpu-chart-world' });
    var surface = svgNode('rect', { ...bounds, fill: 'transparent' });
    frame.append(surface, plot);
    svg.append(defs, axes, crosshair, frame);

    function highlight(index) {
      if (index === highlighted) return;
      highlighted = index;
      visuals.forEach(function (elements, i) {
        elements.forEach(function (element) {
          element.classList.toggle('is-muted', index !== null && i !== index);
          element.classList.toggle('is-highlighted', i === index);
        });
      });
    }

    function showCrosshair(rawX) {
      var screenX = bounds.x + (rawX - bounds.x - currentView.left) * currentView.scale;
      if (screenX >= bounds.x && screenX <= bounds.x + bounds.width) {
        crosshair.setAttribute('x1', screenX.toFixed(2));
        crosshair.setAttribute('x2', screenX.toFixed(2));
        crosshair.setAttribute('visibility', 'visible');
      } else {
        crosshair.setAttribute('visibility', 'hidden');
      }
    }

    function showTooltip(info, clientX, clientY) {
      var rect = chart.getBoundingClientRect();
      tooltip.replaceChildren();

      var head = document.createElement('div');
      head.className = 'gpu-tooltip__head';
      var swatch = document.createElement('span');
      swatch.className = 'gpu-tooltip__swatch';
      swatch.style.background = info.color;
      head.append(swatch, info.name);
      tooltip.append(head);

      if (info.time) {
        var timeEl = document.createElement('div');
        timeEl.className = 'gpu-tooltip__time';
        timeEl.textContent = info.time + ' JST';
        tooltip.append(timeEl);
      }

      if (info.valueText !== undefined) {
        var valEl = document.createElement('div');
        valEl.className = 'gpu-tooltip__val';
        valEl.textContent = info.valueText;
        tooltip.append(valEl);
      }

      if (info.note) {
        var noteEl = document.createElement('div');
        noteEl.className = 'gpu-tooltip__note';
        noteEl.textContent = info.note;
        tooltip.append(noteEl);
      }

      tooltip.hidden = false;
      var tw = tooltip.offsetWidth;
      var th = tooltip.offsetHeight;
      var left = clientX - rect.left + 14;
      if (left + tw > rect.width - 6) left = clientX - rect.left - tw - 14;
      left = Math.max(6, Math.min(left, rect.width - tw - 6));
      var top = clientY - rect.top - th - 12;
      if (top < 6) top = clientY - rect.top + 14;
      tooltip.style.left = left + 'px';
      tooltip.style.top = Math.max(6, top) + 'px';
    }

    function clearHighlight() {
      tooltip.hidden = true;
      crosshair.setAttribute('visibility', 'hidden');
      if (activeDot) {
        activeDot.classList.remove('is-active');
        activeDot = null;
      }
      highlight(null);
    }

    var areaNodes = [];
    var lineNodes = [];
    var hitPaths = [];
    var allDots = [];

    names.forEach(function (name, index) {
      var color = colorFor(name);
      var ratio = totalUsage ? (shares.get(name) || 0) / totalUsage : 0;
      var share = totalUsage ? (ratio > 0 && ratio < .001 ? '<0.1%' : percent.format(ratio)) : '—';

      if (ratio > 0) {
        var segment = document.createElement('span');
        segment.style.flex = ratio + ' 1 0px';
        segment.style.background = color;
        segment.title = name + ' · ' + share;
        segment.addEventListener('pointerenter', function (event) {
          if (event.pointerType !== 'touch' && series.has(name)) highlight(index);
        });
        segment.addEventListener('pointerleave', clearHighlight);
        shareBar.append(segment);
      }

      var marks = visuals[index] = [];
      var segments = [];
      var currentSeg = [];

      series.get(name)?.forEach(function (sample, i) {
        var point = points[i];
        if (!sample) {
          if (currentSeg.length) {
            segments.push(currentSeg);
            currentSeg = [];
          }
          return;
        }
        var px = x(i);
        var py = y(sample.value);
        currentSeg.push({ x: px, y: py });

        var formattedTime = point.key.replace('T', ' ') + (point.key.length === 13 ? ':00' : '');
        var partial = sort === 'compute' && sample.row && !complete(sample.row);
        var ariaLabel = name + ' · ' + formattedTime + ' · ' + number.format(sample.value) + ' ' + unitShort() + (partial ? '（部分折算）' : '');
        var dot = svgNode('circle', {
          cx: px.toFixed(2),
          cy: py.toFixed(2),
          r: 2.7,
          class: 'gpu-chart-point',
          tabindex: 0,
          'aria-label': ariaLabel
        });
        dot.style.fill = color;

        var tipInfo = {
          name: name,
          color: color,
          time: formattedTime,
          valueText: number.format(sample.value) + ' ' + unitShort(),
          note: partial ? '仅部分 GPU 参与算力折算' : ''
        };

        dot.addEventListener('pointermove', function (event) {
          if (event.pointerType === 'touch') return;
          if (activeDot && activeDot !== dot) activeDot.classList.remove('is-active');
          activeDot = dot;
          dot.classList.add('is-active');
          highlight(index);
          showCrosshair(px);
          showTooltip(tipInfo, event.clientX, event.clientY);
        });
        dot.addEventListener('pointerleave', clearHighlight);
        dot.addEventListener('focus', function () {
          var rect = dot.getBoundingClientRect();
          if (activeDot && activeDot !== dot) activeDot.classList.remove('is-active');
          activeDot = dot;
          dot.classList.add('is-active');
          highlight(index);
          showCrosshair(px);
          showTooltip(tipInfo, rect.right, rect.top);
        });
        dot.addEventListener('blur', clearHighlight);

        marks.push(dot);
        allDots.push(dot);
      });

      if (currentSeg.length) segments.push(currentSeg);

      if (segments.length) {
        var paths = buildSeriesPaths(segments, baselineY);
        if (paths.area) {
          var gradId = 'gpu-area-grad-' + index;
          var grad = svgNode('linearGradient', { id: gradId, x1: '0', y1: '0', x2: '0', y2: '1' });
          var stopTop = svgNode('stop', { offset: '0%', 'stop-opacity': '0.55' });
          stopTop.style.stopColor = color;
          var stopBot = svgNode('stop', { offset: '100%', 'stop-opacity': '0' });
          stopBot.style.stopColor = color;
          grad.append(stopTop, stopBot);
          defs.append(grad);

          var area = svgNode('path', {
            d: paths.area,
            fill: 'url(#' + gradId + ')',
            class: 'gpu-chart-area' + (isSolo ? ' is-solo' : '')
          });
          marks.push(area);
          areaNodes.push(area);
        }

        if (paths.stroke) {
          var line = svgNode('path', { d: paths.stroke, fill: 'none', class: 'gpu-chart-trace', pathLength: 1 });
          line.style.stroke = color;
          marks.push(line);
          lineNodes.push(line);

          var hit = svgNode('path', { d: paths.stroke, fill: 'none', class: 'gpu-chart-hit', 'aria-hidden': 'true' });
          hit.addEventListener('pointermove', function (event) {
            if (event.pointerType === 'touch') return;
            highlight(index);
            showTooltip({
              name: name,
              color: color,
              valueText: '窗口累计 ' + number.format(shares.get(name) || 0) + ' ' + unitShort(),
              note: '占比 ' + share + ' · 点击图例单独查看'
            }, event.clientX, event.clientY);
          });
          hit.addEventListener('pointerleave', clearHighlight);
          hit.addEventListener('click', function () {
            toggleSeriesFocus(name, false);
          });
          hitPaths.push(hit);
        }
      }

      var key = document.createElement('li');
      var button = document.createElement('button');
      button.type = 'button';
      button.style.setProperty('--series', color);
      button.dataset.gpuSeries = name;
      var fraction = document.createElement('span');
      fraction.className = 'gpu-series-fraction';
      fraction.textContent = share;
      button.append(name, fraction);
      button.setAttribute('aria-pressed', String(selectedSeries === name));
      if (series.has(name)) {
        button.addEventListener('pointerenter', function (event) {
          if (event.pointerType !== 'touch') highlight(index);
        });
        button.addEventListener('pointerleave', clearHighlight);
        button.addEventListener('focus', function () { highlight(index); });
        button.addEventListener('blur', clearHighlight);
      }
      button.addEventListener('click', function () {
        toggleSeriesFocus(name, false);
      });
      key.append(button);
      legendDaily.append(key);
      if (name === focusedSeries) restoreFocus = button;
    });

    sharePanel.hidden = !totalUsage;
    if (totalUsage) {
      shareTotal.textContent = '窗口合计 ' + number.format(totalUsage) + ' ' + unitShort();
    }

    plot.append(...areaNodes, ...lineNodes, ...hitPaths, ...allDots);
    chart.append(svg, tooltip);

    bindChartViewport(svg, bounds, function (view) {
      currentView = view;
      axes.replaceChildren();
      var xRight = bounds.x + bounds.width;
      for (var i = 0; i <= 4; i += 1) {
        var tickY = bounds.y + bounds.height * i / 4;
        var value = max * (1 - (view.top + bounds.height * i / (4 * view.scale)) / bounds.height);
        axes.append(
          svgNode('line', {
            x1: bounds.x,
            x2: xRight,
            y1: tickY.toFixed(2),
            y2: tickY.toFixed(2),
            class: i === 4 ? 'gpu-chart-baseline' : 'gpu-chart-gridline'
          }),
          svgNode('text', {
            x: 58,
            y: tickY.toFixed(2),
            'text-anchor': 'end',
            dy: '.35em',
            class: 'gpu-chart-y-tick'
          }, value >= 10000 ? compactTick.format(value) : number.format(Math.max(0, value)))
        );
      }
      var ticks = points.map(function (point, i) {
        return { key: point.key, x: bounds.x + (x(i) - bounds.x - view.left) * view.scale, index: i };
      }).filter(function (tick) { return tick.x >= bounds.x - .01 && tick.x <= xRight + .01; });
      var last = ticks.at(-1);
      var previous = -Infinity;
      ticks.forEach(function (tick) {
        var step = eightHourView ? 3 : dailyView ? 5 : shortView ? 4 : 4;
        if (tick !== last && ((view.scale === 1 && tick.index % step !== 0) ||
            last.x - tick.x < 72 || tick.x - previous < 72)) return;
        axes.append(svgNode('text', {
          x: tick.x.toFixed(2),
          y: 280,
          'text-anchor': 'middle',
          class: 'gpu-chart-x-tick'
        }, dailyView || eightHourView
          ? tick.key.slice(5, 10)
          : tick.key.slice(11) + (tick.key.length === 13 ? ':00' : '')));
        previous = tick.x;
      });
      plot.setAttribute('transform', 'translate(' + bounds.x + ' ' + bounds.y + ') scale(' + view.scale +
        ') translate(' + (-bounds.x - view.left) + ' ' + (-bounds.y - view.top) + ')');
      svg.style.setProperty('--gpu-inverse-zoom', 1 / view.scale);
      allDots.forEach(function (dot) {
        var px = dot.cx.baseVal.value - bounds.x - view.left;
        var py = dot.cy.baseVal.value - bounds.y - view.top;
        var visible = px >= -.01 && px <= bounds.width / view.scale + .01 && py >= -.01 && py <= bounds.height / view.scale + .01;
        dot.setAttribute('tabindex', visible ? '0' : '-1');
      });
      clearHighlight();
    });
    restoreFocus?.focus({ preventScroll: true });
  }

  function changeRange(index) {
    days = [-2, -1, 0, 7, 30][index];
    viewport = null;
    stops.forEach(function (item, i) { item.setAttribute('aria-pressed', String(i === index)); });
    renderDaily(true);
  }

  stops.forEach(function (button) {
    button.addEventListener('click', function () {
      changeRange(Number(button.dataset.gpuStop));
    });
  });

  dateInput.addEventListener('change', function () {
    if (!dateInput.validity.valid) {
      dateInput.value = selectedDate || dateInput.max;
      return;
    }
    selectedDate = dateInput.value === dateInput.max ? '' : dateInput.value;
    var month = selectedDate.slice(0, 7);
    if (archives.get(month)?.state === 'error') archives.delete(month);
    viewport = null;
    renderDaily(true);
  });

  renderDaily();

  function refreshClock() {
    if (renderedHour !== Math.floor(Date.now() / (days === -2 ? fiveMinutesMs : hourMs))) renderDaily();
  }

  function scheduleClockRefresh() {
    window.setTimeout(function () {
      refreshClock();
      scheduleClockRefresh();
    }, fiveMinutesMs - Date.now() % fiveMinutesMs + 50);
  }
  scheduleClockRefresh();
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) refreshClock();
  });

  function complete(item) {
    return item.mib_minutes > 0 && item.rated_mib_minutes === item.mib_minutes;
  }

  function metric(item) {
    return sort === 'memory' ? item.mib_minutes : item.h100_hours;
  }

  function band(value, best) {
    var ratio = value / best;
    if (ratio >= 0.75) return 'high';
    if (ratio >= 0.4) return 'mid';
    if (ratio >= 0.15) return 'mid-low';
    return 'low';
  }

  function renderLeaders(ranked, best) {
    var eligible = (sort === 'memory' ? ranked : ranked.filter(complete)).slice(0, 3);
    var weeklySum = ranked.reduce(function (sum, item) {
      return sum + (sort === 'memory' ? item.mib_minutes : (complete(item) ? item.h100_hours : 0));
    }, 0);

    leaders.replaceChildren();
    leaders.hidden = eligible.length === 0;
    var labels = ['#1 榜首', '#2 榜眼', '#3 探花'];

    eligible.forEach(function (item, index) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'gpu-podium-card gpu-podium-card--' + (index + 1);
      card.dataset.band = band(metric(item), best);
      card.dataset.account = item.nickname;
      card.setAttribute('aria-pressed', String(selectedSeries === item.nickname));
      card.title = '点击在趋势图中聚焦 ' + item.nickname;

      var top = document.createElement('div');
      top.className = 'gpu-podium__top';
      var rank = document.createElement('span');
      rank.className = 'gpu-podium__rank';
      rank.textContent = labels[index];
      var shareEl = document.createElement('span');
      shareEl.className = 'gpu-podium__share';
      shareEl.textContent = weeklySum > 0 ? '占本周 ' + percent.format(metric(item) / weeklySum) : '';
      top.append(rank, shareEl);

      var user = document.createElement('div');
      user.className = 'gpu-podium__user';
      var dot = document.createElement('span');
      dot.className = 'gpu-user-dot';
      dot.style.setProperty('--user-color', colorFor(item.nickname));
      var name = document.createElement('span');
      name.className = 'gpu-podium__name';
      name.textContent = item.nickname;
      user.append(dot, name);

      var score = document.createElement('div');
      score.className = 'gpu-podium__score';
      var num = sort === 'memory'
        ? number.format(item.mib_minutes / (1024 * 60))
        : number.format(item.h100_hours);
      var unitEl = document.createElement('small');
      unitEl.textContent = unitShort();
      score.append(num, unitEl);

      card.append(top, user, score);
      card.addEventListener('click', function () {
        toggleSeriesFocus(item.nickname, true);
      });
      leaders.append(card);
    });
  }

  function renderTableRows(ranked, best) {
    body.replaceChildren();
    var q = searchQuery.trim().toLowerCase();
    var visibleCount = 0;

    ranked.forEach(function (item, index) {
      if (q && !item.nickname.toLowerCase().includes(q)) return;
      visibleCount += 1;

      var row = body.insertRow();
      row.dataset.account = item.nickname;
      var focused = selectedSeries === item.nickname;
      if (focused) row.classList.add('is-focused-account');

      var rank = document.createElement('span');
      var isRanked = sort === 'memory' || complete(item);
      var value = metric(item);
      if (isRanked && best > 0) row.dataset.band = band(value, best);
      rank.className = 'gpu-board__rank';
      rank.textContent = isRanked ? String(index + 1) : '—';
      row.insertCell().append(rank);

      var accountCell = row.insertCell();
      var accountWrap = document.createElement('span');
      accountWrap.className = 'gpu-account-cell';
      var dot = document.createElement('span');
      dot.className = 'gpu-user-dot';
      dot.style.setProperty('--user-color', colorFor(item.nickname));
      var pin = document.createElement('span');
      pin.className = 'gpu-account-pin';
      pin.textContent = '已聚焦';
      pin.hidden = !focused;
      accountWrap.append(dot, item.nickname, pin);
      accountCell.append(accountWrap);

      var memory = row.insertCell();
      var memVal = document.createElement('span');
      memVal.className = 'gpu-metric-val';
      memVal.textContent = number.format(item.mib_minutes / (1024 * 60));
      memory.append(memVal);

      var compute = row.insertCell();
      var measured = item.rated_mib_minutes > 0;
      var compVal = document.createElement('span');
      compVal.className = 'gpu-metric-val';
      compVal.textContent = measured ? number.format(item.h100_hours) : '—';
      compute.append(compVal);
      if (!complete(item)) {
        var label = document.createElement('small');
        label.textContent = measured
          ? '部分覆盖 · ' + percent.format(item.rated_mib_minutes / item.mib_minutes)
          : '未折算';
        compute.append(label);
      }

      var active = sort === 'memory' ? memory : compute;
      active.classList.add('is-selected');
      if (isRanked && best > 0) {
        var barRow = document.createElement('div');
        barRow.className = 'gpu-metric-bar-row';
        var ratioEl = document.createElement('span');
        ratioEl.className = 'gpu-metric-ratio';
        ratioEl.textContent = wholePercent.format(value / best);
        var track = document.createElement('span');
        var fill = document.createElement('span');
        track.className = 'gpu-board__track';
        track.setAttribute('aria-hidden', 'true');
        fill.style.width = Math.min(100, 100 * value / best) + '%';
        track.append(fill);
        barRow.append(ratioEl, track);
        active.append(barRow);
      }

      row.addEventListener('click', function () {
        toggleSeriesFocus(item.nickname, true);
      });
    });

    if (visibleCount === 0 && q) {
      var emptyRow = body.insertRow();
      var cell = emptyRow.insertCell();
      cell.colSpan = 4;
      cell.style.textAlign = 'center';
      cell.style.color = 'var(--muted)';
      cell.style.padding = '1.8rem 1rem';
      cell.textContent = '没有匹配「' + searchQuery.trim() + '」的账号';
    }
  }

  var lastRanked = [];
  var lastBest = 0;

  function render(animate) {
    controls.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.gpuSort === sort));
    });
    headers.forEach(function (heading) {
      if (heading.dataset.metric === sort) heading.setAttribute('aria-sort', 'descending');
      else heading.removeAttribute('aria-sort');
    });

    var ranked = items.slice().sort(function (a, b) {
      if (sort === 'compute') {
        var eligible = Number(complete(b)) - Number(complete(a));
        if (eligible) return eligible;
        if (complete(a) && b.h100_hours !== a.h100_hours) return b.h100_hours - a.h100_hours;
      }
      return b.mib_minutes - a.mib_minutes || a.nickname.localeCompare(b.nickname);
    });

    assignRankingColors(ranked);

    var best = sort === 'memory'
      ? ranked[0]?.mib_minutes
      : complete(ranked[0] || {}) ? ranked[0].h100_hours : 0;

    lastRanked = ranked;
    lastBest = best;

    rankingCount.hidden = ranked.length === 0;
    rankingCount.textContent = ranked.length + ' 位成员';
    searchWrap.hidden = ranked.length < 4;

    renderLeaders(ranked, best);
    renderTableRows(ranked, best);
    renderDaily(animate);
    syncFocusIndicators();
  }

  searchInput.addEventListener('input', function () {
    searchQuery = searchInput.value;
    renderTableRows(lastRanked, lastBest);
  });

  controls.forEach(function (button) {
    button.addEventListener('click', function () {
      if (sort === button.dataset.gpuSort) return;
      sort = button.dataset.gpuSort;
      viewport = null;
      render(true);
    });
  });

  async function refresh() {
    try {
      var ref = await fetch('https://api.github.com/repos/' + repo + '/git/ref/heads/gpu-usage-data', {
        cache: 'no-store',
        signal: AbortSignal.timeout(12000)
      });
      if (ref.status === 404 && !displayed) {
        status.textContent = '周榜尚未开始采集。';
        return;
      }
      if (!ref.ok) throw new Error('Data branch unavailable');
      var sha = (await ref.json()).object?.sha;
      if (!/^[\da-f]{40}$/.test(sha)) throw new Error('Invalid data revision');
      if (sha !== revision) {
        var response = await fetch('https://raw.githubusercontent.com/' + repo + '/' + sha + '/weekly.json', {
          signal: AbortSignal.timeout(12000)
        });
        if (!response.ok) throw new Error('Data unavailable');
        var fresh = await response.json();
        if (!Array.isArray(fresh.ranking)) throw new Error('Invalid weekly data');
        currentData = fresh;
        revision = sha;
      }
      var data = currentData;
      var sampled = new Date(data.source_time);
      week.textContent = data.week + ' · JST';

      if (data.capacity && data.capacity.mib > 0) {
        var totalGib = integerFmt.format(data.capacity.mib / 1024);
        var totalH100 = oneDecFmt.format(data.capacity.h100 || 0);
        capacityPill.textContent = '集群规模 ' + totalGib + ' GiB · ' + totalH100 + ' H100';
        capacityPill.hidden = false;
      } else {
        capacityPill.hidden = true;
      }

      var snapshot = sha;
      if (snapshot !== displayed) {
        var first = !displayed;
        displayed = snapshot;
        items = data.ranking;
        daily = data.daily || {};
        render(first);
        tableCard.hidden = items.length === 0;
        legend.hidden = tableCard.hidden;
      }
      if (!items.length) {
        status.textContent = '本周暂无采样记录。';
        return;
      }
      var timestamp = new Intl.DateTimeFormat('zh-CN', {
        dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Tokyo'
      }).format(sampled);
      var freshSample = Date.now() - sampled.getTime() < 15 * 60_000;
      var lastLabel = (freshSample ? '实时采样 · ' : '采样延迟 · ') + timestamp;
      if (status.textContent !== lastLabel && freshSample) {
        status.classList.add('gpu-sample-updated');
        window.setTimeout(function () { status.classList.remove('gpu-sample-updated'); }, 800);
      }
      status.dataset.sample = freshSample ? 'current' : 'delayed';
      status.textContent = lastLabel;
    } catch (error) {
      delete status.dataset.sample;
      status.textContent = displayed ? '刷新失败，仍显示上次数据。' : '周榜暂时无法读取。';
    } finally {
      window.setTimeout(refresh, refreshMs);
    }
  }
  await refresh();
}
