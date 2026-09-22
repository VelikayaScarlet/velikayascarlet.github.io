---
permalink: /creations/
title: "Creations"
layout: creation-home
author_profile: false
---

{% assign diary_posts = site.pages | where_exp: "p", "p.path contains 'creations/essays/归绥杂记/'" | where_exp: "p", "p.title != '序言'" | sort: "path" | reverse %}

<main>
  <section class="creation-hero" style="--hero-image: url('{{ '/images/creations-hero.webp' | relative_url }}');" aria-labelledby="creation-hero-title">
    <div class="creation-hero__content">
      <p class="creation-hero__eyebrow">Creations / 写作</p>
      <h1 id="creation-hero-title">一笺一页一乾坤</h1>
      <p class="creation-hero__subtitle">诗词、随笔与未完成的世界</p>
    </div>
    <a class="creation-hero__scroll" href="#writing" aria-label="向下阅读文章">↓</a>
  </section>

  <section class="creation-blog" id="writing" aria-labelledby="creation-blog-title">
    <header class="creation-blog__header">
      <div>
        <p class="creation-blog__eyebrow">Writing Archive</p>
        <h2 id="creation-blog-title">写作归档</h2>
        <p class="creation-blog__intro">这里收录日常随笔、小说旧稿、诗词集与语言构想。文章按照写作时间展开，完整作品则保留各自的阅读方式。</p>
      </div>
      <dl class="creation-summary">
        <div><dt>{{ diary_posts.size }}</dt><dd>随笔</dd></div>
        <div><dt>3</dt><dd>诗集</dd></div>
        <div><dt>4</dt><dd>其他作品</dd></div>
      </dl>
    </header>

    <div class="creation-blog__layout">
      <section aria-labelledby="creation-posts-title">
        <div class="creation-section-heading">
          <h2 id="creation-posts-title">文章</h2>
          <div class="creation-year-filter" aria-label="按年份筛选文章">
            <button class="is-active" type="button" data-creation-year="all">全部</button>
            <button type="button" data-creation-year="2025">2025</button>
            <button type="button" data-creation-year="2024">2024</button>
            <button type="button" data-creation-year="2023">2023</button>
          </div>
        </div>

        <div class="creation-post-list">
          {% for post in diary_posts %}
            {% assign short_year = post.title | slice: 0, 2 %}
            {% assign full_year = '20' | append: short_year %}
            {% assign month = post.title | slice: 3, 2 %}
            {% assign rendered_content = post.content | markdownify %}
            {% assign excerpt_parts = rendered_content | split: '</strong>' %}
            {% if excerpt_parts.size > 1 %}
              {% assign excerpt_source = excerpt_parts[1] %}
            {% else %}
              {% assign excerpt_source = rendered_content %}
            {% endif %}
            <article class="creation-post" data-creation-post-year="{{ full_year }}">
              <time datetime="{{ full_year }}-{{ month }}">{{ full_year }}.{{ month }}</time>
              <div>
                <div class="creation-post__meta">
                  <span class="creation-post__collection">归绥杂记</span>
                  <span>随笔</span>
                </div>
                <h3><a href="{{ post.url | relative_url }}">{{ full_year }} 年 {{ month }} 月</a></h3>
                <p class="creation-post__excerpt">{{ excerpt_source | strip_html | strip_newlines | truncate: 138 }}</p>
                <a class="creation-post__more" href="{{ post.url | relative_url }}">阅读全文 →</a>
              </div>
            </article>
          {% endfor %}
        </div>
      </section>

      <aside class="creation-shelf" aria-labelledby="creation-shelf-title">
        <h2 id="creation-shelf-title">作品集</h2>
        <p class="creation-shelf__intro">完整诗集、连载小说与专题文字集中放在这里，不打断文章的时间线。</p>

        <div class="creation-shelf__group">
          <p class="creation-shelf__label">诗词</p>
          <a class="creation-work" href="{{ '/creations/poems/觅月集.pdf' | relative_url }}" target="_blank" rel="noopener">
            <span class="creation-work__mark">觅</span><span class="creation-work__name">觅月集</span><span class="creation-work__type">PDF</span>
          </a>
          <a class="creation-work" href="{{ '/creations/poems/折光集.pdf' | relative_url }}" target="_blank" rel="noopener">
            <span class="creation-work__mark">折</span><span class="creation-work__name">折光集</span><span class="creation-work__type">PDF</span>
          </a>
          <a class="creation-work" href="{{ '/creations/poems/东海集.pdf' | relative_url }}" target="_blank" rel="noopener">
            <span class="creation-work__mark">东</span><span class="creation-work__name">东海集</span><span class="creation-work__type">PDF</span>
          </a>
        </div>

        <div class="creation-shelf__group">
          <p class="creation-shelf__label">文章与故事</p>
          <a class="creation-work" href="{{ '/creations/guisui-zaji/' | relative_url }}">
            <span class="creation-work__mark creation-work__mark--rose">归</span><span class="creation-work__name">归绥杂记</span><span class="creation-work__type">{{ diary_posts.size }} 篇</span>
          </a>
          <a class="creation-work" href="{{ '/creations/cmbpre/' | relative_url }}">
            <span class="creation-work__mark creation-work__mark--ink">联</span><span class="creation-work__name">联合军前传</span><span class="creation-work__type">小说</span>
          </a>
          <a class="creation-work" href="{{ '/creations/political/' | relative_url }}">
            <span class="creation-work__mark creation-work__mark--ink">玻</span><span class="creation-work__name">玻璃蒂克</span><span class="creation-work__type">受保护</span>
          </a>
          <a class="creation-work" href="{{ '/creations/essays/别利语/别利语简述%5B18.7.A2%5D.pdf' | relative_url }}" target="_blank" rel="noopener">
            <span class="creation-work__mark creation-work__mark--rose">别</span><span class="creation-work__name">别利语简述</span><span class="creation-work__type">语言</span>
          </a>
          <a class="creation-work" href="{{ '/creations/essays/刘彬回忆录之我的大学/%E3%80%8A%E5%88%98%E5%BD%AC%E5%9B%9E%E5%BF%86%E5%BD%95%E2%80%94%E2%80%94%E6%88%91%E7%9A%84%E5%A4%A7%E5%AD%A6%E3%80%8B.pdf' | relative_url }}" target="_blank" rel="noopener">
            <span class="creation-work__mark">忆</span><span class="creation-work__name">刘彬回忆录——我的大学</span><span class="creation-work__type">回忆录</span>
          </a>
        </div>
      </aside>
    </div>
  </section>
