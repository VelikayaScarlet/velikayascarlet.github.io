(async function () {
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
      (sort === 'memory' ? memory : compute).classList.add('is-selected');
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
})();
