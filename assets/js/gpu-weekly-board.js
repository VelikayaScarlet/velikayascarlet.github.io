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
  var days = 0;
  var slider = document.getElementById('gpu-daily-range');
  var stops = Array.from(document.querySelectorAll('[data-gpu-stop]'));
  var chart = document.getElementById('gpu-daily-chart');
  var legendDaily = document.getElementById('gpu-daily-legend');
  var periodTotals = document.getElementById('gpu-period-totals');
  var dailyUnit = document.getElementById('gpu-daily-unit');
  var selectedSeries = new Set();
  var zoomButton = document.getElementById('gpu-daily-zoom');
  var zoomed = false;

  zoomButton.addEventListener('click', function () {
    zoomed = !zoomed;
    if (!zoomed) selectedSeries.clear();
    renderDaily(true);
  });

  function svgNode(tag, attrs, label) {
    var node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(function ([key, value]) { node.setAttribute(key, value); });
    if (label !== undefined) node.textContent = label;
    return node;
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
      ['今日', date, daily[date]],
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
      var limit = rate > 0 && elapsed >= 0 ? rate * elapsed : null;
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
    zoomButton.disabled = true;
    zoomButton.textContent = zoomed ? '还原全部' : '放大所选';
    var today = new Date(Date.now() + 9 * 3600000);
    var date = today.toISOString().slice(0, 10);
    renderTotals(date);
    var unit = sort === 'memory' ? '显存小时（GiB·h）' : 'H100 等效小时（已折算卡）';
    var points = Array.from({ length: days || 24 }, function (_, index) {
      var key = days ? new Date(today.getTime() - (days - 1 - index) * 86400000).toISOString().slice(0, 10)
        : date + 'T' + String(index).padStart(2, '0');
      return { key: key, rows: days ? daily[key] : currentData?.hourly?.[key] };
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
    var picked = names.filter(function (name) { return selectedSeries.has(name); });
    zoomButton.disabled = !zoomed && !picked.length;
    var active = zoomed && picked.length ? picked : names;
    var series = new Map(active.map(function (name) {
      return [name, points.map(function (point) {
        var row = point.rows?.find(function (entry) { return entry.nickname === name; });
        if (!point.rows || (sort === 'compute' && row && !row.rated_mib_minutes)) return null;
        return { value: row ? usage(row) : 0, row: row };
      })];
    }));
    var svg = svgNode('svg', { viewBox: '0 0 620 230', role: 'group', 'aria-label': '所有账号 GPU 用量折线图' });
    if (animate) svg.classList.add('gpu-chart-enter');
    var values = Array.from(series.values()).flat().filter(Boolean).map(function (point) { return point.value; });
    var high = Math.max(0, ...values);
    var low = values.length ? Math.min(...values) : 0;
    var padding = Math.max((high - low) * .08, high * .005, .02);
    var min = zoomed ? Math.max(0, low - padding) : 0;
    var max = zoomed ? high + padding : Math.max(1, high);
    var x = function (i) { return 76 + i * 509 / (points.length - 1); };
    var y = function (value) { return 190 - 165 * (value - min) / (max - min); };
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
    for (var i = 0; i <= 4; i += 1) {
      var value = min + (max - min) * i / 4;
      svg.append(
        svgNode('line', { x1: x(0), x2: x(points.length - 1), y1: y(value), y2: y(value) }),
        svgNode('text', { x: 66, y: y(value), 'text-anchor': 'end', dy: '.35em' }, number.format(value))
      );
    }
    points.forEach(function (point, index) {
      var step = days === 7 ? 2 : days ? 7 : 6;
      var last = points.length - 1;
      if (index === last || (index % step === 0 && x(last) - x(index) >= 65)) {
        svg.append(svgNode('text', { x: x(index), y: 218, 'text-anchor': 'middle' },
          days ? point.key.slice(5) : point.key.slice(11) + ':00'));
      }
    });
    var hitPaths = [];
    var allDots = [];
    names.forEach(function (name, index) {
      var hue = (index * 137.508 + 161) % 360;
      var color = 'light-dark(hsl(' + hue + ' 68% 35%), hsl(' + hue + ' 77% 72%))';
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
        var label = name + ' · ' + point.key.replace('T', ' ') + (days ? '' : ':00') + ' · ' + number.format(value);
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
        svg.append(line);
        var hit = svgNode('path', { d: path, fill: 'none', class: 'gpu-chart-hit', 'aria-hidden': 'true' });
        bindHover(hit, name, index);
        hitPaths.push(hit);
      }
      var key = document.createElement('li');
      key.style.setProperty('--series', color);
      var button = document.createElement('button');
      button.type = 'button';
      button.dataset.gpuSeries = name;
      button.textContent = name;
      button.setAttribute('aria-pressed', selectedSeries.has(name));
      if (series.has(name)) {
        button.addEventListener('pointerenter', function (event) {
          if (event.pointerType !== 'touch') highlight(index);
        });
        button.addEventListener('pointerleave', clearHighlight);
        button.addEventListener('focus', function () { highlight(index); });
        button.addEventListener('blur', clearHighlight);
      }
      button.addEventListener('click', function () {
        if (!selectedSeries.delete(name)) selectedSeries.add(name);
        if (!selectedSeries.size) zoomed = false;
        renderDaily();
      });
      key.append(button);
      legendDaily.append(key);
      if (name === focusedSeries) restoreFocus = button;
    });
    svg.append(...hitPaths, ...allDots);
    chart.append(svg, tooltip);
    restoreFocus?.focus({ preventScroll: true });
  }
  function changeRange() {
    var index = slider.valueAsNumber;
    days = [0, 7, 30][index];
    zoomed = false;
    selectedSeries.clear();
    slider.setAttribute('aria-valuetext', stops[index].textContent);
    stops.forEach(function (item, i) { item.setAttribute('aria-pressed', i === index); });
    renderDaily(true);
  }

  slider.addEventListener('input', changeRange);
  stops.forEach(function (button) {
    button.addEventListener('click', function () {
      slider.value = button.dataset.gpuStop;
      changeRange();
    });
  });
  renderDaily();

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