</main>

<script>
(function () {
  var heroTitle = document.getElementById('creation-hero-title');
  var heroLines = [
    // 《觅月集》
    '不乘飞机不坐船，我随烟雨入江天',
    '烟柳画桥三吴会，乘风极目望汤汤',
    '怡逢海内升平世，璀璨星河拱凤城',

    // 《折光集》
    '一笺一页一乾坤',
    '认取河山，刻作星霜记',
    '谁知今夜泪，与雨共稠浓',
    '岁岁东风似旧时',
    '低吟一曲送春词',
    '半世光阴针脚里，织成多少春秋',

    // 《东海集》
    '开时明月满西窗',
    '满城灯火是君留',
    '何时圆月上回廊',
    '看君眉眼是支歌',
    '可渡相思去枕前',
    '一篙烟雨一篙星',
    '浦江灯火渐分明',
    '春风不管前尘事，吹落高枝几片樱',
    '重逢初见处，你我尚无诗'
  ];

  if (heroTitle) {
    var previousIndex = -1;
    try {
      var storedIndex = sessionStorage.getItem('creation-hero-line');
      if (storedIndex !== null) {
        previousIndex = Number(storedIndex);
      }
    } catch (error) {
      previousIndex = -1;
    }

    var lineIndex = Math.floor(Math.random() * heroLines.length);
    if (lineIndex === previousIndex && heroLines.length > 1) {
      lineIndex = (lineIndex + 1 + Math.floor(Math.random() * (heroLines.length - 1))) % heroLines.length;
    }

    heroTitle.textContent = heroLines[lineIndex];
    try {
      sessionStorage.setItem('creation-hero-line', String(lineIndex));
    } catch (error) {
      // The random title still works when browser storage is unavailable.
    }
  }

  var buttons = document.querySelectorAll('[data-creation-year]');
  var posts = document.querySelectorAll('[data-creation-post-year]');

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var year = button.getAttribute('data-creation-year');
      buttons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      posts.forEach(function (post) {
        post.hidden = year !== 'all' && post.getAttribute('data-creation-post-year') !== year;
      });
    });
  });
})();
</script>
