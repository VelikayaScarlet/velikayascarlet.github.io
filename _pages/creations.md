---
permalink: /creations/
title: "Creations"
author_profile: true
---

<style>
/* 柔和 sans-serif */
.page {
  font-family: "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif;
}

/* ===== Tab 切换 ===== */
.creations-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5em;
  margin: 2em 0 2.5em;
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
  text-decoration: none;
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

/* ===== 集合卡片网格 ===== */
.collections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 2em 2.2em;
  margin: 2em 0;
}

a.collection-card {
  display: block;
  text-decoration: none;
  color: inherit;
  background: #fdfdfd;
  border: 1px solid #e8dccf;
  border-radius: 6px;
  padding: 2em 1.5em 1.5em;
  text-align: center;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}
.collection-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #c8a97e, #a08060);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.25s;
}
.collection-card:hover {
  border-color: #c8a97e;
  box-shadow: 0 4px 16px rgba(200, 169, 126, 0.2);
  transform: translateY(-2px);
}
.collection-card:hover::before {
  transform: scaleX(1);
}

.collection-icon {
  font-size: 2.6em;
  margin-bottom: 0.5em;
}

.collection-name {
  font-size: 1.2em;
  font-weight: bold;
  font-family: Georgia, "Songti SC", "STSong", "SimSun", serif;
  letter-spacing: 0.12em;
  color: #4a3728;
  margin-bottom: 0.6em;
}

.collection-type {
  display: inline-block;
  font-size: 0.8em;
  color: #888;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 0.2em 1em;
}

.empty-hint {
  grid-column: 1 / -1;
  text-align: center;
  color: #aaa;
  font-style: italic;
  padding: 3em 0;
  font-family: Georgia, "Songti SC", "STSong", "SimSun", serif;
}

@media (max-width: 600px) {
  .collections-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1em;
  }
  .collection-card {
    padding: 1.4em 1em 1.2em;
  }
}
</style>

<!-- ===== Tab 导航 ===== -->
<div class="creations-tabs">
  <button class="active" data-tab="poems">诗词</button>
  <button data-tab="essays">文章</button>
</div>

<!-- ===== 诗词面板 ===== -->
<div class="creations-panel active" id="panel-poems">

<div class="collections-grid">
  <a class="collection-card" href="/creations/poems/觅月集.pdf" target="_blank">
    <div class="collection-icon">🌙</div>
    <div class="collection-name">觅月集</div>
    <span class="collection-type">诗集</span>
  </a>

  <a class="collection-card" href="/creations/poems/折光集.pdf" target="_blank">
    <div class="collection-icon">💫</div>
    <div class="collection-name">折光集</div>
    <span class="collection-type">诗集</span>
  </a>

  <a class="collection-card" href="/creations/poems/东海集.pdf" target="_blank">
    <div class="collection-icon">🌊</div>
    <div class="collection-name">东海集</div>
    <span class="collection-type">诗集</span>
  </a>
</div>

</div><!-- /诗词 -->

<!-- ===== 文章面板 ===== -->
<div class="creations-panel" id="panel-essays">

<div class="collections-grid">
  <a class="collection-card" href="/creations/guisui-zaji/">
    <div class="collection-icon">📝</div>
    <div class="collection-name">归绥杂记</div>
    <span class="collection-type">文集</span>
  </a>

  <a class="collection-card" href="/creations/political/">
    <div class="collection-icon">🏛️</div>
    <div class="collection-name">玻璃蒂克</div>
    <span class="collection-type">文集</span>
  </a>

  <a class="collection-card" href="/creations/essays/别利语/别利语简述%5B18.7.A2%5D.pdf" target="_blank">
    <div class="collection-icon">📖</div>
    <div class="collection-name">别利语简述</div>
    <span class="collection-type">语言</span>
  </a>

  <a class="collection-card" href="/creations/cmbpre/">
    <div class="collection-icon">🎮</div>
    <div class="collection-name">联合军前传</div>
    <span class="collection-type">小说</span>
  </a>

  <a class="collection-card" href="/creations/essays/刘彬回忆录之我的大学/%E3%80%8A%E5%88%98%E5%BD%AC%E5%9B%9E%E5%BF%86%E5%BD%95%E2%80%94%E2%80%94%E6%88%91%E7%9A%84%E5%A4%A7%E5%AD%A6%E3%80%8B.pdf" target="_blank">
    <div class="collection-icon">📝</div>
    <div class="collection-name">刘彬回忆录——我的大学</div>
    <span class="collection-type">回忆录</span>
  </a>
</div>

</div><!-- /文章 -->

<script>
(function () {
  // Tab 切换
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
})();
</script>
