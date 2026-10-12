---
permalink: /creations/
title: "Creations"
layout: creation-home
author_profile: false
hide_nav: true
---


<main class="creation-home-page">
  <section class="creation-banner" style="--hero-image: url('{{ '/images/creations-hero-v2.png' | relative_url }}');" aria-labelledby="creation-hero-title">
    <div class="creation-banner__image" aria-hidden="true"></div>
    <div class="creation-banner__copy">
      <p>创作</p>
      <h1 id="creation-hero-title">重逢初见处，你我尚无诗</h1>
    </div>
  </section>

  <section class="creation-collections" aria-label="创作栏目">
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

  </section>

  <div class="creation-home-layout creation-home-layout--timeline" id="writing">
    <section class="creation-feed" aria-labelledby="creation-posts-title">
      <header class="creation-feed__tools">
        <h2 id="creation-posts-title">更新</h2>
        <div class="creation-year-filter" aria-label="按更新年份筛选"></div>
      </header>
      <div class="creation-post-list creation-update-list" aria-live="polite">
        <p class="creation-update-status">正在加载更新…</p>
      </div>
      <nav class="creation-pagination" aria-label="更新分页" hidden>
        <span data-creation-page-info></span>
        <div>
          <button type="button" data-creation-page="prev">上一页</button>
          <button type="button" data-creation-page="next">下一页</button>
        </div>
      </nav>
    </section>
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


  var list = document.querySelector('.creation-update-list');
  var filters = document.querySelector('.creation-year-filter');
  var pagination = document.querySelector('.creation-pagination');
  var pageInfo = document.querySelector('[data-creation-page-info]');
  var pageButtons = Array.prototype.slice.call(document.querySelectorAll('[data-creation-page]'));
  var updates = [];
  var currentPage = 1;
  var currentYear = 'all';
  var perPage = 10;
  var baseUrl = {{ site.baseurl | default: '' | jsonify }};

  function render() {
    var matching = updates.filter(function (item) {
      return currentYear === 'all' || item.date.slice(0, 4) === currentYear;
    });
    var pages = Math.max(1, Math.ceil(matching.length / perPage));
    currentPage = Math.max(1, Math.min(currentPage, pages));
    list.replaceChildren();
    matching.slice((currentPage - 1) * perPage, currentPage * perPage).forEach(function (item) {
      var article = document.createElement('article');
      article.className = 'creation-post creation-update';
      var time = document.createElement('time');
      time.dateTime = item.date;
      var day = document.createElement('strong');
      day.textContent = item.date.slice(8, 10);
      var month = document.createElement('span');
      month.textContent = item.date.slice(0, 7).replace('-', '.');
      time.append(day, month);
      var link = document.createElement('a');
      link.href = baseUrl + item.url;
      var heading = document.createElement('h3');
      heading.textContent = item.title;
      var label = document.createElement('small');
      label.textContent = '更新';
      link.append(label, heading);
      article.append(time, link);
      list.append(article);
    });
    if (!matching.length) {
      var empty = document.createElement('p');
      empty.className = 'creation-update-status';
      empty.textContent = '暂无更新';
      list.append(empty);
    }
    pagination.hidden = matching.length <= perPage;
    pageInfo.textContent = '第 ' + currentPage + ' / ' + pages + ' 页';
    pageButtons[0].disabled = currentPage === 1;
    pageButtons[1].disabled = currentPage === pages;
  }

  function setup(data) {
    updates = data.updates.filter(function (item) {
      return typeof item.date === 'string' && /^\\d{4}-\\d{2}-\\d{2}T/.test(item.date) &&
        typeof item.title === 'string' && typeof item.url === 'string' &&
        item.url.indexOf('/creations/') === 0;
    }).sort(function (a, b) { return b.date.localeCompare(a.date); });
    var years = Array.from(new Set(updates.map(function (item) { return item.date.slice(0, 4); })));
    filters.replaceChildren();
    ['all'].concat(years).forEach(function (year) {
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = year === 'all' ? '全部' : year;
      button.classList.toggle('is-active', year === currentYear);
      button.addEventListener('click', function () {
        currentYear = year;
        currentPage = 1;
        Array.prototype.forEach.call(filters.children, function (other) {
          other.classList.toggle('is-active', other === button);
        });
        render();
      });
      filters.append(button);
    });
    render();
  }

  pageButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      currentPage += button.getAttribute('data-creation-page') === 'next' ? 1 : -1;
      render();
      document.getElementById('writing').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  async function getUpdates(url) {
    var response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error('Timeline unavailable');
    var data = await response.json();
    if (!Array.isArray(data.updates)) throw new Error('Invalid timeline');
    return data;
  }

  (async function () {
    try {
      setup(await getUpdates('https://raw.githubusercontent.com/VelikayaScarlet/velikayascarlet.github.io/creation-updates/creation-updates.json'));
    } catch (error) {
      try {
        setup(await getUpdates({{ '/assets/data/creation-updates.json' | relative_url | jsonify }}));
      } catch (fallbackError) {
        list.textContent = '更新记录暂时无法加载';
      }
    }
  })();

})();
</script>
