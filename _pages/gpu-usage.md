---
permalink: /gpu-usage/
title: "GPU Weekly Usage"
layout: gpu-board
author_profile: false
---

<section class="gpu-board gpu-board--locked" lang="zh-CN" aria-label="进入 GPU 周榜" id="gpu-board-gate">
  <header class="gpu-board__mast">
    <div>
      <p class="gpu-board__source">KYOTO UNIVERSITY / KUEE</p>
      <h1>GPU 周榜</h1>
    </div>
    <svg class="gpu-board__chip" width="170" height="120" viewBox="0 0 170 120" fill="none" aria-hidden="true">
      <path class="gpu-board__trace" d="M6 31h33l14 14h9M6 60h56m-56 29h33l14-14h9m46-30h9l14-14h33m-56 29h56m-56 15h9l14 14h33M85 8v29m0 46v29"/>
      <rect x="62" y="37" width="46" height="46" rx="5" stroke="currentColor"/>
      <rect x="72" y="47" width="26" height="26" rx="3" fill="currentColor" fill-opacity=".12" stroke="currentColor"/>
      <path d="M80 60h10m-5-5v10" stroke="currentColor"/>
      <circle cx="6" cy="31" r="3" fill="currentColor"/><circle cx="164" cy="89" r="3" fill="currentColor"/>
    </svg>
  </header>
  <form class="gpu-board__gate">
    <label for="gpu-board-password">访问密码</label>
    <div class="gpu-board__gate-controls">
      <input id="gpu-board-password" type="password" required autocomplete="current-password" aria-describedby="gpu-board-gate-status">
      <button type="submit">进入周榜</button>
    </div>
    <p id="gpu-board-gate-status" role="status"></p>
  </form>
</section>
<section class="gpu-board" lang="zh-CN" aria-label="GPU 周榜" id="gpu-board-content" tabindex="-1" hidden>
  <header class="gpu-board__mast">
    <div>
      <p class="gpu-board__source">KYOTO UNIVERSITY / KUEE</p>
      <h1>GPU 周榜</h1>
    </div>
    <div class="gpu-board__meta">
      <span class="gpu-board__week" id="gpu-board-week">本周 · JST</span>
      <button type="button" id="gpu-board-lock" aria-label="锁定周榜" title="锁定周榜">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3m-4 4v3"/></svg>
      </button>
    </div>
  </header>
  <div class="gpu-board__toolbar">
    <div class="gpu-board__sort" role="group" aria-label="排名指标">
      <button type="button" data-gpu-sort="memory" aria-pressed="true">显存小时</button>
      <button type="button" data-gpu-sort="compute" aria-pressed="false">H100 等效小时</button>
    </div>
    <p id="gpu-week-status" role="status">正在读取周榜…</p>
  </div>
  <h2 class="gpu-ranking-heading">本周排名</h2>
  <div class="gpu-board__leaders" id="gpu-board-leaders" aria-label="前三名" hidden></div>
  <table id="gpu-week-ranking" aria-label="本周 GPU 占用排名" hidden>
    <thead>
      <tr>
        <th scope="col">排名</th><th scope="col">集群账号</th>
        <th scope="col" data-metric="memory" aria-sort="descending">显存小时 <small>GiB·h</small></th>
        <th scope="col" data-metric="compute">H100 等效 <small>小时 · 估算</small></th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
  <div class="gpu-board__legend" id="gpu-board-legend" hidden>
    <span>相对榜首</span>
    <span data-band="high">高分 ≥75%</span>
    <span data-band="mid">中分 40–75%</span>
    <span data-band="mid-low">中低分 15–40%</span>
    <span data-band="low">低分 &lt;15%</span>
  </div>
  <section class="gpu-daily" aria-labelledby="gpu-daily-title">
    <header class="gpu-daily-heading"><h2 id="gpu-daily-title">GPU 用量趋势</h2><span>JST</span></header>
    <div class="gpu-daily-grid">
      <div id="gpu-period-totals" class="gpu-period-totals"></div>
      <div class="gpu-daily-plot">
        <div class="gpu-daily-range">
          <input type="range" id="gpu-daily-range" min="0" max="2" step="1" value="0"
            aria-label="时间范围" aria-valuetext="今日逐小时">
          <div class="gpu-daily-stops">
            <button type="button" data-gpu-stop="0" aria-pressed="true">今日逐小时</button>
            <button type="button" data-gpu-stop="1" aria-pressed="false">7 Days</button>
            <button type="button" data-gpu-stop="2" aria-pressed="false">30 Days</button>
          </div>
        </div>
        <p id="gpu-daily-unit" aria-live="polite"></p>
        <div id="gpu-daily-chart"></div>
        <ul id="gpu-daily-legend" class="gpu-daily-legend" aria-label="集群账号"></ul>
      </div>
    </div>
  </section>
  <details class="gpu-board__notes">
    <summary>统计口径</summary>
    <p>Cloudflare 模式每 3 分钟采样，GitHub 原生备用模式每 5 分钟。日本时间周一归零；同卡多进程按账号汇总，漏采不补算。</p>
    <p>显存小时 = 实际占用显存 × 时间。H100 等效小时 = 相对 H100 SXM 的理论算力 × 个人占整卡显存比例 × 时间。优先按非稀疏 BF16 折算，旧卡用 FP16 Tensor 或 FP32 峰值。</p>
    <p>规格来源：<a href="https://resources.nvidia.com/en-us-hopper-architecture">Hopper</a>、<a href="https://www.nvidia.com/en-au/data-center/h100/">H100 NVL</a>、<a href="https://images.nvidia.com/data-center/a100/a100-datasheet.pdf">A100</a>、<a href="https://www.nvidia.com/en-gb/data-center/l40s/">L40S</a>、<a href="https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/support-guide/NVIDIA-L40-Datasheet-January-2023.pdf">L40</a>、<a href="https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/pdf/NVIDIA-RTX-Blackwell-PRO-GPU-Architecture-v1_1.pdf">RTX 系列</a>。</p>
  </details>
</section>
<script src="{{ '/assets/js/gpu-weekly-board.js' | relative_url }}?v=11" defer></script>
