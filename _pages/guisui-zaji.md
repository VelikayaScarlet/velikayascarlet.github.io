---
permalink: /creations/guisui-zaji/
title: "归绥杂记"
layout: creation-home
author_profile: false
---

{% assign essays = site.pages | where_exp: "p", "p.path contains 'creations/essays/归绥杂记/'" | where_exp: "p", "p.title != '序言'" | sort: "date" | reverse %}

<main class="creation-story-index">
  <header class="creation-story-index__header">
    <p class="creation-story-index__eyebrow">Notes / 随笔</p>
    <h1>归绥杂记</h1>
    <p>研究生期间的生活、研究与日常记录。</p>
    <a href="{{ '/creations/' | relative_url }}">← 返回 Creations</a>
  </header>

  <ol class="creation-story-list creation-story-list--dated">
    {% for essay in essays %}
      <li><a href="{{ essay.url | relative_url }}"><span>{{ essay.date | date: '%Y.%m' }}</span><strong>{{ essay.title }}</strong><small>归绥杂记</small></a></li>
    {% endfor %}
  </ol>
</main>
