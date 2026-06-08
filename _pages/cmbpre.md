---
permalink: /creations/cmbpre/
title: "联合军前传"
author_profile: true
---

<style>
.preface-text {
  font-size: 1em;
  line-height: 1.85;
  color: #3a3a3a;
  margin-bottom: 2.5em;
  padding-bottom: 1.5em;
  border-bottom: 1px solid #e8dccf;
}
.preface-text p { margin-bottom: 0.8em; }

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

{% assign preface_page = site.pages | where: "url", "/creations/essays/联合军前传/序言/" | first %}
{% if preface_page %}
<div class="preface-text">
{{ preface_page.content | markdownify }}
</div>
{% endif %}

{% assign chapters = site.pages | where_exp: "p", "p.path contains 'creations/essays/联合军前传/'" | where_exp: "p", "p.url != '/creations/essays/联合军前传/序言/'" | sort: "path" %}

<ul class="chapter-list">
  {% for chapter in chapters %}
    <li><a href="{{ chapter.url | relative_url }}">
      <span class="chap-num">{{ forloop.index }}</span>{{ chapter.title }}
    </a></li>
  {% endfor %}
</ul>
