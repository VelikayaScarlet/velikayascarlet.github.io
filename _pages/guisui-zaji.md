---
permalink: /creations/guisui-zaji/
title: "归绥杂记"
author_profile: true
---

<style>
/* 序言正文 */
.preface-text {
  font-size: 1em;
  line-height: 1.85;
  color: #3a3a3a;
  margin-bottom: 2.5em;
  padding-bottom: 1.5em;
  border-bottom: 1px solid #e8dccf;
}
.preface-text p { margin-bottom: 0.8em; }

/* 年份标题 */
.essay-group { margin: 1.8em 0 0.6em; }
.essay-group h2 {
  font-size: 1.1em;
  color: #4a3728;
  border-bottom: 2px solid #c8a97e;
  padding-bottom: 0.2em;
  margin-bottom: 0.6em;
}

/* 横条式章节列表 */
.chapter-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5em;
}
.chapter-list li {
  margin-bottom: 1px;
}
.chapter-list a {
  display: flex;
  align-items: center;
  gap: 0.7em;
  text-decoration: none;
  color: #4a3728;
  padding: 0.6em 0.9em;
  border-left: 3px solid transparent;
  border-radius: 0 4px 4px 0;
  background: #fafaf7;
  font-family: Georgia, "Songti SC", "STSong", serif;
  font-size: 0.95em;
  transition: all 0.15s;
}
.chapter-list a:hover {
  background: #f5efe3;
  border-left-color: #c8a97e;
}
.chapter-list .chap-num {
  font-size: 0.8em;
  color: #a08060;
  min-width: 2.2em;
}
</style>

<!-- 序言内容 -->
<div class="preface-text" markdown="1">

**序言**

我的好朋友，刘同学曾在他本科期间和工作早期写过他的学习、工作、打工中发生的各种事情，并且坚持了数年之久。我也曾想着在研究生期间写一些日常，就像我高三的时候在Lofter上曾经做过的事情一样。

开学已经两月有余，学期过半，却连一点痕迹都没有留下，实在惭愧。悟已往之不谏，知来者之可追，就从现在开始更新吧。名字暂定为《我的带专》，为什么叫这个名字，大概是因为我觉得内专确实是个带专。

虽然现在被要求去工位学习，但我还是坚持每周休息两天，周三和周日我都不去工位，而是选择先去洗澡，然后在宿舍待着，虽然想做的事情很多都没有做，但用这点时间写一些记录，大概或许是极好的，多少也算留下点文字遗产了。

**2026年6月7日新注**

2026年6月7日，我将其加入到我的个人主页上，并更名为归绥杂记。这个系列共记录了我从2023年11月到2025年2月的生活、体验和思考，由于2025年2月后，我的心理健康越来越差，便不再继续更新。

</div>

<!-- 按年份编录 -->
{% assign all = site.pages | where_exp: "p", "p.path contains 'creations/essays/归绥杂记/'" | sort: "path" %}

{% assign y23 = all | where_exp: "p", "p.path contains '/23/'" %}
{% assign y24 = all | where_exp: "p", "p.path contains '/24/'" %}
{% assign y25 = all | where_exp: "p", "p.path contains '/25/'" %}

{% if y23.size > 0 %}
<div class="essay-group">
  <h2>2023 年</h2>
  <ul class="chapter-list">
    {% for essay in y23 %}
      <li><a href="{{ essay.url | relative_url }}">
        <span class="chap-num">{{ forloop.index }}</span>{{ essay.title }}
      </a></li>
    {% endfor %}
  </ul>
</div>
{% endif %}

{% if y24.size > 0 %}
<div class="essay-group">
  <h2>2024 年</h2>
  <ul class="chapter-list">
    {% for essay in y24 %}
      <li><a href="{{ essay.url | relative_url }}">
        <span class="chap-num">{{ forloop.index }}</span>{{ essay.title }}
      </a></li>
    {% endfor %}
  </ul>
</div>
{% endif %}

{% if y25.size > 0 %}
<div class="essay-group">
  <h2>2025 年</h2>
  <ul class="chapter-list">
    {% for essay in y25 %}
      <li><a href="{{ essay.url | relative_url }}">
        <span class="chap-num">{{ forloop.index }}</span>{{ essay.title }}
      </a></li>
    {% endfor %}
  </ul>
</div>
{% endif %}
