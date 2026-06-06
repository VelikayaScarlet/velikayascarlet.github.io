---
permalink: /creations/
title: "Creations"
author_profile: true
---

<style>
/* ===== Tab 切换 ===== */
.creations-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5em;
  margin: 2em 0 1.5em;
}
.creations-tabs button {
  padding: 0.5em 1.6em;
  font-size: 1em;
  font-family: inherit;
  border: 1px solid #c8a97e;
  background: #fff;
  color: #6b4f2a;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.15s;
}
.creations-tabs button:hover {
  background: #f5efe3;
}
.creations-tabs button.active {
  background: #c8a97e;
  color: #fff;
  font-weight: bold;
}
.creations-panel { display: none; }
.creations-panel.active { display: block; }

/* ===== 诗词：两栏卡片网格 ===== */
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

/* 诗词分页 */
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

/* ===== 文章：列表卡片 ===== */
.essays { max-width: 48em; margin: 0 auto; }

.essay-card {
  margin: 2em 0;
  padding-bottom: 1.5em;
  border-bottom: 1px dashed #ccc;
}
.essay-card:last-of-type { border-bottom: 0; }

.essay-card-title {
  font-size: 1.4em;
  font-weight: bold;
  margin-bottom: 0.3em;
  font-family: Georgia, "Songti SC", "STSong", "SimSun", serif;
  letter-spacing: 0.05em;
}
.essay-card-title a {
  text-decoration: none;
  color: inherit;
  border-bottom: 1px solid transparent;
  transition: border-color 0.15s;
}
.essay-card-title a:hover {
  border-bottom-color: #c8a97e;
  color: #6b4f2a;
}

.essay-card-meta {
  font-size: 0.85em;
  color: #888;
  font-style: italic;
  margin-bottom: 1em;
}

.essay-card-excerpt {
  font-family: Georgia, "Songti SC", "STSong", "SimSun", serif;
  line-height: 1.85;
  color: #444;
}
.essay-card-excerpt p {
  text-indent: 2em;
  margin: 0.5em 0;
}

.essay-card-more {
  display: inline-block;
  margin-top: 0.8em;
  font-size: 0.9em;
  color: #6b4f2a;
  text-decoration: none;
  border-bottom: 1px dashed #6b4f2a;
}
.essay-card-more:hover { color: #c8a97e; }
</style>

<!-- ===== Tab 导航 ===== -->
<div class="creations-tabs">
  <button class="active" data-tab="poems">诗词</button>
  <button data-tab="essays">文章</button>
</div>

<!-- ===== 诗词面板 ===== -->
<div class="creations-panel active" id="panel-poems">

<div class="poems">

<span class="anchor" id="poems-top"></span>

<div class="poems-grid" id="poems-grid">

  <!-- 第 1 页 -->
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

  <!-- 第 2 页 -->
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

  <!-- 不写 data-page 默认归第 1 页 -->
  <div class="poem-card">
    <div class="poem-card-title">示例 · 不带页码</div>
    <div class="poem-card-meta">——</div>
    <div class="poem-card-body">
      <p>不写 data-page 也会归到第 1 页。</p>
    </div>
  </div>

</div>

<!-- 分页按钮 -->
<div class="poems-pager" id="poems-pager"></div>

</div>

</div><!-- /面板：诗词 -->

<!-- ===== 文章面板 ===== -->
<div class="creations-panel" id="panel-essays">

<div class="essays">

<span class="anchor" id="essays-top"></span>

# 📝 文章

散文、随笔、读书笔记，皆汇于此。

<div class="essay-card" id="essay-1">
  <div class="essay-card-title"><a href="/creations/example-essay-1/">示例：第一篇文章</a></div>
  <div class="essay-card-meta">2025-08-12</div>
  <div class="essay-card-excerpt">
    <p>这里是文章的预览片段 —— 在列表页只显示前两三段。点标题进详情页看完整内容……</p>
  </div>
  <a class="essay-card-more" href="/creations/example-essay-1/">阅读全文 →</a>
</div>

<div class="essay-card" id="essay-2">
  <div class="essay-card-title"><a href="/creations/example-essay-2/">示例：又一篇</a></div>
  <div class="essay-card-meta">2025-09-01</div>
  <div class="essay-card-excerpt">
    <p>第二篇示例。列表页只显示摘要，详情页展开全部正文。</p>
  </div>
  <a class="essay-card-more" href="/creations/example-essay-2/">阅读全文 →</a>
</div>

</div>

</div><!-- /面板：文章 -->

<script>
(function () {
  // ---------- Tab 切换 ----------
  var tabs = document.querySelectorAll('.creations-tabs button');
  var panels = document.querySelectorAll('.creations-panel');

  tabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-tab');
      tabs.forEach(function (b) { b.classList.remove('active'); });
      panels.forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      document.getElementById('panel-' + target).classList.add('active');
    });
  });

  // ---------- 诗词分页 ----------
  var grid = document.getElementById('poems-grid');
  var pager = document.getElementById('poems-pager');
  if (!grid || !pager) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.poem-card'));
  var PER_PAGE = 8;

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
