---
permalink: /creations/interviews/xinshi/
title: "十年心事付江花"
layout: creation-home
author_profile: false
---

<main class="creation-story-index">
  <header class="creation-story-index__header">
    <p class="creation-story-index__eyebrow">访谈</p>
    <h1>十年心事付江花</h1>
    <a href="{{ '/creations/' | relative_url }}">← 返回 Creations</a>
  </header>
  <article class="creation-story-prose">
    {% capture source %}{% include_relative 心事.md %}{% endcapture %}
    {{ source | markdownify }}
  </article>
</main>
