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
      var snapshot = data.week + '/' + data.source_time;
      if (snapshot !== displayed) {
        displayed = snapshot;
        items = data.ranking;
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
