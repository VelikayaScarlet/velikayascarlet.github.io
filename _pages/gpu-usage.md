---
permalink: /gpu-usage/
title: "GPU Weekly Usage"
layout: gpu-board
author_profile: false
---

<section class="gpu-gate-wrap" lang="zh-CN" aria-label="进入 GPU 算力周榜" id="gpu-board-gate">
  <div class="gpu-gate-card">
    <div class="gpu-gate-card__head">
      <div class="gpu-gate-emblem" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">
          <rect x="6" y="6" width="12" height="12" rx="2.5"/>
          <rect x="9.5" y="9.5" width="5" height="5" rx="1"/>
          <path d="M9 2.5v3.5M15 2.5v3.5M9 18v3.5M15 18v3.5M2.5 9h3.5M2.5 15h3.5M18 9h3.5M18 15h3.5"/>
        </svg>
      </div>
      <p class="gpu-eyebrow">KYOTO UNIVERSITY · KUEE</p>
      <h1>GPU 算力周榜</h1>
      <p class="gpu-gate-subtitle">集群显存小时与 H100 等效算力实时观测面板</p>
    </div>
    <form class="gpu-gate-form">
      <label for="gpu-board-password">访问密码</label>
      <div class="gpu-password-field">
        <svg class="gpu-password-icon" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="4.5" y="9" width="11" height="8" rx="2"/>
          <path d="M7 9V6.5a3 3 0 1 1 6 0V9"/>
        </svg>
        <input id="gpu-board-password" type="password" placeholder="输入密码以解锁面板" required autocomplete="current-password" aria-describedby="gpu-board-gate-status">
        <button type="button" class="gpu-password-toggle" id="gpu-password-toggle" aria-label="显示密码" aria-pressed="false" title="显示/隐藏密码">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M2.5 10s2.8-5 7.5-5 7.5 5 7.5 5-2.8 5-7.5 5-7.5-5-7.5-5Z"/>
            <circle cx="10" cy="10" r="2.2"/>
          </svg>
        </button>
      </div>
      <button type="submit" class="gpu-gate-submit">
        <span>解锁周榜</span>
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 10h11M11 5.5 15.5 10 11 14.5"/></svg>
      </button>
      <p id="gpu-board-gate-status" class="gpu-gate-status" role="status"></p>
    </form>
  </div>
</section>

