---
permalink: /poems/
title: "Poems"
author_profile: true
---

<style>
/* 诗词页 —— 两栏卡片网格，每页 8 首（4 行 x 2 列） */
.poems { text-align: center; }

.poems-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.8em 2.4em;
  margin: 2.5em 0;
  text-align: left;
}

.poem-card {
  padding: 1.4em 1.6em;
  border-left: 3px solid #c8a97e;
  background: rgba(200, 169, 126, 0.05);
  border-radius: 0 4px 4px 0;
  break-inside: avoid;
}

.poem-card-title {
  text-align: center;
  font-size: 1.15em;
  font-weight: bold;
  letter-spacing: 0.15em;
  margin-bottom: 0.35em;
  font-family: Georgia, "Songti SC", "STSong", "SimSun", serif;
}

.poem-card-meta {
  text-align: center;
  font-size: 0.8em;
  color: #888;
  font-style: italic;
  margin-bottom: 1em;
}

.poem-card-body {
  text-align: center;
  font-family: Georgia, "Songti SC", "STSong", "SimSun", serif;
  line-height: 1.85;
  letter-spacing: 0.04em;
  color: #444;
}

.poem-card-body p {
  text-indent: 2em;
  margin: 0.25em 0;
}

/* 分页 */
.poems-pager {
  margin: 2.5em 0 1em;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.4em;
  flex-wrap: wrap;
}
.poems-pager button,
.poems-pager .pager-info {
  padding: 0.45em 0.9em;
  font-size: 0.95em;
  border: 1px solid #c8a97e;
  background: #fff;
  color: #6b4f2a;
  border-radius: 3px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.poems-pager button:hover:not(:disabled) {
  background: #c8a97e;
  color: #fff;
}
.poems-pager button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.poems-pager button.active {
  background: #c8a97e;
  color: #fff;
  font-weight: bold;
}
.poems-pager .pager-info {
  border: 0;
  color: #888;
  cursor: default;
}

@media (max-width: 640px) {
  .poems-grid { grid-template-columns: 1fr; }
}
</style>

<div class="poems">

<span class="anchor" id="poems-top"></span>

# 📜 诗词

<!-- 卡片网格：每页最多 8 首。data-page="N" 给 N 页用，不写就归第 1 页 -->
<div class="poems-grid" id="poems-grid">

  <!-- 第 1 页：示例 8 首 -->
  <div class="poem-card" data-page="1">
    <div class="poem-card-title">示例 · 无题</div>
    <div class="poem-card-meta">2025 · 五言</div>
    <div class="poem-card-body">
      <p>把下面的内容替换成你自己的诗。</p>
      <p>每句一行，用一对 &lt;p&gt; 包住。</p>
      <p>七言、律诗、词都按这个结构写。</p>
    </div>
  </div>

  <div class="poem-card" data-page="1">
    <div class="poem-card-title">示例 · 临江</div>
    <div class="poem-card-meta">2025 · 七言</div>
    <div class="poem-card-body">
      <p>第二首诗在这个 div 里改。</p>
      <p>每加一首，复制整个 .poem-card 块。</p>
      <p>第 9 首开始加 data-page="2"。</p>
    </div>
  </div>

  <div class="poem-card" data-page="1">
    <div class="poem-card-title">示例 · 第三首</div>
    <div class="poem-card-meta">2025 · 词</div>
    <div class="poem-card-body">
      <p>第三首会自动换到下一行的左侧。</p>
      <p>卡片高度不对齐也没关系。</p>
    </div>
  </div>

  <div class="poem-card" data-page="1">
    <div class="poem-card-title">示例 · 第四首</div>
    <div class="poem-card-meta">2025 · 绝句</div>
    <div class="poem-card-body">
      <p>第四首和第三首同在一行右侧。</p>
      <p>卡片宽度会自适应页面。</p>
    </div>
  </div>

  <div class="poem-card" data-page="1">
    <div class="poem-card-title">示例 · 第五首</div>
    <div class="poem-card-meta">2024 · 古风</div>
    <div class="poem-card-body">
      <p>第五首</p>
      <p>第 1 页 8 首位置已用满。</p>
    </div>
  </div>

  <div class="poem-card" data-page="1">
    <div class="poem-card-title">示例 · 第六首</div>
    <div class="poem-card-meta">2024 · 五言</div>
    <div class="poem-card-body">
      <p>第六首</p>
    </div>
  </div>

  <div class="poem-card" data-page="1">
    <div class="poem-card-title">示例 · 第七首</div>
    <div class="poem-card-meta">2024 · 七律</div>
    <div class="poem-card-body">
      <p>第七首</p>
    </div>
  </div>

  <div class="poem-card" data-page="1">
    <div class="poem-card-title">示例 · 第八首</div>
    <div class="poem-card-meta">2024 · 词</div>
    <div class="poem-card-body">
      <p>第八首</p>
    </div>
  </div>

  <!-- 第 2 页：示例 8 首 -->
  <div class="poem-card" data-page="2">
    <div class="poem-card-title">示例 · 第九首</div>
    <div class="poem-card-meta">2023 · 古风</div>
    <div class="poem-card-body">
      <p>这一首开始属于第 2 页。</p>
      <p>9～16 首放在 data-page="2" 里。</p>
    </div>
  </div>

  <div class="poem-card" data-page="2">
    <div class="poem-card-title">示例 · 第十首</div>
    <div class="poem-card-meta">2023 · 五言</div>
    <div class="poem-card-body">
      <p>第 2 页的样式和第 1 页完全一致。</p>
    </div>
  </div>

  <div class="poem-card" data-page="2">
    <div class="poem-card-title">示例 · 第十一首</div>
    <div class="poem-card-meta">2023 · 七言</div>
    <div class="poem-card-body">
      <p>第十一首</p>
    </div>
  </div>

  <div class="poem-card" data-page="2">
    <div class="poem-card-title">示例 · 第十二首</div>
    <div class="poem-card-meta">2023 · 词</div>
    <div class="poem-card-body">
      <p>第十二首</p>
    </div>
  </div>

  <div class="poem-card" data-page="2">
    <div class="poem-card-title">示例 · 第十三首</div>
    <div class="poem-card-meta">2022 · 绝句</div>
    <div class="poem-card-body">
      <p>第十三首</p>
    </div>
  </div>

  <div class="poem-card" data-page="2">
    <div class="poem-card-title">示例 · 第十四首</div>
    <div class="poem-card-meta">2022 · 五言</div>
    <div class="poem-card-body">
      <p>第十四首</p>
    </div>
  </div>

  <div class="poem-card" data-page="2">
    <div class="poem-card-title">示例 · 第十五首</div>
    <div class="poem-card-meta">2022 · 七律</div>
    <div class="poem-card-body">
      <p>第十五首</p>
    </div>
  </div>

  <div class="poem-card" data-page="2">
    <div class="poem-card-title">示例 · 第十六首</div>
    <div class="poem-card-meta">2022 · 古风</div>
    <div class="poem-card-body">
      <p>第十六首</p>
      <p>第 2 页结束。</p>
    </div>
  </div>

  <!-- 不写 data-page 默认归第 1 页（向后兼容） -->
  <div class="poem-card">
    <div class="poem-card-title">示例 · 不带页码</div>
    <div class="poem-card-meta">——</div>
    <div class="poem-card-body">
      <p>不写 data-page 也会归到第 1 页。</p>
    </div>
  </div>

</div>

<!-- 分页按钮（JS 自动生成） -->
<div class="poems-pager" id="poems-pager"></div>

</div>

<script>
(function () {
  var grid = document.getElementById('poems-grid');
  var pager = document.getElementById('poems-pager');
  if (!grid || !pager) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.poem-card'));
  var PER_PAGE = 8;

  // 算出每个卡片所在的页（未标 data-page 的归第 1 页）
  var totalPages = 1;
  cards.forEach(function (c) {
    var p = parseInt(c.getAttribute('data-page'), 10);
    if (!p || p < 1) p = 1;
    c.setAttribute('data-page', p);
    if (p > totalPages) totalPages = p;
  });

  function show(page) {
    cards.forEach(function (c) {
      c.style.display = (parseInt(c.getAttribute('data-page'), 10) === page) ? '' : 'none';
    });
    Array.prototype.forEach.call(pager.querySelectorAll('button[data-pg]'), function (b) {
      b.classList.toggle('active', parseInt(b.getAttribute('data-pg'), 10) === page);
    });
    // 滚动到顶（如果 URL 带 #poems-top 锚点，更柔和）
    var top = document.getElementById('poems-top');
    if (top) top.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function build() {
    pager.innerHTML = '';
    var prev = document.createElement('button');
    prev.textContent = '«';
    prev.addEventListener('click', function () { go(Math.max(1, current - 1)); });
    pager.appendChild(prev);

    for (var i = 1; i <= totalPages; i++) {
      (function (n) {
        var b = document.createElement('button');
        b.setAttribute('data-pg', n);
        b.textContent = n;
        b.addEventListener('click', function () { go(n); });
        pager.appendChild(b);
      })(i);
    }

    var next = document.createElement('button');
    next.textContent = '»';
    next.addEventListener('click', function () { go(Math.min(totalPages, current + 1)); });
    pager.appendChild(next);

    var info = document.createElement('span');
    info.className = 'pager-info';
    info.textContent = '共 ' + cards.length + ' 首 / ' + totalPages + ' 页';
    pager.appendChild(info);

    function go(p) {
      current = p;
      prev.disabled = (current === 1);
      next.disabled = (current === totalPages);
      show(current);
    }

    var current = 1;
    go(1);
  }

  build();
})();
</script>
