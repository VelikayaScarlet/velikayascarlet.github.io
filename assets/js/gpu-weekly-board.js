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
  var sort = 'memory';
  var items = [];
  var controls = document.querySelectorAll('[data-gpu-sort]');
  var headers = table.querySelectorAll('[data-metric]');
  var number = new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function complete(item) {
    return item.mib_minutes > 0 && item.rated_mib_minutes === item.mib_minutes;
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
    body.replaceChildren();
    var best = sort === 'memory'
      ? ranked[0]?.mib_minutes
      : complete(ranked[0] || {}) ? ranked[0].h100_hours : 0;
    ranked.forEach(function (item, index) {
      var row = body.insertRow();
      var rank = document.createElement('span');
      var isRanked = sort === 'memory' || complete(item);
      rank.className = 'gpu-board__rank' + (isRanked && index < 3 ? ' is-top' : '');
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
      var value = sort === 'memory' ? item.mib_minutes : item.h100_hours;
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

  try {
    var response = await fetch('https://raw.githubusercontent.com/VelikayaScarlet/velikayascarlet.github.io/gpu-usage-data/weekly.json', { cache: 'no-store' });
    if (response.status === 404) {
      status.textContent = '周榜尚未开始采集。';
      return;
    }
    if (!response.ok) throw new Error('Data unavailable');
    var data = await response.json();
    week.textContent = data.week + ' · JST';
    items = data.ranking;
    if (!items.length) {
      status.textContent = '本周暂无采样记录。';
      return;
    }
    status.textContent = '最近采样 · ' + new Intl.DateTimeFormat('zh-CN', {
      dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Tokyo'
    }).format(new Date(data.source_time));
    render();
    table.hidden = false;
  } catch (error) {
    status.textContent = '周榜暂时无法读取。';
  }
}
