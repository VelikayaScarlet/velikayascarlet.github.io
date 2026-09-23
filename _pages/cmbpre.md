---
permalink: /creations/cmbpre/
title: "联合军前传"
layout: creation-home
author_profile: false
---
{% assign chapters = site.pages | where_exp: "p", "p.path contains 'creations/essays/联合军前传/'" | where_exp: "p", "p.url != '/creations/essays/联合军前传/序言/'" | sort: "path" %}

<main class="creation-story-index">
  <header class="creation-story-index__header">
    <p class="creation-story-index__eyebrow">Novel / 小说</p>
    <h1>联合军前传</h1>
    <p>一部未完成的科幻小说旧稿，以及它留下的后续构想。</p>
    <a href="{{ '/creations/' | relative_url }}">← 返回 Creations</a>
  </header>

  <ol class="creation-story-list">
    {% for chapter in chapters %}
      <li><a href="{{ chapter.url | relative_url }}"><span>{{ forloop.index | prepend: '0' | slice: -2, 2 }}</span><strong>{{ chapter.title }}</strong><small>联合军前传</small></a></li>
    {% endfor %}
  </ol>
</main>
