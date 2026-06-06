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

{% assign preface_page = site.pages | where: "url", "/creations/essays/序言/" | first %}
<div class="preface-text">
{{ preface_page.content }}
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
