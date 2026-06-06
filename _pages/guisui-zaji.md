---
permalink: /creations/guisui-zaji/
title: "归绥杂记"
author_profile: true
---

<style>
.essay-group { margin: 2em 0 1em; }
.essay-group h2 {
  font-size: 1.15em;
  color: #4a3728;
  border-bottom: 2px solid #c8a97e;
  padding-bottom: 0.25em;
  margin-bottom: 0.8em;
}
.essay-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1em 1.2em;
  margin-bottom: 2em;
}
.essay-card {
  display: block;
  text-decoration: none;
  color: inherit;
  background: #fdfdfd;
  border: 1px solid #e8dccf;
  border-radius: 5px;
  padding: 1em 1.2em;
  transition: all 0.15s;
}
.essay-card:hover {
  border-color: #c8a97e;
  box-shadow: 0 3px 12px rgba(200, 169, 126, 0.18);
  transform: translateY(-1px);
}
.essay-card .card-title {
  font-weight: 600;
  font-size: 0.95em;
  color: #4a3728;
  font-family: Georgia, "Songti SC", "STSong", serif;
}
@media (max-width: 600px) {
  .essay-cards { grid-template-columns: repeat(2, 1fr); }
}
</style>

{% assign all = site.pages | where_exp: "p", "p.path contains 'creations/essays/归绥杂记/'" | sort: "path" %}

{% assign y23 = all | where_exp: "p", "p.path contains '/23/'" %}
{% assign y24 = all | where_exp: "p", "p.path contains '/24/'" %}
{% assign y25 = all | where_exp: "p", "p.path contains '/25/'" %}

{% if y23.size > 0 %}
<div class="essay-group">
  <h2>2023 年</h2>
  <div class="essay-cards">
    {% for essay in y23 %}
      <a class="essay-card" href="{{ essay.url | relative_url }}">
        <div class="card-title">{{ essay.title }}</div>
      </a>
    {% endfor %}
  </div>
</div>
{% endif %}

{% if y24.size > 0 %}
<div class="essay-group">
  <h2>2024 年</h2>
  <div class="essay-cards">
    {% for essay in y24 %}
      <a class="essay-card" href="{{ essay.url | relative_url }}">
        <div class="card-title">{{ essay.title }}</div>
      </a>
    {% endfor %}
  </div>
</div>
{% endif %}

{% if y25.size > 0 %}
<div class="essay-group">
  <h2>2025 年</h2>
  <div class="essay-cards">
    {% for essay in y25 %}
      <a class="essay-card" href="{{ essay.url | relative_url }}">
        <div class="card-title">{{ essay.title }}</div>
      </a>
    {% endfor %}
  </div>
</div>
{% endif %}

<p style="margin-top: 2em; font-size: 0.9em; color: #888;">
  📝 <a href="/creations/essays/序言/">序言</a> — 该系列的缘起与说明
</p>
