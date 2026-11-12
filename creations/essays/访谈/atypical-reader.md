---
permalink: /creations/interviews/atypical/
title: "晴岚的非典型恋爱自述"
layout: creation-home
author_profile: false
---

<main class="creation-story-index">
  <header class="creation-story-index__header">
    <p class="creation-story-index__eyebrow">访谈</p>
    <h1>晴岚的非典型恋爱自述</h1>
    <a href="{{ '/creations/' | relative_url }}">← 返回 Creations</a>
  </header>
  <article class="creation-story-prose">
    {% capture source %}{% include_relative 非典型.md %}{% endcapture %}
    {{ source | markdownify }}
  </article>
</main>