<section class="gpu-board" lang="zh-CN" aria-label="GPU 算力周榜" id="gpu-board-content" tabindex="-1" hidden>
  <header class="gpu-hero">
    <div class="gpu-hero__title-group">
      <div class="gpu-hero__badges">
        <span class="gpu-pill gpu-pill--origin">京都大学 · KUEE</span>
        <span class="gpu-pill gpu-pill--week" id="gpu-board-week">本周 · JST</span>
        <span class="gpu-pill gpu-pill--capacity" id="gpu-cluster-capacity" hidden></span>
      </div>
      <h1><span lang="en" class="gpu-hero__en">GPU</span> 算力周榜</h1>
      <p id="gpu-week-status" class="gpu-sample-status" role="status">正在连接集群数据…</p>
    </div>
    <div class="gpu-hero__actions">
      <div class="gpu-metric-switch" role="group" aria-label="用量指标">
        <button type="button" data-gpu-sort="memory" aria-pressed="true">
          <span>显存小时</span>
          <small>GiB·h</small>
        </button>
        <button type="button" data-gpu-sort="compute" aria-pressed="false">
          <span>H100 等效</span>
          <small>H100·h</small>
        </button>
      </div>
      <button type="button" id="gpu-board-lock" class="gpu-icon-btn" aria-label="锁定周榜" title="锁定周榜">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="5" y="10" width="14" height="11" rx="2.5"/>
          <path d="M8 10V7a4 4 0 1 1 8 0v3"/>
        </svg>
      </button>
    </div>
  </header>

  <section class="gpu-section gpu-daily" aria-labelledby="gpu-daily-title">
    <div class="gpu-section__head">
      <div class="gpu-section__title-wrap">
        <span class="gpu-section__index" aria-hidden="true">01</span>
        <h2 class="gpu-section__title" id="gpu-daily-title">用量趋势</h2>
        <button type="button" class="gpu-active-filter" id="gpu-active-filter" hidden>
          <span class="gpu-active-filter__dot" aria-hidden="true"></span>
          <span class="gpu-active-filter__name"></span>
          <span class="gpu-active-filter__close" aria-hidden="true">×</span>
        </button>
      </div>
      <p id="gpu-daily-unit" class="gpu-daily-unit" aria-live="polite"></p>
    </div>

    <div class="gpu-daily-grid">
      <div class="gpu-card gpu-chart-card">
        <div class="gpu-chart-toolbar">
          <div class="gpu-range-tabs" role="group" aria-label="时间范围">
            <button type="button" data-gpu-stop="0" aria-pressed="false">最近 2 小时</button>
            <button type="button" data-gpu-stop="1" aria-pressed="true">最近 24 小时</button>
            <button type="button" data-gpu-stop="2" aria-pressed="false">当天</button>
            <button type="button" data-gpu-stop="3" aria-pressed="false">7 天</button>
            <button type="button" data-gpu-stop="4" aria-pressed="false">30 天</button>
          </div>
          <div class="gpu-chart-toolbar__right">
            <label class="gpu-chart-date" id="gpu-chart-date-control" hidden>
              <span>日期 · JST</span>
              <input type="date" id="gpu-chart-date">
            </label>
            <div class="gpu-chart-controls" role="group" aria-label="图表缩放">
              <button type="button" data-chart-zoom="out" aria-label="缩小图表" title="缩小图表" disabled>−</button>
              <button type="button" data-chart-zoom="reset" aria-label="恢复原始视图" title="恢复原始视图" disabled>1×</button>
              <button type="button" data-chart-zoom="in" aria-label="放大图表" title="放大图表" disabled>+</button>
            </div>
          </div>
        </div>

        <div id="gpu-daily-chart" class="gpu-chart-canvas"></div>

        <div class="gpu-daily-series">
          <div id="gpu-daily-share" class="gpu-share" hidden>
            <div class="gpu-share__head">
              <strong>窗口内全员用量占比</strong>
              <span id="gpu-share-total" class="gpu-share__total"></span>
            </div>
            <div class="gpu-share-bar" aria-hidden="true"></div>
          </div>
          <ul id="gpu-daily-legend" class="gpu-daily-legend" aria-label="集群账号图例"></ul>
        </div>
      </div>

      <aside id="gpu-period-totals" class="gpu-period-totals" aria-label="今日、本周与本月累计用量"></aside>
    </div>
  </section>

  <section class="gpu-section gpu-ranking" aria-labelledby="gpu-ranking-title">
    <div class="gpu-section__head">
      <div class="gpu-section__title-wrap">
        <span class="gpu-section__index" aria-hidden="true">02</span>
        <h2 class="gpu-section__title" id="gpu-ranking-title">本周排名</h2>
        <span class="gpu-count-badge" id="gpu-ranking-count" hidden></span>
      </div>
      <div class="gpu-section__tools">
        <label class="gpu-search-box" id="gpu-search-wrap" hidden>
          <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="9" r="5.5"/><path d="M13.5 13.5 17 17"/></svg>
          <input type="search" id="gpu-account-search" placeholder="筛选账号…" aria-label="筛选集群账号">
        </label>
      </div>
    </div>

    <div class="gpu-ranking-grid">
      <div class="gpu-podium" id="gpu-board-leaders" aria-label="本周前三名" hidden></div>

      <div class="gpu-card gpu-table-card" id="gpu-table-card" hidden>
        <div class="gpu-table-wrap">
          <table id="gpu-week-ranking" aria-labelledby="gpu-ranking-title">
            <thead>
              <tr>
                <th scope="col">排名</th>
                <th scope="col">集群账号</th>
                <th scope="col" data-metric="memory" aria-sort="descending">显存小时 <small>GiB·h</small></th>
                <th scope="col" data-metric="compute">H100 等效 <small>小时 · 估算</small></th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
        <div class="gpu-table-footer" id="gpu-board-legend" hidden>
          <div class="gpu-band-legend">
            <span class="gpu-band-legend__label">相对榜首</span>
            <span class="gpu-band-chip" data-band="high">高分 ≥75%</span>
            <span class="gpu-band-chip" data-band="mid">中分 40–75%</span>
            <span class="gpu-band-chip" data-band="mid-low">中低分 15–40%</span>
            <span class="gpu-band-chip" data-band="low">低分 &lt;15%</span>
          </div>
          <span class="gpu-table-hint">点击任意账号行，可在上方趋势图中聚焦其曲线</span>
        </div>
      </div>
    </div>
  </section>

  <details class="gpu-notes">
    <summary>
      <span class="gpu-notes__title">
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7.5"/><path d="M10 9v4.2M10 6.2h.01"/></svg>
        统计口径与折算说明
      </span>
      <svg class="gpu-notes__chevron" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 7.75 10 12.25l4.5-4.5"/></svg>
    </summary>
    <div class="gpu-notes__grid">
      <div class="gpu-notes__item">
        <h3>采样与周期</h3>
        <p>Cloudflare 模式每 3 分钟采样，GitHub 原生备用模式每 5 分钟。日本时间（JST）周一 00:00 归零；同卡多进程按账号汇总，漏采不补算。</p>
      </div>
      <div class="gpu-notes__item">
        <h3>归档与窗口</h3>
        <p>小时和日汇总按日本时间逐月归档，可在「当天」视图选择较早的历史日期。5 分钟精细明细保留最近 4 小时。</p>
      </div>
      <div class="gpu-notes__item">
        <h3>指标定义</h3>
        <p><strong>显存小时</strong> = 实际占用显存 × 时间。<strong>H100 等效小时</strong> = 相对 H100 SXM 的理论算力 × 个人占整卡显存比例 × 时间（优先非稀疏 BF16，旧卡取 FP16 Tensor 或 FP32 峰值）。</p>
      </div>
      <div class="gpu-notes__item">
        <h3>规格参考</h3>
        <p class="gpu-spec-links">
          <a href="https://resources.nvidia.com/en-us-hopper-architecture" target="_blank" rel="noopener noreferrer">Hopper</a>
          <a href="https://www.nvidia.com/en-au/data-center/h100/" target="_blank" rel="noopener noreferrer">H100 NVL</a>
          <a href="https://images.nvidia.com/data-center/a100/a100-datasheet.pdf" target="_blank" rel="noopener noreferrer">A100</a>
          <a href="https://www.nvidia.com/en-gb/data-center/l40s/" target="_blank" rel="noopener noreferrer">L40S</a>
          <a href="https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/support-guide/NVIDIA-L40-Datasheet-January-2023.pdf" target="_blank" rel="noopener noreferrer">L40</a>
          <a href="https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/pdf/NVIDIA-RTX-Blackwell-PRO-GPU-Architecture-v1_1.pdf" target="_blank" rel="noopener noreferrer">RTX 系列</a>
        </p>
      </div>
    </div>
  </details>
</section>
<script src="{{ '/assets/js/gpu-weekly-board.js' | relative_url }}?v=18" defer></script>
