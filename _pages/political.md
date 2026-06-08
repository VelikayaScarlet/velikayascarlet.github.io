---
permalink: /creations/political/
title: "玻璃蒂克"
author_profile: true
---

<style>
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

{% assign essays = site.pages | where_exp: "p", "p.path contains 'creations/essays/玻璃蒂克/'" | sort: "path" %}

<ul class="chapter-list">
  {% for essay in essays %}
    <li><a href="{{ essay.url | relative_url }}">
      <span class="chap-num">{{ forloop.index }}</span>{{ essay.title }}
    </a></li>
  {% endfor %}
</ul>
