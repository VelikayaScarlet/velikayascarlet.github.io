---
permalink: /creations/
title: "Creations"
layout: creation-home
author_profile: false
hide_nav: true
---

{% assign creation_posts = site.pages | where: "creation_feed", true | sort: "date" | reverse %}

<main class="creation-home-page">
  <section class="creation-banner" style="--hero-image: url('{{ '/images/creations-hero-v2.png' | relative_url }}');" aria-labelledby="creation-hero-title">
    <div class="creation-banner__image" aria-hidden="true"></div>
    <div class="creation-banner__copy">
      <p>创作</p>
      <h1 id="creation-hero-title">重逢初见处，你我尚无诗</h1>
    </div>
  </section>

  <div class="creation-home-layout" id="writing">
    <section class="creation-feed" aria-labelledby="creation-posts-title">
      <header class="creation-feed__tools">
        <h2 id="creation-posts-title">文章</h2>
        <div class="creation-year-filter" aria-label="按年份筛选文章">
          <button class="is-active" type="button" data-creation-year="all">全部</button>
          <button type="button" data-creation-year="2026">2026</button>
          <button type="button" data-creation-year="2025">2025</button>
          <button type="button" data-creation-year="2024">2024</button>
          <button type="button" data-creation-year="2023">2023</button>
        </div>
      </header>

      <div class="creation-post-list">
        {% for post in creation_posts %}
          {% assign full_year = post.date | date: '%Y' %}
          {% assign month = post.date | date: '%m' %}
          {% assign day = post.date | date: '%d' %}
          <article class="creation-post" data-creation-post-year="{{ full_year }}">
            <time datetime="{{ post.date | date: '%Y-%m-%d' }}"><strong>{{ day }}</strong><span>{{ full_year }}.{{ month }}</span></time>
            <a href="{{ post.url | relative_url }}">
              <small>{% if post.story_collection %}{{ post.story_collection }}{% else %}归绥杂记{% endif %} · {% if post.creation_kind == 'short-story' %}短篇{% else %}随笔{% endif %}</small>
              <h3>{% if post.creation_kind == 'short-story' %}{{ post.title }}{% else %}{{ full_year }} 年 {{ month }} 月{% endif %}</h3>
            </a>
          </article>
        {% endfor %}
      </div>

      <nav class="creation-pagination" aria-label="文章分页">
        <span data-creation-page-info>第 1 / 1 页</span>
        <div>
          <button type="button" data-creation-page="prev">上一页</button>
          <button type="button" data-creation-page="next">下一页</button>
        </div>
      </nav>
    </section>

    <aside class="creation-sidebar">
      <section class="creation-widget creation-widget--books">
        <header class="creation-widget__title"><h2>诗集</h2><span>Collections</span></header>
        <div class="creation-book-row">
          <a class="creation-book creation-book--moon" href="{{ '/creations/poems/觅月集.pdf' | relative_url }}" target="_blank" rel="noopener"><i>01</i><b>觅月集</b></a>
          <a class="creation-book creation-book--light" href="{{ '/creations/poems/折光集.pdf' | relative_url }}" target="_blank" rel="noopener"><i>02</i><b>折光集</b></a>
          <a class="creation-book creation-book--sea" href="{{ '/creations/poems/东海集.pdf' | relative_url }}" target="_blank" rel="noopener"><i>03</i><b>东海集</b></a>
        </div>
      </section>

      <section class="creation-widget">
        <header class="creation-widget__title"><h2>文库</h2><span>Library</span></header>
        <a class="creation-library-link" href="{{ '/creations/stories/yexing/' | relative_url }}"><b>事物替我们说话</b><span>短篇</span></a>
        <a class="creation-library-link" href="{{ '/creations/guisui-zaji/' | relative_url }}"><b>归绥杂记</b><span>随笔</span></a>
        <a class="creation-library-link" href="{{ '/creations/cmbpre/' | relative_url }}"><b>联合军前传</b><span>小说</span></a>
        <a class="creation-library-link" href="{{ '/creations/political/' | relative_url }}"><b>玻璃蒂克</b><span>受保护</span></a>
        <a class="creation-library-link" href="{{ '/creations/bielian/' | relative_url }}"><b>别利语简述</b><span>语言</span></a>
        <a class="creation-library-link" href="{{ '/creations/liubin-memoir/' | relative_url }}"><b>刘彬回忆录——我的大学</b><span>回忆录</span></a>
      </section>

      <section class="creation-widget creation-archive-widget">
        <header class="creation-widget__title"><h2>归档</h2><span>Archive</span></header>
        <a href="#writing" data-creation-archive-year="2026"><span>2026</span><b data-creation-count="2026">0</b></a>
        <a href="#writing" data-creation-archive-year="2025"><span>2025</span><b data-creation-count="2025">0</b></a>
        <a href="#writing" data-creation-archive-year="2024"><span>2024</span><b data-creation-count="2024">0</b></a>
        <a href="#writing" data-creation-archive-year="2023"><span>2023</span><b data-creation-count="2023">0</b></a>
      </section>
    </aside>
  </div>

  <footer class="creation-home-footer">Creations · 2023—2026</footer>
