---
permalink: /creations/stories/yexing/
title: "事物替我们说话"
layout: creation-home
author_profile: false
---

{% assign stories = site.pages | where: "story_collection", "事物替我们说话" | sort: "story_index" %}

<main class="creation-story-index">
  <header class="creation-story-index__header">
    <p class="creation-story-index__eyebrow">Short Stories / 短篇</p>
    <h1>事物替我们说话</h1>
    <p>一些彼此独立、又隐约相连的故事。关于友谊、亲密关系，以及那些没能被及时说出来的话。</p>
    <a href="{{ '/creations/' | relative_url }}">← 返回 Creations</a>
  </header>

  <ol class="creation-story-list">
    {% for story in stories %}
      <li><a href="{{ story.url | relative_url }}"><span>{{ story.story_index | prepend: '0' | slice: -2, 2 }}</span><strong>{{ story.title }}</strong><small>{{ story.creation_excerpt }}</small></a></li>
    {% endfor %}
  </ol>
</main>
