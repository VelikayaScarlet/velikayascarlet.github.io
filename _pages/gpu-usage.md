---
permalink: /gpu-usage/
title: "GPU Weekly Usage"
author_profile: false
---

<link rel="stylesheet" href="{{ '/assets/css/gpu-usage.css' | relative_url }}">
<section class="gpu-board" lang="zh-CN" aria-label="GPU 周榜">
  <header class="gpu-board__head">
    <span class="gpu-board__source">京都大学 GPU 看板</span>
    <span class="gpu-board__week" id="gpu-board-week">本周 · JST</span>
  </header>
  <div class="gpu-board__toolbar">
    <div class="gpu-board__sort" role="group" aria-label="排名指标">
      <button type="button" data-gpu-sort="memory" aria-pressed="true">显存小时</button>
      <button type="button" data-gpu-sort="compute" aria-pressed="false">H100 等效小时</button>
    </div>
    <p id="gpu-week-status" role="status">正在读取周榜…</p>
  </div>
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
  <details class="gpu-board__notes">
    <summary>统计口径</summary>
    <p>每 5 分钟采样，日本时间周一归零。首次采到账号占用显存就自动上榜，同卡多进程按账号汇总，漏采不补算。</p>
    <p>显存小时 = 实际占用显存 × 时间。H100 等效小时 = 相对 H100 SXM 的理论算力 × 个人占整卡显存比例 × 时间。优先按非稀疏 BF16 折算，旧卡用 FP16 Tensor 或 FP32 峰值。</p>
    <p>规格来源：<a href="https://resources.nvidia.com/en-us-hopper-architecture">Hopper</a>、<a href="https://www.nvidia.com/en-au/data-center/h100/">H100 NVL</a>、<a href="https://images.nvidia.com/data-center/a100/a100-datasheet.pdf">A100</a>、<a href="https://www.nvidia.com/en-gb/data-center/l40s/">L40S</a>、<a href="https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/support-guide/NVIDIA-L40-Datasheet-January-2023.pdf">L40</a>、<a href="https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/pdf/NVIDIA-RTX-Blackwell-PRO-GPU-Architecture-v1_1.pdf">RTX 系列</a>。</p>
  </details>
</section>
<script src="{{ '/assets/js/gpu-weekly-board.js' | relative_url }}" defer></script>
