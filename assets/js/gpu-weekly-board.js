(function () {
  var gate = document.getElementById('gpu-board-gate');
  var board = document.getElementById('gpu-board-content');
  var input = document.getElementById('gpu-board-password');
  var message = document.getElementById('gpu-board-gate-status');
  var storageKey = 'gpu-weekly-board-kuee';
  var password = 'kuee';

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
      message.textContent = '密码不正确。';
      input.setAttribute('aria-invalid', 'true');
      input.select();
      return;
    }
    input.value = '';
    try { sessionStorage.setItem(storageKey, '1'); } catch (error) {}
    unlock(true);
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
  var table = document.getElementById('gpu-week-ranking');
  var body = table.tBodies[0];
  var leaders = document.getElementById('gpu-board-leaders');
  var sort = 'memory';
  var items = [];
  var controls = document.querySelectorAll('[data-gpu-sort]');
  var headers = table.querySelectorAll('[data-metric]');
  var legend = document.getElementById('gpu-board-legend');
  var number = new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var refreshMs = 120_000;
  var revision = '';
  var currentData;
  var displayed = '';
  var daily = {};
  var days = -1;
  var renderedHour;
  var hourMs = 3600000;
  var slider = document.getElementById('gpu-daily-range');
  var dateControl = document.getElementById('gpu-chart-date-control');
  var dateInput = document.getElementById('gpu-chart-date');
  var selectedDate = '';
  var stops = Array.from(document.querySelectorAll('[data-gpu-stop]'));
  var chart = document.getElementById('gpu-daily-chart');
  var legendDaily = document.getElementById('gpu-daily-legend');
  var periodTotals = document.getElementById('gpu-period-totals');
  var dailyUnit = document.getElementById('gpu-daily-unit');
  var selectedSeries = null;
  var sharePanel = document.getElementById('gpu-daily-share');
  var shareBar = sharePanel.querySelector('.gpu-share-bar');
  var zoomControls = Object.fromEntries(Array.from(document.querySelectorAll('[data-chart-zoom]'), function (button) {
    return [button.dataset.chartZoom, button];
  }));
  var viewport;
  var percent = new Intl.NumberFormat('zh-CN', { style: 'percent', maximumFractionDigits: 1 });

  function svgNode(tag, attrs, label) {
    var node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(function ([key, value]) { node.setAttribute(key, value); });
    if (label !== undefined) node.textContent = label;
    return node;
  }

  function bindChartViewport(svg, bounds, redraw) {
    var maxScale = 8;
    var pointers = new Map();
    var view = viewport || { scale: 1, left: 0, top: 0 };
    var center = { x: bounds.width / 2, y: bounds.height / 2 };

    function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
    function svgPoint(event) {
      var point = new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM().inverse());
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
      ['今日', date, daily[date] ?? (sampleDate < date ? [] : null)],
      ['本周', startOfWeek, sampleDate >= startOfWeek && sampleDate <= date ? items : null],
      ['本月', month + '-01', monthDays.length ? monthDays.flatMap(function (key) { return daily[key]; }) : null]
    ].forEach(function ([label, start, rows]) {
      var section = document.createElement('section');
      var title = document.createElement('strong');
      var total = document.createElement('div');
      var ceiling = document.createElement('small');
      var track = document.createElement('span');
      var elapsed = (source - Date.parse(start + 'T00:00:00+09:00')) / 3600000;
      var actual = rows?.reduce(function (sum, row) { return sum + usage(row); }, 0);
      var limit = rate > 0 && Number.isFinite(elapsed) ? rate * Math.max(0, elapsed) : null;
      title.textContent = label;
      total.textContent = actual === undefined ? '—' : number.format(actual);
      ceiling.textContent = '理论上限 ' + (limit === null ? '—' : number.format(limit));
      track.className = 'gpu-period-track';
      track.setAttribute('aria-hidden', 'true');
      track.style.setProperty('--fill', Math.min(100, limit ? (actual || 0) / limit * 100 : 0) + '%');
      section.append(title, total, track, ceiling);
      periodTotals.append(section);
    });
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
    renderedHour = Math.floor(now / hourMs);
    var today = new Date(now + 9 * hourMs);
    var date = today.toISOString().slice(0, 10);
    dateControl.hidden = days !== 0;
    dateInput.min = new Date(today.getTime() - 30 * 86400000).toISOString().slice(0, 10);
    dateInput.max = date;
    if (selectedDate && (selectedDate < dateInput.min || selectedDate > date)) selectedDate = '';
    var chartDate = selectedDate || date;
    dateInput.value = chartDate;
    renderTotals(date);
    var unit = sort === 'memory' ? '显存小时（GiB·h）' : 'H100 等效小时（已折算卡）';
    var dailyView = days > 0;
    var points = Array.from({ length: dailyView ? days : 24 }, function (_, index) {
      var key;
      if (dailyView) key = new Date(today.getTime() - (days - 1 - index) * 86400000).toISOString().slice(0, 10);
      else if (days === -1) key = new Date(today.getTime() - (23 - index) * hourMs).toISOString().slice(0, 13);
      else key = chartDate + 'T' + String(index).padStart(2, '0');
      return { key: key, rows: dailyView ? daily[key] : currentData?.hourly?.[key] };
    });
    dailyUnit.textContent = unit + ' · JST · 仅累计已采集数据；上限按当前卡量及截至最近采样的时长估算。';
    if (!points.some(function (point) { return point.rows; })) {
      chart.textContent = '这个时间范围还没有采样记录。';
      return;
    }
    var names = Array.from(new Set(points.flatMap(function (point) {
      return (point.rows || []).map(function (row) { return row.nickname; });
    }))).sort();
    if (!names.length) {
      chart.textContent = '该时间范围内没有记录到 GPU 占用。';
      return;
    }
    var shares = new Map();
    points.forEach(function (point) {
      (point.rows || []).forEach(function (row) {
        shares.set(row.nickname, (shares.get(row.nickname) || 0) + (usage(row) || 0));
      });
    });
    var totalUsage = Array.from(shares.values()).reduce(function (total, value) { return total + value; }, 0);
    var active = names.includes(selectedSeries) ? [selectedSeries] : names;
    var series = new Map(active.map(function (name) {
      return [name, points.map(function (point) {
        var row = point.rows?.find(function (entry) { return entry.nickname === name; });
        if (!point.rows || (sort === 'compute' && row && !row.rated_mib_minutes)) return null;
        return { value: row ? usage(row) : 0, row: row };
      })];
    }));
    var svg = svgNode('svg', { viewBox: '0 0 620 230', role: 'group', 'aria-label': active.length === 1 ? active[0] + ' GPU 用量折线图' : '全员 GPU 用量折线图' });
    if (animate) svg.classList.add('gpu-chart-enter');
    var values = Array.from(series.values()).flat().filter(Boolean).map(function (point) { return point.value; });
    var high = Math.max(0, ...values);
    var max = Math.max(1, high);
    var bounds = { x: 76, y: 25, width: 509, height: 165 };
    var x = function (i) { return bounds.x + i * bounds.width / (points.length - 1); };
    var y = function (value) { return bounds.y + bounds.height * (1 - value / max); };
    var tooltip = document.createElement('span');
    tooltip.className = 'gpu-chart-tooltip';
    tooltip.hidden = true;
    var visuals = [];
    var highlighted = null;
    var restoreFocus;
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
    function showTooltip(label, clientX, clientY) {
      var bounds = chart.getBoundingClientRect();
      tooltip.textContent = label;
      tooltip.hidden = false;
      tooltip.style.left = Math.max(0, Math.min(clientX - bounds.left + 12, bounds.width - tooltip.offsetWidth)) + 'px';
      tooltip.style.top = Math.max(0, clientY - bounds.top - tooltip.offsetHeight - 8) + 'px';
    }
    function clearHighlight() {
      tooltip.hidden = true;
      highlight(null);
    }
    function bindHover(node, label, index) {
      node.addEventListener('pointermove', function (event) {
        if (event.pointerType === 'touch') return;
        highlight(index);
        showTooltip(label, event.clientX, event.clientY);
      });
      node.addEventListener('pointerleave', clearHighlight);
    }
    var axes = svgNode('g', {});
    var clip = svgNode('clipPath', { id: 'gpu-chart-plot-clip' });
    clip.append(svgNode('rect', { x: bounds.x - 3, y: bounds.y - 3, width: bounds.width + 6, height: bounds.height + 6 }));
    var defs = svgNode('defs', {});
    defs.append(clip);
    var frame = svgNode('g', { 'clip-path': 'url(#gpu-chart-plot-clip)' });
    var plot = svgNode('g', { class: 'gpu-chart-world' });
    var surface = svgNode('rect', { ...bounds, fill: 'transparent' });
    frame.append(surface, plot);
    svg.append(defs, axes, frame);
    var hitPaths = [];
    var allDots = [];
    names.forEach(function (name, index) {
      var hue = (index * 137.508 + 161) % 360;
      var color = 'light-dark(hsl(' + hue + ' 68% 35%), hsl(' + hue + ' 77% 72%))';
      var ratio = totalUsage ? (shares.get(name) || 0) / totalUsage : 0;
      var share = totalUsage ? (ratio > 0 && ratio < .001 ? '<0.1%' : percent.format(ratio)) : '—';
      if (ratio > 0) {
        var segment = document.createElement('span');
        segment.style.flex = ratio + ' 1 0px';
        segment.style.background = color;
        segment.title = name + ' · ' + share;
        shareBar.append(segment);
      }
      var path = '';
      var marks = visuals[index] = [];
      var connected = false;
      series.get(name)?.forEach(function (sample, i) {
        var point = points[i];
        if (!sample) {
          connected = false;
          return;
        }
        var value = sample.value;
        path += (connected ? ' L' : ' M') + x(i) + ' ' + y(value);
        connected = true;
        var label = name + ' · ' + point.key.replace('T', ' ') + (dailyView ? '' : ':00') + ' · ' + number.format(value);
        if (sort === 'compute' && sample.row && !complete(sample.row)) label += '（部分折算）';
        var dot = svgNode('circle', { cx: x(i), cy: y(value), r: 2.1, class: 'gpu-chart-point', tabindex: 0, 'aria-label': label });
        dot.style.fill = color;
        bindHover(dot, label, index);
        dot.addEventListener('focus', function () {
          var rect = dot.getBoundingClientRect();
          highlight(index);
          showTooltip(label, rect.right, rect.top);
        });
        dot.addEventListener('blur', clearHighlight);
        marks.push(dot);
        allDots.push(dot);
      });
      if (path) {
        var line = svgNode('path', { d: path, fill: 'none', class: 'gpu-chart-trace', pathLength: 1 });
        line.style.stroke = color;
        marks.push(line);
        plot.append(line);
        var hit = svgNode('path', { d: path, fill: 'none', class: 'gpu-chart-hit', 'aria-hidden': 'true' });
        bindHover(hit, name, index);
        hitPaths.push(hit);
      }
      var key = document.createElement('li');
      key.style.setProperty('--series', color);
      var button = document.createElement('button');
      button.type = 'button';
      button.dataset.gpuSeries = name;
      var fraction = document.createElement('span');
      fraction.className = 'gpu-series-fraction';
      fraction.textContent = share;
      button.append(name, ' ', fraction);
      button.setAttribute('aria-pressed', selectedSeries === name);
      if (series.has(name)) {
        button.addEventListener('pointerenter', function (event) {
          if (event.pointerType !== 'touch') highlight(index);
        });
        button.addEventListener('pointerleave', clearHighlight);
        button.addEventListener('focus', function () { highlight(index); });
        button.addEventListener('blur', clearHighlight);
      }
      button.addEventListener('click', function () {
        selectedSeries = selectedSeries === name ? null : name;
        viewport = null;
        renderDaily();
      });
      key.append(button);
      legendDaily.append(key);
      if (name === focusedSeries) restoreFocus = button;
    });
    sharePanel.hidden = !totalUsage;
    plot.append(...hitPaths, ...allDots);
    chart.append(svg, tooltip);
    bindChartViewport(svg, bounds, function (view) {
      axes.replaceChildren();
      var xRight = bounds.x + bounds.width;
      for (var i = 0; i <= 4; i += 1) {
        var tickY = bounds.y + bounds.height * i / 4;
        var value = max * (1 - (view.top + bounds.height * i / (4 * view.scale)) / bounds.height);
        axes.append(
          svgNode('line', { x1: bounds.x, x2: xRight, y1: tickY, y2: tickY }),
          svgNode('text', { x: 66, y: tickY, 'text-anchor': 'end', dy: '.35em' }, number.format(Math.max(0, value)))
        );
      }
      var ticks = points.map(function (point, i) {
        return { key: point.key, x: bounds.x + (x(i) - bounds.x - view.left) * view.scale, index: i };
      }).filter(function (tick) { return tick.x >= bounds.x - .01 && tick.x <= xRight + .01; });
      var last = ticks.at(-1);
      var previous = -Infinity;
      ticks.forEach(function (tick) {
        var step = days === 7 ? 2 : dailyView ? 7 : 6;
        if (tick !== last && ((view.scale === 1 && tick.index % step !== 0) ||
            last.x - tick.x < 65 || tick.x - previous < 65)) return;
        axes.append(svgNode('text', { x: tick.x, y: 218, 'text-anchor': 'middle' },
          dailyView ? tick.key.slice(5) : tick.key.slice(11) + ':00'));
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
  function changeRange() {
    var index = slider.valueAsNumber;
    days = [-1, 0, 7, 30][index];
    viewport = null;
    slider.setAttribute('aria-valuetext', stops[index].textContent);
    stops.forEach(function (item, i) { item.setAttribute('aria-pressed', i === index); });
    renderDaily(true);
  }

  slider.addEventListener('input', changeRange);
  dateInput.addEventListener('change', function () {
    if (!dateInput.validity.valid) {
      dateInput.value = selectedDate || dateInput.max;
      return;
    }
    selectedDate = dateInput.value === dateInput.max ? '' : dateInput.value;
    viewport = null;
    renderDaily(true);
  });
  stops.forEach(function (button) {
    button.addEventListener('click', function () {
      slider.value = button.dataset.gpuStop;
      changeRange();
    });
  });
  renderDaily();

  function refreshClock() {
    if (renderedHour !== Math.floor(Date.now() / hourMs)) renderDaily();
  }

  function scheduleClockRefresh() {
    window.setTimeout(function () {
      refreshClock();
      scheduleClockRefresh();
    }, hourMs - Date.now() % hourMs + 50);
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
    leaders.replaceChildren();
    leaders.hidden = eligible.length === 0;
    eligible.forEach(function (item, index) {
      var slot = document.createElement('div');
      var place = document.createElement('span');
      var name = document.createElement('strong');
      var score = document.createElement('span');
      slot.dataset.band = band(metric(item), best);
      place.className = 'gpu-board__leader-place';
      place.textContent = String(index + 1).padStart(2, '0');
      name.textContent = item.nickname;
      score.className = 'gpu-board__leader-score';
      score.textContent = sort === 'memory'
        ? number.format(item.mib_minutes / (1024 * 60)) + ' GiB·h'
        : number.format(item.h100_hours) + ' H100·h';
      slot.append(place, name, score);
      leaders.append(slot);
    });
  }

  function render(animate) {
    renderDaily(animate);
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
    var best = sort === 'memory'
      ? ranked[0]?.mib_minutes
      : complete(ranked[0] || {}) ? ranked[0].h100_hours : 0;
    renderLeaders(ranked, best);
    body.replaceChildren();
    ranked.forEach(function (item, index) {
      var row = body.insertRow();
      var rank = document.createElement('span');
      var isRanked = sort === 'memory' || complete(item);
      var value = metric(item);
      if (isRanked && best > 0) row.dataset.band = band(value, best);
      rank.className = 'gpu-board__rank';
      rank.textContent = isRanked ? String(index + 1) : '—';
      row.insertCell().append(rank);
      row.insertCell().textContent = item.nickname;
      var memory = row.insertCell();
      memory.textContent = number.format(item.mib_minutes / (1024 * 60));
      var compute = row.insertCell();
      var measured = item.rated_mib_minutes > 0;
      compute.textContent = measured ? number.format(item.h100_hours) : '—';
      if (!complete(item)) {
        var label = document.createElement('small');
        label.textContent = measured
          ? '部分覆盖 · ' + new Intl.NumberFormat('zh-CN', { style: 'percent', maximumFractionDigits: 1 }).format(item.rated_mib_minutes / item.mib_minutes)
          : '未折算';
        compute.append(label);
      }
      var active = sort === 'memory' ? memory : compute;
      active.classList.add('is-selected');
      if (isRanked && best > 0) {
        var track = document.createElement('span');
        var fill = document.createElement('span');
        track.className = 'gpu-board__track';
        track.setAttribute('aria-hidden', 'true');
        fill.style.width = Math.min(100, 100 * value / best) + '%';
        track.append(fill);
        active.append(track);
      }
    });
  }

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
      var repo = 'VelikayaScarlet/velikayascarlet.github.io';
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
      var snapshot = sha;
      if (snapshot !== displayed) {
        var first = !displayed;
        displayed = snapshot;
        items = data.ranking;
        daily = data.daily || {};
        render(first);
        table.hidden = items.length === 0;
        legend.hidden = table.hidden;
      }
      if (!items.length) {
        status.textContent = '本周暂无采样记录。';
        return;
      }
      var timestamp = new Intl.DateTimeFormat('zh-CN', {
        dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Tokyo'
      }).format(sampled);
      var freshSample = Date.now() - sampled.getTime() < 15 * 60_000;
      var lastLabel = (freshSample ? '最近采样 · ' : '采样延迟 · ') + timestamp;
      if (status.textContent !== lastLabel && freshSample) {
        status.classList.add('gpu-sample-updated');
        window.setTimeout(function () { status.classList.remove('gpu-sample-updated'); }, 700);
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
