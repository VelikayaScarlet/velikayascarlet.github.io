(function () {
  var gate = document.getElementById('gpu-board-gate');
  var board = document.getElementById('gpu-board-content');
  var input = document.getElementById('gpu-board-password');
  var message = document.getElementById('gpu-board-gate-status');
  var storageKey = 'gpu-weekly-board-kuee';
  var password = 'kuee';

  function unlock(moveFocus) {
    gate.hidden = true;
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
  var ranges = document.querySelectorAll('[data-gpu-days]');
  var chart = document.getElementById('gpu-daily-chart');
  var legendDaily = document.getElementById('gpu-daily-legend');
  var periodTotals = document.getElementById('gpu-period-totals');
  var dailyUnit = document.getElementById('gpu-daily-unit');

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
      var elapsed = (source - Date.parse(start + 'T00:00:00+09:00')) / 3600000;
      title.textContent = label;
      total.textContent = rows ? number.format(rows.reduce(function (sum, row) { return sum + usage(row); }, 0)) : '—';
      ceiling.textContent = '理论最大值 ' + (rate > 0 && elapsed >= 0 ? number.format(rate * elapsed) : '—');
      section.append(title, total, ceiling);
      periodTotals.append(section);
    });
  }

  function renderDaily() {
    chart.replaceChildren();
    legendDaily.replaceChildren();
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
    var svg = svgNode('svg', { viewBox: '0 0 620 230', role: 'group', 'aria-label': '所有账号 GPU 用量折线图' });
    var max = Math.max(1, ...points.flatMap(function (point) { return (point.rows || []).map(usage); }));
    var x = function (i) { return 76 + i * 509 / (points.length - 1); };
    var y = function (value) { return 190 - 165 * value / max; };
    for (var i = 0; i <= 4; i += 1) {
      var value = max * i / 4;
      svg.append(
        svgNode('line', { x1: x(0), x2: x(points.length - 1), y1: y(value), y2: y(value) }),
        svgNode('text', { x: 66, y: y(value), 'text-anchor': 'end', dy: '.35em' }, number.format(value))
      );
    }
    points.forEach(function (point, index) {
      if (index === points.length - 1 || (days === 7 ? index % 2 === 0 : index % (days ? 7 : 6) === 0)) {
        svg.append(svgNode('text', { x: x(index), y: 218, 'text-anchor': 'middle' },
          days ? point.key.slice(5) : point.key.slice(11) + ':00'));
      }
    });
    names.forEach(function (name, index) {
      var color = 'hsl(' + (index * 137.508 + 161) % 360 + ' 68% 35%)';
      var path = '';
      var dots = [];
      var connected = false;
      points.forEach(function (point, i) {
        var row = point.rows?.find(function (entry) { return entry.nickname === name; });
        if (!point.rows || (sort === 'compute' && row && !row.rated_mib_minutes)) {
          connected = false;
          return;
        }
        var value = row ? usage(row) : 0;
        path += (connected ? ' L' : ' M') + x(i) + ' ' + y(value);
        connected = true;
        var label = name + ' · ' + point.key.replace('T', ' ') + (days ? '' : ':00') + ' · ' + number.format(value);
        if (sort === 'compute' && row && !complete(row)) label += '（部分折算）';
        var dot = svgNode('circle', { cx: x(i), cy: y(value), r: 4, fill: color, tabindex: 0, 'aria-label': label });
        dot.append(svgNode('title', {}, label));
        dots.push(dot);
      });
      svg.append(svgNode('path', { d: path, fill: 'none', stroke: color }), ...dots);
      var key = document.createElement('li');
      key.style.setProperty('--series', color);
      key.textContent = name;
      legendDaily.append(key);
    });
    chart.append(svg);
  }
  ranges.forEach(function (button) {
    button.addEventListener('click', function () {
      days = Number(button.dataset.gpuDays);
      ranges.forEach(function (item) { item.setAttribute('aria-pressed', item === button); });
      renderDaily();
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

  function render() {
    renderDaily();
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
    button.addEventListener('click', function () { sort = button.dataset.gpuSort; render(); });
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
        displayed = snapshot;
        items = data.ranking;
        daily = data.daily || {};
        render();
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
      status.textContent = (Date.now() - sampled.getTime() >= 15 * 60_000 ? '采样延迟 · ' : '最近采样 · ') + timestamp;
    } catch (error) {
      status.textContent = displayed ? '刷新失败，仍显示上次数据。' : '周榜暂时无法读取。';
    } finally {
      window.setTimeout(refresh, refreshMs);
    }
  }
  await refresh();
}
