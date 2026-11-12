---
permalink: /creations/languages/honghe/grammar/
title: "红河语语法"
layout: creation-home
author_profile: false
---

<main class="creation-story-index">
  <header class="creation-story-index__header">
    <p class="creation-story-index__eyebrow">语言档案</p>
    <h1>红河语语法</h1>
    <a href="{{ '/creations/' | relative_url }}">← 返回 Creations</a>
  </header>
  <article class="creation-story-prose">
    {% capture source %}{% include_relative 语法.md %}{% endcapture %}
    {{ source | markdownify }}
  </article>
</main>
