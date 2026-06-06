---
permalink: /poems/
title: "Poems"
author_profile: true
---

<style>
/* 诗词页 —— 两栏卡片网格，手机端自动变单栏 */
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

/* 窄屏（手机）退化为单栏 */
@media (max-width: 640px) {
  .poems-grid { grid-template-columns: 1fr; }
}
</style>

<div class="poems">

<span class="anchor" id="poems-top"></span>

# 📜 诗词

诗穷而后工 —— 落笔于困顿与远行之间。

<div class="poems-grid">

  <div class="poem-card" id="poem-1">
    <div class="poem-card-title">示例 · 无题</div>
    <div class="poem-card-meta">2025 · 五言</div>
    <div class="poem-card-body">
      <p>把下面的内容替换成你自己的诗。</p>
      <p>每句一行，用一对 &lt;p&gt; 包住。</p>
      <p>七言、律诗、词都按这个结构写。</p>
    </div>
  </div>

  <div class="poem-card" id="poem-2">
    <div class="poem-card-title">示例 · 临江</div>
    <div class="poem-card-meta">2025 · 七言</div>
    <div class="poem-card-body">
      <p>第二首诗在这个 div 里改。</p>
      <p>每加一首，复制整个 &lt;div class="poem-card"&gt; 块。</p>
      <p>网格会自动排成两列。</p>
    </div>
  </div>

  <div class="poem-card" id="poem-3">
    <div class="poem-card-title">示例 · 第三首</div>
    <div class="poem-card-meta">2025 · 词</div>
    <div class="poem-card-body">
      <p>第三首会自动换到下一行的左侧。</p>
      <p>卡片高度不对齐也没关系，</p>
      <p>CSS Grid 会按行自动排。</p>
    </div>
  </div>

  <div class="poem-card" id="poem-4">
    <div class="poem-card-title">示例 · 第四首</div>
    <div class="poem-card-meta">2025 · 绝句</div>
    <div class="poem-card-body">
      <p>第四首和第三首同在一行右侧。</p>
      <p>卡片宽度会自适应页面。</p>
    </div>
  </div>

</div>

</div>
