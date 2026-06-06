---
permalink: /poems/
title: "Poems & Essays"
author_profile: true
---

<style>
/* 诗体排版 —— 仅作用于 .poems 容器内的元素，不影响其他页面 */
.poems {
  text-align: center;
}
.poems .poem {
  margin: 2.5em auto;
  max-width: 38em;            /* 控制行宽，仿古诗的"短行" */
  font-family: Georgia, "Songti SC", "STSong", "SimSun", serif;
  line-height: 1.9;
  letter-spacing: 0.05em;
}
.poems .poem-title {
  text-align: center;
  font-size: 1.25em;
  font-weight: bold;
  margin-bottom: 0.4em;
  letter-spacing: 0.2em;
}
.poems .poem-meta {
  text-align: center;
  font-size: 0.85em;
  color: #888;
  margin-bottom: 1.2em;
  font-style: italic;
}
.poems .poem-body p {
  text-indent: 2em;           /* 句首两字符缩进 */
  margin: 0.3em 0;
}
.poems .poem-body .couplet {
  text-indent: 0;             /* 对仗联可顶格或微调 */
}
.poems hr.poem-sep {
  border: 0;
  border-top: 1px dashed #ccc;
  width: 30%;
  margin: 3em auto;
}
</style>

<div class="poems">

<span class="anchor" id="poems-top"></span>

# 📜 诗词与文章

一些练笔。诗穷而后工 —— 落笔于困顿与远行之间。

---

<div class="poem" id="poem-1">
  <div class="poem-title">示例 · 无题</div>
  <div class="poem-meta">2025 · 五言</div>
  <div class="poem-body">
    <p>把下面的内容替换成你自己的诗即可。</p>
    <p>每句一行，用一对 &lt;p&gt; 包住；</p>
    <p>删去 &lt;div class="couplet"&gt; 之外即可。</p>
    <p>七言、律诗、词都按这个结构写。</p>
  </div>
</div>

<hr class="poem-sep">

<div class="poem" id="poem-2">
  <div class="poem-title">示例 · 临江</div>
  <div class="poem-meta">2025 · 七言</div>
  <div class="poem-body">
    <p>第二首的标题、日期、内容都在这个 div 里改。</p>
    <p>每添加一首诗，复制 &lt;div class="poem"&gt;…&lt;/div&gt; 整个块。</p>
    <p>中间用 &lt;hr class="poem-sep"&gt; 分隔，</p>
    <p>id 改成 poem-3、poem-4… 方便以后做锚点。</p>
  </div>
</div>

---

# 📝 文章

<div class="poem" id="essay-1">
  <div class="poem-title">示例 · 文章标题</div>
  <div class="poem-meta">2025-08-12</div>
  <div class="poem-body">
    <p>文章区放散文、随笔、读书笔记都可以。</p>
    <p>用若干 &lt;p&gt; 段落书写，自动继承诗体的居中/缩进样式。</p>
    <p>如果想换成普通左对齐正文，把外层 .poem 改名为 .essay，或者另起一个 .essay 容器写新 CSS。</p>
  </div>
</div>

</div>