</main>

<script>
(function () {
  var heroTitle = document.getElementById('creation-hero-title');
  var heroLines = [
    '千思万绪都为梦，由她来去随缘',
    '往今皆伴水，风雨落花天',
    '倚枕斜看风掠叶，神思遥拾落花声',
    '万般情难了，酒醒泪光莹',
    '欲把前尘归梦里，笔停又念当年意',
    '一笺一页一乾坤',
    '认取河山，刻作星霜记',
    '谁知今夜泪，与雨共稠浓',
    '岁岁东风似旧时',
    '低吟一曲送春词',
    '半世光阴针脚里，织成多少春秋',
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
    try { previousIndex = Number(sessionStorage.getItem('creation-hero-line')); } catch (error) {}
    var lineIndex = Math.floor(Math.random() * heroLines.length);
    if (lineIndex === previousIndex && heroLines.length > 1) lineIndex = (lineIndex + 1) % heroLines.length;
    heroTitle.textContent = heroLines[lineIndex];
    try { sessionStorage.setItem('creation-hero-line', String(lineIndex)); } catch (error) {}
  }

  var posts = Array.prototype.slice.call(document.querySelectorAll('[data-creation-post-year]'));
  var yearButtons = Array.prototype.slice.call(document.querySelectorAll('[data-creation-year]'));
  var pageButtons = Array.prototype.slice.call(document.querySelectorAll('[data-creation-page]'));
  var pageInfo = document.querySelector('[data-creation-page-info]');
  var perPage = 10;
  var currentPage = 1;
  var currentYear = 'all';

  function renderPosts() {
    var matching = posts.filter(function (post) {
      return currentYear === 'all' || post.getAttribute('data-creation-post-year') === currentYear;
    });
    var totalPages = Math.max(1, Math.ceil(matching.length / perPage));
    currentPage = Math.min(currentPage, totalPages);
    var start = (currentPage - 1) * perPage;
    posts.forEach(function (post) { post.hidden = true; });
    matching.slice(start, start + perPage).forEach(function (post) { post.hidden = false; });
    if (pageInfo) pageInfo.textContent = '第 ' + currentPage + ' / ' + totalPages + ' 页';
    pageButtons.forEach(function (button) {
      var direction = button.getAttribute('data-creation-page');
      button.disabled = direction === 'prev' ? currentPage === 1 : currentPage === totalPages;
    });
  }

  yearButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      currentYear = button.getAttribute('data-creation-year');
      currentPage = 1;
      yearButtons.forEach(function (item) { item.classList.toggle('is-active', item === button); });
      renderPosts();
    });
  });

  pageButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      currentPage += button.getAttribute('data-creation-page') === 'next' ? 1 : -1;
      renderPosts();
      document.getElementById('writing').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.querySelectorAll('[data-creation-archive-year]').forEach(function (link) {
    var year = link.getAttribute('data-creation-archive-year');
    var count = posts.filter(function (post) { return post.getAttribute('data-creation-post-year') === year; }).length;
    var countTarget = document.querySelector('[data-creation-count="' + year + '"]');
    if (countTarget) countTarget.textContent = count;
    link.addEventListener('click', function () {
      var target = document.querySelector('[data-creation-year="' + year + '"]');
      if (target) target.click();
    });
  });

  renderPosts();
})();
</script>
