---
permalink: /gpu-usage/
title: "GPU Weekly Usage"
author_profile: false
---

<p>京都大学 GPU 看板 · 每周显存占用（日本时间）</p>
<p>每 5 分钟采样一次，按进程实际占用显存累计。单位 GiB·h；漏采不补算。只展示同意公开的参与者昵称，不代表算力或工作量。</p>
<p id="gpu-week-status" role="status">正在读取周榜…</p>
<table id="gpu-week-ranking" aria-label="本周显存占用排名" hidden>
  <thead><tr><th scope="col">排名</th><th scope="col">昵称</th><th scope="col">显存占用（GiB·h）</th></tr></thead>
  <tbody></tbody>
</table>

<script>
(async function () {
  var status = document.getElementById('gpu-week-status');
  var table = document.getElementById('gpu-week-ranking');
  var body = table.tBodies[0];
  try {
    var response = await fetch('https://raw.githubusercontent.com/VelikayaScarlet/velikayascarlet.github.io/gpu-usage-data/weekly.json', { cache: 'no-store' });
    if (response.status === 404) {
      status.textContent = '周榜尚未开始采集。';
      return;
    }
    if (!response.ok) throw new Error('Data unavailable');
    var data = await response.json();
    if (!data.ranking.length) {
      status.textContent = data.week + '：暂无参与者的采样记录。';
      return;
    }
    status.textContent = data.week + ' · 最近一次有效采样：' + new Intl.DateTimeFormat('zh-CN', {
      dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Tokyo'
    }).format(new Date(data.source_time)) + '（日本时间）';
    data.ranking.forEach(function (item, index) {
      var row = body.insertRow();
      [index + 1, item.nickname, (item.mib_minutes / (1024 * 60)).toFixed(2)].forEach(function (value) {
        row.insertCell().textContent = value;
      });
    });
    table.hidden = false;
  } catch (error) {
    status.textContent = '周榜暂时无法读取。';
  }
})();
</script>
